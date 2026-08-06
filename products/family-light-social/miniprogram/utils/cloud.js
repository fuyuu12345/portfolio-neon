/**
 * 微信云开发同步（可选）
 * 在 app.js 把 CLOUD_ENV 换成你的环境 ID 后生效。
 * 集合名：families，文档 _id = 家庭码
 */

const CLOUD_ENV = '' // 例如 'jiadeng-xxxxx'

function enabled() {
  return !!(CLOUD_ENV && wx.cloud)
}

function init() {
  if (!enabled()) return false
  try {
    wx.cloud.init({ env: CLOUD_ENV, traceUser: true })
    return true
  } catch (e) {
    console.warn('cloud init failed', e)
    return false
  }
}

function col() {
  return wx.cloud.database().collection('families')
}

function pullFamily(id) {
  if (!enabled()) return Promise.resolve(null)
  return col()
    .doc(id)
    .get()
    .then((res) => res.data || null)
    .catch(() => null)
}

function pushFamily(family) {
  if (!enabled() || !family) return Promise.resolve()
  const data = { ...family, _syncedAt: Date.now() }
  return col()
    .doc(family.id)
    .set({ data })
    .catch(() =>
      col()
        .add({ data: { ...data, _id: family.id } })
        .catch((e) => console.warn('cloud push failed', e))
    )
}

module.exports = {
  CLOUD_ENV,
  enabled,
  init,
  pullFamily,
  pushFamily
}
