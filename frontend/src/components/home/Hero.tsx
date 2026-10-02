import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  title: string;
  subtitle: string;
  cta?: { href: string; label: string };
}

export function Hero({ title, subtitle, cta }: HeroProps) {
  return (
    <section className="relative flex h-[70vh] min-h-[420px] w-full items-end overflow-hidden sm:h-[80vh]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-home.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="relative page-container pb-14 sm:pb-20">
        <h1 className="font-display max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl 2xl:max-w-4xl 2xl:text-7xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg 2xl:max-w-2xl 2xl:text-2xl">{subtitle}</p>
        {cta && (
          <Link href={cta.href} className="mt-6 inline-block">
            <Button variant="secondary">{cta.label}</Button>
          </Link>
        )}
      </div>
    </section>
  );
}
