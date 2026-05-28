import { Router, Request, Response } from "express";
import businessesRouter from "./businesses";
import callsRouter from "./calls";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/businesses", businessesRouter);
router.use("/calls", callsRouter);

export default router;
