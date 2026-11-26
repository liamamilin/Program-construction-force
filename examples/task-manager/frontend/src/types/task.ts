export type TaskStatus =
  | "open"
  | "in_progress"
  | "pending_review"
  | "done"
  | "closed"
  | "failed";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  creator_id: number;
  assignee_id: number | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}
