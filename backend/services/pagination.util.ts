export function paginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    pageCount: Math.ceil(total / limit),
  };
}