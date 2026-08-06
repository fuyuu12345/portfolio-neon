/**
 * 本地存储版家庭数据（同设备可测）
 * 上线给朋友跨手机用：在 utils/cloud.js 填 CLOUD_ENV，并按 README 开云开发。
 */

const cloud = require('./cloud')
const calendar = require('./calendar')
const DB_KEY = 'jd_db_v1'

function readDb() {
  return wx.getStorageSync(DB_KEY) || { families: {} }
}

function writeDb(db) {
  wx.setStorageSync(DB_KEY, db)
}

function code6() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

function hydrate(app) {
  const userId = app.globalData.userId
  const db = readDb()
  const famId = wx.getStorageSync('jd_family_id')
  if (!famId || !db.families[famId]) return
  const family = db.families[famId]
  const member = (family.members || []).find((m) => m.userId === userId) || null
  app.globalData.family = family
  app.globalData.member = member
}

function getFamily() {
  const app = getApp()
  return app.globalData.family
}

function getMember() {
  const app = getApp()
  return app.globalData.member
}

function saveFamily(family) {
  const db = readDb()
  db.families[family.id] = family
  writeDb(db)
  const app = getApp()
  app.globalData.family = family
  const userId = app.globalData.userId
  app.globalData.member = (family.members || []).find((m) => m.userId === userId) || null
  wx.setStorageSync('jd_family_id', family.id)
  if (cloud.enabled()) cloud.pushFamily(family)
}

function joinFamilyAsync(familyId, name) {
  const id = (familyId || '').trim().toUpperCase()
  if (!cloud.enabled()) {
    return Promise.resolve(joinFamily(id, name))
  }
  return cloud.pullFamily(id).then((remote) => {
    if (remote) {
      const db = readDb()
      db.families[id] = remote
      writeDb(db)
    }
    return joinFamily(id, name)
  })
}

function createFamily(name) {
  const app = getApp()
  const userId = app.globalData.userId
  let id = code6()
  const db = readDb()
  while (db.families[id]) id = code6()

  const member = {
    userId,
    name: name || '我',
    role: 'child',
    age: '',
    status: 'green',
    statusText: '在家',
    mood: '',
    moodDate: '',
    call: 'ok',
    callVoice: true,
    callVideo: true,
    outReturn: '',
    outPlace: '',
    outWho: '',
    birthday: null,
    residence: '',
    about: null,
    updatedAt: Date.now()
  }

  const family = {
    id,
    familyName: '我们家',
    createdAt: Date.now(),
    members: [member],
    posts: [],
    wishes: [],
    nudges: [],
    portraitTips: [],
    quizzes: [],
    childArchives: {},
    elderArchives: {}
  }
  saveFamily(family)
  return family
}

function joinFamily(familyId, name) {
  const app = getApp()
  const userId = app.globalData.userId
  const db = readDb()
  const id = (familyId || '').trim().toUpperCase()
  const family = db.families[id]
  if (!family) {
    return { ok: false, msg: '家庭码无效。若朋友在另一部手机创建，需开通云开发才能跨设备加入。' }
  }
  let member = family.members.find((m) => m.userId === userId)
  if (!member) {
    member = {
      userId,
      name: name || '家人',
      role: 'elder',
      age: '',
      status: 'green',
      statusText: '在家',
      mood: '',
      moodDate: '',
      call: 'ok',
      callVoice: true,
      callVideo: true,
      outReturn: '',
      outPlace: '',
      outWho: '',
      birthday: null,
      residence: '',
      about: null,
      updatedAt: Date.now()
    }
    family.members.push(member)
  } else if (name) {
    member.name = name
  }
  saveFamily(family)
  return { ok: true, family }
}

function updateMe(patch) {
  const family = getFamily()
  const app = getApp()
  if (!family) return null
  const userId = app.globalData.userId
  const member = family.members.find((m) => m.userId === userId)
  if (!member) return null
  Object.assign(member, patch, { updatedAt: Date.now() })
  saveFamily(family)
  return member
}

/** 仅晚辈可改家的名字 */
function setFamilyName(familyName) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return { ok: false, msg: '未加入家庭' }
  if ((member.role || 'child') !== 'child') {
    return { ok: false, msg: '家的名字由晚辈来取' }
  }
  const name = (familyName || '').trim()
  if (!name) return { ok: false, msg: '请填写家的名字' }
  if (name.length > 12) return { ok: false, msg: '最多 12 个字' }
  family.familyName = name
  saveFamily(family)
  return { ok: true, family }
}

function dayKeyFrom(ts) {
  const d = new Date(ts || Date.now())
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** 节日/生日祝福（不占每日动态额度） */
function addWish(payload) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return { ok: false, msg: '未加入家庭' }
  const message = (payload && payload.message ? String(payload.message) : '').trim()
  if (!message) return { ok: false, msg: '写一句祝福吧' }
  if (message.length > 80) return { ok: false, msg: '祝福最多 80 字' }
  if (!family.wishes) family.wishes = []
  const dayKey = dayKeyFrom()
  family.wishes.unshift({
    id: `w_${Date.now()}`,
    fromUserId: member.userId,
    fromName: member.name,
    toUserId: (payload && payload.toUserId) || '',
    toName: (payload && payload.toName) || '家人',
    occasion: (payload && payload.occasion) || '祝福',
    kind: (payload && payload.kind) || 'festival',
    message,
    dayKey,
    createdAt: Date.now()
  })
  // 只留最近 80 条
  if (family.wishes.length > 80) family.wishes = family.wishes.slice(0, 80)
  saveFamily(family)
  return { ok: true }
}

function listWishesToday() {
  const family = getFamily()
  if (!family) return []
  const dayKey = dayKeyFrom()
  return (family.wishes || []).filter((w) => (w.dayKey || dayKeyFrom(w.createdAt)) === dayKey)
}

function hasPostedOnDay(userId, dayKey) {
  const family = getFamily()
  if (!family) return false
  const key = dayKey || dayKeyFrom()
  return (family.posts || []).some(
    (p) => p.userId === userId && (p.dayKey || dayKeyFrom(p.createdAt)) === key
  )
}

/**
 * 提醒家人：come_see 来看看动态；please_post 还没更的也来一更
 * @returns {{ ok:boolean, msg?:string, count?:number }}
 */
function nudgeFamily(mode, postId) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return { ok: false, msg: '未加入家庭' }
  const dayKey = dayKeyFrom()
  const kind = mode === 'please_post' ? 'please_post' : 'come_see'
  let targets = (family.members || []).filter((m) => m.userId !== member.userId)
  if (kind === 'please_post') {
    targets = targets.filter((m) => !hasPostedOnDay(m.userId, dayKey))
  }
  if (!targets.length) {
    return {
      ok: false,
      msg: kind === 'please_post' ? '大家都已一更，或没有其他家人' : '没有其他家人可提醒'
    }
  }
  if (!family.nudges) family.nudges = []
  // 同日同人对同人同类型只留最新一条
  family.nudges = family.nudges.filter((n) => {
    if (n.dayKey !== dayKey || n.fromUserId !== member.userId || n.kind !== kind) return true
    return targets.every((t) => t.userId !== n.toUserId)
  })
  const text =
    kind === 'please_post'
      ? `${member.name} 提醒你：今天也来一更吧`
      : `${member.name} 今日已更新，提醒你来看看`
  targets.forEach((t, i) => {
    family.nudges.unshift({
      id: `n_${Date.now()}_${i}_${t.userId}`,
      fromUserId: member.userId,
      fromName: member.name,
      toUserId: t.userId,
      toName: t.name,
      kind,
      postId: postId || '',
      text,
      dayKey,
      createdAt: Date.now(),
      read: false
    })
  })
  if (family.nudges.length > 120) family.nudges = family.nudges.slice(0, 120)
  saveFamily(family)
  return { ok: true, count: targets.length }
}

/** 我收到的未读提醒（今日） */
function listMyNudges() {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return []
  const dayKey = dayKeyFrom()
  return (family.nudges || []).filter(
    (n) => n.toUserId === member.userId && n.dayKey === dayKey && !n.read
  )
}

function dismissNudge(nudgeId) {
  const family = getFamily()
  if (!family || !family.nudges) return { ok: false }
  const n = family.nudges.find((x) => x.id === nudgeId)
  if (!n) return { ok: false, msg: '提醒不存在' }
  n.read = true
  saveFamily(family)
  return { ok: true }
}

function dismissAllMyNudges() {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return { ok: false }
  const dayKey = dayKeyFrom()
  ;(family.nudges || []).forEach((n) => {
    if (n.toUserId === member.userId && n.dayKey === dayKey) n.read = true
  })
  saveFamily(family)
  return { ok: true }
}

function addPost(content, imagePath) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return { ok: false, msg: '未加入家庭' }
  const dayKey = dayKeyFrom()
  const already = (family.posts || []).some(
    (p) => p.userId === member.userId && (p.dayKey || dayKeyFrom(p.createdAt)) === dayKey
  )
  if (already) {
    return { ok: false, msg: '今日已更新，每人每天一条。发错可先删除再发。' }
  }
  const post = {
    id: `p_${Date.now()}`,
    userId: member.userId,
    name: member.name,
    content: content || '',
    imagePath: imagePath || '',
    dayKey,
    createdAt: Date.now(),
    reactions: [],
    comments: []
  }
  family.posts.unshift(post)
  saveFamily(family)
  return { ok: true, postId: post.id }
}

function deletePost(postId) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return { ok: false, msg: '未加入家庭' }
  const idx = (family.posts || []).findIndex((p) => p.id === postId)
  if (idx < 0) return { ok: false, msg: '动态不存在' }
  const post = family.posts[idx]
  if (post.userId !== member.userId) {
    return { ok: false, msg: '只能删除自己发的动态' }
  }
  family.posts.splice(idx, 1)
  saveFamily(family)
  return { ok: true }
}

/** 表情快捷反应：同人同表情再点则取消；换表情则替换 */
function reactPost(postId, emoji) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return { ok: false, msg: '未加入家庭' }
  const post = family.posts.find((p) => p.id === postId)
  if (!post) return { ok: false, msg: '动态不存在' }
  post.reactions = post.reactions || []
  const mineIdx = post.reactions.findIndex((r) => r.userId === member.userId)
  if (mineIdx >= 0) {
    if (post.reactions[mineIdx].emoji === emoji) {
      post.reactions.splice(mineIdx, 1)
    } else {
      post.reactions[mineIdx] = {
        userId: member.userId,
        name: member.name,
        emoji,
        at: Date.now()
      }
    }
  } else {
    post.reactions.push({
      userId: member.userId,
      name: member.name,
      emoji,
      at: Date.now()
    })
  }
  saveFamily(family)
  return { ok: true }
}

function addComment(postId, text) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return { ok: false, msg: '未加入家庭' }
  const content = (text || '').trim().replace(/\s+/g, ' ')
  if (!content) return { ok: false, msg: '写点评论吧' }
  if (content.length > 80) return { ok: false, msg: '评论最多 80 字' }
  const post = family.posts.find((p) => p.id === postId)
  if (!post) return { ok: false, msg: '动态不存在' }
  post.comments = post.comments || []
  post.comments.push({
    id: `c_${Date.now()}_${Math.floor(Math.random() * 999)}`,
    userId: member.userId,
    name: member.name,
    text: content,
    createdAt: Date.now()
  })
  if (post.comments.length > 100) post.comments = post.comments.slice(-100)
  saveFamily(family)
  return { ok: true }
}

function deleteComment(postId, commentId) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return { ok: false, msg: '未加入家庭' }
  const post = family.posts.find((p) => p.id === postId)
  if (!post) return { ok: false, msg: '动态不存在' }
  post.comments = post.comments || []
  const idx = post.comments.findIndex((c) => c.id === commentId)
  if (idx < 0) return { ok: false, msg: '评论不存在' }
  const c = post.comments[idx]
  const isAuthor = c.userId === member.userId
  const isPostOwner = post.userId === member.userId
  if (!isAuthor && !isPostOwner) {
    return { ok: false, msg: '只能删自己的评论' }
  }
  post.comments.splice(idx, 1)
  saveFamily(family)
  return { ok: true }
}

function listPostDays() {
  const family = getFamily()
  if (!family) return []
  const set = {}
  ;(family.posts || []).forEach((p) => {
    const k = p.dayKey || dayKeyFrom(p.createdAt)
    set[k] = true
  })
  return Object.keys(set).sort((a, b) => {
    const [ay, am, ad] = a.split('-').map(Number)
    const [by, bm, bd] = b.split('-').map(Number)
    return new Date(by, bm - 1, bd) - new Date(ay, am - 1, ad)
  })
}

function createQuiz(payload) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return null
  const fromRole = member.role || 'child'
  const quiz = {
    id: `q_${Date.now()}`,
    fromId: member.userId,
    fromName: member.name,
    fromRole,
    question: payload.question,
    options: payload.options,
    answerIndex: payload.answerIndex,
    layer: payload.layer || '',
    targetIds: payload.targetIds || [],
    createdAt: Date.now(),
    answers: {},
    notes: []
  }
  family.quizzes.unshift(quiz)
  saveFamily(family)
  return quiz
}

/** 发起人撤回题目（可重新选人再发）；同步清掉该题档案 */
function recallQuiz(quizId) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return { ok: false, msg: '未加入家庭' }
  const idx = (family.quizzes || []).findIndex((q) => q.id === quizId)
  if (idx < 0) return { ok: false, msg: '题目不存在' }
  const quiz = family.quizzes[idx]
  if (quiz.fromId !== member.userId) {
    return { ok: false, msg: '只能撤回自己发的题' }
  }
  const answerCount = Object.keys(quiz.answers || {}).length
  family.quizzes.splice(idx, 1)

  function stripArchive(bag) {
    if (!bag) return
    Object.keys(bag).forEach((uid) => {
      bag[uid] = (bag[uid] || []).filter((e) => e.quizId !== quizId)
    })
  }
  stripArchive(family.childArchives)
  stripArchive(family.elderArchives)

  saveFamily(family)
  return {
    ok: true,
    hadAnswers: answerCount > 0,
    quiz: {
      question: quiz.question,
      options: (quiz.options || []).slice(),
      layer: quiz.layer || '',
      answerIndex: quiz.answerIndex,
      targetIds: (quiz.targetIds || []).slice()
    }
  }
}

function answerQuiz(quizId, optionIndex) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return null
  const quiz = family.quizzes.find((q) => q.id === quizId)
  if (!quiz) return null
  quiz.answers[member.userId] = {
    name: member.name,
    optionIndex,
    at: Date.now()
  }

  // 答完写入被了解方的档案：晚辈出题→childArchives；长辈出题→elderArchives（软档案）
  if (member.userId !== quiz.fromId) {
    const portrait = require('./portrait')
    const same = optionIndex === quiz.answerIndex
    const layer = quiz.layer || ''
    const fromRole = quiz.fromRole || 'child'
    const base = {
      id: `a_${Date.now()}`,
      quizId: quiz.id,
      question: quiz.question,
      layer,
      category: portrait.categoryOf(layer),
      options: quiz.options,
      subjectId: quiz.fromId,
      subjectName: quiz.fromName,
      subjectAnswerIndex: quiz.answerIndex,
      subjectOption: quiz.options[quiz.answerIndex],
      peerId: member.userId,
      peerName: member.name,
      peerAnswerIndex: optionIndex,
      peerOption: quiz.options[optionIndex],
      match: same ? '心有灵犀' : '原来不一样',
      at: Date.now()
    }

    if (fromRole === 'elder') {
      family.elderArchives = family.elderArchives || {}
      const elderId = quiz.fromId
      const list = family.elderArchives[elderId] || []
      const entry = {
        ...base,
        elderId,
        elderName: quiz.fromName,
        elderAnswerIndex: quiz.answerIndex,
        elderOption: quiz.options[quiz.answerIndex],
        childId: member.userId,
        childName: member.name,
        childReplyOption: quiz.options[optionIndex],
        // 兼容旧字段命名（搜索 / 展示）
        childOption: quiz.options[quiz.answerIndex],
        parentOption: quiz.options[optionIndex],
        parentId: member.userId,
        parentName: member.name
      }
      const filtered = list.filter(
        (x) => !(x.quizId === quiz.id && x.peerId === member.userId)
      )
      filtered.unshift(entry)
      family.elderArchives[elderId] = filtered
      addPortraitTip(family, entry, {
        member: (family.members || []).find((m) => m.userId === elderId),
        recentEntries: filtered
      })
    } else {
      family.childArchives = family.childArchives || {}
      const childId = quiz.fromId
      const list = family.childArchives[childId] || []
      const entry = {
        ...base,
        childName: quiz.fromName,
        childAnswerIndex: quiz.answerIndex,
        childOption: quiz.options[quiz.answerIndex],
        parentId: member.userId,
        parentName: member.name,
        parentAnswerIndex: optionIndex,
        parentOption: quiz.options[optionIndex]
      }
      const filtered = list.filter(
        (x) => !(x.quizId === quiz.id && x.parentId === member.userId)
      )
      filtered.unshift(entry)
      family.childArchives[childId] = filtered
      addPortraitTip(family, entry, {
        member: (family.members || []).find((m) => m.userId === childId),
        recentEntries: filtered
      })
    }
  }

  saveFamily(family)
  return quiz
}

function pushPortraitTip(family, tip) {
  if (!family || !tip || !tip.text) return
  if (!family.portraitTips) family.portraitTips = []
  // 同一人同一天同文案不重复刷
  const dup = family.portraitTips.find(
    (t) =>
      t.subjectUserId === tip.subjectUserId &&
      t.dayKey === tip.dayKey &&
      t.text === tip.text
  )
  if (dup) return
  family.portraitTips.unshift(
    Object.assign(
      {
        id: `pt_${Date.now()}`,
        dayKey: dayKeyFrom(),
        createdAt: Date.now(),
        dismissedBy: []
      },
      tip
    )
  )
  if (family.portraitTips.length > 40) {
    family.portraitTips = family.portraitTips.slice(0, 40)
  }
}

/** 画像变化提示（写入 family，不单独 save） */
function addPortraitTip(family, entry, ctx) {
  if (!family || !entry) return
  const portrait = require('./portrait')
  const text = portrait.buildRecentTip(entry, ctx || {})
  if (!text) return
  pushPortraitTip(family, {
    subjectUserId: entry.subjectId || entry.elderId || entry.childId || '',
    subjectName: entry.subjectName || entry.elderName || entry.childName || '家人',
    category: entry.category || '',
    quizId: entry.quizId || '',
    kind: 'quiz',
    text
  })
}

/** 家人改今日心情 → 感觉向提示 */
function addMoodPortraitTip(mood) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member || !mood) return { ok: false }
  const portrait = require('./portrait')
  const text = portrait.buildMoodTip(member.name, mood)
  if (!text) return { ok: false }
  pushPortraitTip(family, {
    subjectUserId: member.userId,
    subjectName: member.name || '家人',
    category: '',
    quizId: '',
    kind: 'mood',
    text
  })
  saveFamily(family)
  return { ok: true }
}

/** 给当前用户看的未读近期画像提示（不含自己当主体的可看，家人都能看） */
function listPortraitTips() {
  const family = getFamily()
  const member = getMember()
  if (!family || !member) return []
  const myId = member.userId
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return (family.portraitTips || [])
    .filter((t) => {
      if (!t || t.createdAt < weekAgo) return false
      if ((t.dismissedBy || []).indexOf(myId) >= 0) return false
      // 主体本人不弹「给家人看」的提示，避免自己刷自己
      if (t.subjectUserId && t.subjectUserId === myId) return false
      return true
    })
    .slice(0, 5)
}

function dismissPortraitTip(tipId) {
  const family = getFamily()
  const member = getMember()
  if (!family || !member || !family.portraitTips) return { ok: false }
  const tip = family.portraitTips.find((t) => t.id === tipId)
  if (!tip) return { ok: false }
  if (!tip.dismissedBy) tip.dismissedBy = []
  if (tip.dismissedBy.indexOf(member.userId) < 0) {
    tip.dismissedBy.push(member.userId)
  }
  saveFamily(family)
  return { ok: true }
}

function getChildArchives() {
  const family = getFamily()
  if (!family) return []
  const archives = family.childArchives || {}
  const members = family.members || []
  return Object.keys(archives).map((childId) => {
    const child = members.find((m) => m.userId === childId)
    const entries = archives[childId] || []
    const layers = {}
    entries.forEach((e) => {
      const k = e.layer || '未分类'
      if (!layers[k]) layers[k] = []
      layers[k].push(e)
    })
    return {
      childId,
      childName: (child && child.name) || (entries[0] && entries[0].childName) || '孩子',
      count: entries.length,
      entries,
      layers
    }
  })
}

const STAGE_TEXT = {
  student: '学生',
  junior: '初入职场',
  settled: '已独立生活',
  other: '其他',
  working: '仍在工作',
  retire: '退休前后',
  care: '需多照顾'
}

function stageLabelOf(about) {
  const keys =
    about && about.stages && about.stages.length
      ? about.stages
      : about && about.stage
        ? [about.stage]
        : []
  if (!keys.length) return '未填写阶段'
  return keys.map((k) => STAGE_TEXT[k] || k).join('、')
}

/** 父母可点选的晚辈列表（含档案摘要 + 画像存档） */
function listJuniorProfiles() {
  const family = getFamily()
  if (!family) return []
  const archives = family.childArchives || {}
  return (family.members || [])
    .filter((m) => (m.role || 'child') === 'child')
    .map((m) => {
      const about = m.about || {}
      const entries = archives[m.userId] || []
      return {
        id: m.userId,
        childId: m.userId,
        name: m.name || '晚辈',
        childName: m.name || '晚辈',
        kind: 'child',
        age: m.age || '',
        birthday: m.birthday || null,
        birthdayLabel: calendar.formatBirthday(m.birthday),
        roleLabel: '子女 / 晚辈',
        stage: about.stage || '',
        stageLabel: stageLabelOf(about),
        concerns: about.concerns || [],
        worlds: about.worlds || [],
        wantUnderstood: about.wantUnderstood || [],
        wantTogether: about.wantTogether || [],
        note: about.note || '',
        hasAbout: !!m.about,
        entries,
        count: entries.length,
        member: m
      }
    })
}

/** 晚辈可看的长辈软档案列表（不含年龄；压力词已过滤） */
function listElderSoftProfiles() {
  const family = getFamily()
  if (!family) return []
  const portrait = require('./portrait')
  const archives = family.elderArchives || {}
  return (family.members || [])
    .filter((m) => (m.role || '') === 'elder')
    .map((m) => {
      const about = m.about || {}
      const soft = portrait.softProfileFromMember(m)
      const entries = archives[m.userId] || []
      return {
        id: m.userId,
        name: m.name || '长辈',
        kind: 'elder',
        birthday: m.birthday || null,
        birthdayLabel: calendar.formatBirthday(m.birthday),
        roleLabel: '父母 / 长辈',
        stage: about.stage || '',
        stageLabel: stageLabelOf(about),
        concerns: soft.concerns,
        worlds: soft.worlds,
        wantUnderstood: soft.wantUnderstood,
        wantTogether: soft.wantTogether,
        note: soft.note,
        hasAbout: soft.hasAbout,
        entries,
        count: entries.length,
        member: m
      }
    })
}

/**
 * 除自己外，所有家庭成员档案都可看。
 * 长辈：软档案（过滤压力词、不露年龄字段）；晚辈：个人档案 + 默契存档。
 */
function listViewableProfiles() {
  const family = getFamily()
  const me = getMember()
  if (!family || !me) return []
  const myId = me.userId
  const portrait = require('./portrait')
  const childArchives = family.childArchives || {}
  const elderArchives = family.elderArchives || {}

  return (family.members || [])
    .filter((m) => m.userId !== myId)
    .map((m) => {
      const about = m.about || {}
      const isElder = (m.role || '') === 'elder'
      if (isElder) {
        const soft = portrait.softProfileFromMember(m)
        const entries = elderArchives[m.userId] || []
        return {
          id: m.userId,
          name: m.name || '长辈',
          kind: 'elder',
          birthday: m.birthday || null,
          birthdayLabel: calendar.formatBirthday(m.birthday),
          roleLabel: '父母 / 长辈',
        stage: about.stage || '',
        stages: about.stages || (about.stage ? [about.stage] : []),
        stageLabel: stageLabelOf(about),
        residence: m.residence || about.residence || '',
        concerns: soft.concerns,
        worlds: soft.worlds,
        wantUnderstood: soft.wantUnderstood,
        wantTogether: soft.wantTogether,
        note: soft.note,
        hasAbout: soft.hasAbout,
        entries,
        count: entries.length,
        member: m
      }
      }
      const entries = childArchives[m.userId] || []
      return {
        id: m.userId,
        childId: m.userId,
        name: m.name || '晚辈',
        childName: m.name || '晚辈',
        kind: 'child',
        birthday: m.birthday || null,
        birthdayLabel: calendar.formatBirthday(m.birthday),
        roleLabel: '子女 / 晚辈',
        stage: about.stage || '',
        stages: about.stages || (about.stage ? [about.stage] : []),
        stageLabel: stageLabelOf(about),
        residence: m.residence || about.residence || '',
        concerns: about.concerns || [],
        worlds: about.worlds || [],
        wantUnderstood: about.wantUnderstood || [],
        wantTogether: about.wantTogether || [],
        note: about.note || '',
        hasAbout: !!m.about,
        entries,
        count: entries.length,
        member: m
      }
    })
}

function leaveFamily() {
  wx.removeStorageSync('jd_family_id')
  const app = getApp()
  app.globalData.family = null
  app.globalData.member = null
}

/** 从云端拉最新家庭（首页 / 动态 onShow 可调用） */
function syncFromCloud() {
  const family = getFamily()
  if (!family || !cloud.enabled()) return Promise.resolve(family)
  return cloud.pullFamily(family.id).then((remote) => {
    if (!remote) return family
    const db = readDb()
    db.families[family.id] = remote
    writeDb(db)
    const app = getApp()
    app.globalData.family = remote
    app.globalData.member =
      (remote.members || []).find((m) => m.userId === app.globalData.userId) || null
    return remote
  })
}

module.exports = {
  hydrate,
  getFamily,
  getMember,
  createFamily,
  joinFamily,
  joinFamilyAsync,
  updateMe,
  setFamilyName,
  addWish,
  listWishesToday,
  addPost,
  hasPostedOnDay,
  nudgeFamily,
  listMyNudges,
  dismissNudge,
  dismissAllMyNudges,
  deletePost,
  reactPost,
  addComment,
  deleteComment,
  listPostDays,
  dayKeyFrom,
  createQuiz,
  recallQuiz,
  answerQuiz,
  listPortraitTips,
  dismissPortraitTip,
  addMoodPortraitTip,
  getChildArchives,
  listJuniorProfiles,
  listElderSoftProfiles,
  listViewableProfiles,
  leaveFamily,
  saveFamily,
  syncFromCloud
}
