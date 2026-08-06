/**
 * 现居住地：地区 → 国家/省 → 城市（世界范围精选，够天气检索）
 */

const TREE = [
  {
    label: '中国大陆',
    children: [
      { label: '北京', cities: ['北京'] },
      { label: '天津', cities: ['天津'] },
      { label: '上海', cities: ['上海'] },
      { label: '重庆', cities: ['重庆'] },
      { label: '河北', cities: ['石家庄', '唐山', '保定', '秦皇岛', '廊坊', '邯郸'] },
      { label: '山西', cities: ['太原', '大同', '运城', '临汾'] },
      { label: '内蒙古', cities: ['呼和浩特', '包头', '鄂尔多斯', '赤峰'] },
      { label: '辽宁', cities: ['沈阳', '大连', '鞍山', '锦州'] },
      { label: '吉林', cities: ['长春', '吉林', '延边'] },
      { label: '黑龙江', cities: ['哈尔滨', '大庆', '齐齐哈尔', '牡丹江'] },
      { label: '江苏', cities: ['南京', '苏州', '无锡', '常州', '南通', '徐州', '扬州'] },
      { label: '浙江', cities: ['杭州', '宁波', '温州', '嘉兴', '绍兴', '金华', '台州'] },
      { label: '安徽', cities: ['合肥', '芜湖', '蚌埠', '黄山'] },
      { label: '福建', cities: ['福州', '厦门', '泉州', '漳州'] },
      { label: '江西', cities: ['南昌', '赣州', '九江', '上饶'] },
      { label: '山东', cities: ['济南', '青岛', '烟台', '潍坊', '临沂', '威海'] },
      { label: '河南', cities: ['郑州', '洛阳', '开封', '南阳'] },
      { label: '湖北', cities: ['武汉', '宜昌', '襄阳', '黄石'] },
      { label: '湖南', cities: ['长沙', '株洲', '岳阳', '衡阳'] },
      { label: '广东', cities: ['广州', '深圳', '珠海', '佛山', '东莞', '中山', '惠州', '汕头'] },
      { label: '广西', cities: ['南宁', '桂林', '柳州', '北海'] },
      { label: '海南', cities: ['海口', '三亚'] },
      { label: '四川', cities: ['成都', '绵阳', '乐山', '宜宾', '南充'] },
      { label: '贵州', cities: ['贵阳', '遵义', '凯里'] },
      { label: '云南', cities: ['昆明', '大理', '丽江', '西双版纳'] },
      { label: '西藏', cities: ['拉萨', '林芝', '日喀则'] },
      { label: '陕西', cities: ['西安', '咸阳', '宝鸡', '延安'] },
      { label: '甘肃', cities: ['兰州', '天水', '敦煌'] },
      { label: '青海', cities: ['西宁', '海东'] },
      { label: '宁夏', cities: ['银川', '中卫'] },
      { label: '新疆', cities: ['乌鲁木齐', '喀什', '伊犁', '克拉玛依'] }
    ]
  },
  {
    label: '中国港澳台',
    children: [
      { label: '香港', cities: ['香港'] },
      { label: '澳门', cities: ['澳门'] },
      { label: '台湾', cities: ['台北', '高雄', '台中', '台南'] }
    ]
  },
  {
    label: '东亚',
    children: [
      { label: '日本', cities: ['东京', '大阪', '京都', '横滨', '名古屋', '福冈', '札幌'] },
      { label: '韩国', cities: ['首尔', '釜山', '仁川', '济州'] },
      { label: '蒙古', cities: ['乌兰巴托'] },
      { label: '朝鲜', cities: ['平壤'] }
    ]
  },
  {
    label: '东南亚',
    children: [
      { label: '新加坡', cities: ['新加坡'] },
      { label: '马来西亚', cities: ['吉隆坡', '槟城', '马六甲'] },
      { label: '泰国', cities: ['曼谷', '清迈', '普吉'] },
      { label: '越南', cities: ['河内', '胡志明市', '岘港'] },
      { label: '印尼', cities: ['雅加达', '巴厘岛', '泗水'] },
      { label: '菲律宾', cities: ['马尼拉', '宿务'] },
      { label: '柬埔寨', cities: ['金边', '暹粒'] },
      { label: '缅甸', cities: ['仰光', '内比都'] },
      { label: '老挝', cities: ['万象'] }
    ]
  },
  {
    label: '南亚',
    children: [
      { label: '印度', cities: ['新德里', '孟买', '班加罗尔', '加尔各答', '金奈'] },
      { label: '巴基斯坦', cities: ['伊斯兰堡', '卡拉奇', '拉合尔'] },
      { label: '孟加拉', cities: ['达卡'] },
      { label: '斯里兰卡', cities: ['科伦坡'] },
      { label: '尼泊尔', cities: ['加德满都'] }
    ]
  },
  {
    label: '中东',
    children: [
      { label: '阿联酋', cities: ['迪拜', '阿布扎比'] },
      { label: '沙特', cities: ['利雅得', '吉达'] },
      { label: '以色列', cities: ['特拉维夫', '耶路撒冷'] },
      { label: '土耳其', cities: ['伊斯坦布尔', '安卡拉'] },
      { label: '伊朗', cities: ['德黑兰'] },
      { label: '卡塔尔', cities: ['多哈'] }
    ]
  },
  {
    label: '欧洲',
    children: [
      { label: '英国', cities: ['伦敦', '曼彻斯特', '爱丁堡'] },
      { label: '法国', cities: ['巴黎', '里昂', '马赛', '尼斯'] },
      { label: '德国', cities: ['柏林', '慕尼黑', '法兰克福', '汉堡'] },
      { label: '意大利', cities: ['罗马', '米兰', '佛罗伦萨', '威尼斯'] },
      { label: '西班牙', cities: ['马德里', '巴塞罗那', '塞维利亚'] },
      { label: '荷兰', cities: ['阿姆斯特丹', '鹿特丹'] },
      { label: '比利时', cities: ['布鲁塞尔'] },
      { label: '瑞士', cities: ['苏黎世', '日内瓦'] },
      { label: '奥地利', cities: ['维也纳'] },
      { label: '瑞典', cities: ['斯德哥尔摩'] },
      { label: '挪威', cities: ['奥斯陆'] },
      { label: '丹麦', cities: ['哥本哈根'] },
      { label: '芬兰', cities: ['赫尔辛基'] },
      { label: '爱尔兰', cities: ['都柏林'] },
      { label: '葡萄牙', cities: ['里斯本', '波尔图'] },
      { label: '希腊', cities: ['雅典'] },
      { label: '波兰', cities: ['华沙', '克拉科夫'] },
      { label: '捷克', cities: ['布拉格'] },
      { label: '匈牙利', cities: ['布达佩斯'] },
      { label: '俄罗斯', cities: ['莫斯科', '圣彼得堡'] },
      { label: '乌克兰', cities: ['基辅'] }
    ]
  },
  {
    label: '北美',
    children: [
      { label: '美国', cities: ['纽约', '洛杉矶', '旧金山', '芝加哥', '西雅图', '波士顿', '华盛顿', '休斯顿', '迈阿密', '拉斯维加斯'] },
      { label: '加拿大', cities: ['多伦多', '温哥华', '蒙特利尔', '渥太华', '卡尔加里'] },
      { label: '墨西哥', cities: ['墨西哥城', '坎昆'] }
    ]
  },
  {
    label: '南美',
    children: [
      { label: '巴西', cities: ['圣保罗', '里约热内卢', '巴西利亚'] },
      { label: '阿根廷', cities: ['布宜诺斯艾利斯'] },
      { label: '智利', cities: ['圣地亚哥'] },
      { label: '秘鲁', cities: ['利马'] },
      { label: '哥伦比亚', cities: ['波哥大'] }
    ]
  },
  {
    label: '大洋洲',
    children: [
      { label: '澳大利亚', cities: ['悉尼', '墨尔本', '布里斯班', '珀斯', '堪培拉'] },
      { label: '新西兰', cities: ['奥克兰', '惠灵顿', '基督城'] },
      { label: '斐济', cities: ['苏瓦'] }
    ]
  },
  {
    label: '非洲',
    children: [
      { label: '埃及', cities: ['开罗', '亚历山大'] },
      { label: '南非', cities: ['约翰内斯堡', '开普敦', '比勒陀利亚'] },
      { label: '摩洛哥', cities: ['卡萨布兰卡', '马拉喀什'] },
      { label: '肯尼亚', cities: ['内罗毕'] },
      { label: '尼日利亚', cities: ['拉各斯', '阿布贾'] },
      { label: '埃塞俄比亚', cities: ['亚的斯亚贝巴'] }
    ]
  }
]

function regionLabels() {
  return TREE.map((r) => r.label)
}

function subLabels(regionIdx) {
  const r = TREE[regionIdx] || TREE[0]
  return (r.children || []).map((c) => c.label)
}

function cityLabels(regionIdx, subIdx) {
  const r = TREE[regionIdx] || TREE[0]
  const s = (r.children || [])[subIdx] || (r.children || [])[0]
  return (s && s.cities) || ['—']
}

function columnsOf(index) {
  const idx = index || [0, 0, 0]
  const r = idx[0] || 0
  const s = idx[1] || 0
  return [regionLabels(), subLabels(r), cityLabels(r, s)]
}

function clampIndex(index) {
  let r = index[0] || 0
  let s = index[1] || 0
  let c = index[2] || 0
  if (r < 0) r = 0
  if (r >= TREE.length) r = TREE.length - 1
  const subs = TREE[r].children || []
  if (s < 0) s = 0
  if (s >= subs.length) s = Math.max(0, subs.length - 1)
  const cities = (subs[s] && subs[s].cities) || []
  if (c < 0) c = 0
  if (c >= cities.length) c = Math.max(0, cities.length - 1)
  return [r, s, c]
}

function valueAt(index) {
  const [r, s, c] = clampIndex(index || [0, 0, 0])
  const region = TREE[r]
  const sub = region.children[s]
  const city = sub.cities[c]
  return {
    region: region.label,
    sub: sub.label,
    city,
    residence: city,
    label: `${region.label} · ${sub.label} · ${city}`
  }
}

/** 用已存城市名反查滚轮位置；找不到则默认上海 */
function indexOfResidence(residence) {
  const key = (residence || '').trim()
  if (!key) return [0, 2, 0] // 默认上海
  for (let r = 0; r < TREE.length; r++) {
    const subs = TREE[r].children || []
    for (let s = 0; s < subs.length; s++) {
      const cities = subs[s].cities || []
      const c = cities.indexOf(key)
      if (c >= 0) return [r, s, c]
      // 兼容旧数据「浙江杭州」等
      if (key.indexOf(cities[0]) >= 0 && cities.length === 1 && key.indexOf(subs[s].label) >= 0) {
        return [r, s, 0]
      }
      for (let i = 0; i < cities.length; i++) {
        if (key === cities[i] || key.endsWith(cities[i]) || key.indexOf(cities[i]) >= 0) {
          return [r, s, i]
        }
      }
    }
  }
  // 模糊：只匹配城市字
  for (let r = 0; r < TREE.length; r++) {
    const subs = TREE[r].children || []
    for (let s = 0; s < subs.length; s++) {
      const cities = subs[s].cities || []
      for (let i = 0; i < cities.length; i++) {
        if (key.indexOf(cities[i]) >= 0) return [r, s, i]
      }
    }
  }
  return [0, 2, 0]
}

function defaultIndex() {
  return indexOfResidence('上海')
}

const PlacesUtil = {
  TREE,
  columnsOf,
  clampIndex,
  valueAt,
  indexOfResidence,
  defaultIndex,
  regionLabels,
  subLabels,
  cityLabels
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlacesUtil
}
if (typeof window !== 'undefined') {
  window.PlacesUtil = PlacesUtil
}
