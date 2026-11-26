import React, { useState } from "react";
import { TaskCreateSchema } from "./schemas/taskSchema";
import { useTaskMutations, useTasks } from "./hooks/useTasks";

export function App() {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("high");
  const [error, setError] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useTasks();
  const { createTask, assignTask, completeTask, approveTask } = useTaskMutations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = TaskCreateSchema.safeParse({ title, priority });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "输入不合法");
      return;
    }
    setError(null);
    await createTask.mutateAsync(parsed.data);
    setTitle("");
  };

  return (
    <main style={{ maxWidth: 760, margin: "2rem auto", fontFamily: "system-ui, sans-serif", padding: "0 1rem" }}>
      <h1>Task Manager（最小可运行系统）</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入任务标题（1–200 字符）"
          style={{ flex: 1, padding: "8px 10px" }}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </select>
        <button type="submit">创建任务</button>
      </form>
      {error && <p style={{ color: "#e11d48" }}>{error}</p>}
      {isLoading ? (
        <p>加载中...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
          {tasks.map((t) => (
            <li key={t.id} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: 12 }}>
              <strong>#{t.id} {t.title}</strong> [{t.priority}] — 状态：<code>{t.status}</code>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                {t.status === "open" && (
                  <button onClick={() => assignTask.mutate({ id: t.id, userId: 20 })}>分配给成员 #20</button>
                )}
                {t.status === "in_progress" && t.assignee_id && (
                  <button onClick={() => completeTask.mutate({ id: t.id, assigneeId: t.assignee_id! })}>提交完成</button>
                )}
                {t.status === "pending_review" && (
                  <button onClick={() => approveTask.mutate(t.id)}>审核通过</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
