/**
 * 作品集霓虹 · HUD 预览
 * 导航短文右下 / 经历·作品弹窗 / 特调闲聊 / 点击音效
 */
(function () {
  const SITE = window.SITE;
  if (!SITE) {
    console.error("缺少 content.js");
    return;
  }

  const $ = (s, r = document) => r.querySelector(s);

  const ICO = {
    about:
      '<path d="M2 2.5h12L8 8.5V13h2v1H6v-1h2V8.5L2 2.5z" fill="none" stroke="currentColor" stroke-width="1"/><path d="M4 3.5h8L8 7.2 4 3.5z" fill="currentColor" opacity=".45"/><circle cx="12.2" cy="3.2" r="1" fill="currentColor"/>',
    work:
      '<rect x="2" y="5" width="12" height="8" fill="none" stroke="currentColor" stroke-width="1"/><path d="M6 5V3.8h4V5M2 8h12" fill="none" stroke="currentColor" stroke-width="1"/><rect x="7" y="9.5" width="2" height="1.5" fill="currentColor"/>',
    skills:
      '<path d="M3 13V8h2.2v5H3zm4 0V5h2.2v8H7zm4 0V3h2.2v10H11z" fill="currentColor"/>',
    experience:
      '<circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1"/><path d="M8 4.5v3.8l2.5 1.5" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="8" cy="8" r="1" fill="currentColor"/>',
    contact:
      '<rect x="2" y="4" width="12" height="8" fill="none" stroke="currentColor" stroke-width="1"/><path d="M2 4l6 4.2L14 4" fill="none" stroke="currentColor" stroke-width="1"/>',
    bitter:
      '<path d="M3 1.5h10L8 8v5h2v1H6v-1h2V8L3 1.5z" fill="none" stroke="currentColor" stroke-width="1"/><path d="M4.5 2.5h7L8 6.8 4.5 2.5z" fill="#ff4b96" opacity=".75"/>',
    mosaic:
      '<rect x="2.5" y="2.5" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1"/><path d="M2.5 8h11M8 2.5v11" stroke="currentColor" stroke-width="1"/><rect x="3.2" y="3.2" width="4" height="4" fill="#00f0ff" opacity=".45"/>',
    collins:
      '<rect x="5" y="1.5" width="6" height="11" rx=".5" fill="none" stroke="currentColor" stroke-width="1"/><rect x="5.8" y="5.2" width="4.4" height="6" fill="#5dffb0" opacity=".5"/>',
    sunset:
      '<rect x="2.5" y="3" width="11" height="10" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="11" cy="5.5" r="1.6" fill="#ffe566"/>',
  };

  const NAV = [
    { id: "about", mode: "panel", label: { zh: "关于我", en: "ABOUT" }, short: { zh: "关于", en: "ABOUT" }, svg: ICO.about },
    { id: "work", mode: "modal", label: { zh: "作品", en: "WORK" }, short: { zh: "作品", en: "WORK" }, svg: ICO.work },
    { id: "experience", mode: "modal", label: { zh: "经历", en: "PROCESS" }, short: { zh: "经历", en: "PROCESS" }, svg: ICO.experience },
    { id: "contact", mode: "modal", label: { zh: "联系", en: "CONTACT" }, short: { zh: "联系", en: "CONTACT" }, svg: ICO.contact },
  ];

  const UI = {
    bootEnter: { zh: "推门进入", en: "ENTER" },
    bootWelcome: {
      zh: "雨还在下。先推门进来。",
      en: "Rain's still falling. Push the door.",
    },
    brandEyebrow: { zh: "赛博蜉蝣", en: "CYBER FUYUU" },
    plaque: { zh: "只做梦想与特调。", en: "We serve dreams and cocktails." },
    welcomeHi: { zh: "欢迎，", en: "WELCOME," },
    welcomeName: { zh: "陌生人", en: "STRANGER" },
    langMenu: { zh: "语言 · 中文 / EN", en: "Language · EN / 中文" },
    muteOn: { zh: "静音", en: "Mute" },
    muteOff: { zh: "声音", en: "Unmute" },
    nowPlaying: { zh: "正在播放", en: "NOW PLAYING" },
    noSignal: { zh: "无信号", en: "No Signal" },
    playing: { zh: "播放中", en: "Playing" },
    muted: { zh: "已静音", en: "Muted" },
    paused: { zh: "已暂停", en: "Paused" },
    tapNext: { zh: "点 NEXT", en: "Tap NEXT" },
    specials: { zh: "今日特调", en: "TODAY'S SPECIALS" },
    specialsHint: { zh: "点一杯，和 Lorde 聊两句", en: "Order a drink — talk with Lorde" },
    featured: { zh: "精选作品", en: "FEATURED WORK" },
    findMe: { zh: "找到我", en: "FIND ME ELSEWHERE" },
    navLabel: { zh: "导航", en: "NAV" },
    next: { zh: "下一首", en: "NEXT" },
    mute: { zh: "静音", en: "MUTE" },
    lang: { zh: "语言", en: "LANG" },
    cv: { zh: "简历", en: "CV" },
    email: { zh: "邮箱", en: "Email" },
    phone: { zh: "手机", en: "Phone" },
    wechat: { zh: "微信", en: "WeChat" },
    xhs: { zh: "小红书", en: "Xiaohongshu" },
    copied: { zh: "微信已复制", en: "WeChat copied" },
    openWork: { zh: "打开作品", en: "Open works" },
    openExp: { zh: "打开经历", en: "Open experience" },
    modalExp: { zh: "经历", en: "Experience" },
    modalWork: { zh: "作品", en: "Works" },
    modalContact: { zh: "联系", en: "Contact" },
    openContact: { zh: "打开联系", en: "Open contact" },
    downloading: { zh: "正在下载", en: "Downloading…" },
    copiedBtn: { zh: "已复制", en: "Copied" },
    tabCases: { zh: "整合营销案", en: "IMC Cases" },
    tabPhotos: { zh: "摄影集", en: "Photos" },
    tabSocial: { zh: "社交媒体作品", en: "Social" },
    tabOther: { zh: "其ta", en: "Other" },
    comingSoon: { zh: "制作中", en: "Coming soon" },
    viewCase: { zh: "查看策划案 →", en: "Open case →" },
    viewWork: { zh: "查看作品 →", en: "View work →" },
    panelHintLong: {
      zh: "长内容已在中间弹窗打开。",
      en: "Opened in the center modal.",
    },
    storyBack: { zh: "返回", en: "Back" },
    storyEnd: { zh: "结束对话", en: "End chat" },
    storyOrder: { zh: "点一杯", en: "Order a drink" },
    storyOrderAgain: { zh: "再点一杯", en: "Another drink" },
    storySit: { zh: "我先坐会", en: "I'll sit for a bit" },
    foldHide: { zh: "收起对话", en: "Hide chat" },
    foldShow: { zh: "打开对话", en: "Open chat" },
    drinkMenuPrompt: {
      zh: "今晚想喝哪一杯？右边也有，点这里也行。",
      en: "What'll it be? Menu's on the right — or pick here.",
    },
    drinkMenuAgain: {
      zh: "再来一杯？选吧。",
      en: "Another round? Pick one.",
    },
    idleAfterEnd: {
      zh: "好。位子给你。想喝了再挥手，或者点右边特调。",
      en: "Alright. Seat's yours — wave for a drink, or tap a special.",
    },
  };

  const SPECIALS = [
    {
      id: "bitter",
      story: "bitter",
      name: { zh: "静默苦味", en: "SILENT BITTER" },
      price: "$12",
      desc: { zh: "雨夜进店。先认识酒保。", en: "Rainy night. Meet the bartender." },
      svg: ICO.bitter,
    },
    {
      id: "mosaic",
      story: "mosaic",
      name: { zh: "数据马赛克", en: "DATA MOSAIC" },
      price: "$14",
      desc: { zh: "香港与上海的碎片。", en: "Fragments of HK & Shanghai." },
      svg: ICO.mosaic,
    },
    {
      id: "collins",
      story: "collins",
      name: { zh: "故障柯林斯", en: "GLITCH COLLINS" },
      price: "$11",
      desc: { zh: "赛博蜉蝣是怎么养的。", en: "How Cyber Ephemera grew." },
      svg: ICO.collins,
    },
    {
      id: "sunset",
      story: "sunset",
      name: { zh: "像素落日", en: "PIXEL SUNSET" },
      price: "$13",
      desc: { zh: "找故事，还是找履历？", en: "Stories — or resume?" },
      svg: ICO.sunset,
    },
  ];

  /** 橙光式短对话：欢迎台 + 每杯约 3～4 层 */
  const STORIES = {
    welcome: {
      start: "w0",
      nodes: {
        w0: {
          text: {
            zh: "霓虹闪了一下。吧台那头的人抬起眼——「欢迎。今晚怎么过？」",
            en: "The neon flickered. She looked up — \"Welcome. How's tonight going?\"",
          },
          choices: [
            { label: { zh: "点一杯", en: "Order a drink" }, next: "w_menu" },
            { label: { zh: "我先坐会", en: "I'll sit for a bit" }, next: "w_sit" },
          ],
        },
        w_menu: {
          text: {
            zh: "今晚想喝哪一杯？右边也有，点这里也行。",
            en: "What'll it be? Menu's on the right — or pick here.",
          },
          menu: "drinks",
        },
        w_sit: {
          text: {
            zh: "好。位子给你。雨停之前不赶人——想喝了再挥手，或者点右边特调。",
            en: "Alright. Seat's yours. No rush before the rain stops — wave when you want a drink, or tap a special.",
          },
          end: true,
        },
      },
    },
    bitter: {
      start: "b0",
      nodes: {
        b0: {
          text: {
            zh: "霓虹闪了一下。你推门进来的时候，雨还挂在肩上。",
            en: "The neon flickered. Rain still clung to your shoulders.",
          },
          choices: [
            { label: { zh: "随便看看。", en: "Just looking around." }, next: "b1a" },
            { label: { zh: "你是老板吗？", en: "Are you the owner?" }, next: "b1b" },
          ],
        },
        b1a: {
          text: {
            zh: "可以。这里不赶客。左边是导航，右边点杯特调也能跟我聊。",
            en: "Sure. No rush. Nav on the left; specials on the right if you want to talk.",
          },
          choices: [
            { label: { zh: "店名什么意思？", en: "What's the bar about?" }, next: "b2a" },
            { label: { zh: "那我先坐会儿。", en: "I'll sit for a bit." }, next: "b2b" },
          ],
        },
        b1b: {
          text: {
            zh: "算半个吧。我是 Lorde——外面叫我蜉蝣。调酒和讲故事，我都干。",
            en: "Half of one. I'm Lorde — some call me Ephemera. I pour drinks and tell stories.",
          },
          choices: [
            { label: { zh: "蜉蝣？", en: "Ephemera?" }, next: "b2c" },
            { label: { zh: "今晚有什么好喝的？", en: "What's good tonight?" }, next: "b2d" },
          ],
        },
      b2a: {
        text: {
          zh: "AFTERGLOW——余辉。外面收工了，灯还留着一点。够你坐下来，听完一段。",
          en: "AFTERGLOW — the afterglow. Outside's closed; a little light stays — enough to sit and finish a story.",
        },
        end: true,
      },
        b2b: {
          text: {
            zh: "好。雨停之前，位子都是你的。想聊了再挥手。",
            en: "Alright. The seat's yours until the rain stops. Wave when you want to talk.",
          },
          end: true,
        },
        b2c: {
          text: {
            zh: "亮一下就够的那种。短、密、认真。像特调，不必解释太久。",
            en: "The kind that glows briefly. Short, dense, sincere — like a special.",
          },
          end: true,
        },
        b2d: {
          text: {
            zh: "右边四杯都是今日特调。点一杯，我们慢慢说。",
            en: "Four specials on the right. Pick one — we'll take it slow.",
          },
          end: true,
        },
      },
    },
    mosaic: {
      start: "m0",
      nodes: {
        m0: {
          text: {
            zh: "有人问我更像香港还是上海。我说：像两座城叠在同一杯里。",
            en: "People ask if I'm more HK or Shanghai. I say: both, layered in one glass.",
          },
          choices: [
            { label: { zh: "念书的时候呢？", en: "What about school?" }, next: "m1a" },
            { label: { zh: "现在呢？", en: "And now?" }, next: "m1b" },
          ],
        },
        m1a: {
          text: {
            zh: "岭南的雨和课堂差不多吵。那会儿我学会把碎片拼成路径。",
            en: "Lingnan rain was as loud as class. I learned to stitch fragments into paths.",
          },
          choices: [
            { label: { zh: "路径？", en: "Paths?" }, next: "m2a" },
            { label: { zh: "想看看经历。", en: "Show me experience." }, next: "m2b", action: "open-exp" },
          ],
        },
        m1b: {
          text: {
            zh: "上海夜班更亮。亮得像还没关的屏。有时我也分不清是加班还是失眠。",
            en: "Shanghai nights glow like unclosed screens. Sometimes I can't tell overtime from insomnia.",
          },
          choices: [
            { label: { zh: "听起来好累。", en: "Sounds exhausting." }, next: "m2c" },
            { label: { zh: "打开经历看看。", en: "Open experience." }, next: "m2b", action: "open-exp" },
          ],
        },
        m2a: {
          text: {
            zh: "后来别人管这叫增长。我只记得：拆开、拼回、再试一次。",
            en: "Later people called it growth. I just remember: take apart, rebuild, try again.",
          },
          choices: [
            { label: { zh: "继续聊生活。", en: "Keep talking life." }, next: "m3a" },
            { label: { zh: "看看经历弹窗。", en: "Open the experience modal." }, next: "m2b", action: "open-exp" },
          ],
        },
        m2b: {
          text: {
            zh: "履历弹窗开了。关了还能回来喝酒——故事和段落，都不用二选一。",
            en: "Experience is open. Close it and come back for a drink — stories and chapters can coexist.",
          },
          end: true,
        },
        m2c: {
          text: {
            zh: "累是真的。但亮着的时候，也有一点好看。像马赛克，近看才乱。",
            en: "It is tiring. But when it glows, it's a little beautiful — mosaic chaos up close.",
          },
          end: true,
        },
        m3a: {
          text: {
            zh: "那再坐会儿。雨停之前，酒吧不会赶人。",
            en: "Then sit a while. The bar doesn't rush anyone before the rain stops.",
          },
          end: true,
        },
      },
    },
    collins: {
      start: "c0",
      nodes: {
        c0: {
          text: {
            zh: "赛博蜉蝣不是设定集，是我一点点养出来的壳——哥特、Lolita、和夜里发的帖。",
            en: "Cyber Ephemera isn't a lore bible. It's a shell I grew — gothic, lolita, late-night posts.",
          },
          choices: [
            { label: { zh: "为什么叫蜉蝣？", en: "Why 'ephemera'?" }, next: "c1a" },
            { label: { zh: "怎么开始养的？", en: "How did it start?" }, next: "c1b" },
          ],
        },
        c1a: {
          text: {
            zh: "因为亮一下就够了。短、密、认真——像特调，不需要解释太久。",
            en: "Because a brief glow is enough. Short, dense, sincere — like a special.",
          },
          choices: [
            { label: { zh: "想看社交媒体作品。", en: "Show social works." }, next: "c2a", action: "open-work-social" },
            { label: { zh: "那你平时穿什么？", en: "What do you wear usually?" }, next: "c2b" },
          ],
        },
        c1b: {
          text: {
            zh: "先从一张图、一条评论开始。后来才有社群、爆款，和那个慢慢成形的名字。",
            en: "It started with one image, one comment. Then community, hits, and a name that slowly stuck.",
          },
          choices: [
            { label: { zh: "打开社交媒体作品。", en: "Open social works." }, next: "c2a", action: "open-work-social" },
            { label: { zh: "听起来像冒险。", en: "Sounds like an adventure." }, next: "c2c" },
          ],
        },
        c2a: {
          text: {
            zh: "作品弹窗里切到「社交媒体作品」。别急着关，慢慢翻。",
            en: "In the works modal, switch to Social. Take your time.",
          },
          end: true,
        },
        c2b: {
          text: {
            zh: "黑。黑衣服、黑鞋。偶尔一件更深的黑，像夜里还开着的底色。",
            en: "Black. Black clothes, black shoes. Sometimes a deeper black — like a night that never fully powered off.",
          },
          end: true,
        },
        c2c: {
          text: {
            zh: "是啊。故障也是风格的一部分——柯林斯这杯，就是为这个取的。",
            en: "Yeah. Glitches are part of the style — that's why this Collins exists.",
          },
          end: true,
        },
      },
    },
    sunset: {
      start: "s0",
      nodes: {
        s0: {
          text: {
            zh: "像素落日这杯是分流用的。你今晚……找故事，还是找履历？",
            en: "Pixel Sunset is a fork. Tonight — stories, or resume?",
          },
          choices: [
            { label: { zh: "找故事。", en: "Stories." }, next: "s1a" },
            { label: { zh: "找履历。", en: "Resume." }, next: "s1b" },
          ],
        },
        s1a: {
          text: {
            zh: "那好。故事不用赶着交。左边随便逛，右边再点别的特调也行。",
            en: "Good. Stories don't need deadlines. Browse the left, or try another special.",
          },
          choices: [
            { label: { zh: "那再听一句收尾。", en: "One last line then." }, next: "s2a" },
            { label: { zh: "其实我也想看作品。", en: "Actually, show me works." }, next: "s2b", action: "open-work" },
          ],
        },
        s1b: {
          text: {
            zh: "履历在弹窗里。你要经历，还是作品？",
            en: "Resume lives in modals. Experience or works?",
          },
          choices: [
            { label: { zh: "经历", en: "Experience" }, next: "s2c", action: "open-exp" },
            { label: { zh: "作品", en: "Works" }, next: "s2b", action: "open-work" },
          ],
        },
        s2a: {
          text: {
            zh: "像素落日最慢。你慢慢看，我在吧台这边。",
            en: "Pixel sunsets are the slowest. Take your time — I'll be at the counter.",
          },
          end: true,
        },
        s2b: {
          text: {
            zh: "作品打开了。三个 Tab：整合营销案、摄影集、社交媒体。",
            en: "Works are open. Three tabs: IMC Cases, Photos, Social.",
          },
          end: true,
        },
        s2c: {
          text: {
            zh: "经历打开了。看完还可以回来点故事杯。",
            en: "Experience is open. You can still come back for a story drink.",
          },
          end: true,
        },
      },
    },
  };

  const state = {
    lang: "zh",
    section: "about",
    muted: false,
    musicIndex: SITE.music?.defaultIndex || 0,
    featureIndex: 0,
    dialogueLines: [],
    dialogueIdx: 0,
    typingTimer: null,
    editing: false,
    audio: null,
    uiCtx: null,
    storyId: null,
    storyNode: null,
    storyHistory: [],
    activeSpecial: null,
    hasOrderedDrink: false,
    workTab: "cases",
    chatIdle: false,
    chatFolded: false,
  };

  function t(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[state.lang] || obj.zh || obj.en || "";
  }

  function asset(file) {
    if (!file) return "";
    if (/^https?:\/\//i.test(file)) return file;
    return `../${file.replace(/^\.\//, "")}`;
  }

  function toast(msg) {
    const el = $("#editorToast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("is-on"), 1600);
  }

  function ensureUiCtx() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!state.uiCtx) state.uiCtx = new Ctx();
    return state.uiCtx;
  }

  function playClick(kind = "click") {
    if (state.muted) return;
    try {
      const ctx = ensureUiCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      const now = ctx.currentTime;
      osc.connect(g);
      g.connect(ctx.destination);
      if (kind === "enter") {
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.14);
        g.gain.setValueAtTime(0.035, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.17);
      } else {
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(210, now + 0.07);
        g.gain.setValueAtTime(0.028, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch {
      /* ignore audio errors */
    }
  }

  function tracks() {
    return SITE.music?.tracks || [];
  }

  function ensureAudio() {
    if (!state.audio) {
      state.audio = new Audio();
      state.audio.loop = true;
      state.audio.preload = "auto";
    }
    return state.audio;
  }

  async function playTrack(index, autoplay) {
    const list = tracks();
    if (!list.length) {
      $("#musicTitle").textContent = "Jazz";
      $("#musicStatus").textContent = t(UI.noSignal);
      document.body.classList.add("is-paused");
      return;
    }
    state.musicIndex = ((index % list.length) + list.length) % list.length;
    const track = list[state.musicIndex];
    const audio = ensureAudio();
    audio.pause();
    audio.src = asset(track.file);
    audio.volume = SITE.music?.volume ?? 0.42;
    audio.muted = state.muted;
    $("#musicTitle").textContent = t(track.title) || track.id;
    document.body.classList.toggle("is-muted", state.muted);
    document.body.classList.remove("is-paused");
    if (autoplay && !state.muted) {
      try {
        await audio.play();
        $("#musicStatus").textContent = t(UI.playing);
      } catch {
        $("#musicStatus").textContent = t(UI.tapNext);
        document.body.classList.add("is-paused");
      }
    } else {
      $("#musicStatus").textContent = state.muted
        ? t(UI.muted)
        : audio.paused
          ? t(UI.paused)
          : t(UI.playing);
    }
  }

  function buildNav() {
    $("#sideNav").innerHTML = NAV.map(
      (n) => `
      <button type="button" class="nav__btn${state.section === n.id ? " is-active" : ""}" data-nav="${n.id}">
        <svg class="nav__ico" viewBox="0 0 16 16" aria-hidden="true">${n.svg}</svg>
        <span class="nav__label">${t(n.short || n.label)}</span>
        <span class="nav__mark" aria-hidden="true"></span>
      </button>`
    ).join("");
  }

  function buildSpecials() {
    $("#specials").innerHTML = SPECIALS.map((s) => {
      const on = state.activeSpecial === s.id ? " is-active" : "";
      return `
        <button type="button" class="special${on}" data-story="${s.story}">
          <svg class="special__ico" viewBox="0 0 16 16" aria-hidden="true">${s.svg}</svg>
          <span>
            <div class="special__name">${t(s.name)}</div>
            <div class="special__desc">${t(s.desc)}</div>
          </span>
          <span class="special__price">${s.price}</span>
        </button>`;
    }).join("");
  }

  function renderChrome() {
    const setText = (sel, value) => {
      const el = $(sel);
      if (el) el.textContent = value;
    };
    setText("#bootEnter", t(UI.bootEnter));
    setText("#bootEyebrow", t(UI.brandEyebrow));
    setText("#bootWelcome", t(UI.bootWelcome));
    setText(".brand__eyebrow", t(UI.brandEyebrow));
    setText(".plaque__text", t(UI.plaque));
    setText(".welcome__hi", t(UI.welcomeHi));
    setText(".welcome__name", t(UI.welcomeName));
    setText("#langBtn", t(UI.langMenu));
    setText("#muteBtn", state.muted ? t(UI.muteOff) : t(UI.muteOn));
    setText(".now__h", t(UI.nowPlaying));
    setText("#specialsTitle", t(UI.specials));
    setText("#specialsHint", t(UI.specialsHint));
    setText(".feature .pane__h", t(UI.featured));
    setText(".foot__h", t(UI.findMe));
    setText("#navLabel", t(UI.navLabel));
    setText("#featureOpen", t(UI.openWork));
    setText("#storyBack", t(UI.storyBack));

    const nextLabel = $("#musicBtn span");
    const muteLabel = $("#funcMute span");
    const langLabel = $("#funcLang span");
    const cvLabel = $("#funcCv span");
    if (nextLabel) nextLabel.textContent = t(UI.next);
    if (muteLabel) muteLabel.textContent = t(UI.mute);
    if (langLabel) langLabel.textContent = t(UI.lang);
    if (cvLabel) cvLabel.textContent = t(UI.cv);
  }

  function renderIdentity() {
    $("#brandSub").textContent = t(SITE.intent);
    $("#footName").textContent = t(SITE.nameFull || SITE.name);
    $("#year").textContent = String(new Date().getFullYear());
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
    renderChrome();
  }

  function features() {
    const cases = SITE.portfolio?.cases || [];
    const content = SITE.portfolio?.content || [];
    const other = SITE.portfolio?.other || [];
    return [
      { item: cases[0], key: "cases" },
      { item: content[0], key: "content" },
      { item: other[0], key: "other" },
    ].filter((entry) => entry.item);
  }

  function renderFeature() {
    const items = features();
    if (!items.length) return;
    const i = ((state.featureIndex % items.length) + items.length) % items.length;
    state.featureIndex = i;
    const entry = items[i];
    const item = entry.item;
    const tabDef = SITE.portfolioTabs?.find((tab) => tab.id === entry.key);
    $("#featureCat").textContent = t(tabDef?.label) || t(UI.tabCases);
    $("#featureTitle").textContent = t(item.title);
    $("#featureSum").textContent = t(item.summary);
    const cover = $("#featureCover");
    if (item.cover) cover.innerHTML = `<img src="${asset(item.cover)}" alt="" />`;
    else cover.innerHTML = `<span class="feature__x"></span>`;
    $("#featureDots").innerHTML = items
      .map((_, idx) => `<i class="${idx === i ? "is-on" : ""}"></i>`)
      .join("");
  }

  function aboutSkillsText() {
    const about = SITE.about?.[state.lang] || SITE.about?.zh || [];
    const skills = SITE.skills?.[state.lang] || SITE.skills?.zh || [];
    if (state.lang === "en") {
      return `About me\n${about.join(" ")}\n\nSkills\n${skills.join(" · ")}`;
    }
    return `关于我\n${about.join("")}\n\n技能\n${skills.join(" · ")}`;
  }

  function aboutSkillsHtml() {
    const about = SITE.about?.[state.lang] || SITE.about?.zh || [];
    const skills = SITE.skills?.[state.lang] || SITE.skills?.zh || [];
    const aboutBlock = about.map((p) => `<p>${p}</p>`).join("");
    const skillBlock = `<div class="tags">${skills.map((x) => `<span class="tag-pill">${x}</span>`).join("")}</div>`;
    const hAbout = state.lang === "en" ? "About" : "关于我";
    const hSkills = state.lang === "en" ? "Skills" : "技能";
    return `<p><strong>${hAbout}</strong></p>${aboutBlock}<p><strong>${hSkills}</strong></p>${skillBlock}`;
  }

  function showAboutSkillsDialogue() {
    hideChoices();
    setStoryBar(false);
    state.storyId = null;
    state.storyNode = null;
    state.storyHistory = [];
    setChatIdle(false);
    clearTyping();
    state.dialogueLines = [aboutSkillsText()];
    state.dialogueIdx = 0;
    typeLine(aboutSkillsText(), () => {
      setChatIdle(true);
      showChoices(idleOrderChoices());
    });
  }

  function sectionHtml(id) {
    if (id === "about" || id === "skills") {
      return aboutSkillsHtml();
    }
    if (id === "contact") {
      return `<p>${t(UI.panelHintLong)}</p>
        <div class="cta">
          <button type="button" class="btn btn--fill" id="reopenModal">${t(UI.openContact)}</button>
        </div>`;
    }
    if (id === "experience" || id === "work") {
      return `<p>${t(UI.panelHintLong)}</p>
        <div class="cta">
          <button type="button" class="btn btn--fill" id="reopenModal">${id === "work" ? t(UI.openWork) : t(UI.openExp)}</button>
        </div>`;
    }
    return `<p>${t(SITE.ui?.selectDrink)}</p>`;
  }

  function clearTyping() {
    if (state.typingTimer) {
      clearInterval(state.typingTimer);
      state.typingTimer = null;
    }
  }

  function hideChoices() {
    const box = $("#choices");
    box.hidden = true;
    box.innerHTML = "";
  }

  function setStoryBar(visible) {
    const btn = $("#storyBack");
    if (btn) btn.hidden = !visible;
  }

  function refreshFoldBtn() {
    const btn = $("#dialogueFold");
    const stack = $("#dialogueStack");
    if (!btn || !stack) return;
    btn.hidden = !state.chatIdle;
    btn.textContent = t(state.chatFolded ? UI.foldShow : UI.foldHide);
    stack.classList.toggle("is-folded", state.chatIdle && state.chatFolded);
  }

  function setChatIdle(on) {
    state.chatIdle = !!on;
    if (!on) state.chatFolded = false;
    refreshFoldBtn();
  }

  function setChatFolded(on) {
    if (!state.chatIdle) return;
    state.chatFolded = !!on;
    refreshFoldBtn();
  }

  function idleOrderChoices() {
    return [
      {
        label: state.hasOrderedDrink ? UI.storyOrderAgain : UI.storyOrder,
        action: "order-again",
      },
    ];
  }

  function exitStory() {
    state.storyId = null;
    state.storyNode = null;
    state.storyHistory = [];
    state.activeSpecial = null;
    hideChoices();
    setStoryBar(false);
    buildSpecials();
    setChatIdle(true);
    setChatFolded(false);
    hideChoices();
    typeLine(t(UI.idleAfterEnd), () => showChoices(idleOrderChoices()));
  }

  function drinkChoices() {
    return SPECIALS.map((s) => ({
      label: s.name,
      action: "start-story",
      story: s.story,
    }));
  }

  function endChoices() {
    return [
      { label: UI.storyEnd, action: "exit-story" },
      {
        label: state.hasOrderedDrink ? UI.storyOrderAgain : UI.storyOrder,
        action: "order-again",
      },
    ];
  }

  function resolveNodeChoices(node) {
    if (node?.choices?.length) return node.choices;
    if (node?.menu === "drinks") return drinkChoices();
    if (node?.end) return endChoices();
    return [];
  }

  function showDrinkMenu() {
    const again = state.hasOrderedDrink;
    state.storyId = "welcome";
    state.storyNode = "w_menu";
    state.storyHistory = again ? [] : state.storyHistory;
    state.activeSpecial = null;
    setChatIdle(false);
    buildSpecials();
    setStoryBar(true);
    hideChoices();
    const line = again ? UI.drinkMenuAgain : UI.drinkMenuPrompt;
    typeLine(t(line), () => showChoices(drinkChoices()));
  }

  function showChoices(choices) {
    const box = $("#choices");
    if (!choices?.length) {
      hideChoices();
      return;
    }
    box.hidden = false;
    box.innerHTML = choices
      .map(
        (c, i) =>
          `<button type="button" class="choice" data-choice="${i}">${t(c.label)}</button>`
      )
      .join("");
  }

  function typeLine(text, onDone) {
    clearTyping();
    const el = $("#dialogueText");
    const arrow = $("#dialogueCursor");
    el.textContent = "";
    arrow.classList.remove("is-done");
    let i = 0;
    state.typingTimer = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearTyping();
        arrow.classList.add("is-done");
        onDone?.();
      }
    }, 18);
  }

  function playDialogue(linesObj) {
    hideChoices();
    setStoryBar(false);
    state.storyId = null;
    state.storyNode = null;
    state.storyHistory = [];
    clearTyping();
    const lines = Array.isArray(linesObj)
      ? linesObj
      : linesObj?.[state.lang] || linesObj?.zh || [];
    state.dialogueLines = lines.length
      ? lines
      : [state.lang === "zh" ? "欢迎。今晚想听哪一段？" : "Welcome. Which chapter tonight?"];
    state.dialogueIdx = 0;
    typeLine(state.dialogueLines[0]);
  }

  function advanceDialogue() {
    if (state.storyId) return;
    if (state.typingTimer) {
      clearTyping();
      $("#dialogueText").textContent = state.dialogueLines[state.dialogueIdx] || "";
      $("#dialogueCursor").classList.add("is-done");
      return;
    }
    if (state.dialogueIdx < state.dialogueLines.length - 1) {
      state.dialogueIdx += 1;
      typeLine(state.dialogueLines[state.dialogueIdx]);
    }
  }

  function runStoryAction(action) {
    if (action === "open-exp") openModal("experience");
    if (action === "open-work") openModal("work", "cases");
    if (action === "open-work-social") openModal("work", "social");
  }

  function renderStoryNode(nodeId, pushHistory = true) {
    const story = STORIES[state.storyId];
    const node = story?.nodes?.[nodeId];
    if (!node) return;
    if (pushHistory && state.storyNode && state.storyNode !== nodeId) {
      state.storyHistory.push(state.storyNode);
    }
    state.storyNode = nodeId;
    setStoryBar(true);
    hideChoices();
    typeLine(t(node.text), () => {
      showChoices(resolveNodeChoices(node));
    });
  }

  function startStory(storyId) {
    if (storyId !== "welcome") state.hasOrderedDrink = true;
    state.activeSpecial = storyId === "welcome" ? null : storyId;
    state.storyId = storyId;
    state.storyHistory = [];
    state.storyNode = null;
    setChatIdle(false);
    buildSpecials();
    const story = STORIES[storyId];
    if (!story) return;
    renderStoryNode(story.start, false);
  }

  function storyBack() {
    if (!state.storyId) return;
    playClick();
    if (state.storyHistory.length) {
      const prev = state.storyHistory.pop();
      renderStoryNode(prev, false);
      return;
    }
    if (state.storyId !== "welcome") {
      showDrinkMenu();
      return;
    }
    exitStory();
  }

  function pickChoice(index) {
    const story = STORIES[state.storyId];
    const node = story?.nodes?.[state.storyNode];
    const choice = resolveNodeChoices(node)[index];
    if (!choice) return;
    playClick();
    if (choice.action === "exit-story") {
      exitStory();
      return;
    }
    if (choice.action === "order-again") {
      showDrinkMenu();
      return;
    }
    if (choice.action === "start-story" && choice.story) {
      startStory(choice.story);
      return;
    }
    if (choice.action) runStoryAction(choice.action);
    if (choice.next) renderStoryNode(choice.next, true);
  }

  function expModalHtml() {
    return (SITE.experience || [])
      .map((exp) => {
        const bullets = exp.bullets?.[state.lang] || [];
        return `<article class="exp">
          <div class="exp__co">${t(exp.company)}</div>
          <div class="exp__meta">${exp.period || ""} · ${t(exp.location)}</div>
          <div class="exp__role">${t(exp.role)}</div>
          <ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
        </article>`;
      })
      .join("");
  }

  function workListHtml(key) {
    const list = SITE.portfolio?.[key] || [];
    if (!list.length) return `<p>${t(UI.comingSoon)}</p>`;
    const ctaLabel = key === "cases" ? UI.viewCase : UI.viewWork;
    return list
      .map((item) => {
        const cover = item.cover
          ? `<img src="${asset(item.cover)}" alt="" />`
          : `<span>${t(UI.comingSoon)}</span>`;
        let link = `<span class="work-link">${t(UI.comingSoon)}</span>`;
        if (Array.isArray(item.links) && item.links.length) {
          link = `<div class="work-links">${item.links
            .map(
              (l) =>
                `<a class="work-link" href="${asset(l.href)}" target="_blank" rel="noopener">${t(l.label)}</a>`
            )
            .join("")}</div>`;
        } else if (item.link) {
          link = `<a class="work-link" href="${asset(item.link)}" target="_blank" rel="noopener">${t(ctaLabel)}</a>`;
        }
        const tags = Array.isArray(item.tags) && item.tags.length
          ? `<div class="work-tags">${item.tags.map((x) => `<span>${x}</span>`).join("")}</div>`
          : "";
        return `<article class="work-card">
          <div class="work-cover">${cover}</div>
          <div>
            <div class="work-title">${t(item.title)}</div>
            <p class="work-sum">${t(item.summary)}</p>
            ${tags}
            ${link}
          </div>
        </article>`;
      })
      .join("");
  }

  function contactModalHtml() {
    const c = SITE.contact || {};
    return `<div class="contact-modal">
      <div class="contact-modal__cta">
        <a class="btn btn--fill" id="downloadCvBtn" href="${asset(SITE.resumePath || "assets/resume.pdf")}" download>${t(SITE.ui?.downloadCv) || "下载简历"}</a>
        <button type="button" class="btn btn--ghost" id="copyWechatBtn">${t(SITE.ui?.addWechat) || "加微信"}</button>
      </div>
      <p>${t(UI.email)}：${c.email || ""}</p>
      <p>${t(UI.phone)}：${c.phone || ""}</p>
      <p>${t(UI.wechat)}：${c.wechat || ""}</p>
      <p>${t(UI.xhs)}：${t(c.xhsName)}</p>
    </div>`;
  }

  function bindContactActions() {
    const dl = $("#downloadCvBtn");
    const wx = $("#copyWechatBtn");
    if (dl) {
      const label = () => t(SITE.ui?.downloadCv) || "下载简历";
      dl.addEventListener("click", () => {
        playClick();
        dl.textContent = t(UI.downloading);
        setTimeout(() => {
          dl.textContent = label();
        }, 1600);
      });
    }
    if (wx) {
      const label = () => t(SITE.ui?.addWechat) || "加微信";
      wx.addEventListener("click", async () => {
        playClick();
        try {
          await navigator.clipboard.writeText(SITE.contact?.wechat || "");
          wx.textContent = t(UI.copiedBtn);
          toast(t(UI.copied));
        } catch {
          wx.textContent = t(UI.copiedBtn);
          toast(SITE.contact?.wechat || "");
        }
        setTimeout(() => {
          wx.textContent = label();
        }, 1600);
      });
    }
  }

  function reopenCurrentModal() {
    if (state.section === "work") openModal("work", state.workTab);
    else if (state.section === "contact") openModal("contact");
    else openModal("experience");
  }

  function openModal(kind, workTab) {
    const modal = $("#modal");
    const tabs = $("#modalTabs");
    const body = $("#modalBody");
    const title = $("#modalTitle");
    modal.hidden = false;

    if (kind === "experience") {
      tabs.hidden = true;
      tabs.innerHTML = "";
      title.textContent = t(UI.modalExp);
      body.innerHTML = expModalHtml();
      state.section = "experience";
    } else if (kind === "contact") {
      tabs.hidden = true;
      tabs.innerHTML = "";
      title.textContent = t(UI.modalContact);
      body.innerHTML = contactModalHtml();
      state.section = "contact";
      bindContactActions();
    } else {
      state.workTab = workTab || state.workTab || "cases";
      tabs.hidden = false;
      title.textContent = t(UI.modalWork);
      const tabDefs = [
        { id: "cases", label: UI.tabCases },
        { id: "photos", label: UI.tabPhotos },
        { id: "social", label: UI.tabSocial, key: "content" },
        { id: "other", label: UI.tabOther },
      ];
      tabs.innerHTML = tabDefs
        .map(
          (tb) =>
            `<button type="button" class="modal__tab${state.workTab === tb.id ? " is-active" : ""}" data-wtab="${tb.id}">${t(tb.label)}</button>`
        )
        .join("");
      const key = state.workTab === "social" ? "content" : state.workTab;
      body.innerHTML = workListHtml(key);
      state.section = "work";
    }
    buildNav();
    $("#contentTitle").textContent = t(NAV.find((n) => n.id === state.section)?.label) || "";
    $("#contentBody").innerHTML = sectionHtml(state.section);
    const reopen = $("#reopenModal");
    if (reopen) {
      reopen.addEventListener("click", () => {
        playClick();
        reopenCurrentModal();
      });
    }
  }

  function closeModal() {
    $("#modal").hidden = true;
  }

  function setSection(id, opts = {}) {
    const navItem = NAV.find((n) => n.id === id);
    if (!navItem) return;
    state.section = id;
    state.activeSpecial = null;
    hideChoices();
    setStoryBar(false);
    state.storyId = null;
    state.storyNode = null;
    state.storyHistory = [];
    setChatIdle(false);
    buildNav();
    buildSpecials();

    if (navItem.mode === "modal") {
      if (id === "work") openModal("work");
      else if (id === "contact") openModal("contact");
      else openModal("experience");
      if (!opts.silent) {
        playDialogue(SITE.narration?.drinks?.[id] || SITE.narration?.boot);
      }
      return;
    }

    closeModal();
    // 关于 / 技能：合并一次展示，结束后保留「点一杯」
    if (id === "about" || id === "skills") {
      $("#contentTitle").textContent = state.lang === "en" ? "ABOUT · SKILLS" : "关于我 · 技能";
      $("#contentBody").innerHTML = aboutSkillsHtml();
      if (!opts.silent) showAboutSkillsDialogue();
      return;
    }

    $("#contentTitle").textContent = t(navItem.label);
    $("#contentBody").innerHTML = sectionHtml(id);
    if (!opts.silent) {
      playDialogue(SITE.narration?.drinks?.[id] || SITE.narration?.boot);
    }
  }

  async function enterApp() {
    $("#boot").hidden = true;
    $("#app").hidden = false;
    playClick("enter");
    renderIdentity();
    renderFeature();
    buildNav();
    buildSpecials();
    setSection("about", { silent: true });
    state.hasOrderedDrink = false;
    startStory("welcome");
    $("#footMail").href = `mailto:${SITE.contact?.email || ""}`;
    $("#footXhs").href = SITE.contact?.xhs || "#";
    if ($("#funcCv")) $("#funcCv").href = asset(SITE.resumePath || "assets/resume.pdf");
    await playTrack(state.musicIndex, true);
    renderChrome();
  }

  function bind() {
    $("#bootEnter").addEventListener("click", enterApp);

    document.addEventListener("click", (e) => {
      const nav = e.target.closest("[data-nav]");
      if (nav?.dataset.nav) {
        playClick();
        setSection(nav.dataset.nav);
      }

      const storyBtn = e.target.closest("[data-story]");
      if (storyBtn?.dataset.story) {
        playClick();
        startStory(storyBtn.dataset.story);
      }

      const choice = e.target.closest("[data-choice]");
      if (choice) {
        pickChoice(Number(choice.dataset.choice));
      }

      const wtab = e.target.closest("[data-wtab]");
      if (wtab?.dataset.wtab) {
        playClick();
        openModal("work", wtab.dataset.wtab);
      }

      if (!e.target.closest(".welcome") && !e.target.closest(".welcome__menu")) {
        $("#strangerMenu").hidden = true;
        $("#strangerBtn").setAttribute("aria-expanded", "false");
      }
    });

    $("#dialogue").addEventListener("click", () => {
      playClick();
      advanceDialogue();
    });

    $("#storyBack").addEventListener("click", (e) => {
      e.stopPropagation();
      storyBack();
    });

    $("#dialogueFold")?.addEventListener("click", (e) => {
      e.stopPropagation();
      playClick();
      setChatFolded(!state.chatFolded);
    });

    $("#strangerBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      playClick();
      const menu = $("#strangerMenu");
      const open = menu.hidden;
      menu.hidden = !open;
      $("#strangerBtn").setAttribute("aria-expanded", open ? "true" : "false");
    });

    function toggleLang() {
      playClick();
      state.lang = state.lang === "zh" ? "en" : "zh";
      renderIdentity();
      renderFeature();
      buildNav();
      buildSpecials();
      refreshFoldBtn();
      if (state.storyId && state.storyNode) renderStoryNode(state.storyNode, false);
      else if (state.chatIdle && !state.chatFolded) {
        typeLine(t(UI.idleAfterEnd), () => showChoices(idleOrderChoices()));
      } else setSection(state.section);
      if (!$("#modal").hidden) {
        reopenCurrentModal();
      }
    }

    async function toggleMute() {
      playClick();
      state.muted = !state.muted;
      const audio = ensureAudio();
      audio.muted = state.muted;
      document.body.classList.toggle("is-muted", state.muted);
      renderChrome();
      $("#musicStatus").textContent = state.muted
        ? t(UI.muted)
        : audio.paused
          ? t(UI.paused)
          : t(UI.playing);
      if (!state.muted && audio.paused && audio.src) {
        try {
          await audio.play();
          document.body.classList.remove("is-paused");
          $("#musicStatus").textContent = t(UI.playing);
        } catch {
          /* ignore */
        }
      }
    }

    $("#langBtn").addEventListener("click", toggleLang);
    $("#funcLang").addEventListener("click", toggleLang);
    $("#muteBtn").addEventListener("click", toggleMute);
    $("#funcMute").addEventListener("click", toggleMute);
    $("#musicBtn").addEventListener("click", () => {
      playClick();
      playTrack(state.musicIndex + 1, true);
    });

    $("#featurePrev").addEventListener("click", () => {
      playClick();
      state.featureIndex -= 1;
      renderFeature();
    });
    $("#featureNext").addEventListener("click", () => {
      playClick();
      state.featureIndex += 1;
      renderFeature();
    });
    $("#featureOpen").addEventListener("click", () => {
      playClick();
      openModal("work", "cases");
    });

    $("#modalClose").addEventListener("click", () => {
      playClick();
      closeModal();
    });
    $("#modalBackdrop").addEventListener("click", () => {
      playClick();
      closeModal();
    });

    $("#footWechat").addEventListener("click", async () => {
      playClick();
      try {
        await navigator.clipboard.writeText(SITE.contact?.wechat || "");
        toast(t(UI.copied));
      } catch {
        toast(SITE.contact?.wechat || "");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("#modal").hidden) {
        closeModal();
        return;
      }
      if (e.ctrlKey && e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        if (state.editing) {
          toast("已在编辑模式");
          return;
        }
        $("#editorGate").hidden = false;
        $("#editorGateErr").textContent = "";
        $("#editorPassInput").value = "";
        $("#editorPassInput").focus();
      }
    });

    $("#editorGateCancel").addEventListener("click", () => {
      $("#editorGate").hidden = true;
    });
    $("#editorGateOk").addEventListener("click", () => {
      if ($("#editorPassInput").value === SITE.editorPassword) {
        state.editing = true;
        document.body.classList.add("is-page-editing");
        $("#pageEditBar").hidden = false;
        $("#editorGate").hidden = true;
        toast("已进入编辑模式");
      } else {
        $("#editorGateErr").textContent = "密码不对";
      }
    });
    $("#editorPassInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("#editorGateOk").click();
    });
    $("#pageEditSave").addEventListener("click", () => {
      localStorage.setItem("lorde-preview-draft", JSON.stringify({ section: state.section, at: Date.now() }));
      toast("已保存到本机预览草稿");
    });
    $("#pageEditExport").addEventListener("click", () => {
      const blob = new Blob(
        [`window.SITE_PREVIEW_DRAFT = ${JSON.stringify({ section: state.section }, null, 2)};\n`],
        { type: "text/javascript" }
      );
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "preview-draft.js";
      a.click();
      URL.revokeObjectURL(a.href);
      toast("已导出");
    });
    $("#pageEditDesk").addEventListener("click", () => toast("预览站：高级面板稍后接入"));
    $("#pageEditExit").addEventListener("click", () => {
      state.editing = false;
      document.body.classList.remove("is-page-editing");
      $("#pageEditBar").hidden = true;
      toast("已退出编辑");
    });
  }

  bind();
  renderChrome();
})();
