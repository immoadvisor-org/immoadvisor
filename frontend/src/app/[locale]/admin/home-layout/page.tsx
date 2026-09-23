"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import { getAdminHomeLayout, updateAdminHomeLayout } from "@/features/admin/homeLayoutAdminApi";
import type { HomeSection, HomeSectionKey } from "@/features/homeLayout/homeLayoutApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";

export default function AdminHomeLayoutPage() {
  const t = useTranslations("AdminHomeLayout");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [sections, setSections] = useState<HomeSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    getAdminHomeLayout(accessToken)
      .then((data) => setSections(data.sections))
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

  function sectionLabel(key: HomeSectionKey): string {
    return t(`sections.${key}`);
  }

  function move(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const reordered = [...sections];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setSections(reordered);
  }

  function toggleVisible(index: number, checked: boolean) {
    setSections((prev) => prev.map((section, i) => (i === index ? { ...section, visible: checked } : section)));
  }

  async function handleSave() {
    if (!accessToken) return;
    setIsSaving(true);
    setSaveState("idle");
    try {
      const updated = await updateAdminHomeLayout(sections, accessToken);
      setSections(updated.sections);
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

      <div className="mt-6 rounded-xl border border-slate-200 bg-white px-5 dark:border-neutral-800 dark:bg-neutral-900">
        {isLoading ? (
          <p className="py-4 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
        ) : (
          <>
            <p className="border-b border-slate-100 py-3 text-xs text-slate-500 dark:border-neutral-800 dark:text-neutral-400">
              {t("pinnedNote")}
            </p>
            {sections.map((section, index) => (
              <div
                key={section.key}
                className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0 dark:border-neutral-800"
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => move(index, "up")}
                    disabled={index === 0}
                    className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:text-neutral-500 dark:hover:text-neutral-200"
                    aria-label={t("moveUp")}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move(index, "down")}
                    disabled={index === sections.length - 1}
                    className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:text-neutral-500 dark:hover:text-neutral-200"
                    aria-label={t("moveDown")}
                  >
                    ▼
                  </button>
                </div>

                <div className="min-w-0 flex-1 text-sm font-medium text-slate-900 dark:text-neutral-50">
                  {sectionLabel(section.key)}
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={section.visible}
                    onChange={(e) => toggleVisible(index, e.target.checked)}
                  />
                  {section.visible ? t("visible") : t("hidden")}
                </label>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {t("save")}
        </Button>
        {saveState === "saved" && <span className="text-sm text-brand-600 dark:text-brand-100">{t("saved")}</span>}
        {saveState === "error" && <span className="text-sm text-red-600 dark:text-red-400">{t("saveError")}</span>}
      </div>
    </AdminLayout>
  );
}
