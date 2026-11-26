import type { Task } from "../types/task";
import type { TaskCreateInput } from "../schemas/taskSchema";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": "1",
      "X-User-Role": "manager",
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const taskApi = {
  list: (status?: string) => {
    const qs = status ? `?${new URLSearchParams({ status }).toString()}` : "";
    return request<{ tasks: Task[] }>(`/api/tasks${qs}`).then((d) => d.tasks);
  },
  create: (input: TaskCreateInput) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) }),
  assign: (id: number, userId: number) =>
    request<Task>(`/api/tasks/${id}/assign`, { method: "PUT", body: JSON.stringify({ user_id: userId }) }),
  complete: (id: number, assigneeId: number) =>
    request<Task>(`/api/tasks/${id}/complete`, {
      method: "PUT",
      headers: { "X-User-Id": String(assigneeId), "X-User-Role": "member" },
      body: JSON.stringify({ note: "已完成" }),
    }),
  approve: (id: number) => request<Task>(`/api/tasks/${id}/approve`, { method: "PUT" }),
};
