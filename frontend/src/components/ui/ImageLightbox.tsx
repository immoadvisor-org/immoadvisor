"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  images: string[];
  index: number;
  alt: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  labels: { close: string; previous: string; next: string };
}

const SWIPE_THRESHOLD_PX = 50;

// Visualizzatore a schermo intero: immagine intera (object-contain) su fondo
// scuro, frecce, contatore, tastiera (Esc / ← / →) e swipe su mobile.
// Si chiude anche cliccando fuori dall'immagine.
export function ImageLightbox({ images, index, alt, onIndexChange, onClose, labels }: ImageLightboxProps) {
  const touchStartX = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hasMany = images.length > 1;

  function go(delta: number) {
    onIndexChange((index + delta + images.length) % images.length);
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft" && hasMany) onIndexChange((index - 1 + images.length) % images.length);
      else if (event.key === "ArrowRight" && hasMany) onIndexChange((index + 1) % images.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, images.length, hasMany, onClose, onIndexChange]);

  // Blocca lo scorrimento della pagina sotto e porta il focus sul pulsante di chiusura.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const arrowClassName =
    "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur hover:bg-white/20";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
      onTouchStart={(event) => (touchStartX.current = event.touches[0].clientX)}
      onTouchEnd={(event) => {
        if (touchStartX.current === null || !hasMany) return;
        const deltaX = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX) go(deltaX < 0 ? 1 : -1);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt={alt}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] max-w-[92vw] select-none object-contain"
      />

      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label={labels.close}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur hover:bg-white/20"
      >
        ×
      </button>

      {hasMany && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              go(-1);
            }}
            aria-label={labels.previous}
            className={`${arrowClassName} left-3 sm:left-6`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              go(1);
            }}
            aria-label={labels.next}
            className={`${arrowClassName} right-3 sm:right-6`}
          >
            ›
          </button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur">
            {index + 1} / {images.length}
          </p>
        </>
      )}
    </div>,
    document.body
  );
}
