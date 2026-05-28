import { Business, Context, ContextType } from "../generated/prisma/client";

type BusinessWithContexts = Business & { contexts: Context[] };

const TYPE_ORDER: ContextType[] = ["HOURS", "MENU", "POLICY", "FAQ", "CALENDAR", "OTHER"];

const TYPE_LABEL: Record<ContextType, string> = {
  HOURS: "Business Hours",
  MENU: "Menu",
  POLICY: "Policies",
  FAQ: "Frequently Asked Questions",
  CALENDAR: "Calendar & Events",
  OTHER: "Additional Information",
};

export function generateSystemPrompt(business: BusinessWithContexts): string {
  const lines: string[] = [];

  lines.push(`You are a voice assistant for ${business.name}.`);

  if (business.description) {
    lines.push(business.description);
  }

  if (business.phone) {
    lines.push(`Phone: ${business.phone}`);
  }

  lines.push("");
  lines.push("Use the following information to answer customer questions accurately and helpfully.");
  lines.push("");

  const grouped = new Map<ContextType, Context[]>();
  for (const ctx of business.contexts) {
    const existing = grouped.get(ctx.type) ?? [];
    existing.push(ctx);
    grouped.set(ctx.type, existing);
  }

  for (const type of TYPE_ORDER) {
    const items = grouped.get(type);
    if (!items || items.length === 0) continue;

    lines.push(`## ${TYPE_LABEL[type]}`);
    for (const item of items) {
      lines.push(item.content);
    }
    lines.push("");
  }

  lines.push("Keep your responses concise and conversational. If you don't know the answer, offer to take a message or direct the caller to call back during business hours.");

  return lines.join("\n").trim();
}
