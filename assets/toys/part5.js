/* ==========================================================================
   Part 5 交互实验：程序组装层（第 14–16 章，6 个实验）
   ========================================================================== */
(function (PCF) {
  "use strict";
  if (!PCF) return;
  const el = PCF.el;

  /* 27. ch14-transition-tester: 状态转移规则与权限边界测试台 */
  PCF.register("ch14-transition-tester", {
    badge: "第 14 章 · 交互实验 1",
    title: "validate_transition 状态转移与权限边界测试台",
    subtitle: "自由组合当前状态、目标状态与操作角色，实时运行自写状态机规则并查看 HTTP 响应码。",
    render: function (root) {
      const states = ["open", "in_progress", "pending_review", "done", "closed", "failed"];
      const allowed = {
        open: ["in_progress", "closed"],
        in_progress: ["pending_review", "failed", "closed"],
        pending_review: ["done", "in_progress"],
        done: ["closed", "open"],
        closed: ["open"],
        failed: ["in_progress", "closed"],
      };
      let cur = "open";
      let target = "in_progress";
      let role = "Manager";

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("select", { class: "pcf-select", onChange: function (e) { cur = e.target.value; draw(); } },
            states.map(function (s) { return el("option", { value: s, selected: s === cur, text: "当前：" + s }); })),
          el("span", { style: { fontWeight: "700" }, text: "→" }),
          el("select", { class: "pcf-select", onChange: function (e) { target = e.target.value; draw(); } },
            states.map(function (s) { return el("option", { value: s, selected: s === target, text: "目标：" + s }); })),
          el("select", { class: "pcf-select", onChange: function (e) { role = e.target.value; draw(); } },
            ["Member", "Manager", "Admin"].map(function (r) { return el("option", { value: r, selected: r === role, text: "角色：" + r }); })),
        ]));

        const validPath = (allowed[cur] || []).indexOf(target) !== -1;
        let code = 200, tone = "ok", msg = "validate_transition('" + cur + "', '" + target + "') 返回 True！状态已安全更新。";
        if (!validPath) {
          code = 409; tone = "err";
          msg = "抛出 StateError：不能从 " + cur + " 转移到 " + target + "（允许目标：" + (allowed[cur] || []).join(", ") + "）。";
        } else if ((cur === "open" && target === "in_progress" || cur === "pending_review" && target === "done") && role === "Member") {
          code = 403; tone = "warn";
          msg = "路径合法，但权限守卫拦截：分配与审核通过仅允许 Manager / Admin 执行。";
        }
        root.appendChild(el("div", { class: "pcf-panel" }, [
          el("span", { class: "pcf-pill " + tone, text: "HTTP " + code }),
          el("div", { style: { marginTop: "0.45rem", fontSize: "0.88rem" }, text: msg }),
        ]));
      }
      draw();
    },
  });

  /* 28. ch14-tripartite-board: 实现方案三分法决策台 */
  PCF.register("ch14-tripartite-board", {
    badge: "第 14 章 · 交互实验 2",
    tone: "cyan",
    title: "实现方案三分法（自写 / 构造件 / 脚手架）决策台",
    subtitle: "为 Task Manager 的 6 个核心元素分配实现方式，实时检验是否避免重复造轮子且守住业务边界。",
    render: function (root) {
      const items = [
        { k: "api", label: "HTTP API 入口与自动文档", best: "构造件", why: "FastAPI 天然承接路由、解析与 OpenAPI 文档。" },
        { k: "fsm", label: "任务状态转移规则与角色权限", best: "自写", why: "业务特异性强，无现成通用库可替代。" },
        { k: "orm", label: "数据库 CRUD 与外键关联", best: "构造件", why: "SQLAlchemy 承接数据访问结构，避免手拼 SQL。" },
        { k: "dir", label: "前端目录结构、TS 与热重载构建", best: "脚手架", why: "Vite + React TS 模板 1 分钟落地项目壳。" },
        { k: "cache", label: "前端列表缓存与 loading 状态", best: "构造件", why: "TanStack Query 专门承接服务端数据状态。" },
        { k: "svc", label: "TaskService 业务编排与领域约束", best: "自写", why: "系统核心价值所在，必须掌握在自写代码手中。" },
      ];
      const choices = { api: "构造件", fsm: "自写", orm: "构造件", dir: "脚手架", cache: "自写", svc: "自写" };
      const opts = ["自写", "构造件", "脚手架"];

      function draw() {
        root.innerHTML = "";
        let okCnt = 0;
        items.forEach(function (it) {
          const match = choices[it.k] === it.best;
          if (match) okCnt += 1;
          root.appendChild(el("div", { class: "pcf-kv", style: { alignItems: "center", flexWrap: "wrap" } }, [
            el("div", { style: { flex: "1", minWidth: "180px" } }, [
              el("strong", { text: it.label }),
              el("div", { class: "pcf-note", style: { marginTop: "0.15rem" }, text: match ? "✓ 合理：" + it.why : "⚠ 建议改为【" + it.best + "】：" + it.why }),
            ]),
            el("div", { class: "pcf-row", style: { marginBottom: 0 } }, opts.map(function (o) {
              return el("button", { type: "button", class: "pcf-btn" + (choices[it.k] === o ? " active" : ""), text: o, onClick: function () { choices[it.k] = o; draw(); } });
            })),
          ]));
        });
        root.appendChild(el("div", { class: "pcf-row", style: { marginTop: "0.65rem", marginBottom: 0 } }, [
          el("span", { class: "pcf-pill " + (okCnt === items.length ? "ok" : "warn"), text: "三分法匹配度：" + okCnt + " / " + items.length }),
        ]));
      }
      draw();
    },
  });

  /* 29. ch15-glue-xray: 六类胶水代码诊断仪 */
  PCF.register("ch15-glue-xray", {
    badge: "第 15 章 · 交互实验 1",
    tone: "amber",
    title: "六类胶水代码诊断仪",
    subtitle: "切换六类胶水代码，查看它在项目中的文件落点、核心代码片段与最小化原则。",
    render: function (root) {
      const glues = [
        { k: "配置胶水", loc: "app/config.py · main.py", code: "settings = Settings()\nengine = create_async_engine(settings.database_url)", tip: "集中在一个 Settings 类通过环境变量注入，禁止散落硬编码。" },
        { k: "路由胶水", loc: "app/main.py · src/routes/", code: "app.include_router(task_router, prefix='/api/tasks')", tip: "只做路径分发，绝不把业务规则塞进路由文件。" },
        { k: "依赖胶水", loc: "app/api/routers/", code: "def get_task_service() -> TaskService:\n    return TaskService(TaskRepository(session), notifier)", tip: "通过 Depends 注入依赖，让业务层与具体 DB 解耦且易于单测。" },
        { k: "数据转换胶水", loc: "app/api/schemas/", code: "return TaskResponse.model_validate(task, from_attributes=True)", tip: "隔离 ORM 内部模型与对外 JSON 契约，避免泄露敏感字段。" },
        { k: "适配器胶水", loc: "app/adapters/", code: "class NotificationService:\n    def notify_assignee(self, task): self.email_client.send(...)", tip: "把第三方 SDK 隔离在薄适配器后，更换服务商不影响业务层。" },
        { k: "错误处理胶水", loc: "app/repositories/", code: "except IntegrityError:\n    raise ValidationError('数据冲突')", tip: "把底层库异常翻译为上层业务语义，前端可稳定展示错误。" },
      ];
      let sel = 0;
      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, glues.map(function (g, i) {
          return el("button", { type: "button", class: "pcf-btn" + (i === sel ? " active" : ""), text: (i + 1) + ". " + g.k, onClick: function () { sel = i; draw(); } });
        })));
        const g = glues[sel];
        root.appendChild(el("div", { class: "pcf-panel" }, [
          el("div", { class: "pcf-kv" }, [el("strong", { text: "文件落点" }), el("span", { class: "pcf-pill info", text: g.loc })]),
          el("pre", { class: "pcf-code", text: g.code }),
          el("div", { class: "pcf-log-item ok", text: "最小化原则：" + g.tip }),
        ]));
      }
      draw();
    },
  });

  /* 30. ch15-glue-ratio-meter: 项目胶水代码占比健康度仪表盘 */
  PCF.register("ch15-glue-ratio-meter", {
    badge: "第 15 章 · 交互实验 2",
    title: "项目胶水代码占比健康度仪表盘",
    subtitle: "调节自写代码、构造件承接与胶水代码的比例，实时诊断系统是否出现“胶水膨胀”或“连接断裂”。",
    render: function (root) {
      let gluePct = 20;
      let customPct = 25;

      function draw() {
        root.innerHTML = "";
        const assetPct = Math.max(0, 100 - gluePct - customPct);
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("div", { class: "pcf-slider-wrap" }, [
            el("div", { class: "pcf-slider-label" }, [el("span", { text: "胶水代码占比" }), el("span", { text: gluePct + "%" })]),
            el("input", { type: "range", min: 0, max: 70, step: 5, value: gluePct, onInput: function (e) { gluePct = Number(e.target.value); if (gluePct + customPct > 100) customPct = 100 - gluePct; draw(); } }),
          ]),
          el("div", { class: "pcf-slider-wrap" }, [
            el("div", { class: "pcf-slider-label" }, [el("span", { text: "自写业务代码占比" }), el("span", { text: customPct + "%" })]),
            el("input", { type: "range", min: 5, max: 80, step: 5, value: customPct, onInput: function (e) { customPct = Number(e.target.value); if (gluePct + customPct > 100) gluePct = 100 - customPct; draw(); } }),
          ]),
        ]));

        let status, tone, advice;
        if (gluePct < 10) {
          status = "风险：胶水不足 / 边界耦合";
          tone = "warn";
          advice = "可能把 ORM 模型直接暴露给 API 或把逻辑写死在路由中，缺少必要的校验、转换与错误映射层。";
        } else if (gluePct <= 30 && customPct <= 40) {
          status = "健康：不多不少，各司其职";
          tone = "ok";
          advice = "构造件承接 " + assetPct + "% 通用结构，自写代码聚焦核心业务，胶水层薄且清晰。";
        } else if (gluePct > 45) {
          status = "告警：胶水膨胀（过度封装或选型不兼容）";
          tone = "err";
          advice = "超过近半代码都在做适配转换！检查是否对构造件做了无意义二次封装，或更换接口天然兼容的组合（如 FastAPI + Pydantic）。";
        } else {
          status = "提示：自写代码偏重，检查是否重复造轮子";
          tone = "warn";
          advice = "核查是否自己手写了表单状态、请求缓存或鉴权中间件等已有成熟构造件承接的结构。";
        }

        root.appendChild(el("div", { class: "pcf-panel" }, [
          el("div", { class: "pcf-row", style: { marginBottom: "0.45rem" } }, [
            el("span", { class: "pcf-pill " + tone, text: status }),
            el("span", { class: "pcf-pill cyan", text: "构造件承接：" + assetPct + "%" }),
          ]),
          el("div", { class: "pcf-note", text: advice }),
        ]));
      }
      draw();
    },
  });

  /* 31. ch16-mrs-runner: 最小可运行系统端到端冒烟模拟器 */
  PCF.register("ch16-mrs-runner", {
    badge: "第 16 章 · 交互实验 1",
    tone: "emerald",
    title: "最小可运行系统端到端验收模拟器（6 项标准）",
    subtitle: "模拟 docker compose up 启动三服务，并一键跑通核心业务路径与 4 类异常路径自动化测试。",
    render: function (root) {
      const checks = [
        { k: "boot", label: "① 启动：docker compose up（PostgreSQL + FastAPI + Vite）", log: "db:5432 healthy · backend:8000 /health 200 · frontend:5173 ready" },
        { k: "create", label: "② 输入与输出：POST /api/tasks 创建任务", log: "HTTP 201 → {id: 1, title: '实现登录功能', status: 'open'}" },
        { k: "flow", label: "③ 核心运行：assign → complete → approve 全链路", log: "open → in_progress → pending_review → done 全部 200 OK" },
        { k: "err", label: "④ 异常路径：400 空标题 / 403 越权 / 404 不存在 / 409 非法转移", log: "4 类异常契约全部按规范拦截并返回标准错误结构" },
        { k: "test", label: "⑤ 自动化测试：pytest + Vitest 套件执行", log: "pytest 12 passed · vitest 9 passed（耗时 1.8s）" },
        { k: "accept", label: "⑥ 六要素验收：回溯核验第 1 章全部需求场景", log: "问题/用户/动作/输入/输出/失败六要素 100% 闭环验证 ✓" },
      ];
      let doneCnt = 0;

      function runNext() {
        if (doneCnt < checks.length) doneCnt += 1;
        else doneCnt = 0;
        draw();
      }

      function draw() {
        root.innerHTML = "";
        const pct = Math.round((doneCnt / checks.length) * 100);
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("button", { type: "button", class: "pcf-btn primary", text: doneCnt < checks.length ? "执行下一项验收 (" + (doneCnt + 1) + "/6) →" : "重置验收", onClick: runNext }),
          el("button", { type: "button", class: "pcf-btn success", text: "一键跑完全部 6 项", onClick: function () { doneCnt = checks.length; draw(); } }),
          el("span", { class: "pcf-pill " + (doneCnt === checks.length ? "ok" : "info"), text: "验收进度：" + pct + "%" }),
        ]));
        root.appendChild(el("div", { class: "pcf-meter" }, [
          el("div", { class: "pcf-meter-fill", style: { width: pct + "%", background: doneCnt === checks.length ? "var(--pcf-emerald)" : "var(--pcf-accent)" } }),
        ]));
        root.appendChild(el("div", { class: "pcf-log", style: { maxHeight: "none" } }, checks.map(function (c, i) {
          const ok = i < doneCnt;
          return el("div", { class: "pcf-log-item " + (ok ? "ok" : "info"), style: { opacity: ok ? "1" : "0.48" }, text: (ok ? "✓ " : "○ ") + c.label + (ok ? " — " + c.log : "") });
        })));
      }
      draw();
    },
  });

  /* 32. ch16-five-layer-recap: 全书五层主构造链回收追踪器 */
  PCF.register("ch16-five-layer-recap", {
    badge: "第 16 章 · 交互实验 2",
    tone: "rose",
    title: "全书五层主构造链闭环回收追踪器",
    subtitle: "任选系统中的一项最终交付特性，反向追溯它在五个关键环节与支撑模块中的完整演进轨迹。",
    render: function (root) {
      const traces = [
        {
          name: "特性 A：标题必填与 200 字限制",
          l1: "需求场景（第 1–2 章）：输入规格 title 必填 1–200 字符；失败场景为空拒绝创建。",
          l2: "结构建模（第 6–9 章）：领域约束 Task.title + API/UI 边界输入契约 + 约束可靠性切面。",
          l3: "构造件选择（第 10–12 章）：前端 Zod + React Hook Form；后端 Pydantic Field(min_length=1, max_length=200)。",
          l4: "胶水与组装（第 14–15 章）：schemas/task_schema.py 数据转换胶水 + 400 VALIDATION_ERROR 映射。",
          l5: "最小系统验收（第 16 章）：提交空标题返回 400 并触发前端表单红字提示，pytest 异常测试通过。",
          sup: "支撑模块（第 3–5 章）：if + raise 验证表达单元。",
        },
        {
          name: "特性 B：任务审核闭环（pending_review → done）",
          l1: "需求场景（第 1–2 章）：Member 完成任务后由 Manager 审核；不能审核自己负责的任务。",
          l2: "结构建模（第 6–9 章）：Task 6 状态生命周期 + 交互动作 approve_task + 状态转移表 S03。",
          l3: "构造件选择（第 10–12 章）：SQLAlchemy Enum 持久化 + FastAPI Depends 角色守卫 + TanStack Query 刷新列表。",
          l4: "胶水与组装（第 14–15 章）：自写 validate_transition 与 TaskService.approve + 路由/依赖胶水。",
          l5: "最小系统验收（第 16 章）：PUT /api/tasks/1/approve 返回 200 done；Member 越权返回 403；端到端测试通过。",
          sup: "支撑模块（第 3–5 章）：条件/权限判断表达 + 状态变化表达。",
        },
        {
          name: "特性 C：通知失败降级不阻断主流程",
          l1: "需求场景（第 1–2 章）：失败场景明确“通知发送失败记录日志，不阻断创建/分配任务”。",
          l2: "结构建模（第 6–9 章）：外部服务边界（邮件）+ 约束与可靠性横向切面（降级策略）。",
          l3: "构造件选择（第 10–12 章）：Celery 异步任务队列（扩展）+ OpenTelemetry / logging 观测库。",
          l4: "胶水与组装（第 14–15 章）：adapters/NotificationService 适配器胶水 + try/except 降级分支。",
          l5: "最小系统验收（第 16 章）：邮件服务断开时创建任务仍返回 HTTP 201，错误日志完整记录。",
          sup: "支撑模块（第 3–5 章）：try/except 失败处理材料 + 反馈表达单元。",
        },
      ];
      let sel = 0;
      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, traces.map(function (t, i) {
          return el("button", { type: "button", class: "pcf-btn" + (i === sel ? " active" : ""), text: t.name, onClick: function () { sel = i; draw(); } });
        })));
        const t = traces[sel];
        root.appendChild(el("div", { class: "pcf-log", style: { maxHeight: "none" } }, [
          el("div", { class: "pcf-log-item info", text: t.l1 }),
          el("div", { class: "pcf-log-item info", text: t.l2 }),
          el("div", { class: "pcf-log-item ok", text: t.l3 }),
          el("div", { class: "pcf-log-item warn", text: t.l4 }),
          el("div", { class: "pcf-log-item ok", text: t.l5 }),
          el("div", { class: "pcf-log-item info", text: t.sup }),
        ]));
      }
      draw();
    },
  });
})(window.PCFToys);
