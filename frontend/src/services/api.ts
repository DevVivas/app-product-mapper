import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
interface ErrorResponse {
  error?: string;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!supabase) {
    throw new ApiError(503, "La autenticación de Supabase no está configurada");
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw new ApiError(401, "No se pudo recuperar la sesión");
  if (!data.session?.access_token) {
    throw new ApiError(401, "Inicia sesión para continuar");
  }

  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${data.session.access_token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = "Error de API";
    try {
      const data = (await response.json()) as ErrorResponse;
      message = data.error ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}
