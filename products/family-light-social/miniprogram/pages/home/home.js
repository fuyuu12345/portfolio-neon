const store = require('../../utils/store')
const calendar = require('../../utils/calendar')
const weather = require('../../utils/weather')

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function pad2(n) {
  return `${n}`.padStart(2, '0')
}

function nowClock() {
  const d = new Date()
  return {
    todayLabel: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`,
    todayWeek: WEEKDAYS[d.getDay()],
    nowTime: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  }
}

const LIGHT_LABEL = {
  green: '绿 · 空闲',
  yellow: '黄 · 空闲但不想被打扰',
  red: '红 · 有点忙，别打扰'
}

const MOOD_OPTIONS = [
  { key: 'sunny', emoji: '☀️', text: '挺好' },
  { key: 'calm', emoji: '🫧', text: '平静' },
  { key: 'tired', emoji: '😮‍💨', text: '有点累' },
  { key: 'heavy', emoji: '🌧️', text: '低落' },
  { key: 'warm', emoji: '🤗', text: '想被关心' }
]

const MOOD_MAP = MOOD_OPTIONS.reduce((acc, m) => {
  acc[m.key] = `${m.emoji} ${m.text}`
  return acc
}, {})

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function resolveMood(member) {
  if (!member) return { mood: '', moodLabel: '未写心情' }
  if (member.moodDate !== todayKey() || !member.mood) {
    return { mood: '', moodLabel: '未写心情' }
  }
  return {
    mood: member.mood,
    moodLabel: MOOD_MAP[member.mood] || member.mood
  }
}

function detailLine(m) {
  const parts = []
  const time = (m.outReturn || '').trim()
  const place = (m.outPlace || '').trim()
  const who = (m.outWho || '').trim()
  if (time) parts.push(time)
  if (place) parts.push(place)
  if (who) parts.push(who)
  return parts.join(' · ')
}

function resolveCallPrefs(m) {
  let voice = m.callVoice
  let video = m.callVideo
  if (typeof voice !== 'boolean' && typeof video !== 'boolean') {
    if (m.call === 'ok') {
      voice = true
      video = true
    } else {
      voice = false
      video = false
    }
  }
  return {
    callVoice: !!voice,
    callVideo: !!video
  }
}

function callDisplayFor(m) {
  const status = m.status || 'green'
  if (status === 'red') return '暂时不通话'
  if (status === 'yellow') return '通话需要提前文字沟通'
  const { callVoice, callVideo } = resolveCallPrefs(m)
  if (callVoice && callVideo) return '通话、视频都可以'
  if (callVoice) return '可以通话'
  if (callVideo) return '可以视频'
  return '暂未勾选通话/视频'
}

function detailDefaults(status) {
  return {
    green: '空闲',
    yellow: '空闲但不想被打扰',
    red: '有点忙，别打扰'
  }[status]
}

Page({
  data: {
    ready: false,
    familyId: '',
    familyName: '我们家',
    todayLabel: '',
    todayWeek: '',
    nowTime: '',
    status: 'green',
    statusText: '',
    mood: '',
    moodOptions: MOOD_OPTIONS,
    callVoice: true,
    callVideo: true,
    myCallDisplay: '',
    outReturn: '',
    outPlace: '',
    outWho: '',
    members: [],
    occasions: [],
    wishesToday: [],
    wishDraft: '',
    wishTarget: null,
    myNudges: [],
    portraitTips: []
  },

  onShow() {
    const family = store.getFamily()
    const member = store.getMember()
    if (!family || !member) {
      wx.redirectTo({ url: '/pages/join/join' })
      return
    }
    this.tickClock()
    this._clockTimer = setInterval(() => this.tickClock(), 30000)
    store.syncFromCloud().then(() => this.refresh())
  },

  onHide() {
    if (this._clockTimer) {
      clearInterval(this._clockTimer)
      this._clockTimer = null
    }
  },

  onUnload() {
    if (this._clockTimer) {
      clearInterval(this._clockTimer)
      this._clockTimer = null
    }
  },

  tickClock() {
    this.setData(nowClock())
  },

  refresh() {
    const family = store.getFamily()
    const member = store.getMember()
    const mine = resolveMood(member)
    const myPrefs = resolveCallPrefs(member)
    const members = (family.members || []).map((m) => {
      const mood = resolveMood(m)
      const isBday = calendar.isBirthdayToday(m.birthday)
      const residence = (m.residence || (m.about && m.about.residence) || '').trim()
      return {
        ...m,
        residence,
        weatherLabel: '',
        lightLabel: LIGHT_LABEL[m.status] || LIGHT_LABEL.green,
        moodLabel: mood.moodLabel,
        callDisplay: callDisplayFor(m),
        detailLine: detailLine(m),
        birthdayLabel: calendar.formatBirthday(m.birthday),
        isBirthday: isBday
      }
    })
    // 仅当天命中的生日/节日才进 occasions；无事项时不渲染祝福 UI
    const occasions = calendar.occasionsToday(family.members || [], new Date())
    const wishesToday = occasions.length ? store.listWishesToday() : []
    const clock = nowClock()
    this.setData({
      ready: true,
      ...clock,
      familyId: family.id,
      familyName: family.familyName || '我们家',
      status: member.status || 'green',
      statusText: member.statusText || '',
      mood: mine.mood,
      callVoice: myPrefs.callVoice,
      callVideo: myPrefs.callVideo,
      myCallDisplay: callDisplayFor(member),
      outReturn: member.outReturn || '',
      outPlace: member.outPlace || '',
      outWho: member.outWho || '',
      members,
      occasions,
      wishesToday,
      myNudges: store.listMyNudges(),
      portraitTips: store.listPortraitTips()
    })
    this.loadWeather(members)
  },

  loadWeather(members) {
    weather
      .attachWeather(members || this.data.members)
      .then((list) => {
        if (!list) return
        this.setData({ members: list })
      })
      .catch(() => {})
  },

  goFeedFromNudge() {
    wx.switchTab({ url: '/pages/feed/feed' })
  },

  goPortraitFromTip(e) {
    const id = e.currentTarget.dataset.id || ''
    const q = id ? `?id=${encodeURIComponent(id)}` : ''
    wx.navigateTo({ url: `/pages/portrait/portrait${q}` })
  },

  dismissPortraitTip(e) {
    const id = e.currentTarget.dataset.id
    store.dismissPortraitTip(id)
    this.refresh()
  },

  dismissNudge(e) {
    store.dismissNudge(e.currentTarget.dataset.id)
    this.refresh()
  },

  openWish(e) {
    const idx = e.currentTarget.dataset.idx
    const occ = this.data.occasions[idx]
    if (!occ) return
    this.setData({
      wishTarget: {
        idx,
        kind: occ.kind,
        occasion: occ.title,
        toUserId: occ.toUserId || '',
        toName: occ.toName || '家人',
        templates: occ.templates || []
      },
      wishDraft: (occ.templates && occ.templates[0]) || ''
    })
  },

  pickTemplate(e) {
    this.setData({ wishDraft: e.currentTarget.dataset.t })
  },

  onWishDraft(e) {
    this.setData({ wishDraft: e.detail.value })
  },

  closeWish() {
    this.setData({ wishTarget: null, wishDraft: '' })
  },

  sendWish() {
    const t = this.data.wishTarget
    if (!t) return
    const res = store.addWish({
      toUserId: t.toUserId,
      toName: t.toName,
      occasion: t.occasion,
      kind: t.kind,
      message: this.data.wishDraft
    })
    if (!res.ok) {
      wx.showToast({ title: res.msg, icon: 'none' })
      return
    }
    wx.showToast({ title: '祝福已送出', icon: 'success' })
    this.setData({ wishTarget: null, wishDraft: '' })
    this.refresh()
  },

  setStatus(e) {
    const status = e.currentTarget.dataset.s
    store.updateMe({
      status,
      statusText: this.data.statusText || detailDefaults(status)
    })
    this.refresh()
  },

  setMood(e) {
    const mood = e.currentTarget.dataset.m
    const prev = (store.getMember() || {}).mood
    store.updateMe({ mood, moodDate: todayKey() })
    if (mood && mood !== prev) store.addMoodPortraitTip(mood)
    this.refresh()
  },

  onStatusText(e) {
    this.setData({ statusText: e.detail.value })
  },

  saveStatusText() {
    store.updateMe({ statusText: this.data.statusText })
    this.refresh()
  },

  toggleVoice() {
    store.updateMe({ callVoice: !this.data.callVoice })
    this.refresh()
  },

  toggleVideo() {
    store.updateMe({ callVideo: !this.data.callVideo })
    this.refresh()
  },

  onOutReturn(e) {
    this.setData({ outReturn: e.detail.value })
  },

  onOutPlace(e) {
    this.setData({ outPlace: e.detail.value })
  },

  onOutWho(e) {
    this.setData({ outWho: e.detail.value })
  },

  saveOuting() {
    store.updateMe({
      outReturn: (this.data.outReturn || '').trim(),
      outPlace: (this.data.outPlace || '').trim(),
      outWho: (this.data.outWho || '').trim()
    })
    this.refresh()
  }
})
