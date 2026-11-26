import { describe, expect, it } from "vitest";
import { TaskCreateSchema } from "../schemas/taskSchema";

describe("TaskCreateSchema", () => {
  it("accepts valid task input", () => {
    const res = TaskCreateSchema.safeParse({ title: "完成状态机校验", priority: "high" });
    expect(res.success).toBe(true);
  });

  it("rejects empty title", () => {
    const res = TaskCreateSchema.safeParse({ title: "   ", priority: "high" });
    expect(res.success).toBe(false);
  });

  it("rejects invalid priority", () => {
    const res = TaskCreateSchema.safeParse({ title: "测试任务", priority: "p0" });
    expect(res.success).toBe(false);
  });
});
