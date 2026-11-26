"""核心自写业务层：领域规则、状态转移验证与角色权限守卫。"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from app.models.task import TaskModel, TaskStatus
from app.repositories.task_repository import TaskRepository

logger = logging.getLogger(__name__)


class DomainError(Exception):
    pass


class NotFoundError(DomainError):
    pass


class StateError(DomainError):
    pass


class PermissionDeniedError(DomainError):
    pass


ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    TaskStatus.OPEN.value: {TaskStatus.IN_PROGRESS.value, TaskStatus.CLOSED.value},
    TaskStatus.IN_PROGRESS.value: {
        TaskStatus.PENDING_REVIEW.value,
        TaskStatus.FAILED.value,
        TaskStatus.CLOSED.value,
    },
    TaskStatus.PENDING_REVIEW.value: {TaskStatus.DONE.value, TaskStatus.IN_PROGRESS.value},
    TaskStatus.DONE.value: {TaskStatus.CLOSED.value, TaskStatus.OPEN.value},
    TaskStatus.CLOSED.value: {TaskStatus.OPEN.value},
    TaskStatus.FAILED.value: {TaskStatus.IN_PROGRESS.value, TaskStatus.CLOSED.value},
}


def validate_transition(current: str, target: str) -> bool:
    """全书统一的状态转移矩阵校验（第 8、9、14 章）。"""
    if target not in ALLOWED_TRANSITIONS.get(current, set()):
        raise StateError(f"不能从 {current} 转移到 {target}")
    return True


@dataclass(frozen=True)
class Actor:
    user_id: int
    role: str  # member | manager | admin


class NotificationAdapter:
    """外部服务适配器胶水：通知失败时降级记日志，绝不阻断主流程。"""

    def send(self, user_id: int, message: str) -> None:
        try:
            logger.info("notify user_id=%s message=%s", user_id, message)
        except Exception as exc:  # pragma: no cover - defensive fallback
            logger.warning("notification degraded: %s", exc)


class TaskService:
    def __init__(self, repo: TaskRepository, notifier: NotificationAdapter | None = None) -> None:
        self.repo = repo
        self.notifier = notifier or NotificationAdapter()

    def create(
        self,
        *,
        title: str,
        description: str | None,
        priority: str,
        due_date: str | None,
        actor: Actor,
    ) -> TaskModel:
        clean_title = title.strip()
        if not clean_title or len(clean_title) > 200:
            raise DomainError("任务标题长度必须在 1-200 字符之间")

        task = self.repo.create(
            title=clean_title,
            description=description,
            priority=priority,
            due_date=due_date,
            status=TaskStatus.OPEN.value,
            creator_id=actor.user_id,
        )
        self.notifier.send(actor.user_id, f"已创建任务 #{task.id}: {task.title}")
        return task

    def get(self, task_id: int) -> TaskModel:
        task = self.repo.get(task_id)
        if not task:
            raise NotFoundError(f"任务 #{task_id} 不存在")
        return task

    def list(self, status: str | None = None, priority: str | None = None) -> list[TaskModel]:
        return self.repo.list(status=status, priority=priority)

    def assign(self, task_id: int, assignee_id: int, actor: Actor) -> TaskModel:
        if actor.role not in {"manager", "admin"}:
            raise PermissionDeniedError("只有 Manager 或 Admin 可以分配任务")
        task = self.get(task_id)
        validate_transition(task.status, TaskStatus.IN_PROGRESS.value)
        task.assignee_id = assignee_id
        task.status = TaskStatus.IN_PROGRESS.value
        saved = self.repo.save(task)
        self.notifier.send(assignee_id, f"您已被分配任务 #{saved.id}: {saved.title}")
        return saved

    def complete(self, task_id: int, actor: Actor) -> TaskModel:
        task = self.get(task_id)
        if task.assignee_id != actor.user_id:
            raise PermissionDeniedError("只有任务负责人可以提交完成")
        validate_transition(task.status, TaskStatus.PENDING_REVIEW.value)
        task.status = TaskStatus.PENDING_REVIEW.value
        saved = self.repo.save(task)
        self.notifier.send(saved.creator_id, f"任务 #{saved.id} 已提交待审核")
        return saved

    def approve(self, task_id: int, actor: Actor) -> TaskModel:
        if actor.role not in {"manager", "admin"}:
            raise PermissionDeniedError("只有 Manager 或 Admin 可以审核任务")
        task = self.get(task_id)
        if task.assignee_id == actor.user_id:
            raise PermissionDeniedError("不能审核自己负责的任务")
        validate_transition(task.status, TaskStatus.DONE.value)
        task.status = TaskStatus.DONE.value
        saved = self.repo.save(task)
        if saved.assignee_id:
            self.notifier.send(saved.assignee_id, f"任务 #{saved.id} 已审核通过")
        return saved

    def reject(self, task_id: int, reason: str, actor: Actor) -> TaskModel:
        if actor.role not in {"manager", "admin"}:
            raise PermissionDeniedError("只有 Manager 或 Admin 可以驳回任务")
        task = self.get(task_id)
        validate_transition(task.status, TaskStatus.IN_PROGRESS.value)
        task.status = TaskStatus.IN_PROGRESS.value
        saved = self.repo.save(task)
        if saved.assignee_id:
            self.notifier.send(saved.assignee_id, f"任务 #{saved.id} 被驳回：{reason}")
        return saved

    def cancel(self, task_id: int, actor: Actor) -> TaskModel:
        task = self.get(task_id)
        validate_transition(task.status, TaskStatus.CLOSED.value)
        task.status = TaskStatus.CLOSED.value
        return self.repo.save(task)
