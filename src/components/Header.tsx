import React from "react";
import {
  Compass,
  LayoutDashboard,
  MessageSquarePlus,
  BookOpen,
  LogOut,
  Shield,
} from "lucide-react";
import type { AuthUserProfile } from "../types";

interface HeaderProps {
  user: AuthUserProfile;
  currentTab: "dashboard" | "conversation" | "journal";
  onSelectTab: (tab: "dashboard" | "conversation" | "journal") => void;
  onSignOut: () => Promise<void>;
  onOpenSecurityModal: () => void;
  entriesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentTab,
  onSelectTab,
  onSignOut,
  onOpenSecurityModal,
  entriesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div
          onClick={() => onSelectTab("dashboard")}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xs">
            <Compass className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-stone-900 leading-tight">
              Personal Gemini Journal
            </h1>
            <p className="text-[10px] font-medium text-stone-500">
              Authenticated Introspection & Compass
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden sm:flex items-center space-x-1 rounded-xl border border-stone-200 bg-stone-50/80 p-1">
          <button
            id="nav-tab-dashboard"
            onClick={() => onSelectTab("dashboard")}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              currentTab === "dashboard"
                ? "bg-white text-stone-950 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tab-conversation"
            onClick={() => onSelectTab("conversation")}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              currentTab === "conversation"
                ? "bg-white text-stone-950 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>New Conversation</span>
          </button>

          <button
            id="nav-tab-journal"
            onClick={() => onSelectTab("journal")}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              currentTab === "journal"
                ? "bg-white text-stone-950 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Journal</span>
            <span className="ml-1 rounded-full bg-stone-200 px-1.5 py-0.2 text-[10px] font-bold text-stone-700">
              {entriesCount}
            </span>
          </button>
        </nav>

        {/* User profile & Actions */}
        <div className="flex items-center space-x-3">
          <button
            id="open-security-modal-btn"
            onClick={onOpenSecurityModal}
            title="View Security Architecture"
            className="flex items-center space-x-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden md:inline">Security</span>
          </button>

          <div className="flex items-center space-x-2 border-l border-stone-200 pl-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full border border-stone-300 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 font-bold text-xs text-amber-900">
                {user.displayName ? user.displayName[0].toUpperCase() : "U"}
              </div>
            )}

            <button
              id="sign-out-btn"
              onClick={onSignOut}
              title="Sign Out"
              className="flex items-center space-x-1 rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline text-xs font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="sm:hidden flex items-center justify-around border-t border-stone-200 bg-stone-50/90 py-2 px-2">
        <button
          onClick={() => onSelectTab("dashboard")}
          className={`flex flex-col items-center text-[10px] font-medium ${
            currentTab === "dashboard" ? "text-stone-950 font-bold" : "text-stone-500"
          }`}
        >
          <LayoutDashboard className="h-4 w-4 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab("conversation")}
          className={`flex flex-col items-center text-[10px] font-medium ${
            currentTab === "conversation" ? "text-stone-950 font-bold" : "text-stone-500"
          }`}
        >
          <MessageSquarePlus className="h-4 w-4 mb-0.5" />
          <span>New Dialogue</span>
        </button>

        <button
          onClick={() => onSelectTab("journal")}
          className={`flex flex-col items-center text-[10px] font-medium ${
            currentTab === "journal" ? "text-stone-950 font-bold" : "text-stone-500"
          }`}
        >
          <BookOpen className="h-4 w-4 mb-0.5" />
          <span>Journal ({entriesCount})</span>
        </button>
      </div>
    </header>
  );
};
