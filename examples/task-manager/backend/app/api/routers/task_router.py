"""API 路由胶水与依赖注入胶水（FastAPI APIRouter）。"""

from __future__ import annotations

from collections.abc import Generator

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.schemas.task_schema import (
    AssignTaskRequest,
    CompleteTaskRequest,
    RejectTaskRequest,
    TaskCreateRequest,
    TaskListResponse,
    TaskResponse,
)
from app.config import SessionLocal
from app.repositories.task_repository import TaskRepository
from app.services.task_service import (
    Actor,
    DomainError,
    NotFoundError,
    PermissionDeniedError,
    StateError,
    TaskService,
)

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_task_service(db: Session = Depends(get_db)) -> TaskService:
    return TaskService(repo=TaskRepository(db))


def get_current_actor(
    x_user_id: int = Header(default=1, alias="X-User-Id"),
    x_user_role: str = Header(default="member", alias="X-User-Role"),
) -> Actor:
    """最小可运行演示鉴权依赖：生产环境替换为 JWT Bearer 验证。"""
    return Actor(user_id=x_user_id, role=x_user_role.lower())


def _handle_domain_error(exc: DomainError) -> HTTPException:
    if isinstance(exc, NotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    if isinstance(exc, PermissionDeniedError):
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    if isinstance(exc, StateError):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreateRequest,
    service: TaskService = Depends(get_task_service),
    actor: Actor = Depends(get_current_actor),
) -> TaskResponse:
    try:
        task = service.create(
            title=payload.title,
            description=payload.description,
            priority=payload.priority,
            due_date=payload.due_date,
            actor=actor,
        )
        return TaskResponse.model_validate(task)
    except DomainError as exc:
        raise _handle_domain_error(exc) from exc


@router.get("", response_model=TaskListResponse)
def list_tasks(
    status_filter: str | None = Query(default=None, alias="status"),
    priority: str | None = Query(default=None),
    service: TaskService = Depends(get_task_service),
) -> TaskListResponse:
    tasks = service.list(status=status_filter, priority=priority)
    return TaskListResponse(tasks=[TaskResponse.model_validate(t) for t in tasks])


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, service: TaskService = Depends(get_task_service)) -> TaskResponse:
    try:
        return TaskResponse.model_validate(service.get(task_id))
    except DomainError as exc:
        raise _handle_domain_error(exc) from exc


@router.put("/{task_id}/assign", response_model=TaskResponse)
def assign_task(
    task_id: int,
    payload: AssignTaskRequest,
    service: TaskService = Depends(get_task_service),
    actor: Actor = Depends(get_current_actor),
) -> TaskResponse:
    try:
        task = service.assign(task_id, payload.user_id, actor)
        return TaskResponse.model_validate(task)
    except DomainError as exc:
        raise _handle_domain_error(exc) from exc


@router.put("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    _payload: CompleteTaskRequest,
    service: TaskService = Depends(get_task_service),
    actor: Actor = Depends(get_current_actor),
) -> TaskResponse:
    try:
        task = service.complete(task_id, actor)
        return TaskResponse.model_validate(task)
    except DomainError as exc:
        raise _handle_domain_error(exc) from exc


@router.put("/{task_id}/approve", response_model=TaskResponse)
def approve_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
    actor: Actor = Depends(get_current_actor),
) -> TaskResponse:
    try:
        task = service.approve(task_id, actor)
        return TaskResponse.model_validate(task)
    except DomainError as exc:
        raise _handle_domain_error(exc) from exc


@router.put("/{task_id}/reject", response_model=TaskResponse)
def reject_task(
    task_id: int,
    payload: RejectTaskRequest,
    service: TaskService = Depends(get_task_service),
    actor: Actor = Depends(get_current_actor),
) -> TaskResponse:
    try:
        task = service.reject(task_id, payload.reason, actor)
        return TaskResponse.model_validate(task)
    except DomainError as exc:
        raise _handle_domain_error(exc) from exc


@router.put("/{task_id}/cancel", response_model=TaskResponse)
def cancel_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
    actor: Actor = Depends(get_current_actor),
) -> TaskResponse:
    try:
        task = service.cancel(task_id, actor)
        return TaskResponse.model_validate(task)
    except DomainError as exc:
        raise _handle_domain_error(exc) from exc
