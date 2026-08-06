/**
 * 今日默契题卡：每天最多换题 20 次，达上限后只能在今日题卡内循环。
 */
const MAX_RESHUFFLE = 20
const DAY_KEY = 'jd_quiz_day_v5'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function readDay(userId) {
  const all = wx.getStorageSync(DAY_KEY) || {}
  const row = all[userId]
  if (!row || row.date !== todayKey()) {
    return { date: todayKey(), cards: [], reshuffles: 0, index: 0 }
  }
  return row
}

function writeDay(userId, row) {
  const all = wx.getStorageSync(DAY_KEY) || {}
  all[userId] = row
  wx.setStorageSync(DAY_KEY, all)
}

function ensureDayDeck(userId, about, matchQuestions) {
  let row = readDay(userId)
  if (!row.cards || !row.cards.length) {
    row = {
      date: todayKey(),
      cards: matchQuestions(about || { role: 'child' }, MAX_RESHUFFLE),
      reshuffles: 0,
      index: 0
    }
    writeDay(userId, row)
  }
  return row
}

function currentCard(row) {
  if (!row.cards.length) return { question: '', options: [], layer: '' }
  const i = ((row.index % row.cards.length) + row.cards.length) % row.cards.length
  return row.cards[i]
}

/** 换一题：未达上限才推进并计数；达上限返回 hitLimit */
function reshuffleDay(userId) {
  const row = readDay(userId)
  if (row.reshuffles >= MAX_RESHUFFLE) {
    return { ok: false, hitLimit: true, row, current: currentCard(row) }
  }
  row.reshuffles += 1
  row.index = (row.index + 1) % Math.max(row.cards.length, 1)
  writeDay(userId, row)
  return { ok: true, hitLimit: false, row, current: currentCard(row) }
}

/** 发出后切到下一张（循环今日题卡，不计入换题次数） */
function cycleAfterSend(userId) {
  const row = readDay(userId)
  if (!row.cards.length) return { row, current: currentCard(row) }
  row.index = (row.index + 1) % row.cards.length
  writeDay(userId, row)
  return { row, current: currentCard(row) }
}

function reshufflesLeft(row) {
  return Math.max(0, MAX_RESHUFFLE - (row.reshuffles || 0))
}

module.exports = {
  MAX_RESHUFFLE,
  ensureDayDeck,
  currentCard,
  reshuffleDay,
  cycleAfterSend,
  reshufflesLeft,
  todayKey
}
