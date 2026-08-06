/**
 * 二级页返回。
 * fallback: { type:'tab'|'page', url }
 */
function goBack(fallback) {
  const pages = getCurrentPages()
  if (pages && pages.length > 1) {
    wx.navigateBack({ delta: 1 })
    return
  }
  const fb = fallback || { type: 'tab', url: '/pages/mine/mine' }
  if (fb.type === 'page') {
    wx.redirectTo({ url: fb.url })
    return
  }
  wx.switchTab({ url: fb.url })
}

module.exports = { goBack }
