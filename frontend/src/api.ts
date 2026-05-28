const BASE = "/api";

export type ContextType = "MENU" | "HOURS" | "FAQ" | "CALENDAR" | "POLICY" | "OTHER";

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: T;
  const text = await res.text();
  try {
    data = JSON.parse(text) as T;
  } catch {
    data = text as unknown as T;
  }

  return { ok: res.ok, status: res.status, data };
}

export const api = {
  health: () => request("GET", "/health"),

  createBusiness: (body: { name: string; description?: string; phone?: string }) =>
    request("POST", "/businesses", body),

  getBusiness: (id: string) => request("GET", `/businesses/${id}`),

  addContext: (
    businessId: string,
    body: { type: ContextType; content: string; metadata?: Record<string, unknown> }
  ) => request("POST", `/businesses/${businessId}/contexts`, body),

  updateContext: (
    businessId: string,
    contextId: string,
    body: { type?: ContextType; content?: string; metadata?: Record<string, unknown> }
  ) => request("PUT", `/businesses/${businessId}/contexts/${contextId}`, body),

  deleteContext: (businessId: string, contextId: string) =>
    request("DELETE", `/businesses/${businessId}/contexts/${contextId}`),

  getSystemPrompt: (businessId: string) =>
    request("GET", `/businesses/${businessId}/system-prompt`),
};
