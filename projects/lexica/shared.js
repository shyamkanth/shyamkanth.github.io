const DB_KEY = "lexica_words";
const LOG_KEY = "lexica_log";
const PROFILE_KEY = "lexica_profile";

function getWords() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWords(words) {
  localStorage.setItem(DB_KEY, JSON.stringify(words));
}

function getLogs() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLogs(logs) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 500)));
}

function getProfile() {
  try {
    return (
      JSON.parse(localStorage.getItem(PROFILE_KEY)) || {
        name: "Lexicographer",
        title: "Word Collector",
      }
    );
  } catch {
    return { name: "Lexicographer", title: "Word Collector" };
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function addLog(action, detail, type = "add") {
  const logs = getLogs();
  logs.unshift({
    id: Date.now(),
    action,
    detail,
    type,
    timestamp: new Date().toISOString(),
  });
  saveLogs(logs);
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getWeekStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function getWordsThisWeek() {
  const weekStart = getWeekStart();
  return getWords().filter((w) => new Date(w.createdAt) >= weekStart).length;
}

function getFavoriteCount() {
  return getWords().filter((w) => w.favorite).length;
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getLogIcon(type) {
  const map = {
    add: "bookmark_add",
    edit: "edit",
    delete: "delete",
    export: "download",
    import: "upload",
    fav: "star",
    unfav: "star_border",
    profile: "person",
  };
  return map[type] || "info";
}

function getLogDotClass(type) {
  const map = {
    edit: "edit",
    delete: "delete",
    export: "export",
    import: "export",
    fav: "fav",
    unfav: "fav",
  };
  return map[type] || "";
}

function renderActivityItems(logs, limit = 10) {
  if (!logs.length)
    return '<div style="text-align:center;padding:32px;color:var(--text-muted);font-size:13px;">No activity yet</div>';
  return logs
    .slice(0, limit)
    .map(
      (log) => `
    <div class="activity-item">
      <div class="activity-dot ${getLogDotClass(log.type)}"></div>
      <div class="activity-content">
        <div class="activity-title">${escapeHtml(log.action)}</div>
        <div class="activity-sub">${escapeHtml(log.detail)}</div>
      </div>
      <div class="activity-time">${timeAgo(log.timestamp)}</div>
    </div>
  `,
    )
    .join("");
}

function getCategoryColor(cat) {
  const map = {
    noun: "noun",
    verb: "verb",
    adjective: "adjective",
    adverb: "adverb",
  };
  return map[(cat || "").toLowerCase()] || "custom";
}
