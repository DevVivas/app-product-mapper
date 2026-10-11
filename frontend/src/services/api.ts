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
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
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
