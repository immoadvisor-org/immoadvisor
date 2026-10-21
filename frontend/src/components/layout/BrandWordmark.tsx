import { BRAND_NAME } from "@/lib/constants";

// Logo HomeBlock: quattro blocchi, quello in alto a destra è una casetta
// color oro (stesso disegno di public/logo.svg). I contorni seguono il
// colore del testo, così il logo funziona sia in tema chiaro che scuro;
// "home" leggero e "block" in grassetto restano testo vero.
export function BrandWordmark() {
  return (
    <span aria-label={BRAND_NAME} role="img" className="inline-flex items-center gap-[0.4em] whitespace-nowrap">
      <svg aria-hidden="true" viewBox="0 0 100 101" className="h-[1.35em] w-[1.35em] shrink-0">
        <rect x="1.75" y="2.75" width="41.5" height="41.5" fill="none" stroke="currentColor" strokeWidth="5" />
        <path d="M55 19 L77.5 0 L100 19 V46 H55 Z" fill="#b8956b" />
        <rect x="1.75" y="57.75" width="41.5" height="41.5" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="56.75" y="57.75" width="41.5" height="41.5" fill="none" stroke="currentColor" strokeWidth="5" />
      </svg>
      <span aria-hidden="true" className="font-brand tracking-tight">
        <span className="font-light">home</span>
        <span className="font-bold">block</span>
      </span>
    </span>
  );
}
