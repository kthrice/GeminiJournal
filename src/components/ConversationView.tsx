import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Compass,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import type { ChatMessage, ReflectionCompass, JournalEntry } from "../types";
import { getFreshIdToken, createJournalEntry } from "../lib/firebase";
import { ReflectionCompassCard } from "./ReflectionCompassCard";

interface ConversationViewProps {
  userId: string;
  onEntrySaved: (entry: JournalEntry) => void;
  onViewEntries: () => void;
}

const PROMPT_STARTERS = [
  "I'm feeling pulled in multiple directions today. Can we unpack this?",
  "I had an interaction today that triggered unexpected self-doubt.",
  "Help me celebrate a meaningful breakthrough in my work or habits.",
  "I need to make a tough choice and want to clarify my core values.",
];

export const ConversationView: React.FC<ConversationViewProps> = ({
  userId,
  onEntrySaved,
  onViewEntries,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationTitle, setConversationTitle] = useState("Evening Reflection");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCompass, setIsGeneratingCompass] = useState(false);
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [isSavingReflection, setIsSavingReflection] = useState(false);

  // Reflection Compass State
  const [compass, setCompass] = useState<ReflectionCompass | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat feed
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setInput("");
    setErrorMessage(null);

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Auto-derive title if first message
    if (messages.length === 0) {
      setConversationTitle(text.slice(0, 45) + (text.length > 45 ? "..." : ""));
    }

    try {
      const idToken = await getFreshIdToken();
      if (!idToken) throw new Error("Authentication token expired. Please re-authenticate.");

      const historyPayload = updatedMessages.slice(-25).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload.slice(0, -1),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to communicate with reflection assistant.");
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `msg_m_${Date.now()}`,
        role: "model",
        content: data.reply || "Thank you for sharing your reflection.",
        timestamp: Date.now(),
      };

      setMessages([...updatedMessages, modelMsg]);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to receive response from Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  // Original Feature Trigger: Generate Reflection Compass
  const handleGenerateReflectionCompass = async () => {
    if (messages.length === 0) {
      setErrorMessage("Please have at least one dialogue turn before generating the Reflection Compass.");
      return;
    }

    setIsGeneratingCompass(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const idToken = await getFreshIdToken();
      if (!idToken) throw new Error("Authentication token expired. Please re-authenticate.");

      const res = await fetch("/api/ai/reflection-compass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title: conversationTitle,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate Reflection Compass.");
      }

      const data: ReflectionCompass = await res.json();
      setCompass(data);
      setSuccessMessage("Reflection Compass generated! Review your insights below and save your journal entry.");
    } catch (err: any) {
      setErrorMessage(err.message || "Unable to generate Reflection Compass.");
    } finally {
      setIsGeneratingCompass(false);
    }
  };

  // Dedicated "Save Reflection" workflow:
  // 1. Take the current conversation.
  // 2. Generate a summary using Gemini.
  // 3. Generate the Reflection Compass fields (summary, themes, mood, moodConfidence, nextStep, reflectionQuestion).
  // 4. Save the conversation and these fields to Cloud Firestore.
  // 5. Use the authenticated Firebase user's UID (via createJournalEntry).
  // 6. Save to users/{authenticatedUserUid}/journalEntries/{entryId}.
  // 7. Show success message: "Reflection saved."
  // 8. Clear current conversation and navigate to journal history.
  const handleSaveReflection = async () => {
    if (messages.length === 0) {
      setErrorMessage("Please have at least one dialogue turn before saving a reflection.");
      return;
    }

    setIsSavingReflection(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const idToken = await getFreshIdToken();
      if (!idToken) throw new Error("Authentication token expired. Please re-authenticate.");

      // 1-3: Generate summary & Reflection Compass fields using Gemini via secure server proxy
      const res = await fetch("/api/ai/reflection-compass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title: conversationTitle,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate AI reflection summary.");
      }

      const compassData: ReflectionCompass = await res.json();
      setCompass(compassData);

      // 4-6: Save conversation and fields to Cloud Firestore under users/{uid}/journalEntries/{entryId}
      const savedEntry = await createJournalEntry({
        title: conversationTitle.trim() || "Reflective Journal Entry",
        messages,
        summary: compassData.summary,
        themes: compassData.themes,
        mood: compassData.mood,
        moodConfidence: compassData.moodConfidence,
        nextStep: compassData.nextStep,
        reflectionQuestion: compassData.reflectionQuestion,
      });

      // 7: Exact success message: "Reflection saved."
      setSuccessMessage("Reflection saved.");

      // 8: Clear current conversation and navigate to journal history
      setTimeout(() => {
        setMessages([]);
        setCompass(null);
        setInput("");
        onEntrySaved(savedEntry);
      }, 750);
    } catch (err: any) {
      console.error("Failed to save reflection:", err);
      setErrorMessage(err.message || "Failed to save reflection. Please try again.");
    } finally {
      setIsSavingReflection(false);
    }
  };

  // Save the conversation and Reflection Compass as a journal entry
  const handleSaveToJournal = async () => {
    if (messages.length === 0) {
      setErrorMessage("No conversation to save.");
      return;
    }

    if (!compass) {
      setErrorMessage("Please generate your Reflection Compass before saving to the journal.");
      return;
    }

    setIsSavingEntry(true);
    setErrorMessage(null);

    try {
      const newEntry = await createJournalEntry({
        title: conversationTitle.trim() || "Reflective Journal Entry",
        messages,
        summary: compass.summary,
        themes: compass.themes,
        mood: compass.mood,
        moodConfidence: compass.moodConfidence,
        nextStep: compass.nextStep,
        reflectionQuestion: compass.reflectionQuestion,
      });

      setSuccessMessage("Journal entry and Reflection Compass safely stored in Cloud Firestore!");
      setTimeout(() => {
        onEntrySaved(newEntry);
      }, 600);
    } catch (err: any) {
      console.error("Failed to save journal entry:", err);
      setErrorMessage("Failed to save entry to Firestore. Please try again.");
    } finally {
      setIsSavingEntry(false);
    }
  };

  const handleStartFresh = () => {
    setMessages([]);
    setCompass(null);
    setConversationTitle("Evening Reflection");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Top Header Card */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-stone-900">
              Reflective Conversation
            </h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              Gemini Powered
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Multi-turn dialoguing with automated Reflection Compass synthesis
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <button
              id="reset-dialogue-btn"
              onClick={handleStartFresh}
              title="Start Fresh Conversation"
              className="flex items-center space-x-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* End Conversation & Generate Compass Button */}
          <button
            id="generate-compass-btn"
            onClick={handleGenerateReflectionCompass}
            disabled={messages.length === 0 || isGeneratingCompass || isLoading}
            className="flex items-center space-x-1.5 rounded-xl border border-amber-300 bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 disabled:opacity-40 transition-colors cursor-pointer"
          >
            {isGeneratingCompass ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Compass className="h-4 w-4" />
            )}
            <span>{isGeneratingCompass ? "Synthesizing..." : "Generate Reflection Compass"}</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div className="mb-4 flex items-center space-x-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Conversation Feed */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        {/* Title input banner */}
        <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-3 flex items-center space-x-2">
          <label htmlFor="convo-title" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Title:
          </label>
          <input
            id="convo-title"
            type="text"
            value={conversationTitle}
            onChange={(e) => setConversationTitle(e.target.value)}
            className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-stone-900 focus:border-stone-300 focus:bg-white focus:outline-hidden"
            maxLength={100}
          />
        </div>

        {/* Message Feed */}
        <div className="min-h-[360px] max-h-[480px] overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-stone-800">
                Begin Your Multi-Turn Introspection
              </h3>
              <p className="mt-1 max-w-md text-xs text-stone-500 leading-relaxed">
                Talk through your thoughts, dilemmas, or feelings with Gemini. When you're ready, click "Generate Reflection Compass" to synthesize key insights and save your journal entry.
              </p>

              {/* Quick Prompt Starters */}
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 max-w-xl w-full">
                {PROMPT_STARTERS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 text-left text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
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
                    className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? "bg-stone-900 text-white rounded-tr-xs"
                        : "bg-stone-50 text-stone-900 border border-stone-200 rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span
                      className={`mt-1.5 block text-[10px] ${
                        isUser ? "text-stone-300" : "text-stone-400"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-500 rounded-tl-xs flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-stone-600" />
                <span>Gemini is contemplating your words...</span>
              </div>
            </div>
          )}

          {messages.length > 0 && !isLoading && (
            <div className="flex items-center justify-end pt-2 pb-1">
              <button
                id="save-reflection-chat-end-btn"
                type="button"
                onClick={handleSaveReflection}
                disabled={isSavingReflection}
                title="Generate AI summary and Reflection Compass, then save to Cloud Firestore"
                className="inline-flex items-center space-x-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSavingReflection ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-700" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                )}
                <span>{isSavingReflection ? "Saving Reflection..." : "Save Reflection"}</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-stone-200 p-4 bg-stone-50/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="flex flex-1 items-center space-x-2">
              <input
                id="conversation-input-field"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your candid thoughts, reflections, or questions..."
                maxLength={4000}
                disabled={isLoading || isSavingReflection}
                className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-hidden disabled:opacity-50"
              />
              <button
                id="send-conversation-btn"
                type="submit"
                disabled={isLoading || !input.trim() || isSavingReflection}
                title="Send Message to Gemini"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Dedicated "Save Reflection" button placed below conversation next to input */}
            <button
              id="save-reflection-btn"
              type="button"
              onClick={handleSaveReflection}
              disabled={messages.length === 0 || isLoading || isSavingReflection}
              title="Generate AI summary and Reflection Compass, then save to Cloud Firestore"
              className="flex h-11 shrink-0 items-center justify-center space-x-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs disabled:opacity-40 disabled:hover:bg-amber-500 transition-all whitespace-nowrap cursor-pointer"
            >
              {isSavingReflection ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Reflection...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Save Reflection</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Dedicated Reflection Compass Display & Save Card */}
      {compass && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">
              Generated Reflection Compass
            </h3>
            <button
              id="save-journal-entry-btn"
              onClick={handleSaveToJournal}
              disabled={isSavingEntry}
              className="flex items-center space-x-2 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSavingEntry ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 text-amber-400" />
              )}
              <span>{isSavingEntry ? "Saving to Cloud..." : "Save as Journal Entry"}</span>
            </button>
          </div>

          <ReflectionCompassCard compass={compass} />
        </div>
      )}
    </div>
  );
};
