const MAX_REQUESTS_PER_DAY = 20;
const USAGE_KEY = "weatherApiUsage";

export function canMakeWeatherRequest() {
  const today = new Date().toDateString();
  let usage;

  try {
    usage = JSON.parse(localStorage.getItem(USAGE_KEY)) || {
      count: 0,
      date: today,
    };
  } catch {
    usage = { count: 0, date: today };
  }

  if (usage.date !== today) {
    usage = { count: 0, date: today };
  }

  if (usage.count >= MAX_REQUESTS_PER_DAY) return false;

  usage.count += 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  return true;
}
