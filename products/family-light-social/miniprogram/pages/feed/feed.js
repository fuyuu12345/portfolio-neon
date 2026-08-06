const store = require('../../utils/store')

/** 默认暖色三件套；具体帖子按文案推荐 */
const DEFAULT_EMOJIS = ['💛', '👏', '🤗']

/**
 * 按动态正文（+是否有图）推荐 3 个快捷表情
 */
function recommendEmojis(content, hasImage) {
  const text = String(content || '')
  const scores = {}
  function bump(emoji, n) {
    scores[emoji] = (scores[emoji] || 0) + (n || 1)
  }

  const rules = [
    { re: /累|加班|忙|熬夜|困|疲惫|辛苦/, emojis: ['💪', '🤗', '💛'] },
    { re: /开心|高兴|哈哈|太好了|耶|棒|顺利|开心/, emojis: ['👏', '💛', '✨'] },
    { re: /吃|饭|菜|饿|香|草莓|水果|甜|咖啡|奶茶|早餐|夜宵/, emojis: ['😋', '💛', '👏'] },
    { re: /猫|狗|宠物|喵|汪/, emojis: ['🐱', '💛', '🤗'] },
    { re: /雨|冷|低落|难过|想家|孤单|想你们/, emojis: ['🤗', '💛', '🌧️'] },
    { re: /太阳|晴|天气好|暖和|春|散步|晒/, emojis: ['☀️', '💛', '👏'] },
    { re: /睡|休息|躺|周末|放假/, emojis: ['😴', '💛', '🤗'] },
    { re: /病|医院|不舒服|感冒/, emojis: ['🤗', '💛', '💪'] },
    { re: /旅行|出门|路上|高铁|飞机|到了/, emojis: ['✈️', '💛', '👏'] },
    { re: /花|景|好看|拍|天空/, emojis: ['🌸', '💛', '👏'] },
    { re: /平安|报|到家|到公司/, emojis: ['💛', '👍', '🤗'] }
  ]

  rules.forEach((r) => {
    if (r.re.test(text)) {
      r.emojis.forEach((e, i) => bump(e, 3 - i))
    }
  })

  if (hasImage && !text.trim()) {
    bump('📷', 4)
    bump('💛', 3)
    bump('👏', 2)
  } else if (hasImage) {
    bump('📷', 2)
    bump('💛', 1)
  }

  // 保底
  DEFAULT_EMOJIS.forEach((e, i) => bump(e, 0.5 - i * 0.1))

  const ranked = Object.keys(scores).sort((a, b) => scores[b] - scores[a])
  const picked = ranked.slice(0, 3)
  while (picked.length < 3) {
    const fallback = DEFAULT_EMOJIS[picked.length]
    if (picked.indexOf(fallback) < 0) picked.push(fallback)
    else break
  }
  return picked.slice(0, 3)
}

function pad2(n) {
  return `${n}`.padStart(2, '0')
}

function parseDayKey(dayKey) {
  const [y, m, d] = String(dayKey || '')
    .split('-')
    .map(Number)
  return { y: y || 0, m: m || 1, d: d || 1 }
}

function daysInSolarMonth(y, m) {
  if ([1, 3, 5, 7, 8, 10, 12].indexOf(m) >= 0) return 31
  if (m === 2) {
    const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
    return leap ? 29 : 28
  }
  return 30
}

function buildFeedYears(startYear, endYear) {
  const list = []
  for (let y = endYear; y >= startYear; y--) list.push(`${y}年`)
  return list
}

function monthLabels() {
  return Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
}

function dayLabels(max) {
  return Array.from({ length: max }, (_, i) => `${i + 1}日`)
}

function labelDay(dayKey, todayKey) {
  if (dayKey === todayKey) return `今天 · ${dayKey}`
  return dayKey
}

/** 今天起往前 n 天（含今天），用于快捷切换 */
function recentDayChips(todayKey, n) {
  const [y, m, d] = todayKey.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  const labels = ['今天', '昨天', '前天', '大前天']
  const chips = []
  for (let i = 0; i < n; i++) {
    const dt = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i)
    const key = `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`
    chips.push({
      day: key,
      label: labels[i] || `${dt.getMonth() + 1}/${dt.getDate()}`,
      sub: `${dt.getMonth() + 1}/${dt.getDate()}`
    })
  }
  return chips
}

function timeLabel(ts) {
  const d = new Date(ts)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function groupReactions(reactions, myId) {
  const map = {}
  ;(reactions || []).forEach((r) => {
    if (!map[r.emoji]) map[r.emoji] = { emoji: r.emoji, count: 0, names: [], mine: false }
    map[r.emoji].count += 1
    map[r.emoji].names.push(r.name)
    if (r.userId === myId) map[r.emoji].mine = true
  })
  return Object.keys(map).map((k) => map[k])
}

Page({
  data: {
    content: '',
    imagePath: '',
    posts: [],
    selectedDay: '',
    todayKey: '',
    feedStartYear: 2020,
    feedYears: [],
    feedMonths: monthLabels(),
    feedDays: dayLabels(31),
    feedIndex: [0, 0, 0],
    dateLabel: '',
    isToday: true,
    postedToday: false,
    dayChips: [],
    moreDays: [],
    commentDrafts: {},
    myNudges: []
  },

  syncFeedPicker(dayKey) {
    const today = parseDayKey(this.data.todayKey || store.dayKeyFrom())
    const startYear = Math.max(2020, today.y - 5)
    const years = buildFeedYears(startYear, today.y)
    const cur = parseDayKey(dayKey || this.data.todayKey)
    let y = cur.y
    let m = cur.m
    let d = cur.d
    if (y > today.y || (y === today.y && m > today.m) || (y === today.y && m === today.m && d > today.d)) {
      y = today.y
      m = today.m
      d = today.d
    }
    if (y < startYear) y = startYear
    const maxD = daysInSolarMonth(y, m)
    if (d > maxD) d = maxD
    const yIdx = Math.max(0, years.indexOf(`${y}年`))
    return {
      feedStartYear: startYear,
      feedYears: years,
      feedMonths: monthLabels(),
      feedDays: dayLabels(maxD),
      feedIndex: [yIdx, m - 1, d - 1]
    }
  },

  onShow() {
    if (!store.getFamily()) {
      wx.redirectTo({ url: '/pages/join/join' })
      return
    }
    const todayKey = store.dayKeyFrom()
    const selectedDay = this.data.selectedDay || todayKey
    this.setData({
      todayKey,
      selectedDay,
      ...this.syncFeedPicker(selectedDay)
    })
    store.syncFromCloud().then(() => this.refresh())
  },

  refresh() {
    const family = store.getFamily()
    const me = store.getMember()
    const todayKey = store.dayKeyFrom()
    const selectedDay = this.data.selectedDay || todayKey
    const dayChips = recentDayChips(todayKey, 4)
    const quickSet = {}
    dayChips.forEach((c) => {
      quickSet[c.day] = true
    })
    // 更早有动态的日子，附在快捷条后面
    const moreDays = store
      .listPostDays()
      .filter((d) => !quickSet[d])
      .slice(0, 10)
      .map((d) => {
        const [, m, day] = d.split('-').map(Number)
        return { day: d, label: `${m}/${day}`, sub: d }
      })
    const postedToday = (family.posts || []).some(
      (p) => p.userId === me.userId && (p.dayKey || store.dayKeyFrom(p.createdAt)) === todayKey
    )
    const posts = (family.posts || [])
      .filter((p) => (p.dayKey || store.dayKeyFrom(p.createdAt)) === selectedDay)
      .map((p) => {
        const reactions = p.reactions || []
        const comments = (p.comments || []).map((c) => ({
          ...c,
          timeLabel: timeLabel(c.createdAt),
          mine: c.userId === me.userId,
          canDelete: c.userId === me.userId || p.userId === me.userId
        }))
        const myReact = (reactions.find((r) => r.userId === me.userId) || {}).emoji || ''
        const quickEmojis = recommendEmojis(p.content, !!p.imagePath)
        return {
          ...p,
          timeLabel: timeLabel(p.createdAt),
          reactions,
          reactionGroups: groupReactions(reactions, me.userId),
          myReact,
          quickEmojis,
          comments,
          mine: p.userId === me.userId
        }
      })

    this.setData({
      todayKey,
      selectedDay,
      ...this.syncFeedPicker(selectedDay),
      dateLabel: labelDay(selectedDay, todayKey),
      isToday: selectedDay === todayKey,
      postedToday,
      dayChips,
      moreDays,
      posts,
      myNudges: store.listMyNudges()
    })
  },

  askNudge(postId) {
    wx.showActionSheet({
      itemList: ['提醒家人来看看', '提醒还没更的家人也来一更', '暂不提醒'],
      success: (r) => {
        if (r.tapIndex === 2) return
        const mode = r.tapIndex === 1 ? 'please_post' : 'come_see'
        const res = store.nudgeFamily(mode, postId)
        if (!res.ok) {
          wx.showToast({ title: res.msg, icon: 'none' })
          return
        }
        wx.showToast({ title: `已提醒 ${res.count} 位家人`, icon: 'none' })
        this.refresh()
      }
    })
  },

  remindFamily() {
    this.askNudge('')
  },

  dismissNudge(e) {
    const id = e.currentTarget.dataset.id
    store.dismissNudge(id)
    this.refresh()
  },

  dismissAllNudges() {
    store.dismissAllMyNudges()
    this.refresh()
  },

  onFeedColumn(e) {
    const col = e.detail.column
    const val = e.detail.value
    const idx = (this.data.feedIndex || [0, 0, 0]).slice()
    idx[col] = val
    const years = this.data.feedYears || []
    const y = parseInt(years[idx[0]], 10) || new Date().getFullYear()
    const m = (idx[1] || 0) + 1
    let d = (idx[2] || 0) + 1
    if (col === 0 || col === 1) {
      const maxD = daysInSolarMonth(y, m)
      if (d > maxD) d = maxD
      this.setData({
        feedDays: dayLabels(maxD),
        feedIndex: [idx[0], idx[1], d - 1]
      })
    } else {
      this.setData({ feedIndex: idx })
    }
  },

  onFeedPick(e) {
    const idx = e.detail.value
    const years = this.data.feedYears || []
    const y = parseInt(years[idx[0]], 10)
    const m = idx[1] + 1
    const d = idx[2] + 1
    if (!y) return
    const today = parseDayKey(this.data.todayKey || store.dayKeyFrom())
    let selectedDay = `${y}-${m}-${d}`
    if (
      y > today.y ||
      (y === today.y && m > today.m) ||
      (y === today.y && m === today.m && d > today.d)
    ) {
      selectedDay = this.data.todayKey
      wx.showToast({ title: '不能选今天之后', icon: 'none' })
    }
    this.setData(
      {
        selectedDay,
        ...this.syncFeedPicker(selectedDay)
      },
      () => this.refresh()
    )
  },

  selectDay(e) {
    const selectedDay = e.currentTarget.dataset.day
    if (!selectedDay) return
    this.setData(
      {
        selectedDay,
        ...this.syncFeedPicker(selectedDay)
      },
      () => this.refresh()
    )
  },

  goToday() {
    const todayKey = store.dayKeyFrom()
    this.setData({
      selectedDay: todayKey,
      todayKey,
      ...this.syncFeedPicker(todayKey)
    })
    this.refresh()
  },

  onContent(e) {
    this.setData({ content: e.detail.value })
  },

  pickImage() {
    const apply = (path) => {
      if (!path) {
        wx.showToast({ title: '没选到图片', icon: 'none' })
        return
      }
      this.setData({ imagePath: path })
    }

    const isCancel = (err) =>
      !!(err && err.errMsg && /cancel|取消/i.test(err.errMsg))

    const chooseWithSource = (sourceType) => {
      const openChooseImage = () => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed', 'original'],
          sourceType,
          success: (r) => apply(r.tempFilePaths && r.tempFilePaths[0]),
          fail: (e) => {
            if (isCancel(e)) return
            wx.showToast({
              title: sourceType[0] === 'album' ? '无法打开相册，请在系统设置里允许访问照片' : '无法打开相机',
              icon: 'none'
            })
          }
        })
      }

      if (wx.chooseMedia) {
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType,
          sizeType: ['compressed', 'original'],
          success: (res) => {
            const f = res.tempFiles && res.tempFiles[0]
            apply(f && (f.tempFilePath || f.path))
          },
          fail: (err) => {
            if (isCancel(err)) return
            // 部分基础库/模拟器 chooseMedia 不稳，回退 chooseImage
            openChooseImage()
          }
        })
        return
      }
      openChooseImage()
    }

    const startPick = () => {
      wx.showActionSheet({
        itemList: ['从手机相册选择', '拍照'],
        success: (res) => {
          const sourceType = res.tapIndex === 1 ? ['camera'] : ['album']
          chooseWithSource(sourceType)
        },
        fail: () => {}
      })
    }

    // 新版微信需先过隐私协议，才能调起相册/相机
    if (wx.requirePrivacyAuthorize) {
      wx.requirePrivacyAuthorize({
        success: startPick,
        fail: () => {
          wx.showModal({
            title: '需要相册权限',
            content: '选图需要你同意隐私保护指引，并允许访问手机相册。',
            confirmText: '去同意',
            success: (r) => {
              if (!r.confirm) return
              if (wx.openPrivacyContract) {
                wx.openPrivacyContract({})
              } else {
                startPick()
              }
            }
          })
        }
      })
      return
    }
    startPick()
  },

  clearImage() {
    this.setData({ imagePath: '' })
  },

  publish() {
    const content = (this.data.content || '').trim()
    const imagePath = this.data.imagePath
    if (!content && !imagePath) {
      wx.showToast({ title: '写点字或选张图', icon: 'none' })
      return
    }
    const res = store.addPost(content, imagePath)
    if (!res.ok) {
      wx.showToast({ title: res.msg, icon: 'none' })
      return
    }
    this.setData({ content: '', imagePath: '' })
    this.refresh()
    wx.showToast({ title: '今日已更新', icon: 'success' })
    setTimeout(() => this.askNudge(res.postId || ''), 400)
  },

  react(e) {
    const { id, emoji } = e.currentTarget.dataset
    store.reactPost(id, emoji)
    this.refresh()
  },

  onCommentInput(e) {
    const id = e.currentTarget.dataset.id
    const drafts = { ...(this.data.commentDrafts || {}) }
    drafts[id] = e.detail.value
    this.setData({ commentDrafts: drafts })
  },

  sendComment(e) {
    const id = e.currentTarget.dataset.id
    const text = (this.data.commentDrafts[id] || '').trim()
    const res = store.addComment(id, text)
    if (!res.ok) {
      wx.showToast({ title: res.msg, icon: 'none' })
      return
    }
    const drafts = { ...(this.data.commentDrafts || {}) }
    drafts[id] = ''
    this.setData({ commentDrafts: drafts })
    this.refresh()
  },

  removeComment(e) {
    const { id, cid } = e.currentTarget.dataset
    const res = store.deleteComment(id, cid)
    if (!res.ok) {
      wx.showToast({ title: res.msg, icon: 'none' })
      return
    }
    this.refresh()
  },

  remove(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除这条动态？',
      content: '删除后，若是今天的，还可以重新发一条。',
      success: (r) => {
        if (!r.confirm) return
        const res = store.deletePost(id)
        if (!res.ok) {
          wx.showToast({ title: res.msg, icon: 'none' })
          return
        }
        this.refresh()
        wx.showToast({ title: '已删除', icon: 'success' })
      }
    })
  }
})
