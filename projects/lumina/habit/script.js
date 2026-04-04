const TIPS = [
  "Focus on the sound of your breath for the first 5 minutes to ground your energy.",
  "Even 5 minutes done consistently beats an hour done sporadically.",
  "Link a new habit to an existing one — after coffee → meditate.",
  "Feeling resistance? Lower the bar. 2 pages counts. Show up.",
  "Your environment shapes you. Set your space up the night before.",
  "The urge to skip is temporary. The regret lasts longer.",
  "For avoidance habits: each day free is a victory. Log it.",
];

const MILESTONES = [
  {
    icon: "military_tech",
    color: "text-primary",
    label: "First Week",
    days: 7,
  },
  {
    icon: "energy_savings_leaf",
    color: "text-tertiary",
    label: "Early Bird",
    days: 3,
  },
  { icon: "favorite", color: "text-error", label: "Habit Heart", days: 10 },
  { icon: "diamond", color: "text-primary", label: "30 Days", days: 30 },
  { icon: "whatshot", color: "text-error", label: "Inferno", days: 60 },
  { icon: "groups", color: "text-tertiary", label: "Mentor", days: 90 },
];

const ZEN_LEVELS = [
  { label: "Rank I", sessions: 0 },
  { label: "Rank II", sessions: 5 },
  { label: "Rank III", sessions: 15 },
  { label: "Rank IV", sessions: 30 },
  { label: "Rank V", sessions: 60 },
  { label: "Sage", sessions: 100 },
];

let selectedIntensity = "Optimal";

document.addEventListener("DOMContentLoaded", () => {
  initDesktopNav("habit");
  buildMobileNav("habit");
  populateHabitSelect();
  renderStats();
  renderSessionHistory();
  renderMilestones();
  renderDailyTip();
  initForm();
  initHistoryModal();
  const d = document.getElementById("log-date");
  if (d) d.value = new Date().toISOString().split("T")[0];
});


function populateHabitSelect() {
  const select = document.getElementById("habit-select");
  if (!select) return;
  const habits = Store.getHabits();

  if (!habits.length) {
    select.innerHTML =
      '<option value="">No habits yet — add one in Settings</option>';
    updateFocusHeader(null);
    return;
  }

  select.innerHTML =
    '<option value="">— Choose a habit to log —</option>' +
    habits.map((h) => `<option value="${h.id}">${h.name}</option>`).join("");

  select.addEventListener("change", () => {
    const habit = Store.getHabits().find((h) => h.id === select.value);
    updateFocusHeader(habit || null);
    if (habit) updateLogUnitForHabit(habit);
  });

  new CustomSelect(select);

  updateLogUnit("mins");
}

function updateFocusHeader(habit) {
  const nameEl = document.getElementById("focus-habit-name");
  const iconEl = document.getElementById("focus-icon");
  const descEl = document.getElementById("focus-habit-desc");

  if (!habit) {
    if (nameEl) nameEl.textContent = "Select a Habit";
    if (descEl) descEl.textContent = "Choose a habit above to start logging.";
    return;
  }
  if (nameEl) nameEl.textContent = habit.name;
  if (iconEl) iconEl.textContent = habit.icon;
  if (descEl)
    descEl.textContent = `Target: ${habit.target} ${getUnitLabel(habit.unit)} · ${habit.frequency}`;

  const current = Store.getHabitProgressForDate(habit.id, new Date().toISOString());
  const pct =
    habit.target > 0
      ? Math.min(100, Math.round((current / habit.target) * 100))
      : 0;
  const pctEl = document.getElementById("global-pct");
  const barEl = document.getElementById("global-progress-bar");
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (barEl) barEl.style.width = `${pct}%`;
}

function updateLogUnitForHabit(habit) {
  updateLogUnit(habit.unit || "mins");
}

function updateLogUnit(selectedUnit) {
  const sel = document.getElementById("log-unit");
  if (!sel) return;
  sel.innerHTML = buildUnitOptions(selectedUnit);

  new CustomSelect(sel);
}


function renderStats() {
  const streak = Store.getStreak();
  const logs = Store.getLogs();
  const sessions = logs.length;

  const streakEl = document.getElementById("streak-title");
  const sessionsEl = document.getElementById("total-sessions");
  const zenEl = document.getElementById("zen-level");

  if (streakEl) streakEl.textContent = `${streak}-Day Streak`;
  if (sessionsEl) sessionsEl.textContent = sessions;

  let zenLabel = ZEN_LEVELS[0].label;
  for (const lvl of ZEN_LEVELS) {
    if (sessions >= lvl.sessions) zenLabel = lvl.label;
  }
  if (zenEl) zenEl.textContent = zenLabel;
}


function renderSessionHistory() {
  const container = document.getElementById("session-history");
  if (!container) return;
  const logs = Store.getLogs();
  const habits = Store.getHabits();

  if (!logs.length) {
    container.innerHTML = `<div class="empty-state bg-surface-container-low rounded-lg py-10"><span class="material-symbols-outlined">history</span><p class="text-sm mt-2">No sessions logged yet</p></div>`;
    return;
  }

  container.innerHTML = logs
    .slice(0, 8)
    .map((log, i) => {
      const habit = habits.find((h) => h.id === log.habitId);
      const colors = getColorClass(habit?.color || "primary");
      const relD = formatRelativeDate(log.date);
      const time = new Date(log.date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      const isLast = i === 0;
      return `
      <div class="session-row bg-surface-container-low p-4 flex items-center justify-between rounded-DEFAULT ${isLast ? "border-l-4 border-primary/50" : "border-l-4 border-transparent opacity-75"}">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0" style="color:${colors.text}">
            <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">${isLast ? "check_circle" : "history"}</span>
          </div>
          <div>
            <div class="font-bold text-sm">${relD}, ${time}</div>
            <div class="text-xs text-on-surface-variant">${log.intensity || "—"} · ${log.duration} ${log.unit || "mins"}${habit ? " · " + habit.name : ""}</div>
          </div>
        </div>
        <button onclick="handleDeleteLog('${log.id}')" class="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors cursor-pointer text-xl shrink-0">delete</button>
      </div>`;
    })
    .join("");
}

window.handleDeleteLog = function (id) {
  const habitId = document.getElementById("habit-select")?.value;
  Store.deleteLog(id);
  renderSessionHistory();
  renderStats();
  if (habitId) {
    const habit = Store.getHabits().find((h) => h.id === habitId);
    if (habit) updateFocusHeader(habit);
  }
  showToast("Session removed");
};


function renderMilestones() {
  const grid = document.getElementById("milestone-grid");
  if (!grid) return;
  const streak = Store.getStreak();
  grid.innerHTML = MILESTONES.map((m) => {
    const unlocked = streak >= m.days;
    return `
      <div class="milestone-item aspect-square rounded-DEFAULT bg-surface-container-high flex flex-col items-center justify-center p-2 text-center border border-outline-variant/10 ${unlocked ? "" : "achievement-locked"}">
        <span class="material-symbols-outlined ${unlocked ? m.color : "text-on-surface-variant"} mb-1 text-lg" style="font-variation-settings:'FILL' ${unlocked ? 1 : 0}">${m.icon}</span>
        <span class="text-[9px] leading-tight font-semibold">${unlocked ? m.label : "🔒 " + m.days + "d"}</span>
      </div>`;
  }).join("");
}


function renderDailyTip() {
  const el = document.getElementById("daily-tip");
  if (el) el.textContent = TIPS[new Date().getDay() % TIPS.length];
}


function initForm() {
  document.querySelectorAll(".intensity-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll(".intensity-chip")
        .forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      selectedIntensity = chip.dataset.intensity;
    });
    if (chip.dataset.intensity === "Optimal") chip.classList.add("selected");
  });

  document.getElementById("log-submit-btn")?.addEventListener("click", () => {
    const habitId = document.getElementById("habit-select")?.value;
    const date = document.getElementById("log-date")?.value;
    const duration = document.getElementById("log-duration")?.value;
    const unit = document.getElementById("log-unit")?.value || "mins";
    const notes = document.getElementById("log-notes")?.value?.trim();

    if (!habitId) {
      showToast("Please select a habit first", true);
      return;
    }
    if (!duration || parseInt(duration) < 1) {
      showToast("Enter a valid amount", true);
      return;
    }

    Store.addLog({
      habitId,
      date: (() => {
        if (!date) return new Date().toISOString();
        const [y, m, d] = date.split("-").map(Number);
        const now = new Date();
        return new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
      })(),
      duration: parseInt(duration),
      unit,
      intensity: selectedIntensity,
      notes,
    });

    Store.updateCheckinStatusForDate(habitId, date || new Date().toISOString());

    document.getElementById("log-duration").value = "";
    document.getElementById("log-notes").value = "";
    renderSessionHistory();
    renderStats();
    renderMilestones();
    updateFocusHeader(Store.getHabits().find(h => h.id === habitId));
    showToast("Session logged! 🌟");
  });
}

function initHistoryModal() {
  const btn = document.getElementById("view-all-history-btn");
  const modal = document.getElementById("history-modal");
  const close = document.getElementById("close-history-modal");
  const feed = document.getElementById("history-modal-feed");

  if (!btn || !modal) return;

  btn.onclick = () => {
    modal.classList.remove("hidden");
    const logs = Store.getLogs().sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    const habits = Store.getHabits();

    if (!logs.length) {
      feed.innerHTML =
        "<p class='text-on-surface-variant text-sm'>No logs found.</p>";
      return;
    }

    feed.innerHTML = logs
      .map((log) => {
        const habit = habits.find((h) => h.id === log.habitId);
        const relD = formatRelativeDate(log.date);
        const time = new Date(log.date).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        return `
      <div class="p-4 md:p-5 hover:bg-surface-container-high/30 rounded-[16px] transition-colors group relative">
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-2">
             <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-primary" style="font-size:16px">${habit?.icon || "history"}</span>
             </div>
            <span class="text-xs font-extrabold text-on-surface-variant uppercase tracking-widest">${relD}</span>
          </div>
          <span class="text-xs font-mono text-on-surface-variant/50">${time}</span>
        </div>
        <div class="ml-[2.6rem]">
          <div class="flex items-center justify-between gap-2 mb-1">
            <p class="text-sm md:text-base font-bold text-on-surface">${habit?.name || "Deleted Habit"}</p>
            <button onclick="handleDeleteLogFromModal('${log.id}', this)" class="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors cursor-pointer text-lg">delete</button>
          </div>
          <p class="text-xs md:text-sm text-on-surface-variant leading-relaxed">
            Logged <span class="text-primary font-bold">${log.duration} ${log.unit || "mins"}</span> with <span class="text-on-surface font-medium">${log.intensity || "Normal"}</span> intensity.
          </p>
          ${log.notes ? `<p class="mt-2 text-xs italic text-on-surface-variant/70 border-l-2 border-outline-variant/30 pl-3">"${log.notes}"</p>` : ""}
        </div>
      </div>`;
      })
      .join(
        '<div class="h-px w-full bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent my-1"></div>',
      );
  };

  close.onclick = () => modal.classList.add("hidden");
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
}

window.handleDeleteLogFromModal = function (id, btn) {
  const habitId = document.getElementById("habit-select")?.value;
  Store.deleteLog(id);
  renderSessionHistory();
  renderStats();
  if (habitId) {
    const habit = Store.getHabits().find((h) => h.id === habitId);
    if (habit) updateFocusHeader(habit);
  }
  const viewBtn = document.getElementById("view-all-history-btn");
  if (viewBtn) viewBtn.click();
  showToast("Session removed");
};
