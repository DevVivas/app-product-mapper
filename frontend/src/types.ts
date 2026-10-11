export interface Provider {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalProduct {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equivalence {
  id: number;
  providerId: number;
  providerCode: string;
  providerName: string;
  localProductId: number;
  createdAt: string;
  updatedAt: string;
  provider: Provider;
  localProduct: LocalProduct;
}

export interface SearchResult {
  id: number;
  provider: {
    id: number;
    name: string;
  };
  providerCode: string;
  providerName: string;
  localProductId: number;
  localCode: string;
  localName: string;
}

export interface EquivalencePayload {
  providerId: number;
  providerCode: string;
  providerName: string;
  localProductId: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListParams {
  q?: string;
  providerId?: number;
  page?: number;
  limit?: number;
}