import React, { useState } from "react";
import {
  Search,
  BookOpen,
  Calendar,
  Sparkles,
  Compass,
  Trash2,
  ChevronRight,
  Target,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import type { JournalEntry } from "../types";

interface JournalListViewProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onStartNewConversation: () => void;
  onRefresh?: () => Promise<void>;
}

export const JournalListView: React.FC<JournalListViewProps> = ({
  entries,
  onSelectEntry,
  onDeleteEntry,
  onStartNewConversation,
  onRefresh,
}) => {
  const [search, setSearch] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract all unique moods for filter pills
  const allMoods = Array.from(new Set(entries.map((e) => e.mood))).filter(Boolean);

  const filtered = entries.filter((e) => {
    const matchesMood = selectedMood === "all" || e.mood === selectedMood;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.mood.toLowerCase().includes(q) ||
      e.themes.some((t) => t.toLowerCase().includes(q)) ||
      e.messages.some((m) => m.content.toLowerCase().includes(q));

    return matchesMood && matchesSearch;
  });

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteEntry(entryToDelete);
    } catch (err) {
      console.error("Failed to delete entry:", err);
    } finally {
      setIsDeleting(false);
      setEntryToDelete(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            Journal Archives ({entries.length})
          </h2>
          <p className="text-xs text-stone-500">
            All conversations, summaries, and Reflection Compass bearings
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          {onRefresh && (
            <button
              id="refresh-journal-btn"
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  await onRefresh();
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
              title="Refresh entries from Cloud Firestore"
              className="flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-stone-500 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          )}

          <button
            id="archive-start-convo-btn"
            onClick={onStartNewConversation}
            className="flex items-center space-x-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>New Reflection</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            id="search-journal-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries, thoughts, summaries, themes, or moods..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-4 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Mood Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedMood("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedMood === "all"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All Moods
          </button>
          {allMoods.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedMood === mood
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Entry Cards List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 py-16 text-center">
          <BookOpen className="h-12 w-12 text-stone-300" />
          <h3 className="mt-3 text-sm font-bold text-stone-800">
            {entries.length === 0 ? "No Journal Entries Yet" : "No Matching Reflections"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-stone-500">
            {entries.length === 0
              ? "Start a conversation with Gemini. When ready, click 'Generate Reflection Compass' to review and save your entry."
              : "Try refining your search terms or selecting another mood filter."}
          </p>
          {entries.length === 0 && (
            <button
              onClick={onStartNewConversation}
              className="mt-4 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
            >
              Start First Conversation
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => {
            const confidencePercent = Math.round(
              entry.moodConfidence <= 1 ? entry.moodConfidence * 100 : entry.moodConfidence
            );
            const dateFormatted = new Date(entry.createdAt).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={entry.id}
                className="group relative rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-stone-300 hover:shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  {/* Title & Metadata */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center space-x-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                        <Compass className="h-3 w-3 text-amber-600" />
                        <span>{entry.mood}</span>
                        <span className="text-[10px] text-amber-700/80 font-normal">
                          ({confidencePercent}%)
                        </span>
                      </span>

                      <div className="flex items-center space-x-1 text-xs text-stone-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{dateFormatted}</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => onSelectEntry(entry)}
                      className="text-base font-bold text-stone-900 hover:text-amber-800 cursor-pointer transition-colors"
                    >
                      {entry.title}
                    </h3>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onSelectEntry(entry)}
                      className="flex items-center space-x-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                    >
                      <span>Read Entry</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => setEntryToDelete(entry.id)}
                      title="Delete Entry"
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Concise Summary */}
                <p className="mt-3 text-sm leading-relaxed text-stone-700 line-clamp-3">
                  {entry.summary}
                </p>

                {/* Themes and Next Step / Question Previews */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 text-xs">
                  {/* Three Themes */}
                  <div className="flex flex-wrap gap-1.5">
                    {entry.themes.map((theme, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600"
                      >
                        #{theme}
                      </span>
                    ))}
                  </div>

                  {/* Messages count */}
                  <span className="text-stone-400 text-[11px]">
                    {entry.messages.length} conversation {entry.messages.length === 1 ? "turn" : "turns"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <h4 className="text-base font-bold text-stone-900">Delete Journal Entry?</h4>
            <p className="mt-2 text-xs text-stone-600 leading-relaxed">
              This action permanently deletes this conversation and its Reflection Compass from your Cloud Firestore database.
            </p>
            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setEntryToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
