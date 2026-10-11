import { Router } from "express";
import providerRoutes from "./provider.routes";
import localProductRoutes from "./localProduct.routes";
import equivalenceRoutes from "./equivalence.routes";
import searchRoutes from "./search.routes";

const router = Router();

router.use("/providers", providerRoutes);
router.use("/products", localProductRoutes);
router.use("/equivalences", equivalenceRoutes);
router.use("/search", searchRoutes);

export default router;