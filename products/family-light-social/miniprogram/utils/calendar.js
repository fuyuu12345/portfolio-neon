/**
 * 阳历 / 阴历工具 + 节日 & 生日匹配（1900–2100）
 * 阴历数据为常见开源表压缩，够家灯生日与传统节日判断。
 */

/* 1900–2100 农历年信息 */
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520
]

function leapMonth(y) {
  return LUNAR_INFO[y - 1900] & 0xf
}

function leapDays(y) {
  if (leapMonth(y)) return LUNAR_INFO[y - 1900] & 0x10000 ? 30 : 29
  return 0
}

function monthDays(y, m) {
  return LUNAR_INFO[y - 1900] & (0x10000 >> m) ? 30 : 29
}

function yearDays(y) {
  let sum = 348
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += LUNAR_INFO[y - 1900] & i ? 1 : 0
  }
  return sum + leapDays(y)
}

/** 公历 → 农历 { year, month, day, leap } */
function solarToLunar(sy, sm, sd) {
  const base = new Date(1900, 0, 31)
  const obj = new Date(sy, sm - 1, sd)
  let offset = Math.floor((obj - base) / 86400000)
  let i
  let temp = 0
  for (i = 1900; i < 2101 && offset > 0; i++) {
    temp = yearDays(i)
    offset -= temp
  }
  if (offset < 0) {
    offset += temp
    i--
  }
  const year = i
  const leap = leapMonth(year)
  let isLeap = false
  for (i = 1; i < 13 && offset > 0; i++) {
    if (leap > 0 && i === leap + 1 && !isLeap) {
      i--
      isLeap = true
      temp = leapDays(year)
    } else {
      temp = monthDays(year, i)
    }
    if (isLeap && i === leap + 1) isLeap = false
    offset -= temp
  }
  if (offset === 0 && leap > 0 && i === leap + 1) {
    if (isLeap) {
      isLeap = false
    } else {
      isLeap = true
      i--
    }
  }
  if (offset < 0) {
    offset += temp
    i--
  }
  return { year, month: i, day: offset + 1, leap: isLeap }
}

/** 农历 → 公历 { year, month, day }；MVP 不含闰月生日 */
function lunarToSolar(ly, lm, ld, isLeap) {
  const y = parseInt(ly, 10)
  const m = parseInt(lm, 10)
  const d = parseInt(ld, 10)
  if (!y || !m || !d) return null
  let offset = 0
  for (let i = 1900; i < y; i++) offset += yearDays(i)
  const leap = leapMonth(y)
  for (let i = 1; i < m; i++) {
    offset += monthDays(y, i)
    if (leap === i) offset += leapDays(y)
  }
  if (isLeap && leap === m) offset += monthDays(y, m)
  offset += d - 1
  const base = new Date(1900, 0, 31)
  const date = new Date(base.getTime() + offset * 86400000)
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  }
}

function formatCalSide(calendar, year, month, day, leap) {
  const name = calendar === 'lunar' ? '阴历' : '阳历'
  const y = year ? `${year}年` : ''
  const leapMark = calendar === 'lunar' && leap ? '闰' : ''
  return `${name} ${y}${leapMark}${month}月${day}日`
}

/**
 * 一侧填完 → 立刻算出另一侧（无年时用参照年换算月日）
 * @returns {{ solar, lunar, activeLabel, otherLabel, dualLabel }}
 */
function pairBirthday(calendar, year, month, day) {
  const cal = calendar === 'lunar' ? 'lunar' : 'solar'
  const m = parseInt(month, 10)
  const d = parseInt(day, 10)
  const yRaw = year ? parseInt(year, 10) : 0
  const refY = yRaw || new Date().getFullYear()
  if (!m || !d) return null

  if (cal === 'solar') {
    const lunar = solarToLunar(refY, m, d)
    const solar = { year: yRaw || '', month: m, day: d }
    const lunarSide = {
      year: yRaw ? lunar.year : '',
      month: lunar.month,
      day: lunar.day,
      leap: !!lunar.leap
    }
    const activeLabel = formatCalSide('solar', solar.year, solar.month, solar.day)
    const otherLabel = `对应${formatCalSide('lunar', lunarSide.year, lunarSide.month, lunarSide.day, lunarSide.leap)}`
    return {
      solar,
      lunar: lunarSide,
      activeLabel,
      otherLabel,
      dualLabel: `${activeLabel} · ${formatCalSide('lunar', lunarSide.year, lunarSide.month, lunarSide.day, lunarSide.leap)}`
    }
  }

  const solar = lunarToSolar(refY, m, d, false)
  if (!solar) return null
  const lunarSide = { year: yRaw || '', month: m, day: d, leap: false }
  const solarSide = {
    year: yRaw ? solar.year : '',
    month: solar.month,
    day: solar.day
  }
  const activeLabel = formatCalSide('lunar', lunarSide.year, lunarSide.month, lunarSide.day)
  const otherLabel = `对应${formatCalSide('solar', solarSide.year, solarSide.month, solarSide.day)}`
  return {
    solar: solarSide,
    lunar: lunarSide,
    activeLabel,
    otherLabel,
    dualLabel: `${activeLabel} · ${formatCalSide('solar', solarSide.year, solarSide.month, solarSide.day)}`
  }
}

function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`
}

function todayParts(date) {
  const d = date || new Date()
  return {
    y: d.getFullYear(),
    m: d.getMonth() + 1,
    d: d.getDate()
  }
}

function dayKey(date) {
  const t = todayParts(date)
  return `${t.y}-${t.m}-${t.d}`
}

/** birthday: { calendar:'solar'|'lunar', month, day, year? } */
function normalizeBirthday(b) {
  if (!b || !b.month || !b.day) return null
  const calendar = b.calendar === 'lunar' ? 'lunar' : 'solar'
  const month = parseInt(b.month, 10)
  const day = parseInt(b.day, 10)
  if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) return null
  const year = b.year ? parseInt(b.year, 10) : 0
  return { calendar, month, day, year: year || '' }
}

function isBirthdayToday(birthday, date) {
  const b = normalizeBirthday(birthday)
  if (!b) return false
  const t = todayParts(date)
  if (b.calendar === 'solar') {
    return b.month === t.m && b.day === t.d
  }
  const lunar = solarToLunar(t.y, t.m, t.d)
  // MVP：不按闰月匹配（填的是普通阴历月日）
  return !lunar.leap && lunar.month === b.month && lunar.day === b.day
}

function formatBirthday(birthday) {
  const b = normalizeBirthday(birthday)
  if (!b) return ''
  const cal = b.calendar === 'lunar' ? '阴历' : '阳历'
  const y = b.year ? `${b.year}年` : ''
  return `${cal} ${y}${b.month}月${b.day}日`
}

/** 由生日（含年）推算周岁；无年返回 '' */
function ageFromBirthday(calendarType, year, month, day, nowDate) {
  const y = parseInt(year, 10)
  const m = parseInt(month, 10)
  const d = parseInt(day, 10)
  if (!y || !m || !d || y < 1900 || y > 2100) return ''
  let sy = y
  let sm = m
  let sd = d
  if (calendarType === 'lunar') {
    const solar = lunarToSolar(y, m, d, false)
    if (!solar) return ''
    sy = solar.year
    sm = solar.month
    sd = solar.day
  }
  const now = nowDate || new Date()
  let age = now.getFullYear() - sy
  const nm = now.getMonth() + 1
  const nd = now.getDate()
  if (nm < sm || (nm === sm && nd < sd)) age -= 1
  if (age < 1 || age > 120) return ''
  return String(age)
}

/** 固定阳历节日 */
const SOLAR_FESTIVALS = [
  { m: 1, d: 1, name: '元旦' },
  { m: 3, d: 8, name: '妇女节' },
  { m: 5, d: 1, name: '劳动节' },
  { m: 6, d: 1, name: '儿童节' },
  { m: 9, d: 10, name: '教师节' },
  { m: 10, d: 1, name: '国庆节' }
]

/** 农历节日（非闰月） */
const LUNAR_FESTIVALS = [
  { m: 1, d: 1, name: '春节' },
  { m: 1, d: 15, name: '元宵节' },
  { m: 5, d: 5, name: '端午节' },
  { m: 7, d: 7, name: '七夕' },
  { m: 8, d: 15, name: '中秋节' },
  { m: 9, d: 9, name: '重阳节' }
]

/** 清明近似：4月4/5/6 */
function isQingming(y, m, d) {
  if (m !== 4) return false
  // 简化：近百年多在 4–6 日
  return d >= 4 && d <= 6
}

/** 某年某月第 n 个星期日的日号（month 1–12） */
function nthSunday(year, month, n) {
  const first = new Date(year, month - 1, 1)
  const dow = first.getDay() // 0=日
  const firstSunday = dow === 0 ? 1 : 8 - dow
  return firstSunday + (n - 1) * 7
}

function isMothersDay(y, m, d) {
  // 5 月第二个星期日
  return m === 5 && d === nthSunday(y, 5, 2)
}

function isFathersDay(y, m, d) {
  // 6 月第三个星期日
  return m === 6 && d === nthSunday(y, 6, 3)
}

function festivalsToday(date) {
  const t = todayParts(date)
  const list = []
  SOLAR_FESTIVALS.forEach((f) => {
    if (f.m === t.m && f.d === t.d) list.push(f.name)
  })
  if (isQingming(t.y, t.m, t.d)) list.push('清明节')
  if (isMothersDay(t.y, t.m, t.d)) list.push('母亲节')
  if (isFathersDay(t.y, t.m, t.d)) list.push('父亲节')
  const lunar = solarToLunar(t.y, t.m, t.d)
  if (!lunar.leap) {
    LUNAR_FESTIVALS.forEach((f) => {
      if (f.m === lunar.month && f.d === lunar.day) list.push(f.name)
    })
    // 除夕：下一天是春节
    const tomorrow = new Date(t.y, t.m - 1, t.d + 1)
    const tl = solarToLunar(tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate())
    if (!tl.leap && tl.month === 1 && tl.day === 1) list.push('除夕')
  }
  return list
}

const WISH_TEMPLATES = {
  birthday: ['生日快乐！愿你被好好照顾，也好好照顾自己。', '又长大一岁啦，家里有你真好。', '生日快乐，今天想怎么过都行。'],
  festival: ['节日快乐，家人平安就好。', '今天想你们了，一切顺利。', '节日快乐，记得好好吃饭休息。'],
  mothers: ['妈妈节日快乐，谢谢你一直在。', '母亲节快乐，今天想好好抱抱你。', '妈妈，辛苦了，今天多休息一会儿。'],
  fathers: ['爸爸节日快乐，谢谢你一直护着家。', '父亲节快乐，今天想跟你说声谢谢。', '爸爸，注意身体，别太拼了。']
}

/**
 * 今日家庭庆祝事项
 * @returns {{ kind:'birthday'|'festival', title:string, subtitle:string, toUserId?:string, toName?:string, templates:string[] }[]}
 */
function occasionsToday(members, date) {
  const out = []
  ;(members || []).forEach((m) => {
    if (isBirthdayToday(m.birthday, date)) {
      out.push({
        kind: 'birthday',
        title: `今天是 ${m.name} 的生日`,
        subtitle: formatBirthday(m.birthday),
        toUserId: m.userId,
        toName: m.name,
        templates: WISH_TEMPLATES.birthday
      })
    }
  })
  festivalsToday(date).forEach((name) => {
    let templates = WISH_TEMPLATES.festival
    let targets = [{ userId: '', name: '家人' }]
    if (name === '母亲节') {
      templates = WISH_TEMPLATES.mothers
      const moms = (members || []).filter(
        (m) =>
          (m.role || '') === 'elder' &&
          /妈|母|娘/.test(m.name || '')
      )
      const elders = moms.length
        ? moms
        : (members || []).filter((m) => (m.role || '') === 'elder')
      if (elders.length) {
        targets = elders.map((m) => ({ userId: m.userId, name: m.name }))
      }
    } else if (name === '父亲节') {
      templates = WISH_TEMPLATES.fathers
      const dads = (members || []).filter(
        (m) =>
          (m.role || '') === 'elder' &&
          /爸|父|爹/.test(m.name || '')
      )
      const elders = dads.length
        ? dads
        : (members || []).filter((m) => (m.role || '') === 'elder')
      if (elders.length) {
        targets = elders.map((m) => ({ userId: m.userId, name: m.name }))
      }
    }
    targets.forEach((t) => {
      out.push({
        kind: 'festival',
        title: `今天是${name}`,
        subtitle: t.userId ? `送给 ${t.name}` : '给家人送一句祝福吧',
        toUserId: t.userId,
        toName: t.name,
        templates
      })
    })
  })
  return out
}

function monthOptions() {
  return Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
}

function dayOptions(max) {
  const n = max || 31
  return Array.from({ length: n }, (_, i) => `${i + 1}日`)
}

/** 阴历滚轮用：含「不填年」 */
function yearOptions(from = 1900, to) {
  const end = to || new Date().getFullYear()
  const list = ['不填年']
  for (let y = end; y >= from; y--) list.push(`${y}年`)
  return list
}

function pad2(n) {
  return `${n}`.padStart(2, '0')
}

/** 阳历 date picker 的 value：YYYY-MM-DD */
function toSolarPickerValue(year, month, day) {
  const y = year || 2000
  return `${y}-${pad2(month || 1)}-${pad2(day || 1)}`
}

function daysInMonth(calendar, month, year) {
  if (calendar === 'lunar') return 30
  if ([1, 3, 5, 7, 8, 10, 12].indexOf(month) >= 0) return 31
  if (month === 2) {
    const y = parseInt(year, 10)
    if (y) {
      const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
      return leap ? 29 : 28
    }
    return 29
  }
  return 30
}

module.exports = {
  solarToLunar,
  lunarToSolar,
  pairBirthday,
  formatCalSide,
  normalizeBirthday,
  isBirthdayToday,
  formatBirthday,
  ageFromBirthday,
  festivalsToday,
  occasionsToday,
  dayKey,
  monthOptions,
  dayOptions,
  yearOptions,
  toSolarPickerValue,
  daysInMonth,
  WISH_TEMPLATES
}
