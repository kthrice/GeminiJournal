import React, { useState, useEffect } from "react";
import {
  subscribeToAuthChanges,
  signInWithGoogle,
  signOutUser,
  subscribeToJournalEntries,
  getJournalEntries,
  getJournalEntry,
  deleteJournalEntry,
} from "./lib/firebase";
import type { AuthUserProfile, JournalEntry } from "./types";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { ConversationView } from "./components/ConversationView";
import { JournalListView } from "./components/JournalListView";
import { EntryDetailModal } from "./components/EntryDetailModal";
import { SecurityAuditModal } from "./components/SecurityAuditModal";
import { Loader2 } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab navigation
  const [currentTab, setCurrentTab] = useState<"dashboard" | "conversation" | "journal">("dashboard");

  // Journal entries
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Modals
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState(false);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Cloud Firestore journalEntries for the authenticated user
  useEffect(() => {
    if (!currentUser) {
      setEntries([]);
      return;
    }

    const unsubscribe = subscribeToJournalEntries(
      (userEntries) => {
        setEntries(userEntries);
      },
      (err) => {
        console.error("Error subscribing to journalEntries:", err);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setAuthError(err.message || "Failed to authenticate with Google. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentTab("dashboard");
      setSelectedEntry(null);
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser) return;
    try {
      await deleteJournalEntry(entryId);
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const handleSelectEntry = async (entry: JournalEntry) => {
    try {
      const freshEntry = await getJournalEntry(entry.id);
      setSelectedEntry(freshEntry || entry);
    } catch {
      setSelectedEntry(entry);
    }
  };

  const handleRefreshEntries = async () => {
    try {
      const freshEntries = await getJournalEntries();
      setEntries(freshEntries);
    } catch (err) {
      console.error("Failed to refresh journal entries:", err);
    }
  };

  const handleEntrySaved = (newEntry: JournalEntry) => {
    setSelectedEntry(newEntry);
    setCurrentTab("journal");
  };

  // Auth checking loading state
  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-100 p-4">
        <div className="flex items-center space-x-3 rounded-2xl border border-stone-200 bg-white px-6 py-4 shadow-xs">
          <Loader2 className="h-5 w-5 animate-spin text-stone-700" />
          <span className="text-sm font-medium text-stone-700">
            Verifying cryptographic session...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated landing page
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onSignIn={handleSignIn}
          isSigningIn={isSigningIn}
          error={authError}
        />
        <SecurityAuditModal
          isOpen={isSecurityAuditOpen}
          onClose={() => setIsSecurityAuditOpen(false)}
        />
      </>
    );
  }

  // Authenticated application interface
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      <Header
        user={currentUser}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onSignOut={handleSignOut}
        onOpenSecurityModal={() => setIsSecurityAuditOpen(true)}
        entriesCount={entries.length}
      />

      <main className="flex-1 pb-16">
        {currentTab === "dashboard" && (
          <Dashboard
            user={currentUser}
            entries={entries}
            onStartNewConversation={() => setCurrentTab("conversation")}
            onViewAllEntries={() => setCurrentTab("journal")}
            onSelectEntry={handleSelectEntry}
          />
        )}

        {currentTab === "conversation" && (
          <ConversationView
            userId={currentUser.uid}
            onEntrySaved={handleEntrySaved}
            onViewEntries={() => setCurrentTab("journal")}
          />
        )}

        {currentTab === "journal" && (
          <JournalListView
            entries={entries}
            onSelectEntry={handleSelectEntry}
            onDeleteEntry={handleDeleteEntry}
            onStartNewConversation={() => setCurrentTab("conversation")}
            onRefresh={handleRefreshEntries}
          />
        )}
      </main>

      {/* Entry Detail Modal: opens to read full conversation, summary, and Reflection Compass */}
      <EntryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onDelete={handleDeleteEntry}
      />

      {/* Security Architecture & Audit Modal */}
      <SecurityAuditModal
        isOpen={isSecurityAuditOpen}
        onClose={() => setIsSecurityAuditOpen(false)}
      />
    </div>
  );
}
