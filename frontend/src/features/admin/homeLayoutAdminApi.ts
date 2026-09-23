import { apiFetch } from "@/lib/apiClient";
import type { HomeSection } from "@/features/homeLayout/homeLayoutApi";

const BASE = "/api/v1/admin/home-layout";

export interface HomeLayoutAdmin {
  sections: HomeSection[];
}

export function getAdminHomeLayout(accessToken: string): Promise<HomeLayoutAdmin> {
  return apiFetch<HomeLayoutAdmin>(BASE, { accessToken });
}

export function updateAdminHomeLayout(sections: HomeSection[], accessToken: string): Promise<HomeLayoutAdmin> {
  return apiFetch<HomeLayoutAdmin>(BASE, {
    method: "PUT",
    accessToken,
    body: JSON.stringify({ sections }),
  });
}
