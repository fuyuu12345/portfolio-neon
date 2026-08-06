(function () {
  const AUTH_KEY = "feminist_survey_auth";
  const loginView = document.getElementById("login-view");
  const editorView = document.getElementById("editor-view");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("login-btn");
  const loginStatus = document.getElementById("login-status");
  const questionEditors = document.getElementById("question-editors");
  const metaTitle = document.getElementById("meta-title");
  const metaSubtitle = document.getElementById("meta-subtitle");
  const saveBtn = document.getElementById("save-btn");
  const addBtn = document.getElementById("add-question-btn");
  const saveStatus = document.getElementById("save-status");

  let config = { meta: {}, questions: [] };

  function getPassword() {
    return sessionStorage.getItem(AUTH_KEY) || "";
  }

  function setPassword(pw) {
    sessionStorage.setItem(AUTH_KEY, pw);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function newId() {
    return "q_" + Math.random().toString(36).slice(2, 9);
  }

  function renderQuestions() {
    questionEditors.innerHTML = config.questions
      .map((q, index) => {
        const opts = Array.isArray(q.options) ? q.options.join("\n") : "";
        return `<article class="card editor-card" data-index="${index}">
          <div class="editor-card-head">
            <h2 class="editor-section-title">第 ${index + 1} 题</h2>
            <div class="editor-card-actions">
              <button type="button" class="btn btn-secondary btn-tiny" data-act="up" ${index === 0 ? "disabled" : ""}>上移</button>
              <button type="button" class="btn btn-secondary btn-tiny" data-act="down" ${index === config.questions.length - 1 ? "disabled" : ""}>下移</button>
              <button type="button" class="btn btn-secondary btn-tiny" data-act="del">删除</button>
            </div>
          </div>

          <label class="field-label">题目 ID（建议英文，已有数据勿轻易改）</label>
          <input type="text" data-field="id" value="${escapeHtml(q.id || "")}" />

          <label class="field-label">题干</label>
          <input type="text" data-field="title" value="${escapeHtml(q.title || "")}" />

          <label class="field-label">提示说明（可空）</label>
          <input type="text" data-field="hint" value="${escapeHtml(q.hint || "")}" />

          <div class="editor-row">
            <label class="field-label">题型
              <select data-field="type">
                <option value="single" ${q.type === "single" ? "selected" : ""}>单选</option>
                <option value="multi" ${q.type === "multi" ? "selected" : ""}>多选</option>
                <option value="text" ${q.type === "text" ? "selected" : ""}>填空</option>
              </select>
            </label>
            <label class="check-inline">
              <input type="checkbox" data-field="required" ${q.required ? "checked" : ""} /> 必填
            </label>
            <label class="check-inline">
              <input type="checkbox" data-field="allowOther" ${q.allowOther ? "checked" : ""} /> 允许「其他」自填
            </label>
          </div>

          <label class="field-label">选项（每行一个；填空题可忽略）</label>
          <textarea data-field="options" rows="6" placeholder="每行一个选项">${escapeHtml(opts)}</textarea>

          <label class="field-label">填空占位提示（仅填空题）</label>
          <input type="text" data-field="placeholder" value="${escapeHtml(q.placeholder || "")}" />
        </article>`;
      })
      .join("");
  }

  function readFromDom() {
    config.meta = {
      title: metaTitle.value.trim(),
      subtitle: metaSubtitle.value.trim()
    };
    const cards = Array.from(questionEditors.querySelectorAll(".editor-card"));
    config.questions = cards.map((card) => {
      const get = (name) => {
        const el = card.querySelector(`[data-field="${name}"]`);
        return el;
      };
      const type = get("type").value;
      const optionsRaw = get("options").value;
      const q = {
        id: get("id").value.trim() || newId(),
        type,
        required: get("required").checked,
        title: get("title").value.trim(),
        hint: get("hint").value.trim() || undefined,
        allowOther: get("allowOther").checked || undefined,
        placeholder: get("placeholder").value.trim() || undefined,
        options:
          type === "text"
            ? undefined
            : optionsRaw
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
      };
      Object.keys(q).forEach((k) => {
        if (q[k] === undefined || q[k] === false) delete q[k];
      });
      if (q.allowOther === false) delete q.allowOther;
      return q;
    });
  }

  function bindCardActions() {
    questionEditors.onclick = (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const card = btn.closest(".editor-card");
      const index = Number(card.dataset.index);
      readFromDom();
      const act = btn.getAttribute("data-act");
      if (act === "del") {
        if (!confirm("确定删除这一题？")) return;
        config.questions.splice(index, 1);
      } else if (act === "up" && index > 0) {
        const t = config.questions[index - 1];
        config.questions[index - 1] = config.questions[index];
        config.questions[index] = t;
      } else if (act === "down" && index < config.questions.length - 1) {
        const t = config.questions[index + 1];
        config.questions[index + 1] = config.questions[index];
        config.questions[index] = t;
      }
      renderQuestions();
    };
  }

  async function verifyPassword(password) {
    const res = await fetch("/api/stats", { headers: { "X-Admin-Password": password } });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "密码错误");
    }
  }

  async function loadEditor() {
    config = await loadSurveyConfig();
    metaTitle.value = (config.meta && config.meta.title) || "";
    metaSubtitle.value = (config.meta && config.meta.subtitle) || "";
    config.questions = Array.isArray(config.questions) ? config.questions : [];
    renderQuestions();
    bindCardActions();
  }

  async function enter(password) {
    loginStatus.className = "status";
    loginStatus.textContent = "验证中…";
    try {
      await verifyPassword(password);
      setPassword(password);
      await loadEditor();
      loginView.hidden = true;
      editorView.hidden = false;
      loginStatus.textContent = "";
    } catch (err) {
      sessionStorage.removeItem(AUTH_KEY);
      loginStatus.textContent = err.message || "无法进入编辑";
    }
  }

  loginBtn.addEventListener("click", () => enter(passwordInput.value.trim()));
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") enter(passwordInput.value.trim());
  });

  addBtn.addEventListener("click", () => {
    readFromDom();
    config.questions.push({
      id: newId(),
      type: "single",
      required: true,
      title: "新题目",
      options: ["选项 A", "选项 B"],
      allowOther: true
    });
    renderQuestions();
  });

  saveBtn.addEventListener("click", async () => {
    readFromDom();
    if (!config.meta.title) {
      saveStatus.className = "status";
      saveStatus.textContent = "请填写问卷标题";
      return;
    }
    for (let i = 0; i < config.questions.length; i++) {
      const q = config.questions[i];
      if (!q.title) {
        saveStatus.textContent = `第 ${i + 1} 题缺少题干`;
        return;
      }
      if ((q.type === "single" || q.type === "multi") && (!q.options || !q.options.length)) {
        saveStatus.textContent = `第 ${i + 1} 题请至少填写一个选项`;
        return;
      }
    }

    saveStatus.className = "status";
    saveStatus.textContent = "保存中…";
    saveBtn.disabled = true;
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": getPassword()
        },
        body: JSON.stringify(config)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "保存失败");
      saveStatus.className = "status ok";
      saveStatus.textContent = "已保存。打开填写页即可看到更新。";
    } catch (err) {
      saveStatus.className = "status";
      saveStatus.textContent = err.message || "保存失败";
    } finally {
      saveBtn.disabled = false;
    }
  });

  if (getPassword()) enter(getPassword());
})();
