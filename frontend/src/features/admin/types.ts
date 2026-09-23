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

export interface SalesPackageTranslationInput {
  name: string;
  featuredLabel: string | null;
  includesLabel: string | null;
  features: string[];
}

export interface AdminSalesPackage {
  id: string;
  slug: string;
  monthly_price_chf: string;
  featured: boolean;
  active: boolean;
  display_order: number;
  installments: number;
  allow_single_payment: boolean;
  translations: Record<string, SalesPackageTranslationInput>;
}

export type AdminSalesPackagePayload = Omit<AdminSalesPackage, "id">;

export interface SalesPackageComparisonRowInput {
  name: string;
  description: string;
  individualPrice: string;
  basic: string;
  medium: string;
  allInclusive: string;
}

export interface SalesPackagesTranslationInput {
  title: string;
  subtitle: string;
  comparisonRows: SalesPackageComparisonRowInput[];
  monthlyFeeLabel: string;
  notes: string[];
  buyLabel: string;
}
