"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import {
  createAdminListing,
  deleteAdminListing,
  getAdminListingsSettings,
  listAdminListings,
  reorderAdminListings,
  updateAdminListing,
  updateAdminListingsSettings,
} from "@/features/admin/listingsAdminApi";
import type { AdminListing, AdminListingPayload } from "@/features/admin/listingTypes";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ListingRow } from "@/components/admin/ListingRow";
import { ListingEditor } from "@/components/admin/ListingEditor";
import { Button } from "@/components/ui/Button";

export default function AdminListingsPage() {
  const t = useTranslations("AdminListings");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);

  const [listings, setListings] = useState<AdminListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sectionEnabled, setSectionEnabled] = useState(false);
  const [isUpdatingSectionEnabled, setIsUpdatingSectionEnabled] = useState(false);

  const accessToken = session?.access_token;

  const loadListings = useCallback(() => {
    if (!accessToken) return;
    setIsLoading(true);
    listAdminListings(accessToken)
      .then(setListings)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  useEffect(() => {
    if (isAdmin && accessToken) loadListings();
  }, [isAdmin, accessToken, loadListings]);

  useEffect(() => {
    if (!accessToken) return;
    getAdminListingsSettings(accessToken).then((data) => setSectionEnabled(data.enabled));
  }, [accessToken]);

  async function handleToggleSectionEnabled(enabled: boolean) {
    if (!accessToken) return;
    setSectionEnabled(enabled);
    setIsUpdatingSectionEnabled(true);
    try {
      await updateAdminListingsSettings(enabled, accessToken);
    } catch {
      setSectionEnabled(!enabled);
    } finally {
      setIsUpdatingSectionEnabled(false);
    }
  }

  if (isLoadingUser) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-slate-400">{tAdmin("loading")}</p>;
  }

  if (!user || !isAdmin) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 dark:text-slate-300">{tAdmin("accessDenied")}</p>
    );
  }

  async function handleCreate(payload: AdminListingPayload) {
    if (!accessToken) return;
    try {
      await createAdminListing(payload, accessToken);
      setEditingId(null);
      loadListings();
    } catch {
      throw new Error(tAdmin("createError"));
    }
  }

  async function handleUpdate(id: string, payload: AdminListingPayload) {
    if (!accessToken) return;
    try {
      await updateAdminListing(id, payload, accessToken);
      setEditingId(null);
      loadListings();
    } catch {
      throw new Error(tAdmin("updateError"));
    }
  }

  async function handleToggleActive(listing: AdminListing, active: boolean) {
    if (!accessToken) return;
    setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, active } : l)));
    try {
      await updateAdminListing(listing.id, { active }, accessToken);
    } catch {
      loadListings();
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return;
    try {
      await deleteAdminListing(id, accessToken);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError(tAdmin("deleteError"));
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    if (!accessToken) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= listings.length) return;

    const reordered = [...listings];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    const updates = reordered.map((listing, i) => ({ id: listing.id, display_order: i * 10 }));
    setListings(reordered.map((listing, i) => ({ ...listing, display_order: i * 10 })));
    await reorderAdminListings(updates, accessToken);
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setEditingId("new")}>{tAdmin("newItem")}</Button>
      </div>

      <label className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <input
          type="checkbox"
          checked={sectionEnabled}
          disabled={isUpdatingSectionEnabled}
          onChange={(e) => handleToggleSectionEnabled(e.target.checked)}
        />
        {t("sectionEnabled")}
      </label>

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {editingId === "new" && (
        <div className="mt-6">
          <ListingEditor accessToken={accessToken} onSave={handleCreate} onCancel={() => setEditingId(null)} />
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <p className="py-4 text-sm text-slate-500 dark:text-slate-400">{tAdmin("loading")}</p>
        ) : (
          listings.map((listing, index) =>
            editingId === listing.id ? (
              <div key={listing.id} className="py-4">
                <ListingEditor
                  initial={listing}
                  accessToken={accessToken}
                  onSave={(payload) => handleUpdate(listing.id, payload)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <ListingRow
                key={listing.id}
                listing={listing}
                isFirst={index === 0}
                isLast={index === listings.length - 1}
                onEdit={() => setEditingId(listing.id)}
                onDelete={() => handleDelete(listing.id)}
                onToggleActive={(active) => handleToggleActive(listing, active)}
                onMove={(direction) => handleMove(index, direction)}
              />
            )
          )
        )}
      </div>
    </AdminLayout>
  );
}
