# -*- coding: utf-8 -*-
"""
家庭轻社交 · 默契问题卡 · 题模工厂

用法：
  python generate.py
  python generate.py --max-per-template 40 --seed 42
"""

from __future__ import annotations

import argparse
import csv
import json
import random
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "output"


def resolve_pool(pools: dict, name_or_list):
    if isinstance(name_or_list, list):
        return name_or_list
    if name_or_list not in pools:
        raise KeyError(f"Pool not found: {name_or_list}")
    return pools[name_or_list]


def to_options(template: dict, pools: dict, rng: random.Random):
    if template.get("options"):
        return [
            {
                "key": chr(65 + i),
                "text": o["text"],
                "axis": o.get("axis") or f"opt_{i}",
            }
            for i, o in enumerate(template["options"])
        ]

    pool_name = template.get("optionsPool")
    if not pool_name:
        raise ValueError(f"Template {template['id']} missing options")

    if pool_name == "true_reasons_as_options":
        picked = pools["true_reasons"][:]
        rng.shuffle(picked)
        picked = picked[:4]
        return [
            {"key": chr(65 + i), "text": text, "axis": f"reason_{i}"}
            for i, text in enumerate(picked)
        ]

    raw = resolve_pool(pools, pool_name)
    out = []
    for i, o in enumerate(raw):
        if isinstance(o, str):
            out.append({"key": chr(65 + i), "text": o, "axis": f"opt_{i}"})
        else:
            out.append(
                {
                    "key": chr(65 + i),
                    "text": o["text"],
                    "axis": o.get("axis") or f"opt_{i}",
                }
            )
    return out


def fill_question(pattern: str, vars_: dict) -> str:
    def repl(m):
        k = m.group(1)
        if k not in vars_:
            raise KeyError(f"Missing slot {{{{{k}}}}} in: {pattern}")
        return str(vars_[k])

    return re.sub(r"\{\{(\w+)\}\}", repl, pattern)


def sample_combos(entries, max_n: int, rng: random.Random):
    if not entries:
        return [{}]
    if len(entries) == 1:
        key, values = entries[0]
        vals = values[:]
        rng.shuffle(vals)
        return [{key: v} for v in vals[:max_n]]

    out = []
    seen = set()
    guard = max_n * 20
    tries = 0
    while len(out) < max_n and tries < guard:
        tries += 1
        row = {}
        sig_parts = []
        for key, values in entries:
            v = values[rng.randrange(len(values))]
            row[key] = v
            sig_parts.append(f"{key}={v}")
        sig = "|".join(sig_parts)
        if sig in seen:
            continue
        seen.add(sig)
        out.append(row)
    return out


def expand_template(template: dict, pools: dict, rng: random.Random, global_max: int):
    max_n = template.get("maxExpand") or global_max
    slot_keys = list((template.get("slots") or {}).keys())
    refresh_options = template.get("optionsPool") == "true_reasons_as_options"

    if template.get("fixed") or not slot_keys:
        return [
            {
                "templateId": template["id"],
                "layer": template["layer"],
                "tags": template.get("tags") or [],
                "question": template["question"],
                "options": to_options(template, pools, rng),
                "sensitivity": template.get("sensitivity") or "normal",
                "expandSource": "fixed",
            }
        ]

    entries = [
        (k, resolve_pool(pools, template["slots"][k])) for k in slot_keys
    ]
    mode = template.get("expandMode") or (
        "pairSample" if len(entries) > 1 else "each"
    )
    combos = sample_combos(entries, max_n, rng)
    shared = None if refresh_options else to_options(template, pools, rng)

    results = []
    for vars_ in combos:
        results.append(
            {
                "templateId": template["id"],
                "layer": template["layer"],
                "tags": template.get("tags") or [],
                "question": fill_question(template["question"], vars_),
                "options": to_options(template, pools, rng)
                if refresh_options
                else shared,
                "sensitivity": template.get("sensitivity") or "normal",
                "slots": vars_,
                "expandSource": mode,
            }
        )
    return results


def slug_id(layer: str, template_id: str, index: int, question: str) -> str:
    h = 0
    for ch in question:
        h = (31 * h + ord(ch)) & 0xFFFFFFFF
    return f"{layer}-{template_id}-{index:03d}-{h:08x}"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-per-template", type=int, default=40)
    parser.add_argument("--seed", type=int, default=20260805)
    args = parser.parse_args()

    rng = random.Random(args.seed)
    pools = json.loads((ROOT / "pools.json").read_text(encoding="utf-8"))
    templates = json.loads((ROOT / "templates.json").read_text(encoding="utf-8"))

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    seen = set()
    questions = []
    per_template = {}

    for tpl in templates:
        expanded = expand_template(tpl, pools, rng, args.max_per_template)
        kept = 0
        for item in expanded:
            key = item["question"].strip()
            if key in seen:
                continue
            seen.add(key)
            questions.append(
                {
                    "id": slug_id(item["layer"], item["templateId"], kept, key),
                    **item,
                }
            )
            kept += 1
        per_template[tpl["id"]] = kept

    layer_order = {"L1": 1, "L2": 2, "L3": 3, "L4": 4}
    questions.sort(
        key=lambda q: (
            layer_order.get(q["layer"], 9),
            q["templateId"],
            q["id"],
        )
    )

    stats = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "seed": args.seed,
        "maxPerTemplate": args.max_per_template,
        "templateCount": len(templates),
        "questionCount": len(questions),
        "byLayer": {
            "L1": sum(1 for q in questions if q["layer"] == "L1"),
            "L2": sum(1 for q in questions if q["layer"] == "L2"),
            "L3": sum(1 for q in questions if q["layer"] == "L3"),
            "L4": sum(1 for q in questions if q["layer"] == "L4"),
        },
        "sensitiveCount": sum(
            1 for q in questions if q.get("sensitivity") == "sensitive"
        ),
        "perTemplate": per_template,
    }

    payload = {
        "version": "1.0.0",
        "product": "family-light-social",
        "feature": "默契问题卡",
        "play": {
            "flow": [
                "孩子选题",
                "孩子先选答案(隐藏)",
                "父母作答",
                "揭晓默契",
                "双方留言",
            ],
            "matchLabels": {
                "exact": "心有灵犀",
                "close": "差不多懂你",
                "miss": "原来我想的不一样",
            },
        },
        "stats": stats,
        "questions": questions,
    }

    (OUT_DIR / "questions.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "stats.json").write_text(
        json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    with (OUT_DIR / "questions.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "id",
                "layer",
                "templateId",
                "tags",
                "question",
                "optionA",
                "optionB",
                "optionC",
                "optionD",
                "axes",
                "sensitivity",
            ]
        )
        for q in questions:
            opts = q.get("options") or []
            writer.writerow(
                [
                    q["id"],
                    q["layer"],
                    q["templateId"],
                    "|".join(q.get("tags") or []),
                    q["question"],
                    opts[0]["text"] if len(opts) > 0 else "",
                    opts[1]["text"] if len(opts) > 1 else "",
                    opts[2]["text"] if len(opts) > 2 else "",
                    opts[3]["text"] if len(opts) > 3 else "",
                    "|".join(o["axis"] for o in opts),
                    q.get("sensitivity") or "normal",
                ]
            )

    print("题模工厂完成")
    print(f"题模数: {stats['templateCount']}")
    print(f"生成题量: {stats['questionCount']}")
    print(
        "分层: "
        f"L1={stats['byLayer']['L1']} "
        f"L2={stats['byLayer']['L2']} "
        f"L3={stats['byLayer']['L3']} "
        f"L4={stats['byLayer']['L4']}"
    )
    print(f"敏感题: {stats['sensitiveCount']}")
    print(f"输出目录: {OUT_DIR}")


if __name__ == "__main__":
    main()
