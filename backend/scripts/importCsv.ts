import * as fs from "fs";
import * as path from "path";
import "../config/env";
import { prisma } from "../config/prisma";
import { LocalProduct, Provider } from "@prisma/client";

interface ColumnMap {
  provider?: string;
  providerCode?: string;
  providerName?: string;
  localCode?: string;
  localName?: string;
}

const HEADERS = {
  provider: ["proveedor", "nombreproveedor", "provider", "providername", "proveedores"],
  providerCode: [
    "codigo proveedor",
    "codigo_proveedor",
    "codigo prov",
    "codigoproveedor",
    "providercode",
    "código proveedor",
  ],
  providerName: [
    "nombre proveedor",
    "nombre_proveedor",
    "producto proveedor",
    "producto_proveedor",
    "productoproveedor",
    "nombreprov",
    "descripcion proveedor",
    "desc_proveedor",
    "descproveedor",
    "descripcionprov",
  ],
  localCode: [
    "codigo local",
    "codigo_local",
    "codigolocal",
    "localcode",
    "código local",
    "codigo producto",
    "codigoproducto",
    "codigo",
    "código",
  ],
  localName: [
    "nombre local",
    "nombre_local",
    "producto local",
    "producto_local",
    "productolocal",
    "localname",
    "nombre",
    "descripcion",
  ],
};

function parseCsv(content: string): string[][] {
  const noBom = content.replace(/^\ufeff/, "");
  const lines = noBom.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];

  const headerLine = lines[0];
  const semicolons = (headerLine.match(/;/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  const delimiter = semicolons >= commas ? ";" : ",";

  const rows: string[][] = [];
  for (const line of lines) {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current);
    rows.push(cells.map((c) => c.trim()));
  }
  return rows;
}

function normalizeHeader(cell: string): string {
  return cell.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function findColumn(targets: string[], headers: string[]): string | undefined {
  return headers.find((h, i) => headers[i] && targets.includes(normalizeHeader(h)));
}

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Uso: npx tsx scripts/importCsv.ts <archivo.csv>");
    process.exit(1);
  }

  const filePath = path.resolve(fileArg);
  if (!fs.existsSync(filePath)) {
    console.error(`No se encontró el archivo: ${filePath}`);
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(filePath, "utf-8"));
  if (rows.length < 2) {
    console.error("El CSV no tiene datos (solo cabecera o está vacío).");
    process.exit(1);
  }

  const headers = rows[0];
  const map: ColumnMap = {
    provider: findColumn(HEADERS.provider, headers),
    providerCode: findColumn(HEADERS.providerCode, headers),
    providerName: findColumn(HEADERS.providerName, headers),
    localCode: findColumn(HEADERS.localCode, headers),
    localName: findColumn(HEADERS.localName, headers),
  };

  const missing = Object.entries(map)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(`Cabeceras del CSV: ${headers.join(" | ")}`);
    console.error(`Faltan columnas: ${missing.join(", ")}`);
    console.error(
      "Se espera al menos: proveedor, codigo_proveedor, producto_proveedor, codigo_local, nombre_local (con sinónimos en inglés)."
    );
    process.exit(1);
  }

  console.log(`Cabeceras detectadas:`);
  for (const [key, value] of Object.entries(map)) console.log(`  ${key}: ${value}`);

  await prisma.$connect();
  const providerCache = new Map<string, Provider>();
  const productCache = new Map<string, LocalProduct>();

  for (const p of await prisma.provider.findMany()) providerCache.set(p.name, p);
  for (const p of await prisma.localProduct.findMany()) productCache.set(p.code, p);

  const existingEquivalenceIds = new Map<string, number>();
  for (const e of await prisma.equivalence.findMany({ select: { id: true, providerId: true, providerCode: true } })) {
    existingEquivalenceIds.set(`${e.providerId}|${e.providerCode}`, e.id);
  }

  const data = rows.slice(1);
  console.log(`\nImportando ${data.length} filas…\n`);

  async function getOrCreateProvider(name: string): Promise<Provider> {
    const cached = providerCache.get(name);
    if (cached) return cached;
    let created: Provider;
    try {
      created = await prisma.provider.create({ data: { name } });
    } catch {
      const existing = await prisma.provider.findFirst({ where: { name } });
      if (!existing) throw new Error(`no se pudo crear el proveedor "${name}"`);
      created = existing;
    }
    providerCache.set(name, created);
    createdProviders++;
    return created;
  }

  async function getOrCreateProduct(code: string, name: string): Promise<LocalProduct> {
    const cached = productCache.get(code);
    if (cached) return cached;
    let created: LocalProduct;
    try {
      created = await prisma.localProduct.create({ data: { code, name } });
    } catch {
      const existing = await prisma.localProduct.findUnique({ where: { code } });
      if (!existing) throw new Error(`no se pudo crear el producto local con código "${code}"`);
      created = existing;
    }
    productCache.set(code, created);
    createdProducts++;
    return created;
  }

  let createdProviders = 0;
  let createdProducts = 0;
  let createdEquivalences = 0;
  let updatedEquivalences = 0;
  let skipped = 0;

  const get = (col: string | undefined) => (col ? (row: string[]) => row[headers.indexOf(col)] ?? "" : () => "");

  const rowProvider = get(map.provider);
  const rowProviderCode = get(map.providerCode);
  const rowProviderName = get(map.providerName);
  const rowLocalCode = get(map.localCode);
  const rowLocalName = get(map.localName);

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2;

    const providerName = rowProvider(row).trim();
    const providerCode = rowProviderCode(row).trim();
    const providerDescription = rowProviderName(row).trim();
    const localCode = rowLocalCode(row).trim();
    const localName = (rowLocalName(row).trim() || providerDescription);

    if (!providerName || !providerCode || !localCode) {
      console.warn(`[fila ${rowNumber}] ignorada: faltan campos obligatorios`);
      skipped++;
      continue;
    }

    try {
      const provider = await getOrCreateProvider(providerName);
      const product = await getOrCreateProduct(localCode, localName);

      const existingId = existingEquivalenceIds.get(`${provider.id}|${providerCode}`);
      if (existingId) {
        await prisma.equivalence.update({
          where: { id: existingId },
          data: { providerName: providerDescription, localProductId: product.id },
        });
        updatedEquivalences++;
      } else {
        await prisma.equivalence.create({
          data: {
            providerId: provider.id,
            providerCode,
            providerName: providerDescription,
            localProductId: product.id,
          },
        });
        existingEquivalenceIds.set(`${provider.id}|${providerCode}`, -1);
        createdEquivalences++;
      }
    } catch (err) {
      console.warn(`[fila ${rowNumber}] error: ${err instanceof Error ? err.message : String(err)}`);
      skipped++;
    }

    if ((i + 1) % 500 === 0) {
      console.log(`Procesadas ${i + 1}/${data.length} filas…`);
    }
  }

  await prisma.$disconnect();
  console.log(`\nResumen:`);
  console.log(`  Proveedores creados:   ${createdProviders}`);
  console.log(`  Productos creados:     ${createdProducts}`);
  console.log(`  Equivalencias creadas: ${createdEquivalences}`);
  console.log(`  Equivalencias updates: ${updatedEquivalences}`);
  console.log(`  Filas ignoradas:       ${skipped}`);
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