import { Router } from "express";
import { handleCallWebhook } from "../controllers/calls.controller";

const router = Router();

router.post("/webhook", handleCallWebhook);

export default router;
