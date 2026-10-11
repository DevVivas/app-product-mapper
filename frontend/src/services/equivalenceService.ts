import { Equivalence, EquivalencePayload, ListParams, Paginated } from "../types";
import { apiRequest } from "./api";

export const equivalenceService = {
  list(params: ListParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set("q", params.q);
    if (params.providerId !== undefined) searchParams.set("providerId", String(params.providerId));
    if (params.page !== undefined) searchParams.set("page", String(params.page));
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return apiRequest<Paginated<Equivalence>>(`/equivalences${qs ? `?${qs}` : ""}`);
  },

  create(data: EquivalencePayload) {
    return apiRequest<Equivalence>("/equivalences", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: EquivalencePayload) {
    return apiRequest<Equivalence>(`/equivalences/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  remove(id: number) {
    return apiRequest<void>(`/equivalences/${id}`, { method: "DELETE" });
  },
};