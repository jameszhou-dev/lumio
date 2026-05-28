import { prisma } from "../lib/prisma";
import { CreateBusinessInput } from "../schemas/business.schema";

export async function createBusiness(data: CreateBusinessInput) {
  return prisma.business.create({ data });
}

export async function getBusinessById(id: string) {
  return prisma.business.findUniqueOrThrow({
    where: { id },
    include: { contexts: { orderBy: { createdAt: "asc" } } },
  });
}
