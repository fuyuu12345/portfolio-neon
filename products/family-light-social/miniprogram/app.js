const store = require('./utils/store')
const cloud = require('./utils/cloud')

App({
  globalData: {
    userId: '',
    family: null,
    member: null,
    cloudOn: false
  },

  onLaunch() {
    this.globalData.cloudOn = cloud.init()
    let userId = wx.getStorageSync('jd_user_id')
    if (!userId) {
      userId = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      wx.setStorageSync('jd_user_id', userId)
    }
    this.globalData.userId = userId
    store.hydrate(this)
  }
})
