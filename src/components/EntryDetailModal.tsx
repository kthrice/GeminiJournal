import React, { useState } from "react";
import { X, Trash2, Calendar, User, Bot, BookOpen } from "lucide-react";
import type { JournalEntry } from "../types";
import { ReflectionCompassCard } from "./ReflectionCompassCard";

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
  onDelete: (entryId: string) => Promise<void>;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  entry,
  onClose,
  onDelete,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!entry) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete entry:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(entry.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="my-8 flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-200 px-6 py-5 bg-stone-50/80">
          <div className="flex items-start space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">{entry.title}</h2>
              <div className="mt-1 flex items-center space-x-2 text-xs text-stone-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate} at {formattedTime}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsConfirmingDelete(true)}
              title="Delete Entry"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* 1. The Original Reflection Compass Card */}
          <ReflectionCompassCard
            compass={{
              summary: entry.summary,
              themes: entry.themes,
              mood: entry.mood,
              moodConfidence: entry.moodConfidence,
              nextStep: entry.nextStep,
              reflectionQuestion: entry.reflectionQuestion,
            }}
          />

          {/* 2. Full Multi-Turn Conversation Transcript */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Full Dialogue Transcript ({entry.messages.length} messages)
            </h4>

            {entry.messages.length === 0 ? (
              <p className="rounded-xl bg-stone-50 p-4 text-xs italic text-stone-500 text-center">
                No archived messages found in this entry.
              </p>
            ) : (
              <div className="space-y-3">
                {entry.messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 ${
                        isUser ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isUser
                            ? "bg-stone-900 text-white"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                          isUser
                            ? "bg-stone-900 text-white rounded-tr-xs"
                            : "bg-stone-50 text-stone-900 border border-stone-200 rounded-tl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 px-6 py-3.5 bg-stone-50">
          <span className="text-xs text-stone-500">
            Encrypted & isolated in your Cloud Firestore partition
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
          >
            Close Entry
          </button>
        </div>

        {/* Confirm Delete Popup */}
        {isConfirmingDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
              <h4 className="text-base font-bold text-stone-900">Permanently Delete Entry?</h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                This will delete this reflection, the full transcript, and its Reflection Compass from your Firestore database.
              </p>
              <div className="mt-5 flex justify-end space-x-2">
                <button
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isDeleting}
                  className="rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
