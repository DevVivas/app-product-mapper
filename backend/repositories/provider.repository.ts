import { prisma } from "../config/prisma";
import { CreateProviderInput, UpdateProviderInput } from "../validators/provider.validator";

type ListParams = { q?: string; page: number; limit: number };

export const providerRepository = {
    listPaged({ q, page, limit }: ListParams) {
        const where = q
            ? { name: { contains: q, mode: "insensitive" as const } }
            : {};
        return prisma.$transaction([
            prisma.provider.count({ where }),
            prisma.provider.findMany({
                where,
                orderBy: { name: "asc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
    },

    obtenerPorId(id: number) {
        return prisma.provider.findUnique({ where: { id } });
    },

    ObtenerPorNombre(name: string) {
        return prisma.provider.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
    },

    create(data: CreateProviderInput) {
        return prisma.provider.create({ data });
    },

    update(id: number, data: UpdateProviderInput) {
        return prisma.provider.update({ where: { id }, data });
    },

    remove(id: number) {
        return prisma.$transaction([
            prisma.equivalence.deleteMany({ where: { providerId: id } }),
            prisma.provider.delete({ where: { id } }),
        ]);
    },
};