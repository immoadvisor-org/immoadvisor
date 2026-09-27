"use client";

import { useEffect, useRef, useState } from "react";

import { PackageCard } from "@/components/configurator/PackageCard";
import type { SalesPackage } from "@/features/salesPackages/salesPackagesApi";

function GalleryArrow({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Precedente" : "Successivo"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}

// Gallery scorrevole in stile Tesla: su mobile le schede occupano quasi
// tutta la larghezza e si scorrono con swipe (snap netto). Su desktop ogni
// scheda occupa gran parte del container (una sola a schermo intero, con un
// pezzo della successiva che sbircia). Sotto la gallery: i pallini che
// indicano la scheda attiva (cliccabili) e due frecce minimali per scorrere.
export function PackageGalleryRow({ packages, buyLabel }: { packages: SalesPackage[]; buyLabel: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function handleScroll() {
      const cards = Array.from(el!.children) as HTMLElement[];
      const scrollCenter = el!.scrollLeft + el!.clientWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - scrollCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
      });
      setActiveIndex(closest);
    }

    handleScroll();
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [packages.length]);

  function scrollByCard(direction: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 700;
    el.scrollBy({ left: direction === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  }

  function scrollToIndex(index: number) {
    const el = scrollerRef.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {packages.map((pkg) => (
          <div key={pkg.id} className="w-[88vw] flex-shrink-0 snap-start sm:w-[80%] lg:w-[74%]">
            <PackageCard pkg={pkg} buyLabel={buyLabel} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <GalleryArrow direction="left" onClick={() => scrollByCard("left")} />
        <div className="flex gap-2">
          {packages.map((pkg, index) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Vai al pacchetto ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex
                  ? "w-6 bg-brand-500"
                  : "w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              }`}
            />
          ))}
        </div>
        <GalleryArrow direction="right" onClick={() => scrollByCard("right")} />
      </div>
    </div>
  );
}
