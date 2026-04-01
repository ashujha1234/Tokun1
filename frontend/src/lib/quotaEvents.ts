// src/lib/quotaEvents.ts
type QuotaListener = () => void;

const listeners = new Set<QuotaListener>();

export const quotaEvents = {
  on: (cb: QuotaListener) => listeners.add(cb),
  off: (cb: QuotaListener) => listeners.delete(cb),
  emit: () => listeners.forEach(cb => cb()),
};
