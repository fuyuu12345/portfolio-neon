(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const lines = [
    "外面收工了，这里才刚热场。",
    "Growth Highball。桌上是案例和 Demo，点开就能看。",
    "点一杯特调，或者直接从底下四个按钮进作品。",
  ];

  /** 与正式 preview 今日特调一致（故事酒，不是导航酒） */
  const drinks = [
    {
      id: "bitter",
      name: "静默苦味",
      blurb: "雨夜进店。先认识酒保。",
      price: "$12",
      line: "雨敲在霓虹上。吧台那头的人抬眼：「先进来坐。」",
    },
    {
      id: "mosaic",
      name: "数据马赛克",
      blurb: "香港与上海的碎片。",
      price: "$14",
      line: "两座城的碎片拼在杯里——岭南的夜，和上海的投放屏。",
    },
    {
      id: "collins",
      name: "故障柯林斯",
      blurb: "赛博蜉蝣是怎么养的。",
      price: "$11",
      line: "赛博蜉蝣不是人设，是养出来的：短、密、真，像一杯特调。",
    },
    {
      id: "sunset",
      name: "像素落日",
      blurb: "找故事，还是找履历？",
      price: "$13",
      line: "想听故事就点特调；想看履历，底下「经历 / 作品 / 联系」也在。",
    },
  ];

  const features = [
    {
      title: "家灯",
      sum: "其ta · 小程序 Demo",
      cover: "../../assets/cases/family-light-cover.png",
      href: "../../products/family-light-social/miniprogram/preview.html",
    },
    {
      title: "Oura Ring 营销案",
      sum: "整合营销 · 策划案",
      cover: "../../assets/cases/oura-ring-kv-v1.png",
      href: "../../cases/oura-ring/index.html",
    },
    {
      title: "女性主义文创问卷",
      sum: "其ta · 静态 Demo",
      cover: "../../assets/cases/feminist-survey-cover.png",
      href: "../../products/feminist-survey/index.html",
    },
  ];

  const workTabs = [
    {
      id: "cases",
      label: "营销案",
      items: [
        {
          title: "Oura Ring",
          sum: "整合营销概念案",
          href: "../../cases/oura-ring/index.html",
        },
        { title: "营销案 02", sum: "占位", href: "" },
      ],
    },
    {
      id: "other",
      label: "其ta",
      items: [
        {
          title: "家灯",
          sum: "小程序 Demo",
          href: "../../products/family-light-social/miniprogram/preview.html",
        },
        {
          title: "女性主义文创问卷",
          sum: "静态 Demo",
          href: "../../products/feminist-survey/index.html",
        },
      ],
    },
  ];

  const state = {
    line: 0,
    feat: 0,
    muted: false,
    workTab: "cases",
    awaitingChoice: false,
  };

  function enter() {
    $("#boot").hidden = true;
    $("#app").hidden = false;
    renderLine();
    renderDrinks();
    renderFeature();
  }

  function renderLine() {
    const text = lines[Math.min(state.line, lines.length - 1)];
    $("#dialogueText").textContent = text;
    const cue = $(".talk__cue");
    const atEnd = state.line >= lines.length - 1;
    cue.classList.toggle("is-off", atEnd);
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
    box.innerHTML = list
      .map(
        (c, i) =>
          `<button type="button" class="choice" data-choice="${i}">${c.label}</button>`
      )
      .join("");
    box._list = list;
  }

  function hideChoices() {
    state.awaitingChoice = false;
    $("#choices").hidden = true;
    $("#choices").innerHTML = "";
  }

  function advanceDialogue() {
    if (state.awaitingChoice) return;
    if (state.line < lines.length - 1) {
      state.line += 1;
      renderLine();
    }
  }

  function renderDrinks() {
    $("#drinks").innerHTML = drinks
      .map(
        (d) =>
          `<button type="button" class="drink" data-drink="${d.id}">
            <strong>${d.name}</strong>
            <span>${d.blurb}</span>
            <em class="drink__price">${d.price}</em>
          </button>`
      )
      .join("");
  }

  function renderFeature() {
    const f = features[state.feat];
    $("#featTitle").textContent = f.title;
    $("#featSum").textContent = f.sum;
    const cover = $("#featCover");
    cover.style.backgroundImage = f.cover ? `url("${f.cover}")` : "";
    $("#featDots").innerHTML = features
      .map((_, i) => `<i class="${i === state.feat ? "is-on" : ""}"></i>`)
      .join("");
  }

  function openSheet(kind) {
    const sheet = $("#sheet");
    const title = $("#sheetTitle");
    const tabs = $("#sheetTabs");
    const body = $("#sheetBody");
    sheet.hidden = false;
    document.body.style.overflow = "hidden";

    $$(".dock__btn").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.nav === kind || (kind === "work" && b.dataset.nav === "work"));
    });

    if (kind === "work") {
      title.textContent = "作品";
      tabs.hidden = false;
      renderWorkTabs();
      renderWorkBody();
      return;
    }

    tabs.hidden = true;
    if (kind === "exp") {
      title.textContent = "经历";
      body.innerHTML = `
        <div class="card">
          <h3>ROI Sour</h3>
          <p>投放、复盘、跨端策略——正式站经历弹窗的手机抽屉版示意。</p>
        </div>
        <div class="card">
          <h3>路径</h3>
          <p>把增长目标拆成可执行路径。此页只演示交互，文案可再接 content.js。</p>
        </div>`;
      return;
    }

    if (kind === "contact") {
      title.textContent = "联系";
      body.innerHTML = `
        <div class="cta-row">
          <a class="cta cta--fill" href="../../assets/resume.pdf" download>下载简历</a>
          <button type="button" class="cta cta--ghost" id="copyWx">复制微信 UandME_blackandblue</button>
        </div>
        <div class="card" style="margin-top:12px">
          <h3>邮箱</h3>
          <p>lorde200071@163.com</p>
        </div>`;
      $("#copyWx")?.addEventListener("click", async () => {
        const btn = $("#copyWx");
        try {
          await navigator.clipboard.writeText("UandME_blackandblue");
          btn.textContent = "已复制";
        } catch {
          btn.textContent = "复制失败，请手动加";
        }
      });
      return;
    }

    closeSheet();
  }

  function renderWorkTabs() {
    const tabs = $("#sheetTabs");
    tabs.innerHTML = workTabs
      .map(
        (t) =>
          `<button type="button" class="sheet__tab${state.workTab === t.id ? " is-on" : ""}" data-wtab="${t.id}">${t.label}</button>`
      )
      .join("");
  }

  function renderWorkBody() {
    const tab = workTabs.find((t) => t.id === state.workTab) || workTabs[0];
    $("#sheetBody").innerHTML = tab.items
      .map((item) => {
        const link = item.href
          ? `<a href="${item.href}" target="_blank" rel="noopener">查看 →</a>`
          : `<span style="color:var(--mute)">制作中</span>`;
        return `<div class="card"><h3>${item.title}</h3><p>${item.sum}</p>${link}</div>`;
      })
      .join("");
  }

  function closeSheet() {
    $("#sheet").hidden = true;
    document.body.style.overflow = "";
    $$(".dock__btn").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.nav === "talk");
    });
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
      const list = $("#choices")._list || [];
      const item = list[Number(btn.dataset.choice)];
      if (!item) return;
      hideChoices();
      if (item.action === "work") openSheet("work");
      else if (item.action === "contact") openSheet("contact");
      else if (item.action === "scroll-drinks") {
        $("#panelDrinks").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    $("#drinks").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-drink]");
      if (!btn) return;
      const drink = drinks.find((d) => d.id === btn.dataset.drink);
      if (!drink) return;
      hideChoices();
      $("#dialogueText").textContent = drink.line;
      $(".talk__cue").classList.add("is-off");
      showChoices([
        { label: "再点一杯", action: "scroll-drinks" },
        { label: "看看作品", action: "work" },
        { label: "如何联系", action: "contact" },
      ]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    $$(".dock__btn").forEach((b) => {
      b.addEventListener("click", () => setDock(b.dataset.nav));
    });

    $("#featPrev").addEventListener("click", () => {
      state.feat = (state.feat - 1 + features.length) % features.length;
      renderFeature();
    });
    $("#featNext").addEventListener("click", () => {
      state.feat = (state.feat + 1) % features.length;
      renderFeature();
    });
    $("#featOpen").addEventListener("click", () => {
      const f = features[state.feat];
      if (f.href) window.open(f.href, "_blank", "noopener");
    });

    $("#sheetClose").addEventListener("click", closeSheet);
    $("#sheetScrim").addEventListener("click", closeSheet);
    $("#sheetTabs").addEventListener("click", (e) => {
      const t = e.target.closest("[data-wtab]");
      if (!t) return;
      state.workTab = t.dataset.wtab;
      renderWorkTabs();
      renderWorkBody();
    });

    $("#btnMute").addEventListener("click", () => {
      state.muted = !state.muted;
      $("#btnMute").setAttribute("aria-pressed", String(state.muted));
      $("#btnMute").textContent = state.muted ? "SOUND" : "MUTE";
    });

    $("#btnLang").addEventListener("click", () => {
      $("#dialogueText").textContent =
        state.line === 0
          ? "Outside is closed. In here, the night is just warming up."
          : "Demo only — language toggle stub.";
    });
  }

  bind();
})();
