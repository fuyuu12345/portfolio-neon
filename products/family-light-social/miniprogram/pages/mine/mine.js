const store = require('../../utils/store')

Page({
  data: {
    ready: false,
    name: '',
    familyId: '',
    familyName: '我们家',
    roleLabel: '',
    isElder: false,
    isChild: false,
    nameSheet: false,
    nameDraft: ''
  },

  onShow() {
    const family = store.getFamily()
    const member = store.getMember()
    if (!family || !member) {
      wx.redirectTo({ url: '/pages/join/join' })
      return
    }
    this.setData({
      ready: true,
      name: member.name,
      familyId: family.id,
      familyName: family.familyName || '我们家',
      roleLabel: member.role === 'elder' ? '父母 / 长辈' : '子女 / 晚辈',
      isElder: member.role === 'elder',
      isChild: (member.role || 'child') === 'child'
    })
  },

  goAbout() {
    wx.navigateTo({ url: '/pages/about/about' })
  },

  goPortrait() {
    wx.navigateTo({ url: '/pages/portrait/portrait' })
  },

  openFamilyName() {
    if (!this.data.isChild) {
      wx.showToast({ title: '家的名字由晚辈来取', icon: 'none' })
      return
    }
    this.setData({
      nameSheet: true,
      nameDraft: this.data.familyName || '我们家'
    })
  },

  closeFamilyName() {
    this.setData({ nameSheet: false })
  },

  onNameDraft(e) {
    this.setData({ nameDraft: e.detail.value })
  },

  saveFamilyName() {
    const result = store.setFamilyName(this.data.nameDraft)
    if (!result.ok) {
      wx.showToast({ title: result.msg, icon: 'none' })
      return
    }
    this.setData({
      familyName: result.family.familyName,
      nameSheet: false
    })
    wx.showToast({ title: '已更新', icon: 'success' })
  },

  noop() {},

  copyCode() {
    wx.setClipboardData({
      data: this.data.familyId,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    })
  },

  leave() {
    wx.showModal({
      title: '退出家庭？',
      content: '本地数据仍保留在本机，你可再用家庭码加入。',
      success: (res) => {
        if (!res.confirm) return
        store.leaveFamily()
        wx.redirectTo({ url: '/pages/join/join' })
      }
    })
  }
})
