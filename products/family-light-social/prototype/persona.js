const DATA = {
  child: {
    stages: {
      student: {
        label: "学生",
        hint: "更常卡在成绩比较、作息、交友、升学、回不回家。",
        concerns: [
          "被拿来和别人比较",
          "成绩/排名压力",
          "作息被管太死",
          "交友被干涉",
          "专业/升学选择谈不拢",
          "外观穿搭不被接受",
          "隐私被追问",
          "回不回家起冲突",
          "想被当成年人看",
        ],
        edu: ["高中", "大学本地读", "大学异地读", "考研/升学准备", "间隔或休学中"],
        work: ["暂无全职工作", "实习中", "兼职中"],
        samples: [
          "当我成绩波动时，我最希望家里怎么做？",
          "关于「被拿来比较」，我真实的感受更接近？",
          "我作息和家里不一致时，怎样的提醒我能接受？",
        ],
      },
      junior: {
        label: "职场新鲜人",
        hint: "更常卡在加班、稳定与兴趣、大城市、经济独立。",
        concerns: [
          "加班不被理解",
          "稳定 vs 兴趣谈不拢",
          "大城市发展被劝回",
          "经济独立边界",
          "外观/自我表达冲突",
          "隐私与报备压力",
          "恋爱/交友被催",
          "想被当成成年人",
          "被翻旧账或否定选择",
        ],
        edu: ["已毕业", "在职进修", "不方便细说"],
        work: ["互联网/设计/传媒", "体制内或稳定岗", "教育/服务", "求职换工作中", "行业先不说"],
        samples: [
          "我加班很晚时，怎样的关心不会增加负担？",
          "聊到「稳定还是兴趣」时，我更需要？",
          "关于报备，我更认同哪一种？",
        ],
      },
      stable: {
        label: "职场一段时间了",
        hint: "更常卡在成家节奏、定居、是否回家、长期边界。",
        concerns: [
          "结婚成家被催",
          "买房/定居分歧",
          "要不要回家发展",
          "长期边界不被尊重",
          "亲戚目光与闲话",
          "工作变动不被支持",
          "想保留私人生活",
          "节日安排谈不拢",
        ],
        edu: ["已毕业多年", "仍在进修", "不细说"],
        work: ["稳定工作中", "考虑转行", "创业或斜杠", "行业先不说"],
        samples: [
          "谈到成家节奏时，我最希望家里？",
          "「要不要回家发展」这件事，我更需要？",
          "亲戚问询时，我希望你们怎么站位？",
        ],
      },
      custom: {
        label: "自定义",
        hint: "用你勾选的在意点，定义题目方向。",
        concerns: [
          "不被理解",
          "边界被越过",
          "被比较或否定",
          "隐私压力",
          "未来节奏不合",
          "外观/自我表达",
          "节日与回家安排",
        ],
        edu: ["学生阶段", "已离开学校", "不细说"],
        work: ["有工作", "无全职工作", "过渡期", "不细说"],
        samples: [
          "当意见不合时，我更希望当下怎么处理？",
          "什么时刻我会觉得被真正理解？",
          "关于隐私，我的底线更接近？",
        ],
      },
    },
  },
  elder: {
    stages: {
      school_kid: {
        label: "孩子还在读书",
        hint: "更常卡在担心成绩、安全、交友、未来方向。",
        concerns: [
          "担心孩子成绩落后",
          "怕孩子被带坏/交友",
          "不知道怎么开口关心",
          "怕管多了孩子更远",
          "担心安全和晚归",
          "和孩子价值观不合",
          "不知道怎样表达爱",
          "怕亲戚比较伤孩子",
          "想懂孩子但无从下手",
        ],
        edu: ["孩子高中", "孩子大学", "孩子备考中"],
        work: ["我仍在工作", "我已退休/居家更多", "不细说"],
        samples: [
          "我想关心孩子时，怎样开口比较不会被顶回来？",
          "当我担心安全时，怎样表达更像关心而不是控制？",
          "孩子不想细说行程时，我怎样才能安心一点？",
        ],
      },
      work_kid: {
        label: "孩子已工作",
        hint: "更常卡在稳定、成家、是否回家、怎么支持。",
        concerns: [
          "担心孩子工作不稳定",
          "希望孩子更稳定落地",
          "成家被催或不敢催",
          "想孩子回家发展",
          "不知道怎样支持才合适",
          "怕说重了关系变僵",
          "担心孩子在外吃苦",
          "想懂但插不上话",
          "节日团聚安排为难",
        ],
        edu: ["孩子已毕业", "不细说"],
        work: ["我仍在工作", "我已退休/居家更多", "不细说"],
        samples: [
          "想劝孩子求稳时，怎样说才比较听得进去？",
          "我担心孩子在外吃苦，怎样表达不会变成压力？",
          "关于回不回家过节，我真正在意的是？",
        ],
      },
      distant: {
        label: "孩子长期异地",
        hint: "更常卡在报平安、想见面、怕打扰、怕失控。",
        concerns: [
          "报平安频率谈不拢",
          "很想孩子但又怕打扰",
          "视频通话总不自然",
          "不知道孩子过得好不好",
          "怕自己变成催促的人",
          "重要事说不到一起",
          "节日不能团聚的失落",
          "想理解新生活但听不懂",
        ],
        edu: ["不细说"],
        work: ["我仍在工作", "我已退休/居家更多", "不细说"],
        samples: [
          "我很想孩子时，怎样联系比较不会变成压力？",
          "关于报平安，怎样的频率我也能安心？",
          "视频时冷场，我可以怎么做？",
        ],
      },
      custom: {
        label: "自定义",
        hint: "用你勾选的在意点，定义题目方向。",
        concerns: [
          "怕管多了更远",
          "不会表达关心",
          "担心安全与未来",
          "价值观不合",
          "团聚与距离",
          "想懂孩子",
          "怕伤害关系",
        ],
        edu: ["不细说"],
        work: ["仍在工作", "居家更多", "不细说"],
        samples: [
          "我想靠近孩子时，最怕的是？",
          "关心说不出口时，我更希望？",
          "意见不合时，我怎样做比较好？",
        ],
      },
    },
  },
};

const state = {
  role: "child",
  stage: "student",
  concerns: new Set(),
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.remove("is-hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("is-hidden"), 1600);
}

function stageMap() {
  return DATA[state.role].stages;
}

function currentStage() {
  return stageMap()[state.stage];
}

function defaultStageKey() {
  return state.role === "child" ? "student" : "school_kid";
}

function renderStageChips() {
  const map = stageMap();
  const box = $("#stageChips");
  box.innerHTML = Object.entries(map)
    .map(
      ([key, v]) =>
        `<button type="button" class="chip${key === state.stage ? " is-on" : ""}" data-stage="${key}">${v.label}</button>`
    )
    .join("");
}

function renderFields() {
  const meta = currentStage();
  if (!meta) {
    state.stage = defaultStageKey();
  }
  const m = currentStage();
  $("#stageHint").textContent = m.hint;
  $("#stageCustom").classList.toggle("is-hidden", state.stage !== "custom");

  $("#worryChips").innerHTML = m.concerns
    .map(
      (w) =>
        `<button type="button" class="chip${state.concerns.has(w) ? " is-on" : ""}" data-concern="${w}">${w}</button>`
    )
    .join("");

  [...state.concerns].forEach((w) => {
    if (!m.concerns.includes(w)) state.concerns.delete(w);
  });
  updateCount();

  $("#eduChips").innerHTML = m.edu.map((t) => `<button type="button" class="chip">${t}</button>`).join("");
  $("#workChips").innerHTML = m.work.map((t) => `<button type="button" class="chip">${t}</button>`).join("");
}

function updateCount() {
  const n = state.concerns.size;
  $("#worryCount").textContent = `已选 ${n} / 3${n >= 3 ? " · 可以继续" : ""}`;
}

function openDrawer() {
  if (state.concerns.size < 3) {
    toast("开局先选满 3 个在意的事");
    return false;
  }
  const m = currentStage();
  const extras = [...state.concerns].slice(0, 2).map((w) => `关于「${w}」，我更希望对方怎样理解？`);
  $("#sampleList").innerHTML = [...m.samples, ...extras]
    .slice(0, 5)
    .map((t) => `<li>${t}</li>`)
    .join("");
  $("#drawer").classList.remove("is-hidden");
  return true;
}

function bind() {
  $("#roleChips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-role]");
    if (!btn) return;
    state.role = btn.dataset.role;
    $$("#roleChips .chip").forEach((c) => c.classList.toggle("is-on", c === btn));
    state.stage = defaultStageKey();
    state.concerns.clear();
    renderStageChips();
    renderFields();
  });

  $("#stageChips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-stage]");
    if (!btn) return;
    state.stage = btn.dataset.stage;
    $$("#stageChips .chip").forEach((c) => c.classList.toggle("is-on", c === btn));
    state.concerns.clear();
    renderFields();
  });

  $("#worryChips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-concern]");
    if (!btn) return;
    const w = btn.dataset.concern;
    if (state.concerns.has(w)) state.concerns.delete(w);
    else {
      if (state.concerns.size >= 3) {
        toast("开局先选 3 个就好，之后还能改");
        return;
      }
      state.concerns.add(w);
    }
    btn.classList.toggle("is-on");
    updateCount();
  });

  ["#traitChips", "#hobbyChips", "#eduChips", "#workChips", "#storyFeel"].forEach((sel) => {
    $(sel).addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn || btn.dataset.concern) return;
      btn.classList.toggle("is-on");
    });
  });

  $("#btnPreview").addEventListener("click", openDrawer);
  $("#btnStart").addEventListener("click", () => {
    if (openDrawer()) toast("已保存（示意）· 家人看不到这份档案");
  });
  $("#btnLater").addEventListener("click", () => toast("可以只保留阶段和在意的事，其它稍后补"));
  $("#btnClose").addEventListener("click", () => $("#drawer").classList.add("is-hidden"));
  $("#drawer").addEventListener("click", (e) => {
    if (e.target.id === "drawer") $("#drawer").classList.add("is-hidden");
  });
}

bind();
renderStageChips();
renderFields();
