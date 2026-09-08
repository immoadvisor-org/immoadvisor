"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { useProfile } from "@/features/profile/useProfile";
import { supabase } from "@/features/auth/supabaseClient";
import { deleteMyAccount } from "@/features/auth/accountApi";
import { SWISS_CANTONS } from "@/lib/cantons";
import { Button } from "@/components/ui/Button";

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine: string;
  postalCode: string;
  city: string;
  canton: string;
  avsNumber: string;
}

const EMPTY_FORM: ProfileFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  addressLine: "",
  postalCode: "",
  city: "",
  canton: "",
  avsNumber: "",
};

export default function AccountPage() {
  const t = useTranslations("Account");
  const router = useRouter();
  const { user, session, isLoading } = useUser();
  const { profile, refetch: refetchProfile } = useProfile(user);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<ProfileFormValues>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p>;
  }

  function startEditing() {
    setFormValues({
      firstName: profile?.first_name ?? "",
      lastName: profile?.last_name ?? "",
      phone: profile?.phone ?? "",
      addressLine: profile?.address_line ?? "",
      postalCode: profile?.postal_code ?? "",
      city: profile?.city ?? "",
      canton: profile?.canton ?? "",
      avsNumber: profile?.avs_number ?? "",
    });
    setSaveError(null);
    setIsEditing(true);
  }

  function updateField(field: keyof ProfileFormValues, value: string) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveProfile() {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: formValues.firstName.trim(),
        last_name: formValues.lastName.trim(),
        phone: formValues.phone.trim() || null,
        address_line: formValues.addressLine.trim() || null,
        postal_code: formValues.postalCode.trim() || null,
        city: formValues.city.trim() || null,
        canton: formValues.canton || null,
        avs_number: formValues.avsNumber.trim() || null,
      })
      .eq("id", user.id);

    setIsSaving(false);
    if (error) {
      setSaveError(t("editError"));
      return;
    }
    await refetchProfile();
    setIsEditing(false);
  }

  async function handleDeleteAccount() {
    if (!session?.access_token) return;
    if (!window.confirm(t("deleteAccountConfirm"))) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount(session.access_token);
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t("deleteAccountError"));
      setIsDeleting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
  const labelClass = "block text-sm text-slate-500 dark:text-slate-400";

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("title")}</h1>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("email")}</p>
          <p className="text-slate-900 dark:text-slate-50">{user.email}</p>
        </div>

        {isEditing ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className={labelClass}>
                {t("firstNameLabel")}
                <input
                  required
                  value={formValues.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                {t("lastNameLabel")}
                <input
                  required
                  value={formValues.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <label className={labelClass}>
              {t("phone")}
              <input
                type="tel"
                value={formValues.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              {t("address")}
              <input
                value={formValues.addressLine}
                onChange={(e) => updateField("addressLine", e.target.value)}
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-3 gap-4">
              <label className={labelClass}>
                {t("postalCodeLabel")}
                <input
                  value={formValues.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="col-span-2 block text-sm text-slate-500 dark:text-slate-400">
                {t("cityLabel")}
                <input
                  value={formValues.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <label className={labelClass}>
              {t("canton")}
              <select
                value={formValues.canton}
                onChange={(e) => updateField("canton", e.target.value)}
                className={inputClass}
              >
                <option value="">—</option>
                {SWISS_CANTONS.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              {t("avsNumber")}
              <input
                value={formValues.avsNumber}
                onChange={(e) => updateField("avsNumber", e.target.value)}
                className={inputClass}
              />
            </label>

            {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}

            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? t("editSaving") : t("editSave")}
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                {t("editCancel")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("fullName")}</p>
                <p className="text-slate-900 dark:text-slate-50">
                  {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("phone")}</p>
                <p className="text-slate-900 dark:text-slate-50">{profile?.phone || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("address")}</p>
                <p className="text-slate-900 dark:text-slate-50">
                  {profile?.address_line || "—"}
                  {profile?.postal_code || profile?.city ? (
                    <>
                      <br />
                      {[profile?.postal_code, profile?.city].filter(Boolean).join(" ")}
                    </>
                  ) : null}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("canton")}</p>
                <p className="text-slate-900 dark:text-slate-50">{profile?.canton || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("avsNumber")}</p>
                <p className="text-slate-900 dark:text-slate-50">{profile?.avs_number || "—"}</p>
              </div>
            </div>
            <Button variant="secondary" className="mt-4" onClick={startEditing}>
              {t("editButton")}
            </Button>
          </>
        )}
      </div>

      <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">{t("deleteAccountTitle")}</h2>
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{t("deleteAccountText")}</p>
        {deleteError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{deleteError}</p>}
        <Button
          variant="secondary"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="mt-3 border border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          {isDeleting ? t("deleteAccountLoading") : t("deleteAccountButton")}
        </Button>
      </div>
    </div>
  );
}
