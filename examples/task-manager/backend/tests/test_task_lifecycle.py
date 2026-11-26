"""第 16 章最小可运行系统端到端验收测试：核心业务链路 + 4 类异常路径。"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.routers.task_router import get_db
from app.main import app
from app.models.task import Base


@pytest.fixture()
def client() -> TestClient:
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    TestingSessionLocal = sessionmaker(bind=test_engine, autoflush=False, autocommit=False, expire_on_commit=False)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health_check(client: TestClient) -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_full_task_lifecycle(client: TestClient) -> None:
    # 1. Member 创建任务 -> open
    r1 = client.post(
        "/api/tasks",
        headers={"X-User-Id": "10", "X-User-Role": "member"},
        json={"title": "实现登录功能", "priority": "high"},
    )
    assert r1.status_code == 201
    task = r1.json()
    assert task["status"] == "open"
    task_id = task["id"]

    # 2. Manager 分配给 Member #20 -> in_progress
    r2 = client.put(
        f"/api/tasks/{task_id}/assign",
        headers={"X-User-Id": "1", "X-User-Role": "manager"},
        json={"user_id": 20},
    )
    assert r2.status_code == 200
    assert r2.json()["status"] == "in_progress"
    assert r2.json()["assignee_id"] == 20

    # 3. 负责人 Member #20 提交完成 -> pending_review
    r3 = client.put(
        f"/api/tasks/{task_id}/complete",
        headers={"X-User-Id": "20", "X-User-Role": "member"},
        json={"note": "已完成联调"},
    )
    assert r3.status_code == 200
    assert r3.json()["status"] == "pending_review"

    # 4. Manager #1 审核通过 -> done
    r4 = client.put(
        f"/api/tasks/{task_id}/approve",
        headers={"X-User-Id": "1", "X-User-Role": "manager"},
    )
    assert r4.status_code == 200
    assert r4.json()["status"] == "done"


def test_error_paths_422_403_404_409(client: TestClient) -> None:
    # 422: 空标题输入验证失败
    bad_input = client.post("/api/tasks", json={"title": "", "priority": "high"})
    assert bad_input.status_code == 422

    # 404: 查询不存在的任务
    not_found = client.get("/api/tasks/9999")
    assert not_found.status_code == 404

    # 创建正常任务用于权限与状态冲突验证
    created = client.post(
        "/api/tasks",
        headers={"X-User-Id": "10", "X-User-Role": "member"},
        json={"title": "补齐异常路径测试", "priority": "medium"},
    ).json()
    tid = created["id"]

    # 403: Member 越权分配任务
    forbidden = client.put(
        f"/api/tasks/{tid}/assign",
        headers={"X-User-Id": "10", "X-User-Role": "member"},
        json={"user_id": 20},
    )
    assert forbidden.status_code == 403

    # 409: 非法状态转移（open 直接 approve）
    conflict = client.put(
        f"/api/tasks/{tid}/approve",
        headers={"X-User-Id": "1", "X-User-Role": "manager"},
    )
    assert conflict.status_code == 409
