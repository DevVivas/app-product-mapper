import { prisma } from "../config/prisma";
import {
  CreateLocalProductInput,
  UpdateLocalProductInput,
} from "../validators/localProduct.validator";

type ListParams = { q?: string; page: number; limit: number };

export const localProductRepository = {
    listPaged({ q, page, limit }: ListParams) {
        const where = q
            ? {
                OR: [
                    { code: { contains: q, mode: "insensitive" as const } },
                    { name: { contains: q, mode: "insensitive" as const } },
                ],
            }
            : {};
        return prisma.$transaction([
            prisma.localProduct.count({ where }),
            prisma.localProduct.findMany({
                where,
                orderBy: { name: "asc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
    },

    obtenerPorId(id: number) {
        return prisma.localProduct.findUnique({ where: { id } });
    },

    obtenerPorCodigo(code: string) {
        return prisma.localProduct.findUnique({ where: { code } });
    },

    create(data: CreateLocalProductInput) {
        return prisma.localProduct.create({ data });
    },

    update(id: number, data: UpdateLocalProductInput) {
        return prisma.localProduct.update({ where: { id }, data });
    },

    remove(id: number) {
        return prisma.$transaction([
            prisma.equivalence.deleteMany({ where: { localProductId: id } }),
            prisma.localProduct.delete({ where: { id } }),
     ]);
    },
};