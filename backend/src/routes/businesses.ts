import { Router } from "express";
import { validate } from "../middleware/validate";
import { createBusinessSchema } from "../schemas/business.schema";
import { createContextSchema, updateContextSchema } from "../schemas/context.schema";
import * as businessesController from "../controllers/businesses.controller";
import * as contextsController from "../controllers/contexts.controller";

const router = Router();

router.post("/", validate(createBusinessSchema), businessesController.createBusiness);
router.get("/:id", businessesController.getBusiness);
router.get("/:id/system-prompt", businessesController.getSystemPrompt);
router.post("/:id/contexts", validate(createContextSchema), contextsController.addContext);
router.put("/:id/contexts/:contextId", validate(updateContextSchema), contextsController.updateContext);
router.delete("/:id/contexts/:contextId", contextsController.deleteContext);

export default router;
