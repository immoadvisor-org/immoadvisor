import { BRAND_NAME } from "@/lib/constants";

// Scritta "ImmoAdvisor" con la A disegnata a casetta (stesso disegno di
// public/logo.svg). "Immo" e "dvisor" restano testo vero, nel font e nel
// colore del contesto (tema chiaro/scuro compresi): solo la A è un SVG,
// dimensionato in em così segue la grandezza del testo attorno.
export function BrandWordmark() {
  return (
    <span aria-label={BRAND_NAME} role="img" className="inline-flex items-baseline whitespace-nowrap">
      <span aria-hidden="true">Immo</span>
      <svg
        aria-hidden="true"
        viewBox="118 18 30.8 43.7"
        // Nel flex il "baseline" di un SVG è il suo bordo inferiore: lo
        // abbassiamo della metà del tratto così i piedi della A poggiano
        // sulla stessa linea di "Immo" e "dvisor", come in logo.svg.
        className="relative top-[0.0425em] inline-block h-[1.0925em] w-[0.77em]"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M119.7,60 L132.65,33 L145.6,60" />
        <path d="M125.43,60 V44.34 H139.87 V60" />
        <polygon points="136.5,30.03 140.5,38.37 140.5,49.37 136.5,41.03" fill="currentColor" stroke="none" />
        <circle cx="142.4" cy="29.5" r="2.1" fill="currentColor" stroke="none" opacity="0.55" />
        <circle cx="145.1" cy="24.6" r="1.6" fill="currentColor" stroke="none" opacity="0.38" />
        <circle cx="147.1" cy="20.2" r="1.2" fill="currentColor" stroke="none" opacity="0.24" />
      </svg>
      <span aria-hidden="true">dvisor</span>
    </span>
  );
}
