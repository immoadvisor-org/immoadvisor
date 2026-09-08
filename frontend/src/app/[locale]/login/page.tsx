"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link, useRouter } from "@/i18n/navigation";
import { supabase } from "@/features/auth/supabaseClient";
import { Button } from "@/components/ui/Button";
import { SWISS_CANTONS } from "@/lib/cantons";

type Mode = "sign-in" | "sign-up" | "forgot-password";

interface SignUpFields {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine: string;
  postalCode: string;
  city: string;
  canton: string;
  avsNumber: string;
}

const EMPTY_SIGNUP_FIELDS: SignUpFields = {
  firstName: "",
  lastName: "",
  phone: "",
  addressLine: "",
  postalCode: "",
  city: "",
  canton: "",
  avsNumber: "",
};

export default function LoginPage() {
  const t = useTranslations("Login");
  const router = useRouter();
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpFields, setSignUpFields] = useState<SignUpFields>(EMPTY_SIGNUP_FIELDS);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  function updateSignUpField(field: keyof SignUpFields, value: string) {
    setSignUpFields((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === "forgot-password") {
      setIsSubmitting(true);
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

    if (mode === "sign-up" && !termsAccepted) {
      setError(t("errorTermsRequired"));
      return;
    }

    setIsSubmitting(true);

    const { error: authError } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: signUpFields.firstName,
                last_name: signUpFields.lastName,
                phone: signUpFields.phone,
                address_line: signUpFields.addressLine,
                postal_code: signUpFields.postalCode,
                city: signUpFields.city,
                canton: signUpFields.canton,
                avs_number: signUpFields.avsNumber || null,
              },
            },
          });

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

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">
        {mode === "sign-in" ? t("signInTitle") : mode === "sign-up" ? t("signUpTitle") : t("resetTitle")}
      </h1>
      {mode === "forgot-password" && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("resetSubtitle")}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className={labelClass}>
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </div>

        {mode !== "forgot-password" && (
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className={labelClass}>
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
              className={inputClass}
            />
          </div>
        )}

        {mode === "sign-up" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={labelClass}>
                  {t("firstName")}
                </label>
                <input
                  id="firstName"
                  required
                  value={signUpFields.firstName}
                  onChange={(e) => updateSignUpField("firstName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClass}>
                  {t("lastName")}
                </label>
                <input
                  id="lastName"
                  required
                  value={signUpFields.lastName}
                  onChange={(e) => updateSignUpField("lastName", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>
                {t("phone")}
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={signUpFields.phone}
                onChange={(e) => updateSignUpField("phone", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="addressLine" className={labelClass}>
                {t("addressLine")}
              </label>
              <input
                id="addressLine"
                required
                value={signUpFields.addressLine}
                onChange={(e) => updateSignUpField("addressLine", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="postalCode" className={labelClass}>
                  {t("postalCode")}
                </label>
                <input
                  id="postalCode"
                  required
                  value={signUpFields.postalCode}
                  onChange={(e) => updateSignUpField("postalCode", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="city" className={labelClass}>
                  {t("city")}
                </label>
                <input
                  id="city"
                  required
                  value={signUpFields.city}
                  onChange={(e) => updateSignUpField("city", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="canton" className={labelClass}>
                {t("canton")}
              </label>
              <select
                id="canton"
                required
                value={signUpFields.canton}
                onChange={(e) => updateSignUpField("canton", e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  {t("cantonPlaceholder")}
                </option>
                {SWISS_CANTONS.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="avsNumber" className={labelClass}>
                {t("avsNumber")}
              </label>
              <input
                id="avsNumber"
                placeholder="756.XXXX.XXXX.XX"
                value={signUpFields.avsNumber}
                onChange={(e) => updateSignUpField("avsNumber", e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("avsNumberHint")}</p>
            </div>

            <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                {t("termsPrefix")}{" "}
                <Link href="/terms" target="_blank" className="text-brand-600 hover:underline dark:text-brand-100">
                  {t("termsLink")}
                </Link>
              </span>
            </label>
          </>
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
