window.SURVEY_API = "";
window.SURVEY_DEMO = true;
function surveyApi(path) {
  const base = (window.SURVEY_API || "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : "/" + path;
  return base ? base + p : p;
}
window.surveyApi = surveyApi;
