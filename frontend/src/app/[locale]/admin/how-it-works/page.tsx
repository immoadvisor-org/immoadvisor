"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";
import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import { getAdminHowItWorksContent, updateAdminHowItWorksContent } from "@/features/admin/howItWorksAdminApi";
import type { HowItWorksTranslation } from "@/features/howItWorks/howItWorksApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";

const EMPTY_STEP = { title: "", text: "" };
const EMPTY_CONTENT: HowItWorksTranslation = {
  title: "",
  text: "",
  steps: [EMPTY_STEP, EMPTY_STEP, EMPTY_STEP],
};

function withThreeSteps(entry: HowItWorksTranslation): HowItWorksTranslation {
  const steps = [...entry.steps];
  while (steps.length < 3) steps.push({ ...EMPTY_STEP });
  return { ...entry, steps: steps.slice(0, 3) };
}

export default function AdminHowItWorksPage() {
  const t = useTranslations("AdminHowItWorks");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [translations, setTranslations] = useState<Record<string, HowItWorksTranslation>>({});
  const [activeTab, setActiveTab] = useState<Locale>(routing.locales[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    getAdminHowItWorksContent(accessToken)
      .then((data) => {
        const normalized = Object.fromEntries(
          Object.entries(data.translations).map(([locale, entry]) => [locale, withThreeSteps(entry)])
        );
        setTranslations(normalized);
      })
      .finally(() => setIsLoading(false));
  }, [isAdmin, accessToken]);

  if (isLoadingUser) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-slate-400">{tAdmin("loading")}</p>;
  }

  if (!user || !isAdmin) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 dark:text-slate-300">{tAdmin("accessDenied")}</p>
    );
  }

  const current = translations[activeTab] ?? EMPTY_CONTENT;

  function updateField(field: "title" | "text", value: string) {
    setTranslations((prev) => ({
      ...prev,
      [activeTab]: { ...(prev[activeTab] ?? EMPTY_CONTENT), [field]: value },
    }));
  }

  function updateStepField(index: number, field: "title" | "text", value: string) {
    setTranslations((prev) => {
      const entry = prev[activeTab] ?? EMPTY_CONTENT;
      const steps = entry.steps.map((step, i) => (i === index ? { ...step, [field]: value } : step));
      return { ...prev, [activeTab]: { ...entry, steps } };
    });
  }

  async function handleSave() {
    if (!accessToken) return;
    setIsSaving(true);
    setSaveState("idle");
    try {
      const updated = await updateAdminHowItWorksContent(translations, accessToken);
      const normalized = Object.fromEntries(
        Object.entries(updated.translations).map(([locale, entry]) => [locale, withThreeSteps(entry)])
      );
      setTranslations(normalized);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("title")}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("subtitle")}</p>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex gap-2 border-b border-slate-200 pb-4 dark:border-slate-700">
            {routing.locales.map((locale) => (
              <button
                key={locale}
                onClick={() => setActiveTab(locale)}
                className={`px-3 py-2 text-sm font-medium uppercase ${
                  activeTab === locale
                    ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-200"
                    : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
                }`}
              >
                {locale}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            <label className="block text-sm text-slate-700 dark:text-slate-300">
              {t("titleLabel")}
              <input
                value={current.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-300">
              {t("textLabel")}
              <textarea
                value={current.text}
                onChange={(e) => updateField("text", e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("stepsLabel")}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("stepsHint")}</p>
            <div className="mt-4 space-y-5">
              {current.steps.map((step, index) => (
                <div key={index} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    {t("stepNumber", { number: index + 1 })}
                  </p>
                  <label className="mt-2 block text-sm text-slate-700 dark:text-slate-300">
                    {t("stepTitleLabel")}
                    <input
                      value={step.title}
                      onChange={(e) => updateStepField(index, "title", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </label>
                  <label className="mt-3 block text-sm text-slate-700 dark:text-slate-300">
                    {t("stepTextLabel")}
                    <textarea
                      value={step.text}
                      onChange={(e) => updateStepField(index, "text", e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {t("save")}
            </Button>
            {saveState === "saved" && <span className="text-sm text-brand-600 dark:text-brand-100">{t("saved")}</span>}
            {saveState === "error" && <span className="text-sm text-red-600 dark:text-red-400">{t("saveError")}</span>}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
