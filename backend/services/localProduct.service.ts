import { HttpError } from "../middleware/HttpError";
import { localProductRepository } from "../repositories/localProduct.repository";
import {
  CreateLocalProductInput,
  LocalProductListQuery,
  UpdateLocalProductInput,
} from "../validators/localProduct.validator";
import { paginationMeta } from "./pagination.util";

export const localProductService = {
  async list(params: LocalProductListQuery) {
    const [total, data] = await localProductRepository.listPaged(params);
    return { data, meta: paginationMeta(total, params.page, params.limit) };
  },

  async getById(id: number) {
    const product = await localProductRepository.obtenerPorId(id);
    if (!product) throw HttpError.notFound(`Producto local ${id} no encontrado`);
    return product;
  },

  async create(data: CreateLocalProductInput) {
    const duplicate = await localProductRepository.obtenerPorCodigo(data.code);
    if (duplicate) throw HttpError.conflict(`Ya existe el producto local "${data.code}"`);
    return localProductRepository.create(data);
  },

  async update(id: number, data: UpdateLocalProductInput) {
    await this.getById(id);
    if (data.code) {
      const duplicate = await localProductRepository.obtenerPorCodigo(data.code);
      if (duplicate && duplicate.id !== id) {
        throw HttpError.conflict(`Ya existe el producto local "${data.code}"`);
      }
    }
    return localProductRepository.update(id, data);
  },

  async remove(id: number) {
    await this.getById(id);
    return localProductRepository.remove(id);
  },
};
