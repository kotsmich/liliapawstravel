export const extractError = (error: unknown): string =>
  (error as any)?.error?.message ?? (error as any)?.message ?? 'Unknown error';
