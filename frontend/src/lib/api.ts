import type { List } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

function buildUrl(path: string): string {
  if (!API_BASE) {
    return path;
  }

  return `${API_BASE}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function createList(name: string): Promise<List> {
  const data = await request<{ list: List }>("/api/lists", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  return data.list;
}

export async function fetchList(listId: string): Promise<List> {
  const data = await request<{ list: List }>(`/api/lists/${listId}`);
  return data.list;
}

export async function deleteList(listId: string): Promise<void> {
  await request(`/api/lists/${listId}`, { method: "DELETE" });
}
