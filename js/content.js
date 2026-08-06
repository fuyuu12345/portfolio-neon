/**
 * 站点文案与数据 — 换电脑改内容主要改这个文件。
 * 营销案：填 cover + link 即可；link 为空时显示「制作中」。
 *
 * 私人编辑：页面按 Ctrl+Shift+E，输入 editorPassword 进入「页面编辑模式」。
 * 点网页文字即可改；点「保存」写入本机草稿，「导出草稿」下载 content-draft.js 再合并进本文件。
 * 默认密码请尽快改掉（只有你知道即可）。
 */
window.SITE = {
  /**
   * 编辑模式密码 — 公开仓库请留空，在 js/content.local.js 写真实密码（已 gitignore）。
   * 本地可复制 content.local.js.example → content.local.js。
   */
  editorPassword: "",

  name: { zh: "刘骅慧", en: "Lorde" },
  nameFull: { zh: "刘骅慧 / Lorde", en: "Lorde / 刘骅慧" },
  intent: {
    zh: "海外增长 · 用户增长 · 产品运营 · 内容运营 · 整合营销",
    en: "Overseas Growth · User Growth · Product Ops · Content Ops · Integrated Marketing",
  },
  tagline: {
    zh: "把增长目标拆解成可执行路径的候选人",
    en: "A candidate who turns growth goals into executable paths",
  },
  contact: {
    email: "lorde200071@163.com",
    phone: "13738364702",
    wechat: "UandME_blackandblue",
    xhs: "https://xhslink.com/m/2imyOQhJjm4",
    xhsName: { zh: "赛博蜉蝣", en: "Cyber Ephemera" },
  },
  resumePath: "assets/resume.pdf",

  /** 布局微调（也可在编辑台用滑条改） */
  layout: {
    charOffsetX: 0,
    charOffsetY: 0,
    charScale: 1,
    heroOffsetY: 0,
    dialogueOffsetY: 0,
    sceneMinHeight: 520,
  },

  /**
   * 酒吧 BGM — 像 VA-11 一样可替换曲目
   * 当前为脚本生成的氛围循环（可换成你的 mp3）
   */
  music: {
    volume: 0.42,
    defaultIndex: 0,
    fallbackSynth: false,
    tracks: [
      {
        id: "lorde-bar-1",
        file: "assets/audio/tracks/lorde-bar-1.wav",
        title: { zh: "Neon Pad", en: "Neon Pad" },
      },
      {
        id: "lorde-bar-2",
        file: "assets/audio/tracks/lorde-bar-2.wav",
        title: { zh: "Alley Night", en: "Alley Night" },
      },
      {
        id: "lorde-bar-3",
        file: "assets/audio/tracks/lorde-bar-3.wav",
        title: { zh: "Chill Bar", en: "Chill Bar" },
      },
    ],
  },

  ui: {
    barName: { zh: "LORDE HALL-A", en: "LORDE HALL-A" },
    statusOpen: { zh: "OPEN · 上海", en: "OPEN · Shanghai" },
    muteOn: { zh: "静音", en: "Mute" },
    muteOff: { zh: "声音", en: "Sound" },
    musicLabel: { zh: "BGM", en: "BGM" },
    musicNone: { zh: "无曲目", en: "No track" },
    musicNext: { zh: "下一首", en: "Next track" },
    langSwitch: { zh: "EN", en: "中文" },
    downloadCv: { zh: "下载简历", en: "Download CV" },
    addWechat: { zh: "加微信", en: "WeChat" },
    viewCase: { zh: "查看策划案 →", en: "Open case →" },
    comingSoon: { zh: "制作中", en: "Coming soon" },
    placeholder: { zh: "待填充", en: "Placeholder" },
    tapContinue: { zh: "点击继续…", en: "Click to continue…" },
    selectDrink: {
      zh: "从菜单点一杯，听听她的故事。",
      en: "Pick a drink from the menu to hear her story.",
    },
  },

  narration: {
    boot: {
      zh: [
        "霓虹闪了一下。吧台那头的人抬起眼。",
        "「欢迎。今晚想听哪一段？」",
        "点单吧——关于增长、投放，还有那些被拆开又拼回去的目标。",
      ],
      en: [
        "The neon flickered. She looked up from the counter.",
        "\"Welcome. Which chapter tonight?\"",
        "Order something — growth, performance, goals broken down and rebuilt.",
      ],
    },
    drinks: {
      about: {
        zh: ["一杯 Neon Intro。她把目标拆成路径，再把路径做成结果。"],
        en: ["A Neon Intro. She turns targets into paths — then paths into results."],
      },
      experience: {
        zh: ["ROI Sour，偏烈。投放、复盘、跨端策略，都在这几段里。"],
        en: ["ROI Sour — sharp. Delivery, reviews, cross-platform strategy."],
      },
      skills: {
        zh: ["Funnel Fizz。标签不多，但都对增长有用。"],
        en: ["Funnel Fizz. Few tags — all growth-relevant."],
      },
      work: {
        zh: ["Growth Highball。两杯整合营销概念案已上桌——美妆与时尚，四平台咬合，点开即是完整方案页。"],
        en: ["Growth Highball. Two IMC concept decks — beauty + fashion, four-platform mix."],
      },
      education: {
        zh: ["Campus Cooler。最高学历在这里。"],
        en: ["Campus Cooler. Highest degree, right here."],
      },
      contact: {
        zh: ["Signal Shot。简历优先；微信次之。信号已开。"],
        en: ["Signal Shot. CV first; WeChat second. Signal's open."],
      },
    },
  },

  drinks: [
    { id: "about", label: { zh: "Neon Intro", en: "Neon Intro" }, sub: { zh: "关于我", en: "About" } },
    { id: "experience", label: { zh: "ROI Sour", en: "ROI Sour" }, sub: { zh: "经历", en: "Experience" } },
    { id: "skills", label: { zh: "Funnel Fizz", en: "Funnel Fizz" }, sub: { zh: "技能", en: "Skills" } },
    { id: "work", label: { zh: "Growth Highball", en: "Growth Highball" }, sub: { zh: "作品", en: "Work" } },
    { id: "education", label: { zh: "Campus Cooler", en: "Campus Cooler" }, sub: { zh: "学历", en: "Education" } },
    { id: "contact", label: { zh: "Signal Shot", en: "Signal Shot" }, sub: { zh: "联系", en: "Contact" } },
  ],

  about: {
    zh: [
      "做过品牌商业化、信息流投放优化、内容生态与 KOL 协同，以及数据复盘。",
      "擅长拆解目标指标，优化转化路径，并用 A/B 测试迭代人群、出价与素材。",
      "长期运营小红书时尚账号，关注增长与转化闭环。",
    ],
    en: [
      "Experience across brand commercialization, performance ads, content ecosystems & KOL collabs, and data reviews.",
      "Strong at decomposing targets, optimizing conversion paths, and iterating audience, bidding, and creatives via A/B tests.",
      "Long-term Xiaohongshu fashion account ops focused on growth and conversion.",
    ],
  },

  education: {
    school: {
      zh: "香港岭南大学",
      en: "Lingnan University, Hong Kong",
    },
    degree: {
      zh: "文化研究 硕士",
      en: "M.A. Cultural Studies",
    },
    period: "2023.08 – 2024.11",
    gpa: "GPA 3.46 / 4.00",
    location: { zh: "香港", en: "Hong Kong" },
  },

  experience: [
    {
      company: { zh: "WPP Media（4A）", en: "WPP Media (4A)" },
      role: {
        zh: "Senior Executive · Performance · LVMH-DIOR",
        en: "Senior Executive · Performance · LVMH-DIOR",
      },
      period: "2026.01 – Present",
      location: { zh: "上海", en: "Shanghai" },
      bullets: {
        zh: [
          "负责 DIOR 女装 & 婴童 ADQ 信息流投放。",
          "日耗约 15 万，ROI 稳定。",
          "人群策略、预算分配、素材 A/B；协同小红书与京准通等跨端打法。",
        ],
        en: [
          "DIOR women & baby fashion ADQ performance delivery.",
          "~¥150k daily spend with stable ROI.",
          "Audience strategy, budget allocation, creative A/B; cross-platform with Xiaohongshu & Jingzhuntong.",
        ],
      },
    },
    {
      company: { zh: "上海宝尊电子商务有限公司", en: "Baozun E-commerce" },
      role: { zh: "市场专员", en: "Marketing Specialist" },
      period: "2025.03 – 2026.01",
      location: { zh: "上海", en: "Shanghai" },
      bullets: {
        zh: [
          "负责健康 / 美妆品牌微信信息流投放。",
          "核心品牌 ROI +68%；整体 ROI 维持 > 1.6。",
          "RTA 再营销策略；Excel 透视与函数做数据复盘。",
        ],
        en: [
          "WeChat performance ads for health & beauty brands.",
          "Core brand ROI +68%; overall ROI held above 1.6.",
          "RTA retargeting; Excel pivots & formulas for reviews.",
        ],
      },
    },
    {
      company: { zh: "上海赛尔森营销策划", en: "Shanghai Nesen Marketing" },
      role: {
        zh: "海外社媒社群运营实习 · 游戏方向",
        en: "Overseas Social / Community Intern · Games",
      },
      period: "2024.11 – 2025.02",
      location: { zh: "上海", en: "Shanghai" },
      bullets: {
        zh: [
          "RPG《Echocalypse》：Discord / Email 对接 KOL 与海外代理。",
          "《GoGo Muffin》TikTok KOL 投放协同。",
        ],
        en: [
          "RPG Echocalypse: KOL & agency ops via Discord / Email.",
          "TikTok KOL delivery support for GoGo Muffin.",
        ],
      },
    },
  ],

  skills: {
    zh: [
      "目标拆解",
      "用户分层",
      "转化漏斗",
      "A/B 测试",
      "信息流优化",
      "再营销 / RTA",
      "素材迭代",
      "KOL / 社群",
      "海外社媒",
      "数据复盘",
      "归因思维",
      "PRD / SOP",
      "小红书增长",
      "TikTok",
      "Discord",
      "Excel",
      "Cursor / AI 工作流",
    ],
    en: [
      "Goal Breakdown",
      "Segmentation",
      "Conversion Funnels",
      "A/B Testing",
      "Performance Ads",
      "Retargeting / RTA",
      "Creative Iteration",
      "KOL / Community",
      "Overseas Social",
      "Data Reviews",
      "Attribution",
      "PRD / SOP",
      "Xiaohongshu Growth",
      "TikTok",
      "Discord",
      "Excel",
      "Cursor / AI Workflows",
    ],
  },

  portfolioTabs: [
    { id: "cases", label: { zh: "整合营销案", en: "IMC Cases" } },
    { id: "content", label: { zh: "内容与视频", en: "Content & Video" } },
    { id: "photos", label: { zh: "摄影集", en: "Photography" } },
  ],

  /**
   * 营销案：cover 封面路径，link 策划案网页（空 = 制作中）
   * 内容/摄影同理；content 可把小红书 IP 摘要放第一条
   */
  portfolio: {
    cases: [
      {
        cover: "assets/cases/su-rebellion-cover.png",
        title: {
          zh: "素的反叛 · 美妆上市整合案",
          en: "Bare Rebellion · Beauty Launch IMC",
        },
        summary: {
          zh: "概念案：小红书议题 × 抖音挑战 × B站信任 × 腾讯转化",
          en: "Concept: XHS · Douyin · Bilibili · Tencent funnel",
        },
        link: "cases/su-rebellion/index.html",
        tags: ["整合营销", "概念案", "美妆", "四平台"],
      },
      {
        cover: "assets/cases/mirror-social-cover.png",
        title: {
          zh: "镜面社交 · 时尚整合营销概念案",
          en: "Mirror Social · Fashion IMC Concept",
        },
        summary: {
          zh: "概念案：试衣间即秀场 · 小红书/抖音/B站/腾讯 + 快闪",
          en: "Concept: runway fitting room · XHS/Douyin/Bili/Tencent + pop-up",
        },
        link: "cases/mirror-social/index.html",
        tags: ["整合营销", "概念案", "时尚", "四平台"],
      },
      {
        cover: "cases/oura-ring/kv-apple-hand-v1.png",
        title: {
          zh: "真我成色 · Oura 妇女节概念案",
          en: "True Hue · Oura Women's Day Concept",
        },
        summary: {
          zh: "概念案：成色礼盒 · 小红书/抖音/B站/腾讯 · 天猫京东收口（可编辑导出 HTML）",
          en: "Concept: ceramic gift set · XHS/Douyin/Bili/Tencent · Tmall/JD",
        },
        link: "cases/oura-ring/index.html",
        tags: ["整合营销", "概念案", "穿戴", "妇女节"],
      },
      {
        cover: "",
        title: { zh: "营销案 04", en: "Case 04" },
        summary: { zh: "封面与外链待填充", en: "Cover & link TBD" },
        link: "",
        tags: ["Placeholder"],
      },
    ],
    content: [
      {
        cover: "",
        title: {
          zh: "小红书个人 IP · 时尚赛道 0–1",
          en: "Xiaohongshu Fashion IP · 0→1",
        },
        summary: {
          zh: "6 个月 9500+ 粉；15+ 爆款；万赞视频 ×2；社群 100+",
          en: "9.5k+ followers in 6 months; 15+ viral posts; 2 videos 10k+ likes; 100+ community",
        },
        link: "https://xhslink.com/m/2imyOQhJjm4",
        tags: ["Xiaohongshu", "IP", "Growth"],
      },
      {
        cover: "",
        title: { zh: "内容 / 视频 02", en: "Content / Video 02" },
        summary: { zh: "封面与链接待填充", en: "Cover & link TBD" },
        link: "",
        tags: ["Placeholder"],
      },
      {
        cover: "",
        title: { zh: "内容 / 视频 03", en: "Content / Video 03" },
        summary: { zh: "封面与链接待填充", en: "Cover & link TBD" },
        link: "",
        tags: ["Placeholder"],
      },
      {
        cover: "",
        title: { zh: "内容 / 视频 04", en: "Content / Video 04" },
        summary: { zh: "封面与链接待填充", en: "Cover & link TBD" },
        link: "",
        tags: ["Placeholder"],
      },
    ],
    photos: [
      { cover: "", title: { zh: "摄影 01", en: "Photo 01" }, summary: { zh: "待填充", en: "TBD" }, link: "", tags: [] },
      { cover: "", title: { zh: "摄影 02", en: "Photo 02" }, summary: { zh: "待填充", en: "TBD" }, link: "", tags: [] },
      { cover: "", title: { zh: "摄影 03", en: "Photo 03" }, summary: { zh: "待填充", en: "TBD" }, link: "", tags: [] },
      { cover: "", title: { zh: "摄影 04", en: "Photo 04" }, summary: { zh: "待填充", en: "TBD" }, link: "", tags: [] },
      { cover: "", title: { zh: "摄影 05", en: "Photo 05" }, summary: { zh: "待填充", en: "TBD" }, link: "", tags: [] },
      { cover: "", title: { zh: "摄影 06", en: "Photo 06" }, summary: { zh: "待填充", en: "TBD" }, link: "", tags: [] },
    ],
  },
};
