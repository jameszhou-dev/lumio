import { prisma } from "../lib/prisma";
import { CreateContextInput, UpdateContextInput } from "../schemas/context.schema";

export async function addContext(businessId: string, data: CreateContextInput) {
  return prisma.context.create({
    data: { ...data, businessId },
  });
}

export async function updateContext(
  businessId: string,
  contextId: string,
  data: UpdateContextInput
) {
  return prisma.context.update({
    where: { id: contextId, businessId },
    data,
  });
}

export async function deleteContext(businessId: string, contextId: string) {
  return prisma.context.delete({
    where: { id: contextId, businessId },
  });
}
