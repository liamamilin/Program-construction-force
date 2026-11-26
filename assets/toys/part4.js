/* ==========================================================================
   Part 4 交互实验：构造件层（第 10–13 章，8 个实验）
   ========================================================================== */
(function (PCF) {
  "use strict";
  if (!PCF) return;
  const el = PCF.el;

  /* 19. ch10-build-vs-buy: 自写 vs 构造件工程权衡计算器 */
  PCF.register("ch10-build-vs-buy", {
    badge: "第 10 章 · 交互实验 1",
    title: "自写代码 vs 构造件工程权衡计算器",
    subtitle: "调节需求的通用度、业务定制深度与交付紧迫度，实时计算推荐策略与边界分工。",
    render: function (root) {
      let generality = 75;
      let customDepth = 30;
      let urgency = 70;

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("div", { class: "pcf-slider-wrap" }, [
            el("div", { class: "pcf-slider-label" }, [el("span", { text: "结构通用度（越通用越适合构造件）" }), el("span", { text: generality + "%" })]),
            el("input", { type: "range", min: 0, max: 100, step: 5, value: generality, onInput: function (e) { generality = Number(e.target.value); draw(); } }),
          ]),
          el("div", { class: "pcf-slider-wrap" }, [
            el("div", { class: "pcf-slider-label" }, [el("span", { text: "业务特异性深度" }), el("span", { text: customDepth + "%" })]),
            el("input", { type: "range", min: 0, max: 100, step: 5, value: customDepth, onInput: function (e) { customDepth = Number(e.target.value); draw(); } }),
          ]),
          el("div", { class: "pcf-slider-wrap" }, [
            el("div", { class: "pcf-slider-label" }, [el("span", { text: "工期紧迫度" }), el("span", { text: urgency + "%" })]),
            el("input", { type: "range", min: 0, max: 100, step: 5, value: urgency, onInput: function (e) { urgency = Number(e.target.value); draw(); } }),
          ]),
        ]));

        const assetScore = Math.round(generality * 0.55 + (100 - customDepth) * 0.25 + urgency * 0.2);
        let verdict, tone, advice;
        if (assetScore >= 65) {
          verdict = "优先选用成熟构造件 + 薄胶水代码";
          tone = "ok";
          advice = "典型案例：API 入口（FastAPI）、ORM（SQLAlchemy）、组件库（MUI）、服务端缓存（TanStack Query）。";
        } else if (assetScore >= 42) {
          verdict = "构造件承接骨架 + 自写代码补齐业务缺口";
          tone = "warn";
          advice = "典型案例：React Hook Form 管表单状态 + 自写业务校验规则；MUI Card 承接外壳 + 自写 TaskCard。";
        } else {
          verdict = "核心逻辑坚持自写代码";
          tone = "info";
          advice = "典型案例：Task 状态转移机 validate_transition、角色权限规则与独特业务计费算法。";
        }

        root.appendChild(el("div", { class: "pcf-panel" }, [
          el("div", { class: "pcf-row", style: { marginBottom: "0.35rem" } }, [
            el("span", { class: "pcf-pill " + tone, text: verdict }),
            el("span", { class: "pcf-pill cyan", text: "构造件适配指数：" + assetScore + " / 100" }),
          ]),
          el("div", { class: "pcf-meter" }, [el("div", { class: "pcf-meter-fill", style: { width: assetScore + "%" } })]),
          el("div", { class: "pcf-note", text: advice }),
        ]));
      }
      draw();
    },
  });

  /* 20. ch10-six-step-wizard: 构造件选择六步动作链沙盒 */
  PCF.register("ch10-six-step-wizard", {
    badge: "第 10 章 · 交互实验 2",
    tone: "emerald",
    title: "构造件选择六步动作链沙盒",
    subtitle: "选择一个结构需求，单步走完从读取结构规格包到分配自写/胶水代码的完整六步决策。",
    render: function (root) {
      const tracks = {
        form: {
          name: "创建任务表单（前端）",
          steps: [
            "步骤 1 · 读规格：需要收集 title(必填1-200)、priority(4枚举)、due_date 并展示字段错误。",
            "步骤 2 · 标可复用：表单状态追踪与校验规则属于高度通用的前端模式。",
            "步骤 3 · 列候选：React Hook Form + Zod / Formik + Yup。",
            "步骤 4 · 验覆盖：RHF+Zod 覆盖字段注册、类型推导、提交防重与错误汇总。",
            "步骤 5 · 记缺口：MUI 的 Select/DatePicker 为受控组件，需 Controller 适配；中文错误文案需定制。",
            "步骤 6 · 分缺口：适配 MUI → 胶水代码（Controller）；错误文案与提交后跳转 → 胶水代码。",
          ],
        },
        state: {
          name: "任务状态转移（后端）",
          steps: [
            "步骤 1 · 读规格：6 个状态、8 条合法转移路径、不同角色权限限制。",
            "步骤 2 · 标可复用：状态持久化通用（ORM），但具体转移规则与权限属于业务特异。",
            "步骤 3 · 列候选：SQLAlchemy Enum 承接存储；状态规则无通用库可替代。",
            "步骤 4 · 验覆盖：SQLAlchemy 仅保证落库值在枚举内，无法拦截 open 直接跳 done。",
            "步骤 5 · 记缺口：合法转移矩阵、角色守卫与 409 状态冲突映射为显式缺口。",
            "步骤 6 · 分缺口：validate_transition 与权限检查 → 自写代码；409 响应映射 → 错误处理胶水。",
          ],
        },
      };
      let key = "form";
      let step = 0;

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("button", { type: "button", class: "pcf-btn" + (key === "form" ? " active" : ""), text: tracks.form.name, onClick: function () { key = "form"; step = 0; draw(); } }),
          el("button", { type: "button", class: "pcf-btn" + (key === "state" ? " active" : ""), text: tracks.state.name, onClick: function () { key = "state"; step = 0; draw(); } }),
          el("button", { type: "button", class: "pcf-btn primary", text: step < 5 ? "执行下一步 (" + (step + 2) + "/6) →" : "重新演示", onClick: function () { step = step < 5 ? step + 1 : 0; draw(); } }),
        ]));
        root.appendChild(el("div", { class: "pcf-log", style: { maxHeight: "none" } }, tracks[key].steps.map(function (s, i) {
          return el("div", {
            class: "pcf-log-item " + (i === step ? "ok" : "info"),
            style: { opacity: i <= step ? "1" : "0.35" },
            text: s,
          });
        })));
      }
      draw();
    },
  });

  /* 21. ch11-query-cache-sim: TanStack Query 缓存状态模拟器 */
  PCF.register("ch11-query-cache-sim", {
    badge: "第 11 章 · 交互实验 1",
    tone: "cyan",
    title: "TanStack Query 服务端数据状态模拟器",
    subtitle: "调节 staleTime 并模拟经过时间、组件重新挂载与 Mutation 写入，观察缓存状态与网络请求联动。",
    render: function (root) {
      let staleTime = 30;
      let age = 0;
      let reqCount = 1;
      let uiState = "loaded (fresh)";
      const logs = [{ tone: "ok", text: "t=0s：首次挂载 TaskList → 发起 GET /api/tasks，写入缓存（fresh）。" }];

      function advance(sec) {
        age += sec;
        const isStale = age >= staleTime;
        uiState = isStale ? "loaded (stale · 待后台刷新)" : "loaded (fresh · 命中缓存)";
        logs.unshift({ tone: isStale ? "warn" : "info", text: "t=" + age + "s：缓存已存活 " + age + "s（staleTime=" + staleTime + "s）→ 状态：" + (isStale ? "stale" : "fresh") });
        draw();
      }

      function remount() {
        if (age < staleTime) {
          logs.unshift({ tone: "ok", text: "页面切回 TaskList：缓存仍为 fresh（" + age + "s < " + staleTime + "s），0 次网络请求直接渲染！" });
        } else {
          reqCount += 1;
          age = 0;
          uiState = "loaded (fresh)";
          logs.unshift({ tone: "info", text: "页面切回 TaskList：缓存已 stale → 先秒显旧数据，后台静默发起第 " + reqCount + " 次请求刷新为 fresh。" });
        }
        draw();
      }

      function mutate() {
        reqCount += 1;
        age = 0;
        uiState = "loaded (fresh)";
        logs.unshift({ tone: "ok", text: "执行 createTask Mutation → invalidateQueries(['tasks']) 立即失效缓存并触发第 " + reqCount + " 次拉取。" });
        draw();
      }

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("div", { class: "pcf-slider-wrap" }, [
            el("div", { class: "pcf-slider-label" }, [el("span", { text: "staleTime 新鲜有效期" }), el("span", { text: staleTime + " 秒" })]),
            el("input", { type: "range", min: 10, max: 60, step: 10, value: staleTime, onInput: function (e) { staleTime = Number(e.target.value); draw(); } }),
          ]),
          el("span", { class: "pcf-pill " + (age < staleTime ? "ok" : "warn"), text: uiState }),
          el("span", { class: "pcf-pill info", text: "累计 API 请求：" + reqCount + " 次" }),
        ]));
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("button", { type: "button", class: "pcf-btn", text: "时间前进 +15s", onClick: function () { advance(15); } }),
          el("button", { type: "button", class: "pcf-btn primary", text: "切换回列表页 (Remount)", onClick: remount }),
          el("button", { type: "button", class: "pcf-btn success", text: "创建新任务 (Invalidate)", onClick: mutate }),
        ]));
        root.appendChild(el("div", { class: "pcf-log" }, logs.slice(0, 6).map(function (l) {
          return el("div", { class: "pcf-log-item " + l.tone, text: l.text });
        })));
      }
      draw();
    },
  });

  /* 22. ch11-frontend-mapper: 前端结构 → 构造件交互映射板 */
  PCF.register("ch11-frontend-mapper", {
    badge: "第 11 章 · 交互实验 2",
    title: "前端结构 → 构造件交互选型板",
    subtitle: "勾选你的项目具备的前端结构，自动生成对应构造件组合、npm 安装命令与胶水代码清单。",
    render: function (root) {
      const mods = [
        { k: "router", name: "多页面流转", pkg: "react-router-dom", asset: "React Router", glue: "routes/index.tsx + 路由守卫" },
        { k: "ui", name: "中后台 UI 组件", pkg: "@mui/material @emotion/react @emotion/styled", asset: "MUI", glue: "theme.ts 主题配置" },
        { k: "query", name: "服务端列表与缓存", pkg: "@tanstack/react-query", asset: "TanStack Query", glue: "QueryClientProvider + hooks/useTasks.ts" },
        { k: "store", name: "跨组件全局状态", pkg: "zustand", asset: "Zustand", glue: "stores/authStore.ts" },
        { k: "form", name: "表单与字段验证", pkg: "react-hook-form zod", asset: "React Hook Form + Zod", glue: "schemas/taskSchema.ts + Controller" },
        { k: "toast", name: "操作成功/失败反馈", pkg: "notistack", asset: "notistack", glue: "SnackbarProvider + 错误拦截提示" },
      ];
      const on = { router: true, ui: true, query: true, store: true, form: true, toast: false };

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, mods.map(function (m) {
          return el("button", { type: "button", class: "pcf-btn" + (on[m.k] ? " active" : ""), text: (on[m.k] ? "✓ " : "○ ") + m.name, onClick: function () { on[m.k] = !on[m.k]; draw(); } });
        })));
        const active = mods.filter(function (m) { return on[m.k]; });
        const cmd = active.length ? "npm install " + active.map(function (m) { return m.pkg; }).join(" ") : "# 请先勾选至少一类前端结构";
        root.appendChild(el("pre", { class: "pcf-code", text: cmd }));
        const box = el("div", { class: "pcf-panel" }, [
          el("div", { class: "pcf-panel-title", text: "对应构造件与胶水代码清单（已选 " + active.length + " 项）" }),
        ]);
        active.forEach(function (m) {
          box.appendChild(el("div", { class: "pcf-kv" }, [
            el("span", { text: m.name + " → " + m.asset }),
            el("span", { class: "pcf-pill info", text: m.glue }),
          ]));
        });
        root.appendChild(box);
      }
      draw();
    },
  });

  /* 23. ch12-cache-aside-sim: Redis Cache-Aside 命中与穿透模拟器 */
  PCF.register("ch12-cache-aside-sim", {
    badge: "第 12 章 · 交互实验 1",
    tone: "amber",
    title: "Redis Cache-Aside 缓存命中与回源模拟器",
    subtitle: "模拟读取任务详情与更新任务时的缓存命中、未命中回源 DB 与写入失效流程。",
    render: function (root) {
      let cachedVal = null;
      let dbVersion = 1;
      let hits = 0, misses = 0;
      const logs = [{ tone: "info", text: "初始状态：Redis 缓存为空，PostgreSQL 中 task:1 版本 v1。" }];

      function readTask() {
        if (cachedVal) {
          hits += 1;
          logs.unshift({ tone: "ok", text: "[HIT] GET task:1 命中 Redis（" + cachedVal + "），耗时 ~1ms，0 次数据库查询。" });
        } else {
          misses += 1;
          cachedVal = "v" + dbVersion;
          logs.unshift({ tone: "warn", text: "[MISS] Redis 未命中 → 回源查询 PostgreSQL 得 " + cachedVal + "（~18ms）→ SETEX task:1 300 写入缓存。" });
        }
        draw();
      }

      function updateTask() {
        dbVersion += 1;
        cachedVal = null;
        logs.unshift({ tone: "info", text: "[WRITE] PUT /tasks/1 更新数据库至 v" + dbVersion + " → DEL task:1 主动失效旧缓存，避免脏读。" });
        draw();
      }

      function expireCache() {
        cachedVal = null;
        logs.unshift({ tone: "warn", text: "[TTL] 300 秒过期：Redis 自动淘汰 task:1。" });
        draw();
      }

      function draw() {
        root.innerHTML = "";
        const total = hits + misses;
        const rate = total ? ((hits / total) * 100).toFixed(0) : "0";
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("span", { class: "pcf-pill " + (cachedVal ? "ok" : "warn"), text: "Redis: " + (cachedVal ? "task:1=" + cachedVal : "EMPTY") }),
          el("span", { class: "pcf-pill info", text: "DB 最新版本：v" + dbVersion }),
          el("span", { class: "pcf-pill cyan", text: "命中率：" + rate + "% (" + hits + "/" + total + ")" }),
        ]));
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("button", { type: "button", class: "pcf-btn primary", text: "读取 GET /tasks/1", onClick: readTask }),
          el("button", { type: "button", class: "pcf-btn success", text: "更新任务并失效缓存", onClick: updateTask }),
          el("button", { type: "button", class: "pcf-btn", text: "模拟 TTL 到期", onClick: expireCache }),
        ]));
        root.appendChild(el("div", { class: "pcf-log" }, logs.slice(0, 6).map(function (l) {
          return el("div", { class: "pcf-log-item " + l.tone, text: l.text });
        })));
      }
      draw();
    },
  });

  /* 24. ch12-backend-pipeline: 后端请求管道与构造件分工调试器 */
  PCF.register("ch12-backend-pipeline", {
    badge: "第 12 章 · 交互实验 2",
    title: "后端请求管道与构造件分工调试器",
    subtitle: "组合不同 Token 角色与请求体合法性，观察 FastAPI → Pydantic → Auth → Service → SQLAlchemy 的拦截点。",
    render: function (root) {
      let token = "manager";
      let payload = "valid";

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("select", { class: "pcf-select", onChange: function (e) { token = e.target.value; draw(); } }, [
            ["manager", "JWT 角色：Manager（有分配权限）"],
            ["member", "JWT 角色：Member（无分配权限）"],
            ["none", "无 Authorization Token"],
          ].map(function (o) { return el("option", { value: o[0], selected: o[0] === token, text: o[1] }); })),
          el("select", { class: "pcf-select", onChange: function (e) { payload = e.target.value; draw(); } }, [
            ["valid", "请求体合法：{user_id: 2}"],
            ["bad", "请求体非法：{user_id: 'abc'}"],
          ].map(function (o) { return el("option", { value: o[0], selected: o[0] === payload, text: o[1] }); })),
        ]));

        const steps = [];
        steps.push({ name: "1. FastAPI 路由入口", tone: "ok", text: "匹配 PUT /api/tasks/1/assign" });
        if (payload === "bad") {
          steps.push({ name: "2. Pydantic 输入验证", tone: "err", text: "拦截！user_id 必须为 int → 返回 HTTP 422 Validation Error" });
        } else {
          steps.push({ name: "2. Pydantic 输入验证", tone: "ok", text: "AssignRequest(user_id=2) 校验通过" });
          if (token === "none") {
            steps.push({ name: "3. Auth 依赖注入（HTTPBearer）", tone: "err", text: "拦截！缺少有效 JWT → 返回 HTTP 401 Unauthorized" });
          } else if (token === "member") {
            steps.push({ name: "3. Auth 权限守卫（require_role）", tone: "err", text: "拦截！Member 无权执行 assign_task → 返回 HTTP 403 Forbidden" });
          } else {
            steps.push({ name: "3. Auth 权限守卫", tone: "ok", text: "Manager 身份与角色校验通过" });
            steps.push({ name: "4. TaskService（自写业务）", tone: "ok", text: "校验状态 open → in_progress，写入 assignee_id=2" });
            steps.push({ name: "5. SQLAlchemy + OpenTelemetry", tone: "ok", text: "COMMIT 落库并记录 trace span → 返回 HTTP 200" });
          }
        }
        root.appendChild(el("div", { class: "pcf-log", style: { maxHeight: "none" } }, steps.map(function (s) {
          return el("div", { class: "pcf-log-item " + s.tone, text: s.name + "：" + s.text });
        })));
      }
      draw();
    },
  });

  /* 25. ch13-scaffold-explorer: 前后端脚手架目录结构透视器 */
  PCF.register("ch13-scaffold-explorer", {
    badge: "第 13 章 · 交互实验 1",
    title: "前后端脚手架目录结构透视器",
    subtitle: "切换前端（Vite + React）与后端（FastAPI）项目壳，点击任意目录查看承接的结构与构造件。",
    render: function (root) {
      const trees = {
        fe: [
          { path: "src/routes/", struct: "页面流转结构", asset: "React Router", desc: "集中声明 URL 与页面组件映射、嵌套布局与权限守卫。" },
          { path: "src/pages/", struct: "页面组合结构", asset: "React", desc: "TaskListPage / TaskDetailPage / CreateTaskPage 页面容器。" },
          { path: "src/components/", struct: "UI 展示与组件组合结构", asset: "React + MUI", desc: "Layout、TaskCard、StatusBadge 等可复用业务组件。" },
          { path: "src/hooks/", struct: "服务端数据状态结构", asset: "TanStack Query", desc: "封装 useTasks / useCreateTask 查询键与缓存失效策略。" },
          { path: "src/stores/", struct: "全局共享状态结构", asset: "Zustand", desc: "管理当前用户登录态 authStore 与全局 UI 状态。" },
          { path: "src/schemas/", struct: "字段约束结构", asset: "Zod", desc: "前后端一致的输入验证规则与 TypeScript 类型推导。" },
        ],
        be: [
          { path: "app/main.py", struct: "API 入口与装配点", asset: "FastAPI", desc: "配置胶水与路由胶水，统一注册各业务 Router 与中间件。" },
          { path: "app/api/routers/", struct: "API 边界结构", asset: "FastAPI APIRouter", desc: "解析 HTTP 请求、注入认证与服务依赖、返回统一响应。" },
          { path: "app/api/schemas/", struct: "输入输出契约结构", asset: "Pydantic v2", desc: "Request/Response 模型定义、字段校验与序列化。" },
          { path: "app/services/", struct: "领域规则与交互核心", asset: "自写业务逻辑", desc: "TaskService：状态转移校验、角色规则与业务编排。" },
          { path: "app/repositories/", struct: "数据访问边界", asset: "SQLAlchemy", desc: "封装 CRUD、事务提交与底层数据库异常映射。" },
          { path: "app/tests/", struct: "测试验证结构", asset: "pytest + httpx", desc: "核心路径与异常路径（400/403/404/409）自动化验收测试。" },
        ],
      };
      let side = "fe";
      let sel = 0;

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("button", { type: "button", class: "pcf-btn" + (side === "fe" ? " active" : ""), text: "前端脚手架（Vite + React）", onClick: function () { side = "fe"; sel = 0; draw(); } }),
          el("button", { type: "button", class: "pcf-btn" + (side === "be" ? " active" : ""), text: "后端脚手架（FastAPI）", onClick: function () { side = "be"; sel = 0; draw(); } }),
        ]));
        const list = trees[side];
        const cur = list[sel];
        root.appendChild(el("div", { class: "pcf-grid" }, [
          el("div", { class: "pcf-code", style: { margin: 0 } }, list.map(function (item, i) {
            return el("div", { class: "pcf-code-line" + (i === sel ? " hl" : ""), text: "📁 " + item.path, onClick: function () { sel = i; draw(); } });
          })),
          el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "目录职责透视：" + cur.path }),
            el("div", { class: "pcf-kv" }, [el("strong", { text: "承接结构" }), el("span", { class: "pcf-pill info", text: cur.struct })]),
            el("div", { class: "pcf-kv" }, [el("strong", { text: "核心构造件" }), el("span", { class: "pcf-pill ok", text: cur.asset })]),
            el("div", { class: "pcf-note", text: cur.desc }),
          ]),
        ]));
      }
      draw();
    },
  });

  /* 26. ch13-scaffold-chooser: 项目规模 → 脚手架选型器 */
  PCF.register("ch13-scaffold-chooser", {
    badge: "第 13 章 · 交互实验 2",
    tone: "emerald",
    title: "项目规模 → 脚手架选型推荐器",
    subtitle: "调节页面数量、API 数量与团队人数，评估最合适的前后端脚手架组合。",
    render: function (root) {
      let pages = 4;
      let apis = 8;
      let team = 3;

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("div", { class: "pcf-slider-wrap" }, [
            el("div", { class: "pcf-slider-label" }, [el("span", { text: "前端页面数" }), el("span", { text: pages + " 页" })]),
            el("input", { type: "range", min: 1, max: 20, step: 1, value: pages, onInput: function (e) { pages = Number(e.target.value); draw(); } }),
          ]),
          el("div", { class: "pcf-slider-wrap" }, [
            el("div", { class: "pcf-slider-label" }, [el("span", { text: "后端 API 端点数" }), el("span", { text: apis + " 个" })]),
            el("input", { type: "range", min: 2, max: 40, step: 2, value: apis, onInput: function (e) { apis = Number(e.target.value); draw(); } }),
          ]),
          el("div", { class: "pcf-slider-wrap" }, [
            el("div", { class: "pcf-slider-label" }, [el("span", { text: "协作人数" }), el("span", { text: team + " 人" })]),
            el("input", { type: "range", min: 1, max: 15, step: 1, value: team, onInput: function (e) { team = Number(e.target.value); draw(); } }),
          ]),
        ]));

        const complex = pages + apis * 0.6 + team * 2;
        let rec, cmd, note;
        if (complex < 14) {
          rec = "轻量单仓脚手架：Vite (React TS) + 单模块 FastAPI + SQLite";
          cmd = "npm create vite@latest web -- --template react-ts && fastapi dev main.py";
          note = "适合 MVP 与 1–2 人快速验证，1 分钟启动，避免过早引入微服务或复杂编排。";
        } else if (complex < 28) {
          rec = "标准前后端分离脚手架：Vite + React Router + FastAPI 分层模板 + Docker Compose";
          cmd = "docker compose up  # 前端 :5173 + FastAPI :8000 + PostgreSQL :5432";
          note = "与本书 Task Manager 一致：目录职责清晰、前后端可并行协作、自带测试配置。";
        } else {
          rec = "企业级全栈 / Monorepo 脚手架：Next.js / Turborepo + FastAPI + Alembic + Celery + CI";
          cmd = "pnpm create turbo@latest && docker compose --profile extended up";
          note = "适合多人中大型团队：强制目录约定、共享类型契约、独立异步任务与观测体系。";
        }

        root.appendChild(el("div", { class: "pcf-panel" }, [
          el("span", { class: "pcf-pill ok", text: rec }),
          el("pre", { class: "pcf-code", text: cmd }),
          el("div", { class: "pcf-note", text: note }),
        ]));
      }
      draw();
    },
  });
})(window.PCFToys);
