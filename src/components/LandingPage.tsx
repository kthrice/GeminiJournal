import React from "react";
import {
  Compass,
  Sparkles,
  ShieldCheck,
  Lock,
  MessageSquare,
  Target,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  Server,
  KeyRound,
  LogIn,
} from "lucide-react";

interface LandingPageProps {
  onSignIn: () => Promise<void>;
  isSigningIn: boolean;
  error?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  isSigningIn,
  error,
}) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-amber-200">
      {/* Top Navbar */}
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white shadow-xs">
              <Compass className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-stone-900">
                Personal Gemini Journal
              </h1>
              <p className="text-[11px] font-medium text-stone-500">
                Private Reflection & AI Compass
              </p>
            </div>
          </div>

          <button
            id="landing-signin-nav-btn"
            onClick={onSignIn}
            disabled={isSigningIn}
            className="flex items-center space-x-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <LogIn className="h-4 w-4 text-amber-400" />
            <span>{isSigningIn ? "Signing in..." : "Sign In with Google"}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16 space-y-16">
        {/* Error notification if any */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 text-center">
            {error}
          </div>
        )}

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-900 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Multi-turn dialogue meets introspective synthesis</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-stone-950 sm:text-5xl leading-tight">
            A private sanctuary for your thoughts, guided by Gemini.
          </h2>

          <p className="text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
            Engage in deep, multi-turn reflective conversations with Google Gemini. When you conclude, our automated <strong>Reflection Compass</strong> charts your emotional bearings, extracts core themes, and gives you actionable clarity.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="landing-signin-hero-btn"
              onClick={onSignIn}
              disabled={isSigningIn}
              className="flex items-center justify-center space-x-2.5 rounded-2xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-stone-950 shadow-md hover:bg-amber-400 disabled:opacity-50 transition-all cursor-pointer w-full sm:w-auto"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? "Signing in..." : "Continue with Google"}</span>
            </button>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs text-stone-500 pt-2">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Zero-Trust Token Verification</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Lock className="h-4 w-4 text-emerald-600" />
              <span>Owner-Isolated Firestore</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Server className="h-4 w-4 text-emerald-600" />
              <span>Server-Side Gemini Proxy</span>
            </span>
          </div>
        </section>

        {/* Feature Showcase: The Reflection Compass */}
        <section className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 shadow-xs">
          <div className="max-w-2xl">
            <span className="inline-flex items-center space-x-1.5 rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
              <Compass className="h-3.5 w-3.5" />
              <span>Original Feature</span>
            </span>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-stone-950">
              The Reflection Compass
            </h3>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              When you conclude a dialogue, Gemini doesn't just log raw messages. It calculates five essential coordinates of self-understanding:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Coordinate 1: Concise Summary */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900 mb-3">
                <Sparkles className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                1. Concise Summary
              </h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                A 2-3 sentence compassionate synthesis capturing the emotional core of your thoughts.
              </p>
            </div>

            {/* Coordinate 2: Three Main Themes */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900 mb-3">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                2. Three Themes
              </h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Identifies exactly 3 recurring concepts (e.g. #Boundaries, #CareerCourage, #Mindfulness).
              </p>
            </div>

            {/* Coordinate 3: Mood & Confidence */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900 mb-3">
                <Compass className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                3. Mood & Confidence
              </h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                An empathetic mood label backed by a calibrated confidence score (e.g. 88%).
              </p>
            </div>

            {/* Coordinate 4: Practical Next Step */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900 mb-3">
                <Target className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                4. Practical Next Step
              </h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                One achievable micro-action to translate reflection into tangible real-world momentum.
              </p>
            </div>

            {/* Coordinate 5: Reflection Question */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-900 mb-3">
                <HelpCircle className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                5. Reflection Prompt
              </h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                A short, evocative question for your subconscious to sit with throughout the day.
              </p>
            </div>
          </div>
        </section>

        {/* Security Architecture Grid */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold tracking-tight text-stone-950">
              Production-Grade Security Architecture
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Engineered according to strict OWASP Web & LLM Top 10 directives
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white mb-4">
                <KeyRound className="h-5 w-5 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">Zero Client Secrets</h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                The Gemini API key is completely concealed from browser code and bundled assets. It resides exclusively on the server, loaded via Google Cloud Secret Manager.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white mb-4">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">Cryptographic UID Verification</h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Client-supplied UIDs are rejected as untrusted. The backend verifies authentic Firebase ID tokens via Google's Identity Toolkit before honoring any requests.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white mb-4">
                <Lock className="h-5 w-5 text-indigo-400" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">Owner-Bound Firestore Rules</h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Cloud Firestore rules strictly enforce <code className="text-[11px] bg-stone-100 px-1 py-0.5 rounded">request.auth.uid == userId</code> on <code className="text-[11px] bg-stone-100 px-1 py-0.5 rounded">/users/&#123;uid&#125;/journalEntries/&#123;id&#125;</code>.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-stone-200 pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Personal Gemini Journal. Built with React, Express, Firebase, and Gemini.</p>
          <div className="flex items-center space-x-4">
            <span>Server-side AI Proxy</span>
            <span>•</span>
            <span>Firestore Rules Deployed</span>
            <span>•</span>
            <span>Sliding Window Rate Limiter</span>
          </div>
        </footer>
      </main>
    </div>
  );
};
