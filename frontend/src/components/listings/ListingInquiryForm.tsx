"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { submitContactMessage } from "@/features/contact/contactApi";
import { Button } from "@/components/ui/Button";

interface ListingInquiryFormProps {
  listingReference: string;
  defaultMessage: string;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ListingInquiryForm({ listingReference, defaultMessage }: ListingInquiryFormProps) {
  const t = useTranslations("ListingDetail");
  const tContact = useTranslations("Contact");
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<FormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: defaultMessage,
  });
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
    if (!values.firstName.trim()) nextErrors.firstName = tContact("errorRequired");
    if (!values.lastName.trim()) nextErrors.lastName = tContact("errorRequired");
    if (!values.email.trim()) {
      nextErrors.email = tContact("errorRequired");
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = tContact("errorEmail");
    }
    if (!values.message.trim()) nextErrors.message = tContact("errorRequired");

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
        listing_reference: listingReference,
      });
      setIsSent(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : tContact("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <Button variant="secondary" className="mt-4 w-full" onClick={() => setIsOpen(true)}>
        {t("inquiryButton")}
      </Button>
    );
  }

  if (isSent) {
    return (
      <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4 text-center dark:border-brand-900/50 dark:bg-brand-500/10">
        <p className="text-sm text-brand-700 dark:text-brand-100">{t("inquirySuccess")}</p>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-neutral-300";

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-slate-200 p-4 dark:border-neutral-800" noValidate>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-50">{t("inquiryTitle")}</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>{tContact("firstName")}</label>
          <input value={values.firstName} onChange={(e) => updateField("firstName", e.target.value)} className={inputClass} />
          {errors.firstName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.firstName}</p>}
        </div>
        <div>
          <label className={labelClass}>{tContact("lastName")}</label>
          <input value={values.lastName} onChange={(e) => updateField("lastName", e.target.value)} className={inputClass} />
          {errors.lastName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>{tContact("email")}</label>
        <input type="email" value={values.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass} />
        {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
      </div>

      <div>
        <label className={labelClass}>{tContact("phone")}</label>
        <input type="tel" value={values.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>{tContact("message")}</label>
        <textarea
          rows={4}
          value={values.message}
          onChange={(e) => updateField("message", e.target.value)}
          className={inputClass}
        />
        {errors.message && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.message}</p>}
      </div>

      {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

      <div className="flex gap-2">
        <Button type="submit" variant="secondary" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? tContact("submitting") : tContact("submit")}
        </Button>
        <Button type="button" variant="ghost" aria-label={t("inquiryCancel")} onClick={() => setIsOpen(false)}>
          ×
        </Button>
      </div>
    </form>
  );
}
