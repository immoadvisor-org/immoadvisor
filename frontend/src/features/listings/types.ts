export interface Listing {
  id: string;
  slug: string;
  city: string;
  canton: string | null;
  price_chf: string;
  rooms: string;
  title: string;
  short_description: string;
  full_description: string;
  image_urls: string[];
  video_url: string | null;
}

export type ListingSort = "default" | "price_asc" | "price_desc" | "rooms_asc" | "rooms_desc" | "newest";

export interface ListingFilters {
  q?: string;
  city?: string;
  canton?: string;
  price_min?: string;
  price_max?: string;
  rooms_min?: string;
  rooms_max?: string;
  has_images?: boolean;
  has_video?: boolean;
  sort?: ListingSort;
  limit?: number;
}

export interface ListingFacets {
  cities: string[];
  cantons: string[];
  price_min: string | null;
  price_max: string | null;
  rooms_min: string | null;
  rooms_max: string | null;
}
