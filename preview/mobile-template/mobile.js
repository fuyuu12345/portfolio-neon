(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SITE = window.SITE || {};
  const root = "../.."; // repo root from preview/mobile-template/

  const drinks = [
    { id: "bitter", name: "静默苦味", blurb: "雨夜进店。先认识酒保。", price: "$12", line: "雨敲在霓虹上。吧台那头的人抬眼：「先进来坐。」" },
    { id: "mosaic", name: "数据马赛克", blurb: "香港与上海的碎片。", price: "$14", line: "两座城的碎片拼在杯里——岭南的夜，和上海的投放屏。" },
    { id: "collins", name: "故障柯林斯", blurb: "赛博蜉蝣是怎么养的。", price: "$11", line: "赛博蜉蝣不是人设，是养出来的：短、密、真，像一杯特调。" },
    { id: "sunset", name: "像素落日", blurb: "找故事，还是找履历？", price: "$13", line: "想听故事就点特调；想看履历，底下「经历 / 作品 / 联系」也在。" },
  ];

  const tabDefs = [
    { id: "cases", label: "整合营销案", key: "cases" },
    { id: "photos", label: "摄影集", key: "photos" },
    { id: "social", label: "社交媒体作品", key: "content" },
    { id: "other", label: "其ta", key: "other" },
  ];

  const state = {
    line: 0,
    feat: 0,
    muted: false,
    workTab: "cases",
    awaitingChoice: false,
    musicIndex: SITE.music?.defaultIndex || 0,
    audio: null,
    storyId: null,
    storyNode: null,
    storyHistory: [],
  };

  const STORIES = window.MOBILE_STORIES || {};

  const lines = [
    "外面收工了，这里才刚热场。",
    "Growth Highball。桌上是案例和 Demo，点开就能看。",
    "点一杯特调，或者直接从底下四个按钮进作品。",
  ];

  function zh(v) {
    if (!v) return "";
    return typeof v === "string" ? v : v.zh || v.en || "";
  }

  function abs(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${root}/${path.replace(/^\//, "")}`;
  }

  function portfolioItems(key) {
    return SITE.portfolio?.[key] || [];
  }

  function features() {
    const pick = [
      portfolioItems("other")[0],
      portfolioItems("cases")[0],
      portfolioItems("content")[0],
    ].filter(Boolean);
    return pick.map((it) => ({
      title: zh(it.title),
      sum: zh(it.summary),
      cover: abs(it.cover),
      href: abs(it.link),
    }));
  }

  function tracks() {
    return SITE.music?.tracks || [];
  }

  function ensureAudio() {
    if (!state.audio) {
      state.audio = new Audio();
      state.audio.loop = true;
      state.audio.volume = SITE.music?.volume ?? 0.42;
    }
    return state.audio;
  }

  async function playTrack(index, autoplay) {
    const list = tracks();
    if (!list.length) {
      $("#musicTitle").textContent = "No Signal";
      $("#musicStatus").textContent = "无曲目";
      return;
    }
    state.musicIndex = ((index % list.length) + list.length) % list.length;
    const track = list[state.musicIndex];
    const audio = ensureAudio();
    audio.src = abs(track.file);
    audio.muted = state.muted;
    $("#musicTitle").textContent = zh(track.title) || track.id;
    if (!autoplay || state.muted) {
      $("#musicStatus").textContent = state.muted ? "静音" : "已暂停";
      return;
    }
    try {
      await audio.play();
      $("#musicStatus").textContent = "播放中";
    } catch {
      $("#musicStatus").textContent = "点 NEXT 开声";
    }
  }

  function enter() {
    $("#boot").hidden = true;
    $("#app").hidden = false;
    renderLine();
    renderDrinks();
    renderFeature();
    playTrack(state.musicIndex, true);
  }

  function renderLine() {
    $("#dialogueText").textContent = lines[Math.min(state.line, lines.length - 1)];
    const atEnd = state.line >= lines.length - 1;
    $(".talk__cue").classList.toggle("is-off", atEnd);
    if (atEnd && !state.awaitingChoice) {
      showChoices([
        { label: "先看看作品", action: "work" },
        { label: "点一杯特调", action: "scroll-drinks" },
        { label: "如何联系你", action: "contact" },
      ]);
    }
  }

  function showChoices(list) {
    const box = $("#choices");
    state.awaitingChoice = true;
    box.hidden = false;
    box._list = list;
    box.innerHTML = list
      .map((c, i) => `<button type="button" class="choice" data-choice="${i}">${typeof c.label === "string" ? c.label : zh(c.label)}</button>`)
      .join("");
  }

  function hideChoices() {
    state.awaitingChoice = false;
    $("#choices").hidden = true;
    $("#choices").innerHTML = "";
  }

  function setStoryBar(on) {
    const back = $("#storyBack");
    if (back) back.hidden = !on;
  }

  function endChoices() {
    return [
      { label: "结束对话", action: "exit-story" },
      { label: "再点一杯", action: "order-again" },
    ];
  }

  function resolveNodeChoices(node) {
    if (!node) return [];
    if (node.end) return endChoices();
    return node.choices || [];
  }

  function runStoryAction(action) {
    if (action === "open-exp") openSheet("exp");
    if (action === "open-work") {
      state.workTab = "cases";
      openSheet("work");
    }
    if (action === "open-work-social") {
      state.workTab = "social";
      openSheet("work");
    }
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
    $("#dialogueText").textContent = zh(node.text);
    $(".talk__cue").classList.toggle("is-off", !!node.end);
    showChoices(resolveNodeChoices(node));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startStory(storyId) {
    if (!STORIES[storyId]) return;
    state.storyId = storyId;
    state.storyHistory = [];
    state.storyNode = null;
    $$(".drink").forEach((el) => el.classList.toggle("is-on", el.dataset.drink === storyId));
    renderStoryNode(STORIES[storyId].start, false);
  }

  function exitStory() {
    state.storyId = null;
    state.storyNode = null;
    state.storyHistory = [];
    setStoryBar(false);
    hideChoices();
    $$(".drink").forEach((el) => el.classList.remove("is-on"));
    $("#dialogueText").textContent = "想再听故事，就点下面四杯特调。";
    $(".talk__cue").classList.add("is-off");
    showChoices([
      { label: "再点一杯", action: "order-again" },
      { label: "看看作品", action: "work" },
    ]);
  }

  function storyBack() {
    if (!state.storyId) return;
    if (state.storyHistory.length) {
      renderStoryNode(state.storyHistory.pop(), false);
      return;
    }
    exitStory();
    $("#panelDrinks").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pickChoice(item) {
    if (!item) return;
    if (item.action === "exit-story") {
      exitStory();
      return;
    }
    if (item.action === "order-again") {
      exitStory();
      $("#panelDrinks").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (item.action === "work") {
      openSheet("work");
      return;
    }
    if (item.action === "contact") {
      openSheet("contact");
      return;
    }
    if (item.action === "scroll-drinks") {
      $("#panelDrinks").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (item.action) runStoryAction(item.action);
    if (item.next) renderStoryNode(item.next, true);
  }

  function advanceDialogue() {
    if (state.storyId || state.awaitingChoice) return;
    if (state.line < lines.length - 1) {
      state.line += 1;
      renderLine();
    }
  }

  function renderDrinks() {
    $("#drinks").innerHTML = drinks
      .map(
        (d) => `<button type="button" class="drink" data-drink="${d.id}">
          <strong>${d.name}</strong>
          <span>${d.blurb}</span>
          <em class="drink__price">${d.price}</em>
        </button>`
      )
      .join("");
  }

  function renderFeature() {
    const list = features();
    if (!list.length) return;
    state.feat = ((state.feat % list.length) + list.length) % list.length;
    const f = list[state.feat];
    $("#featTitle").textContent = f.title;
    $("#featSum").textContent = f.sum;
    $("#featCover").style.backgroundImage = f.cover ? `url("${f.cover}")` : "";
    $("#featDots").innerHTML = list
      .map((_, i) => `<i class="${i === state.feat ? "is-on" : ""}"></i>`)
      .join("");
  }

  function workCards(key) {
    const items = portfolioItems(key);
    if (!items.length) return `<div class="card"><p>暂无</p></div>`;
    return items
      .map((it) => {
        const href = abs(it.link);
        const link = href
          ? `<a href="${href}" target="_blank" rel="noopener">查看 →</a>`
          : `<span style="color:var(--mute)">制作中</span>`;
        return `<div class="card"><h3>${zh(it.title)}</h3><p>${zh(it.summary)}</p>${link}</div>`;
      })
      .join("");
  }

  function openSheet(kind) {
    const sheet = $("#sheet");
    const tabs = $("#sheetTabs");
    const body = $("#sheetBody");
    sheet.hidden = false;
    document.body.style.overflow = "hidden";
    $$(".dock__btn").forEach((b) => b.classList.toggle("is-on", b.dataset.nav === kind));

    if (kind === "work") {
      $("#sheetTitle").textContent = "作品";
      tabs.hidden = false;
      tabs.innerHTML = tabDefs
        .map(
          (t) =>
            `<button type="button" class="sheet__tab${state.workTab === t.id ? " is-on" : ""}" data-wtab="${t.id}">${t.label}</button>`
        )
        .join("");
      const def = tabDefs.find((t) => t.id === state.workTab) || tabDefs[0];
      body.innerHTML = workCards(def.key);
      return;
    }

    tabs.hidden = true;
    if (kind === "exp") {
      $("#sheetTitle").textContent = "经历";
      const jobs = SITE.experience || [];
      body.innerHTML = jobs.length
        ? jobs
            .map(
              (j) =>
                `<div class="card"><h3>${zh(j.company)}</h3><p>${zh(j.role)} · ${j.period || ""}</p><p>${(j.bullets?.zh || []).slice(0, 2).join(" ")}</p></div>`
            )
            .join("")
        : `<div class="card"><p>经历示意</p></div>`;
      return;
    }

    if (kind === "contact") {
      $("#sheetTitle").textContent = "联系";
      const c = SITE.contact || {};
      const cv = abs(SITE.resumePath || "assets/resume.pdf");
      body.innerHTML = `
        <div class="cta-row">
          <a class="cta cta--fill" href="${cv}" download>下载简历</a>
          <button type="button" class="cta cta--ghost" id="copyWx">复制微信 ${c.wechat || ""}</button>
        </div>
        <div class="card" style="margin-top:12px"><h3>邮箱</h3><p>${c.email || ""}</p></div>`;
      $("#copyWx")?.addEventListener("click", async () => {
        const btn = $("#copyWx");
        try {
          await navigator.clipboard.writeText(c.wechat || "");
          btn.textContent = "已复制";
        } catch {
          btn.textContent = "复制失败，请手动加";
        }
      });
      return;
    }
    closeSheet();
  }

  function closeSheet() {
    $("#sheet").hidden = true;
    document.body.style.overflow = "";
    $$(".dock__btn").forEach((b) => b.classList.toggle("is-on", b.dataset.nav === "talk"));
  }

  function setDock(nav) {
    if (nav === "talk") {
      closeSheet();
      $("#panelDrinks").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    openSheet(nav);
  }

  function bind() {
    $("#bootEnter").addEventListener("click", enter);
    $("#dialogueBtn").addEventListener("click", advanceDialogue);

    $("#choices").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-choice]");
      if (!btn) return;
      const item = ($("#choices")._list || [])[Number(btn.dataset.choice)];
      hideChoices();
      pickChoice(item);
    });

    $("#drinks").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-drink]");
      if (!btn) return;
      startStory(btn.dataset.drink);
    });

    $("#storyBack").addEventListener("click", (e) => {
      e.stopPropagation();
      storyBack();
    });

    $$(".dock__btn").forEach((b) => b.addEventListener("click", () => setDock(b.dataset.nav)));

    $("#featPrev").addEventListener("click", () => {
      state.feat -= 1;
      renderFeature();
    });
    $("#featNext").addEventListener("click", () => {
      state.feat += 1;
      renderFeature();
    });
    $("#featOpen").addEventListener("click", () => {
      const f = features()[state.feat];
      if (f?.href) window.open(f.href, "_blank", "noopener");
    });

    $("#sheetClose").addEventListener("click", closeSheet);
    $("#sheetScrim").addEventListener("click", closeSheet);
    $("#sheetTabs").addEventListener("click", (e) => {
      const t = e.target.closest("[data-wtab]");
      if (!t) return;
      state.workTab = t.dataset.wtab;
      openSheet("work");
    });

    $("#btnMute").addEventListener("click", async () => {
      state.muted = !state.muted;
      const audio = ensureAudio();
      audio.muted = state.muted;
      $("#btnMute").setAttribute("aria-pressed", String(state.muted));
      $("#btnMute").textContent = state.muted ? "SOUND" : "MUTE";
      if (!state.muted && audio.paused && audio.src) {
        try {
          await audio.play();
          $("#musicStatus").textContent = "播放中";
        } catch {
          $("#musicStatus").textContent = "点 NEXT 开声";
        }
      } else {
        $("#musicStatus").textContent = state.muted ? "静音" : audio.paused ? "已暂停" : "播放中";
      }
    });

    $("#btnLang").addEventListener("click", () => {
      $("#dialogueText").textContent = "Demo stub — language toggle.";
    });

    $("#musicNext").addEventListener("click", () => playTrack(state.musicIndex + 1, true));
  }

  bind();
})();
