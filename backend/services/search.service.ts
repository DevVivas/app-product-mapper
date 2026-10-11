import { equivalenceRepository } from "../repositories/equivalence.repository";
import { paginationMeta } from "./pagination.util";

type EquivalenceWithRelations = Awaited<
  ReturnType<typeof equivalenceRepository.search>
>[1][number];

function toSearchResult(eq: EquivalenceWithRelations) {
  return {
    id: eq.id,
    provider: {
      id: eq.provider.id,
      name: eq.provider.name,
    },
    providerCode: eq.providerCode,
    providerName: eq.providerName,
    localProductId: eq.localProduct.id,
    localCode: eq.localProduct.code,
    localName: eq.localProduct.name,
  };
}

export const searchService = {
  /**
   * Búsqueda universal (RF-002): recibe un texto libre (código o nombre)
   * y opcionalmente un proveedor, y busca coincidencias parciales
   * en código/nombre de proveedor y código/nombre local, con paginación.
   */
  async search(query: string, providerId: number | undefined, page: number, limit: number) {
    const [total, data] = await equivalenceRepository.search(query, providerId, page, limit);
    return {
      results: data.map(toSearchResult),
      meta: paginationMeta(total, page, limit),
    };
  },
};