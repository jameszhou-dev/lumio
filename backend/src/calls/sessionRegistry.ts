import { CallSession } from "./CallSession";

const registry = new Map<string, CallSession>();

export const sessionRegistry = {
  set(callControlId: string, session: CallSession): void {
    registry.set(callControlId, session);
  },

  get(callControlId: string): CallSession | undefined {
    return registry.get(callControlId);
  },

  delete(callControlId: string): void {
    registry.delete(callControlId);
  },
};
