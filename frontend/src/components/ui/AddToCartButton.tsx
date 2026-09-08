interface AddToCartButtonProps {
  isInCart: boolean;
  onClick: () => void;
  addLabel: string;
  removeLabel: string;
}

export function AddToCartButton({ isInCart, onClick, addLabel, removeLabel }: AddToCartButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isInCart ? removeLabel : addLabel}
      title={isInCart ? removeLabel : addLabel}
      className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
        isInCart
          ? "border-teal-200 bg-slate-100 text-teal-600 hover:bg-slate-200 dark:border-teal-900 dark:bg-neutral-800 dark:text-teal-300 dark:hover:bg-neutral-700"
          : "border-slate-200 bg-white text-brand-600 hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-brand-200 dark:hover:bg-neutral-800"
      }`}
    >
      {isInCart ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
    </button>
  );
}
