/* ==========================================================================
   Part 3 交互实验：程序结构建模层（第 6–9 章，8 个实验）
   ========================================================================== */
(function (PCF) {
  "use strict";
  if (!PCF) return;
  const el = PCF.el;

  /* 11. ch6-spec-builder: 结构规格包完整性体检仪 */
  PCF.register("ch6-spec-builder", {
    badge: "第 6 章 · 交互实验 1",
    title: "结构规格包完整性体检仪",
    subtitle: "勾选五类结构与横向切面的覆盖状态，实时诊断规格包健康度与下游构造件选型风险。",
    render: function (root) {
      const items = [
        { k: "domain", name: "领域结构", detail: "对象卡片 / 字段 / 关系 / 生命周期", risk: "数据库表与 ORM 模型无依据，字段反复返工。" },
        { k: "inter", name: "交互结构", detail: "用户动作 / 系统事件 / 命令与查询", risk: "API 端点与前端按钮职责混乱。" },
        { k: "state", name: "状态结构", detail: "业务状态 / UI 状态 / 请求状态 / 转移表", risk: "前端状态库选型盲目，非法状态转移频发。" },
        { k: "bound", name: "边界结构", detail: "API / UI / DB / 外部服务契约", risk: "前后端联调频繁报 400/500，缺少统一错误格式。" },
        { k: "comp", name: "组合结构", detail: "组件树 / 后端分层模块 / 适配器", risk: "脚手架目录失控，代码全塞进单个巨石文件。" },
        { k: "slice", name: "约束与可靠性（横向切面）", detail: "校验 / 权限 / 重试 / 降级 / 测试", risk: "异常路径裸奔，外部服务抖动拖垮主流程。" },
      ];
      const st = { domain: true, inter: true, state: true, bound: false, comp: true, slice: false };

      function draw() {
        root.innerHTML = "";
        const cnt = items.filter(function (i) { return st[i.k]; }).length;
        const pct = Math.round((cnt / items.length) * 100);
        root.appendChild(el("div", { class: "pcf-row" }, items.map(function (i) {
          return el("button", {
            type: "button",
            class: "pcf-btn" + (st[i.k] ? " active" : ""),
            text: (st[i.k] ? "✓ " : "○ ") + i.name,
            onClick: function () { st[i.k] = !st[i.k]; draw(); },
          });
        })));
        root.appendChild(el("div", { class: "pcf-meter" }, [
          el("div", { class: "pcf-meter-fill", style: { width: pct + "%", background: pct === 100 ? "var(--pcf-emerald)" : "var(--pcf-amber)" } }),
        ]));
        const missing = items.filter(function (i) { return !st[i.k]; });
        const box = el("div", { class: "pcf-panel" }, [
          el("div", { class: "pcf-panel-title", text: "规格包完整度：" + pct + "%（" + cnt + "/6）" }),
        ]);
        if (!missing.length) {
          box.appendChild(el("div", { class: "pcf-log-item ok", text: "五类结构 + 一个横向切面全部齐备！可安全进入 Part 4 构造件选择阶段。" }));
        } else {
          missing.forEach(function (m) {
            box.appendChild(el("div", { class: "pcf-log-item err", style: { marginBottom: "0.3rem" }, text: "缺少【" + m.name + "】(" + m.detail + ") → " + m.risk }));
          });
        }
        root.appendChild(box);
      }
      draw();
    },
  });

  /* 12. ch6-expr-vs-struct: 局部表达 vs 整体结构对比器 */
  PCF.register("ch6-expr-vs-struct", {
    badge: "第 6 章 · 交互实验 2",
    tone: "cyan",
    title: "局部表达 vs 整体结构对比器",
    subtitle: "切换 4 个场景，对比支撑模块（程序表达单元）与核心层（程序结构建模）的本质差异。",
    render: function (root) {
      const cases = [
        {
          name: "筛选待分配任务",
          expr: "[t for t in tasks if t.status == 'open']",
          exprNote: "局部集合筛选表达：可出现在任何程序，不依赖业务上下文。",
          struct: "查询规格 ListTasks(status='open') + API 边界 GET /tasks?status=open + TanStack Query 缓存键 ['tasks', {status:'open'}]",
          structNote: "整体结构规格：跨领域、交互、边界与状态四层，直接指导构造件选型。",
        },
        {
          name: "校验标题非空",
          expr: "if not title: raise ValidationError()",
          exprNote: "局部验证表达：仅说明单条分支逻辑。",
          struct: "领域约束 Task.title(1-200必填) → 前端 Zod + RHF 校验 + 后端 Pydantic + 400 VALIDATION_ERROR 契约",
          structNote: "横向切面约束：同时约束前后端边界与领域模型。",
        },
        {
          name: "推进任务状态",
          expr: "task.status = 'in_progress'",
          exprNote: "局部状态变化表达：只是一次字段赋值。",
          struct: "状态转移 S01：open --(assign_task, Manager, assignee存在)--> in_progress + 通知 assignee",
          structNote: "状态结构 + 交互结构：定义了前置角色权限、合法路径与副作用反馈。",
        },
        {
          name: "异常重试",
          expr: "try: save() except DBError: retry()",
          exprNote: "局部失败恢复表达：仅捕获单个代码块异常。",
          struct: "可靠性切面：DB 写入重试 3 次指数退避，耗尽返回 500；通知服务失败降级记日志不阻断主流程",
          structNote: "系统级可靠性策略：区分关键路径与非关键路径的容错边界。",
        },
      ];
      let cur = 0;
      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, cases.map(function (c, i) {
          return el("button", { type: "button", class: "pcf-btn" + (i === cur ? " active" : ""), text: c.name, onClick: function () { cur = i; draw(); } });
        })));
        const c = cases[cur];
        root.appendChild(el("div", { class: "pcf-grid" }, [
          el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "Part 2 · 程序表达单元（局部）" }),
            el("pre", { class: "pcf-code", text: c.expr }),
            el("div", { class: "pcf-note", text: c.exprNote }),
          ]),
          el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "Part 3 · 程序结构规格（整体）" }),
            el("div", { style: { fontSize: "0.86rem", fontWeight: "600", marginBottom: "0.4rem" }, text: c.struct }),
            el("div", { class: "pcf-note", text: c.structNote }),
          ]),
        ]));
      }
      draw();
    },
  });

  /* 13. ch7-relation-cascade: 对象关系与删除级联模拟器 */
  PCF.register("ch7-relation-cascade", {
    badge: "第 7 章 · 交互实验 1",
    tone: "amber",
    title: "对象关系与删除级联策略模拟器（SET_NULL vs CASCADE）",
    subtitle: "模拟删除 User 或 Project 对象时，不同关系生命周期策略对关联 Task 数据的实时影响。",
    render: function (root) {
      const initialTasks = [
        { id: 1, title: "设计 API 契约", creator: "Alice", assignee: "Bob", project: "核心平台" },
        { id: 2, title: "搭建前端路由", creator: "Bob", assignee: "Bob", project: "核心平台" },
        { id: 3, title: "编写集成测试", creator: "Alice", assignee: "Carol", project: "运维自动化" },
      ];
      let tasks = initialTasks.map(function (t) { return Object.assign({}, t); });
      let lastEvent = "点击上方按钮模拟删除关联对象，观察 SET_NULL 与 CASCADE 的差异。";

      function delUserBob() {
        const next = [];
        let nulled = 0, cascaded = 0;
        tasks.forEach(function (t) {
          if (t.creator === "Bob") {
            cascaded++;
          } else {
            const copy = Object.assign({}, t);
            if (copy.assignee === "Bob") { copy.assignee = "NULL (待重新分配)"; nulled++; }
            next.push(copy);
          }
        });
        tasks = next;
        lastEvent = "删除 User(Bob)：按 creator(CASCADE) 级联删除 " + cascaded + " 条任务；按 assignee(SET_NULL) 置空负责人 " + nulled + " 条任务。";
        draw();
      }

      function delProjectCore() {
        const before = tasks.length;
        tasks = tasks.filter(function (t) { return t.project !== "核心平台"; });
        lastEvent = "删除 Project(核心平台)：按 Project→Task (1:0..N, CASCADE) 级联清理了 " + (before - tasks.length) + " 条任务。";
        draw();
      }

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("button", { type: "button", class: "pcf-btn danger", text: "删除 User: Bob", onClick: delUserBob }),
          el("button", { type: "button", class: "pcf-btn danger", text: "删除 Project: 核心平台", onClick: delProjectCore }),
          el("button", { type: "button", class: "pcf-btn", text: "恢复初始数据", onClick: function () { tasks = initialTasks.map(function (t) { return Object.assign({}, t); }); lastEvent = "已恢复初始 3 条任务记录。"; draw(); } }),
        ]));
        root.appendChild(el("div", { class: "pcf-log-item info", style: { marginBottom: "0.7rem" }, text: lastEvent }));
        const box = el("div", { class: "pcf-panel" }, [
          el("div", { class: "pcf-panel-title", text: "当前数据库中的 Task 记录（剩余 " + tasks.length + " 条）" }),
        ]);
        if (!tasks.length) {
          box.appendChild(el("div", { class: "pcf-note", text: "所有关联任务均已被级联删除。" }));
        } else {
          tasks.forEach(function (t) {
            box.appendChild(el("div", { class: "pcf-kv" }, [
              el("span", { text: "#" + t.id + " " + t.title + " [" + t.project + "]" }),
              el("span", { text: "creator=" + t.creator + " | assignee=" + t.assignee }),
            ]));
          });
        }
        root.appendChild(box);
      }
      draw();
    },
  });

  /* 14. ch7-card-playground: 领域对象卡片与字段约束校验器 */
  PCF.register("ch7-card-playground", {
    badge: "第 7 章 · 交互实验 2",
    title: "Task 领域对象卡片与字段约束实时校验器",
    subtitle: "编辑 Task 字段值，实时触发第 7 章定义的全部领域约束并查看结构化校验结果。",
    render: function (root) {
      const data = { title: "实现状态转移校验", priority: "high", due_date: "2026-12-31", creator_id: "1" };

      function draw() {
        root.innerHTML = "";
        const violations = [];
        if (!data.title.trim()) violations.push({ level: "err", msg: "Task.title 必填：标题不能为空（ValidationError）" });
        else if (data.title.length > 200) violations.push({ level: "err", msg: "Task.title 超长：不能超过 200 字符（当前 " + data.title.length + "）" });
        if (["low", "medium", "high", "urgent"].indexOf(data.priority) === -1) violations.push({ level: "err", msg: "Task.priority 非法枚举值" });
        if (!data.creator_id.trim()) violations.push({ level: "err", msg: "Task.creator_id 关系必填：每个任务必须归属创建者" });
        if (data.due_date && data.due_date < "2026-11-25") violations.push({ level: "warn", msg: "Task.due_date 早于今天（WARN 级提醒）" });

        const form = el("div", { class: "pcf-grid" }, [
          el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "title (1–200 字符，必填)" }),
            el("input", { class: "pcf-input", style: { width: "100%" }, value: data.title, onInput: function (e) { data.title = e.target.value; draw(); } }),
          ]),
          el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "priority (四选一枚举)" }),
            el("select", { class: "pcf-select", style: { width: "100%" }, onChange: function (e) { data.priority = e.target.value; draw(); } },
              ["low", "medium", "high", "urgent", "invalid_p0"].map(function (p) { return el("option", { value: p, selected: p === data.priority, text: p }); })),
          ]),
          el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "due_date (可选，不早于今天)" }),
            el("input", { type: "date", class: "pcf-input", style: { width: "100%" }, value: data.due_date, onChange: function (e) { data.due_date = e.target.value; draw(); } }),
          ]),
          el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "creator_id (必填外键)" }),
            el("input", { class: "pcf-input", style: { width: "100%" }, value: data.creator_id, onInput: function (e) { data.creator_id = e.target.value; draw(); } }),
          ]),
        ]);
        root.appendChild(form);

        const res = el("div", { class: "pcf-panel" }, [
          el("div", { class: "pcf-panel-title", text: "领域约束校验输出" }),
        ]);
        if (!violations.length) {
          res.appendChild(el("div", { class: "pcf-log-item ok", text: "✓ 全部领域约束通过！可安全生成 Task 对象（初始状态 status='open'）。" }));
        } else {
          violations.forEach(function (v) {
            res.appendChild(el("div", { class: "pcf-log-item " + v.level, style: { marginBottom: "0.3rem" }, text: v.msg }));
          });
        }
        root.appendChild(res);
      }
      draw();
    },
  });

  /* 15. ch8-state-machine: Task 生命周期状态机单步调试器 */
  PCF.register("ch8-state-machine", {
    badge: "第 8 章 · 交互实验 1",
    tone: "emerald",
    title: "Task 生命周期状态机单步调试器",
    subtitle: "切换当前操作角色并触发业务动作，实时校验状态转移表、权限前置条件与反馈通知。",
    render: function (root) {
      let status = "open";
      let role = "Manager";
      let retryCount = 0;
      const history = [{ tone: "info", text: "任务创建完成，初始业务状态为 open（待分配）。" }];

      const actions = [
        { k: "assign", label: "assign_task（分配）", needStatus: ["open"], needRole: ["Manager", "Admin"], to: "in_progress", fb: "通知 assignee 开始执行" },
        { k: "complete", label: "complete_task（提交完成）", needStatus: ["in_progress"], needRole: ["Member"], to: "pending_review", fb: "通知 Manager/creator 审核" },
        { k: "approve", label: "approve_task（审核通过）", needStatus: ["pending_review"], needRole: ["Manager", "Admin"], to: "done", fb: "通知 assignee + creator 任务完成" },
        { k: "reject", label: "reject_task（审核驳回）", needStatus: ["pending_review"], needRole: ["Manager", "Admin"], to: "in_progress", fb: "通知 assignee 附带驳回原因" },
        { k: "fail", label: "fail_task（标记失败）", needStatus: ["in_progress"], needRole: ["Member", "Manager", "Admin"], to: "failed", fb: "记录失败原因并写入观测日志" },
        { k: "retry", label: "retry_task（重试）", needStatus: ["failed"], needRole: ["Member", "Manager", "Admin"], to: "in_progress", fb: "重新进入执行队列" },
        { k: "cancel", label: "cancel_task（取消关闭）", needStatus: ["open", "in_progress", "failed"], needRole: ["Member", "Manager", "Admin"], to: "closed", fb: "任务关闭并归档" },
        { k: "reopen", label: "reopen_task（30天内重开）", needStatus: ["done", "closed"], needRole: ["Manager", "Admin"], to: "open", fb: "任务重开为 open" },
      ];

      function trigger(a) {
        if (a.needStatus.indexOf(status) === -1) {
          history.unshift({ tone: "err", text: "[409 StateError] 当前状态 " + status + " 不允许执行 " + a.k + "（要求：" + a.needStatus.join("/") + "）" });
        } else if (a.needRole.indexOf(role) === -1) {
          history.unshift({ tone: "err", text: "[403 PermissionError] 角色 " + role + " 无权执行 " + a.k + "（要求：" + a.needRole.join("/") + "）" });
        } else if (a.k === "retry" && retryCount >= 3) {
          history.unshift({ tone: "err", text: "[409 LimitError] retry_count 已达上限 3 次，禁止继续重试。" });
        } else {
          const prev = status;
          status = a.to;
          if (a.k === "retry") retryCount += 1;
          history.unshift({ tone: "ok", text: "[200 OK] " + role + " 执行 " + a.k + "：" + prev + " → " + status + " | 反馈：" + a.fb });
        }
        draw();
      }

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("span", { class: "pcf-pill info", text: "当前状态：" + status }),
          el("span", { class: "pcf-pill cyan", text: "已重试次数：" + retryCount + "/3" }),
          el("span", { style: { fontSize: "0.82rem", fontWeight: "600", marginLeft: "0.4rem" }, text: "操作角色：" }),
        ].concat(["Member", "Manager", "Admin"].map(function (r) {
          return el("button", { type: "button", class: "pcf-btn" + (role === r ? " active" : ""), text: r, onClick: function () { role = r; draw(); } });
        }))));

        root.appendChild(el("div", { class: "pcf-row" }, actions.map(function (a) {
          const legal = a.needStatus.indexOf(status) !== -1 && a.needRole.indexOf(role) !== -1;
          return el("button", {
            type: "button",
            class: "pcf-btn" + (legal ? " primary" : ""),
            text: a.label,
            onClick: function () { trigger(a); },
          });
        })));

        root.appendChild(el("div", { class: "pcf-log" }, history.slice(0, 6).map(function (h) {
          return el("div", { class: "pcf-log-item " + h.tone, text: h.text });
        })));
      }
      draw();
    },
  });

  /* 16. ch8-state-to-asset: 状态类型 → 前端构造件匹配器 */
  PCF.register("ch8-state-to-asset", {
    badge: "第 8 章 · 交互实验 2",
    title: "状态类型 → 前端构造件匹配器",
    subtitle: "选择真实前端交互场景，查看它的状态分类、存活范围与最合适的前端构造件。",
    render: function (root) {
      const items = [
        { q: "任务卡片上的“展开详情”开关", type: "UI 局部状态", scope: "单组件内存", asset: "React useState / useReducer", why: "无需跨页共享也不落库，用组件内置状态最轻。" },
        { q: "当前登录用户与主题偏好", type: "全局共享状态", scope: "跨页面客户端会话", asset: "Zustand / Redux Toolkit / Pinia", why: "导航栏、权限守卫、详情页均需订阅同一份状态。" },
        { q: "从后端拉取的任务列表与详情", type: "服务端数据状态", scope: "服务端真源 + 客户端缓存", asset: "TanStack Query / SWR", why: "天然需要 loading/error/stale 缓存同步与自动刷新。" },
        { q: "创建任务弹窗的输入值与校验错误", type: "表单交互状态", scope: "表单生命周期", asset: "React Hook Form + Zod", why: "管理脏值、聚焦、提交中状态与字段级错误。" },
        { q: "任务列表的分页页码与筛选条件", type: "路由/URL 状态", scope: "浏览器 URL 历史", asset: "React Router (useSearchParams)", why: "刷新不丢失，且支持复制链接分享筛选视图。" },
      ];
      let sel = 0;
      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, items.map(function (it, i) {
          return el("button", { type: "button", class: "pcf-btn" + (i === sel ? " active" : ""), text: it.q, onClick: function () { sel = i; draw(); } });
        })));
        const it = items[sel];
        root.appendChild(el("div", { class: "pcf-panel" }, [
          el("div", { class: "pcf-kv" }, [el("strong", { text: "状态类型" }), el("span", { class: "pcf-pill info", text: it.type })]),
          el("div", { class: "pcf-kv" }, [el("strong", { text: "生命周期范围" }), el("span", { text: it.scope })]),
          el("div", { class: "pcf-kv" }, [el("strong", { text: "承接构造件" }), el("span", { class: "pcf-pill ok", text: it.asset })]),
          el("div", { class: "pcf-note", text: "选型依据：" + it.why }),
        ]));
      }
      draw();
    },
  });

  /* 17. ch9-boundary-tracer: 请求穿越四类边界单步追踪器 */
  PCF.register("ch9-boundary-tracer", {
    badge: "第 9 章 · 交互实验 1",
    title: "POST /tasks 穿越四类边界单步追踪器",
    subtitle: "切换正常/异常输入情景，单步追踪请求经过 UI、API、数据存储与外部服务边界的契约检查。",
    render: function (root) {
      const scenarios = {
        ok: {
          label: "正常创建请求",
          steps: [
            { b: "1. UI 边界（React 表单 + Zod）", tone: "ok", msg: "字段预检通过：title='实现登录'，priority='high' → 序列化 JSON" },
            { b: "2. API 边界（FastAPI + Pydantic）", tone: "ok", msg: "JWT 鉴权通过，Schema 契约校验通过 → 路由至 TaskService.create()" },
            { b: "3. 数据边界（SQLAlchemy → PostgreSQL）", tone: "ok", msg: "INSERT INTO tasks 事务提交成功，生成 id=42, status='open'" },
            { b: "4. 外部服务边界（邮件通知适配器）", tone: "ok", msg: "异步触发邮件通知；返回 HTTP 201 + TaskResponse" },
          ],
        },
        badInput: {
          label: "异常：空标题提交",
          steps: [
            { b: "1. UI 边界", tone: "warn", msg: "若绕过前端直接调 API，请求直达后端入口。" },
            { b: "2. API 边界（Pydantic 拦截）", tone: "err", msg: "拦截！返回 HTTP 400 {error:'VALIDATION_ERROR', violations:[{field:'title'}]}" },
            { b: "3. 数据边界", tone: "info", msg: "未触达数据库——边界契约保护了存储层不受脏数据污染。" },
            { b: "4. 外部服务边界", tone: "info", msg: "未触发通知。" },
          ],
        },
        mailDown: {
          label: "异常：邮件服务超时",
          steps: [
            { b: "1. UI 边界", tone: "ok", msg: "表单数据合法，发出 POST /tasks。" },
            { b: "2. API 边界", tone: "ok", msg: "鉴权与 Schema 校验通过。" },
            { b: "3. 数据边界", tone: "ok", msg: "任务已安全持久化到 PostgreSQL（id=43）。" },
            { b: "4. 外部服务边界（降级策略生效）", tone: "warn", msg: "SMTP 超时 → 记录告警日志并降级跳过，不阻断主流程，仍返回 HTTP 201！" },
          ],
        },
      };
      let key = "ok";
      let step = 3;

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, Object.keys(scenarios).map(function (k) {
          return el("button", { type: "button", class: "pcf-btn" + (key === k ? " active" : ""), text: scenarios[k].label, onClick: function () { key = k; step = 0; draw(); } });
        }).concat([
          el("button", { type: "button", class: "pcf-btn primary", text: step < 3 ? "下一步追踪 →" : "重置步骤", onClick: function () { step = step < 3 ? step + 1 : 0; draw(); } }),
        ])));
        const list = scenarios[key].steps;
        root.appendChild(el("div", { class: "pcf-log", style: { maxHeight: "none" } }, list.map(function (s, i) {
          return el("div", {
            class: "pcf-log-item " + (i <= step ? s.tone : "info"),
            style: { opacity: i <= step ? "1" : "0.35" },
            text: s.b + " — " + s.msg,
          });
        })));
      }
      draw();
    },
  });

  /* 18. ch9-reliability-sim: 可靠性切面策略对比实验 */
  PCF.register("ch9-reliability-sim", {
    badge: "第 9 章 · 交互实验 2",
    tone: "rose",
    title: "可靠性切面策略对比（裸调 vs 重试 + 非关键路径降级）",
    subtitle: "调节数据库瞬时抖动率与外部邮件服务故障率，对比未加可靠性切面与完整切面的主流程可用率。",
    render: function (root) {
      let dbFail = 15;
      let mailFail = 35;
      let retries = 3;

      function draw() {
        root.innerHTML = "";
        const s1 = el("div", { class: "pcf-slider-wrap" }, [
          el("div", { class: "pcf-slider-label" }, [el("span", { text: "数据库瞬时抖动率" }), el("span", { text: dbFail + "%" })]),
          el("input", { type: "range", min: 0, max: 50, step: 5, value: dbFail, onInput: function (e) { dbFail = Number(e.target.value); draw(); } }),
        ]);
        const s2 = el("div", { class: "pcf-slider-wrap" }, [
          el("div", { class: "pcf-slider-label" }, [el("span", { text: "外部邮件服务故障率" }), el("span", { text: mailFail + "%" })]),
          el("input", { type: "range", min: 0, max: 80, step: 5, value: mailFail, onInput: function (e) { mailFail = Number(e.target.value); draw(); } }),
        ]);
        const s3 = el("div", { class: "pcf-slider-wrap" }, [
          el("div", { class: "pcf-slider-label" }, [el("span", { text: "DB 重试次数" }), el("span", { text: retries + " 次" })]),
          el("input", { type: "range", min: 1, max: 5, step: 1, value: retries, onInput: function (e) { retries = Number(e.target.value); draw(); } }),
        ]);
        root.appendChild(el("div", { class: "pcf-row" }, [s1, s2, s3]));

        const pDb = dbFail / 100;
        const pMail = mailFail / 100;
        const rawAvail = (1 - pDb) * (1 - pMail) * 100;
        const hardenedAvail = (1 - Math.pow(pDb, retries)) * 100;

        root.appendChild(el("div", { class: "pcf-grid" }, [
          el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "无可靠性切面（同步裸调）" }),
            el("div", { style: { fontSize: "1.45rem", fontWeight: "800", color: "var(--pcf-rose)" }, text: rawAvail.toFixed(1) + "%" }),
            el("div", { class: "pcf-meter" }, [el("div", { class: "pcf-meter-fill", style: { width: rawAvail + "%", background: "var(--pcf-rose)" } })]),
            el("div", { class: "pcf-note", text: "DB 抖动或邮件超时任意一项失败都会导致创建任务接口整体 500。" }),
          ]),
          el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "完整切面（DB 重试 " + retries + " 次 + 邮件降级）" }),
            el("div", { style: { fontSize: "1.45rem", fontWeight: "800", color: "var(--pcf-emerald)" }, text: hardenedAvail.toFixed(2) + "%" }),
            el("div", { class: "pcf-meter" }, [el("div", { class: "pcf-meter-fill", style: { width: hardenedAvail + "%", background: "var(--pcf-emerald)" } })]),
            el("div", { class: "pcf-note", text: "主流程可用率提升 +" + (hardenedAvail - rawAvail).toFixed(1) + " 个百分点；邮件故障仅降级记日志。" }),
          ]),
        ]));
      }
      draw();
    },
  });
})(window.PCFToys);
