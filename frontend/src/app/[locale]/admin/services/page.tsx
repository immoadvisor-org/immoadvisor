"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import {
  createAdminService,
  deleteAdminService,
  listAdminServices,
  reorderAdminServices,
  updateAdminService,
} from "@/features/admin/adminApi";
import type { AdminService, AdminServicePayload } from "@/features/admin/types";
import { ApiError } from "@/lib/apiClient";
import { ServiceRow } from "@/components/admin/ServiceRow";
import { ServiceEditor } from "@/components/admin/ServiceEditor";
import { Button } from "@/components/ui/Button";

export default function AdminServicesPage() {
  const t = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);

  const [services, setServices] = useState<AdminService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accessToken = session?.access_token;

  const loadServices = useCallback(() => {
    if (!accessToken) return;
    setIsLoading(true);
    listAdminServices(accessToken)
      .then(setServices)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  useEffect(() => {
    if (isAdmin && accessToken) loadServices();
  }, [isAdmin, accessToken, loadServices]);

  if (isLoadingUser) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p>;
  }

  if (!user || !isAdmin) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 dark:text-slate-300">{t("accessDenied")}</p>
    );
  }

  async function handleCreate(payload: AdminServicePayload) {
    if (!accessToken) return;
    try {
      await createAdminService(payload, accessToken);
      setEditingId(null);
      loadServices();
    } catch {
      throw new Error(t("createError"));
    }
  }

  async function handleUpdate(id: string, payload: AdminServicePayload) {
    if (!accessToken) return;
    try {
      await updateAdminService(id, payload, accessToken);
      setEditingId(null);
      loadServices();
    } catch {
      throw new Error(t("updateError"));
    }
  }

  async function handleToggleActive(service: AdminService, active: boolean) {
    if (!accessToken) return;
    setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, active } : s)));
    try {
      await updateAdminService(service.id, { active }, accessToken);
    } catch {
      loadServices();
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return;
    try {
      await deleteAdminService(id, accessToken);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? t("inUseError") : t("deleteError"));
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    if (!accessToken) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const reordered = [...services];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    const updates = reordered.map((service, i) => ({ id: service.id, display_order: i * 10 }));
    setServices(reordered.map((service, i) => ({ ...service, display_order: i * 10 })));
    await reorderAdminServices(updates, accessToken);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setEditingId("new")}>{t("newItem")}</Button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {editingId === "new" && (
        <div className="mt-6">
          <ServiceEditor accessToken={accessToken} onSave={handleCreate} onCancel={() => setEditingId(null)} />
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <p className="py-4 text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p>
        ) : (
          services.map((service, index) =>
            editingId === service.id ? (
              <div key={service.id} className="py-4">
                <ServiceEditor
                  initial={service}
                  accessToken={accessToken}
                  onSave={(payload) => handleUpdate(service.id, payload)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <ServiceRow
                key={service.id}
                service={service}
                isFirst={index === 0}
                isLast={index === services.length - 1}
                onEdit={() => setEditingId(service.id)}
                onDelete={() => handleDelete(service.id)}
                onToggleActive={(active) => handleToggleActive(service, active)}
                onMove={(direction) => handleMove(index, direction)}
              />
            )
          )
        )}
      </div>
    </div>
  );
}
