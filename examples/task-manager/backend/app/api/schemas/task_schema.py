"""API 边界契约与数据转换胶水（Pydantic v2）。"""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


PriorityLiteral = Literal["low", "medium", "high", "urgent"]


class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    priority: PriorityLiteral = "medium"
    due_date: str | None = None


class AssignTaskRequest(BaseModel):
    user_id: int = Field(..., ge=1)


class CompleteTaskRequest(BaseModel):
    note: str | None = Field(default=None, max_length=1000)


class RejectTaskRequest(BaseModel):
    reason: str = Field(..., min_length=1, max_length=500)


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    priority: str
    status: str
    due_date: str | None
    creator_id: int
    assignee_id: int | None
    retry_count: int
    created_at: datetime
    updated_at: datetime


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
