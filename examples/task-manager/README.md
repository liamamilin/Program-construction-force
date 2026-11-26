# Task Manager — 《程序构造力》贯穿案例最小可运行系统

本目录是《程序构造力》第 13–16 章与附录 G 对应的**最小可运行系统（Minimum Runnable System）**真实落地代码，完整演示“需求场景 → 结构建模 → 构造件选择 → 胶水代码连接 → 最小可运行系统”五层主构造链。

## 目录结构与分层对应

```text
examples/task-manager/
├── docker-compose.yml            # 一键启动 PostgreSQL + FastAPI + Vite 前端
├── backend/                      # FastAPI + Pydantic v2 + SQLAlchemy 2.0 + pytest
│   ├── app/
│   │   ├── config.py             # 配置胶水（pydantic-settings）
│   │   ├── main.py               # 入口装配 + 路由胶水 + /health
│   │   ├── models/task.py        # 领域对象 ORM 模型（含 6 状态枚举）
│   │   ├── api/schemas/          # 输入/输出边界契约（Pydantic v2）
│   │   ├── api/routers/          # 路由胶水 + 依赖注入 + 错误映射
│   │   ├── repositories/         # 数据访问边界 + 错误处理胶水
│   │   └── services/             # 核心自写业务（validate_transition + 权限守卫）
│   └── tests/
│       └── test_task_lifecycle.py # 核心链路与 400/403/404/409 异常路径验收测试
└── frontend/                     # Vite + React + TypeScript + Zod + TanStack Query
    └── src/
        ├── types/task.ts         # 领域类型定义
        ├── schemas/taskSchema.ts # 字段约束校验（Zod）
        ├── api/taskApi.ts        # API 边界客户端
        ├── hooks/useTasks.ts     # 服务端数据状态（TanStack Query）
        ├── components/TaskCard.tsx
        └── tests/taskSchema.test.ts
```

## 一键启动（Docker Compose）

```bash
cd examples/task-manager
docker compose up --build
```

- 前端页面：`http://localhost:5173`
- 后端 API 文档（Swagger UI）：`http://localhost:8000/docs`
- 健康检查：`http://localhost:8000/health`

## 本地运行后端与自动化测试

```bash
cd examples/task-manager/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 运行端到端生命周期与异常路径测试（默认使用内存 SQLite，零外部依赖）
pytest -v

# 启动开发服务器
uvicorn app.main:app --reload
```

## 本地运行前端与测试

```bash
cd examples/task-manager/frontend
npm install
npm test
npm run dev
```
