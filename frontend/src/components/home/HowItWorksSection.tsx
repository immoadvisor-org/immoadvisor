"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import { getHowItWorksContent, type HowItWorksContent } from "@/features/howItWorks/howItWorksApi";

const STEP_ICONS = [
  <svg key="checklist" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>,
  <svg key="chart" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 19h16M7 19V9M12 19V5M17 19v7" />
  </svg>,
  <svg key="support" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M9 12l2 2 4-4" />
    <circle cx="12" cy="12" r="9" />
  </svg>,
];

export function HowItWorksSection() {
  const locale = useLocale();
  const [howItWorks, setHowItWorks] = useState<HowItWorksContent | null>(null);

  useEffect(() => {
    let isMounted = true;
    getHowItWorksContent(locale).then((data) => {
      if (isMounted) setHowItWorks(data);
    });
    return () => {
      isMounted = false;
    };
  }, [locale]);

  if (!howItWorks) return null;

  return (
    <section className="bg-slate-50 py-20 dark:bg-neutral-900">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-50 sm:text-3xl">
          {howItWorks.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-neutral-300">{howItWorks.text}</p>
      </div>

      {howItWorks.steps.length > 0 && (
        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-10 px-4 sm:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <div key={index} className="border-t border-slate-200 pt-5 dark:border-neutral-800">
              <span className="font-mono text-sm text-amber-600 dark:text-amber-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="mt-3 text-amber-600 dark:text-amber-400">{STEP_ICONS[index % STEP_ICONS.length]}</div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-neutral-50">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">{step.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
