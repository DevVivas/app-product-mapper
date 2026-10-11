import { useCallback, useEffect, useRef, useState } from "react";
import { ListParams, LocalProduct, Paginated } from "../types";
import { localProductService } from "../services/localProductService";
import { DEFAULT_PAGE_SIZE, DEBOUNCE_MS } from "./useProviders";

export function useLocalProducts(listParams: ListParams = {}) {
  const pageSize = listParams.limit ?? DEFAULT_PAGE_SIZE;
  const [rows, setRows] = useState<LocalProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(listParams.page ?? 1);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<number | null>(null);

  const q = listParams.q ?? "";

  const fetchPage = useCallback(
    (nextPage: number) => {
      localProductService
        .list({ q, page: nextPage, limit: pageSize })
        .then((res: Paginated<LocalProduct>) => {
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
    async (data: Pick<LocalProduct, "code" | "name">) => {
      await localProductService.create(data);
      await fetchPage(page);
    },
    [fetchPage, page]
  );

  const update = useCallback(
    async (id: number, data: Partial<Pick<LocalProduct, "code" | "name">>) => {
      await localProductService.update(id, data);
      await fetchPage(page);
    },
    [fetchPage, page]
  );

  const remove = useCallback(
    async (id: number) => {
      await localProductService.remove(id);
      await fetchPage(page);
    },
    [fetchPage, page]
  );

  const refresh = useCallback(() => fetchPage(page), [fetchPage, page]);

  return { rows, total, page, pageSize, loading, setPage, refresh, create, update, remove };
}