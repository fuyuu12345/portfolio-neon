(() => {
  const SITE = window.SITE;
  if (!SITE) return;

  const state = {
    lang: "zh",
    muted: false,
    activeDrink: null,
    portfolioTab: "cases",
    lineQueue: [],
    typing: false,
    typeTimer: null,
    audioCtx: null,
    ambientNodes: null,
    bgmAudio: null,
    trackIndex: 0,
    trackLoadAttempt: 0,
    speaking: false,
    blinkPhase: null,
    speakFlip: false,
    speakTimer: null,
    blinkTimer: null,
    neonTimer: null,
    entered: false,
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const t = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[state.lang] ?? obj.zh ?? obj.en ?? "";
  };

  /* ---------- Portrait: exclusive full-frame swap ---------- */
  function syncPortraitFrame() {
    const stack = $("#portraitStack");
    if (!stack) return;
    let key = "idle";
    if (state.blinkPhase === "closed") key = state.speaking ? "both" : "blink";
    else if (state.speaking) key = state.speakFlip ? "speak" : "idle";
    stack.querySelectorAll(".portrait-art[data-frame]").forEach((img) => {
      img.classList.toggle("is-active", img.dataset.frame === key);
    });
  }

  function blinkOnce() {
    if (state.blinkPhase) return;
    // 整帧切换到真正闭眼立绘，再切回原图
    state.blinkPhase = "closed";
    syncPortraitFrame();
    setTimeout(() => {
      state.blinkPhase = null;
      syncPortraitFrame();
    }, 480);
  }

  function scheduleBlink() {
    if (state.blinkTimer) clearTimeout(state.blinkTimer);
    const delay = 3200 + Math.random() * 3800;
    state.blinkTimer = setTimeout(() => {
      blinkOnce();
      scheduleBlink();
    }, delay);
  }

  function setSpeaking(on) {
    state.speaking = !!on;
    if (state.speakTimer) {
      clearInterval(state.speakTimer);
      state.speakTimer = null;
    }
    if (on) {
      state.speakFlip = true;
      syncPortraitFrame();
      state.speakTimer = setInterval(() => {
        state.speakFlip = !state.speakFlip;
        syncPortraitFrame();
      }, 140);
    } else {
      state.speakFlip = false;
      syncPortraitFrame();
    }
  }

  function initPortraitAnim() {
    state.blinkPhase = null;
    syncPortraitFrame();
    scheduleBlink();
  }

  /* ---------- BGM (replaceable tracks like VA-11) ---------- */
  function getTracks() {
    return (SITE.music?.tracks || []).filter((tr) => tr?.file);
  }

  function ensureBgmAudio() {
    if (state.bgmAudio) return state.bgmAudio;
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    state.bgmAudio = audio;
    return audio;
  }

  function stopAmbientSynth() {
    if (!state.ambientNodes) return;
    try {
      state.ambientNodes.pads?.forEach((p) => {
        p.osc?.stop();
        p.lfo?.stop();
      });
      state.ambientNodes.noise?.stop();
    } catch {
      /* already stopped */
    }
    state.ambientNodes = null;
  }

  function ensureAudio() {
    if (state.audioCtx) return state.audioCtx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    state.audioCtx = new Ctx();
    return state.audioCtx;
  }

  function startAmbientSynth() {
    if (!SITE.music?.fallbackSynth) return;
    const ctx = ensureAudio();
    if (!ctx || state.ambientNodes) return;

    const master = ctx.createGain();
    master.gain.value = state.muted ? 0 : (SITE.music?.volume ?? 0.45) * 0.12;
    master.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 110;
    g.gain.value = 0.5;
    osc.connect(g);
    g.connect(master);
    osc.start();

    state.ambientNodes = { master, pads: [{ osc, g }], noise: null };
  }

  function updateMusicBtn() {
    const btn = $("#musicBtn");
    if (!btn) return;
    const tracks = getTracks();
    if (!tracks.length || state.trackIndex < 0) {
      btn.textContent = `♪ ${t(SITE.ui.musicNone)}`;
      btn.classList.add("is-empty");
      btn.title = state.lang === "zh" ? "请添加 BGM 文件" : "Add BGM files";
      return;
    }
    btn.classList.remove("is-empty");
    const track = tracks[state.trackIndex];
    const title = t(track.title) || track.id;
    btn.textContent = `♪ ${title}`;
    btn.title = `${t(SITE.ui.musicNext)}: ${title}`;
  }

  async function loadTrack(index, autoplay = false) {
    const tracks = getTracks();
    if (!tracks.length) {
      state.trackIndex = -1;
      updateMusicBtn();
      if (SITE.music?.fallbackSynth && state.entered) startAmbientSynth();
      return false;
    }

    state.trackIndex = ((index % tracks.length) + tracks.length) % tracks.length;
    const track = tracks[state.trackIndex];
    const audio = ensureBgmAudio();
    audio.pause();
    audio.src = track.file;
    audio.volume = SITE.music?.volume ?? 0.45;
    audio.muted = state.muted;

    updateMusicBtn();

    return new Promise((resolve) => {
      const onReady = async () => {
        audio.removeEventListener("canplaythrough", onReady);
        audio.removeEventListener("error", onErr);
        stopAmbientSynth();
        if (autoplay && state.entered && !state.muted) {
          try {
            await audio.play();
          } catch {
            /* wait for user gesture */
          }
        }
        resolve(true);
      };
      const onErr = () => {
        audio.removeEventListener("canplaythrough", onReady);
        audio.removeEventListener("error", onErr);
        const next = state.trackIndex + 1;
        if (next < tracks.length && state.trackLoadAttempt < tracks.length) {
          state.trackLoadAttempt += 1;
          loadTrack(next, autoplay).then(resolve);
        } else {
          state.trackIndex = -1;
          updateMusicBtn();
          if (SITE.music?.fallbackSynth && state.entered) startAmbientSynth();
          resolve(false);
        }
      };
      audio.addEventListener("canplaythrough", onReady, { once: true });
      audio.addEventListener("error", onErr, { once: true });
      audio.load();
    });
  }

  async function nextTrack(autoplay = false) {
    const tracks = getTracks();
    if (!tracks.length) return;
    state.trackLoadAttempt = 0;
    const next = state.trackIndex < 0 ? 0 : (state.trackIndex + 1) % tracks.length;
    await loadTrack(next, autoplay);
    playUiBlip("click");
  }

  function playUiBlip(kind = "click") {
    if (state.muted) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    const now = ctx.currentTime;
    if (kind === "click") {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
      g.gain.setValueAtTime(0.03, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    } else {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      g.gain.setValueAtTime(0.025, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    }
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  function applyMute() {
    const btn = $("#muteBtn");
    if (btn) {
      btn.textContent = state.muted ? t(SITE.ui.muteOff) : t(SITE.ui.muteOn);
      btn.classList.toggle("is-muted", state.muted);
      btn.setAttribute("aria-pressed", String(state.muted));
    }

    if (state.bgmAudio) {
      state.bgmAudio.muted = state.muted;
      if (state.muted) {
        state.bgmAudio.pause();
      } else if (state.entered && state.bgmAudio.src) {
        state.bgmAudio.play().catch(() => {});
      }
    }

    if (state.ambientNodes?.master) {
      state.ambientNodes.master.gain.value = state.muted
        ? 0
        : (SITE.music?.volume ?? 0.45) * 0.12;
    }
  }

  async function startBgm() {
    state.trackLoadAttempt = 0;
    const start = SITE.music?.defaultIndex ?? 0;
    const ok = await loadTrack(start, true);
    if (!ok && SITE.music?.fallbackSynth) startAmbientSynth();
    applyMute();
  }

  async function enterBar() {
    if (state.entered) return;
    state.entered = true;
    const boot = $("#bootScreen");
    boot?.classList.add("is-gone");

    const ctx = ensureAudio();
    if (ctx?.state === "suspended") await ctx.resume();

    await startBgm();
    playUiBlip("enter");
    queueLines(SITE.narration.boot[state.lang] || SITE.narration.boot.zh);
  }

  /* ---------- Typewriter ---------- */
  function clearType() {
    if (state.typeTimer) {
      clearInterval(state.typeTimer);
      state.typeTimer = null;
    }
    state.typing = false;
    setSpeaking(false);
  }

  function setDialogue(text, showCursor = false) {
    const el = $("#dialogueText");
    if (!el) return;
    el.textContent = text;
    const cursor = $("#dialogueCursor");
    if (cursor) cursor.hidden = !showCursor;
  }

  function typeLine(text) {
    return new Promise((resolve) => {
      clearType();
      state.typing = true;
      setSpeaking(true);
      let i = 0;
      setDialogue("", true);
      state.typeTimer = setInterval(() => {
        i += 1;
        setDialogue(text.slice(0, i), true);
        if (i >= text.length) {
          clearType();
          setDialogue(text, false);
          resolve();
        }
      }, 28);
    });
  }

  async function drainQueue() {
    while (state.lineQueue.length) {
      const line = state.lineQueue.shift();
      await typeLine(line);
      setSpeaking(false);
      await wait(420);
    }
    setSpeaking(false);
    const hint = $("#dialogueHint");
    if (hint) {
      hint.textContent = state.activeDrink
        ? ""
        : t(SITE.ui.selectDrink);
    }
  }

  function queueLines(lines) {
    state.lineQueue = [...(lines || [])];
    drainQueue();
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  /* ---------- Render helpers ---------- */
  function isPageEditing() {
    return document.body.classList.contains("is-page-editing");
  }

  function editAttr(path) {
    if (!isPageEditing()) return "";
    return ` data-edit="${escapeAttr(path)}" contenteditable="plaintext-only" spellcheck="false"`;
  }

  function delBtn(path) {
    if (!isPageEditing()) return "";
    return `<button type="button" class="page-edit-del" data-edit-delete="${escapeAttr(path)}" title="删除" aria-label="删除">×</button>`;
  }

  function stampStaticEditables() {
    const map = [
      ["#heroName", "nameFull"],
      ["#heroIntent", "intent"],
      ["#heroTagline", "tagline"],
      ["#dialogueName", "name"],
    ];
    map.forEach(([sel, path]) => {
      const el = $(sel);
      if (!el) return;
      if (isPageEditing()) {
        el.setAttribute("data-edit", path);
        el.setAttribute("contenteditable", "plaintext-only");
        el.setAttribute("spellcheck", "false");
      } else {
        el.removeAttribute("data-edit");
        el.removeAttribute("contenteditable");
        el.removeAttribute("spellcheck");
      }
    });
  }

  function applyStaticLabels() {
    $("#brandText").textContent = t(SITE.ui.barName);
    $("#statusPill").textContent = t(SITE.ui.statusOpen);
    $("#langBtn").textContent = t(SITE.ui.langSwitch);
    $("#muteBtn").textContent = state.muted ? t(SITE.ui.muteOff) : t(SITE.ui.muteOn);
    updateMusicBtn();
    $("#heroName").textContent = t(SITE.nameFull);
    $("#heroIntent").textContent = t(SITE.intent);
    $("#heroTagline").textContent = t(SITE.tagline);
    $("#menuTitle").textContent = state.lang === "zh" ? "MENU · 点单" : "MENU · ORDER";
    $("#contentTitle").textContent = state.lang === "zh" ? "DISPLAY · 展示" : "DISPLAY";
    $("#dialogueName").textContent = t(SITE.name);
    $("#bootTitle").textContent = t(SITE.ui.barName);
    $("#bootSub").textContent =
      state.lang === "zh"
        ? "点击进入酒吧 · 氛围音将开启（可随时静音）"
        : "Enter the bar · Ambient audio on (mute anytime)";
    $("#bootEnter").textContent = state.lang === "zh" ? "推门进入" : "PUSH OPEN";
    stampStaticEditables();
    renderDrinks();
    if (state.activeDrink) renderContent(state.activeDrink);
    else {
      $("#contentBody").innerHTML = `<div class="panel-empty">${t(SITE.ui.selectDrink)}</div>`;
    }
  }

  function renderDrinks() {
    const grid = $("#drinkGrid");
    grid.innerHTML = SITE.drinks
      .map(
        (d) => `
      <button type="button" class="drink-btn${state.activeDrink === d.id ? " is-active" : ""}" data-drink="${d.id}">
        <span class="drink-label">${t(d.label)}</span>
        <span class="drink-sub">${t(d.sub)}</span>
      </button>`
      )
      .join("");
  }

  function renderAbout() {
    const lines = SITE.about[state.lang] || SITE.about.zh;
    return `
      <h3 class="section-h">${state.lang === "zh" ? "ABOUT" : "ABOUT"}</h3>
      <div class="about-lines">${lines
        .map(
          (p, i) => `
        <div class="about-line-wrap">
          ${delBtn(`about.${i}`)}
          <p${editAttr(`about.${i}`)}>${escapeHtml(p)}</p>
        </div>`
        )
        .join("")}</div>`;
  }

  function renderExperience() {
    return `
      <h3 class="section-h">${state.lang === "zh" ? "EXPERIENCE" : "EXPERIENCE"}</h3>
      ${SITE.experience
        .map((e, i) => {
          const bullets = e.bullets[state.lang] || e.bullets.zh;
          return `
          <article class="exp-card">
            ${delBtn(`experience.${i}`)}
            <div class="exp-top">
              <div class="exp-company"${editAttr(`experience.${i}.company`)}>${escapeHtml(t(e.company))}</div>
              <div class="exp-period"><span${editAttr(`experience.${i}.period`)}>${escapeHtml(e.period)}</span> · <span${editAttr(`experience.${i}.location`)}>${escapeHtml(t(e.location))}</span></div>
            </div>
            <div class="exp-role"${editAttr(`experience.${i}.role`)}>${escapeHtml(t(e.role))}</div>
            <ul>${bullets
              .map(
                (b, bi) => `
              <li class="exp-bullet-wrap">
                ${delBtn(`experience.${i}.bullets.${bi}`)}
                <span${editAttr(`experience.${i}.bullets.${bi}`)}>${escapeHtml(b)}</span>
              </li>`
              )
              .join("")}</ul>
          </article>`;
        })
        .join("")}`;
  }

  function renderSkills() {
    const tags = SITE.skills[state.lang] || SITE.skills.zh;
    return `
      <h3 class="section-h">${state.lang === "zh" ? "SKILLS" : "SKILLS"}</h3>
      <div class="skill-cloud">
        ${tags
          .map(
            (s, i) => `
          <span class="skill-tag-wrap">
            ${delBtn(`skills.${i}`)}
            <span class="skill-tag"${editAttr(`skills.${i}`)}>${escapeHtml(s)}</span>
          </span>`
          )
          .join("")}
      </div>`;
  }

  function renderEducation() {
    const e = SITE.education;
    return `
      <h3 class="section-h">${state.lang === "zh" ? "EDUCATION" : "EDUCATION"}</h3>
      <div class="edu-block">
        <div class="edu-school"${editAttr("education.school")}>${escapeHtml(t(e.school))}</div>
        <div class="edu-meta"${editAttr("education.degree")}>${escapeHtml(t(e.degree))}</div>
        <div class="edu-meta"><span${editAttr("education.period")}>${escapeHtml(e.period)}</span> · <span${editAttr("education.location")}>${escapeHtml(t(e.location))}</span></div>
        <div class="edu-meta"${editAttr("education.gpa")}>${escapeHtml(e.gpa)}</div>
      </div>`;
  }

  function renderContact() {
    const c = SITE.contact;
    return `
      <h3 class="section-h">${state.lang === "zh" ? "CONTACT" : "CONTACT"}</h3>
      <div class="contact-list">
        <div class="contact-row">
          <span class="contact-label">Email</span>
          <span${editAttr("contact.email")}>${escapeHtml(c.email)}</span>
        </div>
        <div class="contact-row">
          <span class="contact-label">${state.lang === "zh" ? "手机" : "Phone"}</span>
          <span${editAttr("contact.phone")}>${escapeHtml(c.phone)}</span>
        </div>
        <div class="contact-row">
          <span class="contact-label">${state.lang === "zh" ? "微信" : "WeChat"}</span>
          <span${editAttr("contact.wechat")}>${escapeHtml(c.wechat)}</span>
        </div>
        <div class="contact-row">
          <span class="contact-label">${state.lang === "zh" ? "小红书" : "Xiaohongshu"}</span>
          <span${editAttr("contact.xhsName")}>${escapeHtml(t(c.xhsName))}</span>
        </div>
        ${
          isPageEditing()
            ? `<div class="contact-row"><span class="contact-label">小红书链接</span><span${editAttr("contact.xhs")}>${escapeHtml(c.xhs)}</span></div>
               <div class="contact-row"><span class="contact-label">简历路径</span><span${editAttr("resumePath")}>${escapeHtml(SITE.resumePath)}</span></div>`
            : ""
        }
      </div>
      <div class="cta-row">
        <a class="btn-primary" href="${SITE.resumePath}" download>${t(SITE.ui.downloadCv)}</a>
        <button type="button" class="btn-secondary" id="copyWechatBtn">${t(SITE.ui.addWechat)}</button>
      </div>`;
  }

  function workCard(item, index) {
    const editing = isPageEditing();
    const tab = state.portfolioTab;
    const hasLink = Boolean(item.link) && !editing;
    const hasCover = Boolean(item.cover);
    const tag = hasLink ? "a" : "div";
    const href = hasLink
      ? ` href="${escapeAttr(item.link)}" target="_blank" rel="noopener noreferrer"`
      : "";
    const extraClass = editing ? " is-page-edit-card" : hasLink ? "" : " is-disabled";
    const cover = hasCover
      ? `<img src="${escapeAttr(item.cover)}" alt="" />`
      : `<div class="work-cover-label">${t(SITE.ui.placeholder)}</div>`;
    const ctaLabel = tab === "cases" ? SITE.ui.viewCase : SITE.ui.viewWork;
    const cta = item.link && !editing ? t(ctaLabel) : t(SITE.ui.comingSoon);
    const tags = (item.tags || [])
      .map((x) => `<span>${escapeHtml(x)}</span>`)
      .join("");
    const pathBase = `portfolio.${tab}.${index}`;

    return `
      <${tag} class="work-card${extraClass}"${href}>
        ${delBtn(pathBase)}
        <div class="work-cover">${cover}</div>
        <div class="work-body">
          <h4 class="work-title"${editAttr(`${pathBase}.title`)}>${escapeHtml(t(item.title))}</h4>
          <p class="work-summary"${editAttr(`${pathBase}.summary`)}>${escapeHtml(t(item.summary))}</p>
          <div class="work-tags">${tags}</div>
          ${
            editing
              ? `<p class="page-edit-meta">封面 <span${editAttr(`${pathBase}.cover`)}>${escapeHtml(item.cover || "")}</span></p>
                 <p class="page-edit-meta">链接 <span${editAttr(`${pathBase}.link`)}>${escapeHtml(item.link || "")}</span></p>`
              : ""
          }
        </div>
        <div class="work-cta">${escapeHtml(cta)}</div>
      </${tag}>`;
  }

  function renderWork() {
    const tabs = SITE.portfolioTabs
      .map(
        (tab) => `
      <button type="button" class="tab-btn${state.portfolioTab === tab.id ? " is-active" : ""}" data-ptab="${tab.id}">
        ${t(tab.label)}
      </button>`
      )
      .join("");

    const items = SITE.portfolio[state.portfolioTab] || [];
    return `
      <h3 class="section-h">${state.lang === "zh" ? "WORK" : "WORK"}</h3>
      <div class="tab-row">${tabs}</div>
      <div class="card-grid">${items.map((item, i) => workCard(item, i)).join("")}</div>`;
  }

  function renderContent(id) {
    const map = {
      about: renderAbout,
      experience: renderExperience,
      skills: renderSkills,
      work: renderWork,
      education: renderEducation,
      contact: renderContact,
    };
    const html = map[id] ? map[id]() : `<div class="panel-empty">${t(SITE.ui.selectDrink)}</div>`;
    $("#contentBody").innerHTML = html;

    if (id === "contact") {
      $("#copyWechatBtn")?.addEventListener("click", async () => {
        playUiBlip("click");
        try {
          await navigator.clipboard.writeText(SITE.contact.wechat);
          $("#copyWechatBtn").textContent =
            state.lang === "zh" ? "已复制微信号" : "WeChat copied";
        } catch {
          alert(`WeChat: ${SITE.contact.wechat}`);
        }
      });
    }

    if (id === "work") {
      $$("[data-ptab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          playUiBlip("click");
          state.portfolioTab = btn.dataset.ptab;
          renderContent("work");
        });
      });
    }
  }

  function selectDrink(id) {
    state.activeDrink = id;
    renderDrinks();
    renderContent(id);
    const lines =
      SITE.narration.drinks[id]?.[state.lang] ||
      SITE.narration.drinks[id]?.zh ||
      [];
    queueLines(lines);
    playUiBlip("click");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  /* ---------- Events ---------- */
  function bind() {
    $("#bootEnter")?.addEventListener("click", enterBar);
    $("#langBtn")?.addEventListener("click", () => {
      playUiBlip("click");
      state.lang = state.lang === "zh" ? "en" : "zh";
      document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
      applyStaticLabels();
      if (state.entered && !state.activeDrink) {
        queueLines(SITE.narration.boot[state.lang] || SITE.narration.boot.zh);
      } else if (state.activeDrink) {
        const lines =
          SITE.narration.drinks[state.activeDrink]?.[state.lang] ||
          SITE.narration.drinks[state.activeDrink]?.zh ||
          [];
        queueLines(lines);
      }
    });

    $("#muteBtn")?.addEventListener("click", () => {
      state.muted = !state.muted;
      applyMute();
      if (!state.muted) playUiBlip("click");
    });

    $("#musicBtn")?.addEventListener("click", async () => {
      if (!state.entered) await enterBar();
      await nextTrack(true);
    });

    $("#drinkGrid")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-drink]");
      if (!btn) return;
      if (!state.entered) enterBar();
      selectDrink(btn.dataset.drink);
    });

    $("#dialogue")?.addEventListener("click", () => {
      if (!state.entered) {
        enterBar();
        return;
      }
      if (state.typing) {
        clearType();
        setDialogue($("#dialogueText").textContent, false);
      }
    });
  }

  function applyLayout() {
    const L = SITE.layout || {};
    const root = document.documentElement;
    root.style.setProperty("--char-x", String(L.charOffsetX ?? 0));
    root.style.setProperty("--char-y", String(L.charOffsetY ?? 0));
    root.style.setProperty("--char-scale", String(L.charScale ?? 1));
    root.style.setProperty("--hero-y", String(L.heroOffsetY ?? 0));
    root.style.setProperty("--dialogue-y", String(L.dialogueOffsetY ?? 0));
    root.style.setProperty("--scene-min-h", String(L.sceneMinHeight ?? 420));
  }

  function init() {
    document.documentElement.lang = "zh-CN";
    state.trackIndex = SITE.music?.defaultIndex ?? 0;
    applyLayout();
    initPortraitAnim();
    bind();
    applyStaticLabels();
    applyMute();
    updateMusicBtn();
    window.LordeApp = {
      refresh: applyStaticLabels,
      applyLayout,
      blinkOnce,
      setSpeaking,
      getLang: () => state.lang,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
