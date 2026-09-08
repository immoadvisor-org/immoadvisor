export interface ListingTranslationInput {
  title: string;
  short_description: string;
  full_description: string;
}

export interface AdminListing {
  id: string;
  slug: string;
  city: string;
  canton: string | null;
  price_chf: string;
  rooms: string;
  active: boolean;
  display_order: number;
  translations: Record<string, ListingTranslationInput>;
  image_urls: string[];
  video_url: string | null;
}

export type AdminListingPayload = Omit<AdminListing, "id">;
