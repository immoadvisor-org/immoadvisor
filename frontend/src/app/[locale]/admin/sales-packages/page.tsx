"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";
import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import {
  createAdminSalesPackage,
  deleteAdminSalesPackage,
  getAdminSalesPackagesContent,
  listAdminSalesPackages,
  reorderAdminSalesPackages,
  updateAdminSalesPackage,
  updateAdminSalesPackagesContent,
} from "@/features/admin/salesPackagesAdminApi";
import type {
  AdminSalesPackage,
  AdminSalesPackagePayload,
  SalesPackagesTranslationInput,
} from "@/features/admin/types";
import { ApiError } from "@/lib/apiClient";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SalesPackageRow } from "@/components/admin/SalesPackageRow";
import { SalesPackageEditor } from "@/components/admin/SalesPackageEditor";
import { SalesPackagesContentEditor } from "@/components/admin/SalesPackagesContentEditor";
import { Button } from "@/components/ui/Button";

const EMPTY_PAGE_CONTENT: SalesPackagesTranslationInput = {
  title: "",
  subtitle: "",
  comparisonRows: [],
  monthlyFeeLabel: "",
  notes: [],
  buyLabel: "",
};

export default function AdminSalesPackagesPage() {
  const t = useTranslations("AdminSalesPackages");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [packages, setPackages] = useState<AdminSalesPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [pageContent, setPageContent] = useState<Record<string, SalesPackagesTranslationInput>>({});
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [activeTab, setActiveTab] = useState<Locale>(routing.locales[0]);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [contentSaveState, setContentSaveState] = useState<"idle" | "saved" | "error">("idle");

  const loadPackages = useCallback(() => {
    if (!accessToken) return;
    setIsLoadingPackages(true);
    listAdminSalesPackages(accessToken)
      .then(setPackages)
      .finally(() => setIsLoadingPackages(false));
  }, [accessToken]);

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    loadPackages();
    setIsLoadingContent(true);
    getAdminSalesPackagesContent(accessToken)
      .then((data) => setPageContent(data.translations))
      .finally(() => setIsLoadingContent(false));
  }, [isAdmin, accessToken, loadPackages]);

  if (isLoadingUser) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-neutral-400">{tAdmin("loading")}</p>;
  }

  if (!user || !isAdmin) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 dark:text-neutral-300">{tAdmin("accessDenied")}</p>
    );
  }

  async function handleCreate(payload: AdminSalesPackagePayload) {
    if (!accessToken) return;
    try {
      await createAdminSalesPackage(payload, accessToken);
      setEditingId(null);
      loadPackages();
    } catch {
      throw new Error(t("createError"));
    }
  }

  async function handleUpdate(id: string, payload: AdminSalesPackagePayload) {
    if (!accessToken) return;
    try {
      await updateAdminSalesPackage(id, payload, accessToken);
      setEditingId(null);
      loadPackages();
    } catch {
      throw new Error(t("updateError"));
    }
  }

  async function handleToggleActive(pkg: AdminSalesPackage, active: boolean) {
    if (!accessToken) return;
    setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, active } : p)));
    try {
      await updateAdminSalesPackage(pkg.id, { active }, accessToken);
    } catch {
      loadPackages();
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return;
    try {
      await deleteAdminSalesPackage(id, accessToken);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setListError(err instanceof ApiError && err.status === 409 ? t("inUseError") : t("deleteError"));
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    if (!accessToken) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= packages.length) return;

    const reordered = [...packages];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    const updates = reordered.map((pkg, i) => ({ id: pkg.id, display_order: i * 10 }));
    setPackages(reordered.map((pkg, i) => ({ ...pkg, display_order: i * 10 })));
    await reorderAdminSalesPackages(updates, accessToken);
  }

  async function handleSaveContent() {
    if (!accessToken) return;
    setIsSavingContent(true);
    setContentSaveState("idle");
    try {
      const updated = await updateAdminSalesPackagesContent(pageContent, accessToken);
      setPageContent(updated.translations);
      setContentSaveState("saved");
    } catch {
      setContentSaveState("error");
    } finally {
      setIsSavingContent(false);
    }
  }

  const currentPageContent = pageContent[activeTab] ?? EMPTY_PAGE_CONTENT;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-neutral-300">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setEditingId("new")}>{t("newItem")}</Button>
      </div>

      {listError && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{listError}</p>}

      {editingId === "new" && (
        <div className="mt-6">
          <SalesPackageEditor onSave={handleCreate} onCancel={() => setEditingId(null)} />
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white px-5 dark:border-neutral-800 dark:bg-neutral-900">
        {isLoadingPackages ? (
          <p className="py-4 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
        ) : (
          packages.map((pkg, index) =>
            editingId === pkg.id ? (
              <div key={pkg.id} className="py-4">
                <SalesPackageEditor
                  initial={pkg}
                  onSave={(payload) => handleUpdate(pkg.id, payload)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <SalesPackageRow
                key={pkg.id}
                salesPackage={pkg}
                isFirst={index === 0}
                isLast={index === packages.length - 1}
                onEdit={() => setEditingId(pkg.id)}
                onDelete={() => handleDelete(pkg.id)}
                onToggleActive={(active) => handleToggleActive(pkg, active)}
                onMove={(direction) => handleMove(index, direction)}
              />
            )
          )
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-medium text-slate-900 dark:text-neutral-50">{t("pageContentTitle")}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-neutral-300">{t("pageContentSubtitle")}</p>

        {isLoadingContent ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
        ) : (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex gap-2 border-b border-slate-200 pb-4 dark:border-neutral-700">
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

            <div className="mt-4">
              <SalesPackagesContentEditor
                value={currentPageContent}
                onChange={(next) => setPageContent((prev) => ({ ...prev, [activeTab]: next }))}
              />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={handleSaveContent} disabled={isSavingContent}>
                {t("save")}
              </Button>
              {contentSaveState === "saved" && <span className="text-sm text-brand-600 dark:text-brand-100">{t("saved")}</span>}
              {contentSaveState === "error" && <span className="text-sm text-red-600 dark:text-red-400">{t("saveError")}</span>}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
