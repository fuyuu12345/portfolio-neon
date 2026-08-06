/**
 * 作品集 Demo：优先读本地 survey-config.json，不依赖腾讯云 / Workers。
 * 正式收集问卷请用独立项目「女性主义文创调研」部署。
 */
window.SURVEY_DEMO = true;
window.SURVEY_DEFAULT = null;

async function loadSurveyConfig() {
  const tryUrls = ["survey-config.json", "./survey-config.json"];
  for (const url of tryUrls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      if (!data || !Array.isArray(data.questions)) continue;
      window.SURVEY_META = data.meta || {};
      window.SURVEY_QUESTIONS = data.questions;
      return data;
    } catch (e) {
      /* try next */
    }
  }
  if (window.SURVEY_DEFAULT) {
    window.SURVEY_META = window.SURVEY_DEFAULT.meta || {};
    window.SURVEY_QUESTIONS = window.SURVEY_DEFAULT.questions || [];
    return window.SURVEY_DEFAULT;
  }
  throw new Error("demo config missing");
}

window.loadSurveyConfig = loadSurveyConfig;
