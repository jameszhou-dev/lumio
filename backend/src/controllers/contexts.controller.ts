import { Request, Response, NextFunction } from "express";
import * as contextsService from "../services/contexts.service";

export async function addContext(req: Request, res: Response, next: NextFunction) {
  try {
    const context = await contextsService.addContext(req.params.id, req.body);
    res.status(201).json(context);
  } catch (err) {
    next(err);
  }
}

export async function updateContext(req: Request, res: Response, next: NextFunction) {
  try {
    const context = await contextsService.updateContext(
      req.params.id,
      req.params.contextId,
      req.body
    );
    res.json(context);
  } catch (err) {
    next(err);
  }
}

export async function deleteContext(req: Request, res: Response, next: NextFunction) {
  try {
    await contextsService.deleteContext(req.params.id, req.params.contextId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
