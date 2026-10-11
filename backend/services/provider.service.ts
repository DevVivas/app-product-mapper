import { HttpError } from "../middleware/HttpError";
import { providerRepository } from "../repositories/provider.repository";
import {
  CreateProviderInput,
  ProviderListQuery,
  UpdateProviderInput,
} from "../validators/provider.validator";
import { paginationMeta } from "./pagination.util";

export const providerService = {
  async list(params: ProviderListQuery) {
    const [total, data] = await providerRepository.listPaged(params);
    return { data, meta: paginationMeta(total, params.page, params.limit) };
  },

  async getById(id: number) {
    const provider = await providerRepository.obtenerPorId(id);
    if (!provider) throw HttpError.notFound(`Proveedor ${id} no encontrado`);
    return provider;
  },

  async create(data: CreateProviderInput) {
    const duplicate = await providerRepository.ObtenerPorNombre(data.name);
    if (duplicate) throw HttpError.conflict(`Ya existe el proveedor "${data.name}"`);
    return providerRepository.create(data);
  },

  async update(id: number, data: UpdateProviderInput) {
    await this.getById(id);
    if (data.name) {
      const duplicate = await providerRepository.ObtenerPorNombre(data.name);
      if (duplicate && duplicate.id !== id) {
        throw HttpError.conflict(`Ya existe el proveedor "${data.name}"`);
      }
    }
    return providerRepository.update(id, data);
  },

  async remove(id: number) {
    await this.getById(id);
    return providerRepository.remove(id);
  },
};
