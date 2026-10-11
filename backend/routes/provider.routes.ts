import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { providerService } from "../services/provider.service";
import { idParamSchema } from "../validators/common.validator";
import {
  createProviderSchema,
  providerListQuerySchema,
  updateProviderSchema,
} from "../validators/provider.validator";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = providerListQuerySchema.parse(req.query);
    res.json(await providerService.list(query));
  })
);

router.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const { id } = idParamSchema.parse(req.params);
        res.json(await providerService.getById(id));
    })
);

router.post(
    "/",
    asyncHandler(async (req, res) => {
        const data = createProviderSchema.parse(req.body);
        res.status(201).json(await providerService.create(data));
    })
);

router.put(
    "/:id",
    asyncHandler(async (req, res) => {
        const { id } = idParamSchema.parse(req.params);
        const data = updateProviderSchema.parse(req.body);
        res.json(await providerService.update(id, data));
    })
);

router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
        const { id } = idParamSchema.parse(req.params);
        await providerService.remove(id);
        res.status(204).end();
    })
);

export default router;