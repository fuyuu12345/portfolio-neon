const QUESTIONS = [
  {
    layer: "L2 日常状态",
    q: "「累的时候」，我最希望你们怎么做？",
    options: [
      "让我安静待一会",
      "关心一句就好",
      "帮我做点实际的事",
      "听我说几分钟",
    ],
  },
  {
    layer: "L3 兴趣表达",
    q: "关于「染发」，我更希望你们先看到的是？",
    options: [
      "我开心和自信",
      "这是我的自我表达",
      "我做过考虑，不是冲动",
      "可以担心，但请先别否定",
    ],
  },
  {
    layer: "L1 生活习惯",
    q: "关于「晚睡」，什么样的提醒我比较能接受？",
    options: [
      "点到为止的一句",
      "用关心口吻，别用命令",
      "写在消息里，别反复电话",
      "先问我是否需要提醒",
    ],
  },
  {
    layer: "L4 精神世界",
    q: "什么时刻我会觉得「被真正理解」？",
    options: [
      "你们复述出我的感受，而不急着纠正",
      "即使不同意，也尊重我的选择权",
      "记得我说过的小事和偏好",
      "冲突后仍对我温柔",
    ],
  },
  {
    layer: "L2 日常状态",
    q: "我「加班很晚回家」时，你们怎样做不会增加我负担？",
    options: [
      "消息短、可迟回",
      "不问一长串细节",
      "先报「看到了」就好",
      "把关心变成具体帮助",
    ],
  },
];

const CALL_LABEL = {
  ok: "可以通话",
  later: "稍后再说",
  no: "今天别打",
};

const state = {
  role: "child", // child | parent
  qIndex: 0,
  picked: null,
  shuffleLeft: 3,
  sent: false,
  call: "ok",
  outReturn: "",
  outWho: "",
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.remove("is-hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("is-hidden"), 1800);
}

function setScreen(name) {
  $$(".screen").forEach((s) => s.classList.toggle("is-active", s.id === `screen-${name}`));
  $$(".tab").forEach((t) => t.classList.toggle("is-active", t.dataset.jump === name));
  const screen = $(`#screen-${name}`);
  $("#screenTitle").textContent = screen?.dataset.title || name;

  // parent cannot initiate quiz send UX the same way
  if (name === "quiz") renderQuiz();
}

function renderQuiz() {
  const item = QUESTIONS[state.qIndex];
  $("#quizLayer").textContent = item.layer;
  $("#quizQuestion").textContent = item.q;
  const box = $("#quizOptions");
  box.innerHTML = item.options
    .map(
      (text, i) =>
        `<button type="button" class="option${state.picked === i ? " is-picked" : ""}" data-i="${i}">${String.fromCharCode(
          65 + i
        )}. ${text}</button>`
    )
    .join("");

  const child = state.role === "child";
  $("#quizHint").textContent = child
    ? `先选你的答案（父母暂时看不见），再送出。还可换题 ${state.shuffleLeft} 次。`
    : "孩子已发起时，你在这里作答看默契。";
  $("#btnShuffle").disabled = !child || state.shuffleLeft <= 0 || state.sent;
  $("#btnSend").disabled = !child || state.picked == null || state.sent;
  $("#btnSend").textContent = state.sent ? "已送出" : "送出卡片";

  if (state.sent && state.role === "parent") {
    // parent answering mode: allow pick then reveal
    $("#btnSend").disabled = state.picked == null;
    $("#btnSend").textContent = "提交我的猜测";
    $("#quizHint").textContent = "选一个你觉得最像孩子的答案。";
  }

  box.onclick = (e) => {
    const btn = e.target.closest(".option");
    if (!btn) return;
    state.picked = Number(btn.dataset.i);
    renderQuiz();
  };
}

function showResult(match) {
  $("#quizCard").classList.add("is-hidden");
  $("#resultCard").classList.remove("is-hidden");
  $("#resultTitle").textContent = match.title;
  $("#resultBody").textContent = match.body;
}

function renderCall() {
  $$("#callChips .chip").forEach((c) => {
    c.classList.toggle("is-on", c.dataset.call === state.call);
  });
  $("#callBadge").textContent = `当前：${CALL_LABEL[state.call]}`;
  $("#callHint").textContent =
    state.role === "child" ? "任何状态下都可更新" : "孩子标明的通话意愿";
  // parents can see but not edit in this prototype
  $$("#callChips .chip").forEach((c) => {
    c.disabled = state.role === "parent";
  });
}

function renderOut() {
  const hasReturn = Boolean(state.outReturn.trim());
  const hasWho = Boolean(state.outWho.trim());
  const hasAny = hasReturn || hasWho;
  const child = state.role === "child";

  $("#btnToggleOut").classList.toggle("is-hidden", !child);
  $("#outForm").classList.add("is-hidden");
  $("#outEmptyHint").classList.toggle("is-hidden", hasAny || !child);
  $("#outEmptyHint").textContent = child
    ? "未填写时，家人看不到这一块。"
    : "孩子未补充外出信息。";

  $("#outRows").classList.toggle("is-hidden", !hasAny);
  $("#rowReturn").classList.toggle("is-hidden", !hasReturn);
  $("#rowWho").classList.toggle("is-hidden", !hasWho);
  $("#valReturn").textContent = state.outReturn;
  $("#valWho").textContent = state.outWho;
  $("#outParentActions").classList.toggle("is-hidden", !(hasAny && !child));

  // if parent and nothing filled, soften whole card
  $("#outCard").style.opacity = !hasAny && !child ? "0.55" : "1";
}

function renderHomeExtras() {
  renderCall();
  renderOut();
}

function bindNav() {
  document.body.addEventListener("click", (e) => {
    const jump = e.target.closest("[data-jump]");
    if (jump) setScreen(jump.dataset.jump);
  });

  $("#roleToggle").addEventListener("click", () => {
    state.role = state.role === "child" ? "parent" : "child";
    const btn = $("#roleToggle");
    btn.textContent = state.role === "child" ? "孩子视角" : "父母视角";
    btn.classList.toggle("is-parent", state.role === "parent");
    toast(state.role === "child" ? "已切到孩子视角" : "已切到父母视角");
    renderHomeExtras();
    if ($("#screen-quiz").classList.contains("is-active")) renderQuiz();
  });

  $("#callChips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-call]");
    if (!btn || state.role === "parent") return;
    state.call = btn.dataset.call;
    renderCall();
    toast(`已更新：${CALL_LABEL[state.call]}`);
  });

  $("#btnToggleOut").addEventListener("click", () => {
    const form = $("#outForm");
    const open = form.classList.contains("is-hidden");
    form.classList.toggle("is-hidden", !open);
    if (open) {
      $("#outReturn").value = state.outReturn;
      $("#outWho").value = state.outWho;
    }
  });

  $("#btnSaveOut").addEventListener("click", () => {
    state.outReturn = $("#outReturn").value.trim();
    state.outWho = $("#outWho").value.trim();
    renderOut();
    toast(
      state.outReturn || state.outWho
        ? "外出补充已保存（有内容才显示）"
        : "已清空，家人看不到外出补充"
    );
  });

  $("#btnShuffle").addEventListener("click", () => {
    if (state.shuffleLeft <= 0 || state.sent) return;
    state.shuffleLeft -= 1;
    state.picked = null;
    state.qIndex = (state.qIndex + 1) % QUESTIONS.length;
    renderQuiz();
    toast("换了一题");
  });

  $("#btnSend").addEventListener("click", () => {
    if (state.picked == null) return;

    if (state.role === "child" && !state.sent) {
      state.sent = true;
      state.childAnswer = state.picked;
      state.picked = null;
      toast("已送出，等父母作答");
      renderQuiz();
      return;
    }

    if (state.role === "parent" && state.sent) {
      const same = state.picked === state.childAnswer;
      showResult(
        same
          ? {
              title: "心有灵犀",
              body: "这次你们选了同一格。不是考试合格，是多看见彼此一点。",
            }
          : {
              title: "原来我想的不一样",
              body: `孩子选的是 ${String.fromCharCode(65 + state.childAnswer)}。不一样也没关系——正好聊一句。`,
            }
      );
      return;
    }

    toast(state.role === "child" ? "先选一个答案" : "请先让孩子送出卡片，再切到父母视角");
  });

  $("#btnNote").addEventListener("click", () => {
    const text = $("#noteInput").value.trim() || "收到，我知道了。";
    toast(`留言已夹进本子：${text}`);
  });

  $$(".chip-row .chip").forEach((chip) => {
    if (chip.id || chip.dataset.call) return;
    chip.addEventListener("click", () => {
      const label = chip.textContent.trim() || "爱心";
      toast(`已回应：${label}`);
    });
  });
}

bindNav();
setScreen("home");
renderHomeExtras();
renderQuiz();
