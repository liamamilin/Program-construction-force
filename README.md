# 程序构造力（Program Construction Force）

> **从需求结构到构造件组装，把想法变成可运行系统**

这是一本基于 [Quarto](https://quarto.org/) 编写的交互式中文技术书籍。全书围绕贯穿案例 **Task Manager（任务管理系统）**，系统阐述现代软件开发的主构造链：

```text
需求场景 → 程序结构建模 → 构造件选择 → 胶水代码连接 → 最小可运行系统
```

以及贯穿全程的支撑模块：**基础代码材料与程序表达**。

## 全书结构

| 部分 | 章节 | 核心主题 |
|------|------|---------|
| **序言** | `index.qmd` | 从“学完语法不知道怎么写程序”出发，建立五层主构造链认知 |
| **Part 1：需求场景** | 第 1–2 章 | 需求场景六要素；将业务语言拆解为对象、动作、状态、边界与约束 |
| **Part 2：支撑模块** | 第 3–5 章 | 六类低阶代码材料；语法到表达的转换；五类程序表达单元总体系 |
| **Part 3：程序结构建模层** | 第 6–9 章 | 结构规格包；领域结构、交互与状态结构、边界与组合结构、约束与可靠性横向切面 |
| **Part 4：构造件层** | 第 10–13 章 | 构造件选择六步动作链；前后端构造件结构映射；脚手架项目壳落地 |
| **Part 5：程序组装层** | 第 14–16 章 | 实现方案三分法（自写/构造件/脚手架）；六类胶水代码；最小可运行系统验收 |
| **附录 A–F** | 6 篇附录 | 主构造链总表、15 个结构建模模板、结构到构造件映射表、前后端构造件目录、最小可运行系统检查表 |

## 零依赖浏览器端交互实验

全书为 16 章核心概念配套了 **32 个零外部依赖的前端交互实验**（每章 2 个），支持参数调节、流程单步调试、策略对比、状态机模拟与代码结构解剖：

- `assets/toys/core.js`：统一核心挂载引擎（`window.PCFToys`），提供实验注册、DOM 挂载、通用控件与高亮渲染工具
- `assets/toys.css`：统一交互实验样式表（支持浅色/深色主题无缝切换）
- `assets/toys/part1.js` – `part5.js`：按全书五个部分模块拆分的实验逻辑脚本
- `assets/toys-loader.html`：Quarto `include-after-body` 统一加载器，保证脚本按顺序稳定挂载

## 目录结构

```text
.
├── _quarto.yml                 # Quarto 书籍主配置
├── index.qmd                   # 序言
├── chapter-01..16-*.qmd        # 正文 16 章
├── appendix-a..f-*.qmd         # 附录 A–F
├── references.qmd              # 延伸阅读与参考资料
├── assets/
│   ├── custom.css              # 全书排版与视觉主题样式表
│   ├── toys.css                # 交互实验统一样式表
│   ├── toys-loader.html        # 交互实验脚本加载器
│   ├── diagrams/               # 出版级 SVG 架构图（支持暗黑模式）
│   └── toys/                   # 零依赖交互实验引擎与分模块脚本
├── scripts/
│   └── verify_book.py          # 全书一致性与交互容器 1-to-1 校验脚本
├── docs/                       # 内部写作原则与进度记录
└── .github/workflows/
    └── publish.yml             # GitHub Pages 自动构建与部署工作流
```

## 本地预览与构建

需要安装 [Quarto CLI](https://quarto.org/docs/get-started/)（建议 1.4+）与 Python 3（用于校验脚本）：

```bash
# 1. 校验交互实验注册 ID、容器对应关系与全书结构
python3 scripts/verify_book.py

# 2. 本地热重载预览
quarto preview

# 3. 完整构建静态 HTML 电子书（输出至 _book/）
quarto render --to html
```
