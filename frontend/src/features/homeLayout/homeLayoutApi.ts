import { apiFetch } from "@/lib/apiClient";

export type HomeSectionKey = "packages" | "services" | "about" | "listings" | "how_it_works";

export interface HomeSection {
  key: HomeSectionKey;
  visible: boolean;
}

export interface HomeLayout {
  sections: HomeSection[];
}

export function getHomeLayout(): Promise<HomeLayout> {
  return apiFetch<HomeLayout>("/api/v1/home-layout");
}
