(function () {
  const loginView = document.getElementById("login-view");
  const statsView = document.getElementById("stats-view");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("login-btn");
  const loginStatus = document.getElementById("login-status");
  const summaryCards = document.getElementById("summary-cards");
  const charts = document.getElementById("charts");
  const refreshBtn = document.getElementById("refresh-btn");
  const exportBtn = document.getElementById("export-btn");
  const exportJsonBtn = document.getElementById("export-json-btn");

  const AUTH_KEY = "feminist_survey_auth";
  let questions = [];
  let cachedResponses = [];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getPassword() {
    return sessionStorage.getItem(AUTH_KEY) || "";
  }

  function setPassword(pw) {
    sessionStorage.setItem(AUTH_KEY, pw);
  }

  function optionList(q) {
    const opts = Array.isArray(q.options) ? q.options.slice() : [];
    if (q.allowOther && !opts.some((o) => String(o).replace(/\s/g, "") === "其他")) {
      opts.push("其他");
    }
    return opts;
  }

  function normalizeChoice(val, q) {
    const raw = String(val || "");
    if (raw === "其他" || raw.startsWith("其他：") || raw.startsWith("其他:")) {
      return { bucket: "其他（自填）", note: raw.replace(/^其他[:：]\s*/, "") || "" };
    }
    const opts = optionList(q);
    if (opts.includes(raw)) return { bucket: raw, note: "" };
    return { bucket: raw, note: "" };
  }

  async function fetchStats(password) {
    const res = await fetch("/api/stats", {
      headers: { "X-Admin-Password": password }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "无法获取统计数据");
    return data;
  }

  function aggregate(responses) {
    const total = responses.length;
    const byQuestion = {};

    for (const q of questions) {
      if (q.type === "text") {
        byQuestion[q.id] = {
          type: "text",
          title: q.title,
          items: responses
            .map((r) => (r.answers && r.answers[q.id] ? String(r.answers[q.id]).trim() : ""))
            .filter(Boolean)
        };
        continue;
      }

      const opts = optionList(q);
      const counts = {};
      for (const opt of opts) {
        counts[opt === "其他" ? "其他（自填）" : opt] = 0;
      }
      if (q.allowOther && !counts["其他（自填）"]) counts["其他（自填）"] = 0;

      const otherNotes = [];

      for (const r of responses) {
        const val = r.answers ? r.answers[q.id] : null;
        const values = q.type === "single" ? (val ? [val] : []) : Array.isArray(val) ? val : [];
        for (const item of values) {
          const n = normalizeChoice(item, q);
          if (!Object.prototype.hasOwnProperty.call(counts, n.bucket)) counts[n.bucket] = 0;
          counts[n.bucket] += 1;
          if (n.bucket === "其他（自填）" && n.note) otherNotes.push(n.note);
        }
      }

      const rows = Object.keys(counts)
        .map((name) => {
          const count = counts[name];
          const pct = total ? Math.round((count / total) * 1000) / 10 : 0;
          return { name, count, pct };
        })
        .sort((a, b) => b.count - a.count);

      byQuestion[q.id] = {
        type: q.type,
        title: q.title,
        rows,
        otherNotes,
        answered: total
      };
    }

    return { total, byQuestion };
  }

  function renderSummary(total, responses) {
    const willing = responses.filter((r) => r.answers && r.answers.followup === "愿意").length;
    const bought = responses.filter((r) => {
      const v = r.answers && r.answers.purchase_history;
      return v === "买过，且会复购" || v === "买过，偶尔";
    }).length;

    summaryCards.innerHTML = `
      <div class="stat-pill"><div class="label">有效回收</div><div class="value">${total}</div></div>
      <div class="stat-pill"><div class="label">有过购买经历</div><div class="value">${total ? Math.round((bought / total) * 100) : 0}%</div></div>
      <div class="stat-pill"><div class="label">愿意访谈</div><div class="value">${willing}</div></div>
    `;
  }

  function renderCharts(agg) {
    charts.innerHTML = questions
      .map((q) => {
        const data = agg.byQuestion[q.id];
        if (!data) return "";

        if (data.type === "text") {
          const list = data.items.length
            ? data.items.map((t) => `<div class="open-item">${escapeHtml(t)}</div>`).join("")
            : `<div class="open-item">暂无文字回答</div>`;
          return `<section class="card chart-card">
            <h2>${escapeHtml(q.title)}</h2>
            <div class="meta">开放题 · ${data.items.length} 条</div>
            <div class="open-list">${list}</div>
          </section>`;
        }

        const rows = data.rows
          .map(
            (row) => `<div class="bar-row">
              <div class="name">${escapeHtml(row.name)}</div>
              <div class="bar-track"><i style="width:${row.pct}%"></i></div>
              <div class="pct">${row.count} · ${row.pct}%</div>
            </div>`
          )
          .join("");

        const notes =
          data.otherNotes && data.otherNotes.length
            ? `<div class="meta" style="margin-top:12px;">「其他」补充：</div>
               <div class="open-list">${data.otherNotes
                 .map((t) => `<div class="open-item">${escapeHtml(t)}</div>`)
                 .join("")}</div>`
            : "";

        const note =
          q.type === "multi"
            ? `多选题 · 基数 ${agg.total} 人（比例按总样本计算）`
            : `单选题 · 基数 ${agg.total} 人`;

        return `<section class="card chart-card">
          <h2>${escapeHtml(q.title)}</h2>
          <div class="meta">${note}</div>
          ${rows || '<div class="open-item">暂无数据</div>'}
          ${notes}
        </section>`;
      })
      .join("");
  }

  function toCsv(responses) {
    const headers = ["id", "submittedAt", ...questions.map((q) => q.id)];
    const lines = [headers.join(",")];

    for (const r of responses) {
      const row = [
        r.id || "",
        r.submittedAt || "",
        ...questions.map((q) => {
          const val = r.answers ? r.answers[q.id] : "";
          const text = Array.isArray(val) ? val.join(" | ") : String(val || "");
          return `"${text.replace(/"/g, '""')}"`;
        })
      ];
      lines.push(row.join(","));
    }
    return "\uFEFF" + lines.join("\n");
  }

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function loadAndRender() {
    await loadSurveyConfig();
    questions = window.SURVEY_QUESTIONS || [];
    const password = getPassword();
    const data = await fetchStats(password);
    cachedResponses = data.responses || [];
    const agg = aggregate(cachedResponses);
    renderSummary(agg.total, cachedResponses);
    renderCharts(agg);
  }

  async function tryEnter(password) {
    loginStatus.className = "status";
    loginStatus.textContent = "验证中…";
    try {
      setPassword(password);
      await loadAndRender();
      loginView.hidden = true;
      statsView.hidden = false;
      loginStatus.textContent = "";
    } catch (err) {
      sessionStorage.removeItem(AUTH_KEY);
      loginStatus.className = "status";
      loginStatus.textContent = err.message || "密码错误或服务未启动";
    }
  }

  loginBtn.addEventListener("click", () => tryEnter(passwordInput.value.trim()));
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryEnter(passwordInput.value.trim());
  });

  refreshBtn.addEventListener("click", async () => {
    try {
      await loadAndRender();
    } catch (err) {
      alert(err.message);
    }
  });

  exportBtn.addEventListener("click", () => {
    download(`feminist-survey-${Date.now()}.csv`, toCsv(cachedResponses), "text/csv;charset=utf-8");
  });

  exportJsonBtn.addEventListener("click", () => {
    download(
      `feminist-survey-${Date.now()}.json`,
      JSON.stringify(cachedResponses, null, 2),
      "application/json"
    );
  });

  if (getPassword()) tryEnter(getPassword());
})();
