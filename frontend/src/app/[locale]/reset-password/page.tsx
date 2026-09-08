"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { Link, useRouter } from "@/i18n/navigation";
import { supabase } from "@/features/auth/supabaseClient";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPassword");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("errorMinLength"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("errorMismatch"));
      return;
    }

    setIsSubmitting(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setIsDone(true);
    setTimeout(() => router.push("/account"), 1500);
  }

  if (isDone) {
    return (
      <div className="mx-auto max-w-sm px-4 py-12 text-center">
        <h1 className="text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("successTitle")}</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-neutral-300">{t("successText")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("title")}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-neutral-300">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-neutral-300">
            {t("newPasswordLabel")}
          </label>
          <PasswordInput
            id="newPassword"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-neutral-300">
            {t("confirmPasswordLabel")}
          </label>
          <PasswordInput
            id="confirmPassword"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </form>

      <Link href="/login" className="mt-4 inline-block text-sm text-brand-600 hover:underline dark:text-brand-100">
        {t("backToSignIn")}
      </Link>
    </div>
  );
}
