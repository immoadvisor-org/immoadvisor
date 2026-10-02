"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { ImageLightbox } from "@/components/ui/ImageLightbox";

type Slide = { type: "image"; url: string } | { type: "video"; url: string };

interface ListingGalleryProps {
  title: string;
  images: string[];
  videoUrl: string | null;
}

export function ListingGallery({ title, images, videoUrl }: ListingGalleryProps) {
  const t = useTranslations("ListingDetail");
  const slides: Slide[] = [
    ...images.map((url): Slide => ({ type: "image", url })),
    ...(videoUrl ? [{ type: "video", url: videoUrl } as Slide] : []),
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  // Le immagini sono le prime slide: l'indice della slide coincide con quello in images.
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (slides.length === 0) {
    return <div className="aspect-[4/3] w-full rounded-2xl bg-slate-100 dark:bg-neutral-800" />;
  }

  const current = slides[activeIndex];

  function goTo(index: number) {
    setActiveIndex((index + slides.length) % slides.length);
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden xl:aspect-[3/2] rounded-2xl bg-slate-100 dark:bg-neutral-800">
        {current.type === "image" ? (
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label={t("enlargeImage")}
            className="group block h-full w-full cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.url} alt={title} className="h-full w-full object-cover" />
            <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow transition-colors group-hover:bg-white dark:bg-neutral-900/80 dark:text-neutral-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </span>
          </button>
        ) : (
          <video src={current.url} controls className="h-full w-full object-cover" />
        )}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label={t("previousMedia")}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow hover:bg-white dark:bg-neutral-900/80 dark:text-neutral-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label={t("nextMedia")}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow hover:bg-white dark:bg-neutral-900/80 dark:text-neutral-100"
            >
              ›
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {slides.map((slide, index) => (
            <button
              key={slide.url + index}
              type="button"
              onClick={() => goTo(index)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                index === activeIndex ? "border-brand-500" : "border-transparent"
              }`}
            >
              {slide.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slide.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-white">▶</div>
              )}
            </button>
          ))}
        </div>
      )}

      {isLightboxOpen && current.type === "image" && (
        <ImageLightbox
          images={images}
          index={activeIndex}
          alt={title}
          onIndexChange={setActiveIndex}
          onClose={() => setIsLightboxOpen(false)}
          labels={{ close: t("closeImage"), previous: t("previousMedia"), next: t("nextMedia") }}
        />
      )}
    </div>
  );
}
