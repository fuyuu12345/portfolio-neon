/**
 * Oura 方案页私人编辑
 * Ctrl+Shift+E → 密码（与主站 content.js editorPassword 一致）
 * 本机草稿 + 导出 HTML（换电脑：覆盖文件后打开）+ 导入草稿 JSON
 */
(() => {
  const PASSWORD = "lorde0701";
  const DRAFT_KEY = "oura-ring-case-draft-v1";
  const EDITABLE =
    ".page h1, .page h2, .page h3, .page h4, .page p, .page li, .page td, .page .desc, .page .mind, .page .insight__quote, .page .hero__lead, .page .section__intro, .page .fact, .page .cap, .focus-bar p, .focus-bar strong, .beat p, .beat strong, .play p, .play strong, .play li, .scene p, .case-card dd, .path span, .phase-kpi p, .phase-kpi strong, .title-chips span, .sample-row p, .sample-row li, .offer-tags span";

  let editing = false;

  function toast(msg) {
    let el = document.getElementById("caseEditToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "caseEditToast";
      el.className = "case-edit-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("is-show"), 2000);
  }

  function collectDraft() {
    const map = {};
    document.querySelectorAll("[data-case-edit]").forEach((el) => {
      map[el.getAttribute("data-case-edit")] = el.innerHTML;
    });
    return { v: 1, savedAt: new Date().toISOString(), map };
  }

  function applyDraft(draft) {
    if (!draft?.map) return 0;
    let n = 0;
    Object.entries(draft.map).forEach(([id, html]) => {
      const el = document.querySelector(`[data-case-edit="${id}"]`);
      if (el) {
        el.innerHTML = html;
        n++;
      }
    });
    return n;
  }

  function saveLocal() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(collectDraft()));
    } catch {
      /* ignore quota */
    }
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const n = applyDraft(JSON.parse(raw));
      if (n) toast("已载入本机草稿 " + n + " 处");
    } catch {
      /* ignore */
    }
  }

  function tagEditables() {
    let i = 0;
    document.querySelectorAll(EDITABLE).forEach((el) => {
      if (el.closest("#caseEditBar, #caseEditGate, .side-nav, .pager, .top")) return;
      if (!el.getAttribute("data-case-edit")) {
        el.setAttribute("data-case-edit", "e" + i++);
      }
    });
  }

  function setEditing(on) {
    editing = on;
    document.body.classList.toggle("is-case-editing", on);
    const bar = document.getElementById("caseEditBar");
    if (bar) bar.hidden = !on;
    document.querySelectorAll("[data-case-edit]").forEach((el) => {
      el.contentEditable = on ? "true" : "false";
      if (on) el.setAttribute("spellcheck", "false");
    });
    if (on) toast("编辑中 · 点文字即可改 · 记得导出 HTML");
  }

  function ensureUi() {
    if (document.getElementById("caseEditGate")) return;

    const gate = document.createElement("div");
    gate.id = "caseEditGate";
    gate.className = "case-edit-gate";
    gate.hidden = true;
    gate.innerHTML = `
      <div class="case-edit-gate__card">
        <h2>方案页编辑</h2>
        <p>密码与主站相同（js/content.js → editorPassword）。改完请导出 HTML，换电脑用该文件打开。</p>
        <div class="case-edit-gate__err" id="caseEditErr" hidden></div>
        <input type="password" id="caseEditPass" placeholder="输入密码" autocomplete="off" />
        <div class="case-edit-gate__row">
          <button type="button" id="caseEditCancel">取消</button>
          <button type="button" class="is-primary" id="caseEditOk">进入编辑</button>
        </div>
      </div>`;
    document.body.appendChild(gate);

    const bar = document.createElement("div");
    bar.id = "caseEditBar";
    bar.className = "case-edit-bar";
    bar.hidden = true;
    bar.innerHTML = `
      <span class="case-edit-bar__badge">编辑中</span>
      <button type="button" id="caseEditSaveLocal">保存本机草稿</button>
      <button type="button" id="caseEditExportJson">导出草稿 JSON</button>
      <button type="button" id="caseEditImportJson">导入草稿 JSON</button>
      <button type="button" class="is-primary" id="caseEditExportHtml">导出 HTML（换电脑用）</button>
      <button type="button" id="caseEditExit">退出编辑</button>
      <input type="file" id="caseEditFile" accept="application/json,.json" hidden />
    `;
    document.body.appendChild(bar);

    document.getElementById("caseEditCancel").onclick = () => {
      gate.hidden = true;
    };
    document.getElementById("caseEditOk").onclick = tryEnter;
    document.getElementById("caseEditPass").addEventListener("keydown", (e) => {
      if (e.key === "Enter") tryEnter();
    });
    document.getElementById("caseEditExit").onclick = () => {
      saveLocal();
      setEditing(false);
      toast("已退出编辑 · 本机草稿已保存");
    };
    document.getElementById("caseEditSaveLocal").onclick = () => {
      saveLocal();
      toast("本机草稿已保存");
    };
    document.getElementById("caseEditExportJson").onclick = exportJson;
    document.getElementById("caseEditExportHtml").onclick = exportHtml;
    document.getElementById("caseEditImportJson").onclick = () => {
      document.getElementById("caseEditFile").click();
    };
    document.getElementById("caseEditFile").onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const n = applyDraft(JSON.parse(String(reader.result)));
          saveLocal();
          toast("已导入 " + n + " 处，请再导出 HTML 落盘");
        } catch {
          toast("草稿文件无法解析");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    };

    document.addEventListener(
      "blur",
      (e) => {
        if (!editing) return;
        if (e.target?.closest?.("[data-case-edit]")) saveLocal();
      },
      true
    );
  }

  function tryEnter() {
    const pass = document.getElementById("caseEditPass")?.value || "";
    const err = document.getElementById("caseEditErr");
    if (pass !== PASSWORD) {
      if (err) {
        err.hidden = false;
        err.textContent = "密码不正确";
      }
      return;
    }
    document.getElementById("caseEditGate").hidden = true;
    document.getElementById("caseEditPass").value = "";
    if (err) err.hidden = true;
    tagEditables();
    setEditing(true);
  }

  function showGate() {
    ensureUi();
    tagEditables();
    document.getElementById("caseEditGate").hidden = false;
    document.getElementById("caseEditPass")?.focus();
  }

  function download(filename, text, type) {
    const blob = new Blob([text], { type: type || "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function exportJson() {
    saveLocal();
    download("oura-ring-draft.json", JSON.stringify(collectDraft(), null, 2), "application/json");
    toast("已下载草稿 JSON");
  }

  function exportHtml() {
    saveLocal();
    const wasEditing = editing;
    if (wasEditing) {
      document.querySelectorAll("[data-case-edit]").forEach((el) => {
        el.removeAttribute("contenteditable");
      });
    }
    const gate = document.getElementById("caseEditGate");
    const bar = document.getElementById("caseEditBar");
    const toastEl = document.getElementById("caseEditToast");
    const gH = gate?.hidden;
    const bH = bar?.hidden;
    if (gate) gate.hidden = true;
    if (bar) bar.hidden = true;
    if (toastEl) toastEl.remove();

    const html =
      "<!DOCTYPE html>\n" +
      document.documentElement.outerHTML.replace(/\scontenteditable="[^"]*"/g, "");

    if (gate) gate.hidden = gH;
    if (bar) bar.hidden = bH;
    if (wasEditing) {
      document.querySelectorAll("[data-case-edit]").forEach((el) => {
        el.contentEditable = "true";
      });
    }
    download("index.html", html, "text/html;charset=utf-8");
    toast("已下载 index.html · 覆盖到 cases/oura-ring/ 后换电脑可打开");
  }

  document.addEventListener("keydown", (e) => {
    if (e.target.matches?.("input, textarea") && e.target.id !== "caseEditPass") return;
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) {
      e.preventDefault();
      if (editing) {
        saveLocal();
        setEditing(false);
        toast("已退出编辑");
      } else {
        showGate();
      }
    }
  });

  if (/[?&]edit=1(?:&|$)/.test(location.search)) {
    document.addEventListener("DOMContentLoaded", () => {
      tagEditables();
      loadLocal();
      showGate();
    });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      tagEditables();
      loadLocal();
    });
  }
})();
