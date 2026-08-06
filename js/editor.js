/**
 * 私人编辑台
 * 打开方式：Ctrl+Shift+E（或地址栏加 ?edit=1）→ 输入密码
 * 密码在 js/content.js 的 editorPassword
 */
(() => {
  const DRAFT_KEY = "lorde-hall-a-draft";

  const deepMerge = (target, source) => {
    if (!source || typeof source !== "object") return target;
    Object.keys(source).forEach((key) => {
      const val = source[key];
      if (Array.isArray(val)) {
        target[key] = val.map((item) =>
          item && typeof item === "object" && !Array.isArray(item)
            ? { ...item }
            : item
        );
      } else if (val && typeof val === "object") {
        if (!target[key] || typeof target[key] !== "object") target[key] = {};
        deepMerge(target[key], val);
      } else {
        target[key] = val;
      }
    });
    return target;
  };

  function loadDraftIntoSite() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw || !window.SITE) return;
      const draft = JSON.parse(raw);
      const currentDraftVersion = window.SITE.draftVersion || "";
      const draftVersion = draft?.draftVersion || "";
      if (currentDraftVersion && draftVersion !== currentDraftVersion) return;
      const filePassword = window.SITE.editorPassword;
      deepMerge(window.SITE, draft);
      // 密码始终以 content.js 为准，避免本机草稿锁死旧密码
      if (filePassword) window.SITE.editorPassword = filePassword;
    } catch {
      /* ignore */
    }
  }

  function getDraftPayload() {
    const s = window.SITE;
    return {
      draftVersion: s.draftVersion,
      name: s.name,
      nameFull: s.nameFull,
      intent: s.intent,
      tagline: s.tagline,
      contact: s.contact,
      resumePath: s.resumePath,
      layout: s.layout,
      music: s.music,
      about: s.about,
      portfolio: s.portfolio,
      editorPassword: s.editorPassword,
    };
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(getDraftPayload()));
  }

  function applyLayout() {
    const L = window.SITE.layout || {};
    const root = document.documentElement;
    root.style.setProperty("--char-x", String(L.charOffsetX ?? 0));
    root.style.setProperty("--char-y", String(L.charOffsetY ?? 0));
    root.style.setProperty("--char-scale", String(L.charScale ?? 1));
    root.style.setProperty("--hero-y", String(L.heroOffsetY ?? 0));
    root.style.setProperty("--dialogue-y", String(L.dialogueOffsetY ?? 0));
    root.style.setProperty("--scene-min-h", String(L.sceneMinHeight ?? 420));
  }

  function refreshApp() {
    applyLayout();
    window.LordeApp?.refresh?.();
  }

  function toast(msg) {
    const el = document.getElementById("editorToast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-show");
    setTimeout(() => el.classList.remove("is-show"), 1800);
  }

  function isAuthed() {
    return false;
  }

  function setAuthed() {}

  function ensureDom() {
    if (document.getElementById("editorRoot")) return;

    const root = document.createElement("div");
    root.id = "editorRoot";
    root.className = "editor-root";
    root.hidden = true;
    root.innerHTML = `
      <div class="editor-gate" id="editorGate" hidden>
        <div class="editor-gate-card">
          <h2>页面编辑模式</h2>
          <p>输密码后直接在网页上点文字改。密码在 js/content.js → editorPassword</p>
          <div class="editor-gate-err" id="editorGateErr"></div>
          <input type="password" id="editorPassInput" placeholder="输入密码" autocomplete="off" />
          <div class="row">
            <button type="button" id="editorGateCancel">取消</button>
            <button type="button" class="primary" id="editorGateOk">进入编辑</button>
          </div>
        </div>
      </div>
      <div class="page-edit-bar" id="pageEditBar" hidden>
        <div class="page-edit-bar-main">
          <span class="page-edit-badge">编辑中</span>
          <span class="page-edit-hint">点页面文字直接改 · 改的是当前语言</span>
        </div>
        <div class="page-edit-bar-actions">
          <button type="button" class="primary" id="pageEditSave">保存</button>
          <button type="button" id="pageEditExport">导出草稿</button>
          <button type="button" id="pageEditDesk">高级面板</button>
          <button type="button" id="pageEditExit">退出</button>
        </div>
        <div class="editor-toast" id="editorToast"></div>
      </div>
      <aside class="editor-desk" id="editorDesk" hidden>
        <div class="editor-desk-head">
          <h2>高级面板 · 布局/作品路径</h2>
          <div class="actions">
            <button type="button" id="editorMinimize">收起</button>
            <button type="button" id="editorLogout">退出编辑</button>
          </div>
        </div>
        <div class="editor-tabs" id="editorTabs">
          <button type="button" data-etab="text" class="is-active">文字</button>
          <button type="button" data-etab="layout">位置</button>
          <button type="button" data-etab="cases">营销案</button>
          <button type="button" data-etab="content">内容视频</button>
          <button type="button" data-etab="photos">摄影</button>
          <button type="button" data-etab="other">其他作品</button>
        </div>
        <div class="editor-body">
          <div class="editor-section is-active" data-esection="text"></div>
          <div class="editor-section" data-esection="layout"></div>
          <div class="editor-section" data-esection="cases"></div>
          <div class="editor-section" data-esection="content"></div>
          <div class="editor-section" data-esection="photos"></div>
          <div class="editor-section" data-esection="other"></div>
        </div>
        <div class="editor-foot">
          <button type="button" class="primary" id="editorApply">应用预览</button>
          <button type="button" id="editorExport">导出 content 草稿</button>
          <button type="button" id="editorClearDraft">清除本机草稿</button>
        </div>
      </aside>
    `;
    document.body.appendChild(root);
    bindEditorUi();
    bindPageEditDelegation();
  }

  function field(label, value, onInput, hint = "", multiline = false) {
    const id = `ef_${Math.random().toString(36).slice(2, 9)}`;
    const control = multiline
      ? `<textarea id="${id}">${escapeHtml(value ?? "")}</textarea>`
      : `<input id="${id}" type="text" value="${escapeAttr(value ?? "")}" />`;
    return `
      <div class="editor-field">
        <label for="${id}">${escapeHtml(label)}</label>
        ${control}
        ${hint ? `<div class="hint">${escapeHtml(hint)}</div>` : ""}
      </div>`;
  }

  function rangeField(label, key, min, max, step) {
    const L = window.SITE.layout;
    const val = L[key] ?? 0;
    return `
      <div class="editor-field">
        <label>${escapeHtml(label)}</label>
        <div class="editor-range">
          <input type="range" data-layout="${key}" min="${min}" max="${max}" step="${step}" value="${val}" />
          <span class="val" data-layout-val="${key}">${val}</span>
        </div>
      </div>`;
  }

  function renderPortfolioEditor(sectionKey) {
    const items = window.SITE.portfolio[sectionKey] || [];
    return items
      .map(
        (item, i) => `
      <div class="editor-card" data-psec="${sectionKey}" data-pi="${i}">
        <h4>#${i + 1} ${escapeHtml(item.title?.zh || "未命名")}</h4>
        ${field("封面路径 cover", item.cover || "", null, "例：assets/cases/demo.jpg")}
        ${field("跳转链接 link", item.link || "", null, "策划案网页 URL；空=制作中")}
        ${field("标题中文", item.title?.zh || "")}
        ${field("标题英文", item.title?.en || "")}
        ${field("摘要中文", item.summary?.zh || "", null, "", true)}
        ${field("摘要英文", item.summary?.en || "", null, "", true)}
        ${field("标签（逗号分隔）", (item.tags || []).join(", "))}
      </div>`
      )
      .join("");
  }

  function renderSections() {
    const s = window.SITE;
    const textSec = document.querySelector('[data-esection="text"]');
    const layoutSec = document.querySelector('[data-esection="layout"]');
    const casesSec = document.querySelector('[data-esection="cases"]');
    const contentSec = document.querySelector('[data-esection="content"]');
    const photosSec = document.querySelector('[data-esection="photos"]');

    textSec.innerHTML = `
      ${field("名字中文", s.name.zh)}
      ${field("名字英文", s.name.en)}
      ${field("并列展示中文", s.nameFull.zh)}
      ${field("并列展示英文", s.nameFull.en)}
      ${field("求职意向中文", s.intent.zh)}
      ${field("求职意向英文", s.intent.en)}
      ${field("介绍语中文", s.tagline.zh, null, "", true)}
      ${field("介绍语英文", s.tagline.en, null, "", true)}
      ${field("关于我中文（每行一句）", (s.about.zh || []).join("\n"), null, "", true)}
      ${field("关于我英文（每行一句）", (s.about.en || []).join("\n"), null, "", true)}
      ${field("邮箱", s.contact.email)}
      ${field("手机", s.contact.phone)}
      ${field("微信", s.contact.wechat)}
      ${field("小红书链接", s.contact.xhs)}
      ${field("简历路径", s.resumePath)}
      ${field("编辑台密码", s.editorPassword, null, "改完请导出并写回 content.js")}
    `;

    layoutSec.innerHTML = `
      <p class="hint" style="margin-bottom:12px;color:#9b87b5;font-size:12px;">拖动滑条实时移动页面元素（仅你这边预览）。</p>
      ${rangeField("立绘左右", "charOffsetX", -80, 80, 1)}
      ${rangeField("立绘上下", "charOffsetY", -80, 80, 1)}
      ${rangeField("立绘缩放", "charScale", 0.85, 1.4, 0.05)}
      ${rangeField("名字区上下", "heroOffsetY", -60, 60, 1)}
      ${rangeField("对话框上下", "dialogueOffsetY", -40, 80, 1)}
      ${rangeField("左侧场景高度", "sceneMinHeight", 320, 720, 10)}
    `;

    casesSec.innerHTML = renderPortfolioEditor("cases");
    contentSec.innerHTML = renderPortfolioEditor("content");
    photosSec.innerHTML = renderPortfolioEditor("photos");

    wireTextFields(textSec);
    wireLayout(layoutSec);
    wirePortfolio(casesSec, "cases");
    wirePortfolio(contentSec, "content");
    wirePortfolio(photosSec, "photos");
  }

  function wireTextFields(root) {
    const inputs = [...root.querySelectorAll("input, textarea")];
    const map = [
      ["name", "zh"],
      ["name", "en"],
      ["nameFull", "zh"],
      ["nameFull", "en"],
      ["intent", "zh"],
      ["intent", "en"],
      ["tagline", "zh"],
      ["tagline", "en"],
      ["about", "zh"],
      ["about", "en"],
      ["contact", "email"],
      ["contact", "phone"],
      ["contact", "wechat"],
      ["contact", "xhs"],
      ["resumePath"],
      ["editorPassword"],
    ];

    inputs.forEach((el, idx) => {
      const apply = () => {
        const spec = map[idx];
        if (!spec) return;
        const s = window.SITE;
        if (spec[0] === "about") {
          s.about[spec[1]] = el.value
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean);
        } else if (spec.length === 1) {
          s[spec[0]] = el.value;
        } else if (spec[0] === "contact") {
          s.contact[spec[1]] = el.value;
        } else {
          s[spec[0]][spec[1]] = el.value;
        }
        saveDraft();
        refreshApp();
      };
      el.addEventListener("input", apply);
      el.addEventListener("change", apply);
    });
  }

  function wireLayout(root) {
    root.querySelectorAll("[data-layout]").forEach((input) => {
      const key = input.dataset.layout;
      const apply = () => {
        let v = Number(input.value);
        if (key === "charScale") v = Math.round(v * 100) / 100;
        window.SITE.layout[key] = v;
        const label = root.querySelector(`[data-layout-val="${key}"]`);
        if (label) label.textContent = String(v);
        saveDraft();
        refreshApp();
      };
      input.addEventListener("input", apply);
      input.addEventListener("change", apply);
    });
  }

  function wirePortfolio(root, sectionKey) {
    root.querySelectorAll(".editor-card").forEach((card) => {
      const i = Number(card.dataset.pi);
      const fields = [...card.querySelectorAll("input, textarea")];
      const keys = ["cover", "link", "title.zh", "title.en", "summary.zh", "summary.en", "tags"];
      fields.forEach((el, fi) => {
        const apply = () => {
          const item = window.SITE.portfolio[sectionKey][i];
          const key = keys[fi];
          if (key === "cover" || key === "link") item[key] = el.value.trim();
          else if (key === "tags") {
            item.tags = el.value
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean);
          } else if (key.startsWith("title.")) {
            item.title[key.split(".")[1]] = el.value;
          } else if (key.startsWith("summary.")) {
            item.summary[key.split(".")[1]] = el.value;
          }
          saveDraft();
          refreshApp();
        };
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      });
    });
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

  function currentLang() {
    return window.LordeApp?.getLang?.() || "zh";
  }

  function writeEditPath(path, value) {
    const s = window.SITE;
    const lang = currentLang();
    const parts = String(path).split(".");
    const text = String(value ?? "").replace(/\u00a0/g, " ").trimEnd();

    if (parts[0] === "resumePath") {
      s.resumePath = text.trim();
      return;
    }
    if (parts[0] === "about") {
      const i = Number(parts[1]);
      if (!Array.isArray(s.about[lang])) s.about[lang] = [];
      s.about[lang][i] = text.trim();
      return;
    }
    if (parts[0] === "skills") {
      const i = Number(parts[1]);
      if (!Array.isArray(s.skills[lang])) s.skills[lang] = [];
      s.skills[lang][i] = text.trim();
      return;
    }
    if (["name", "nameFull", "intent", "tagline"].includes(parts[0])) {
      s[parts[0]][lang] = text.trim();
      return;
    }
    if (parts[0] === "contact") {
      if (parts[1] === "xhsName") s.contact.xhsName[lang] = text.trim();
      else s.contact[parts[1]] = text.trim();
      return;
    }
    if (parts[0] === "education") {
      const key = parts[1];
      if (key === "school" || key === "degree" || key === "location") {
        if (!s.education[key] || typeof s.education[key] !== "object") s.education[key] = { zh: "", en: "" };
        s.education[key][lang] = text.trim();
      } else {
        s.education[key] = text.trim();
      }
      return;
    }
    if (parts[0] === "experience") {
      const exp = s.experience[Number(parts[1])];
      if (!exp) return;
      if (parts[2] === "bullets") {
        const bi = Number(parts[3]);
        if (!exp.bullets[lang]) exp.bullets[lang] = [];
        exp.bullets[lang][bi] = text.trim();
      } else if (parts[2] === "period") {
        exp.period = text.trim();
      } else if (parts[2] === "company" || parts[2] === "role" || parts[2] === "location") {
        if (!exp[parts[2]] || typeof exp[parts[2]] !== "object") exp[parts[2]] = { zh: "", en: "" };
        exp[parts[2]][lang] = text.trim();
      }
      return;
    }
    if (parts[0] === "portfolio") {
      const item = s.portfolio[parts[1]]?.[Number(parts[2])];
      if (!item) return;
      if (parts[3] === "title" || parts[3] === "summary") {
        if (!item[parts[3]]) item[parts[3]] = { zh: "", en: "" };
        item[parts[3]][lang] = text.trim();
      } else if (parts[3] === "cover" || parts[3] === "link") {
        item[parts[3]] = text.trim();
      }
    }
  }

  function deleteEditPath(path) {
    const s = window.SITE;
    const lang = currentLang();
    const parts = String(path).split(".");

    if (parts[0] === "about") {
      const i = Number(parts[1]);
      (s.about[lang] || []).splice(i, 1);
      return true;
    }
    if (parts[0] === "skills") {
      (s.skills[lang] || []).splice(Number(parts[1]), 1);
      return true;
    }
    if (parts[0] === "experience") {
      const ei = Number(parts[1]);
      if (parts[2] === "bullets") {
        const exp = s.experience[ei];
        if (!exp) return false;
        const bi = Number(parts[3]);
        (exp.bullets.zh || []).splice(bi, 1);
        (exp.bullets.en || []).splice(bi, 1);
        return true;
      }
      s.experience.splice(ei, 1);
      return true;
    }
    if (parts[0] === "portfolio") {
      const list = s.portfolio[parts[1]];
      if (!list) return false;
      list.splice(Number(parts[2]), 1);
      return true;
    }
    return false;
  }

  function commitEditable(el) {
    const path = el.getAttribute("data-edit");
    if (!path) return;
    writeEditPath(path, el.textContent || "");
    saveDraft();
  }

  function bindPageEditDelegation() {
    if (bindPageEditDelegation._done) return;
    bindPageEditDelegation._done = true;

    document.addEventListener(
      "blur",
      (e) => {
        const el = e.target.closest?.("[data-edit]");
        if (!el || !document.body.classList.contains("is-page-editing")) return;
        commitEditable(el);
      },
      true
    );

    document.addEventListener("keydown", (e) => {
      if (!document.body.classList.contains("is-page-editing")) return;
      const el = e.target.closest?.("[data-edit]");
      if (!el) return;
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        el.blur();
      }
    });

    document.addEventListener("click", (e) => {
      if (!document.body.classList.contains("is-page-editing")) return;

      const del = e.target.closest?.("[data-edit-delete]");
      if (del) {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("确定删除这项？")) return;
        if (deleteEditPath(del.getAttribute("data-edit-delete"))) {
          saveDraft();
          refreshApp();
          toast("已删除并写入本机草稿");
        }
        return;
      }

      // 编辑模式下阻止作品卡跳转
      if (e.target.closest?.(".work-card[href], a.work-card")) {
        e.preventDefault();
      }
    });
  }

  function enterPageEditMode() {
    ensureDom();
    const root = document.getElementById("editorRoot");
    const gate = document.getElementById("editorGate");
    const desk = document.getElementById("editorDesk");
    const bar = document.getElementById("pageEditBar");
    root.hidden = false;
    if (gate) {
      gate.hidden = true;
      gate.setAttribute("aria-hidden", "true");
    }
    if (desk) desk.hidden = true;
    if (bar) bar.hidden = false;
    document.body.classList.add("is-page-editing");
    document.body.classList.remove("editor-open");
    document.getElementById("bootScreen")?.classList.add("is-gone");
    refreshApp();
    toast("已进入页面编辑 · 点文字即可改");
  }

  function exitPageEditMode() {
    // 提交当前焦点里未 blur 的编辑
    const active = document.activeElement;
    if (active?.closest?.("[data-edit]")) commitEditable(active);

    document.body.classList.remove("is-page-editing");
    document.body.classList.remove("editor-open");
    const bar = document.getElementById("pageEditBar");
    if (bar) bar.hidden = true;
    const desk = document.getElementById("editorDesk");
    if (desk) desk.hidden = true;
    const gate = document.getElementById("editorGate");
    if (gate) gate.hidden = true;
    const root = document.getElementById("editorRoot");
    if (root) root.hidden = true;
    refreshApp();
  }

  function showGate() {
    ensureDom();
    const root = document.getElementById("editorRoot");
    root.hidden = false;
    document.getElementById("editorGate").hidden = false;
    document.getElementById("editorDesk").hidden = true;
    document.getElementById("pageEditBar").hidden = true;
    document.getElementById("editorGateErr").textContent = "";
    document.getElementById("editorPassInput").value = "";
    document.getElementById("editorPassInput").focus();
  }

  function openDesk() {
    ensureDom();
    const root = document.getElementById("editorRoot");
    root.hidden = false;
    document.getElementById("editorGate").hidden = true;
    document.getElementById("pageEditBar").hidden = false;
    document.getElementById("editorDesk").hidden = false;
    document.body.classList.add("is-page-editing");
    document.body.classList.add("editor-open");
    renderSections();
    applyLayout();
  }

  function closeDeskOnly() {
    document.getElementById("editorDesk").hidden = true;
    document.body.classList.remove("editor-open");
  }

  function tryUnlock(pass) {
    const expected = window.SITE?.editorPassword || "";
    const err = document.getElementById("editorGateErr");
    if (!expected) {
      if (err) err.textContent = "未配置密码：请本地创建 js/content.local.js";
      return;
    }
    if (pass !== expected) {
      if (err) err.textContent = "密码不对";
      return;
    }
    enterPageEditMode();
  }

  function exportDraft() {
    saveDraft();
    const payload = getDraftPayload();
    const blob = new Blob(
      [
        `/**\n * 编辑台导出草稿 — ${new Date().toISOString()}\n * 请把需要的字段合并进 js/content.js，或整段替换对应部分。\n */\nwindow.SITE_DRAFT = ${JSON.stringify(payload, null, 2)};\n`,
      ],
      { type: "application/javascript;charset=utf-8" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "content-draft.js";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("已下载草稿，请合并进 content.js");
  }

  function bindEditorUi() {
    document.getElementById("editorGateCancel")?.addEventListener("click", () => {
      exitPageEditMode();
    });
    document.getElementById("editorGateOk")?.addEventListener("click", () => {
      tryUnlock(document.getElementById("editorPassInput").value);
    });
    document.getElementById("editorPassInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") tryUnlock(e.target.value);
    });
    document.getElementById("editorMinimize")?.addEventListener("click", closeDeskOnly);
    document.getElementById("editorLogout")?.addEventListener("click", () => {
      exitPageEditMode();
      toast("已退出编辑");
    });
    document.getElementById("editorApply")?.addEventListener("click", () => {
      saveDraft();
      refreshApp();
      toast("已应用到当前预览");
    });
    document.getElementById("editorExport")?.addEventListener("click", exportDraft);
    document.getElementById("editorClearDraft")?.addEventListener("click", () => {
      localStorage.removeItem(DRAFT_KEY);
      toast("本机草稿已清除，刷新后恢复 content.js");
    });
    document.getElementById("editorTabs")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-etab]");
      if (!btn) return;
      document.querySelectorAll("#editorTabs button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      document.querySelectorAll(".editor-section").forEach((s) => {
        s.classList.toggle("is-active", s.dataset.esection === btn.dataset.etab);
      });
    });

    document.getElementById("pageEditSave")?.addEventListener("click", () => {
      const active = document.activeElement;
      if (active?.closest?.("[data-edit]")) commitEditable(active);
      saveDraft();
      refreshApp();
      toast("已保存到本机草稿");
    });
    document.getElementById("pageEditExport")?.addEventListener("click", exportDraft);
    document.getElementById("pageEditDesk")?.addEventListener("click", openDesk);
    document.getElementById("pageEditExit")?.addEventListener("click", () => {
      exitPageEditMode();
      toast("已退出编辑");
    });
  }

  function requestEditor() {
    ensureDom();
    if (document.body.classList.contains("is-page-editing")) {
      toast("已在编辑模式");
      return;
    }
    showGate();
  }

  function initUi() {
    applyLayout();

    window.LordeEditor = {
      open: requestEditor,
      applyLayout,
      saveDraft,
      isEditing: () => document.body.classList.contains("is-page-editing"),
    };

    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        requestEditor();
      }
      if (e.key === "Escape" && document.body.classList.contains("is-page-editing")) {
        const desk = document.getElementById("editorDesk");
        if (desk && !desk.hidden) closeDeskOnly();
      }
    });

    const params = new URLSearchParams(location.search);
    if (params.get("edit") === "1") {
      requestEditor();
    }
  }

  // 在 app.js 启动前合并本机草稿
  loadDraftIntoSite();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUi);
  } else {
    initUi();
  }
})();
