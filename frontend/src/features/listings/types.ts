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

export interface ListingFilters {
  city?: string;
  price_min?: string;
  price_max?: string;
  rooms_min?: string;
  rooms_max?: string;
  limit?: number;
}
