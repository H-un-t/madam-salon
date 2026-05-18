export function resolveApiBaseUrl(env = import.meta.env) {
  return env?.VITE_API_BASE_URL || '/api';
}
