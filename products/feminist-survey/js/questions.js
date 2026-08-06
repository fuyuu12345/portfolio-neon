/** 默认问卷（仅作离线兜底；实际以 /api/config 与 data/survey-config.json 为准） */
window.SURVEY_DEFAULT = null;

async function loadSurveyConfig() {
  try {
    const res = await fetch("/api/config", { cache: "no-store" });
    if (!res.ok) throw new Error("config http " + res.status);
    const data = await res.json();
    if (!data || !Array.isArray(data.questions)) throw new Error("bad config");
    window.SURVEY_META = data.meta || {};
    window.SURVEY_QUESTIONS = data.questions;
    return data;
  } catch (err) {
    if (window.SURVEY_DEFAULT) {
      window.SURVEY_META = window.SURVEY_DEFAULT.meta || {};
      window.SURVEY_QUESTIONS = window.SURVEY_DEFAULT.questions || [];
      return window.SURVEY_DEFAULT;
    }
    throw err;
  }
}

window.loadSurveyConfig = loadSurveyConfig;
