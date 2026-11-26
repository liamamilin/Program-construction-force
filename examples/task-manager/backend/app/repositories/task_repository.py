"""数据访问边界与错误处理胶水（SQLAlchemy Repository）。"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.orm import Session

from app.models.task import TaskModel


class RepositoryError(Exception):
    """底层存储异常映射到业务层的统一基类。"""


class DataConflictError(RepositoryError):
    pass


class DatabaseUnavailableError(RepositoryError):
    pass


class TaskRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, **kwargs) -> TaskModel:
        try:
            task = TaskModel(**kwargs)
            self.db.add(task)
            self.db.commit()
            self.db.refresh(task)
            return task
        except IntegrityError as exc:
            self.db.rollback()
            raise DataConflictError("任务数据冲突") from exc
        except OperationalError as exc:
            self.db.rollback()
            raise DatabaseUnavailableError("数据库暂时不可用") from exc

    def get(self, task_id: int) -> TaskModel | None:
        return self.db.get(TaskModel, task_id)

    def list(self, status: str | None = None, priority: str | None = None) -> list[TaskModel]:
        stmt = select(TaskModel).order_by(TaskModel.id.desc())
        if status:
            stmt = stmt.where(TaskModel.status == status)
        if priority:
            stmt = stmt.where(TaskModel.priority == priority)
        return list(self.db.scalars(stmt).all())

    def save(self, task: TaskModel) -> TaskModel:
        try:
            self.db.add(task)
            self.db.commit()
            self.db.refresh(task)
            return task
        except OperationalError as exc:
            self.db.rollback()
            raise DatabaseUnavailableError("数据库写入失败") from exc
