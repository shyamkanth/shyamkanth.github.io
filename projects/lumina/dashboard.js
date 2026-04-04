document.addEventListener("DOMContentLoaded", () => {
  initDesktopNav("dashboard");
  buildMobileNav("dashboard");
  checkAndShowProfileSetup();
  renderUser();
  renderStats();
  renderHeatmap();
  renderHabits();
  renderJournalFeed();
  initJournal();
  initProfileModal();
});

function checkAndShowProfileSetup() {
  if (!Store.getUser()) {
    document.getElementById("profile-modal")?.classList.remove("hidden");
  }
}

function initProfileModal() {
  const modal = document.getElementById("profile-modal");
  const saveBtn = document.getElementById("save-profile-btn");
  const closeBtn = document.getElementById("close-profile-modal");
  const avatarBtn = document.getElementById("profile-avatar-btn");
  const nameInput = document.getElementById("profile-name-input");

  avatarBtn?.addEventListener("click", () => {
    const user = Store.getUser();
    if (user && nameInput) nameInput.value = user.name || "";
    const title = document.getElementById("profile-modal-title");
    if (title)
      title.textContent = user ? "Edit Profile" : "Set Up Your Profile";
    modal?.classList.remove("hidden");
  });

  closeBtn?.addEventListener("click", () => {
    if (!Store.getUser()) {
      showToast("Please set your name to continue", true);
      return;
    }
    modal?.classList.add("hidden");
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      if (!Store.getUser()) return;
      modal.classList.add("hidden");
    }
  });

  saveBtn?.addEventListener("click", () => {
    const name = nameInput?.value?.trim();
    if (!name) {
      showToast("Please enter your name", true);
      return;
    }
    const existing = Store.getUser() || {};
    Store.saveUser({
      ...existing,
      name,
      memberSince:
        existing.memberSince ||
        new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      tier: existing.tier || "Luminary",
    });
    modal?.classList.add("hidden");
    renderUser();
    showToast("Profile saved! 👋");
  });
}

function renderUser() {
  const user = Store.getUser();
  const nameEl = document.getElementById("user-name");
  if (nameEl) nameEl.textContent = user ? user.name : "there";
}

function renderStats() {
  const streak = Store.getStreak();
  const completion = Store.getDailyCompletion();
  const habits = Store.getHabits();

  const streakMsg = document.getElementById("streak-message");
  const pctEl = document.getElementById("completion-pct");
  const labelEl = document.getElementById("completion-label");

  if (streakMsg) {
    if (!habits.length) {
      streakMsg.textContent =
        "Add your first habit in Settings to get started!";
    } else if (streak > 0) {
      streakMsg.textContent = `You've maintained your rhythm for ${streak} day${streak !== 1 ? "s" : ""} straight. 🔥`;
    } else {
      streakMsg.textContent = "Check in to start building your streak!";
    }
  }
  if (pctEl) pctEl.textContent = `${completion}%`;
  if (labelEl) {
    labelEl.textContent =
      habits.length === 0
        ? "No habits yet"
        : completion >= 100
          ? "All done! 🎉"
          : completion >= 50
            ? "Almost there"
            : "Just started";
  }
}

function renderHeatmap() {
  const grid = document.getElementById("heatmap-grid");
  if (!grid) return;
  const heatmap = Store.getHeatmapData();
  const today = new Date();

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 363);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  grid.innerHTML = "";
  grid.style.cssText =
    "display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,12px);gap:4px;min-width:700px";

  ["", "Mon", "", "Wed", "", "Fri", ""].forEach((label) => {
    const el = document.createElement("div");
    el.className = "heatmap-label";
    el.textContent = label;
    grid.appendChild(el);
  });

  for (let i = 0; i < 7 * 53; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    const lvl = heatmap[key] ?? 0;
    const cell = document.createElement("div");
    cell.className = "heatmap-cell";
    cell.dataset.level = lvl;
    cell.title = `${key}: ${lvl > 0 ? lvl + " habit(s)" : "No activity"}`;
    grid.appendChild(cell);
  }

  const scroller = grid.closest(".overflow-x-auto");
  if (scroller) {
    requestAnimationFrame(() => {
      scroller.scrollLeft = scroller.scrollWidth;
    });
  }
}

function renderHabits() {
  const container = document.getElementById("habits-list");
  if (!container) return;
  const habits = Store.getHabits();
  const checkins = Store.getTodayCheckins();

  if (!habits.length) {
    container.innerHTML = `
      <div class="empty-state bg-surface-container-low rounded-lg py-14">
        <span class="material-symbols-outlined">add_task</span>
        <p class="font-bold mt-3 text-on-surface">No habits yet</p>
        <p class="text-sm mt-1">Head to <a href="settings/index.html" class="text-primary underline font-semibold">Settings</a> to create your first ritual</p>
      </div>`;
    return;
  }

  container.innerHTML = habits
    .map((habit) => {
      const done = !!checkins[habit.id];
      const current = Store.getHabitProgressForDate(habit.id, new Date().toISOString());
      const pct =
        habit.target > 0
          ? Math.min(100, Math.round((current / habit.target) * 100))
          : done ? 100 : 0;
      const colors = getColorClass(habit.color);
      const unitLbl = getUnitLabel(habit.unit);

      return `
      <div class="habit-card${done ? " completed" : ""} bg-surface-container-high p-4 md:p-5 rounded-lg flex items-center justify-between gap-3 transition-all" data-id="${habit.id}">
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style="background:${colors.bg}">
            <span class="material-symbols-outlined text-xl" style="color:${colors.text}">${habit.icon}</span>
          </div>
          <div>
            <h3 class="font-bold leading-tight text-sm md:text-base">${habit.name}</h3>
            <p class="text-on-surface-variant text-xs mt-0.5">
              ${done ? "✓ Done today" : habit.target > 0 ? `${current} / ${habit.target} ${unitLbl}` : ""}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <div class="hidden sm:block w-24 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
            <div class="progress-bar-fill h-full rounded-full" style="width:${pct}%;background:${colors.bar}"></div>
          </div>
          <button onclick="toggleHabit('${habit.id}')"
            class="check-btn w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${done ? "bg-primary border-primary active-pulse" : "border-outline-variant/30 hover:border-primary"}">
            <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' ${done ? 1 : 0};color:${done ? "#006531" : "transparent"}">check</span>
          </button>
        </div>
      </div>`;
    })
    .join("");
}

window.toggleHabit = function (habitId) {
  const habit = Store.getHabits().find((h) => h.id === habitId);
  if (!habit) return;
  const today = new Date().toISOString();
  let done = false;

  if (habit.target > 0) {
    const current = Store.getHabitProgressForDate(habit.id, today);
    const targetDateStr = today.split("T")[0];
    const isDone = !!(Store.getCheckins()[targetDateStr] || {})[habit.id];

    if (!isDone) {
      const remaining = habit.target - current;
      if (remaining > 0) {
        Store.addLog({
          habitId: habit.id,
          date: today,
          duration: remaining,
          unit: habit.unit || "mins",
          intensity: "Optimal",
          notes: "Quick complete",
        });
      }
      Store.updateCheckinStatusForDate(habit.id, today);
      done = true;
    } else {
      const logs = Store.getLogs().filter(l => !(l.habitId === habit.id && l.date.split("T")[0] === targetDateStr));
      Store.set(Store.KEYS.LOGS, logs);
      Store.updateCheckinStatusForDate(habit.id, today);
      ActivityLog.push("session_deleted", `Reset today's progress for "${habit.name}" \u2014 all today's logs cleared`);
      done = false;
    }
  } else {
    done = Store.toggleCheckin(habitId);
  }

  renderHabits();
  renderStats();
  showToast(done ? "Checked in! 🎉" : "Progress reset — today's logs cleared");
};

let selectedMood = null;

function initJournal() {
  document.querySelectorAll(".mood-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mood-chip").forEach((b) => {
        b.classList.remove("bg-primary/20", "text-primary");
        b.classList.add(
          "bg-surface-container-highest",
          "text-on-surface-variant",
        );
      });
      btn.classList.add("bg-primary/20", "text-primary");
      btn.classList.remove(
        "bg-surface-container-highest",
        "text-on-surface-variant",
      );
      selectedMood = btn.dataset.mood;
    });
  });

  document.getElementById("save-journal-btn")?.addEventListener("click", () => {
    const input = document.getElementById("journal-input");
    const text = input?.value?.trim();
    if (!text) {
      showToast("Write something first!", true);
      return;
    }
    Store.addJournalEntry({ text, mood: selectedMood });
    input.value = "";
    selectedMood = null;
    document.querySelectorAll(".mood-chip").forEach((b) => {
      b.classList.remove("bg-primary/20", "text-primary");
      b.classList.add(
        "bg-surface-container-highest",
        "text-on-surface-variant",
      );
    });
    renderJournalFeed();
    showToast("Journal entry saved ✨");
  });

  document.getElementById("view-all-journal-btn")?.addEventListener("click", () => {
    const modal = document.getElementById("journal-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    
    if (!modal.dataset.initialized) {
      document.getElementById("close-journal-modal")?.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
      window.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
      });
      modal.dataset.initialized = "true";
    }

    const feed = document.getElementById("journal-modal-feed");
    const entries = Store.getJournalEntries();
    if (!entries.length) {
      feed.innerHTML = "<p class='text-on-surface-variant text-sm'>No journal entries yet.</p>";
      return;
    }
    feed.innerHTML = entries
      .map(
        (entry) => `
      <div class="p-4 md:p-5 hover:bg-surface-container-high/30 rounded-[16px] transition-colors group relative">
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-2">
             <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-primary" style="font-size:12px">edit_note</span>
             </div>
            <span class="text-xs font-extrabold text-on-surface-variant uppercase tracking-widest">${formatRelativeDate(entry.date)}</span>
          </div>
          <span class="text-xs font-mono text-on-surface-variant/50">${entry.time || ""}</span>
        </div>
        <p class="text-sm md:text-base text-on-surface leading-relaxed ml-[2.1rem]">"${entry.text}"</p>
        ${entry.mood ? `<div class="ml-[2.1rem] mt-3"><span class="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider border border-primary/20 shadow-sm">${entry.mood}</span></div>` : ""}
      </div>`,
      )
      .join('<div class="h-px w-full bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent my-1"></div>');
  });
}

function renderJournalFeed() {
  const feed = document.getElementById("journal-feed");
  if (!feed) return;
  const entries = Store.getJournalEntries().slice(0, 3);
  if (!entries.length) {
    feed.innerHTML = "";
    return;
  }
  feed.innerHTML = entries
    .map(
      (entry) => `
    <div class="bg-surface-container-high/60 p-4 rounded-lg">
      <div class="flex justify-between text-xs font-bold text-on-surface-variant mb-2">
        <span>${formatRelativeDate(entry.date).toUpperCase()}</span>
        <span>${entry.time || ""}</span>
      </div>
      <p class="text-sm text-on-surface italic leading-relaxed">"${entry.text}"</p>
      ${entry.mood ? `<span class="inline-block mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">${entry.mood}</span>` : ""}
    </div>`,
    )
    .join("");
}
