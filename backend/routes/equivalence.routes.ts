import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { equivalenceService } from "../services/equivalence.service";
import { idParamSchema } from "../validators/common.validator";
import {
  createEquivalenceSchema,
  equivalenceListQuerySchema,
  updateEquivalenceSchema,
} from "../validators/equivalence.validator";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = equivalenceListQuerySchema.parse(req.query);
    res.json(await equivalenceService.list(query));
  })
);

router.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const { id } = idParamSchema.parse(req.params);
        res.json(await equivalenceService.getById(id));
    })
);

router.post(
    "/",
    asyncHandler(async (req, res) => {
        const data = createEquivalenceSchema.parse(req.body);
        res.status(201).json(await equivalenceService.create(data));
    })
);

router.put(
    "/:id",
    asyncHandler(async (req, res) => {
        const { id } = idParamSchema.parse(req.params);
        const data = updateEquivalenceSchema.parse(req.body);
        res.json(await equivalenceService.update(id, data));
    })
);

router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
        const { id } = idParamSchema.parse(req.params);
        await equivalenceService.remove(id);
        res.status(204).end();
    })
);

export default router;