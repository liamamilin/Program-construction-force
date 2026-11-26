import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/taskApi";
import type { TaskCreateInput } from "../schemas/taskSchema";

export function useTasks(status?: string) {
  return useQuery({
    queryKey: ["tasks", { status }],
    queryFn: () => taskApi.list(status),
    staleTime: 30_000,
  });
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks"] });

  return {
    createTask: useMutation({
      mutationFn: (input: TaskCreateInput) => taskApi.create(input),
      onSuccess: invalidate,
    }),
    assignTask: useMutation({
      mutationFn: ({ id, userId }: { id: number; userId: number }) => taskApi.assign(id, userId),
      onSuccess: invalidate,
    }),
    completeTask: useMutation({
      mutationFn: ({ id, assigneeId }: { id: number; assigneeId: number }) =>
        taskApi.complete(id, assigneeId),
      onSuccess: invalidate,
    }),
    approveTask: useMutation({
      mutationFn: (id: number) => taskApi.approve(id),
      onSuccess: invalidate,
    }),
  };
}
