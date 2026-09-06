import React from "react";
import {
  MessageSquarePlus,
  BookOpen,
  Compass,
  Sparkles,
  Target,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
} from "lucide-react";
import type { AuthUserProfile, JournalEntry } from "../types";

interface DashboardProps {
  user: AuthUserProfile;
  entries: JournalEntry[];
  onStartNewConversation: () => void;
  onViewAllEntries: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  entries,
  onStartNewConversation,
  onViewAllEntries,
  onSelectEntry,
}) => {
  const latestEntry = entries.length > 0 ? entries[0] : null;

  // Derive top moods
  const moodCounts: Record<string, number> = {};
  for (const e of entries) {
    if (e.mood) {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    }
  }
  const moodEntries = Object.entries(moodCounts);
  const topMood =
    moodEntries.length > 0
      ? moodEntries.sort((a, b) => b[1] - a[1])[0][0]
      : "Not yet tracked";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-linear-to-r from-stone-900 via-stone-800 to-stone-900 p-8 text-white shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30">
            <Compass className="h-3.5 w-3.5" />
            <span>Personal Gemini Journal</span>
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl text-stone-100">
            Welcome back, {user.displayName?.split(" ")[0] || "Friend"}
          </h2>
          <p className="mt-2 text-sm text-stone-300 leading-relaxed">
            Your private sanctuary for introspective conversations with Gemini, automatic Reflection Compass synthesis, and secure Cloud Firestore journaling.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              id="dashboard-start-convo-btn"
              onClick={onStartNewConversation}
              className="flex items-center space-x-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-xs hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>Start Reflection Conversation</span>
            </button>

            <button
              id="dashboard-view-entries-btn"
              onClick={onViewAllEntries}
              className="flex items-center space-x-2 rounded-xl border border-stone-700 bg-stone-800/80 px-4 py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>View Journal ({entries.length})</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative compass background icon */}
        <div className="absolute -right-8 -bottom-8 text-stone-800/40 pointer-events-none">
          <Compass className="h-64 w-64" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Entries */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Reflections Logged
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-stone-900">{entries.length}</p>
          <p className="mt-1 text-xs text-stone-500">Persisted to your Firestore partition</p>
        </div>

        {/* Primary Emotional State */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Dominant Mood State
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-lg font-bold text-stone-900 truncate">{topMood}</p>
          <p className="mt-1 text-xs text-stone-500">Derived from Reflection Compass logs</p>
        </div>

        {/* Security Baseline */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Security Isolation
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-lg font-bold text-stone-900">Zero-Trust Verified</p>
          <p className="mt-1 text-xs text-stone-500">Server token auth & Firestore rules</p>
        </div>
      </div>

      {/* Latest Reflection Compass Spotlight */}
      {latestEntry ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Latest Reflection Compass</span>
            </h3>
            <button
              onClick={() => onSelectEntry(latestEntry)}
              className="flex items-center space-x-1 text-xs font-semibold text-amber-900 hover:text-amber-950"
            >
              <span>Read Full Dialogue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div
            onClick={() => onSelectEntry(latestEntry)}
            className="group cursor-pointer rounded-2xl border border-amber-200/90 bg-linear-to-b from-amber-50/70 to-stone-50 p-6 shadow-xs transition-all hover:border-amber-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/50 pb-3">
              <h4 className="text-base font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                {latestEntry.title}
              </h4>
              <div className="flex items-center space-x-2">
                <span className="rounded-lg bg-white border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                  {latestEntry.mood} ({Math.round(latestEntry.moodConfidence <= 1 ? latestEntry.moodConfidence * 100 : latestEntry.moodConfidence)}%)
                </span>
                <span className="text-xs text-stone-500 flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(latestEntry.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-stone-700 font-medium">
              {latestEntry.summary}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs">
                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] block mb-1">
                  Next Step
                </span>
                <p className="text-emerald-950 font-medium">{latestEntry.nextStep}</p>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-xs">
                <span className="font-bold text-indigo-900 uppercase tracking-wider text-[10px] block mb-1">
                  Contemplation Question
                </span>
                <p className="text-indigo-950 italic font-serif">"{latestEntry.reflectionQuestion}"</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
          <Compass className="mx-auto h-12 w-12 text-stone-300" />
          <h4 className="mt-3 text-sm font-bold text-stone-800">
            No reflections recorded yet
          </h4>
          <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
            Start a multi-turn conversation with Gemini. When finished, your Reflection Compass will synthesize key insights and save them to your journal.
          </p>
          <button
            onClick={onStartNewConversation}
            className="mt-4 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
          >
            Start First Conversation
          </button>
        </div>
      )}

      {/* Recent Entries List Preview */}
      {entries.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">
              Recent Journal Entries
            </h3>
            <button
              onClick={onViewAllEntries}
              className="text-xs font-semibold text-stone-700 hover:text-stone-900 underline"
            >
              View all ({entries.length})
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {entries.slice(1, 5).map((entry) => (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="cursor-pointer rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs hover:border-stone-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                    {entry.mood}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-stone-900 line-clamp-1">
                  {entry.title}
                </h4>
                <p className="mt-1 text-xs text-stone-600 line-clamp-2">
                  {entry.summary || entry.messages[0]?.content || "No summary available"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
