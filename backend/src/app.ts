import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import apiRouter from "./routes";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/", (_req, res) => res.redirect("/api/health"));

  app.use("/api", apiRouter);

  app.use(errorHandler);

  return app;
}
