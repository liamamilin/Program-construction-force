/* ==========================================================================
   Appendices 交互工具：附录 B 规格包生成器、附录 F 可导出验收台、附录 G AI 提示词组装器
   ========================================================================== */
(function (PCF) {
  "use strict";
  if (!PCF) return;
  const el = PCF.el;

  function downloadText(filename, text) {
    try {
      const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  /* 33. appb-spec-generator: 结构规格包在线填写与导出器 */
  PCF.register("appb-spec-generator", {
    badge: "附录 B · 交互工具",
    tone: "cyan",
    title: "结构规格包在线填写与 Markdown 导出器",
    subtitle: "按五层主构造链填写你的项目核心规格（自动保存至本地浏览器），支持一键导出完整 Markdown 文档。",
    render: function (root) {
      const KEY = "pcf_appb_spec_v1";
      const sample = {
        projectName: "Task Manager（任务管理系统）",
        problem: "团队任务散落在口头和 IM 中，经常遗漏或重复，缺少统一追踪。",
        roles: "Member（创建/完成）, Manager（分配/审核）, Admin（管理用户）",
        objects: "Task(id, title, status, priority, due_date, assignee_id, creator_id)\nUser(id, name, email, role)\nProject(id, name, owner_id)",
        states: "open -> in_progress -> pending_review -> done -> closed; in_progress -> failed -> in_progress",
        boundaries: "POST /api/tasks, PUT /api/tasks/{id}/assign, PUT /api/tasks/{id}/complete, PUT /api/tasks/{id}/approve",
        constraints: "title 1-200 必填; priority 4 枚举; 仅负责人可完成; 不可审核自己任务; DB 写入重试 3 次; 通知失败降级记日志",
        assets: "前端: Vite + React + MUI + React Router + TanStack Query + Zustand + RHF + Zod\n后端: FastAPI + Pydantic v2 + SQLAlchemy + PostgreSQL + pytest",
      };

      function loadState() {
        try {
          const raw = localStorage.getItem(KEY);
          if (raw) return Object.assign({}, sample, JSON.parse(raw));
        } catch (_) {}
        return Object.assign({}, sample);
      }

      let data = loadState();
      let copiedMsg = "";

      function save() {
        try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {}
      }

      function buildMarkdown() {
        return [
          "# " + (data.projectName || "未命名项目") + " — 程序结构规格包",
          "",
          "## 1. 需求场景（Demand Scenario）",
          "- **核心问题**：" + data.problem,
          "- **用户角色**：" + data.roles,
          "",
          "## 2. 领域结构（Domain Structure）",
          "```text",
          data.objects,
          "```",
          "",
          "## 3. 状态结构（State Structure）",
          "- **状态转移路径**：`" + data.states + "`",
          "",
          "## 4. 边界结构（Boundary Structure）",
          "- **核心 API 边界**：" + data.boundaries,
          "",
          "## 5. 约束与可靠性切面（Constraint & Reliability Slice）",
          "- " + data.constraints,
          "",
          "## 6. 构造件选择（Construction Assets）",
          "```text",
          data.assets,
          "```",
        ].join("\n");
      }

      function draw() {
        root.innerHTML = "";
        const fields = [
          { k: "projectName", label: "项目名称", multi: false },
          { k: "problem", label: "1. 核心问题（一句话）", multi: false },
          { k: "roles", label: "2. 用户角色与职责", multi: false },
          { k: "objects", label: "3. 领域对象卡片（每行一个对象）", multi: true },
          { k: "states", label: "4. 核心状态转移路径", multi: false },
          { k: "boundaries", label: "5. 核心 API 边界清单", multi: false },
          { k: "constraints", label: "6. 约束与可靠性切面要求", multi: true },
          { k: "assets", label: "7. 选中前后端构造件", multi: true },
        ];

        const grid = el("div", { class: "pcf-grid" });
        fields.forEach(function (f) {
          const ctrl = f.multi
            ? el("textarea", {
                class: "pcf-input",
                rows: 3,
                style: { width: "100%", resize: "vertical" },
                onInput: function (e) { data[f.k] = e.target.value; save(); preview.textContent = buildMarkdown(); },
              }, data[f.k])
            : el("input", {
                class: "pcf-input",
                style: { width: "100%" },
                value: data[f.k],
                onInput: function (e) { data[f.k] = e.target.value; save(); preview.textContent = buildMarkdown(); },
              });
          grid.appendChild(el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: f.label }),
            ctrl,
          ]));
        });
        root.appendChild(grid);

        const preview = el("pre", { class: "pcf-code", style: { maxHeight: "220px", overflowY: "auto" }, text: buildMarkdown() });
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("button", {
            type: "button",
            class: "pcf-btn primary",
            text: "复制 Markdown 规格包",
            onClick: function () {
              const md = buildMarkdown();
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(md);
              }
              copiedMsg = "已复制完整结构规格包 Markdown！";
              draw();
            },
          }),
          el("button", {
            type: "button",
            class: "pcf-btn success",
            text: "下载 .md 文件",
            onClick: function () {
              downloadText("structure-spec-package.md", buildMarkdown());
              copiedMsg = "已触发下载 structure-spec-package.md";
              draw();
            },
          }),
          el("button", {
            type: "button",
            class: "pcf-btn",
            text: "清空为空白模板",
            onClick: function () {
              Object.keys(data).forEach(function (k) { data[k] = ""; });
              save(); copiedMsg = "已清空为空白模板。"; draw();
            },
          }),
          el("button", {
            type: "button",
            class: "pcf-btn",
            text: "载入 Task Manager 示例",
            onClick: function () {
              data = Object.assign({}, sample);
              save(); copiedMsg = "已载入 Task Manager 示例。"; draw();
            },
          }),
          copiedMsg ? el("span", { class: "pcf-pill ok", text: copiedMsg }) : null,
        ]));
        root.appendChild(preview);
      }
      draw();
    },
  });

  /* 34. appf-mrs-checklist: 最小可运行系统可持久化交互验收台 */
  PCF.register("appf-mrs-checklist", {
    badge: "附录 F · 交互验收台",
    tone: "emerald",
    title: "最小可运行系统交互验收检查表（自动保存 + 导出报告）",
    subtitle: "逐项勾选你的系统验收进度，实时统计各维度达标率，并支持一键导出 Markdown 验收报告。",
    render: function (root) {
      const KEY = "pcf_appf_checklist_v1";
      const groups = [
        {
          name: "启动检查",
          items: [
            "系统可通过单条命令一键启动（docker compose up）",
            "前端页面可访问且无控制台致命报错",
            "后端 /health 健康检查返回 200",
            "数据库连接正常，表结构初始化完成",
          ],
        },
        {
          name: "核心业务路径",
          items: [
            "POST /api/tasks 创建任务返回 201 且初始状态为 open",
            "PUT /api/tasks/{id}/assign 分配任务进入 in_progress",
            "PUT /api/tasks/{id}/complete 提交完成进入 pending_review",
            "PUT /api/tasks/{id}/approve 审核通过进入 done",
          ],
        },
        {
          name: "异常路径与安全",
          items: [
            "空标题或非法枚举返回 400/422 标准验证错误",
            "不存在的任务或用户返回 404",
            "非法状态转移（如 open 直接 done）返回 409",
            "越权操作（如 Member 审核任务）返回 403",
          ],
        },
        {
          name: "测试与交付文档",
          items: [
            "后端 pytest 核心与异常路径测试全部通过",
            "前端 Vitest 校验与组件测试全部通过",
            "OpenAPI (/docs) 可正常访问并调试",
            "README 启动命令与环境变量说明完整",
          ],
        },
      ];

      function loadChecked() {
        try {
          const raw = localStorage.getItem(KEY);
          if (raw) return JSON.parse(raw);
        } catch (_) {}
        return {};
      }
      let checked = loadChecked();
      let statusMsg = "";

      function save() {
        try { localStorage.setItem(KEY, JSON.stringify(checked)); } catch (_) {}
      }

      function allKeys() {
        const res = [];
        groups.forEach(function (g, gi) {
          g.items.forEach(function (_, ii) { res.push(gi + "-" + ii); });
        });
        return res;
      }

      function buildReport() {
        const keys = allKeys();
        const done = keys.filter(function (k) { return !!checked[k]; }).length;
        const lines = [
          "# 最小可运行系统验收报告",
          "",
          "- **总验收进度**：" + done + " / " + keys.length + "（" + Math.round((done / keys.length) * 100) + "%）",
          "",
        ];
        groups.forEach(function (g, gi) {
          lines.push("## " + g.name);
          g.items.forEach(function (text, ii) {
            const mark = checked[gi + "-" + ii] ? "x" : " ";
            lines.push("- [" + mark + "] " + text);
          });
          lines.push("");
        });
        return lines.join("\n");
      }

      function draw() {
        root.innerHTML = "";
        const keys = allKeys();
        const done = keys.filter(function (k) { return !!checked[k]; }).length;
        const pct = Math.round((done / keys.length) * 100);

        root.appendChild(el("div", { class: "pcf-row" }, [
          el("span", { class: "pcf-pill " + (pct === 100 ? "ok" : "info"), text: "总验收进度：" + done + " / " + keys.length + " (" + pct + "%)" }),
          el("button", { type: "button", class: "pcf-btn primary", text: "全部勾选（模拟通过）", onClick: function () { keys.forEach(function (k) { checked[k] = true; }); save(); statusMsg = "已全部标记通过！"; draw(); } }),
          el("button", { type: "button", class: "pcf-btn", text: "清空勾选", onClick: function () { checked = {}; save(); statusMsg = "已重置验收项。"; draw(); } }),
          el("button", { type: "button", class: "pcf-btn success", text: "导出 Markdown 验收报告", onClick: function () { downloadText("mrs-acceptance-report.md", buildReport()); statusMsg = "已下载 mrs-acceptance-report.md"; draw(); } }),
          statusMsg ? el("span", { class: "pcf-pill ok", text: statusMsg }) : null,
        ]));

        root.appendChild(el("div", { class: "pcf-meter" }, [
          el("div", { class: "pcf-meter-fill", style: { width: pct + "%", background: pct === 100 ? "var(--pcf-emerald)" : "var(--pcf-accent)" } }),
        ]));

        const grid = el("div", { class: "pcf-grid" });
        groups.forEach(function (g, gi) {
          const gDone = g.items.filter(function (_, ii) { return !!checked[gi + "-" + ii]; }).length;
          const panel = el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: g.name + "（" + gDone + "/" + g.items.length + "）" }),
          ]);
          g.items.forEach(function (text, ii) {
            const key = gi + "-" + ii;
            const isOn = !!checked[key];
            panel.appendChild(el("label", {
              style: { display: "flex", alignItems: "flex-start", gap: "0.45rem", fontSize: "0.84rem", marginBottom: "0.42rem", cursor: "pointer" },
            }, [
              el("input", {
                type: "checkbox",
                checked: isOn,
                style: { marginTop: "0.22rem" },
                onChange: function (e) { checked[key] = e.target.checked; save(); statusMsg = ""; draw(); },
              }),
              el("span", { style: { textDecoration: isOn ? "line-through" : "none", opacity: isOn ? "0.7" : "1" }, text: text }),
            ]));
          });
          grid.appendChild(panel);
        });
        root.appendChild(grid);
      }
      draw();
    },
  });

  /* 35. appg-ai-prompt-composer: 结构规格包 → AI 工程提示词组装器 */
  PCF.register("appg-ai-prompt-composer", {
    badge: "附录 G · AI 工程实验",
    tone: "amber",
    title: "结构规格包 → AI 编程指令组装器",
    subtitle: "勾选要交给 AI 编程工具的上下文规格与验收门禁，实时合成低幻觉、可直接执行的工程 Prompt。",
    render: function (root) {
      const opts = [
        { k: "domain", label: "附带领域对象卡片与字段约束", snippet: "## 领域结构\n- Task(id, title[1..200必填], status[open|in_progress|pending_review|done|closed|failed], priority[low|medium|high|urgent], assignee_id?, creator_id必填)" },
        { k: "fsm", label: "附带严格状态转移矩阵", snippet: "## 状态转移约束（禁止私自简化）\n- open -> in_progress (Manager assign) | closed\n- in_progress -> pending_review (assignee complete) | failed | closed\n- pending_review -> done (Manager approve) | in_progress (reject)" },
        { k: "assets", label: "锁定前后端构造件版本与分层", snippet: "## 构造件与分层约定\n- 后端：FastAPI + Pydantic v2(model_validate) + SQLAlchemy 2.0 + pytest\n- 分层：routers/ -> services/ -> repositories/ -> models/，禁止在 router 中写业务规则" },
        { k: "tests", label: "强制先写核心与 4 类异常验收测试", snippet: "## 验收门禁（必须全部通过）\n- 编写 pytest 测试覆盖：正常全链路(201/200) + 空标题(422/400) + 越权(403) + 不存在(404) + 非法转移(409)" },
      ];
      const on = { domain: true, fsm: true, assets: true, tests: true };
      let copied = false;

      function buildPrompt() {
        const blocks = [
          "请根据以下《程序构造力》结构规格包，生成 Task Manager 的最小可运行后端模块。",
          "严格遵守给定边界与状态机，不得省略异常分支或替换既定构造件：",
          "",
        ];
        opts.forEach(function (o) {
          if (on[o.k]) { blocks.push(o.snippet); blocks.push(""); }
        });
        if (blocks.length === 3) {
          blocks.push("（⚠ 未勾选任何结构规格！直接让 AI 自由发挥将产生高度不可控的猜测代码。）");
        }
        return blocks.join("\n").trim();
      }

      function draw() {
        root.innerHTML = "";
        const cnt = opts.filter(function (o) { return on[o.k]; }).length;
        const risk = cnt === 4 ? { t: "低幻觉风险 · 规格与验收门禁完备", cls: "ok" } : cnt >= 2 ? { t: "中等风险 · 建议补齐状态机与测试门禁", cls: "warn" } : { t: "高幻觉风险 · 缺少结构约束", cls: "err" };

        root.appendChild(el("div", { class: "pcf-row" }, opts.map(function (o) {
          return el("button", { type: "button", class: "pcf-btn" + (on[o.k] ? " active" : ""), text: (on[o.k] ? "✓ " : "○ ") + o.label, onClick: function () { on[o.k] = !on[o.k]; copied = false; draw(); } });
        })));
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("span", { class: "pcf-pill " + risk.cls, text: risk.t }),
          el("button", {
            type: "button",
            class: "pcf-btn primary",
            text: copied ? "✓ 已复制指令" : "复制 AI 工程指令",
            onClick: function () {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(buildPrompt());
              }
              copied = true; draw();
            },
          }),
        ]));
        root.appendChild(el("pre", { class: "pcf-code", text: buildPrompt() }));
      }
      draw();
    },
  });
})(window.PCFToys);
