/** 默契题库：覆盖七类题型，每日题卡尽量每类都抽到 */

const LAYERS = ['在意的事', '边界', '理解', '关心方式', '兴趣爱好', '相处节奏', '其他']

/** 各阶段通用大池：按层分类 */
const POOL = {
  在意的事: [
    {
      question: '当我状态不好时，我最希望家里怎么做？',
      options: ['先安慰再谈方法', '别拿别人比较', '给我一点空间', '一起商量下一步']
    },
    {
      question: '关于「被拿来比较」，我真实的感受更接近？',
      options: ['委屈，觉得不被看见', '烦躁，想结束话题', '受伤，信任会下降', '想解释，但常解释不动']
    },
    {
      question: '关于隐私，我的底线更接近？',
      options: ['可以关心，不能替我决定', '可以担心，不能否定人格', '可以建议，不能反复施压', '可以提问，不能翻旧账']
    },
    {
      question: '聊到钱的话题时，我更希望？',
      options: ['先问我愿不愿说', '别用金钱评价我', '一起算账但不指责', '这件事我自己扛']
    }
  ],
  边界: [
    {
      question: '我作息和家里不一致时，怎样的提醒我能接受？',
      options: ['点到为止的一句', '用关心口吻', '写消息别反复电话', '先问我是否需要提醒']
    },
    {
      question: '关于报备，我更认同哪一种？',
      options: ['事后分享即可', '重要事项才提前说', '想听建议时会问', '报备不等于请示批准']
    },
    {
      question: '当意见不合时，我更希望当下怎么处理？',
      options: ['先停一下改天再谈', '换成文字慢慢说', '各退一步', '承认分歧先不解决']
    },
    {
      question: '家人想看我手机或账号时，我更接近？',
      options: ['不行，这是底线', '可以说近况，不交密码', '信任我就不需要查', '有事我会主动说']
    }
  ],
  理解: [
    {
      question: '什么时刻我会觉得被真正理解？',
      options: ['复述我的感受，不急着纠正', '不同意也尊重选择', '记得我说过的小事', '冲突后仍温柔']
    },
    {
      question: '聊到稳定还是兴趣时，我更需要？',
      options: ['先听我怎么想', '一起看风险但不恐吓', '给我探索时间', '把担心说成关心']
    },
    {
      question: '我说「没事」的时候，常常其实是？',
      options: ['暂时不想展开', '需要一点安静', '怕解释不清', '真的还好，别过度解读']
    },
    {
      question: '我觉得被误解时，最想听到的是？',
      options: ['原来你是这样想的', '对不起，我听错了', '你愿意再说一遍吗', '我站在你这边']
    }
  ],
  关心方式: [
    {
      question: '怎样的关心对我来说刚刚好？',
      options: ['短消息、可迟回', '不问一长串细节', '先报「看到了」', '变成具体一点帮助']
    },
    {
      question: '我加班或学习到很晚时，更希望？',
      options: ['一句早点休息就好', '别连环 call', '给我带点吃的/叮嘱喝水', '信任我能安排好']
    },
    {
      question: '关心落空时（例如我不领情），我其实更想说？',
      options: ['方式不对，不是不领情', '我需要的是空间不是建议', '你已经很好了，我只是累', '换一种问法我会接']
    },
    {
      question: '我更愿意接受哪种「关心开口」？',
      options: ['先问需不需要听', '只关心一句近况', '把担心说成关心', '等我主动再说']
    }
  ],
  兴趣爱好: [
    {
      question: '关于我喜欢的事，我更希望家人？',
      options: ['认真听我说为什么喜欢', '别笑我幼稚或不务正业', '偶尔一起试试', '支持就好，不必都懂']
    },
    {
      question: '我投入爱好很久时，更怕家里怎么说？',
      options: ['浪费时间', '对前途没帮助', '别人家孩子不这样', '差不多就行了吧']
    },
    {
      question: '想和家人分享爱好成果时，我更期待？',
      options: ['具体夸一点细节', '问问我怎么做到的', '帮我拍下来留念', '别急着给建议优化']
    },
    {
      question: '如果爱好和「正事」冲突，我更希望被怎样对待？',
      options: ['一起排优先级', '给我保留一块时间', '别二选一逼我', '先承认爱好也重要']
    },
    {
      question: '我平时更爱哪一类味道？',
      options: ['偏辣', '偏甜', '清淡鲜香', '看心情什么都吃']
    },
    {
      question: '饿了最想先来一口的是？',
      options: ['热乎的主食', '水果或酸奶', '零食解馋', '先喝口热的']
    },
    {
      question: '饮料我更偏向？',
      options: ['奶茶/咖啡', '果汁或气泡水', '白开水/茶', '看场合随便']
    },
    {
      question: '周末放松，我更想？',
      options: ['宅家刷剧/游戏', '出门走走逛逛', '睡个够再决定', '和喜欢的人待着']
    },
    {
      question: '看电影我更偏？',
      options: ['喜剧轻松', '剧情/悬疑', '动画或奇幻', '纪录片/文艺']
    },
    {
      question: '音乐我更常听？',
      options: ['流行/说唱', '摇滚/独立', '古典/轻音乐', '播客或安静不听']
    },
    {
      question: '天气好时我更想？',
      options: ['晒太阳散步', '运动出汗', '找家店坐坐', '继续待在家里舒服']
    },
    {
      question: '我更喜欢的季节是？',
      options: ['春天', '夏天', '秋天', '冬天']
    }
  ],
  相处节奏: [
    {
      question: '我最近联系家里的节奏，更接近哪一种？',
      options: ['有事才说，没事也报平安', '固定每周聊一次就好', '想聊时会主动找', '别用频率衡量感情']
    },
    {
      question: '视频通话对我来说？',
      options: ['可以，但别太长', '更喜欢文字', '提前约好时间最好', '突然打来我会有压力']
    },
    {
      question: '见面相处时，我更舒服的节奏是？',
      options: ['有各自空间也有一起', '别安排太满', '一起做点轻松的事', '深度谈话要看我状态']
    },
    {
      question: '分开两地时，怎样的联系让我最安心？',
      options: ['到点报平安即可', '重要节点才细说', '偶尔分享日常就够', '高频没关系，但别查岗']
    }
  ],
  其他: [
    {
      question: '家里气氛紧张时，我通常会？',
      options: ['先躲开冷静', '开玩笑缓和', '直接把话说开', '假装没事但心里记着']
    },
    {
      question: '节日或家庭仪式对我来说？',
      options: ['重要，想好好过', '形式可以简，心意要有', '压力大时宁可变通', '人到齐比仪式重要']
    },
    {
      question: '我更希望家里记住我的哪一面？',
      options: ['努力的样子', '柔软和脆弱的时候', '有趣和爱好', '我正在成为的人']
    },
    {
      question: '如果用一句话形容「理想中的家」，我更靠近？',
      options: ['可以说真话的地方', '吵完还能和好', '彼此不绑架', '有灯就有路']
    },
    {
      question: '早餐我更在意？',
      options: ['一定要吃点东西', '有咖啡/奶茶就行', '睡够比吃更重要', '看当天状态']
    },
    {
      question: '甜食对我来说？',
      options: ['情绪稳定剂', '偶尔解馋就好', '不太爱甜', '看人一起吃更香']
    },
    {
      question: '出门还是宅家，我更常选？',
      options: ['宅家充电', '出门换空气', '看朋友约不约', '一半一半']
    },
    {
      question: '宠物或小动物，我的态度更接近？',
      options: ['很喜欢，想养/已养', '喜欢摸别人家的', '尊重但不太碰', '有点怕或过敏']
    },
    {
      question: '旅行对我来说更像？',
      options: ['放松换环境', '打卡拍照', '吃当地的东西', '能不去就不折腾']
    },
    {
      question: '下雨天我通常会？',
      options: ['特别想待屋里', '撑伞也要出门', '听雨发呆', '心情容易低一点']
    }
  ]
}

/** 圈层标签 → 专属题（希望被理解） */
const WORLD_QUESTIONS = {
  二次元: [
    {
      layer: '兴趣爱好',
      question: '关于二次元，我最希望爸妈怎样对待？',
      options: ['别笑我幼稚', '愿意听我安利一部', '承认它是我的情绪出口', '不理解也可以不贬低']
    },
    {
      layer: '理解',
      question: '我聊角色或剧情时，其实更想要？',
      options: ['被认真听完', '被问一句「为什么喜欢」', '一起看一小段', '别急着扯回学习/工作']
    }
  ],
  女性主义: [
    {
      layer: '在意的事',
      question: '谈到性别平等时，我最希望家人？',
      options: ['先听我为什么在意', '别用「矫情」打发', '愿意一起想公平一点', '允许我们观点不同但尊重']
    },
    {
      layer: '理解',
      question: '我说到「女性主义」时，更怕听到？',
      options: ['你们年轻人就是极端', '以后谁还敢娶/嫁', '别成天想这些', '这和咱们家没关系']
    }
  ],
  小众音乐: [
    {
      layer: '兴趣爱好',
      question: '关于我喜欢的小众音乐，我更希望？',
      options: ['别说「好听吗就这」', '愿意戴上耳机听三十秒', '问我喜欢哪句歌词', '支持我去看演出']
    },
    {
      layer: '相处节奏',
      question: '最想和爸妈一起做的音乐相关事是？',
      options: ['一起听一张专辑', '路上放我的歌单', '去一次小型演出', '安静各听各的也很好']
    }
  ],
  游戏: [
    {
      layer: '兴趣爱好',
      question: '关于游戏，我最希望被怎样理解？',
      options: ['它是放松不是堕落', '可以约定时长但别羞辱', '偶尔问问我在玩什么', '一起开一局也行']
    }
  ],
  宠物: [
    {
      layer: '关心方式',
      question: '谈到宠物时，我更希望家人？',
      options: ['当成我的家人', '别说「养那个干什么」', '关心它的生活', '允许我花合理精力']
    }
  ],
  读书写作: [
    {
      layer: '兴趣爱好',
      question: '我看书或写作时，更希望？',
      options: ['别打断我的整块时间', '愿意听我读一段', '别只问「有没有用」', '帮我留一个安静角落']
    }
  ],
  运动户外: [
    {
      layer: '相处节奏',
      question: '关于运动/户外，我更想和家人？',
      options: ['一起走一段路', '支持我报名活动', '别笑我坚持不了', '关心安全就好']
    }
  ],
  影视综: [
    {
      layer: '兴趣爱好',
      question: '我想安利一部片/综时，更希望？',
      options: ['你们真的打开看一眼', '听我讲为什么好看', '一起追更新', '不看也可以认真听']
    }
  ],
  '手作/绘画': [
    {
      layer: '兴趣爱好',
      question: '关于我的手作/绘画，我更希望？',
      options: ['被具体夸到细节', '别说「能不能当饭吃」', '帮我拍下来留念', '留出桌面和材料空间']
    }
  ]
}

function questionsFromWorlds(worlds) {
  const list = []
  ;(worlds || []).forEach((w) => {
    const preset = WORLD_QUESTIONS[w]
    if (preset && preset.length) {
      preset.forEach((q) => list.push({ ...q, options: q.options.slice() }))
      return
    }
    // 自建标签：通用题模，保证后续仍能匹配进题库
    list.push({
      layer: '兴趣爱好',
      question: `关于「${w}」，我最希望爸妈怎样对待？`,
      options: ['别先否定或嘲笑', '愿意认真听我讲为什么', '不理解也可以尊重', '偶尔一起了解一点点']
    })
    list.push({
      layer: '理解',
      question: `「${w}」对我来说很重要时，我更怕听到？`,
      options: ['这有什么用', '别人家孩子不这样', '别成天想这些', '长大就好了']
    })
  })
  return list
}

function questionsFromUnderstood(items) {
  return (items || []).map((t) => ({
    layer: '理解',
    question: `关于「${t}」，我最希望爸妈怎样回应？`,
    options: ['先承认这对我重要', '试着站在我这边想', '有疑问可以温和地问', '即使不懂也不要否定']
  }))
}

function questionsFromTogether(items) {
  return (items || []).map((t) => ({
    layer: '相处节奏',
    question: `如果可以，我最想和爸妈「${t}」。你们怎么看？`,
    options: ['好啊，约个时间', '先听你为什么想这样', '可以简化版试试', '我有顾虑但愿意商量']
  }))
}

/** 阶段加权补充（仍带 layer） */
const STAGE_EXTRA = {
  student: [
    {
      layer: '在意的事',
      question: '当我成绩波动时，我最希望家里怎么做？',
      options: ['先安慰再谈方法', '别拿别人比较', '给我一点空间', '一起商量下一步']
    },
    {
      layer: '关心方式',
      question: '考试前后，怎样的关心不会让我更慌？',
      options: ['少问结果多问状态', '别制造额外焦虑', '准备点吃的就好', '相信我已经在尽力']
    }
  ],
  junior: [
    {
      layer: '在意的事',
      question: '我加班很晚时，怎样的关心不会增加负担？',
      options: ['消息短、可迟回', '不问一长串细节', '先报「看到了」', '变成具体帮助']
    },
    {
      layer: '边界',
      question: '关于工作选择，我更希望家人？',
      options: ['先听我的理由', '一起看利弊但不拍板', '别用稳定恐吓我', '给我试错的时间']
    }
  ],
  settled: [
    {
      layer: '相处节奏',
      question: '我独立生活后，更希望家里怎样相处？',
      options: ['当我是大人，也当我是家人', '别把关心变成检查', '节日团聚即可', '随时可聊但不绑定']
    }
  ],
  elder: [
    {
      layer: '理解',
      question: '我担心你时，其实更希望被理解成？',
      options: ['我想靠近，不是要管', '我怕，但愿意学新说法', '需要一点信息才安心', '也想被一句「辛苦了」']
    },
    {
      layer: '关心方式',
      question: '我想了解近况时，更舒服的方式是？',
      options: ['先问你方不方便聊', '短讯一句就好', '你主动说时我好好听', '一起吃饭时慢慢聊']
    },
    {
      layer: '相处节奏',
      question: '团聚时我更希望的气氛是？',
      options: ['轻松闲聊就好', '少谈成绩婚恋进度', '一起做点小事', '安静待着也很好']
    },
    {
      layer: '兴趣爱好',
      question: '关于我自己的小爱好，我更希望家人？',
      options: ['愿意听我讲两句', '偶尔一起参与', '别笑我太幼稚', '当成认识我的一部分']
    }
  ]
}

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function withLayer(layer, item) {
  return { layer, question: item.question, options: item.options.slice() }
}

function buildFullPool(about) {
  const list = []
  LAYERS.forEach((layer) => {
    ;(POOL[layer] || []).forEach((q) => list.push(withLayer(layer, q)))
  })

  const role = (about && about.role) || 'child'
  if (role === 'elder') {
    ;(STAGE_EXTRA.elder || []).forEach((q) => list.push({ ...q, options: q.options.slice() }))
  } else {
    const stageKeys =
      about && about.stages && about.stages.length
        ? about.stages
        : [(about && about.stage) || 'other']
    const seenQ = {}
    stageKeys.forEach((stage) => {
      ;((STAGE_EXTRA[stage] || []).concat(STAGE_EXTRA.settled || [])).forEach((q) => {
        if (seenQ[q.question]) return
        seenQ[q.question] = true
        list.push({ ...q, options: q.options.slice() })
      })
    })
  }

  const concerns = (about && about.concerns) || []
  concerns.slice(0, 10).forEach((c) => {
    list.push({
      layer: '在意的事',
      question: `关于「${c}」，我更希望对方怎样理解？`,
      options: ['先听我说完', '别急着否定', '给我空间', '一起找折中']
    })
  })

  // 个性化：圈层 / 想被理解 / 想一起做
  questionsFromWorlds(about && about.worlds).forEach((q) => list.push(q))
  questionsFromUnderstood(about && about.wantUnderstood).forEach((q) => list.push(q))
  questionsFromTogether(about && about.wantTogether).forEach((q) => list.push(q))

  const note = about && about.note
  if (note) {
    list.push({
      layer: '兴趣爱好',
      question: `关于我提过的「${note.slice(0, 18)}」，我更希望家人？`,
      options: ['认真当回事', '好奇地问问', '别急着评价', '记得就很好']
    })
  }

  return list
}

/**
 * 压力话题黑名单：永不进入「父母→孩子」软题库与孩子可见档案文案
 */
const PRESSURE_WORDS = [
  '催婚',
  '催育',
  '相亲',
  '彩礼',
  '生子',
  '生孩子',
  '结婚',
  '定终身',
  '嫁人',
  '娶媳',
  '对象',
  '婚礼',
  '怀孕',
  '二胎',
  '剩女',
  '剩男',
  '该定',
  '婚恋',
  '找对象',
  '抱孙',
  '生孙'
]

function isSoftSafe(text) {
  const s = String(text || '')
  return !PRESSURE_WORDS.some((w) => s.indexOf(w) > -1)
}

function filterSoftSafeTags(tags) {
  return (tags || []).filter((t) => isSoftSafe(t))
}

/** 父母发给孩子的软题库（不对称；不碰婚育压力） */
const ELDER_SOFT_LAYERS = ['关心方式', '我的故事', '相处节奏', '理解', '一起做']

const ELDER_SOFT_POOL = {
  关心方式: [
    {
      question: '我想关心你时，怎样开口你比较收得下？',
      options: ['先问你需不需要听', '只关心一句近况', '把担心说成关心', '等你主动再说']
    },
    {
      question: '我担心你时，其实更希望你明白？',
      options: ['我是关心不是控制', '我怕失控但愿意学习', '我需要一点信息才安心', '我也想靠近关系']
    },
    {
      question: '你累的时候，我怎样做会让你舒服一点？',
      options: ['少问细节', '准备点吃的/叮嘱休息', '安静陪着就好', '给你空间，别连环 call']
    },
    {
      question: '我想给你建议时，怎样才不会变成压力？',
      options: ['先听完你的想法', '只给一次建议', '你问我再开口', '承认你能自己决定']
    }
  ],
  我的故事: [
    {
      question: '我想让你知道，我年轻时其实也？',
      options: ['有自己很在意的爱好', '也会迷茫和丢脸', '做过现在看起来「不务正业」的事', '很需要被一句鼓励']
    },
    {
      question: '关于我的兴趣，我更希望你？',
      options: ['好奇地问问', '别笑我过时', '偶尔一起试试', '记得就很好']
    },
    {
      question: '一件我想慢慢告诉你的事，更接近？',
      options: ['我曾为家人做过的选择', '我一直没说清的担心', '我其实也很想被夸奖', '我有自己骄傲的小事']
    },
    {
      question: '你愿意听我讲过去时，我最希望？',
      options: ['认真听，不急着评判', '问问细节', '帮我一起回忆', '别拿「那时候不一样」打断']
    },
    {
      question: '我想让你记住，我爱吃的是？',
      options: ['家里那几道熟菜', '偏甜的点心', '清淡鲜香', '重口解馋的']
    },
    {
      question: '饮料我更常选？',
      options: ['热茶', '咖啡', '果汁/豆浆', '白开水就好']
    },
    {
      question: '空闲时我更喜欢？',
      options: ['看看电视/听戏', '走走逛逛', '做点手边的事', '发呆或午睡']
    },
    {
      question: '我更喜欢的季节是？',
      options: ['春天', '夏天', '秋天', '冬天']
    }
  ],
  相处节奏: [
    {
      question: '关于联系频率，我更真心的期待是？',
      options: ['有事报平安就好', '固定聊一次就安心', '你想聊时主动找我', '别用频率衡量感情']
    },
    {
      question: '你忙的时候，我怎样配合比较好？',
      options: ['消息短、可迟回', '到点一句平安即可', '不追问行程细节', '信任你能安排好']
    },
    {
      question: '关于上门/团聚，我更希望？',
      options: ['提前说好时间', '轻松比仪式更重要', '你方便为主', '短聚也很好']
    },
    {
      question: '打电话还是文字，我更习惯？',
      options: ['短语音/电话更踏实', '文字就好，别连环', '看你方便', '视频偶尔一次']
    }
  ],
  理解: [
    {
      question: '我说「为你好」的时候，其实更想表达？',
      options: ['我担心你受伤', '我希望你少走弯路', '我不知道怎样更好地支持', '我也想被你理解这份担心']
    },
    {
      question: '当你顶撞或沉默时，我心里更接近？',
      options: ['怕你疏远我', '觉得自己没被尊重', '想学更好的沟通', '需要冷静一下再谈']
    },
    {
      question: '我最想被你理解成哪一种父母？',
      options: ['会担心但仍尊重你', '愿意学习新相处方式', '也需要被关心一下', '把你当大人也当家人']
    },
    {
      question: '意见不合时，我更希望当下怎么做？',
      options: ['先停一下改天再谈', '换成文字慢慢说', '各退一步', '先承认分歧']
    }
  ],
  一起做: [
    {
      question: '如果只能一起做一件小事，我更想？',
      options: ['一起吃顿放松的饭', '一起走走随便聊', '一起看点你喜欢的', '安静待在同一空间']
    },
    {
      question: '节日或休息日，我更期待的相处是？',
      options: ['轻松团聚，不安排太满', '一起做点家务也行', '听你讲最近的生活', '短聚就好，别有压力']
    },
    {
      question: '我想参与你的爱好时，怎样比较合适？',
      options: ['你邀请我再加入', '先了解再评价', '当观众就很好', '偶尔一起试一次']
    },
    {
      question: '有一句我想常对你说的是？',
      options: ['你已经很努力了', '家里永远是你的退路', '我愿意听你说', '慢慢来也没关系']
    },
    {
      question: '一起吃饭时，我更在意？',
      options: ['味道合不合口', '大家聊得轻松', '别催我多吃', '吃完散散步也好']
    },
    {
      question: '我想和你一起试的味道是？',
      options: ['老家味道', '你喜欢的店', '新鲜时令的', '甜品小食']
    },
    {
      question: '下雨天如果在一起，我更想？',
      options: ['在家随便吃点', '看点轻松的', '聊聊天就好', '各自待着也不尴尬']
    }
  ]
}

function buildElderSoftPool(about) {
  const list = []
  ELDER_SOFT_LAYERS.forEach((layer) => {
    ;(ELDER_SOFT_POOL[layer] || []).forEach((q) => {
      if (isSoftSafe(q.question) && (q.options || []).every(isSoftSafe)) {
        list.push(withLayer(layer, q))
      }
    })
  })

  // 仅用软标签个性化；压力向在意永不进给孩子的题
  filterSoftSafeTags(about && about.concerns)
    .slice(0, 6)
    .forEach((c) => {
      list.push({
        layer: '理解',
        question: `关于「${c}」，我更希望你怎样理解我？`,
        options: ['先听我说完', '别急着否定', '给我一点空间', '一起找折中']
      })
    })

  const note = about && about.note
  if (note && isSoftSafe(note)) {
    list.push({
      layer: '我的故事',
      question: `关于我想提的「${String(note).slice(0, 18)}」，我更希望你？`,
      options: ['认真当回事', '好奇地问问', '别急着评价', '记得就很好']
    })
  }

  return list
}

function matchElderSoftQuestions(about, count = 20) {
  const pool = buildElderSoftPool(about)
  const byLayer = {}
  ELDER_SOFT_LAYERS.forEach((l) => {
    byLayer[l] = shuffle(pool.filter((q) => q.layer === l))
  })
  const picked = []
  const used = {}
  function take(q) {
    if (!q || used[q.question] || picked.length >= count) return false
    if (!isSoftSafe(q.question)) return false
    used[q.question] = true
    picked.push(q)
    return true
  }
  ELDER_SOFT_LAYERS.forEach((layer) => {
    const bag = byLayer[layer]
    while (bag && bag.length) {
      if (take(bag.shift())) break
    }
  })
  let guard = 0
  while (picked.length < count && guard < 400) {
    guard++
    let added = false
    for (let i = 0; i < ELDER_SOFT_LAYERS.length && picked.length < count; i++) {
      const bag = byLayer[ELDER_SOFT_LAYERS[i]]
      while (bag && bag.length) {
        if (take(bag.shift())) {
          added = true
          break
        }
      }
    }
    if (!added) break
  }
  if (picked.length < count) shuffle(pool).forEach((q) => take(q))
  return shuffle(picked).slice(0, count)
}

/**
 * 生成每日题卡：先保证 7 类各至少 1 题，再优先塞入个性化题，最后补齐到 count
 * 长辈走软题库（给孩子答），绝不含催婚催育等压力话题
 */
function matchQuestions(about, count = 20) {
  if ((about && about.role) === 'elder') {
    return matchElderSoftQuestions(about, count)
  }
  const pool = buildFullPool(about)
  const personalized = []
  questionsFromWorlds(about && about.worlds).forEach((q) => personalized.push(q))
  questionsFromUnderstood(about && about.wantUnderstood).forEach((q) => personalized.push(q))
  questionsFromTogether(about && about.wantTogether).forEach((q) => personalized.push(q))

  const byLayer = {}
  LAYERS.forEach((l) => {
    byLayer[l] = shuffle(pool.filter((q) => q.layer === l))
  })

  const picked = []
  const used = {}

  function take(q) {
    if (!q || used[q.question] || picked.length >= count) return false
    used[q.question] = true
    picked.push(q)
    return true
  }

  // 1) 个性化优先（最多约占一半）
  shuffle(personalized).forEach((q) => {
    if (picked.length >= Math.min(10, count)) return
    take(q)
  })

  // 2) 每类保底
  LAYERS.forEach((layer) => {
    const bag = byLayer[layer]
    while (bag && bag.length) {
      const q = bag.shift()
      if (take(q)) break
    }
  })

  // 3) 轮询补齐
  let guard = 0
  while (picked.length < count && guard < 500) {
    guard++
    let added = false
    for (let i = 0; i < LAYERS.length && picked.length < count; i++) {
      const bag = byLayer[LAYERS[i]]
      while (bag && bag.length) {
        const q = bag.shift()
        if (take(q)) {
          added = true
          break
        }
      }
    }
    if (!added) break
  }

  if (picked.length < count) {
    shuffle(pool).forEach((q) => take(q))
  }

  return shuffle(picked).slice(0, count)
}

module.exports = {
  matchQuestions,
  matchElderSoftQuestions,
  LAYERS,
  ELDER_SOFT_LAYERS,
  POOL,
  ELDER_SOFT_POOL,
  BANK: POOL,
  WORLD_QUESTIONS,
  PRESSURE_WORDS,
  isSoftSafe,
  filterSoftSafeTags
}
