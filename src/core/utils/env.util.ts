// Helper to parse numeric environment variables safely
export const parseNumericEnv = (
  value: string | undefined,
  defaultValue: number
): number => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper to parse boolean environment variables safely
export const parseBooleanEnv = (
  value: string | undefined,
  defaultValue: boolean
): boolean => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
};
