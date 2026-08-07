/** Copied from preview/js/preview.js STORIES — keep in sync. */
window.MOBILE_STORIES = {
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
          zh: "黑、蕾丝、偶尔一点霓虹。像把夜里的壳穿在身上。",
          en: "Black, lace, a touch of neon — wearing the night like a shell.",
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
