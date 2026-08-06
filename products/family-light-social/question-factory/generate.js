/**
 * 家庭轻社交 · 默契问题卡 · 题模工厂
 *
 * 用法：
 *   node generate.js
 *   node generate.js --max-per-template 40
 *   node generate.js --seed 42
 *
 * 输入：templates.json + pools.json
 * 输出：output/questions.json + output/questions.csv + output/stats.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'output');

function parseArgs(argv) {
  const args = { maxPerTemplate: 40, seed: 20260805 };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--max-per-template') args.maxPerTemplate = Number(argv[++i]);
    else if (argv[i] === '--seed') args.seed = Number(argv[++i]);
  }
  return args;
}

/** Mulberry32 — 可复现随机 */
function makeRng(seed) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function resolvePool(pools, nameOrList) {
  if (Array.isArray(nameOrList)) return nameOrList;
  if (!pools[nameOrList]) {
    throw new Error(`Pool not found: ${nameOrList}`);
  }
  return pools[nameOrList];
}

function toOptions(template, pools, rng) {
  if (Array.isArray(template.options) && template.options.length) {
    return template.options.map((o, i) => ({
      key: String.fromCharCode(65 + i),
      text: o.text,
      axis: o.axis || `opt_${i}`
    }));
  }

  const poolName = template.optionsPool;
  if (!poolName) {
    throw new Error(`Template ${template.id} missing options`);
  }

  if (poolName === 'true_reasons_as_options') {
    // 默契题保持 4 选项：从原因池抽样（每题可不同）
    const picked = shuffle(pools.true_reasons, rng).slice(0, 4);
    return picked.map((text, i) => ({
      key: String.fromCharCode(65 + i),
      text,
      axis: `reason_${i}`
    }));
  }

  const raw = resolvePool(pools, poolName);
  return raw.map((o, i) => {
    if (typeof o === 'string') {
      return { key: String.fromCharCode(65 + i), text: o, axis: `opt_${i}` };
    }
    return {
      key: String.fromCharCode(65 + i),
      text: o.text,
      axis: o.axis || `opt_${i}`
    };
  });
}

function fillQuestion(pattern, vars) {
  return pattern.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (vars[k] == null) throw new Error(`Missing slot {{${k}}} in: ${pattern}`);
    return vars[k];
  });
}

function cartesianLimited(entries, max, rng) {
  if (entries.length === 0) return [{}];
  if (entries.length === 1) {
    const [key, values] = entries[0];
    return values.slice(0, max).map((v) => ({ [key]: v }));
  }

  // 多槽：随机配对采样，避免笛卡儿积爆炸
  const out = [];
  const seen = new Set();
  const guard = max * 20;
  let tries = 0;
  while (out.length < max && tries < guard) {
    tries++;
    const row = {};
    let sig = '';
    for (const [key, values] of entries) {
      const v = values[Math.floor(rng() * values.length)];
      row[key] = v;
      sig += `${key}=${v}|`;
    }
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(row);
  }
  return out;
}

function expandTemplate(template, pools, rng, globalMax) {
  const max = template.maxExpand || globalMax;
  const slotKeys = Object.keys(template.slots || {});
  const refreshOptions = template.optionsPool === 'true_reasons_as_options';

  if (template.fixed || slotKeys.length === 0) {
    return [
      {
        templateId: template.id,
        layer: template.layer,
        tags: template.tags || [],
        question: template.question,
        options: toOptions(template, pools, rng),
        sensitivity: template.sensitivity || 'normal',
        expandSource: 'fixed'
      }
    ];
  }

  const entries = slotKeys.map((k) => [k, resolvePool(pools, template.slots[k])]);
  const mode = template.expandMode || (entries.length > 1 ? 'pairSample' : 'each');

  let combos;
  if (mode === 'each' && entries.length === 1) {
    const [key, values] = entries[0];
    const picked = shuffle(values, rng).slice(0, max);
    combos = picked.map((v) => ({ [key]: v }));
  } else {
    combos = cartesianLimited(entries, max, rng);
  }

  const sharedOptions = refreshOptions ? null : toOptions(template, pools, rng);

  return combos.map((vars) => ({
    templateId: template.id,
    layer: template.layer,
    tags: template.tags || [],
    question: fillQuestion(template.question, vars),
    options: refreshOptions ? toOptions(template, pools, rng) : sharedOptions,
    sensitivity: template.sensitivity || 'normal',
    slots: vars,
    expandSource: mode
  }));
}

function slugId(layer, templateId, index, question) {
  let h = 0;
  for (let i = 0; i < question.length; i++) {
    h = (Math.imul(31, h) + question.charCodeAt(i)) | 0;
  }
  const hex = (h >>> 0).toString(16).padStart(8, '0');
  return `${layer}-${templateId}-${String(index).padStart(3, '0')}-${hex}`;
}

function toCsv(questions) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const header = [
    'id',
    'layer',
    'templateId',
    'tags',
    'question',
    'optionA',
    'optionB',
    'optionC',
    'optionD',
    'axes',
    'sensitivity'
  ];
  const lines = [header.join(',')];
  for (const q of questions) {
    const opts = q.options || [];
    lines.push(
      [
        esc(q.id),
        esc(q.layer),
        esc(q.templateId),
        esc((q.tags || []).join('|')),
        esc(q.question),
        esc(opts[0] ? opts[0].text : ''),
        esc(opts[1] ? opts[1].text : ''),
        esc(opts[2] ? opts[2].text : ''),
        esc(opts[3] ? opts[3].text : ''),
        esc(opts.map((o) => o.axis).join('|')),
        esc(q.sensitivity)
      ].join(',')
    );
  }
  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv);
  const rng = makeRng(args.seed);

  const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'pools.json'), 'utf8'));
  const templates = JSON.parse(fs.readFileSync(path.join(ROOT, 'templates.json'), 'utf8'));

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const seenQuestions = new Set();
  const questions = [];
  const perTemplate = {};

  for (const tpl of templates) {
    const expanded = expandTemplate(tpl, pools, rng, args.maxPerTemplate);
    let kept = 0;
    expanded.forEach((item, idx) => {
      const key = item.question.trim();
      if (seenQuestions.has(key)) return;
      seenQuestions.add(key);
      questions.push({
        id: slugId(item.layer, item.templateId, kept, key),
        ...item
      });
      kept++;
    });
    perTemplate[tpl.id] = kept;
  }

  // 稳定排序：层 → 题模 → id
  const layerOrder = { L1: 1, L2: 2, L3: 3, L4: 4 };
  questions.sort((a, b) => {
    const d = (layerOrder[a.layer] || 9) - (layerOrder[b.layer] || 9);
    if (d !== 0) return d;
    if (a.templateId !== b.templateId) return a.templateId.localeCompare(b.templateId);
    return a.id.localeCompare(b.id);
  });

  const stats = {
    generatedAt: new Date().toISOString(),
    seed: args.seed,
    maxPerTemplate: args.maxPerTemplate,
    templateCount: templates.length,
    questionCount: questions.length,
    byLayer: {
      L1: questions.filter((q) => q.layer === 'L1').length,
      L2: questions.filter((q) => q.layer === 'L2').length,
      L3: questions.filter((q) => q.layer === 'L3').length,
      L4: questions.filter((q) => q.layer === 'L4').length
    },
    sensitiveCount: questions.filter((q) => q.sensitivity === 'sensitive').length,
    perTemplate
  };

  const payload = {
    version: '1.0.0',
    product: 'family-light-social',
    feature: '默契问题卡',
    play: {
      flow: ['孩子选题', '孩子先选答案(隐藏)', '父母作答', '揭晓默契', '双方留言'],
      matchLabels: {
        exact: '心有灵犀',
        close: '差不多懂你',
        miss: '原来我想的不一样'
      },
      closeRule: '同 axis 前缀或人工映射表可算接近（后续可扩展）'
    },
    stats,
    questions
  };

  fs.writeFileSync(path.join(OUT_DIR, 'questions.json'), JSON.stringify(payload, null, 2), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'questions.csv'), toCsv(questions), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'stats.json'), JSON.stringify(stats, null, 2), 'utf8');

  console.log('题模工厂完成');
  console.log(`题模数: ${stats.templateCount}`);
  console.log(`生成题量: ${stats.questionCount}`);
  console.log(`分层: L1=${stats.byLayer.L1} L2=${stats.byLayer.L2} L3=${stats.byLayer.L3} L4=${stats.byLayer.L4}`);
  console.log(`敏感题: ${stats.sensitiveCount}`);
  console.log(`输出目录: ${OUT_DIR}`);
}

main();
