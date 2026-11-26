# Writing State

## Book Metadata

- **Title**: 程序构造力
- **Subtitle**: 从需求结构到构造件组装，把想法变成可运行系统
- **Author**: Lin.MI
- **Total Parts**: 5（目录 Part 数）
- **结构说明**: 目录共 5 个 Part，其中 Part 2 是支撑模块；主构造链五个关键环节不等同于目录 Part 编号。主构造链五个关键环节为：需求场景层 → 程序结构建模层 → 构造件选择层 → 胶水代码连接层 → 最小可运行系统层。
- **Total Chapters**: 16
- **Appendices**: 6 (附录 A-F)

## Chapter Manifest

| # | File | Status | Description |
|---|------|--------|-------------|
| 1 | `chapter-01-demand-scenario.qmd` | done | 程序不是从语法开始，而是从需求场景开始 — 定义需求场景层，六要素 |
| 2 | `chapter-02-demand-to-structure.qmd` | done | 把需求拆成对象、动作、状态、边界和约束 — 需求→结构的映射 |
| 3 | `chapter-03-basic-syntax-materials.qmd` | done | 基础语法只是低阶代码材料 — 六类代码材料，降级定位 |
| 4 | `chapter-04-syntax-to-expression.qmd` | done | 基础语法如何进入程序表达 — 语法→表达转换 |
| 5 | `chapter-05-expression-unit.qmd` | done | 程序表达单元 — 五类表达单元总表 |
| 6 | `chapter-06-structure-modeling.qmd` | done | 程序结构建模是什么 — 结构规格包（五类结构+一个横向切面），需求来源而非表达升级 |
| 7 | `chapter-07-domain-structure.qmd` | done | 领域结构：对象、字段、关系、生命周期 — 不含配置/结果结构 |
| 8 | `chapter-08-interaction-and-state.qmd` | done | 交互结构与状态结构 — 含状态到前端构造件映射预览 |
| 9 | `chapter-09-boundary-composition-reliability.qmd` | done | 边界结构、组合结构与约束可靠性切面 — 可靠性作为横向切面 |
| 10 | `chapter-10-construction-assets.qmd` | done | 构造件是什么：库、框架、组件、SDK 与脚手架 — 全新章节 |
| 11 | `chapter-11-frontend-assets.qmd` | done | 前端构造件：组件库、路由、状态、表单、请求与反馈 — 结构映射 |
| 12 | `chapter-12-backend-assets.qmd` | done | 后端构造件：API、数据访问、权限、任务、缓存与观测 — 结构映射 |
| 13 | `chapter-13-scaffold.qmd` | done | 脚手架：把结构规格变成项目壳 — 全新章节 |
| 14 | `chapter-14-structure-to-implementation.qmd` | done | 从结构模型到实现方案 — 三分法：自写/构造件/脚手架 |
| 15 | `chapter-15-glue-code-and-assembly.qmd` | done | 自写代码、构造件和胶水代码如何连接 — 六种胶水代码类型 |
| 16 | `chapter-16-minimum-runnable-system.qmd` | done | 形成最小可运行系统 — 系统验收标准，主链五个关键环节与支撑模块回收 |
| A | `appendix-a-five-layer-summary.qmd` | done | 附录 A：主构造链总表与支撑模块 |
| B | `appendix-b-structure-modeling-template.qmd` | done | 附录 B：结构建模模板（15 个可复用模板） |
| C | `appendix-c-structure-to-asset-mapping.qmd` | done | 附录 C：结构到构造件映射表 |
| D | `appendix-d-frontend-asset-catalog.qmd` | done | 附录 D：前端构造件分类表 |
| E | `appendix-e-backend-asset-catalog.qmd` | done | 附录 E：后端构造件分类表 |
| F | `appendix-f-minimum-runnable-system-checklist.qmd` | done | 附录 F：最小可运行系统检查表 |

## Terminology

| Term | Translation | Notes |
|------|-------------|-------|
| 需求场景层 | Demand Scenario Layer | 主构造链第一个关键环节 |
| 基础代码材料与程序表达 | Basic Code Materials and Program Expression | 支撑模块，不属于主构造链 |
| 程序结构建模层 | Program Structure Modeling Layer | 主构造链第二个关键环节，从需求抽取结构 |
| 构造件选择层 | Construction Asset Selection Layer | 主构造链第三个关键环节 |
| 胶水代码连接层 | Glue Code Assembly Layer | 主构造链第四个关键环节 |
| 最小可运行系统层 | Minimum Runnable System Layer | 主构造链第五个关键环节 |
| 需求场景 | Demand Scenario | 程序构造的起点 |
| 程序表达单元 | Program Expression Unit | 语法组合出的稳定局部含义（支撑模块中的概念） |
| 程序结构建模 | Program Structure Modeling | 从需求抽取结构，而非从表达升级 |
| 领域结构 | Domain Structure | 对象、字段、关系、生命周期、领域约束 |
| 交互结构 | Interaction Structure | 用户动作、系统事件、命令、查询、流程 |
| 状态结构 | State Structure | 业务状态、UI 状态、请求状态、缓存状态、转移 |
| 边界结构 | Boundary Structure | API 边界、UI 边界、数据库边界、外部服务边界 |
| 组合结构 | Composition Structure | 组件树、模块结构、服务结构、适配器结构 |
| 约束与可靠性切面 | Constraint & Reliability Slice | 横向贯穿所有结构的质量保证层 |
| 构造件 | Construction Asset | 承接稳定结构的可复用代码资产 |
| 胶水代码 | Glue Code | 连接自写代码和构造件的适配代码 |
| 最小可运行系统 | Minimum Runnable System | 全书最终产出，非单程序而是多服务系统 |

## Open Issues

- [x] 全书升级：四层（语法→表达→结构→代码）→ 主构造链五个关键环节（需求场景→结构建模→构造件选择→胶水代码连接→最小系统）
- [x] 重写全书主线：从"表达单元升级成结构单元"到"从需求抽取结构"
- [x] 新增需求场景层（第 1-2 章）
- [x] 语法和表达降级为支撑模块（第 3-5 章）
- [x] 结构建模层重写（第 6-9 章）
- [x] 新增构造件层（第 10-13 章）
- [x] 程序组装层重写（第 14-16 章）
- [x] 附录重写（附录 A-F）
- [x] 统一 Task Manager 贯穿案例
- [x] 删除旧文件（13 个旧章节/附录）
- [x] 更新 _quarto.yml 为新五部分目录
- [x] 二次修复 A1：五层冲突 — Part 2 改为"支撑模块"，ch3/ch5 去掉"第二层"表述
- [x] 二次修复 A2：六类结构→五类结构+一个横向切面 — 全书 14 处统一
- [x] 二次修复 B1：Chapter 10 加厚
- [x] 二次修复 B2：问题清单→动作句
- [x] 二次修复 C1-C6：技术示例统一
- [x] 二次修复 D：book-principles 对齐
- [x] 二次修复 E：构建产物清理
- [x] 第三次收尾 F：附录 A 重设计 — 主构造链 + 支撑模块两段
- [x] 第三次收尾 G：writing-state.md 术语统一
- [x] 第三次收尾 H：章节层→环节表述统一（ch1, ch10, ch14, ch16, content.md）
- [x] 第三次收尾 I：ch11-15 问题清单→动作句完成
- [x] 第三次收尾 J：__MACOSX 已清理确认

## Progress Log

- 2026-06-12: `init` + `continue` — 原版四层全书初版完成
- 2026-06-20: `rewrite` — 根据五轮审查意见，全书体系从四层升级为五层。完成 16 章 + 6 附录的全部重写，删除 13 个旧文件。
- 2026-06-20: `polish` — 二次修复：五层冲突、六类结构清理、Ch10 加厚、问题清单→动作句、技术示例统一、构建产物清理。
- 2026-06-20: `polish` — 第三次收尾：附录 A 重设为"主构造链+支撑模块"两段式；全书术语统一为"主构造链关键环节"；ch11-15 问题清单全部改为动作句。
