import { useTranslations } from "next-intl";

import { Hero } from "@/components/home/Hero";
import { ListingList } from "@/components/listings/ListingList";

export default function ListingsPage() {
  const t = useTranslations("Listings");

  return (
    <div>
      <Hero title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ListingList />
      </div>
    </div>
  );
}
