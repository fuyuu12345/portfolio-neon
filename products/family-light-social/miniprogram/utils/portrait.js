/** 家人画像：分类、搜索、阶段描述生成（孩子档案 / 父母软档案） */

const { filterSoftSafeTags, isSoftSafe } = require('./questions')

const CATEGORIES = [
  { key: 'concern', label: '在意的事', tip: 'TA 最近真正在意什么' },
  { key: 'boundary', label: '边界', tip: '怎样靠近才不越界' },
  { key: 'understand', label: '理解', tip: '怎样才算被看见' },
  { key: 'care', label: '关心方式', tip: '怎样的关心用得上' },
  { key: 'hobby', label: '兴趣爱好', tip: 'TA 喜欢什么、希望怎样被对待' },
  { key: 'rhythm', label: '相处节奏', tip: '联系与相处的节奏偏好' },
  { key: 'story', label: '我的故事', tip: 'TA 想慢慢告诉你的一面' },
  { key: 'together', label: '一起做', tip: '想一起做的小事' },
  { key: 'other', label: '其他', tip: '节日、气氛与更宽的话题' }
]

const LAYER_TO_CAT = {
  在意的事: 'concern',
  边界: 'boundary',
  理解: 'understand',
  关心方式: 'care',
  兴趣爱好: 'hobby',
  相处节奏: 'rhythm',
  我的故事: 'story',
  一起做: 'together',
  其他: 'other'
}

const STAGE_LABEL = {
  student: '学生阶段',
  junior: '初入职场',
  settled: '已独立生活',
  other: '当下阶段',
  working: '仍在工作',
  retire: '退休前后',
  care: '需要更多照顾'
}

const STAGE_LEAD = {
  student: 'TA 正处在学业压力与自我建立交织的阶段。默契题里反复出现的，往往是「别拿别人比较」「先安慰再谈方法」这类需要安全感的信号。',
  junior: 'TA 正处在初入社会、建立边界的阶段。更在意短而轻的关心，以及「报备不等于请示」的信任。',
  settled: 'TA 已在独立生活中摸索自己的节奏。更需要被尊重选择，也更愿意在被理解后再谈建议。',
  other: '从已答的默契来看，TA 正在用题目慢慢说明自己：什么算关心，什么算越界。',
  working: 'TA 仍在工作与家庭之间分配精力。默契题更常落在关心方式、相处节奏，以及「担心≠控制」。',
  retire: 'TA 处在节奏放慢、更渴望被陪伴理解的阶段。软档案里多见故事、团聚与一句踏实的关心。',
  care: 'TA 可能需要更多照顾与耐心沟通。题目会偏向怎样的关心真正用得上、怎样的节奏更安心。'
}

function categoryOf(layer) {
  return LAYER_TO_CAT[layer] || 'other'
}

function categoryLabel(key) {
  const hit = CATEGORIES.find((c) => c.key === key)
  return hit ? hit.label : '其他'
}

function normalizeEntry(entry) {
  const layer = entry.layer || ''
  const category = entry.category || categoryOf(layer)
  const taOption =
    entry.subjectOption || entry.elderOption || entry.childOption || ''
  const youOption =
    entry.peerOption || entry.parentOption || entry.childReplyOption || ''
  const taName = entry.subjectName || entry.elderName || entry.childName || 'TA'
  const youName = entry.peerName || entry.parentName || entry.childReplyName || '你'
  return {
    ...entry,
    layer,
    category,
    categoryLabel: categoryLabel(category),
    taOption,
    youOption,
    taName,
    youName,
    childOption: entry.childOption || taOption,
    parentOption: entry.parentOption || youOption
  }
}

function groupByCategory(entries) {
  const map = {}
  CATEGORIES.forEach((c) => {
    map[c.key] = []
  })
  ;(entries || []).forEach((raw) => {
    const e = normalizeEntry(raw)
    if (!map[e.category]) map[e.category] = []
    map[e.category].push(e)
  })
  return map
}

function searchEntries(entries, query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return entries.slice()
  return entries.filter((e) => {
    const n = normalizeEntry(e)
    const blob = [
      n.question,
      n.taOption,
      n.youOption,
      n.childOption,
      n.parentOption,
      n.layer,
      n.categoryLabel,
      n.match
    ]
      .join(' ')
      .toLowerCase()
    return blob.indexOf(q) > -1
  })
}

function filterEntries(entries, { category, query } = {}) {
  let list = (entries || []).map(normalizeEntry)
  if (category && category !== 'all') {
    list = list.filter((e) => e.category === category)
  }
  return searchEntries(list, query)
}

/** 从孩子选项里抽关键词印象 */
function pickSignals(entries) {
  const texts = (entries || [])
    .map((e) => normalizeEntry(e).taOption || '')
    .filter(Boolean)
  const rules = [
    { re: /安慰|听见|理解|复述/, line: '更希望先被听见感受，再谈办法。' },
    { re: /比较|否定|人格/, line: '对被比较、被否定人格格外敏感。' },
    { re: /空间|迟回|别反复|点到为止/, line: '需要留白：短消息、少追问更安心。' },
    { re: /报备|请示|批准|替我决定/, line: '在意自主：分享可以，决定权要在自己。' },
    { re: /信任|探索|风险/, line: '愿意一起看风险，但不想被恐吓式劝说。' },
    { re: /隐私|翻旧账|施压/, line: '隐私与旧账是底线，施压会迅速拉远距离。' }
  ]
  const hits = []
  rules.forEach((r) => {
    if (texts.some((t) => r.re.test(t))) hits.push(r.line)
  })
  return hits.slice(0, 4)
}

const HEAVY_RE = /委屈|难受|痛苦|低落|焦虑|压力|崩溃|孤独|害怕|无助|想哭|否定|比较|不被看见|别打扰|很累|压抑/
const LIGHT_RE = /挺好|开心|轻松|被看见|安慰|温暖|安利|一起|踏实|被懂|愿意听|抱抱/

function senseAnswerTone(texts) {
  const blob = (texts || []).filter(Boolean).join(' ')
  if (!blob) return ''
  if (HEAVY_RE.test(blob)) return 'heavy'
  if (LIGHT_RE.test(blob)) return 'light'
  return ''
}

/** 今日心情 → 给家人的感觉提示 */
function buildMoodTip(name, mood) {
  const who = name || '家人'
  if (mood === 'heavy') {
    return `能感觉到 ${who} 今天心里有点沉，或许只需要一句「我在」。`
  }
  if (mood === 'tired') {
    return `${who} 今天有点累，适合少追问、多留一点空间。`
  }
  if (mood === 'sunny') {
    return `${who} 最近心情看起来不错，可以顺着轻松的事聊聊。`
  }
  if (mood === 'warm') {
    return `${who} 今天想被关心一点，一句温暖的话会很受用。`
  }
  if (mood === 'calm') {
    return `${who} 今天状态偏平静，慢慢陪着聊就好。`
  }
  return ''
}

/**
 * 默契写入档案后：给家人看的感觉向短提示
 * ctx: { member, recentEntries }
 */
function buildRecentTip(entry, ctx) {
  const e = normalizeEntry(entry || {})
  const name = e.subjectName || e.elderName || e.childName || '家人'
  const cat = e.categoryLabel || '其他'
  const member = (ctx && ctx.member) || null
  const recent = ((ctx && ctx.recentEntries) || []).map(normalizeEntry)
  const concerns = (member && member.about && member.about.concerns) || []

  const today = new Date()
  const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  const mood =
    member && member.moodDate === todayKey && member.mood ? member.mood : ''

  // 1) 今日心情（最直观）
  if (mood === 'heavy' || mood === 'tired' || mood === 'sunny' || mood === 'warm') {
    const moodTip = buildMoodTip(name, mood)
    if (moodTip) return moodTip
  }

  // 2) 答案 / 在意标签里的语气
  const tone = senseAnswerTone([e.taOption, e.question].concat(concerns.slice(0, 6)))
  if (tone === 'heavy') {
    return `从最新的默契里，能感到 ${name} 心里有些沉，先接住感受会更好。`
  }
  if (tone === 'light') {
    return `${name} 最近流露出一些轻松的信号，可以顺着 TA 在意的事聊聊。`
  }

  // 3) 和前一阵不太一样（类别转向）
  if (recent.length >= 2) {
    const olderCats = recent.slice(1, 5).map((r) => r.category).filter(Boolean)
    if (olderCats.length && olderCats.indexOf(e.category) < 0) {
      return `${name} 和前一阵不太一样了：最近更转向「${cat}」。`
    }
  }

  // 4) 理解落差 / 心有灵犀
  if (e.match === '原来不一样') {
    return `你以为的 ${name}，和 TA 真实想法不太一样——值得再轻轻问一句。`
  }
  if (e.match === '心有灵犀') {
    return `你和 ${name} 刚对上了：关于「${cat}」，这次是心有灵犀。`
  }

  return `${name} 的画像又清晰了一点：近期更关于「${cat}」。`
}

function buildPortraitSummary(member, entries, opts) {
  const asElder = !!(opts && opts.asElder)
  const list = (entries || []).map(normalizeEntry)
  const name =
    (member && member.name) ||
    (list[0] && (list[0].subjectName || list[0].childName)) ||
    'TA'
  const about = (member && member.about) || {}
  const stageKeys =
    about.stages && about.stages.length
      ? about.stages
      : [about.stage || (asElder ? 'working' : 'other')]
  const stageKey = stageKeys[0]
  const stageLabel = stageKeys.map((k) => STAGE_LABEL[k] || k).join('、')
  const lead = STAGE_LEAD[stageKey] || STAGE_LEAD.other

  if (!list.length) {
    return {
      stageLabel,
      headline: `${name} · ${stageLabel}`,
      paragraphs: [
        asElder
          ? '还没有足够的软档案。等 TA 发出题目、家人答完之后，这里会按类别慢慢长出来。'
          : '还没有足够的默契答卷。等 TA 发出题目、家人答完之后，这里会根据题库类别生成当前阶段画像。'
      ],
      signals: [],
      stats: { total: 0, match: 0, cats: [] }
    }
  }

  const matchCount = list.filter((e) => e.match === '心有灵犀').length
  const byCat = groupByCategory(list)
  const catStats = CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    count: (byCat[c.key] || []).length
  })).filter((c) => c.count > 0)
  catStats.sort((a, b) => b.count - a.count)

  const signals = pickSignals(list)
  const topCat = catStats[0]
  const paragraphs = []
  paragraphs.push(lead)
  if (topCat) {
    paragraphs.push(
      `目前存档最集中的是「${topCat.label}」（${topCat.count} 条）。说明这段时间，TA 更想被家人看见的是这一面。`
    )
  }
  if (matchCount > 0) {
    paragraphs.push(
      `你们已有 ${matchCount}/${list.length} 次心有灵犀；不一致的题也同样珍贵——那是 TA 和你想象不同的地方。`
    )
  } else {
    paragraphs.push(
      `已收集 ${list.length} 条答卷。暂时还没有完全重合的答案——正好用来对照：TA 真正想要的，和你以为的，差在哪里。`
    )
  }
  const softConcerns = filterSoftSafeTags(about.concerns || [])
  if (!asElder && about.concerns && about.concerns.length) {
    paragraphs.push(`TA 标过的在意：${about.concerns.join('、')}。默契题会继续围着这些打转。`)
  } else if (asElder && softConcerns.length) {
    paragraphs.push(`TA 愿意让家人看见的在意：${softConcerns.join('、')}。`)
  }
  if (signals.length) {
    paragraphs.push(`从 TA 选过的答案里，可以读到：${signals.join('')}`)
  }

  return {
    stageLabel,
    headline: `${name} · ${stageLabel}`,
    paragraphs,
    signals,
    stats: {
      total: list.length,
      match: matchCount,
      cats: catStats
    }
  }
}

/** 孩子可见的父母软档案字段（过滤压力词；不含年龄） */
function softProfileFromMember(m) {
  const about = (m && m.about) || {}
  const note = about.note && isSoftSafe(about.note) ? about.note : ''
  return {
    concerns: filterSoftSafeTags(about.concerns || []),
    worlds: filterSoftSafeTags(about.worlds || []),
    wantUnderstood: filterSoftSafeTags(about.wantUnderstood || []),
    wantTogether: filterSoftSafeTags(about.wantTogether || []),
    note,
    hasAbout: !!m.about
  }
}

module.exports = {
  CATEGORIES,
  categoryOf,
  categoryLabel,
  normalizeEntry,
  groupByCategory,
  filterEntries,
  buildPortraitSummary,
  buildRecentTip,
  buildMoodTip,
  softProfileFromMember
}
