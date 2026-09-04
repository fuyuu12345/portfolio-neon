(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SITE = window.SITE || {};
  const root = "../.."; // repo root from preview/mobile/

  const drinks = [
    {
      id: "bitter",
      name: { zh: "静默苦味", en: "SILENT BITTER" },
      blurb: { zh: "雨夜进店。先认识酒保。", en: "Rainy night. Meet the bartender." },
      price: "$12",
    },
    {
      id: "mosaic",
      name: { zh: "数据马赛克", en: "DATA MOSAIC" },
      blurb: { zh: "香港与上海的碎片。", en: "Fragments of HK & Shanghai." },
      price: "$14",
    },
    {
      id: "collins",
      name: { zh: "故障柯林斯", en: "GLITCH COLLINS" },
      blurb: { zh: "赛博蜉蝣是怎么养的。", en: "How Cyber Ephemera grew." },
      price: "$11",
    },
    {
      id: "sunset",
      name: { zh: "像素落日", en: "PIXEL SUNSET" },
      blurb: { zh: "找故事，还是找履历？", en: "Stories — or resume?" },
      price: "$13",
    },
  ];

  const tabDefs = [
    { id: "cases", label: { zh: "整合营销案", en: "IMC Cases" }, key: "cases" },
    { id: "photos", label: { zh: "摄影集", en: "Photography" }, key: "photos" },
    { id: "social", label: { zh: "社交媒体作品", en: "Social" }, key: "content" },
    { id: "other", label: { zh: "其ta", en: "Other" }, key: "other" },
  ];

  const state = {
    feat: 0,
    muted: false,
    lang: "zh",
    workTab: "cases",
    sheetKind: null,
    awaitingChoice: false,
    musicIndex: SITE.music?.defaultIndex || 0,
    audio: null,
    storyId: null,
    storyNode: null,
    storyHistory: [],
    hasOrderedDrink: false,
    typingTimer: null,
    typingFull: "",
    typingDone: null,
    chatIdle: false,
    chatFolded: false,
    panelLines: [],
    panelIdx: 0,
    panelKind: null,
  };

  const STORIES = window.MOBILE_STORIES || {};
  const UI = {
    brandEyebrow: { zh: "赛博蜉蝣", en: "CYBER FUYUU" },
    bootWelcome: { zh: "雨还在下。先推门进来。", en: "Rain's still falling. Push the door." },
    bootEnter: { zh: "推门进入", en: "ENTER" },
    welcomeHi: { zh: "欢迎，", en: "WELCOME," },
    welcomeName: { zh: "陌生人", en: "STRANGER" },
    langMenu: { zh: "语言 · 中文 / EN", en: "Language · EN / 中文" },
    mute: { zh: "静音", en: "Mute" },
    sound: { zh: "声音", en: "Sound" },
    playing: { zh: "播放中", en: "Playing" },
    paused: { zh: "已暂停", en: "Paused" },
    muted: { zh: "静音", en: "Muted" },
    tapNext: { zh: "点 NEXT 开声", en: "Tap NEXT for sound" },
    noTrack: { zh: "无曲目", en: "No tracks" },
    waitEnter: { zh: "等待推门", en: "Waiting to enter" },
    nowHint: { zh: "进店后自动播 · 可切歌", en: "Autoplay after enter · next track OK" },
    specials: { zh: "今日特调", en: "TODAY'S SPECIALS" },
    specialsHint: { zh: "点一杯，和 Lorde 聊两句", en: "Order a drink — talk with Lorde" },
    featured: { zh: "精选作品", en: "FEATURED" },
    featuredHint: { zh: "精选作品", en: "Selected works" },
    openWork: { zh: "查看作品 →", en: "View work →" },
    storyBack: { zh: "返回", en: "Back" },
    dockTalk: { zh: "点单", en: "Order" },
    dockAbout: { zh: "关于", en: "About" },
    dockSkills: { zh: "技能", en: "Skills" },
    dockWork: { zh: "作品", en: "Works" },
    dockExp: { zh: "经历", en: "Exp" },
    dockContact: { zh: "联系", en: "Contact" },
    sheetWork: { zh: "作品", en: "Works" },
    sheetExp: { zh: "经历", en: "Experience" },
    sheetContact: { zh: "联系", en: "Contact" },
    aboutIntro: { zh: "关于我——点对话框翻下一段。", en: "About me — tap to flip." },
    skillsIntro: { zh: "技能清单——点对话框翻看。", en: "Skills — tap to flip." },
    empty: { zh: "暂无", en: "Empty" },
    coming: { zh: "制作中", en: "Coming soon" },
    view: { zh: "查看 →", en: "Open →" },
    expFallback: { zh: "经历示意", en: "Experience placeholder" },
    downloadCv: { zh: "下载简历", en: "Download CV" },
    copyWx: { zh: "复制微信", en: "Copy WeChat" },
    copied: { zh: "已复制", en: "Copied" },
    copyFail: { zh: "复制失败，请手动加", en: "Copy failed — add manually" },
    email: { zh: "邮箱", en: "Email" },
    storyEnd: { zh: "结束对话", en: "End chat" },
    orderAgain: { zh: "再点一杯", en: "Another drink" },
    orderOnce: { zh: "点一杯", en: "Order a drink" },
    foldHide: { zh: "收起对话", en: "Hide chat" },
    foldShow: { zh: "打开对话", en: "Open chat" },
    drinkMenu: {
      zh: "今晚想喝哪一杯？右边也有，点这里也行。",
      en: "What'll it be? Menu's on the right — or pick here.",
    },
    drinkAgain: { zh: "再来一杯？选吧。", en: "Another round? Pick one." },
    idleHint: {
      zh: "想喝了再挥手，或者点下面特调。",
      en: "Wave when you want a drink — or tap a special below.",
    },
    prev: { zh: "上一个", en: "Previous" },
    next: { zh: "下一个", en: "Next" },
  };

  function t(v) {
    if (!v) return "";
    if (typeof v === "string") return v;
    return v[state.lang] || v.zh || v.en || "";
  }

  function refreshChrome() {
    const set = (sel, text) => {
      const el = $(sel);
      if (el) el.textContent = text;
    };
    set("#brandEyebrow", t(UI.brandEyebrow));
    set("#bootEyebrow", t(UI.brandEyebrow));
    set("#bootWelcome", t(UI.bootWelcome));
    set("#bootEnter", t(UI.bootEnter));
    set("#welcomeHi", t(UI.welcomeHi));
    set("#welcomeName", t(UI.welcomeName));
    set("#menuLang", t(UI.langMenu));
    set("#menuMute", state.muted ? t(UI.sound) : t(UI.mute));
    set("#storyBack", t(UI.storyBack));
    set("#nowHint", t(UI.nowHint));
    set("#specialsTitle", t(UI.specials));
    set("#specialsHint", t(UI.specialsHint));
    set("#featuredHint", t(UI.featuredHint));
    set("#featOpen", t(UI.openWork));
    set('[data-nav="about"]', t(UI.dockAbout));
    set('[data-nav="skills"]', t(UI.dockSkills));
    set('[data-nav="work"]', t(UI.dockWork));
    set('[data-nav="exp"]', t(UI.dockExp));
    set('[data-nav="contact"]', t(UI.dockContact));
    refreshFoldBtn();
    const prev = $("#featPrev");
    const next = $("#featNext");
    if (prev) prev.setAttribute("aria-label", t(UI.prev));
    if (next) next.setAttribute("aria-label", t(UI.next));
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  }

  function setLang(next) {
    state.lang = next;
    refreshChrome();
    renderDrinks();
    renderFeature();
    refreshMusicStatus();
    if (state.storyId && state.storyNode) {
      const choices = $("#choices");
      const keepList = choices?._list;
      renderStoryNode(state.storyNode, false);
      if (keepList && !STORIES[state.storyId]?.nodes?.[state.storyNode]?.choices) {
        // menu/end choices rebuilt inside renderStoryNode
      }
    } else if (state.panelKind) {
      playPanelLines(state.panelKind);
    } else if (state.chatIdle && !state.chatFolded) {
      typeLine(t(UI.idleHint), () => showChoices(idleOrderChoices()));
    }
    if (state.sheetKind) openSheet(state.sheetKind);
  }

  function refreshMusicStatus() {
    const audio = state.audio;
    const el = $("#musicStatus");
    if (!el) return;
    if (!tracks().length) {
      el.textContent = t(UI.noTrack);
      return;
    }
    if (!audio || !audio.src) {
      el.textContent = t(UI.waitEnter);
      return;
    }
    if (state.muted) {
      el.textContent = t(UI.muted);
      return;
    }
    if (audio.paused) {
      el.textContent = t(UI.paused);
      return;
    }
    el.textContent = t(UI.playing);
  }

  async function setMuted(next) {
    state.muted = next;
    const audio = ensureAudio();
    audio.muted = state.muted;
    refreshChrome();
    if (!state.muted && audio.paused && audio.src) {
      try {
        await audio.play();
        $("#musicStatus").textContent = t(UI.playing);
      } catch {
        $("#musicStatus").textContent = t(UI.tapNext);
      }
    } else {
      refreshMusicStatus();
    }
  }

  function zh(v) {
    return t(v);
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
      $("#musicStatus").textContent = t(UI.noTrack);
      return;
    }
    state.musicIndex = ((index % list.length) + list.length) % list.length;
    const track = list[state.musicIndex];
    const audio = ensureAudio();
    audio.src = abs(track.file);
    audio.muted = state.muted;
    $("#musicTitle").textContent = zh(track.title) || track.id;
    if (!autoplay || state.muted) {
      $("#musicStatus").textContent = state.muted ? t(UI.muted) : t(UI.paused);
      return;
    }
    try {
      await audio.play();
      $("#musicStatus").textContent = t(UI.playing);
    } catch {
      $("#musicStatus").textContent = t(UI.tapNext);
    }
  }

  function enter() {
    $("#boot").hidden = true;
    $("#app").hidden = false;
    refreshChrome();
    renderDrinks();
    renderFeature();
    playTrack(state.musicIndex, true);
    startStory("welcome");
  }

  function showChoices(list) {
    const box = $("#choices");
    state.awaitingChoice = !!list?.length;
    box.hidden = !list?.length;
    box._list = list || [];
    box.innerHTML = (list || [])
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

  function refreshFoldBtn() {
    const btn = $("#talkFold");
    const talk = $("#talk");
    if (!btn || !talk) return;
    btn.hidden = !state.chatIdle;
    btn.textContent = t(state.chatFolded ? UI.foldShow : UI.foldHide);
    talk.classList.toggle("is-folded", state.chatIdle && state.chatFolded);
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
        label: state.hasOrderedDrink ? t(UI.orderAgain) : t(UI.orderOnce),
        action: "order-again",
      },
    ];
  }

  function drinkChoices() {
    return drinks.map((d) => ({
      label: zh(d.name),
      action: "start-story",
      story: d.id,
    }));
  }

  function endChoices() {
    return [
      { label: t(UI.storyEnd), action: "exit-story" },
      {
        label: state.hasOrderedDrink ? t(UI.orderAgain) : t(UI.orderOnce),
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

  function clearTyping() {
    if (state.typingTimer) {
      clearInterval(state.typingTimer);
      state.typingTimer = null;
    }
  }

  function typeLine(text, onDone) {
    clearTyping();
    const el = $("#dialogueText");
    const cue = $(".talk__cue");
    state.typingFull = text || "";
    state.typingDone = onDone || null;
    el.textContent = "";
    cue.classList.remove("is-off");
    if (!text) {
      cue.classList.add("is-off");
      const done = state.typingDone;
      state.typingDone = null;
      done?.();
      return;
    }
    let i = 0;
    state.typingTimer = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearTyping();
        cue.classList.add("is-off");
        const done = state.typingDone;
        state.typingDone = null;
        done?.();
      }
    }, 18);
  }

  function skipTyping() {
    if (!state.typingTimer) return false;
    clearTyping();
    $("#dialogueText").textContent = state.typingFull;
    $(".talk__cue").classList.add("is-off");
    const done = state.typingDone;
    state.typingDone = null;
    done?.();
    return true;
  }

  function showDrinkMenu() {
    const again = state.hasOrderedDrink;
    state.storyId = "welcome";
    state.storyNode = "w_menu";
    state.storyHistory = [];
    clearPanelLines();
    setChatIdle(false);
    setStoryBar(true);
    hideChoices();
    $$(".drink").forEach((el) => el.classList.remove("is-on"));
    const line = again ? t(UI.drinkAgain) : t(UI.drinkMenu);
    typeLine(line, () => showChoices(drinkChoices()));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    typeLine(zh(node.text), () => {
      showChoices(resolveNodeChoices(node));
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startStory(storyId) {
    if (!STORIES[storyId]) return;
    if (storyId !== "welcome") state.hasOrderedDrink = true;
    state.storyId = storyId;
    state.storyHistory = [];
    state.storyNode = null;
    clearPanelLines();
    setChatIdle(false);
    $$(".drink").forEach((el) => el.classList.toggle("is-on", el.dataset.drink === storyId));
    $$(".dock__btn").forEach((b) => b.classList.remove("is-on"));
    renderStoryNode(STORIES[storyId].start, false);
  }

  function exitStory() {
    // Idle after end: keep「点一杯」, offer fold/open chat (same idea as desktop).
    state.storyId = null;
    state.storyNode = null;
    state.storyHistory = [];
    clearPanelLines();
    setStoryBar(false);
    hideChoices();
    $$(".drink").forEach((el) => el.classList.remove("is-on"));
    setChatIdle(true);
    setChatFolded(false);
    typeLine(t(UI.idleHint), () => showChoices(idleOrderChoices()));
  }

  function storyBack() {
    if (!state.storyId) return;
    if (state.storyHistory.length) {
      renderStoryNode(state.storyHistory.pop(), false);
      return;
    }
    if (state.storyId !== "welcome") {
      showDrinkMenu();
      return;
    }
    exitStory();
  }

  function pickChoice(item) {
    if (state.typingTimer) return;
    if (!item) return;
    if (item.action === "exit-story") {
      exitStory();
      return;
    }
    if (item.action === "order-again") {
      showDrinkMenu();
      return;
    }
    if (item.action === "start-story" && item.story) {
      startStory(item.story);
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
    if (item.action) runStoryAction(item.action);
    if (item.next) renderStoryNode(item.next, true);
  }

  function advanceDialogue() {
    if (skipTyping()) return;
    if (state.panelLines?.length && state.panelIdx < state.panelLines.length - 1) {
      state.panelIdx += 1;
      typeLine(state.panelLines[state.panelIdx]);
    }
  }

  function clearPanelLines() {
    state.panelLines = [];
    state.panelIdx = 0;
    state.panelKind = null;
  }

  function sectionDialogueLines(id) {
    if (id === "about") {
      const body = SITE.about?.[state.lang] || SITE.about?.zh || [];
      return [t(UI.aboutIntro), ...body];
    }
    if (id === "skills") {
      const tags = SITE.skills?.[state.lang] || SITE.skills?.zh || [];
      return [t(UI.skillsIntro), ...tags];
    }
    return [];
  }

  function playPanelLines(id) {
    closeSheet();
    clearPanelLines();
    setChatIdle(false);
    setStoryBar(false);
    hideChoices();
    state.storyId = null;
    state.storyNode = null;
    state.storyHistory = [];
    state.panelKind = id;
    $$(".drink").forEach((el) => el.classList.remove("is-on"));
    $$(".dock__btn").forEach((b) => b.classList.toggle("is-on", b.dataset.nav === id));
    const lines = sectionDialogueLines(id);
    state.panelLines = lines;
    state.panelIdx = 0;
    typeLine(lines[0] || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderDrinks() {
    $("#drinks").innerHTML = drinks
      .map(
        (d) => `<button type="button" class="drink" data-drink="${d.id}">
          <strong>${zh(d.name)}</strong>
          <span>${zh(d.blurb)}</span>
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
    if (!items.length) return `<div class="card"><p>${t(UI.empty)}</p></div>`;
    return items
      .map((it) => {
        let link = `<span style="color:var(--mute)">${t(UI.coming)}</span>`;
        if (Array.isArray(it.links) && it.links.length) {
          link = `<div class="card__links">${it.links
            .map((l) => {
              const href = abs(l.href);
              return href
                ? `<a href="${href}" target="_blank" rel="noopener">${zh(l.label)}</a>`
                : "";
            })
            .join("")}</div>`;
        } else {
          const href = abs(it.link);
          link = href
            ? `<a href="${href}" target="_blank" rel="noopener">${t(UI.view)}</a>`
            : `<span style="color:var(--mute)">${t(UI.coming)}</span>`;
        }
        const tags = Array.isArray(it.tags) && it.tags.length
          ? `<div class="card__tags">${it.tags.map((x) => `<span>${x}</span>`).join("")}</div>`
          : "";
        return `<div class="card"><h3>${zh(it.title)}</h3><p>${zh(it.summary)}</p>${tags}${link}</div>`;
      })
      .join("");
  }

  function openSheet(kind) {
    const sheet = $("#sheet");
    const tabs = $("#sheetTabs");
    const body = $("#sheetBody");
    state.sheetKind = kind;
    sheet.hidden = false;
    document.body.style.overflow = "hidden";
    $$(".dock__btn").forEach((b) => b.classList.toggle("is-on", b.dataset.nav === kind));

    if (kind === "work") {
      $("#sheetTitle").textContent = t(UI.sheetWork);
      tabs.hidden = false;
      tabs.innerHTML = tabDefs
        .map(
          (tab) =>
            `<button type="button" class="sheet__tab${state.workTab === tab.id ? " is-on" : ""}" data-wtab="${tab.id}">${zh(tab.label)}</button>`
        )
        .join("");
      const def = tabDefs.find((tab) => tab.id === state.workTab) || tabDefs[0];
      body.innerHTML = workCards(def.key);
      return;
    }

    tabs.hidden = true;
    if (kind === "exp") {
      $("#sheetTitle").textContent = t(UI.sheetExp);
      const jobs = SITE.experience || [];
      body.innerHTML = jobs.length
        ? jobs
            .map((j) => {
              const bullets = j.bullets?.[state.lang] || j.bullets?.zh || [];
              const line = Array.isArray(bullets) ? bullets.slice(0, 2).join(" ") : "";
              return `<div class="card"><h3>${zh(j.company)}</h3><p>${zh(j.role)} · ${j.period || ""}</p><p>${line}</p></div>`;
            })
            .join("")
        : `<div class="card"><p>${t(UI.expFallback)}</p></div>`;
      return;
    }

    if (kind === "contact") {
      $("#sheetTitle").textContent = t(UI.sheetContact);
      const c = SITE.contact || {};
      const cv = abs(SITE.resumePath || "assets/resume.pdf");
      body.innerHTML = `
        <div class="cta-row">
          <a class="cta cta--fill" href="${cv}" download>${t(UI.downloadCv)}</a>
          <button type="button" class="cta cta--ghost" id="copyWx">${t(UI.copyWx)} ${c.wechat || ""}</button>
        </div>
        <div class="card" style="margin-top:12px"><h3>${t(UI.email)}</h3><p>${c.email || ""}</p></div>`;
      $("#copyWx")?.addEventListener("click", async () => {
        const btn = $("#copyWx");
        try {
          await navigator.clipboard.writeText(c.wechat || "");
          btn.textContent = t(UI.copied);
        } catch {
          btn.textContent = t(UI.copyFail);
        }
      });
      return;
    }
    closeSheet();
  }

  function closeSheet() {
    state.sheetKind = null;
    $("#sheet").hidden = true;
    document.body.style.overflow = "";
  }

  function setDock(nav) {
    if (nav === "about" || nav === "skills") {
      playPanelLines(nav);
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

    $("#talkFold")?.addEventListener("click", (e) => {
      e.stopPropagation();
      setChatFolded(!state.chatFolded);
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

    $("#strangerBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      const menu = $("#strangerMenu");
      const open = menu.hidden;
      menu.hidden = !open;
      $("#strangerBtn").setAttribute("aria-expanded", open ? "true" : "false");
    });

    $("#menuLang").addEventListener("click", (e) => {
      e.stopPropagation();
      setLang(state.lang === "zh" ? "en" : "zh");
      $("#strangerMenu").hidden = true;
      $("#strangerBtn").setAttribute("aria-expanded", "false");
    });

    $("#menuMute").addEventListener("click", async (e) => {
      e.stopPropagation();
      await setMuted(!state.muted);
      $("#strangerMenu").hidden = true;
      $("#strangerBtn").setAttribute("aria-expanded", "false");
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".top__welcome-wrap")) {
        $("#strangerMenu").hidden = true;
        $("#strangerBtn").setAttribute("aria-expanded", "false");
      }
    });

    $("#musicNext").addEventListener("click", () => playTrack(state.musicIndex + 1, true));
  }

  bind();
  refreshChrome();
})();
