import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const provider = await prisma.provider.upsert({
        where: { id: 1 },
        update: { name: "Proveedor Demo" },
        create: { name: "Proveedor Demo" },
    });

    const product = await prisma.localProduct.upsert({
        where: { code: "LOCAL-001" },
        update: { name: "Producto Local Demo" },
        create: { code: "LOCAL-001", name: "Producto Local Demo" },
    });

    await prisma.equivalence.upsert({
        where: {
            uq_provider_code: {
            providerId: provider.id,
            providerCode: "PROV-001",
        },
    },
    update: {
        providerName: "Producto Proveedor Demo",
        localProductId: product.id,
    },
    create: {
        providerId: provider.id,
        providerCode: "PROV-001",
        providerName: "Producto Proveedor Demo",
        localProductId: product.id,
    },
  });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });