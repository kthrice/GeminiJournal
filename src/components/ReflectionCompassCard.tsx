import React from "react";
import { Compass, Sparkles, Target, HelpCircle, CheckCircle2, Award } from "lucide-react";
import type { ReflectionCompass } from "../types";

interface ReflectionCompassCardProps {
  compass: ReflectionCompass;
  className?: string;
}

export const ReflectionCompassCard: React.FC<ReflectionCompassCardProps> = ({
  compass,
  className = "",
}) => {
  const confidencePercent = Math.round(
    compass.moodConfidence <= 1 ? compass.moodConfidence * 100 : compass.moodConfidence
  );

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-amber-300/80 bg-linear-to-b from-amber-50/80 via-orange-50/40 to-stone-50 p-6 shadow-xs ${className}`}
    >
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/70 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-amber-950 flex items-center gap-1.5">
              <span>Reflection Compass</span>
              <Sparkles className="h-4 w-4 text-amber-600" />
            </h3>
            <p className="text-xs text-amber-800/80">
              AI-synthesized emotional bearings & practical orientation
            </p>
          </div>
        </div>

        {/* Mood Label & Confidence Meter */}
        <div className="flex items-center space-x-2.5 rounded-xl border border-amber-200 bg-white/90 px-3.5 py-1.5 shadow-2xs">
          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800/80">
              Assessed Mood
            </span>
            <span className="text-xs font-bold text-stone-900">{compass.mood}</span>
          </div>
          <div className="h-7 w-px bg-amber-200" />
          <div className="flex items-center space-x-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 font-bold text-[11px] text-amber-900">
              {confidencePercent}%
            </div>
            <span className="text-[10px] font-medium text-stone-500">conf.</span>
          </div>
        </div>
      </div>

      {/* Grid of Compass Dimensions */}
      <div className="mt-5 space-y-4">
        {/* 1. Concise Summary */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-900">
            Concise Summary
          </span>
          <p className="mt-1 text-sm leading-relaxed font-medium text-stone-800">
            {compass.summary}
          </p>
        </div>

        {/* 2. Three Main Themes */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-2">
            Three Main Themes
          </span>
          <div className="flex flex-wrap gap-2">
            {compass.themes.slice(0, 3).map((theme, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-amber-200/90 bg-white/95 px-3 py-1 text-xs font-semibold text-stone-800 shadow-2xs"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold text-amber-900">
                  {index + 1}
                </span>
                <span>{theme}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 3. Practical Next Step & Reflection Question Dual Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
          {/* Next Step Card */}
          <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/70 p-3.5 shadow-2xs">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
              <Target className="h-4 w-4 text-emerald-700" />
              <span>Practical Next Step</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed font-medium text-emerald-950 flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{compass.nextStep}</span>
            </p>
          </div>

          {/* Reflection Question Card */}
          <div className="rounded-xl border border-indigo-200/90 bg-indigo-50/70 p-3.5 shadow-2xs">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider">
              <HelpCircle className="h-4 w-4 text-indigo-700" />
              <span>Contemplation Question</span>
            </div>
            <p className="mt-1.5 text-xs italic leading-relaxed text-indigo-950 font-serif">
              "{compass.reflectionQuestion}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
