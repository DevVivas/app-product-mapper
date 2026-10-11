import { useCallback, useEffect, useRef, useState } from "react";
import { ListParams, Paginated, Provider } from "../types";
import { providerService } from "../services/providerService";

export const DEFAULT_PAGE_SIZE = 20;
export const DEBOUNCE_MS = 450;

export function useProviders(listParams: ListParams = {}) {
  const pageSize = listParams.limit ?? DEFAULT_PAGE_SIZE;
  const [rows, setRows] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(listParams.page ?? 1);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<number | null>(null);

  const q = listParams.q ?? "";

  const fetchPage = useCallback(
    (nextPage: number) => {
      providerService
        .list({ q, page: nextPage, limit: pageSize })
        .then((res: Paginated<Provider>) => {
          setRows(res.data);
          setTotal(res.meta.total);
        })
        .finally(() => setLoading(false));
    },
    [q, pageSize]
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
  }, [q, page, pageSize]);

  const create = useCallback(
    async (name: string) => {
      await providerService.create(name);
      await fetchPage(page);
      return true;
    },
    [fetchPage, page]
  );

  const update = useCallback(
    async (id: number, data: Partial<Pick<Provider, "name">>) => {
      await providerService.update(id, data);
      await fetchPage(page);
    },
    [fetchPage, page]
  );

  const remove = useCallback(
    async (id: number) => {
      await providerService.remove(id);
      await fetchPage(page);
    },
    [fetchPage, page]
  );

  const refresh = useCallback(() => fetchPage(page), [fetchPage, page]);

  return { rows, total, page, pageSize, loading, setPage, refresh, create, update, remove };
}