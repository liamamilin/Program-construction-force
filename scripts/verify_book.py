#!/usr/bin/env python3
"""
《程序构造力》Quarto 书籍工程化与交互实验完整性校验脚本。

校验项目：
1. 所有在 assets/toys/part*.js 注册的实验 ID 与全书 .qmd 嵌入的 .pcf-toy[data-toy="..."] 一一对应（无遗漏、无多余、无重复）。
2. assets/toys-loader.html 按确定顺序加载 core.js -> part1.js..part5.js -> mountAll()。
3. 全书引用的 SVG 图表文件全部真实存在。
4. 全部章节/附录标题不存在重复编号（Chapter N： / 附录 X：）。
5. 全书无折叠损坏的 Markdown 列表（“： - ”）。
"""

from __future__ import annotations

import glob
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    errors: list[str] = []

    # 1. 收集 JS 注册的实验 ID
    js_files = sorted(glob.glob(str(ROOT / "assets/toys/part*.js")))
    registered: list[str] = []
    reg_by_file: dict[str, list[str]] = {}
    for jf in js_files:
        text = Path(jf).read_text(encoding="utf-8")
        ids = re.findall(r'PCF\.register\(\s*"([^"]+)"', text)
        reg_by_file[Path(jf).name] = ids
        registered.extend(ids)

    dup_reg = sorted({x for x in registered if registered.count(x) > 1})
    if dup_reg:
        errors.append(f"JS 中存在重复注册的实验 ID: {dup_reg}")

    # 2. 收集 .qmd 中嵌入的实验容器 ID
    qmd_files = sorted(glob.glob(str(ROOT / "*.qmd")))
    embedded: list[str] = []
    emb_by_file: dict[str, list[str]] = {}
    for qf in qmd_files:
        name = Path(qf).name
        text = Path(qf).read_text(encoding="utf-8")
        ids = re.findall(r'<div\s+class="pcf-toy"\s+data-toy="([^"]+)"\s*>\s*</div>', text)
        if ids:
            emb_by_file[name] = ids
            embedded.extend(ids)

        # 检查是否每章 1-16 均配套 >= 2 个实验
        if re.match(r"chapter-\d{2}-", name) and len(ids) < 2:
            errors.append(f"{name} 仅包含 {len(ids)} 个交互实验（要求每章至少 2 个）")

        # 检查 SVG 图表路径
        for img_path in re.findall(r"!\[[^\]]*\]\(([^)]+)\)", text):
            if not img_path.startswith(("http://", "https://")):
                full = ROOT / img_path
                if not full.exists():
                    errors.append(f"{name} 引用的图片不存在: {img_path}")

        # 检查重复编号标题
        m_title = re.search(r'^title:\s*"(.+?)"\s*$', text, re.M)
        if m_title:
            t = m_title.group(1)
            if re.match(r"^(Chapter\s+\d+|附录\s+[A-Z])[：:]", t):
                errors.append(f"{name} 存在重复编号前缀: {t}")

        # 检查损坏的折叠列表
        no_code = re.sub(r"```[\s\S]*?```", "", text)
        if re.search(r"： - ", no_code):
            errors.append(f"{name} 存在折叠损坏的 Markdown 列表（'： - '）")

    dup_emb = sorted({x for x in embedded if embedded.count(x) > 1})
    if dup_emb:
        errors.append(f"正文中存在重复嵌入的实验容器 ID: {dup_emb}")

    reg_set = set(registered)
    emb_set = set(embedded)
    missing_in_js = sorted(emb_set - reg_set)
    unused_in_qmd = sorted(reg_set - emb_set)
    if missing_in_js:
        errors.append(f"正文已嵌入但 JS 未注册的实验 ID: {missing_in_js}")
    if unused_in_qmd:
        errors.append(f"JS 已注册但正文未嵌入的实验 ID: {unused_in_qmd}")

    # 3. 检查 toys-loader.html 加载顺序
    loader = ROOT / "assets/toys-loader.html"
    if not loader.exists():
        errors.append("缺少 assets/toys-loader.html")
    else:
        ltxt = loader.read_text(encoding="utf-8")
        expected_order = [
            "assets/toys/core.js",
            "assets/toys/part1.js",
            "assets/toys/part2.js",
            "assets/toys/part3.js",
            "assets/toys/part4.js",
            "assets/toys/part5.js",
            "PCFToys.mountAll()",
        ]
        positions = [ltxt.find(tok) for tok in expected_order]
        if any(p == -1 for p in positions) or positions != sorted(positions):
            errors.append("assets/toys-loader.html 脚本加载或挂载顺序异常")

    print("=== 《程序构造力》工程与交互实验校验报告 ===")
    print(f"JS 注册实验总数 : {len(registered)}（分布：{ {k: len(v) for k, v in reg_by_file.items()} }）")
    print(f"正文嵌入容器总数: {len(embedded)}（覆盖 {len(emb_by_file)} 个章节）")
    print(f"1-to-1 精确匹配 : {'PASS' if reg_set == emb_set and not dup_reg and not dup_emb else 'FAIL'}")

    if errors:
        print("\n❌ 发现以下问题：")
        for err in errors:
            print(f"  - {err}")
        return 1

    print("\n✅ 全部校验通过！")
    return 0


if __name__ == "__main__":
    sys.exit(main())
