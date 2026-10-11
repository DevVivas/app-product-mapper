import { ListParams, LocalProduct, Paginated } from "../types";
import { apiRequest } from "./api";

export const localProductService = {
  list(params: ListParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set("q", params.q);
    if (params.page !== undefined) searchParams.set("page", String(params.page));
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return apiRequest<Paginated<LocalProduct>>(`/products${qs ? `?${qs}` : ""}`);
  },

  create(data: Pick<LocalProduct, "code" | "name">) {
    return apiRequest<LocalProduct>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: Partial<Pick<LocalProduct, "code" | "name">>) {
    return apiRequest<LocalProduct>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  remove(id: number) {
    return apiRequest<void>(`/products/${id}`, { method: "DELETE" });
  },
};