import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartBar } from "@/components/cart/CartBar";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Carmine — Servizi immobiliari",
  description: "Configura e acquista i servizi per vendere il tuo immobile in Svizzera.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col bg-slate-50">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-24">{children}</main>
          <Footer />
          <CartBar />
          <CartDrawer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
