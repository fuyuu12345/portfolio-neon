(function () {
  const form = document.getElementById("survey-form");
  const questionsEl = document.getElementById("questions");
  const statusEl = document.getElementById("status");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const pageText = document.getElementById("page-text");
  const submitBtn = document.getElementById("submit-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  const DONE_KEY = "feminist_survey_done_v1";

  let questions = [];
  let earlyEnd = false;
  let earlyEndAt = -1;
  let endDialog = null;
  let pendingEndInput = null;
  let pageIndex = 0;
  let pages = [];

  function readCookie(name) {
    const m = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  function writeCookie(name, value, days) {
    const maxAge = Math.floor((days || 365) * 24 * 60 * 60);
    document.cookie =
      name +
      "=" +
      encodeURIComponent(value) +
      "; path=/; max-age=" +
      maxAge +
      "; SameSite=Lax";
  }

  function hasSubmittedBefore() {
    try {
      if (localStorage.getItem(DONE_KEY) === "1") return true;
    } catch (e) {}
    try {
      if (sessionStorage.getItem(DONE_KEY) === "1") return true;
    } catch (e) {}
    return readCookie(DONE_KEY) === "1";
  }

  function markSubmitted() {
    try {
      localStorage.setItem(DONE_KEY, "1");
    } catch (e) {}
    try {
      sessionStorage.setItem(DONE_KEY, "1");
    } catch (e) {}
    try {
      writeCookie(DONE_KEY, "1", 730);
    } catch (e) {}
  }

  function blockIfAlreadyDone() {
    if (!hasSubmittedBefore()) return false;
    window.location.replace("thanks.html?done=1");
    return true;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function optionList(q) {
    const opts = Array.isArray(q.options) ? q.options.slice() : [];
    if (q.allowOther && !opts.some((o) => String(o).replace(/\s/g, "") === "其他")) {
      opts.push("其他");
    }
    return opts;
  }

  function isOtherLabel(label) {
    return String(label).replace(/\s/g, "") === "其他";
  }

  function endIfValues(q) {
    if (!q) return [];
    const listed = q.endIf ? (Array.isArray(q.endIf) ? q.endIf : [q.endIf]) : [];
    // 兼容未配置 endIf 的第 6 题文案
    if (q.id === "purchase_history") {
      const extras = ["没买过，也没兴趣", "没买过，也不感兴趣"];
      return Array.from(new Set(listed.concat(extras)));
    }
    return listed;
  }

  function isEarlyEndOption(q, value) {
    const triggers = endIfValues(q);
    if (triggers.includes(value)) return true;
    const n = String(value || "").replace(/\s/g, "");
    return n.includes("没兴趣") || n.includes("不感兴趣");
  }

  function selectedCategories() {
    return Array.from(form.querySelectorAll('input[name="categories"]:checked')).map((el) => el.value);
  }

  function normLabel(s) {
    return String(s || "").replace(/\s/g, "");
  }

  function isOtherChoice(val) {
    const n = normLabel(val);
    return n === "其他" || n.startsWith("其他：") || n.startsWith("其他:");
  }

  function priceMatchesCategory(q, categoryOption) {
    if (!categoryOption || isOtherChoice(categoryOption)) return false;
    if (q.showIf && q.showIf.option) {
      if (categoryOption === q.showIf.option) return true;
      if (normLabel(categoryOption) === normLabel(q.showIf.option)) return true;
    }
    const title = String(q.title || "");
    if (title.includes(categoryOption)) return true;
    if (normLabel(title).includes(normLabel(categoryOption))) return true;
    return false;
  }

  function matchesShowIf(q) {
    const isPrice = /^price_(pref|max)_/.test(q.id || "");
    if (isPrice) {
      const selected = selectedCategories();
      if (!selected.length) return false;
      return selected.some((opt) => priceMatchesCategory(q, opt));
    }
    if (!q.showIf || !q.showIf.id) return true;
    if (q.showIf.id === "categories" && q.showIf.option) {
      return selectedCategories().some(
        (v) => v === q.showIf.option || normLabel(v) === normLabel(q.showIf.option)
      );
    }
    return true;
  }

  function isQuestionEligible(q, index) {
    if (earlyEndAt >= 0 && index > earlyEndAt) return false;
    return matchesShowIf(q);
  }

  function eligibleEntries() {
    return questions
      .map((q, index) => ({ q, index }))
      .filter(({ q, index }) => isQuestionEligible(q, index));
  }

  function pageCost(q) {
    if (q.type === "text") return 3;
    if (q.optionImages && typeof q.optionImages === "object" && Object.keys(q.optionImages).length) return 3;
    if (q.type === "multi" && optionList(q).length >= 7) return 3;
    if (q.type === "multi") return 2;
    return 1;
  }

  function rebuildPages() {
    const entries = eligibleEntries();
    const next = [];
    let buf = [];
    let used = 0;

    entries.forEach((entry) => {
      const cost = pageCost(entry.q);
      if (buf.length && used + cost > 3) {
        next.push(buf);
        buf = [];
        used = 0;
      }
      buf.push(entry);
      used += cost;
      if (used >= 3) {
        next.push(buf);
        buf = [];
        used = 0;
      }
    });
    if (buf.length) next.push(buf);

    pages = next.length ? next : [[]];
    if (pageIndex >= pages.length) pageIndex = Math.max(0, pages.length - 1);
  }

  function currentPageEntries() {
    return pages[pageIndex] || [];
  }

  function applyVisibility() {
    rebuildPages();
    const onPage = new Set(currentPageEntries().map((e) => e.index));
    const eligible = new Set(eligibleEntries().map((e) => e.index));
    let visibleNo = 0;
    const orderMap = new Map();
    eligibleEntries().forEach((e, i) => orderMap.set(e.index, i + 1));

    questionsEl.querySelectorAll(".q-block").forEach((block) => {
      const index = Number(block.getAttribute("data-index"));
      const q = questions[index];
      const isEligible = eligible.has(index);
      const show = isEligible && onPage.has(index);
      block.hidden = !show;

      block.querySelectorAll("input, textarea, select").forEach((el) => {
        if (!isEligible) {
          // showIf / 提前结束后的题目：清空并不计入
          if (el.type === "radio" || el.type === "checkbox") el.checked = false;
          else if (el.classList.contains("other-input") || el.tagName === "TEXTAREA" || el.type === "text") {
            if (el.name && el.name.endsWith("__other")) el.value = "";
            else if (el.tagName === "TEXTAREA" || (el.type === "text" && !el.classList.contains("other-input"))) {
              // only clear text answers for ineligible main fields
              if (!el.classList.contains("other-input")) el.value = "";
            }
          }
          el.disabled = true;
        } else {
          // 分页隐藏时保留答案，不禁用（避免丢失）
          if (!el.classList.contains("other-input")) el.disabled = false;
        }
      });

      if (isEligible) {
        visibleNo = orderMap.get(index) || visibleNo;
        const title = block.querySelector(".q-title");
        if (title && q) {
          const req = q.required ? '<span class="req">*</span>' : "";
          title.innerHTML = `${visibleNo}. ${escapeHtml(q.title)}${req}`;
        }
      }
    });

    questions.forEach((q) => {
      if (q.type === "single" || q.type === "multi") syncOtherInputs(q.id);
    });

    updateNav();
  }

  function updateNav() {
    const last = pageIndex >= pages.length - 1;
    if (prevBtn) {
      prevBtn.hidden = pageIndex <= 0;
      prevBtn.disabled = pageIndex <= 0;
    }
    if (nextBtn) {
      nextBtn.hidden = last;
      nextBtn.disabled = last;
    }
    if (submitBtn) {
      submitBtn.hidden = !last;
      submitBtn.textContent = "提交问卷";
    }
    if (pageText) {
      pageText.textContent = `第 ${pageIndex + 1} / ${Math.max(pages.length, 1)} 页`;
    }
  }

  function ensureEndDialog() {
    if (endDialog) return endDialog;
    endDialog = document.createElement("div");
    endDialog.id = "end-confirm-dialog";
    endDialog.className = "dialog-overlay";
    endDialog.hidden = true;
    endDialog.innerHTML = `
      <div class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="end-dialog-title">
        <h3 id="end-dialog-title">结束问卷？</h3>
        <p class="dialog-text">你选择了提前结束选项。确认后将回收当前答案；也可取消并继续答题。</p>
        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">取消，继续答题</button>
          <button type="button" class="btn btn-primary" data-action="submit">提交问卷</button>
        </div>
      </div>`;
    document.body.appendChild(endDialog);

    endDialog.querySelector('[data-action="cancel"]').addEventListener("click", () => {
      cancelEarlyEndChoice();
    });
    endDialog.querySelector('[data-action="submit"]').addEventListener("click", () => {
      confirmEarlyEndSubmit();
    });
    return endDialog;
  }

  function openEndDialog(input) {
    pendingEndInput = input;
    const dialog = ensureEndDialog();
    const label = input.value || "没买过，也没兴趣";
    const text = dialog.querySelector(".dialog-text");
    if (text) {
      text.textContent = `你选择了「${label}」。点「提交问卷」将回收当前答案并结束；点「取消，继续答题」可改选其他选项并继续。`;
    }
    dialog.hidden = false;
    document.body.classList.add("dialog-open");
  }

  function closeEndDialog() {
    if (endDialog) endDialog.hidden = true;
    pendingEndInput = null;
    document.body.classList.remove("dialog-open");
  }

  function cancelEarlyEndChoice() {
    if (pendingEndInput) pendingEndInput.checked = false;
    closeEndDialog();
    earlyEnd = false;
    earlyEndAt = -1;
    updateProgress();
  }

  function confirmEarlyEndSubmit() {
    if (!pendingEndInput) return;
    const qid = pendingEndInput.name;
    const qIndex = questions.findIndex((q) => q.id === qid);
    earlyEndAt = qIndex;
    earlyEnd = true;
    closeEndDialog();
    applyVisibility();
    const answers = collectAnswers();
    const err = validateAnswers(answers, false);
    if (err) {
      statusEl.className = "status";
      statusEl.textContent = err;
      earlyEnd = false;
      earlyEndAt = -1;
      applyVisibility();
      return;
    }
    submit(answers);
  }

  function maybePromptEarlyEnd(target) {
    if (!target || target.type !== "radio" || !target.checked) return false;
    const q = questions.find((item) => item.id === target.name);
    if (!q) return false;
    if (!isEarlyEndOption(q, target.value)) return false;
    openEndDialog(target);
    return true;
  }

  function render() {
    const meta = window.SURVEY_META || {};
    if (meta.title) document.getElementById("survey-title").textContent = meta.title;
    if (meta.subtitle) document.getElementById("survey-subtitle").textContent = meta.subtitle;
    document.title = meta.title || document.title;

    questionsEl.innerHTML = questions
      .map((q, index) => {
        const req = q.required ? '<span class="req">*</span>' : "";
        const hint = q.hint ? `<p class="q-hint">${escapeHtml(q.hint)}</p>` : "";
        let body = "";

        if (q.type === "single" || q.type === "multi") {
          const inputType = q.type === "single" ? "radio" : "checkbox";
          const opts = optionList(q);
          const imgMap = q.optionImages && typeof q.optionImages === "object" ? q.optionImages : {};
          const descMap = q.optionDescriptions && typeof q.optionDescriptions === "object" ? q.optionDescriptions : {};
          const hasImages = opts.some((opt) => !!imgMap[opt]);
          body = `<div class="options${hasImages ? " options-with-images" : ""}">${opts
            .map((opt, i) => {
              const id = `${q.id}_${i}`;
              const other = isOtherLabel(opt);
              const imgSrc = imgMap[opt];
              const desc = descMap[opt];
              const imgHtml = imgSrc
                ? `<span class="option-thumb"><img src="${escapeHtml(imgSrc)}" alt="" loading="lazy" /></span>`
                : "";
              const descHtml = desc
                ? `<span class="option-desc">${escapeHtml(desc)}</span>`
                : "";
              const otherInput = other
                ? `<input type="text" class="other-input" name="${q.id}__other" placeholder="请补充说明" autocomplete="off" disabled />`
                : "";
              return `<label class="option${other ? " option-other" : ""}${imgSrc ? " option-has-image" : ""}${desc ? " option-has-desc" : ""}" for="${id}">
                <input type="${inputType}" name="${q.id}" id="${id}" value="${escapeHtml(opt)}" data-other="${other ? "1" : "0"}" />
                <span class="option-main">
                  ${imgHtml}
                  <span class="option-label">${escapeHtml(opt)}</span>
                  ${descHtml}
                  ${otherInput}
                </span>
              </label>`;
            })
            .join("")}</div>`;
        } else if (q.type === "text") {
          const isShort = q.id === "contact" || (q.placeholder && q.placeholder.length < 8);
          body = isShort
            ? `<input type="text" name="${q.id}" placeholder="${escapeHtml(q.placeholder || "")}" autocomplete="off" />`
            : `<textarea name="${q.id}" rows="4" placeholder="${escapeHtml(q.placeholder || "")}"></textarea>`;
        }

        return `<section class="q-block" data-qid="${q.id}" data-index="${index}">
          <h2 class="q-title">${index + 1}. ${escapeHtml(q.title)}${req}</h2>
          ${hint}
          ${body}
        </section>`;
      })
      .join("");

    questionsEl.querySelectorAll('input[data-other="1"]').forEach((input) => {
      input.addEventListener("change", () => syncOtherInputs(input.name));
      syncOtherInputs(input.name);
    });
  }

  function syncOtherInputs(name) {
    const otherRadioOrChecks = form.querySelectorAll(`input[name="${name}"][data-other="1"]`);
    otherRadioOrChecks.forEach((input) => {
      const wrap = input.closest(".option");
      const text = wrap && wrap.querySelector(".other-input");
      if (!text) return;
      const on = input.checked && !input.disabled;
      text.disabled = !on;
      if (!on) text.value = "";
    });
  }

  function resolveChoice(q, rawValue) {
    if (!isOtherLabel(rawValue)) return rawValue;
    const otherEl = form.querySelector(`[name="${q.id}__other"]`);
    const note = otherEl ? otherEl.value.trim() : "";
    return note ? `其他：${note}` : "其他";
  }

  function collectAnswers() {
    const answers = {};
    const list = eligibleEntries().map((e) => e.q);
    for (const q of list) {
      if (q.type === "single") {
        const checked = form.querySelector(`input[name="${q.id}"]:checked`);
        answers[q.id] = checked ? resolveChoice(q, checked.value) : "";
      } else if (q.type === "multi") {
        answers[q.id] = Array.from(form.querySelectorAll(`input[name="${q.id}"]:checked`)).map((el) =>
          resolveChoice(q, el.value)
        );
      } else {
        const el = form.querySelector(`[name="${q.id}"]`);
        answers[q.id] = el ? el.value.trim() : "";
      }
    }
    return answers;
  }

  function validateAnswers(answers, onlyPage) {
    const list = onlyPage ? currentPageEntries().map((e) => e.q) : eligibleEntries().map((e) => e.q);
    for (let i = 0; i < list.length; i++) {
      const q = list[i];
      if (!q.required) continue;
      const val = answers[q.id];
      const label = q.title;
      if (q.type === "multi") {
        if (!val || !val.length) return `请完成本页：${label}`;
        if (val.some((v) => v === "其他")) return `「${label}」选择了「其他」，请补充说明`;
      } else if (q.type === "single") {
        if (!val) return `请完成本页：${label}`;
        if (val === "其他") return `「${label}」选择了「其他」，请补充说明`;
      } else if (!val) {
        // text optional unless required
        return `请完成本页：${label}`;
      }
    }
    return "";
  }

  function answerDone(q, val) {
    if (q.type === "multi") return !!(val && val.length && !val.includes("其他"));
    if (q.type === "single") return !!(val && val !== "其他");
    return !!val;
  }

  function updateProgress() {
    if (!earlyEnd) earlyEndAt = -1;
    applyVisibility();
    const answers = collectAnswers();
    const required = eligibleEntries()
      .map((e) => e.q)
      .filter((q) => q.required);
    let done = 0;
    for (const q of required) {
      if (answerDone(q, answers[q.id])) done += 1;
    }
    const pct = required.length ? Math.round((done / required.length) * 100) : 0;
    progressBar.style.width = pct + "%";
    progressText.textContent = pct + "%";
  }

  async function submit(answers) {
    if (hasSubmittedBefore()) {
      window.location.replace("thanks.html?done=1");
      return;
    }
    statusEl.className = "status";
    statusEl.textContent = "提交中…";
    if (submitBtn) submitBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    if (prevBtn) prevBtn.disabled = true;

    try {
      const res = await fetch(surveyApi("/api/submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          endedEarly: earlyEnd,
          submittedAt: new Date().toISOString()
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "提交失败，请确认已启动调研服务。");

      markSubmitted();
      statusEl.className = "status ok";
      statusEl.textContent = "提交成功，正在跳转…";
      window.location.replace(earlyEnd ? "/thanks.html?early=1" : "/thanks.html");
    } catch (err) {
      statusEl.className = "status";
      statusEl.textContent = err.message || "网络错误，请稍后重试。";
      if (submitBtn) submitBtn.disabled = false;
      updateNav();
    }
  }

  function goNext() {
    statusEl.textContent = "";
    const answers = collectAnswers();
    const err = validateAnswers(answers, true);
    if (err) {
      statusEl.className = "status";
      statusEl.textContent = err;
      return;
    }
    if (pageIndex < pages.length - 1) {
      pageIndex += 1;
      applyVisibility();
      window.scrollTo({ top: 0, behavior: "smooth" });
      updateProgress();
    }
  }

  function goPrev() {
    statusEl.textContent = "";
    if (pageIndex > 0) {
      pageIndex -= 1;
      applyVisibility();
      window.scrollTo({ top: 0, behavior: "smooth" });
      updateProgress();
    }
  }

  form.addEventListener("change", (e) => {
    if (maybePromptEarlyEnd(e.target)) return;
    // categories 变化会影响后续页结构
    const prevLen = pages.length;
    updateProgress();
    if (pages.length !== prevLen && pageIndex >= pages.length) {
      pageIndex = pages.length - 1;
      applyVisibility();
    }
  });
  form.addEventListener("input", updateProgress);

  if (nextBtn) nextBtn.addEventListener("click", goNext);
  if (prevBtn) prevBtn.addEventListener("click", goPrev);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // 最后一页提交：完整作答回收
    earlyEnd = false;
    earlyEndAt = -1;
    applyVisibility();
    const answers = collectAnswers();
    const pageErr = validateAnswers(answers, true);
    if (pageErr) {
      statusEl.className = "status";
      statusEl.textContent = pageErr;
      return;
    }
    const allErr = validateAnswers(answers, false);
    if (allErr) {
      statusEl.className = "status";
      statusEl.textContent = allErr;
      return;
    }
    submit(answers);
  });

  statusEl.textContent = "加载问卷中…";
  if (blockIfAlreadyDone()) return;

  loadSurveyConfig()
    .then(() => {
      if (blockIfAlreadyDone()) return;
      questions = window.SURVEY_QUESTIONS || [];
      statusEl.textContent = "";
      pageIndex = 0;
      render();
      updateProgress();
    })
    .catch(() => {
      statusEl.textContent = "问卷加载失败，请确认服务已启动后刷新。";
    });
})();
