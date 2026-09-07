interface PriceTagProps {
  amountChf: number;
  className?: string;
}

export function PriceTag({ amountChf, className = "" }: PriceTagProps) {
  const formatted = new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(amountChf);

  return <span className={className}>{formatted}</span>;
}
