"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/features/auth/supabaseClient";
import { Button } from "@/components/ui/Button";

type Mode = "sign-in" | "sign-up" | "forgot-password";

export default function LoginPage() {
  const t = useTranslations("Login");
  const router = useRouter();
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (mode === "forgot-password") {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      });
      setIsSubmitting(false);
      if (authError) {
        setError(authError.message);
        return;
      }
      setResetEmailSent(true);
      return;
    }

    const { error: authError } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/account");
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setResetEmailSent(false);
  }

  if (mode === "forgot-password" && resetEmailSent) {
    return (
      <div className="mx-auto max-w-sm px-4 py-12 text-center">
        <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("resetSuccessTitle")}</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t("resetSuccessText")}</p>
        <button
          onClick={() => switchMode("sign-in")}
          className="mt-6 text-sm text-brand-600 hover:underline dark:text-brand-100"
        >
          {t("backToSignIn")}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">
        {mode === "sign-in" ? t("signInTitle") : mode === "sign-up" ? t("signUpTitle") : t("resetTitle")}
      </h1>
      {mode === "forgot-password" && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("resetSubtitle")}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {mode !== "forgot-password" && (
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("password")}
              </label>
              {mode === "sign-in" && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot-password")}
                  className="text-xs text-brand-600 hover:underline dark:text-brand-100"
                >
                  {t("forgotPassword")}
                </button>
              )}
            </div>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? t("submitting")
            : mode === "sign-in"
              ? t("submitSignIn")
              : mode === "sign-up"
                ? t("submitSignUp")
                : t("resetSubmit")}
        </Button>
      </form>

      {mode === "forgot-password" ? (
        <button
          onClick={() => switchMode("sign-in")}
          className="mt-4 text-sm text-brand-600 hover:underline dark:text-brand-100"
        >
          {t("backToSignIn")}
        </button>
      ) : (
        <button
          onClick={() => switchMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="mt-4 text-sm text-brand-600 hover:underline dark:text-brand-100"
        >
          {mode === "sign-in" ? t("toggleToSignUp") : t("toggleToSignIn")}
        </button>
      )}
    </div>
  );
}
