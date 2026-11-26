import { z } from "zod";

export const TaskCreateSchema = z.object({
  title: z.string().trim().min(1, "标题必填").max(200, "标题最长 200 字符"),
  description: z.string().max(2000, "描述最长 2000 字符").optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  due_date: z.string().optional(),
});

export type TaskCreateInput = z.infer<typeof TaskCreateSchema>;
