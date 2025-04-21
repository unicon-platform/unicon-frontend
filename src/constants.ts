const env = import.meta.env;

export const REFETCH_ATTEMPTS_INTERVAL_MS = env.REFETCH_ATTEMPTS_INTERVAL_MS || 5000; // milliseconds
