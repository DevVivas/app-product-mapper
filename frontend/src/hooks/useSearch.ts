import { useCallback, useRef, useState } from "react";
import { searchService } from "../services/searchService";
import { SearchResult } from "../types";
import { ApiError } from "../services/api";

type SearchStatus = "idle" | "loading" | "success" | "error";

interface LastQuery {
  query: string;
  providerId?: number;
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<LastQuery | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string, providerId?: number, nextPage = 1) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError(null);
    setLastQuery({ query: cleanQuery, providerId });
    setPage(nextPage);

    try {
      const response = await searchService.search(cleanQuery, providerId, nextPage, 50, controller.signal);
      setResults(response.results);
      setTotal(response.meta.total);
      setPageCount(response.meta.pageCount);
      setStatus("success");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setResults([]);
      setTotal(0);
      setPageCount(0);
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "No se pudo realizar la búsqueda");
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setResults([]);
    setTotal(0);
    setPage(1);
    setPageCount(0);
    setStatus("idle");
    setError(null);
  }, []);

  const goToPage = useCallback(
    (nextPage: number) => {
      if (!lastQuery) return;
      search(lastQuery.query, lastQuery.providerId, nextPage);
    },
    [search, lastQuery]
  );

  const refresh = useCallback(() => {
    if (!lastQuery) return;
    search(lastQuery.query, lastQuery.providerId, page);
  }, [search, lastQuery, page]);

  return { results, total, page, pageCount, status, error, search, goToPage, lastQuery, refresh, reset };
}