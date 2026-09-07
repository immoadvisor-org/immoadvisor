export interface TranslationInput {
  name: string;
  description: string;
}

export interface AdminService {
  id: string;
  slug: string;
  category: string;
  price_chf: string;
  active: boolean;
  display_order: number;
  translations: Record<string, TranslationInput>;
  image_urls: string[];
}

export type AdminServicePayload = Omit<AdminService, "id">;
