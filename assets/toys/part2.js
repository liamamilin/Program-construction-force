/* ==========================================================================
   Part 2 交互实验：支撑模块（第 3–5 章，6 个实验）
   ========================================================================== */
(function (PCF) {
  "use strict";
  if (!PCF) return;
  const el = PCF.el;

  /* 5. ch3-layer-locator: 语法材料定位模拟 */
  PCF.register("ch3-layer-locator", {
    badge: "第 3 章 · 交互实验 1",
    title: "语法材料在主构造链中的定位模拟",
    subtitle: "选择一个业务功能，单步追踪它如何先经由需求、结构与构造件，最后才落到具体语法材料。",
    render: function (root) {
      const flows = {
        create: {
          label: "创建任务 (create_task)",
          steps: [
            { layer: "1. 需求场景", desc: "Member 填写标题、优先级并创建任务；标题为空拒绝。" },
            { layer: "2. 结构建模", desc: "Task 对象卡片、title 字段约束(1-200)、POST /tasks 边界。" },
            { layer: "3. 构造件选择", desc: "FastAPI 承接入口，Pydantic 承接校验，SQLAlchemy 承接落库。" },
            { layer: "4. 胶水与语法材料", desc: "def（抽象）+ if/raise（控制与失败）+ db.add（外部交互）+ return（调用）。" },
          ],
        },
        filter: {
          label: "筛选执行中任务",
          steps: [
            { layer: "1. 需求场景", desc: "Member 查看当前所有正在执行的任务列表。" },
            { layer: "2. 结构建模", desc: "查询动作 ListTasks(status=in_progress) + GET /tasks 边界。" },
            { layer: "3. 构造件选择", desc: "SQLAlchemy WHERE 查询 / TanStack Query 前端缓存。" },
            { layer: "4. 胶水与语法材料", desc: "for + if + list（数据与控制材料）实现局部集合筛选表达。" },
          ],
        },
      };
      let key = "create";
      let step = 0;

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("button", { type: "button", class: "pcf-btn" + (key === "create" ? " active" : ""), text: flows.create.label, onClick: function () { key = "create"; step = 0; draw(); } }),
          el("button", { type: "button", class: "pcf-btn" + (key === "filter" ? " active" : ""), text: flows.filter.label, onClick: function () { key = "filter"; step = 0; draw(); } }),
          el("button", { type: "button", class: "pcf-btn primary", text: step < 3 ? "推进下一层 →" : "重新演示", onClick: function () { step = step < 3 ? step + 1 : 0; draw(); } }),
        ]));

        const list = flows[key].steps;
        root.appendChild(el("div", { class: "pcf-grid" }, list.map(function (s, i) {
          const active = i <= step;
          return el("div", {
            class: "pcf-panel",
            style: {
              opacity: active ? "1" : "0.42",
              borderColor: i === step ? "var(--pcf-accent)" : undefined,
            },
          }, [
            el("div", { class: "pcf-panel-title", text: s.layer }),
            el("div", { style: { fontSize: "0.85rem" }, text: s.desc }),
          ]);
        })));
      }
      draw();
    },
  });

  /* 6. ch3-material-xray: 代码材料六类透视器 */
  PCF.register("ch3-material-xray", {
    badge: "第 3 章 · 交互实验 2",
    tone: "cyan",
    title: "代码材料六类透视器（材料视角 vs 表达视角）",
    subtitle: "切换六类代码材料滤镜，高亮对应代码行，直观看懂同一段代码的两个理解层次。",
    render: function (root) {
      const lines = [
        { code: "def get_active_tasks(tasks):", mat: "抽象材料", exp: "动作封装：命名一个查询操作" },
        { code: "    active = []", mat: "数据材料", exp: "结果容器：准备存放筛选结果" },
        { code: "    for task in tasks:", mat: "控制材料", exp: "遍历表达：逐一检查任务集合" },
        { code: "        if task.status == 'in_progress':", mat: "控制材料", exp: "条件筛选：匹配执行中状态" },
        { code: "            active.append(task)", mat: "调用材料", exp: "收集命中项到结果列表" },
        { code: "    if not active:", mat: "控制材料", exp: "边界判断：检测是否空集合" },
        { code: "        logging.info('no active tasks')", mat: "外部交互材料", exp: "观测反馈：写入运行日志" },
        { code: "    return active", mat: "调用材料", exp: "输出表达：将筛选子集返回调用方" },
      ];
      const filters = ["全部", "数据材料", "控制材料", "抽象材料", "调用材料", "外部交互材料"];
      let curFilter = "全部";
      let selected = 0;

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, filters.map(function (f) {
          return el("button", {
            type: "button",
            class: "pcf-btn" + (curFilter === f ? " active" : ""),
            text: f,
            onClick: function () { curFilter = f; draw(); },
          });
        })));

        const codeBox = el("div", { class: "pcf-code" }, lines.map(function (l, i) {
          const hit = curFilter === "全部" ? i === selected : l.mat === curFilter;
          return el("div", {
            class: "pcf-code-line" + (hit ? " hl" : ""),
            text: (i + 1) + "  " + l.code,
            onClick: function () { selected = i; curFilter = "全部"; draw(); },
          });
        }));
        root.appendChild(codeBox);

        const cur = lines[selected];
        root.appendChild(el("div", { class: "pcf-grid" }, [
          el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "材料视角（第 " + (selected + 1) + " 行）" }),
            el("span", { class: "pcf-pill info", text: cur.mat }),
            el("div", { class: "pcf-note", text: "只说明了计算机层面使用的语法构件，不含业务意图。" }),
          ]),
          el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "表达视角（局部程序语义）" }),
            el("span", { class: "pcf-pill ok", text: cur.exp }),
            el("div", { class: "pcf-note", text: "整段函数合起来表达：从任务集合中筛选状态为 in_progress 的任务。" }),
          ]),
        ]));
      }
      draw();
    },
  });

  /* 7. ch4-syntax-expression: 语法组合 → 程序表达翻译器 */
  PCF.register("ch4-syntax-expression", {
    badge: "第 4 章 · 交互实验 1",
    title: "语法组合 → 程序表达翻译器",
    subtitle: "选择不同的语法材料组合，实时查看它们合成的程序表达单元与 Python 范式代码。",
    render: function (root) {
      const combos = [
        { k: "for+if", label: "for + if", unit: "筛选（Filtering）", desc: "从集合中选出满足条件的子集。", code: "active = [t for t in tasks if t.status == 'in_progress']" },
        { k: "for+dict", label: "for + dict", unit: "映射（Mapping）", desc: "建立键到值的快速索引结构。", code: "task_by_id = {t.id: t for t in tasks}" },
        { k: "if+raise", label: "if + raise", unit: "验证（Validation）", desc: "在边界处拒绝非法输入或非法状态。", code: "if not title or len(title) > 200:\n    raise ValidationError('标题长度需在 1-200 字符之间')" },
        { k: "try+except", label: "try / except", unit: "失败处理（Failure Handling）", desc: "在外部依赖异常时保持程序可控。", code: "try:\n    repo.save(task)\nexcept DatabaseError as e:\n    log_error(e)" },
        { k: "class+fields", label: "class + fields", unit: "表示（Representation）", desc: "将现实业务事物映射为类型化数据结构。", code: "@dataclass\nclass Task:\n    id: int\n    title: str\n    status: str = 'open'" },
        { k: "status+if", label: "status + if", unit: "状态表达（State Expression）", desc: "依据对象当前阶段控制允许的操作。", code: "if task.status != 'open':\n    raise StateError('只能分配待分配任务')" },
      ];
      let cur = 0;

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, combos.map(function (c, i) {
          return el("button", {
            type: "button",
            class: "pcf-btn" + (i === cur ? " active" : ""),
            text: c.label,
            onClick: function () { cur = i; draw(); },
          });
        })));
        const item = combos[cur];
        root.appendChild(el("div", { class: "pcf-panel" }, [
          el("div", { class: "pcf-row", style: { marginBottom: "0.4rem" } }, [
            el("span", { class: "pcf-pill info", text: "语法组合：" + item.label }),
            el("span", { class: "pcf-pill ok", text: "程序表达：" + item.unit }),
          ]),
          el("div", { style: { fontSize: "0.88rem", marginBottom: "0.45rem" }, text: item.desc }),
          el("pre", { class: "pcf-code", text: item.code }),
        ]));
      }
      draw();
    },
  });

  /* 8. ch4-live-pipeline: 任务集合实时筛选与转换实验 */
  PCF.register("ch4-live-pipeline", {
    badge: "第 4 章 · 交互实验 2",
    tone: "emerald",
    title: "任务集合实时筛选与转换实验",
    subtitle: "调节筛选条件与转换字段，实时观察等价 Python 表达代码与输出结果集变化。",
    render: function (root) {
      const tasks = [
        { id: 101, title: "实现登录鉴权", status: "in_progress", priority: "high", assignee: "林敏" },
        { id: 102, title: "补齐单元测试", status: "open", priority: "medium", assignee: "未分配" },
        { id: 103, title: "修复数据库超时", status: "in_progress", priority: "urgent", assignee: "陈晨" },
        { id: 104, title: "整理 API 文档", status: "pending_review", priority: "low", assignee: "林敏" },
        { id: 105, title: "搭建 Docker Compose", status: "done", priority: "high", assignee: "陈晨" },
      ];
      let statusFilter = "in_progress";
      let priorityFilter = "all";
      let projectField = "title";

      function draw() {
        root.innerHTML = "";
        const sSel = el("select", { class: "pcf-select", onChange: function (e) { statusFilter = e.target.value; draw(); } }, [
          ["all", "全部状态"], ["open", "open"], ["in_progress", "in_progress"], ["pending_review", "pending_review"], ["done", "done"],
        ].map(function (o) { return el("option", { value: o[0], selected: o[0] === statusFilter, text: "状态：" + o[1] }); }));

        const pSel = el("select", { class: "pcf-select", onChange: function (e) { priorityFilter = e.target.value; draw(); } }, [
          ["all", "全部优先级"], ["urgent", "urgent"], ["high", "high"], ["medium", "medium"], ["low", "low"],
        ].map(function (o) { return el("option", { value: o[0], selected: o[0] === priorityFilter, text: "优先级：" + o[1] }); }));

        const fSel = el("select", { class: "pcf-select", onChange: function (e) { projectField = e.target.value; draw(); } }, [
          ["title", "仅标题 (t.title)"], ["pair", "ID+标题 ({t.id: t.title})"], ["full", "完整对象 (t)"],
        ].map(function (o) { return el("option", { value: o[0], selected: o[0] === projectField, text: "转换输出：" + o[1] }); }));

        root.appendChild(el("div", { class: "pcf-row" }, [sSel, pSel, fSel]));

        const matched = tasks.filter(function (t) {
          return (statusFilter === "all" || t.status === statusFilter) &&
            (priorityFilter === "all" || t.priority === priorityFilter);
        });

        const conds = [];
        if (statusFilter !== "all") conds.push("t.status == '" + statusFilter + "'");
        if (priorityFilter !== "all") conds.push("t.priority == '" + priorityFilter + "'");
        const where = conds.length ? " if " + conds.join(" and ") : "";
        const pyCode =
          projectField === "title"
            ? "result = [t.title for t in tasks" + where + "]"
            : projectField === "pair"
            ? "result = {t.id: t.title for t in tasks" + where + "}"
            : "result = [t for t in tasks" + where + "]";

        root.appendChild(el("pre", { class: "pcf-code", text: "# 等价程序表达：筛选 + 转换\n" + pyCode }));

        const outBox = el("div", { class: "pcf-panel" }, [
          el("div", { class: "pcf-panel-title", text: "实时输出（命中 " + matched.length + " / " + tasks.length + " 条）" }),
        ]);
        if (!matched.length) {
          outBox.appendChild(el("div", { class: "pcf-note", text: "空结果集 []" }));
        } else {
          matched.forEach(function (t) {
            const label = projectField === "title" ? t.title : projectField === "pair" ? t.id + ": " + t.title : "#" + t.id + " " + t.title + " [" + t.status + " · " + t.priority + " · " + t.assignee + "]";
            outBox.appendChild(el("span", { class: "pcf-pill ok", text: label }));
          });
        }
        root.appendChild(outBox);
      }
      draw();
    },
  });

  /* 9. ch5-retry-simulator: 失败与恢复表达单步模拟器 */
  PCF.register("ch5-retry-simulator", {
    badge: "第 5 章 · 交互实验 1",
    tone: "rose",
    title: "失败与恢复表达模拟器（try/except + 重试）",
    subtitle: "调节数据库单次成功概率与最大重试次数，观察失败、恢复与最终状态反馈的执行轨迹。",
    render: function (root) {
      let successRate = 45;
      let maxRetries = 3;
      let logs = [];

      function runOnce() {
        logs = [];
        let ok = false;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          const roll = Math.round(Math.random() * 100);
          if (roll <= successRate) {
            logs.push({ tone: "ok", text: "第 " + attempt + " 次尝试：数据库写入成功（随机数 " + roll + " ≤ " + successRate + "）→ 返回 TaskResponse(success=True)" });
            ok = true;
            break;
          } else {
            logs.push({ tone: "warn", text: "第 " + attempt + " 次尝试：捕获 DatabaseError（随机数 " + roll + " > " + successRate + "）" + (attempt < maxRetries ? " → 触发恢复重试" : "") });
          }
        }
        if (!ok) {
          logs.push({ tone: "err", text: "达到最大重试上限（" + maxRetries + " 次）：task.status = 'failed'，写入错误日志并返回 500。" });
        }
        draw();
      }

      function draw() {
        root.innerHTML = "";
        const s1 = el("div", { class: "pcf-slider-wrap" }, [
          el("div", { class: "pcf-slider-label" }, [el("span", { text: "单次 DB 写入成功率" }), el("span", { text: successRate + "%" })]),
          el("input", { type: "range", min: 10, max: 95, step: 5, value: successRate, onInput: function (e) { successRate = Number(e.target.value); draw(); } }),
        ]);
        const s2 = el("div", { class: "pcf-slider-wrap" }, [
          el("div", { class: "pcf-slider-label" }, [el("span", { text: "最大重试次数 MAX_RETRIES" }), el("span", { text: maxRetries + " 次" })]),
          el("input", { type: "range", min: 1, max: 5, step: 1, value: maxRetries, onInput: function (e) { maxRetries = Number(e.target.value); draw(); } }),
        ]);
        const theory = (1 - Math.pow(1 - successRate / 100, maxRetries)) * 100;
        root.appendChild(el("div", { class: "pcf-row" }, [s1, s2]));
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("button", { type: "button", class: "pcf-btn primary", text: "执行一次模拟", onClick: runOnce }),
          el("span", { class: "pcf-pill cyan", text: "理论总体成功率：" + theory.toFixed(1) + "%" }),
        ]));

        const logBox = el("div", { class: "pcf-log" });
        if (!logs.length) {
          logBox.appendChild(el("div", { class: "pcf-log-item info", text: "点击“执行一次模拟”观察 try/except 与重试恢复路径。" }));
        } else {
          logs.forEach(function (item) {
            logBox.appendChild(el("div", { class: "pcf-log-item " + item.tone, text: item.text }));
          });
        }
        root.appendChild(logBox);
      }
      draw();
    },
  });

  /* 10. ch5-unit-classifier: 五类表达单元解剖实验室 */
  PCF.register("ch5-unit-classifier", {
    badge: "第 5 章 · 交互实验 2",
    title: "五类表达单元解剖实验室（complete_task）",
    subtitle: "点击代码中任意一行，查看其所属表达大类、子单元名称与可替换语法形式。",
    render: function (root) {
      const rows = [
        { code: "task = get_task(request.task_id)", cat: "集合处理表达", unit: "查找（Lookup）", alt: "SQLAlchemy session.get() 或 dict.get()" },
        { code: "if task.status != 'in_progress':", cat: "判断与规则表达", unit: "条件（Condition）", alt: "状态机表查表校验" },
        { code: "    raise StateError('任务不在执行中')", cat: "判断与规则表达", unit: "验证（Validation）", alt: "返回 Result(success=False) 对象" },
        { code: "if task.assignee_id != user_id:", cat: "判断与规则表达", unit: "权限（Permission）", alt: "FastAPI Depends 权限守卫" },
        { code: "task.status = 'pending_review'", cat: "运行推进表达", unit: "状态变化（State Change）", alt: "task.transition_to(TaskStatus.PENDING_REVIEW)" },
        { code: "notify_creator(task)", cat: "失败与交付表达", unit: "反馈（Feedback）", alt: "Celery 异步任务队列派发通知" },
        { code: "return TaskResponse(success=True, task=task)", cat: "失败与交付表达", unit: "输出（Output）", alt: "Pydantic Response Schema 序列化" },
      ];
      let sel = 0;

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-code" }, rows.map(function (r, i) {
          return el("div", {
            class: "pcf-code-line" + (i === sel ? " hl" : ""),
            text: (i + 1) + "  " + r.code,
            onClick: function () { sel = i; draw(); },
          });
        })));
        const r = rows[sel];
        root.appendChild(el("div", { class: "pcf-panel" }, [
          el("div", { class: "pcf-kv" }, [el("strong", { text: "表达大类" }), el("span", { class: "pcf-pill info", text: r.cat })]),
          el("div", { class: "pcf-kv" }, [el("strong", { text: "表达子单元" }), el("span", { class: "pcf-pill ok", text: r.unit })]),
          el("div", { class: "pcf-kv" }, [el("strong", { text: "等价替换形式" }), el("span", { text: r.alt })]),
        ]));
      }
      draw();
    },
  });
})(window.PCFToys);
