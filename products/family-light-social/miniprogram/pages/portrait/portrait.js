const store = require('../../utils/store')
const portraitUtil = require('../../utils/portrait')
const nav = require('../../utils/nav')

const TAG_PREVIEW = 4

function timeLabel(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}-${d.getDate()} ${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`
}

function packTagSection(key, title, list, expandedMap) {
  const all = list || []
  if (!all.length) return null
  const expanded = !!(expandedMap && expandedMap[key])
  const canExpand = all.length > TAG_PREVIEW
  const shown = !canExpand || expanded ? all : all.slice(0, TAG_PREVIEW)
  const moreCount = Math.max(0, all.length - TAG_PREVIEW)
  return {
    key,
    title,
    shown,
    total: all.length,
    canExpand,
    expanded,
    moreCount,
    expandText: expanded ? '收起' : `展开其余 ${moreCount} 个`
  }
}

Page({
  data: {
    viewerIsElder: true,
    pageTitle: '查看家庭成员画像',
    pageHint: '',
    people: [],
    activeId: '',
    profile: null,
    tagSections: [],
    tagExpanded: {},
    summary: null,
    categories: [],
    category: 'all',
    query: '',
    filtered: [],
    emptyHint: ''
  },

  goBack() {
    nav.goBack({ type: 'tab', url: '/pages/mine/mine' })
  },

  onLoad(query) {
    if (query && (query.childId || query.id)) {
      this.setData({ activeId: query.childId || query.id })
    }
  },

  onShow() {
    const family = store.getFamily()
    const me = store.getMember()
    if (!family || !me) {
      wx.redirectTo({ url: '/pages/join/join' })
      return
    }
    this.setData({
      viewerIsElder: (me.role || 'child') === 'elder',
      pageTitle: '查看家庭成员画像',
      pageHint: '只看其他家人。'
    })
    wx.setNavigationBarTitle({ title: '查看家庭成员画像' })
    store.syncFromCloud().then(() => this.refresh())
  },

  refresh() {
    const me = store.getMember()
    const myId = me && me.userId
    const people = store
      .listViewableProfiles()
      .filter((p) => p.id !== myId && p.childId !== myId)
      .map((p) => ({
        ...p,
        entries: (p.entries || []).map((e) => ({
          ...portraitUtil.normalizeEntry(e),
          timeLabel: timeLabel(e.at)
        })),
        summary: portraitUtil.buildPortraitSummary(p.member, p.entries || [], {
          asElder: p.kind === 'elder'
        })
      }))

    let activeId = this.data.activeId
    if (activeId === myId || !people.find((p) => p.id === activeId)) {
      activeId = people[0] ? people[0].id : ''
    }

    this.setData({ people, activeId })
    this.applyView()
  },

  applyView() {
    const { people, activeId, category, query } = this.data
    const current = people.find((p) => p.id === activeId)
    if (!current) {
      this.setData({
        profile: null,
        tagSections: [],
        summary: null,
        categories: [{ key: 'all', label: '全部', count: 0 }],
        filtered: [],
        emptyHint: '还没有其他家人。把家庭码发给家人加入即可。'
      })
      return
    }

    const all = current.entries || []
    const byCat = portraitUtil.groupByCategory(all)
    const categories = [
      { key: 'all', label: '全部', count: all.length },
      ...portraitUtil.CATEGORIES.map((c) => ({
        key: c.key,
        label: c.label,
        count: (byCat[c.key] || []).length
      })).filter((c) => c.count > 0 || c.key === 'other')
    ]

    const filtered = portraitUtil
      .filterEntries(all, { category, query })
      .map((e) => ({ ...e, timeLabel: timeLabel(e.at) }))

    let emptyHint = ''
    if (!all.length) {
      emptyHint =
        current.kind === 'elder'
          ? '还没有软档案。发出题目、家人答完后会慢慢长出来。'
          : '还没有默契存档。发出题目、家人答完后会慢慢长出来。'
    } else if (!filtered.length) {
      emptyHint = query ? '没有搜到相关题卡，换个词试试。' : '这一类暂时还没有题卡。'
    }

    const isElder = current.kind === 'elder'
    const expandedMap = this.data.tagExpanded || {}
    const tagSections = [
      packTagSection(
        'concerns',
        isElder ? '放在心上的事' : '在意的事',
        current.concerns,
        expandedMap
      ),
      packTagSection(
        'worlds',
        isElder ? '生活小趣味' : '小世界',
        current.worlds,
        expandedMap
      ),
      packTagSection(
        'wantUnderstood',
        isElder ? '想被家人理解' : '想被理解',
        current.wantUnderstood,
        expandedMap
      ),
      packTagSection('wantTogether', '想一起做', current.wantTogether, expandedMap)
    ].filter(Boolean)

    this.setData({
      profile: {
        name: current.name || current.childName,
        roleLabel: current.roleLabel,
        stageLabel: current.stageLabel,
        birthdayLabel: current.birthdayLabel || '',
        residence: current.residence || '',
        note: current.note || '',
        hasAbout: current.hasAbout,
        kind: current.kind
      },
      tagSections,
      summary: current.summary,
      categories,
      filtered,
      emptyHint
    })
  },

  toggleTagSection(e) {
    const key = e.currentTarget.dataset.key
    if (!key) return
    const tagExpanded = Object.assign({}, this.data.tagExpanded || {})
    tagExpanded[key] = !tagExpanded[key]
    this.setData({ tagExpanded })
    this.applyView()
  },

  switchPerson(e) {
    const id = e.currentTarget.dataset.id
    if (id == null || id === '') return
    this.setData({
      activeId: String(id),
      category: 'all',
      query: '',
      tagExpanded: {}
    })
    this.applyView()
  },

  setCategory(e) {
    const key = e.currentTarget.dataset.key
    if (!key) return
    this.setData({ category: key })
    this.applyView()
  },

  onSearch(e) {
    this.setData({ query: e.detail.value })
    this.applyView()
  },

  clearSearch() {
    this.setData({ query: '' })
    this.applyView()
  }
})
