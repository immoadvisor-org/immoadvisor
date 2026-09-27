interface PriceTagProps {
  amountChf: number;
  className?: string;
  // Se indicata, "CHF" viene reso in uno span a parte con questa classe
  // (es. più piccolo della cifra); altrimenti il prezzo resta un testo unico.
  currencyClassName?: string;
  // Prezzi degli immobili: cifre intere, senza ".00".
  hideCents?: boolean;
}

export function PriceTag({ amountChf, className = "", currencyClassName, hideCents = false }: PriceTagProps) {
  const formatter = new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    ...(hideCents ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
  });

  if (!currencyClassName) {
    return <span className={className}>{formatter.format(amountChf)}</span>;
  }

  const parts = formatter.formatToParts(amountChf);
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
