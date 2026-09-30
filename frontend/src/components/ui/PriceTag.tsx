interface PriceTagProps {
  amountChf: number;
  className?: string;
  // Classe per "CHF", che è sempre in uno span a parte: di default più
  // piccolo e più tenue della cifra (in proporzione al testo attorno, con un
  // minimo leggibile), così la cifra resta in primo piano.
  currencyClassName?: string;
  // Prezzi degli immobili: cifre intere, senza ".00".
  hideCents?: boolean;
}

const DEFAULT_CURRENCY_CLASS = "mr-[0.15em] text-[length:max(0.7em,10px)] font-medium opacity-70";

export function PriceTag({
  amountChf,
  className = "",
  currencyClassName = DEFAULT_CURRENCY_CLASS,
  hideCents = false,
}: PriceTagProps) {
  const parts = new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    ...(hideCents ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
  }).formatToParts(amountChf);
  const currency = parts.find((part) => part.type === "currency")?.value ?? "CHF";
  const amount = parts
    .filter((part) => part.type !== "currency")
    .map((part) => part.value)
    .join("")
    .trim();

  return (
    <span className={`whitespace-nowrap ${className}`}>
      <span className={currencyClassName}>{currency}</span> {amount}
    </span>
  );
}
