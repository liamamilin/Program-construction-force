/* ==========================================================================
   Part 1 交互实验：需求场景层（第 1–2 章，4 个实验）
   ========================================================================== */
(function (PCF) {
  "use strict";
  if (!PCF) return;
  const el = PCF.el;

  /* 1. ch1-req-vs-tech: 需求语言 vs 技术方案分拣器 */
  PCF.register("ch1-req-vs-tech", {
    badge: "第 1 章 · 交互实验 1",
    title: "需求语言 vs 技术方案分拣器",
    subtitle: "逐条判断表述属于“需求场景层（做什么）”还是“技术方案层（怎么做）”，对比改写后的标准业务语言。",
    render: function (root) {
      const items = [
        { text: "用户填写任务标题、描述和优先级，点击创建按钮。", ans: "req", fix: "已是纯需求场景语言，清晰描述了角色、输入与动作。" },
        { text: "前端通过 POST /api/tasks 提交 JSON 请求体到 FastAPI。", ans: "tech", fix: "改写为：团队成员提交新任务的标题、描述、优先级与截止日期。" },
        { text: "使用 PostgreSQL 存储任务表并给 status 字段加索引。", ans: "tech", fix: "改写为：系统持久化保存任务记录，支持按状态快速检索任务列表。" },
        { text: "分配任务给不存在的用户时，系统拒绝操作并提示用户不存在。", ans: "req", fix: "已是清晰的需求失败场景描述，不涉及具体 HTTP 状态码。" },
        { text: "用 Zustand 保存当前登录用户的 JWT Token。", ans: "tech", fix: "改写为：系统识别当前登录角色（Member/Manager/Admin）并按角色限制操作权限。" },
        { text: "通知发送失败时记录日志，不阻断主流程创建任务。", ans: "req", fix: "已是明确的业务可靠性与降级要求。" },
      ];
      let idx = 0;
      let score = 0;
      let feedback = null;

      function draw() {
        root.innerHTML = "";
        const done = idx >= items.length;
        const pct = Math.round((idx / items.length) * 100);
        root.appendChild(el("div", { class: "pcf-row" }, [
          el("span", { class: "pcf-pill info", text: "进度：" + Math.min(idx + 1, items.length) + " / " + items.length }),
          el("span", { class: "pcf-pill ok", text: "正确：" + score }),
        ]));
        root.appendChild(el("div", { class: "pcf-meter" }, [
          el("div", { class: "pcf-meter-fill", style: { width: pct + "%" } }),
        ]));

        if (done) {
          root.appendChild(el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: "分拣完成" }),
            el("p", { text: "你在 " + items.length + " 道表述中答对了 " + score + " 道。记住：需求场景层只描述业务问题、角色、动作、输入输出与失败，绝不提前引入框架、协议或表结构。" }),
            el("button", { type: "button", class: "pcf-btn primary", text: "再练一次", onClick: function () { idx = 0; score = 0; feedback = null; draw(); } }),
          ]));
          return;
        }

        const cur = items[idx];
        root.appendChild(el("div", { class: "pcf-panel", style: { marginBottom: "0.75rem" } }, [
          el("div", { class: "pcf-panel-title", text: "待判定表述 #" + (idx + 1) }),
          el("div", { style: { fontSize: "0.96rem", fontWeight: "600" }, text: "“" + cur.text + "”" }),
        ]));

        const choose = function (choice) {
          if (feedback) return;
          const ok = choice === cur.ans;
          if (ok) score += 1;
          feedback = { ok: ok, msg: (ok ? "判断正确！" : "判断偏差：") + cur.fix };
          draw();
        };

        root.appendChild(el("div", { class: "pcf-row" }, [
          el("button", { type: "button", class: "pcf-btn" + (feedback ? "" : " primary"), disabled: !!feedback, text: "属于需求场景层（做什么）", onClick: function () { choose("req"); } }),
          el("button", { type: "button", class: "pcf-btn", disabled: !!feedback, text: "属于技术方案层（怎么做）", onClick: function () { choose("tech"); } }),
          feedback ? el("button", { type: "button", class: "pcf-btn success", text: idx + 1 === items.length ? "查看总结" : "下一题 →", onClick: function () { idx += 1; feedback = null; draw(); } }) : null,
        ]));

        if (feedback) {
          root.appendChild(el("div", { class: "pcf-log-item " + (feedback.ok ? "ok" : "warn"), text: feedback.msg }));
        }
      }
      draw();
    },
  });

  /* 2. ch1-six-elements: 六要素需求诊断台 */
  PCF.register("ch1-six-elements", {
    badge: "第 1 章 · 交互实验 2",
    tone: "cyan",
    title: "六要素需求场景诊断台",
    subtitle: "切换六个要素的完备状态，实时观察缺失任意要素会给下游结构建模带来什么盲区。",
    render: function (root) {
      const elements = [
        { key: "problem", name: "1. 问题", sample: "团队任务散落在口头和聊天中，经常遗漏或重复。", risk: "缺少价值判断标准，容易堆砌无关功能。" },
        { key: "user", name: "2. 用户角色", sample: "Member、Manager、Admin 三类角色权限清晰。", risk: "角色遗漏导致权限模型与视图路由缺失。" },
        { key: "action", name: "3. 用户动作", sample: "创建、分配、完成、审核、评论、通知。", risk: "交互结构缺路径，API 与界面按钮对不上。" },
        { key: "input", name: "4. 输入规格", sample: "title(1-200必填)、priority(4枚举)、due_date。", risk: "边界结构无法定义校验规则，非法脏数据入库。" },
        { key: "output", name: "5. 输出规格", sample: "成功返回 Task 对象；失败返回错误码与字段列表。", risk: "前后端契约断裂，错误提示只能写死“操作失败”。" },
        { key: "failure", name: "6. 失败场景", sample: "空标题拒绝、非法状态转移409、DB重试3次、通知降级。", risk: "约束与可靠性切面空白，生产环境一出错即崩溃。" },
      ];
      const state = { problem: true, user: true, action: true, input: false, output: true, failure: false };

      function draw() {
        root.innerHTML = "";
        const covered = elements.filter(function (e) { return state[e.key]; }).length;
        const pct = Math.round((covered / elements.length) * 100);

        root.appendChild(el("div", { class: "pcf-row" }, [
          el("button", { type: "button", class: "pcf-btn", text: "模拟“口头模糊需求”", onClick: function () { elements.forEach(function (e, i) { state[e.key] = i === 0; }); draw(); } }),
          el("button", { type: "button", class: "pcf-btn", text: "模拟“缺边界与失败”", onClick: function () { state.problem = true; state.user = true; state.action = true; state.input = false; state.output = true; state.failure = false; draw(); } }),
          el("button", { type: "button", class: "pcf-btn primary", text: "Task Manager 完整六要素", onClick: function () { elements.forEach(function (e) { state[e.key] = true; }); draw(); } }),
        ]));

        root.appendChild(el("div", { class: "pcf-row" }, elements.map(function (e) {
          return el("button", {
            type: "button",
            class: "pcf-btn" + (state[e.key] ? " active" : ""),
            text: (state[e.key] ? "✓ " : "○ ") + e.name,
            onClick: function () { state[e.key] = !state[e.key]; draw(); },
          });
        })));

        const fillColor = pct === 100 ? "var(--pcf-emerald)" : pct >= 60 ? "var(--pcf-amber)" : "var(--pcf-rose)";
        root.appendChild(el("div", { class: "pcf-meter" }, [
          el("div", { class: "pcf-meter-fill", style: { width: pct + "%", background: fillColor } }),
        ]));

        const grid = el("div", { class: "pcf-grid" });
        const okBox = el("div", { class: "pcf-panel" }, [el("div", { class: "pcf-panel-title", text: "已明确要素（" + covered + "/6）" })]);
        const riskBox = el("div", { class: "pcf-panel" }, [el("div", { class: "pcf-panel-title", text: "下游盲区诊断" })]);

        elements.forEach(function (e) {
          if (state[e.key]) {
            okBox.appendChild(el("div", { class: "pcf-log-item ok", style: { marginBottom: "0.3rem" }, text: e.name + "：" + e.sample }));
          } else {
            riskBox.appendChild(el("div", { class: "pcf-log-item err", style: { marginBottom: "0.3rem" }, text: "缺失 " + e.name + " → " + e.risk }));
          }
        });
        if (covered === 6) {
          riskBox.appendChild(el("div", { class: "pcf-log-item ok", text: "六要素完备！可以直接进入第 2 章进行五类结构拆解。" }));
        }
        grid.appendChild(okBox);
        grid.appendChild(riskBox);
        root.appendChild(grid);
      }
      draw();
    },
  });

  /* 3. ch2-pos-extractor: 词性抽取工作台 */
  PCF.register("ch2-pos-extractor", {
    badge: "第 2 章 · 交互实验 1",
    title: "需求词性抽取工作台（名词 / 动词 / 阶段 / 交互点 / 限制）",
    subtitle: "点击业务句子中的关键片段，将它们分流到五个结构出口，实时生成结构产物清单。",
    render: function (root) {
      const tokens = [
        { text: "团队成员", cat: "领域结构", out: "对象卡片 User (role=member)" },
        { text: "通过表单", cat: "边界结构", out: "UI 表单输入边界" },
        { text: "创建", cat: "交互结构", out: "用户动作 create_task" },
        { text: "任务", cat: "领域结构", out: "对象卡片 Task" },
        { text: "标题不能为空", cat: "约束与可靠性", out: "字段约束 title(1-200)" },
        { text: "待分配(open)", cat: "状态结构", out: "Task 初始状态 open" },
        { text: "负责人", cat: "领域结构", out: "关系 Task.assignee → User" },
        { text: "分配任务", cat: "交互结构", out: "用户动作 assign_task" },
        { text: "执行中(in_progress)", cat: "状态结构", out: "状态转移 open → in_progress" },
        { text: "邮箱通知", cat: "边界结构", out: "外部服务通知边界" },
        { text: "通知失败记日志不阻断", cat: "约束与可靠性", out: "可靠性降级策略" },
      ];
      const cats = ["领域结构", "交互结构", "状态结构", "边界结构", "约束与可靠性"];
      const picked = Object.create(null);

      function draw() {
        root.innerHTML = "";
        const bar = el("div", { class: "pcf-panel", style: { marginBottom: "0.8rem" } }, [
          el("div", { class: "pcf-panel-title", text: "点击下方需求词块完成拆解（已提取 " + Object.keys(picked).length + "/" + tokens.length + "）" }),
          el("div", {}, tokens.map(function (t, i) {
            return el("span", {
              class: "pcf-token" + (picked[i] ? " selected" : ""),
              text: t.text,
              onClick: function () {
                if (picked[i]) delete picked[i];
                else picked[i] = t;
                draw();
              },
            });
          })),
          el("div", { class: "pcf-row", style: { marginTop: "0.6rem", marginBottom: 0 } }, [
            el("button", { type: "button", class: "pcf-btn primary", text: "一键全部提取", onClick: function () { tokens.forEach(function (t, i) { picked[i] = t; }); draw(); } }),
            el("button", { type: "button", class: "pcf-btn", text: "清空选择", onClick: function () { Object.keys(picked).forEach(function (k) { delete picked[k]; }); draw(); } }),
          ]),
        ]);
        root.appendChild(bar);

        const grid = el("div", { class: "pcf-grid" });
        cats.forEach(function (c) {
          const items = Object.keys(picked).map(function (k) { return picked[k]; }).filter(function (x) { return x.cat === c; });
          const box = el("div", { class: "pcf-panel" }, [
            el("div", { class: "pcf-panel-title", text: c + " (" + items.length + ")" }),
          ]);
          if (items.length === 0) {
            box.appendChild(el("div", { class: "pcf-note", text: "尚未提取词块" }));
          } else {
            items.forEach(function (it) {
              box.appendChild(el("div", { class: "pcf-pill info", text: it.out }));
            });
          }
          grid.appendChild(box);
        });
        root.appendChild(grid);
      }
      draw();
    },
  });

  /* 4. ch2-pseudo-req: 伪需求与隐含结构透视镜 */
  PCF.register("ch2-pseudo-req", {
    badge: "第 2 章 · 交互实验 2",
    tone: "amber",
    title: "伪需求与隐含结构透视镜",
    subtitle: "选择常见模糊需求，逐层展开其中隐含的对象、动作、状态与澄清问题。",
    render: function (root) {
      const cases = [
        {
          label: "“用户管理任务”",
          verdict: "粒度过粗（隐藏多动作与多角色）",
          hidden: [
            "隐含对象：Task、User、Project、Comment",
            "隐含动作：create / list / assign / complete / approve / cancel",
            "隐含权限：Member 创建与完成，Manager 分配与审核",
          ],
          ask: "拆解行动：按角色拆出 6 个独立动作，并分别写明前置状态。",
        },
        {
          label: "“系统智能调度任务”",
          verdict: "疑似伪需求（缺少明确规则与触发者）",
          hidden: [
            "“智能”无明确输入特征与排序规则",
            "未说明谁触发调度（定时事件还是人工点击）",
            "未定义调度失败或无人可分配时的降级方案",
          ],
          ask: "拆解行动：把“智能”落为可验证规则（如按优先级 + 成员当前负载分配）。",
        },
        {
          label: "“分配给负责人”",
          verdict: "隐含字段、关系与状态转移",
          hidden: [
            "隐含字段与关系：Task.assignee_id → User.id (0..1)",
            "隐含状态转移：open → in_progress",
            "隐含失败路径：assignee 不存在 → 404；非 open 状态 → 409",
          ],
          ask: "拆解行动：在领域结构补关系、在状态结构补转移、在边界补错误响应。",
        },
      ];
      let active = 0;

      function draw() {
        root.innerHTML = "";
        root.appendChild(el("div", { class: "pcf-row" }, cases.map(function (c, i) {
          return el("button", {
            type: "button",
            class: "pcf-btn" + (i === active ? " active" : ""),
            text: c.label,
            onClick: function () { active = i; draw(); },
          });
        })));
        const cur = cases[active];
        root.appendChild(el("div", { class: "pcf-panel" }, [
          el("span", { class: "pcf-pill warn", text: cur.verdict }),
          el("div", { class: "pcf-panel-title", style: { marginTop: "0.6rem" }, text: "显式化后的隐含结构" }),
          el("div", {}, cur.hidden.map(function (h) {
            return el("div", { class: "pcf-log-item info", style: { marginBottom: "0.35rem" }, text: h });
          })),
          el("div", { class: "pcf-log-item ok", style: { marginTop: "0.45rem" }, text: cur.ask }),
        ]));
      }
      draw();
    },
  });
})(window.PCFToys);
