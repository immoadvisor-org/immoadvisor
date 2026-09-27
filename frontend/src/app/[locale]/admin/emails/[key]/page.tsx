"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import {
  listAdminEmailTemplates,
  previewAdminEmailTemplate,
  resetAdminEmailTemplate,
  saveAdminEmailTemplate,
  type EmailPreview,
  type EmailTemplateAdmin,
} from "@/features/admin/emailsAdminApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmailTemplatesNav } from "@/components/admin/EmailTemplatesNav";
import { Button } from "@/components/ui/Button";

const inputClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export default function AdminEmailTemplatePage() {
  const params = useParams<{ key: string }>();
  const t = useTranslations("AdminEmails");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [templates, setTemplates] = useState<EmailTemplateAdmin[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showLogo, setShowLogo] = useState(true);
  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "reset" | "error">("idle");

  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  // Campo in cui inserire il segnaposto cliccato: l'ultimo che ha avuto il focus.
  const lastFocusedRef = useRef<"subject" | "body">("body");

  const template = templates.find((item) => item.key === params.key);
  const isSignature = template?.group === "signature";

  function applyTemplate(next: EmailTemplateAdmin) {
    setSubject(next.subject ?? "");
    setBody(next.body);
    setShowLogo(next.show_logo);
  }

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    listAdminEmailTemplates(accessToken)
      .then((items) => {
        setTemplates(items);
        const current = items.find((item) => item.key === params.key);
        if (current) applyTemplate(current);
      })
      .finally(() => setIsLoading(false));
  }, [isAdmin, accessToken, params.key]);

  // Anteprima aggiornata mentre si scrive, con un piccolo ritardo per non
  // chiamare il backend a ogni tasto.
  useEffect(() => {
    if (!accessToken || !template) return;
    const timeout = setTimeout(() => {
      previewAdminEmailTemplate(
        template.key,
        { subject: isSignature ? null : subject, body, show_logo: showLogo },
        accessToken
      )
        .then(setPreview)
        .catch(() => setPreview(null));
    }, 400);
    return () => clearTimeout(timeout);
  }, [accessToken, template, isSignature, subject, body, showLogo]);

  if (isLoadingUser) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-neutral-400">{tAdmin("loading")}</p>;
  }

  if (!user || !isAdmin || !accessToken) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 dark:text-neutral-300">{tAdmin("accessDenied")}</p>
    );
  }

  function replaceTemplate(updated: EmailTemplateAdmin) {
    setTemplates((prev) => prev.map((item) => (item.key === updated.key ? updated : item)));
    applyTemplate(updated);
  }

  function insertPlaceholder(name: string) {
    const token = `{${name}}`;
    const target = lastFocusedRef.current === "subject" && !isSignature ? subjectRef.current : bodyRef.current;
    const setValue = target === subjectRef.current ? setSubject : setBody;
    if (!target) return;
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    const nextValue = target.value.slice(0, start) + token + target.value.slice(end);
    setValue(nextValue);
    requestAnimationFrame(() => {
      target.focus();
      target.setSelectionRange(start + token.length, start + token.length);
    });
  }

  async function handleSave() {
    if (!accessToken || !template) return;
    setIsSaving(true);
    setSaveState("idle");
    try {
      const updated = await saveAdminEmailTemplate(
        template.key,
        { subject: isSignature ? null : subject, body, show_logo: showLogo },
        accessToken
      );
      replaceTemplate(updated);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (!accessToken || !template) return;
    if (!window.confirm(t("resetConfirm"))) return;
    setIsSaving(true);
    setSaveState("idle");
    try {
      replaceTemplate(await resetAdminEmailTemplate(template.key, accessToken));
      setSaveState("reset");
    } catch {
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminLayout>
      <Link href="/admin/emails" className="text-sm text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100">
        ← {t("backToAll")}
      </Link>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
      ) : !template ? (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">{t("notFound")}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-8 lg:flex-row">
          <aside className="hidden lg:block lg:w-56 lg:flex-shrink-0">
            <EmailTemplatesNav templates={templates} activeKey={template.key} />
          </aside>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
              {t(`groups.${template.group}`)}
            </p>
            <h1 className="mt-1 text-2xl font-medium text-slate-900 dark:text-neutral-50">
              {t(`templates.${template.key}.name`)}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-neutral-300">
              {t(`templates.${template.key}.description`)}
            </p>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              {!isSignature && (
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-neutral-200">{t("subject")}</span>
                  <input
                    ref={subjectRef}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onFocus={() => (lastFocusedRef.current = "subject")}
                    className={`mt-1 ${inputClassName}`}
                  />
                </label>
              )}

              <label className={`block ${isSignature ? "" : "mt-4"}`}>
                <span className="text-sm font-medium text-slate-700 dark:text-neutral-200">
                  {isSignature ? t("signatureText") : t("body")}
                </span>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onFocus={() => (lastFocusedRef.current = "body")}
                  rows={isSignature ? 4 : 12}
                  className={`mt-1 font-mono ${inputClassName}`}
                />
              </label>
              <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{t("formattingHelp")}</p>

              {isSignature && (
                <label className="mt-4 flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-200">
                  <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} />
                  {t("showLogo")}
                </label>
              )}

              {template.placeholders.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">{t("placeholders")}</p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">{t("placeholdersHelp")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {template.placeholders.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => insertPlaceholder(name)}
                        title={t(`placeholderDescriptions.${name}`)}
                        className="rounded-full border border-slate-300 px-2.5 py-1 font-mono text-xs text-slate-700 hover:border-brand-500 hover:text-brand-600 dark:border-neutral-700 dark:text-neutral-200 dark:hover:text-brand-100"
                      >
                        {`{${name}}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button onClick={handleSave} disabled={isSaving}>
                  {t("save")}
                </Button>
                {template.is_customized && (
                  <Button variant="secondary" onClick={handleReset} disabled={isSaving}>
                    {t("reset")}
                  </Button>
                )}
                {saveState === "saved" && <span className="text-sm text-brand-600 dark:text-brand-100">{t("saved")}</span>}
                {saveState === "reset" && <span className="text-sm text-brand-600 dark:text-brand-100">{t("resetDone")}</span>}
                {saveState === "error" && <span className="text-sm text-red-600 dark:text-red-400">{t("saveError")}</span>}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">{t("preview")}</p>
              <p className="text-xs text-slate-500 dark:text-neutral-400">{t("previewHelp")}</p>
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-neutral-800">
                {preview?.subject && (
                  <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                    <span className="text-slate-500 dark:text-neutral-400">{t("subject")}:</span> {preview.subject}
                  </p>
                )}
                {/* Le email si leggono su sfondo chiaro: l'anteprima resta bianca anche nel tema scuro. */}
                <iframe
                  title={t("preview")}
                  sandbox=""
                  srcDoc={`<body style="margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#0f172a;background:#fff;">${preview?.html ?? ""}</body>`}
                  className="h-80 w-full bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
