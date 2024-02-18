export const ENV: string = (_ENV ?? process?.env.NODE_ENV ?? 'production')?.toLowerCase();
export const DEV: boolean = (ENV === 'development');