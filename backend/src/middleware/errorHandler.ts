import { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      res.status(404).json({ error: "Record not found" });
      return;
    }
    if (err.code === "P2003") {
      res.status(400).json({ error: "Foreign key constraint failed" });
      return;
    }
  }

  if (err instanceof Error) {
    console.error(err);
    res.status(500).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
