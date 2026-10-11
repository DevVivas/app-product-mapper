import { equivalenceRepository } from "../repositories/equivalence.repository";
import { providerRepository } from "../repositories/provider.repository";
import { localProductRepository } from "../repositories/localProduct.repository";
import {
    CreateEquivalenceInput,
    EquivalenceListQuery,
    UpdateEquivalenceInput,
} from "../validators/equivalence.validator";
import { HttpError } from "../middleware/HttpError";
import { paginationMeta } from "./pagination.util";

async function assertProviderIsUsable(providerId: number) {
    const provider = await providerRepository.obtenerPorId(providerId);
        if (!provider) {
            throw HttpError.badRequest(`El proveedor ${providerId} no existe`);
        }
        return provider;
    }

async function assertLocalProductIsUsable(localProductId: number) {
    const product = await localProductRepository.obtenerPorId(localProductId);
        if (!product) {
            throw HttpError.badRequest(`El producto local ${localProductId} no existe`);
        }
        return product;
    }

export const equivalenceService = {
    async list(params: EquivalenceListQuery) {
        const [total, data] = await equivalenceRepository.listPaged(params);
        return { data, meta: paginationMeta(total, params.page, params.limit) };
    },

    async getById(id: number) {
        const equivalence = await equivalenceRepository.obtenerPorId(id);
        if (!equivalence) {
            throw HttpError.notFound(`Equivalencia ${id} no encontrada`);
        }
        return equivalence;
    },

    async create(data: CreateEquivalenceInput) {
        await assertProviderIsUsable(data.providerId);
        await assertLocalProductIsUsable(data.localProductId);

    // REQ: proveedorId + codigoProveedor debe ser único (RF-008)
    const duplicate = await equivalenceRepository.EncontrarPorProveedorYCodigo(
        data.providerId,
        data.providerCode
    );
    if (duplicate) {
        throw HttpError.conflict(
            `Ya existe una equivalencia para el proveedor ${data.providerId} con el código "${data.providerCode}"`
        );
    }

    return equivalenceRepository.create(data);
  },

  async update(id: number, data: UpdateEquivalenceInput) {
    const current = await this.getById(id); // 404 si no existe

    const nextProviderId = data.providerId ?? current.providerId;
    const nextProviderCode = data.providerCode ?? current.providerCode;

    if (data.providerId) {
      await assertProviderIsUsable(data.providerId);
    }
    if (data.localProductId) {
      await assertLocalProductIsUsable(data.localProductId);
    }

    // Si cambia proveedor o código, re-validar duplicados
    if (data.providerId || data.providerCode) {
      const duplicate = await equivalenceRepository.EncontrarPorProveedorYCodigo(
        nextProviderId,
        nextProviderCode
      );
      if (duplicate && duplicate.id !== id) {
        throw HttpError.conflict(
          `Ya existe una equivalencia para el proveedor ${nextProviderId} con el código "${nextProviderCode}"`
        );
      }
    }

    return equivalenceRepository.update(id, data);
  },

  async remove(id: number) {
    await this.getById(id); // 404 si no existe
    return equivalenceRepository.remove(id);
  },
};