import { useCallback, useEffect, useRef, useState } from "react";
import { Equivalence, ListParams, Paginated } from "../types";
import { equivalenceService } from "../services/equivalenceService";
import { DEFAULT_PAGE_SIZE, DEBOUNCE_MS } from "./useProviders";

export function useEquivalences(listParams: ListParams = {}) {
  const pageSize = listParams.limit ?? DEFAULT_PAGE_SIZE;
  const [rows, setRows] = useState<Equivalence[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(listParams.page ?? 1);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<number | null>(null);

  const q = listParams.q ?? "";
  const providerId = listParams.providerId;

  const fetchPage = useCallback(
    (nextPage: number) => {
      equivalenceService
        .list({ q, providerId, page: nextPage, limit: pageSize })
        .then((res: Paginated<Equivalence>) => {
          setRows(res.data);
          setTotal(res.meta.total);
        })
        .finally(() => setLoading(false));
    },
    [q, providerId, pageSize]
  );

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    setLoading(true);
    if (q.trim()) {
      debounceRef.current = window.setTimeout(() => fetchPage(page), DEBOUNCE_MS);
    } else {
      fetchPage(page);
    }
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q, providerId, page, pageSize]);

  const remove = useCallback(
    async (id: number) => {
      await equivalenceService.remove(id);
      await fetchPage(page);
    },
    [fetchPage, page]
  );

  const refresh = useCallback(() => fetchPage(page), [fetchPage, page]);

  return { rows, total, page, pageSize, loading, setPage, refresh, remove };
}