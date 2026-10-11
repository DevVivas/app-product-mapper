import { PaginationMeta, SearchResult } from "../types";
import { apiRequest } from "./api";

interface SearchResponse {
  results: SearchResult[];
  meta: PaginationMeta;
}

export const searchService = {
  search(query: string, providerId?: number, page = 1, limit = 50, signal?: AbortSignal) {
    const params = new URLSearchParams({ q: query });
    if (providerId) params.set("providerId", String(providerId));
    if (page !== undefined) params.set("page", String(page));
    if (limit !== undefined) params.set("limit", String(limit));
    return apiRequest<SearchResponse>(`/search?${params.toString()}`, { signal });
  },
};
