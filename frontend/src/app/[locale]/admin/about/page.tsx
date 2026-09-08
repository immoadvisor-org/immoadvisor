"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";
import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import { getAdminAboutContent, updateAdminAboutContent } from "@/features/admin/aboutAdminApi";
import type { AboutContent } from "@/features/about/aboutApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";

const EMPTY_CONTENT: AboutContent = {
  title: "",
  intro: "",
  value1_title: "",
  value1_text: "",
  value2_title: "",
  value2_text: "",
  value3_title: "",
  value3_text: "",
  cta_title: "",
  cta_text: "",
  cta_button: "",
};

const FIELDS: { key: keyof AboutContent; labelKey: string; multiline?: boolean }[] = [
  { key: "title", labelKey: "titleLabel" },
  { key: "intro", labelKey: "introLabel", multiline: true },
  { key: "value1_title", labelKey: "value1TitleLabel" },
  { key: "value1_text", labelKey: "value1TextLabel", multiline: true },
  { key: "value2_title", labelKey: "value2TitleLabel" },
  { key: "value2_text", labelKey: "value2TextLabel", multiline: true },
  { key: "value3_title", labelKey: "value3TitleLabel" },
  { key: "value3_text", labelKey: "value3TextLabel", multiline: true },
  { key: "cta_title", labelKey: "ctaTitleLabel" },
  { key: "cta_text", labelKey: "ctaTextLabel", multiline: true },
  { key: "cta_button", labelKey: "ctaButtonLabel" },
];

export default function AdminAboutPage() {
  const t = useTranslations("AdminAbout");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [translations, setTranslations] = useState<Record<string, AboutContent>>({});
  const [activeTab, setActiveTab] = useState<Locale>(routing.locales[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    getAdminAboutContent(accessToken)
      .then((data) => setTranslations(data.translations))
      .finally(() => setIsLoading(false));
  }, [isAdmin, accessToken]);

  if (isLoadingUser) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-neutral-400">{tAdmin("loading")}</p>;
  }

  if (!user || !isAdmin) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 dark:text-neutral-300">{tAdmin("accessDenied")}</p>
    );
  }

  const current = translations[activeTab] ?? EMPTY_CONTENT;

  function updateField(field: keyof AboutContent, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [activeTab]: { ...(prev[activeTab] ?? EMPTY_CONTENT), [field]: value },
    }));
  }

  async function handleSave() {
    if (!accessToken) return;
    setIsSaving(true);
    setSaveState("idle");
    try {
      const updated = await updateAdminAboutContent(translations, accessToken);
      setTranslations(updated.translations);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("title")}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-neutral-300">{t("subtitle")}</p>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex gap-2 border-b border-slate-200 dark:border-neutral-700">
            {routing.locales.map((locale) => (
              <button
                key={locale}
                onClick={() => setActiveTab(locale)}
                className={`px-3 py-2 text-sm font-medium uppercase ${
                  activeTab === locale
                    ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-200"
                    : "text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200"
                }`}
              >
                {locale}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            {FIELDS.map((field) => (
              <label key={field.key} className="block text-sm text-slate-700 dark:text-neutral-300">
                {t(field.labelKey)}
                {field.multiline ? (
                  <textarea
                    value={current[field.key]}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                ) : (
                  <input
                    value={current[field.key]}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                )}
              </label>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
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
