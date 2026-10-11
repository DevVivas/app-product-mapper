import { prisma } from "../config/prisma";
import {
    CreateEquivalenceInput,
    UpdateEquivalenceInput,
} from "../validators/equivalence.validator";

const equivalenceInclude = {
    provider: true,
    localProduct: true,
} as const;

type ListParams = { q?: string; providerId?: number; page: number; limit: number };

function buildWhere({ q, providerId }: { q?: string; providerId?: number }) {
    return {
        ...(providerId ? { providerId } : {}),
        ...(q
            ? {
                OR: [
                    { providerCode: { contains: q, mode: "insensitive" as const } },
                    { providerName: { contains: q, mode: "insensitive" as const } },
                    {
                        localProduct: {
                            code: { contains: q, mode: "insensitive" as const },
                        },
                    },
                    {
                        localProduct: {
                            name: { contains: q, mode: "insensitive" as const },
                        },
                    },
                ],
            }
            : {}),
    };
}

export const equivalenceRepository = {
    listPaged({ q, providerId, page, limit }: ListParams) {
        const where = buildWhere({ q, providerId });
        return prisma.$transaction([
            prisma.equivalence.count({ where }),
            prisma.equivalence.findMany({
                where,
                include: equivalenceInclude,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
    },

    obtenerPorId(id: number) {
        return prisma.equivalence.findUnique({
            where: { id },
            include: equivalenceInclude,
        });
    },

    EncontrarPorProveedorYCodigo(providerId: number, providerCode: string) {
        return prisma.equivalence.findUnique({
            where: {
                uq_provider_code: {
                    providerId,
                    providerCode,
                },
            },
        });
    },

    create(data: CreateEquivalenceInput) {
        return prisma.equivalence.create({
            data,
            include: equivalenceInclude,
         });
    },

    update(id: number, data: UpdateEquivalenceInput) {
        return prisma.equivalence.update({
            where: { id },
            data,
            include: equivalenceInclude,
        });
    },

    remove(id: number) {
        return prisma.equivalence.delete({ where: { id } });
    },

  /**
   * Búsqueda universal (RF-002, RF-003, RF-004):
   * busca coincidencias parciales/tolerantes en codigo_proveedor,
   * nombre_proveedor, codigo_local y nombre_local, con paginación.
   */
  search(query: string, providerId: number | undefined, page: number, limit: number) {
    const where = buildWhere({ q: query, providerId });
    return prisma.$transaction([
      prisma.equivalence.count({ where }),
      prisma.equivalence.findMany({
        where,
        include: equivalenceInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
  },

};