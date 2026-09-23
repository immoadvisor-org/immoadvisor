import { apiFetch } from "@/lib/apiClient";

export interface SalesPackage {
  id: string;
  slug: string;
  monthly_price_chf: string;
  featured: boolean;
  installments: number;
  allow_single_payment: boolean;
  name: string;
  featured_label: string | null;
  includes_label: string | null;
  features: string[];
}

export interface SalesPackageComparisonRow {
  name: string;
  description: string;
  individualPrice: string;
  basic: string;
  medium: string;
  allInclusive: string;
}

export interface SalesPackagesContent {
  title: string;
  subtitle: string;
  comparisonRows: SalesPackageComparisonRow[];
  monthlyFeeLabel: string;
  notes: string[];
  buyLabel: string;
}

export function getSalesPackages(locale: string): Promise<SalesPackage[]> {
  return apiFetch<SalesPackage[]>(`/api/v1/sales-packages?locale=${locale}`);
}

export function getSalesPackagesContent(locale: string): Promise<SalesPackagesContent> {
  return apiFetch<SalesPackagesContent>(`/api/v1/sales-packages/content?locale=${locale}`);
}
