const store = require('../../utils/store')

Page({
  data: {
    mode: 'create',
    name: '',
    code: ''
  },

  onShow() {
    if (store.getFamily() && store.getMember()) {
      wx.switchTab({ url: '/pages/home/home' })
    }
  },

  switchMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode })
  },

  onName(e) {
    this.setData({ name: e.detail.value })
  },

  onCode(e) {
    this.setData({ code: (e.detail.value || '').toUpperCase() })
  },

  create() {
    const name = (this.data.name || '').trim()
    if (!name) {
      wx.showToast({ title: '先填称呼', icon: 'none' })
      return
    }
    const family = store.createFamily(name)
    wx.showModal({
      title: '家庭已创建',
      content: `家庭码：${family.id}\n把码发给家人即可加入。`,
      showCancel: false,
      success: () => {
        wx.navigateTo({ url: '/pages/about/about?first=1' })
      }
    })
  },

  join() {
    const name = (this.data.name || '').trim()
    const code = (this.data.code || '').trim()
    if (!code || !name) {
      wx.showToast({ title: '填写家庭码和称呼', icon: 'none' })
      return
    }
    wx.showLoading({ title: '加入中' })
    store.joinFamilyAsync(code, name).then((res) => {
      wx.hideLoading()
      if (!res.ok) {
        wx.showModal({ title: '加入失败', content: res.msg, showCancel: false })
        return
      }
      wx.navigateTo({ url: '/pages/about/about?first=1' })
    })
  }
})

