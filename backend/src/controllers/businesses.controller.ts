import { Request, Response, NextFunction } from "express";
import * as businessesService from "../services/businesses.service";
import { generateSystemPrompt } from "../services/systemPrompt.service";

export async function createBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const business = await businessesService.createBusiness(req.body);
    res.status(201).json(business);
  } catch (err) {
    next(err);
  }
}

export async function getBusiness(req: Request, res: Response, next: NextFunction) {
  try {
    const business = await businessesService.getBusinessById(req.params.id);
    res.json(business);
  } catch (err) {
    next(err);
  }
}

export async function getSystemPrompt(req: Request, res: Response, next: NextFunction) {
  try {
    const business = await businessesService.getBusinessById(req.params.id);
    const prompt = generateSystemPrompt(business);
    res.json({ systemPrompt: prompt });
  } catch (err) {
    next(err);
  }
}
