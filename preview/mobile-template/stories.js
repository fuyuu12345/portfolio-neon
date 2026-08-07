/** Same story trees as preview/js/preview.js (bitter / mosaic / collins / sunset). */
window.MOBILE_STORIES = {
  bitter: {
    start: "b0",
    nodes: {
      b0: {
        text: { zh: "霓虹闪了一下。你推门进来的时候，雨还挂在肩上。" },
        choices: [
          { label: { zh: "随便看看。" }, next: "b1a" },
          { label: { zh: "你是老板吗？" }, next: "b1b" },
        ],
      },
      b1a: {
        text: { zh: "可以。这里不赶客。左边是导航，右边点杯特调也能跟我聊。" },
        choices: [
          { label: { zh: "店名什么意思？" }, next: "b2a" },
          { label: { zh: "那我先坐会儿。" }, next: "b2b" },
        ],
      },
      b1b: {
        text: { zh: "算半个吧。我是 Lorde——外面叫我蜉蝣。调酒和讲故事，我都干。" },
        choices: [
          { label: { zh: "蜉蝣？" }, next: "b2c" },
          { label: { zh: "今晚有什么好喝的？" }, next: "b2d" },
        ],
      },
      b2a: { text: { zh: "AFTER HOURS。外面收工了，这里才刚热场。" }, end: true },
      b2b: { text: { zh: "好。雨停之前，位子都是你的。想聊了再挥手。" }, end: true },
      b2c: { text: { zh: "亮一下就够的那种。短、密、认真。像特调，不必解释太久。" }, end: true },
      b2d: { text: { zh: "右边四杯都是今日特调。点一杯，我们慢慢说。" }, end: true },
    },
  },
  mosaic: {
    start: "m0",
    nodes: {
      m0: {
        text: { zh: "有人问我更像香港还是上海。我说：像两座城叠在同一杯里。" },
        choices: [
          { label: { zh: "念书的时候呢？" }, next: "m1a" },
          { label: { zh: "现在呢？" }, next: "m1b" },
        ],
      },
      m1a: {
        text: { zh: "岭南的雨和课堂差不多吵。那会儿我学会把碎片拼成路径。" },
        choices: [
          { label: { zh: "路径？" }, next: "m2a" },
          { label: { zh: "想看看经历。" }, next: "m2b", action: "open-exp" },
        ],
      },
      m1b: {
        text: { zh: "上海夜班更亮。亮得像还没关的屏。有时我也分不清是加班还是失眠。" },
        choices: [
          { label: { zh: "听起来好累。" }, next: "m2c" },
          { label: { zh: "打开经历看看。" }, next: "m2b", action: "open-exp" },
        ],
      },
      m2a: {
        text: { zh: "后来别人管这叫增长。我只记得：拆开、拼回、再试一次。" },
        choices: [
          { label: { zh: "继续聊生活。" }, next: "m3a" },
          { label: { zh: "看看经历弹窗。" }, next: "m2b", action: "open-exp" },
        ],
      },
      m2b: { text: { zh: "履历弹窗开了。关了还能回来喝酒——故事和段落，都不用二选一。" }, end: true },
      m2c: { text: { zh: "累是真的。但亮着的时候，也有一点好看。像马赛克，近看才乱。" }, end: true },
      m3a: { text: { zh: "那再坐会儿。雨停之前，酒吧不会赶人。" }, end: true },
    },
  },
  collins: {
    start: "c0",
    nodes: {
      c0: {
        text: { zh: "赛博蜉蝣不是设定集，是我一点点养出来的壳——哥特、Lolita、和夜里发的帖。" },
        choices: [
          { label: { zh: "为什么叫蜉蝣？" }, next: "c1a" },
          { label: { zh: "怎么开始养的？" }, next: "c1b" },
        ],
      },
      c1a: {
        text: { zh: "因为亮一下就够了。短、密、认真——像特调，不需要解释太久。" },
        choices: [
          { label: { zh: "想看社交媒体作品。" }, next: "c2a", action: "open-work-social" },
          { label: { zh: "那你平时穿什么？" }, next: "c2b" },
        ],
      },
      c1b: {
        text: { zh: "先从一张图、一条评论开始。后来才有社群、爆款，和那个慢慢成形的名字。" },
        choices: [
          { label: { zh: "打开社交媒体作品。" }, next: "c2a", action: "open-work-social" },
          { label: { zh: "听起来像冒险。" }, next: "c2c" },
        ],
      },
      c2a: { text: { zh: "作品弹窗里切到「社交媒体作品」。别急着关，慢慢翻。" }, end: true },
      c2b: { text: { zh: "黑、蕾丝、偶尔一点霓虹。像把夜里的壳穿在身上。" }, end: true },
      c2c: { text: { zh: "是啊。故障也是风格的一部分——柯林斯这杯，就是为这个取的。" }, end: true },
    },
  },
  sunset: {
    start: "s0",
    nodes: {
      s0: {
        text: { zh: "像素落日这杯是分流用的。你今晚……找故事，还是找履历？" },
        choices: [
          { label: { zh: "找故事。" }, next: "s1a" },
          { label: { zh: "找履历。" }, next: "s1b" },
        ],
      },
      s1a: {
        text: { zh: "那好。故事不用赶着交。左边随便逛，右边再点别的特调也行。" },
        choices: [
          { label: { zh: "那再听一句收尾。" }, next: "s2a" },
          { label: { zh: "其实我也想看作品。" }, next: "s2b", action: "open-work" },
        ],
      },
      s1b: {
        text: { zh: "履历在弹窗里。你要经历，还是作品？" },
        choices: [
          { label: { zh: "经历" }, next: "s2c", action: "open-exp" },
          { label: { zh: "作品" }, next: "s2b", action: "open-work" },
        ],
      },
      s2a: { text: { zh: "像素落日最慢。你慢慢看，我在吧台这边。" }, end: true },
      s2b: { text: { zh: "作品打开了。四个 Tab：整合营销案、摄影集、社交媒体、其ta。" }, end: true },
      s2c: { text: { zh: "经历打开了。看完还可以回来点故事杯。" }, end: true },
    },
  },
};
