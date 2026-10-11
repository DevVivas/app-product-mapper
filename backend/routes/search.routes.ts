import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { searchService } from "../services/search.service";
import { searchQuerySchema } from "../validators/search.validator";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, providerId, page, limit } = searchQuerySchema.parse(req.query);
    res.json(await searchService.search(q, providerId, page, limit));
  })
);

export default router;