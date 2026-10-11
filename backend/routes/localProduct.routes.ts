import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { localProductService } from "../services/localProduct.service";
import { idParamSchema } from "../validators/common.validator";
import {
  createLocalProductSchema,
  localProductListQuerySchema,
  updateLocalProductSchema,
} from "../validators/localProduct.validator";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = localProductListQuerySchema.parse(req.query);
    res.json(await localProductService.list(query));
  })
);

router.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const { id } = idParamSchema.parse(req.params);
        res.json(await localProductService.getById(id));
    })
);

router.post(
    "/",
    asyncHandler(async (req, res) => {
        const data = createLocalProductSchema.parse(req.body);
        res.status(201).json(await localProductService.create(data));
    })
);

router.put(
    "/:id",
    asyncHandler(async (req, res) => {
        const { id } = idParamSchema.parse(req.params);
        const data = updateLocalProductSchema.parse(req.body);
        res.json(await localProductService.update(id, data));
    })
);

router.delete(
  "/:id",
    asyncHandler(async (req, res) => {
        const { id } = idParamSchema.parse(req.params);
        await localProductService.remove(id);
        res.status(204).end();
    })
);

export default router;