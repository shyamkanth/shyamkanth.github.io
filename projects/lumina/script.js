const UNIT_CATALOGUE = [
  {
    group: "⏱ Time",
    units: [
      { value: "mins", label: "Minutes (mins)" },
      { value: "hours", label: "Hours (hrs)" },
    ],
  },
  {
    group: "💧 Volume",
    units: [
      { value: "L", label: "Litres (L)" },
      { value: "ml", label: "Millilitres (ml)" },
      { value: "glasses", label: "Glasses" },
      { value: "cups", label: "Cups" },
    ],
  },
  {
    group: "📏 Distance",
    units: [
      { value: "km", label: "Kilometres (km)" },
      { value: "miles", label: "Miles" },
      { value: "steps", label: "Steps" },
      { value: "m", label: "Metres (m)" },
    ],
  },
  {
    group: "🏋 Exercise",
    units: [
      { value: "reps", label: "Reps" },
      { value: "sets", label: "Sets" },
      { value: "calories", label: "Calories (kcal)" },
    ],
  },
  {
    group: "📚 Content",
    units: [
      { value: "pages", label: "Pages" },
      { value: "chapters", label: "Chapters" },
      { value: "words", label: "Words" },
    ],
  },
  {
    group: "🚫 Avoidance",
    units: [
      { value: "days_free", label: "Days cigarette-free" },
      { value: "days_sober", label: "Days alcohol-free" },
      { value: "urges", label: "Urges resisted" },
      { value: "days_clean", label: "Days clean (any habit)" },
    ],
  },
  {
    group: "✅ Completion",
    units: [
      { value: "times", label: "Times done" },
      { value: "sessions", label: "Sessions" },
      { value: "percent", label: "Percent (%)" },
    ],
  },
];

const ALL_UNITS = UNIT_CATALOGUE.flatMap((g) => g.units);

function buildUnitOptions(selectedValue) {
  return UNIT_CATALOGUE.map(
    (group) =>
      `<optgroup label="${group.group}">${group.units
        .map(
          (u) =>
            `<option value="${u.value}"${u.value === selectedValue ? " selected" : ""}>${u.label}</option>`,
        )
        .join("")}</optgroup>`,
  ).join("");
}

function getUnitLabel(value) {
  const u = ALL_UNITS.find((u) => u.value === value);
  return u ? u.value : value || "";
}


const Store = {
  KEYS: {
    HABITS: "lumina_habits",
    LOGS: "lumina_logs",
    JOURNAL: "lumina_journal",
    CHECKINS: "lumina_checkins",
    USER: "lumina_user",
    ACTIVITY_LOG: "lumina_activity_log",
  },

  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getHabits() {
    return this.get(this.KEYS.HABITS) || [];
  },
  saveHabits(habits) {
    this.set(this.KEYS.HABITS, habits);
  },
  addHabit(habit) {
    const habits = this.getHabits();
    habit.id = "h" + Date.now();
    habit.createdAt = Date.now();
    habit.current = 0;
    habits.push(habit);
    this.saveHabits(habits);
    ActivityLog.push("habit_added", `Added habit: "${habit.name}"`);
    return habit;
  },
  deleteHabit(id) {
    const habit = this.getHabits().find((h) => h.id === id);
    this.saveHabits(this.getHabits().filter((h) => h.id !== id));
    this.set(this.KEYS.LOGS, this.getLogs().filter((l) => l.habitId !== id));
    const all = this.getCheckins();
    Object.keys(all).forEach((date) => { delete all[date][id]; });
    this.set(this.KEYS.CHECKINS, all);
    if (habit)
      ActivityLog.push("habit_deleted", `Deleted habit: "${habit.name}"`);
  },
  updateHabit(id, updates) {
    const habits = this.getHabits().map((h) =>
      h.id === id ? { ...h, ...updates } : h,
    );
    this.saveHabits(habits);
    const h = habits.find((h) => h.id === id);
    if (h) ActivityLog.push("habit_updated", `Updated habit: "${h.name}"`);
  },

  getCheckins() {
    return this.get(this.KEYS.CHECKINS) || {};
  },
  getTodayKey() {
    return new Date().toISOString().split("T")[0];
  },
  getTodayCheckins() {
    return this.getCheckins()[this.getTodayKey()] || {};
  },
  toggleCheckin(habitId) {
    const all = this.getCheckins(),
      today = this.getTodayKey();
    if (!all[today]) all[today] = {};
    all[today][habitId] = !all[today][habitId];
    if (!all[today][habitId]) delete all[today][habitId];
    this.set(this.KEYS.CHECKINS, all);
    const h = this.getHabits().find((h) => h.id === habitId);
    ActivityLog.push(
      "checkin",
      all[today][habitId]
        ? `Checked in: "${h ? h.name : habitId}"`
        : `Unchecked: "${h ? h.name : habitId}"`,
    );
    return all[today][habitId] || false;
  },

  getHabitProgressForDate(habitId, dateString) {
    const logs = this.getLogs();
    const targetDate = dateString.split("T")[0];
    let total = 0;
    for (const log of logs) {
      if (log.habitId === habitId && log.date.split("T")[0] === targetDate) {
        total += Number(log.duration) || 0;
      }
    }
    return total;
  },

  updateCheckinStatusForDate(habitId, dateString) {
    const habit = this.getHabits().find(h => h.id === habitId);
    if (!habit) return;
    
    if (!habit.target || habit.target <= 0) return;
    
    const targetDate = dateString.split("T")[0];
    const total = this.getHabitProgressForDate(habitId, targetDate);
    const isComplete = total >= habit.target;
    
    const all = this.getCheckins();
    if (!all[targetDate]) all[targetDate] = {};
    
    if (isComplete) {
      all[targetDate][habitId] = true;
    } else {
      delete all[targetDate][habitId];
    }
    this.set(this.KEYS.CHECKINS, all);
  },

  getLogs() {
    return this.get(this.KEYS.LOGS) || [];
  },
  addLog(log) {
    const logs = this.getLogs();
    log.id = "l" + Date.now();
    logs.unshift(log);
    this.set(this.KEYS.LOGS, logs);
    const h = this.getHabits().find((h) => h.id === log.habitId);
    ActivityLog.push(
      "session_logged",
      `Logged ${log.duration} ${log.unit || "mins"} for "${h ? h.name : "habit"}"`,
    );
    return log;
  },
  deleteLog(id) {
    const logs = this.getLogs();
    const log = logs.find(l => l.id === id);
    if (!log) return;
    
    this.set(
      this.KEYS.LOGS,
      logs.filter(l => l.id !== id),
    );
    ActivityLog.push("session_deleted", "Deleted a session log");
    this.updateCheckinStatusForDate(log.habitId, log.date);
  },

  getJournalEntries() {
    return this.get(this.KEYS.JOURNAL) || [];
  },
  addJournalEntry(entry) {
    const entries = this.getJournalEntries();
    entry.id = "j" + Date.now();
    entry.date = new Date().toISOString();
    entry.time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    entries.unshift(entry);
    this.set(this.KEYS.JOURNAL, entries);
    ActivityLog.push(
      "journal_saved",
      `Saved journal entry (mood: ${entry.mood || "none"})`,
    );
    return entry;
  },

  getUser() {
    return this.get(this.KEYS.USER) || null;
  },
  saveUser(user) {
    const isNew = !this.getUser();
    this.set(this.KEYS.USER, user);
    ActivityLog.push(
      "profile_updated",
      isNew
        ? `Created profile: "${user.name}"`
        : `Updated profile: "${user.name}"`,
    );
  },

  getStreak() {
    const checkins = this.getCheckins(),
      habits = this.getHabits();
    if (!habits.length) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const day = checkins[key] || {};
      if (Object.values(day).some(Boolean)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  },
  getDailyCompletion() {
    const tc = this.getTodayCheckins(),
      habits = this.getHabits();
    if (!habits.length) return 0;
    
    let totalPct = 0;
    const today = new Date().toISOString();
    
    habits.forEach(h => {
      if (!h.target || h.target <= 0) {
        totalPct += tc[h.id] ? 100 : 0;
      } else {
        const current = this.getHabitProgressForDate(h.id, today);
        totalPct += Math.min(100, Math.round((current / h.target) * 100));
      }
    });

    return Math.round(totalPct / habits.length);
  },
  getHeatmapData() {
    const checkins = this.getCheckins(),
      result = {};
    for (let i = 0; i < 371; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const count = Object.values(checkins[key] || {}).filter(Boolean).length;
      result[key] =
        count === 0 ? 0 : count <= 1 ? 1 : count <= 2 ? 2 : count <= 3 ? 3 : 4;
    }
    return result;
  },
  getWeeklyData() {
    const checkins = this.getCheckins(),
      habits = this.getHabits();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    if (!habits.length) {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { label: days[d.getDay()], pct: 0 };
      });
    }
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split("T")[0];
      const dayCheckins = checkins[key] || {};
      let totalPct = 0;
      habits.forEach((h) => {
        if (!h.target || h.target <= 0) {
          totalPct += dayCheckins[h.id] ? 100 : 0;
        } else {
          const progress = this.getHabitProgressForDate(h.id, key);
          totalPct += Math.min(100, Math.round((progress / h.target) * 100));
        }
      });
      return {
        label: days[d.getDay()],
        pct: Math.round(totalPct / habits.length),
      };
    });
  },

  exportAll() {
    const data = { _exported_at: new Date().toISOString(), _version: "2" };
    Object.values(this.KEYS).forEach((key) => {
      data[key] = this.get(key);
    });
    ActivityLog.push("data_exported", "Exported all data as JSON");
    data[this.KEYS.ACTIVITY_LOG] = ActivityLog.getAll();
    return data;
  },
  importAll(data) {
    Object.values(this.KEYS).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null)
        this.set(key, data[key]);
    });
    ActivityLog.push("data_imported", "Imported data from JSON file");
  },
};


const ActivityLog = {
  KEY: "lumina_activity_log",
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },
  push(type, msg) {
    const all = this.getAll();
    all.unshift({ type, msg, ts: Date.now() });
    localStorage.setItem(this.KEY, JSON.stringify(all.slice(0, 500)));
  },
  formatEntry(entry) {
    const icons = {
      habit_added: "add_circle",
      habit_deleted: "remove_circle",
      habit_updated: "edit",
      checkin: "check_circle",
      session_logged: "bolt",
      session_deleted: "delete",
      journal_saved: "book",
      profile_updated: "person",
      data_exported: "download",
      data_imported: "upload",
      page_visit: "open_in_new",
    };
    const colors = {
      habit_added: "#a4ffb9",
      habit_deleted: "#ff716c",
      habit_updated: "#7de6ff",
      checkin: "#a4ffb9",
      session_logged: "#73fbbc",
      session_deleted: "#ff716c",
      journal_saved: "#7de6ff",
      profile_updated: "#a4ffb9",
      data_exported: "#73fbbc",
      data_imported: "#7de6ff",
      page_visit: "#474847",
    };
    return {
      icon: icons[entry.type] || "info",
      color: colors[entry.type] || "#aaaba9",
      time: new Date(entry.ts).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      msg: entry.msg,
    };
  },
};


function showToast(message, isError = false) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " error" : ""}`;
  toast.innerHTML = `<span class="material-symbols-outlined toast-icon" style="font-size:18px">${isError ? "error" : "check_circle"}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}


function showConfirm({
  title,
  body,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
}) {
  const ex = document.getElementById("lumina-confirm");
  if (ex) ex.remove();
  const el = document.createElement("div");
  el.id = "lumina-confirm";
  el.className =
    "fixed inset-0 z-[9999] flex items-center justify-center bg-black/70";
  el.style.backdropFilter = "blur(4px)";
  el.innerHTML = `<div style="background:#1e201f;border-radius:1.25rem;padding:2rem;width:100%;max-width:22rem;margin:0 1rem;border:1px solid rgba(71,72,71,0.4);box-shadow:0 25px 60px rgba(0,0,0,0.6)" class="space-y-4">
    <h3 style="font-size:1.2rem;font-weight:800;color:#f7f6f4">${title}</h3>
    <p style="color:#aaaba9;font-size:0.875rem;line-height:1.6">${body}</p>
    <div style="display:flex;gap:0.75rem;padding-top:0.5rem">
      <button id="confirm-cancel" style="flex:1;padding:0.75rem;border-radius:0.875rem;background:#242625;color:#aaaba9;font-weight:600;border:none;cursor:pointer">Cancel</button>
      <button id="confirm-ok" style="flex:1;padding:0.75rem;border-radius:0.875rem;font-weight:700;border:none;cursor:pointer;${danger ? "background:#ff716c;color:#fff" : "background:#a4ffb9;color:#006531"}">${confirmLabel}</button>
    </div>
  </div>`;
  document.body.appendChild(el);
  document.getElementById("confirm-cancel").onclick = () => el.remove();
  document.getElementById("confirm-ok").onclick = () => {
    el.remove();
    onConfirm();
  };
  el.addEventListener("click", (e) => {
    if (e.target === el) el.remove();
  });
}


function formatRelativeDate(isoString) {
  const date = new Date(isoString),
    now = new Date();
  const diff = Math.floor((now - date) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getColorClass(color) {
  const map = {
    primary:    { bg: "rgba(164,255,185,0.1)",  text: "#a4ffb9", bar: "#a4ffb9" },
    tertiary:   { bg: "rgba(125,230,255,0.1)",  text: "#7de6ff", bar: "#7de6ff" },
    error:      { bg: "rgba(255,113,108,0.12)", text: "#ff716c", bar: "#ff716c" },
    secondary:  { bg: "rgba(115,251,188,0.1)",  text: "#73fbbc", bar: "#73fbbc" },
    lavender:   { bg: "rgba(216,180,254,0.12)", text: "#d8b4fe", bar: "#d8b4fe" },
    gold:       { bg: "rgba(253,224,71,0.12)",  text: "#fde047", bar: "#fde047" },
    azure:      { bg: "rgba(56,189,248,0.12)",  text: "#38bdf8", bar: "#38bdf8" },
    rose:       { bg: "rgba(251,161,27,0.12)",  text: "#fba11b", bar: "#fba11b" },
    indigo:     { bg: "rgba(129,140,248,0.12)", text: "#818cf8", bar: "#818cf8" },
    emerald:    { bg: "rgba(52,211,153,0.12)",  text: "#34d399", bar: "#34d399" },
    fuchsia:    { bg: "rgba(232,121,249,0.12)", text: "#e879f9", bar: "#e879f9" },
    tangerine:  { bg: "rgba(251,146,60,0.12)",  text: "#fb923c", bar: "#fb923c" },
    ruby:       { bg: "rgba(244,63,94,0.12)",   text: "#f43f5e", bar: "#f43f5e" },
    teal:       { bg: "rgba(45,212,191,0.12)",  text: "#2dd4bf", bar: "#2dd4bf" },
    violet:     { bg: "rgba(167,139,250,0.12)", text: "#a78bfa", bar: "#a78bfa" },
    lime:       { bg: "rgba(163,230,53,0.12)",  text: "#a3e635", bar: "#a3e635" },
    chartreuse: { bg: "rgba(190,242,100,0.12)", text: "#bef264", bar: "#bef264" },
    peach:      { bg: "rgba(253,186,116,0.12)", text: "#fdba74", bar: "#fdba74" },
    amethyst:   { bg: "rgba(192,132,252,0.12)", text: "#c084fc", bar: "#c084fc" },
    cerulean:   { bg: "rgba(14,165,233,0.12)",  text: "#0ea5e9", bar: "#0ea5e9" },
  };
  return map[color] || map.primary;
}


function initDesktopNav(activePage) {
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    let page = "dashboard";
    if (href.includes("habit")) page = "habit";
    else if (href.includes("stats")) page = "stats";
    else if (href.includes("settings")) page = "settings";
    if (page === activePage) {
      link.classList.remove("text-emerald-500/50", "hover:text-emerald-400");
      link.classList.add(
        "text-[#00FF87]",
        "border-b-2",
        "border-[#00FF87]",
        "pb-1",
        "font-semibold",
      );
    }
  });
}


function buildMobileNav(activePage) {
  const isRoot = activePage === "dashboard";
  const base = isRoot ? "" : "../";
  const items = [
    {
      page: "dashboard",
      href: `${base}index.html`,
      icon: "dashboard",
      label: "Home",
    },
    {
      page: "habit",
      href: `${base}habit/index.html`,
      icon: "self_improvement",
      label: "Habits",
    },
    {
      page: "stats",
      href: `${base}stats/index.html`,
      icon: "bar_chart",
      label: "Stats",
    },
    {
      page: "settings",
      href: `${base}settings/index.html`,
      icon: "settings",
      label: "Settings",
    },
  ];
  const nav = document.getElementById("mobile-bottom-nav");
  if (!nav) return;
  nav.innerHTML = items
    .map((item) => {
      const active = item.page === activePage;
      return `<a href="${item.href}" class="flex flex-col items-center gap-1 ${active ? "text-[#00FF87]" : "text-emerald-500/50"}">
      <span class="material-symbols-outlined" style="font-variation-settings:'FILL' ${active ? 1 : 0},wght 400,GRAD 0,opsz 24">${item.icon}</span>
      <span class="text-[10px] font-semibold">${item.label}</span>
    </a>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  let page = "Dashboard";
  if (path.includes("habit")) page = "Habits";
  else if (path.includes("stats")) page = "Stats";
  else if (path.includes("settings")) page = "Settings";
  // ActivityLog.push("page_visit", `Visited ${page} page`);
});


class CustomSelect {
  constructor(originalSelect) {
    if (originalSelect.__lumina_init) return;
    originalSelect.__lumina_init = true;
    this.originalSelect = originalSelect;
    this.customSelect = document.createElement("div");
    
    const originalClasses = this.originalSelect.getAttribute("class");
    if (originalClasses) {
      this.customSelect.setAttribute("class", originalClasses);
    }
    this.customSelect.classList.add("lumina-custom-select");

    this.selectedDisplay = document.createElement("div");
    this.selectedDisplay.classList.add("lumina-select-display");
    
    this.dropdown = document.createElement("div");
    this.dropdown.classList.add("lumina-select-dropdown");

    this.customSelect.appendChild(this.selectedDisplay);
    this.customSelect.appendChild(this.dropdown);
    
    this.originalSelect.style.display = "none";
    this.originalSelect.parentNode.insertBefore(this.customSelect, this.originalSelect.nextSibling);

    this.isOpen = false;

    this.selectedDisplay.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    document.addEventListener("click", () => {
      this.closeDropdown();
    });

    this.render();

    const observer = new MutationObserver(() => {
      this.render();
    });
    observer.observe(this.originalSelect, { childList: true, subtree: true });
    
    this.originalSelect.addEventListener("change", () => {
      this.updateDisplay();
    });
  }

  toggleDropdown() {
    document.querySelectorAll(".lumina-select-dropdown.open").forEach(d => {
      if (d !== this.dropdown) {
        d.classList.remove("open");
        let p = d.closest('.lumina-custom-select').closest('.fade-in-up, section > div, aside > div');
        if (p) {
          p.style.zIndex = "";
          p.style.position = "";
        }
      }
    });

    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.dropdown.classList.add("open");
      this.scrollActiveToView();

      let parent = this.customSelect.closest('.fade-in-up, section > div, aside > div');
      if (parent) {
        const computed = getComputedStyle(parent);
        if (computed.position === 'static') {
          parent.style.position = 'relative';
        }
        parent.style.zIndex = "50";
      }
    } else {
      this.dropdown.classList.remove("open");
      let parent = this.customSelect.closest('.fade-in-up, section > div, aside > div');
      if (parent) {
        parent.style.zIndex = "";
        parent.style.position = "";
      }
    }
  }

  closeDropdown() {
    this.isOpen = false;
    this.dropdown.classList.remove("open");
    let parent = this.customSelect.closest('.fade-in-up, section > div, aside > div');
    if (parent) {
      parent.style.zIndex = "";
      parent.style.position = "";
    }
  }

  updateDisplay() {
    const selectedOption = this.originalSelect.options[this.originalSelect.selectedIndex];
    const text = selectedOption ? selectedOption.text : "";
    this.selectedDisplay.innerHTML = `<span class="truncate pr-2">${text}</span><span class="material-symbols-outlined shrink-0" style="font-size:22px;color:rgba(164,255,185,0.8)">expand_more</span>`;
    
    const items = this.dropdown.querySelectorAll('.lumina-option');
    items.forEach(item => {
      if (item.dataset.value === this.originalSelect.value) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  scrollActiveToView() {
    const active = this.dropdown.querySelector('.lumina-option.selected');
    if (active) {
      active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  render() {
    this.dropdown.innerHTML = "";
    
    Array.from(this.originalSelect.children).forEach(child => {
      if (child.tagName === "OPTGROUP") {
        const groupLabel = document.createElement("div");
        groupLabel.classList.add("lumina-optgroup-label");
        groupLabel.textContent = child.label;
        this.dropdown.appendChild(groupLabel);
        
        Array.from(child.children).forEach(option => {
          this.createOptionElement(option);
        });
      } else if (child.tagName === "OPTION") {
        this.createOptionElement(child);
      }
    });

    this.updateDisplay();
  }

  createOptionElement(option) {
    const optDiv = document.createElement("div");
    optDiv.classList.add("lumina-option");
    optDiv.textContent = option.text;
    optDiv.dataset.value = option.value;
    
    if (option.selected) {
      optDiv.classList.add("selected");
    }

    optDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      this.originalSelect.value = option.value;
      this.originalSelect.dispatchEvent(new Event("change"));
      this.closeDropdown();
      this.updateDisplay();
    });

    this.dropdown.appendChild(optDiv);
  }
}

function initAllCustomSelects() {
  document.querySelectorAll("select").forEach(select => {
    if (!select.dataset.customSelectInit) {
      select.dataset.customSelectInit = "true";
      new CustomSelect(select);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initAllCustomSelects, 0);
});
