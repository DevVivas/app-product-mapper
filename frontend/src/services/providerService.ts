import { ListParams, Paginated, Provider } from "../types";
import { apiRequest } from "./api";

export const providerService = {
  list(params: ListParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set("q", params.q);
    if (params.page !== undefined) searchParams.set("page", String(params.page));
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return apiRequest<Paginated<Provider>>(`/providers${qs ? `?${qs}` : ""}`);
  },

  create(name: string) {
    return apiRequest<Provider>("/providers", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  update(id: number, data: Partial<Pick<Provider, "name">>) {
    return apiRequest<Provider>(`/providers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  remove(id: number) {
    return apiRequest<void>(`/providers/${id}`, { method: "DELETE" });
  },
};