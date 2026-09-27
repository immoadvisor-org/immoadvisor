"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";
import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import {
  getAdminAboutContent,
  removeAdminAboutImage,
  updateAdminAboutContent,
  uploadAdminAboutImage,
  type AboutImageSlot,
} from "@/features/admin/aboutAdminApi";
import {
  DEFAULT_ABOUT_CTA_IMAGE,
  DEFAULT_ABOUT_MAIN_IMAGE,
  type AboutContent,
  type AboutImages,
} from "@/features/about/aboutApi";
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

const IMAGE_SLOTS: { slot: AboutImageSlot; labelKey: string; helpKey: string; fallback: string }[] = [
  { slot: "main", labelKey: "mainImageLabel", helpKey: "mainImageHelp", fallback: DEFAULT_ABOUT_MAIN_IMAGE },
  { slot: "cta", labelKey: "ctaImageLabel", helpKey: "ctaImageHelp", fallback: DEFAULT_ABOUT_CTA_IMAGE },
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
  const [images, setImages] = useState<AboutImages>({});
  const [busyImageSlot, setBusyImageSlot] = useState<AboutImageSlot | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    getAdminAboutContent(accessToken)
      .then((data) => {
        setTranslations(data.translations);
        setImages({ main_image_url: data.main_image_url, cta_image_url: data.cta_image_url });
      })
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

  async function handleImageChange(slot: AboutImageSlot, file: File | null) {
    if (!accessToken) return;
    setBusyImageSlot(slot);
    setImageError(null);
    try {
      const updated = file
        ? await uploadAdminAboutImage(slot, file, accessToken)
        : await removeAdminAboutImage(slot, accessToken);
      setImages({ main_image_url: updated.main_image_url, cta_image_url: updated.cta_image_url });
    } catch {
      setImageError(t("imageError"));
    } finally {
      setBusyImageSlot(null);
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("title")}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-neutral-300">{t("subtitle")}</p>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
      ) : (
        <>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-base font-medium text-slate-900 dark:text-neutral-50">{t("imagesTitle")}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{t("imagesSubtitle")}</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {IMAGE_SLOTS.map(({ slot, labelKey, helpKey, fallback }) => {
              const uploadedUrl = images[`${slot}_image_url`];
              const isBusy = busyImageSlot === slot;
              return (
                <div key={slot}>
                  <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">{t(labelKey)}</p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">{t(helpKey)}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadedUrl || fallback}
                    alt=""
                    className="mt-2 aspect-[3/2] w-full rounded-lg border border-slate-200 object-cover dark:border-neutral-700"
                  />
                  {!uploadedUrl && (
                    <p className="mt-1 text-xs text-slate-400 dark:text-neutral-500">{t("defaultImageNote")}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <label
                      className={`cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-brand-500 dark:border-neutral-700 dark:text-neutral-200 ${
                        isBusy ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      {isBusy ? t("imageUploading") : uploadedUrl ? t("replaceImage") : t("uploadImage")}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={isBusy}
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          e.target.value = "";
                          if (file) handleImageChange(slot, file);
                        }}
                      />
                    </label>
                    {uploadedUrl && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          if (window.confirm(t("removeImageConfirm"))) handleImageChange(slot, null);
                        }}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                      >
                        {t("removeImage")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {imageError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{imageError}</p>}
        </div>

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
        </>
      )}
    </AdminLayout>
  );
}
