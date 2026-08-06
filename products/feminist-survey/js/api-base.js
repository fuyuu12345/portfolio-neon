window.SURVEY_API = window.SURVEY_API || "https://feminist-survey.lorde200071.workers.dev";
function surveyApi(path) {
  const base = (window.SURVEY_API || "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : "/" + path;
  return base + p;
}
window.surveyApi = surveyApi;
