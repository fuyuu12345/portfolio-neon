const store = require('../../utils/store')
const tags = require('../../utils/tags')
const calendar = require('../../utils/calendar')
const places = require('../../utils/places')
const nav = require('../../utils/nav')

const CHILD_STAGES = [
  { key: 'student', label: '学生' },
  { key: 'junior', label: '初入职场' },
  { key: 'settled', label: '已独立生活' },
  { key: 'other', label: '其他' }
]

const ELDER_STAGES = [
  { key: 'working', label: '仍在工作' },
  { key: 'retire', label: '退休前后' },
  { key: 'care', label: '需多照顾' },
  { key: 'other', label: '其他' }
]

/** 按年龄推荐最匹配阶段 */
function recommendStageByAge(role, ageRaw) {
  const age = parseInt(ageRaw, 10)
  if (!age || age < 1 || age > 120) return ''
  if (role === 'elder') {
    if (age >= 75) return 'care'
    if (age >= 55) return 'retire'
    return 'working'
  }
  if (age <= 22) return 'student'
  if (age <= 30) return 'junior'
  return 'settled'
}

function normalizeStages(about) {
  if (about && about.stages && about.stages.length) return about.stages.slice()
  if (about && about.stage) return [about.stage]
  return []
}

const KINDS = {
  concern: {
    packKey: 'concernPack',
    selectedKey: 'concerns',
    poolKey: 'concernPool',
    shuffleKey: 'concernShuffles',
    canAddKey: 'concernCanAdd',
    customKey: 'customConcern',
    max: tags.LIMITS.concerns,
    maxLen: 12
  },
  world: {
    packKey: 'worldPack',
    selectedKey: 'worlds',
    poolKey: 'worldPool',
    shuffleKey: 'worldShuffles',
    canAddKey: 'worldCanAdd',
    customKey: 'customWorld',
    max: tags.LIMITS.worlds,
    maxLen: 12
  },
  understood: {
    packKey: 'understandPack',
    selectedKey: 'wantUnderstood',
    poolKey: 'understandPool',
    shuffleKey: 'understandShuffles',
    canAddKey: 'understandCanAdd',
    customKey: 'customUnderstood',
    max: tags.LIMITS.wantUnderstood,
    maxLen: 24
  },
  together: {
    packKey: 'togetherPack',
    selectedKey: 'wantTogether',
    poolKey: 'togetherPool',
    shuffleKey: 'togetherShuffles',
    canAddKey: 'togetherCanAdd',
    customKey: 'customTogether',
    max: tags.LIMITS.wantTogether,
    maxLen: 24
  }
}

Page({
  data: {
    role: 'child',
    selectedStages: ['student'],
    recommendedStage: '',
    stageHint: '填年龄后会推荐阶段。',
    stages: CHILD_STAGES,
    concernPack: tags.CONCERN_TAGS_CHILD,
    concerns: [],
    concernPool: [],
    concernShuffles: 0,
    concernCanAdd: false,
    customConcern: '',
    worldPack: tags.WORLD_TAGS,
    worlds: [],
    worldPool: [],
    worldShuffles: 0,
    worldCanAdd: false,
    customWorld: '',
    understandPack: tags.UNDERSTAND_TAGS,
    wantUnderstood: [],
    understandPool: [],
    understandShuffles: 0,
    understandCanAdd: false,
    customUnderstood: '',
    togetherPack: tags.TOGETHER_TAGS,
    wantTogether: [],
    togetherPool: [],
    togetherShuffles: 0,
    togetherCanAdd: false,
    customTogether: '',
    note: '',
    age: '',
    residence: '',
    residenceLabel: '未选择 · 点此选择',
    placeIndex: places.defaultIndex(),
    placeRegions: places.regionLabels(),
    placeSubs: places.subLabels(places.defaultIndex()[0]),
    placeCities: places.cityLabels(places.defaultIndex()[0], places.defaultIndex()[1]),
    bdayCalendar: 'solar',
    bdayMonth: 1,
    bdayDay: 1,
    bdayYear: '',
    bdayLabel: '未填写 · 点此选择',
    bdayPairLabel: '',
    bdaySet: false,
    bdayYears: calendar.yearOptions(),
    bdayMonths: calendar.monthOptions(),
    bdayDays: calendar.dayOptions(31),
    bdayIndex: [0, 0, 0],
    familyName: '我们家',
    first: false,
    shuffleNeed: tags.SHUFFLE_BEFORE_ADD,
    limits: tags.LIMITS
  },

  goBack() {
    if (this.data.first) {
      nav.goBack({ type: 'page', url: '/pages/join/join' })
      return
    }
    nav.goBack({ type: 'tab', url: '/pages/mine/mine' })
  },

  onLoad(query) {
    this.setData({ first: query.first === '1' })
    const family = store.getFamily()
    const member = store.getMember()
    if (family) {
      this.setData({ familyName: family.familyName || '我们家' })
    }
    if (member && member.about) {
      const about = member.about
      const role = about.role || member.role || 'child'
      this.applyRole(role, false)
      const selectedStages = normalizeStages(about)
      this._stagesTouched = selectedStages.length > 0
      this.setData({
        role,
        selectedStages: selectedStages.length ? selectedStages : ['student'],
        concerns: about.concerns || [],
        worlds: about.worlds || [],
        wantUnderstood: about.wantUnderstood || [],
        wantTogether: about.wantTogether || [],
        note: about.note || ''
      })
      this.applyResidence(member.residence || about.residence || '')
      this.applyBirthday(member.birthday)
      if (this._stagesTouched) this.refreshStageHint()
    } else if (member) {
      if (member.role) {
        this.applyRole(member.role, false)
        this.setData({ role: member.role })
      }
      this.applyResidence(member.residence || (member.about && member.about.residence) || '')
      this.applyBirthday(member.birthday)
    }
    this.refreshAllPools()
  },

  yearIndexOf(yearRaw) {
    const years = this.data.bdayYears || calendar.yearOptions()
    if (!yearRaw) return 0
    const label = `${parseInt(yearRaw, 10)}年`
    const i = years.indexOf(label)
    return i >= 0 ? i : 0
  },

  syncBdayDays(cal, month, year, day) {
    const max = calendar.daysInMonth(cal, month, year)
    const safeDay = Math.min(day || 1, max)
    return {
      bdayDays: calendar.dayOptions(max),
      bdayDay: safeDay,
      bdayIndex: [
        this.yearIndexOf(year),
        (month || 1) - 1,
        safeDay - 1
      ]
    }
  },

  applyBirthday(raw) {
    const b = calendar.normalizeBirthday(raw)
    if (!b) {
      this.setData({
        bdaySet: false,
        bdayLabel: '未填写 · 点此选择',
        bdayPairLabel: ''
      })
      return
    }
    const yearStr = b.year ? String(b.year) : ''
    const synced = this.syncBdayDays(b.calendar, b.month, yearStr, b.day)
    this.setData({
      bdaySet: true,
      bdayCalendar: b.calendar,
      bdayMonth: b.month,
      bdayYear: yearStr,
      ...synced
    })
    this.refreshBdayLabel()
    this.syncAgeFromBirthday()
  },

  refreshBdayLabel() {
    if (!this.data.bdaySet) {
      this.setData({ bdayLabel: '未填写 · 点此选择', bdayPairLabel: '' })
      return
    }
    const pair = calendar.pairBirthday(
      this.data.bdayCalendar,
      this.data.bdayYear,
      this.data.bdayMonth,
      this.data.bdayDay
    )
    if (!pair) {
      this.setData({ bdayPairLabel: '' })
      return
    }
    this.setData({
      bdayLabel: pair.activeLabel,
      bdayPairLabel: pair.otherLabel
    })
  },

  /** 年龄只由生日年份推算，不可手改；无年则清空年龄 */
  syncAgeFromBirthday() {
    if (!this.data.bdaySet) {
      this.setData({ age: '' })
      this.refreshStageHint()
      return
    }
    const age = calendar.ageFromBirthday(
      this.data.bdayCalendar,
      this.data.bdayYear,
      this.data.bdayMonth,
      this.data.bdayDay
    )
    this.setData({ age: age || '' })
    if (age) this.applyAgeRecommend(age, false)
    else this.refreshStageHint()
  },

  /** 切换阴/阳历：滚轮立刻换成对应日期 */
  setBdayCal(e) {
    const cal = e.currentTarget.dataset.c
    if (cal === this.data.bdayCalendar) return
    if (!this.data.bdaySet) {
      const synced = this.syncBdayDays(cal, this.data.bdayMonth, this.data.bdayYear, this.data.bdayDay)
      this.setData({ bdayCalendar: cal, ...synced, bdayPairLabel: '' })
      return
    }
    const pair = calendar.pairBirthday(
      this.data.bdayCalendar,
      this.data.bdayYear,
      this.data.bdayMonth,
      this.data.bdayDay
    )
    if (!pair) {
      this.setData({ bdayCalendar: cal })
      return
    }
    const side = cal === 'lunar' ? pair.lunar : pair.solar
    const yearStr = side.year ? String(side.year) : ''
    const synced = this.syncBdayDays(cal, side.month, yearStr, side.day)
    this.setData(
      {
        bdayCalendar: cal,
        bdayYear: yearStr,
        bdayMonth: side.month,
        bdayDay: side.day,
        ...synced
      },
      () => {
        this.refreshBdayLabel()
        this.syncAgeFromBirthday()
      }
    )
  },

  onBdayColumn(e) {
    const col = e.detail.column
    const val = e.detail.value
    const idx = (this.data.bdayIndex || [0, 0, 0]).slice()
    idx[col] = val
    const years = this.data.bdayYears || []
    const yearLabel = years[idx[0]] || '不填年'
    const year = yearLabel === '不填年' ? '' : String(parseInt(yearLabel, 10))
    const month = (idx[1] || 0) + 1
    let day = (idx[2] || 0) + 1
    if (col === 0 || col === 1) {
      const max = calendar.daysInMonth(this.data.bdayCalendar, month, year)
      if (day > max) day = max
      this.setData({
        bdayDays: calendar.dayOptions(max),
        bdayIndex: [idx[0], idx[1], day - 1]
      })
    } else {
      this.setData({ bdayIndex: idx })
    }
  },

  onBdayPick(e) {
    const idx = e.detail.value
    const years = this.data.bdayYears || []
    const yearLabel = years[idx[0]] || '不填年'
    const year = yearLabel === '不填年' ? '' : String(parseInt(yearLabel, 10))
    const month = idx[1] + 1
    const day = idx[2] + 1
    this.setData(
      {
        bdaySet: true,
        bdayYear: year,
        bdayMonth: month,
        bdayDay: day,
        bdayIndex: idx
      },
      () => {
        this.refreshBdayLabel()
        this.syncAgeFromBirthday()
      }
    )
  },

  clearBirthday() {
    this.setData({
      bdaySet: false,
      bdayCalendar: 'solar',
      bdayMonth: 1,
      bdayDay: 1,
      bdayYear: '',
      bdayDays: calendar.dayOptions(31),
      bdayIndex: [0, 0, 0],
      bdayLabel: '未填写 · 点此选择',
      bdayPairLabel: '',
      age: ''
    })
    this.refreshStageHint()
  },

  applyRole(role, refreshPools = true) {
    const selectedStages = role === 'elder' ? ['working'] : ['student']
    const packs =
      role === 'elder'
        ? {
            concernPack: tags.CONCERN_TAGS_ELDER,
            worldPack: tags.WORLD_TAGS_ELDER,
            understandPack: tags.UNDERSTAND_TAGS_ELDER,
            togetherPack: tags.TOGETHER_TAGS_ELDER
          }
        : {
            concernPack: tags.CONCERN_TAGS_CHILD,
            worldPack: tags.WORLD_TAGS,
            understandPack: tags.UNDERSTAND_TAGS,
            togetherPack: tags.TOGETHER_TAGS
          }
    this.setData({
      ...packs,
      selectedStages,
      stages: this.decorateStages(
        role === 'elder' ? ELDER_STAGES : CHILD_STAGES,
        selectedStages,
        ''
      )
    })
    this._stagesTouched = false
    if (this.data.age) this.applyAgeRecommend(this.data.age, false)
    else this.refreshStageHint()
    if (refreshPools) this.refreshAllPools()
  },

  decorateStages(list, selected, recommended) {
    const base = list || (this.data.role === 'elder' ? ELDER_STAGES : CHILD_STAGES)
    const sel = selected || this.data.selectedStages || []
    const rec = recommended !== undefined ? recommended : this.data.recommendedStage
    return base.map((s) => ({
      ...s,
      on: sel.indexOf(s.key) > -1,
      rec: !!rec && s.key === rec
    }))
  },

  refreshStageHint() {
    const rec = this.data.recommendedStage
    const hit = (this.data.role === 'elder' ? ELDER_STAGES : CHILD_STAGES).find(
      (s) => s.key === rec
    )
    const hint = hit
      ? `按年龄推荐：${hit.label}`
      : '填年龄后会推荐阶段。'
    const stages = this.decorateStages(
      this.data.role === 'elder' ? ELDER_STAGES : CHILD_STAGES,
      this.data.selectedStages,
      rec
    )
    this.setData({ stageHint: hint, stages })
  },

  applyAgeRecommend(ageRaw, forceAdd) {
    const rec = recommendStageByAge(this.data.role, ageRaw)
    let selected = (this.data.selectedStages || []).slice()
    if (rec) {
      if (!this._stagesTouched || forceAdd) {
        selected = [rec]
        this._stagesTouched = false
      } else if (selected.indexOf(rec) < 0) {
        // 用户已手选过：把推荐项补进已选，不覆盖
        selected = [rec].concat(selected)
      }
    }
    this.setData(
      {
        recommendedStage: rec,
        selectedStages: selected,
        stages: this.decorateStages(
          this.data.role === 'elder' ? ELDER_STAGES : CHILD_STAGES,
          selected,
          rec
        )
      },
      () => this.refreshStageHint()
    )
  },

  refreshAllPools() {
    ;['concern', 'world', 'understood', 'together'].forEach((k) => this.refreshPool(k))
  },

  refreshPool(kind) {
    const cfg = KINDS[kind]
    if (!cfg) return
    const pack = this.data[cfg.packKey]
    const selected = this.data[cfg.selectedKey]
    const pool = tags.nextPool(pack, selected, tags.POOL_SIZE)
    this.setData({ [cfg.poolKey]: pool })
  },

  setRole(e) {
    const role = e.currentTarget.dataset.role
    if (role === this.data.role) return
    this.setData({
      role,
      concerns: [],
      worlds: [],
      wantUnderstood: [],
      wantTogether: [],
      concernShuffles: 0,
      worldShuffles: 0,
      understandShuffles: 0,
      togetherShuffles: 0,
      concernCanAdd: false,
      worldCanAdd: false,
      understandCanAdd: false,
      togetherCanAdd: false,
      customConcern: '',
      customWorld: '',
      customUnderstood: '',
      customTogether: ''
    })
    this.applyRole(role, true)
  },

  setStage(e) {
    const key = e.currentTarget.dataset.key
    if (!key) return
    this._stagesTouched = true
    let selected = (this.data.selectedStages || []).slice()
    const i = selected.indexOf(key)
    if (i > -1) {
      if (selected.length <= 1) {
        wx.showToast({ title: '至少保留一个阶段', icon: 'none' })
        return
      }
      selected.splice(i, 1)
    } else {
      selected.push(key)
    }
    // 推荐项尽量排在前面，方便作为主阶段
    const rec = this.data.recommendedStage
    if (rec && selected.indexOf(rec) > 0) {
      selected = [rec].concat(selected.filter((k) => k !== rec))
    }
    this.setData({
      selectedStages: selected,
      stages: this.decorateStages(
        this.data.role === 'elder' ? ELDER_STAGES : CHILD_STAGES,
        selected,
        this.data.recommendedStage
      )
    })
  },

  pickFromPool(e) {
    const kind = e.currentTarget.dataset.kind
    const item = e.currentTarget.dataset.item
    const cfg = KINDS[kind]
    if (!cfg || !item) return
    const selected = this.data[cfg.selectedKey].slice()
    if (selected.indexOf(item) > -1) return
    if (selected.length >= cfg.max) {
      wx.showToast({ title: `最多选 ${cfg.max} 个`, icon: 'none' })
      return
    }
    selected.push(item)
    this.setData({ [cfg.selectedKey]: selected }, () => this.refreshPool(kind))
  },

  removeSelected(e) {
    const kind = e.currentTarget.dataset.kind
    const item = e.currentTarget.dataset.item
    const cfg = KINDS[kind]
    if (!cfg || !item) return
    const selected = this.data[cfg.selectedKey].filter((t) => t !== item)
    this.setData({ [cfg.selectedKey]: selected }, () => this.refreshPool(kind))
  },

  shufflePool(e) {
    const kind = e.currentTarget.dataset.kind
    const cfg = KINDS[kind]
    if (!cfg) return
    const count = (this.data[cfg.shuffleKey] || 0) + 1
    const canAdd = count >= tags.SHUFFLE_BEFORE_ADD
    this.setData(
      {
        [cfg.shuffleKey]: count,
        [cfg.canAddKey]: canAdd
      },
      () => this.refreshPool(kind)
    )
    if (canAdd && count === tags.SHUFFLE_BEFORE_ADD) {
      wx.showToast({ title: '可以手动添加了', icon: 'none' })
    }
  },

  onCustomInput(e) {
    const kind = e.currentTarget.dataset.kind
    const cfg = KINDS[kind]
    if (!cfg) return
    this.setData({ [cfg.customKey]: e.detail.value })
  },

  addCustom(e) {
    const kind = e.currentTarget.dataset.kind
    const cfg = KINDS[kind]
    if (!cfg) return
    if (!this.data[cfg.canAddKey]) {
      wx.showToast({
        title: `先换一换满 ${tags.SHUFFLE_BEFORE_ADD} 次`,
        icon: 'none'
      })
      return
    }
    const raw = (this.data[cfg.customKey] || '').trim().replace(/\s+/g, ' ')
    if (!raw) {
      wx.showToast({ title: '先写一个标签', icon: 'none' })
      return
    }
    if (raw.length > cfg.maxLen) {
      wx.showToast({ title: `最多 ${cfg.maxLen} 字`, icon: 'none' })
      return
    }
    const selected = this.data[cfg.selectedKey].slice()
    if (selected.indexOf(raw) > -1) {
      this.setData({ [cfg.customKey]: '' })
      wx.showToast({ title: '已在已选里', icon: 'none' })
      return
    }
    if (selected.length >= cfg.max) {
      wx.showToast({ title: `最多选 ${cfg.max} 个，先叉掉一个`, icon: 'none' })
      return
    }
    // 自建标签也并进词包，方便以后再抽到
    const pack = this.data[cfg.packKey].slice()
    if (pack.indexOf(raw) < 0) pack.push(raw)
    selected.push(raw)
    this.setData(
      {
        [cfg.packKey]: pack,
        [cfg.selectedKey]: selected,
        [cfg.customKey]: ''
      },
      () => this.refreshPool(kind)
    )
    wx.showToast({ title: '已添加', icon: 'success' })
  },

  onNote(e) {
    this.setData({ note: e.detail.value })
  },

  applyResidence(raw) {
    const key = (raw || '').trim()
    if (!key) {
      const idx = places.defaultIndex()
      const cols = places.columnsOf(idx)
      this.setData({
        residence: '',
        residenceLabel: '未选择 · 点此选择',
        placeIndex: idx,
        placeRegions: cols[0],
        placeSubs: cols[1],
        placeCities: cols[2]
      })
      return
    }
    const idx = places.clampIndex(places.indexOfResidence(key))
    const cols = places.columnsOf(idx)
    const val = places.valueAt(idx)
    this.setData({
      residence: val.residence,
      residenceLabel: val.label,
      placeIndex: idx,
      placeRegions: cols[0],
      placeSubs: cols[1],
      placeCities: cols[2]
    })
  },

  onPlaceColumn(e) {
    const col = e.detail.column
    const val = e.detail.value
    const idx = (this.data.placeIndex || [0, 0, 0]).slice()
    idx[col] = val
    if (col === 0) {
      idx[1] = 0
      idx[2] = 0
    } else if (col === 1) {
      idx[2] = 0
    }
    const next = places.clampIndex(idx)
    const cols = places.columnsOf(next)
    this.setData({
      placeIndex: next,
      placeRegions: cols[0],
      placeSubs: cols[1],
      placeCities: cols[2]
    })
  },

  onPlacePick(e) {
    const idx = places.clampIndex(e.detail.value || [0, 0, 0])
    const cols = places.columnsOf(idx)
    const val = places.valueAt(idx)
    this.setData({
      placeIndex: idx,
      placeRegions: cols[0],
      placeSubs: cols[1],
      placeCities: cols[2],
      residence: val.residence,
      residenceLabel: val.label
    })
  },

  clearResidence() {
    this.applyResidence('')
  },

  onFamilyName(e) {
    this.setData({ familyName: e.detail.value })
  },

  save() {
    if (!store.getFamily()) {
      wx.redirectTo({ url: '/pages/join/join' })
      return
    }
    const ageRaw = (this.data.age || '').trim()
    let age = ''
    if (ageRaw) {
      const n = parseInt(ageRaw, 10)
      if (!n || n < 1 || n > 120) {
        wx.showToast({ title: '年龄请填 1–120', icon: 'none' })
        return
      }
      age = n
    }
    let selectedStages = (this.data.selectedStages || []).slice()
    if (!selectedStages.length) {
      const rec = recommendStageByAge(this.data.role, ageRaw) || 'other'
      selectedStages = [rec]
    }
    const primary =
      this.data.recommendedStage && selectedStages.indexOf(this.data.recommendedStage) > -1
        ? this.data.recommendedStage
        : selectedStages[0]
    const residence = (this.data.residence || '').trim()
    const about = {
      role: this.data.role,
      stage: primary,
      stages: selectedStages,
      concerns: this.data.concerns,
      worlds: this.data.worlds,
      wantUnderstood: this.data.wantUnderstood,
      wantTogether: this.data.wantTogether,
      note: (this.data.note || '').trim(),
      residence
    }
    let birthday = null
    if (this.data.bdaySet) {
      birthday = {
        calendar: this.data.bdayCalendar === 'lunar' ? 'lunar' : 'solar',
        month: this.data.bdayMonth,
        day: this.data.bdayDay,
        year: ''
      }
      const yearRaw = (this.data.bdayYear || '').trim()
      if (yearRaw) {
        const y = parseInt(yearRaw, 10)
        if (!y || y < 1900 || y > 2100) {
          wx.showToast({ title: '出生年请填 1900–2100', icon: 'none' })
          return
        }
        birthday.year = y
      }
    }
    store.updateMe({ role: this.data.role, about, age, birthday, residence })
    if (this.data.role === 'child') {
      const res = store.setFamilyName(this.data.familyName)
      if (!res.ok) {
        wx.showToast({ title: res.msg, icon: 'none' })
        return
      }
    }
    try {
      const dayKey = 'jd_quiz_day_v5'
      const uid = getApp().globalData.userId
      const all = wx.getStorageSync(dayKey) || {}
      delete all[uid]
      wx.setStorageSync(dayKey, all)
    } catch (e) {}

    wx.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => {
      wx.switchTab({ url: '/pages/home/home' })
    }, 400)
  }
})
