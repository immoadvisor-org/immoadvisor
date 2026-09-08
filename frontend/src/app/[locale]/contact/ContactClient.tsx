"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { submitContactMessage } from "@/features/contact/contactApi";
import { Button } from "@/components/ui/Button";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY_FORM: FormValues = { firstName: "", lastName: "", email: "", phone: "", message: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactClient() {
  const t = useTranslations("Contact");
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  function updateField(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    if (!values.firstName.trim()) nextErrors.firstName = t("errorRequired");
    if (!values.lastName.trim()) nextErrors.lastName = t("errorRequired");
    if (!values.email.trim()) {
      nextErrors.email = t("errorRequired");
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = t("errorEmail");
    }
    if (!values.message.trim()) nextErrors.message = t("errorRequired");

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitContactMessage({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        message: values.message.trim(),
      });
      setIsSent(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSent) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/20">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-600 dark:text-brand-100">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-neutral-50">
          {t("successTitle")}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-neutral-300">{t("successText")}</p>
        <Link href="/" className="mt-8 inline-block">
          <Button>{t("backHome")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("title")}</h1>
      <p className="mt-2 text-slate-600 dark:text-neutral-300">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-neutral-300">
              {t("firstName")}
            </label>
            <input
              id="firstName"
              value={values.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-neutral-300">
              {t("lastName")}
            </label>
            <input
              id="lastName"
              value={values.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-neutral-300">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-neutral-300">
            {t("phone")}
          </label>
          <input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-neutral-300">
            {t("message")}
          </label>
          <textarea
            id="message"
            rows={5}
            value={values.message}
            onChange={(e) => updateField("message", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
          {errors.message && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.message}</p>}
        </div>

        {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

        <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </div>
  );
}
