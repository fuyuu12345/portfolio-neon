/**
 * 居住地天气（Open-Meteo，无需 API Key）
 * 小程序真机需在后台配置 request 合法域名：
 * - https://geocoding-api.open-meteo.com
 * - https://api.open-meteo.com
 */

const WMO = {
  0: '晴',
  1: '晴间多云',
  2: '多云',
  3: '阴',
  45: '雾',
  48: '雾',
  51: '毛毛雨',
  53: '毛毛雨',
  55: '毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  66: '冻雨',
  67: '冻雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  77: '雪粒',
  80: '阵雨',
  81: '阵雨',
  82: '强阵雨',
  85: '阵雪',
  86: '阵雪',
  95: '雷雨',
  96: '雷雨',
  99: '雷雨'
}

const cache = {}
const CACHE_MS = 30 * 60 * 1000

function httpGet(url) {
  return new Promise((resolve, reject) => {
    if (typeof wx !== 'undefined' && wx.request) {
      wx.request({
        url,
        method: 'GET',
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data)
          else reject(new Error('weather http ' + res.statusCode))
        },
        fail: reject
      })
      return
    }
    if (typeof fetch !== 'undefined') {
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error('weather http ' + r.status)
          return r.json()
        })
        .then(resolve)
        .catch(reject)
      return
    }
    reject(new Error('no http client'))
  })
}

function codeText(code) {
  return WMO[code] || '天气'
}

function geocode(city) {
  const q = encodeURIComponent(city)
  const url =
    'https://geocoding-api.open-meteo.com/v1/search?name=' +
    q +
    '&count=1&language=zh&format=json'
  return httpGet(url).then((data) => {
    const r = data && data.results && data.results[0]
    if (!r) return null
    return {
      lat: r.latitude,
      lon: r.longitude,
      name: r.name,
      admin: r.admin1 || ''
    }
  })
}

function fetchCurrent(lat, lon) {
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=' +
    lat +
    '&longitude=' +
    lon +
    '&current=temperature_2m,weather_code&timezone=auto'
  return httpGet(url).then((data) => {
    const c = data && data.current
    if (!c) throw new Error('no current')
    const temp = Math.round(c.temperature_2m)
    const text = codeText(c.weather_code)
    return {
      temp,
      text,
      label: text + ' ' + temp + '°'
    }
  })
}

function weatherForResidence(residence) {
  const key = (residence || '').trim()
  if (!key) return Promise.resolve(null)
  const hit = cache[key]
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return Promise.resolve(hit)
  }
  return geocode(key)
    .then((geo) => {
      if (!geo) {
        return {
          place: key,
          label: '未找到该地点',
          error: true,
          at: Date.now()
        }
      }
      return fetchCurrent(geo.lat, geo.lon).then((w) => {
        const row = {
          place: geo.name || key,
          admin: geo.admin,
          temp: w.temp,
          text: w.text,
          label: w.label,
          at: Date.now()
        }
        cache[key] = row
        return row
      })
    })
    .catch(() => ({
      place: key,
      label: '天气暂不可用',
      error: true,
      at: Date.now()
    }))
}

/** 批量给成员补天气（按 residence 字段） */
function attachWeather(members) {
  const list = members || []
  return Promise.all(
    list.map((m) => {
      const residence = (m.residence || '').trim()
      if (!residence) {
        return Promise.resolve(
          Object.assign({}, m, {
            residence: '',
            weatherLabel: '',
            weatherLoading: false
          })
        )
      }
      return weatherForResidence(residence).then((w) =>
        Object.assign({}, m, {
          residence,
          weatherLabel: (w && w.label) || '',
          weatherPlace: (w && w.place) || residence,
          weatherLoading: false
        })
      )
    })
  )
}

module.exports = {
  weatherForResidence,
  attachWeather,
  codeText
}
