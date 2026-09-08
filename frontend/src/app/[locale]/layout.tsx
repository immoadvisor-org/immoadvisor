import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing, type Locale } from "@/i18n/routing";
import { BRAND_NAME } from "@/lib/constants";
import { SITE_URL, buildAlternates } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartBar } from "@/components/cart/CartBar";
import "@/app/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const alternates = buildAlternates(locale as Locale, "/");

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("home.title"), template: `%s — ${BRAND_NAME}` },
    description: t("home.description"),
    alternates,
    openGraph: {
      siteName: BRAND_NAME,
      locale,
      type: "website",
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: BRAND_NAME,
  url: SITE_URL,
  areaServed: { "@type": "Country", name: "Switzerland" },
};

// Applica il tema salvato prima del primo paint, per evitare il flash
// bianco->scuro quando l'utente ha già scelto la modalità dark.
const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

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
    <html lang={locale} className={spaceGrotesk.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-neutral-950 dark:text-neutral-50">
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1 pb-24">{children}</main>
          <Footer />
          <CartBar />
          <CartDrawer />
          <ThemeToggle />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
