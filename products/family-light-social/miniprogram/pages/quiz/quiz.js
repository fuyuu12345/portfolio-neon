const store = require('../../utils/store')
const { matchQuestions } = require('../../utils/questions')
const quizDay = require('../../utils/quizDay')

function timeLabel(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}-${d.getDate()} ${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`
}

function matchLabel(same) {
  if (same) return '心有灵犀'
  return '原来不一样'
}

Page({
  data: {
    isChild: true,
    isElder: false,
    step: 'pick',
    current: { question: '', options: [], layer: '' },
    answerIndex: -1,
    reshufflesLeft: 20,
    hitLimit: false,
    targetsPeople: [],
    targets: [],
    quizzes: [],
    hintText: '',
    targetLabel: '发给谁'
  },

  onShow() {
    const family = store.getFamily()
    const member = store.getMember()
    if (!family || !member) {
      wx.redirectTo({ url: '/pages/join/join' })
      return
    }
    const isChild = (member.role || 'child') === 'child'
    const isElder = !isChild
    this.setData({
      isChild,
      isElder,
      targetLabel: '发给谁',
      hintText: isChild
        ? '先选答案，再选谁来答。'
        : '先选答案再选人。可撤回重发。'
    })
    this.ensurePool()
    store.syncFromCloud().then(() => this.refreshList())
  },

  ensurePool() {
    const member = store.getMember()
    const app = getApp()
    const about = Object.assign({}, member.about || {}, {
      role: member.role || 'child'
    })
    const row = quizDay.ensureDayDeck(app.globalData.userId, about, matchQuestions)
    const left = quizDay.reshufflesLeft(row)
    this.setData({
      current: quizDay.currentCard(row),
      answerIndex: -1,
      reshufflesLeft: left,
      hitLimit: left <= 0
    })
    this.loadTargets()
  },

  loadTargets() {
    const family = store.getFamily()
    const me = store.getMember()
    // 所有其他家人都可选：孩子↔父母、父母↔父母
    const people = (family.members || []).filter((m) => m.userId !== me.userId)
    this.setData({
      targetsPeople: people,
      targets: people.map((p) => p.userId)
    })
  },

  pickAnswer(e) {
    this.setData({ answerIndex: Number(e.currentTarget.dataset.i) })
  },

  toggleTarget(e) {
    const id = e.currentTarget.dataset.id
    let targets = this.data.targets.slice()
    const i = targets.indexOf(id)
    if (i > -1) targets.splice(i, 1)
    else targets.push(id)
    this.setData({ targets })
  },

  reshuffle() {
    const app = getApp()
    const res = quizDay.reshuffleDay(app.globalData.userId)
    if (res.hitLimit) {
      wx.showToast({ title: '达到今日换题上限', icon: 'none' })
      this.setData({
        hitLimit: true,
        reshufflesLeft: 0,
        current: res.current,
        answerIndex: -1
      })
      return
    }
    const left = quizDay.reshufflesLeft(res.row)
    this.setData({
      current: res.current,
      answerIndex: -1,
      reshufflesLeft: left,
      hitLimit: left <= 0
    })
  },

  sendQuiz() {
    if (this.data.answerIndex < 0) {
      wx.showToast({ title: '先选你的答案', icon: 'none' })
      return
    }
    if (!this.data.targets.length) {
      wx.showToast({ title: '选至少一位家人', icon: 'none' })
      return
    }
    const c = this.data.current
    store.createQuiz({
      question: c.question,
      options: c.options,
      answerIndex: this.data.answerIndex,
      layer: c.layer,
      targetIds: this.data.targets
    })
    wx.showToast({ title: '已发出', icon: 'success' })
    const app = getApp()
    const cycled = quizDay.cycleAfterSend(app.globalData.userId)
    const left = quizDay.reshufflesLeft(cycled.row)
    this.setData({
      answerIndex: -1,
      current: cycled.current,
      reshufflesLeft: left,
      hitLimit: left <= 0
    })
    this.refreshList()
  },

  refreshList() {
    const family = store.getFamily()
    const me = store.getMember()
    const nameMap = {}
    ;(family.members || []).forEach((m) => {
      nameMap[m.userId] = m.name
    })
    const quizzes = (family.quizzes || [])
      .filter((q) => {
        if (me.userId === q.fromId) return true
        const targets = q.targetIds || []
        if (!targets.length) return true
        return targets.indexOf(me.userId) > -1
      })
      .map((q) => {
        const answers = q.answers || {}
        const myAns = answers[me.userId]
        const canAnswer = me.userId !== q.fromId && !myAns
        const answerCount = Object.keys(answers).length
        const revealed = !canAnswer && (me.userId === q.fromId ? answerCount > 0 : !!myAns)
        let subjectOption = q.options[q.answerIndex]
        let answerLines = []
        let label = ''
        if (revealed) {
          answerLines = Object.keys(answers).map((uid) => {
            const a = answers[uid]
            const same = a.optionIndex === q.answerIndex
            return `${a.name}：${q.options[a.optionIndex]}（${matchLabel(same)}）`
          })
          if (myAns) label = matchLabel(myAns.optionIndex === q.answerIndex)
          else if (answerLines.length) label = '已有人回答'
        }
        const targetNames = (q.targetIds || [])
          .map((id) => nameMap[id] || '家人')
          .join('、')
        return {
          ...q,
          timeLabel: timeLabel(q.createdAt),
          canAnswer,
          revealed,
          childOption: subjectOption,
          subjectOption,
          answerLines,
          matchLabel: label,
          fromElder: q.fromRole === 'elder',
          mine: q.fromId === me.userId,
          canRecall: q.fromId === me.userId,
          targetNames: targetNames || '全家人',
          answerCount
        }
      })
    this.setData({ quizzes })
  },

  recall(e) {
    const id = e.currentTarget.dataset.id
    const item = (this.data.quizzes || []).find((q) => q.id === id)
    const had = item && item.answerCount > 0
    wx.showModal({
      title: '撤回这道题？',
      content: had
        ? '已有人回答，撤回后答卷也会从档案里去掉。题目会回到上方，可改选发送对象再发。'
        : '撤回后可改选发送对象再发。题目会回到上方编辑区。',
      success: (r) => {
        if (!r.confirm) return
        const res = store.recallQuiz(id)
        if (!res.ok) {
          wx.showToast({ title: res.msg, icon: 'none' })
          return
        }
        const q = res.quiz
        this.setData({
          current: {
            question: q.question,
            options: q.options,
            layer: q.layer
          },
          answerIndex: typeof q.answerIndex === 'number' ? q.answerIndex : -1,
          targets: (q.targetIds || []).slice()
        })
        this.refreshList()
        wx.showToast({ title: '已撤回，可重发', icon: 'none' })
      }
    })
  },

  answer(e) {
    const qid = e.currentTarget.dataset.qid
    const i = Number(e.currentTarget.dataset.i)
    const quiz = (store.getFamily().quizzes || []).find((q) => q.id === qid)
    store.answerQuiz(qid, i)
    this.refreshList()
    const msg =
      quiz && quiz.fromRole === 'elder' ? '已记入 TA 的软档案' : '已记入 TA 的画像'
    wx.showToast({ title: msg, icon: 'none' })
  },

  goPortrait() {
    wx.navigateTo({ url: '/pages/portrait/portrait' })
  }
})
