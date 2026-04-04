const ICONS = [
  "water_drop",
  "self_improvement",
  "menu_book",
  "fitness_center",
  "bedtime",
  "directions_run",
  "restaurant",
  "favorite",
  "psychology",
  "spa",
  "music_note",
  "code",
  "brush",
  "science",
  "pets",
  "no_drinks",
  "smoke_free",
  "medication",
  "two_wheeler",
  "pool",
];

const COLORS = [
  { key: "primary", hex: "#a4ffb9", label: "Mint" },
  { key: "tertiary", hex: "#7de6ff", label: "Cyan" },
  { key: "error", hex: "#ff716c", label: "Coral" },
  { key: "secondary", hex: "#73fbbc", label: "Seafoam" },
  { key: "lavender", hex: "#d8b4fe", label: "Lavender" },
  { key: "gold", hex: "#fde047", label: "Gold" },
  { key: "azure", hex: "#38bdf8", label: "Azure" },
  { key: "rose", hex: "#fba11b", label: "Amber" },
  { key: "indigo", hex: "#818cf8", label: "Indigo" },
  { key: "emerald", hex: "#34d399", label: "Emerald" },
  { key: "fuchsia", hex: "#e879f9", label: "Fuchsia" },
  { key: "tangerine", hex: "#fb923c", label: "Tangerine" },
  { key: "ruby", hex: "#f43f5e", label: "Ruby" },
  { key: "teal", hex: "#2dd4bf", label: "Teal" },
  { key: "violet", hex: "#a78bfa", label: "Violet" },
  { key: "lime", hex: "#a3e635", label: "Lime" },
  { key: "chartreuse", hex: "#bef264", label: "Chartreuse" },
  { key: "peach", hex: "#fdba74", label: "Peach" },
  { key: "amethyst", hex: "#c084fc", label: "Amethyst" },
  { key: "cerulean", hex: "#0ea5e9", label: "Cerulean" },
];

let selectedIcon = ICONS[0];
let selectedColor = "primary";
let activePanel = "habits";

document.addEventListener("DOMContentLoaded", () => {
  initDesktopNav("settings");
  buildMobileNav("settings");
  renderProfile();
  buildUnitSelectsFromCatalogue();
  renderIconPicker();
  renderColorPicker();
  renderHabitsList();
  initPanelNav();
  initAddHabitForm();
  initAccountPanel();
  initPrivacyPanel();
  initEditModal();
  initProfileModal();
  initClearAllData();
});


function renderProfile() {
  const user = Store.getUser();
  const streak = Store.getStreak();
  document.getElementById("profile-name").textContent = user
    ? user.name
    : "Set up your profile";
  document.getElementById("profile-since").textContent = user
    ? `Member since ${user.memberSince || "now"}`
    : 'Tap "Edit Profile" to get started';
  document.getElementById("profile-streak").textContent =
    `${streak} Day Streak`;
  document.getElementById("profile-tier").textContent =
    user?.tier || "Luminary";

  const an = document.getElementById("account-name");
  if (an && user) an.value = user.name || "";
}


function buildUnitSelectsFromCatalogue() {
  const addSel = document.getElementById("habit-unit");
  const editSel = document.getElementById("edit-unit");
  if (addSel) addSel.innerHTML = buildUnitOptions("mins");
  if (editSel) editSel.innerHTML = buildUnitOptions("mins");
}


function renderIconPicker() {
  const container = document.getElementById("icon-picker");
  if (!container) return;
  container.innerHTML = ICONS.map(
    (icon) => `
    <button type="button" data-icon="${icon}"
      class="icon-option w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant ${icon === selectedIcon ? "selected" : ""}">
      <span class="material-symbols-outlined" style="font-size:28px">${icon}</span>
    </button>`,
  ).join("");
  container.querySelectorAll(".icon-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      container
        .querySelectorAll(".icon-option")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedIcon = btn.dataset.icon;
    });
  });
}


function renderColorPicker() {
  const container = document.getElementById("color-picker");
  if (!container) return;
  container.innerHTML =
    COLORS.map(
      (c) => `
    <button type="button" data-color="${c.key}"
      class="color-swatch w-8 h-8 rounded-full ${c.key === selectedColor ? "selected" : ""}"
      style="background:${c.hex}" title="${c.label}"></button>`,
    ).join("") +
    `<span class="text-xs text-on-surface-variant ml-1" id="selected-color-label">${COLORS.find((c) => c.key === selectedColor)?.label || ""}</span>`;

  container.querySelectorAll(".color-swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      container
        .querySelectorAll(".color-swatch")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedColor = btn.dataset.color;
      const lbl = document.getElementById("selected-color-label");
      if (lbl)
        lbl.textContent =
          COLORS.find((c) => c.key === btn.dataset.color)?.label || "";
    });
  });
}


function renderHabitsList() {
  const container = document.getElementById("habits-manage-list");
  if (!container) return;
  const habits = Store.getHabits();

  if (!habits.length) {
    container.innerHTML = `
      <div class="empty-state bg-surface-container-low rounded-lg py-12">
        <span class="material-symbols-outlined">add_task</span>
        <p class="font-bold mt-3 text-on-surface">No habits yet</p>
        <p class="text-sm mt-1 text-on-surface-variant">Create your first ritual above to begin</p>
      </div>`;
    return;
  }

  const checkins = Store.getCheckins();

  container.innerHTML = habits
    .map((habit) => {
      const colors = getColorClass(habit.color);
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        return !!checkins[key]?.[habit.id];
      });
      const consistency = Math.round((last7.filter(Boolean).length / 7) * 100);

      return `
      <div class="habit-manage-card bg-surface-container-high rounded-xl p-4 md:p-5 flex items-center justify-between gap-4 transition-all" data-id="${habit.id}">
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style="background:${colors.bg}">
            <span class="material-symbols-outlined text-xl" style="color:${colors.text}">${habit.icon}</span>
          </div>
          <div>
            <h4 class="font-bold text-sm md:text-base text-on-surface">${habit.name}</h4>
            <p class="text-xs text-on-surface-variant">${habit.frequency} · ${habit.target} ${getUnitLabel(habit.unit)}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <div class="hidden sm:block text-right">
            <p class="text-xs font-label text-on-surface-variant">7-day</p>
            <p class="font-bold text-sm" style="color:${colors.text}">${consistency}%</p>
          </div>
          <button onclick="openEditModal('${habit.id}')"
            class="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
            <span class="material-symbols-outlined" style="font-size:18px">edit</span>
          </button>
          <button onclick="handleDeleteHabit('${habit.id}')"
            class="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-error transition-colors">
            <span class="material-symbols-outlined" style="font-size:18px">delete</span>
          </button>
        </div>
      </div>`;
    })
    .join("");
}


function initAddHabitForm() {
  document.getElementById("add-habit-btn")?.addEventListener("click", () => {
    const name = document.getElementById("habit-name")?.value?.trim();
    const frequency = document.getElementById("habit-frequency")?.value;
    const target = parseInt(document.getElementById("habit-target")?.value);
    const unit = document.getElementById("habit-unit")?.value || "mins";

    if (!name) {
      showToast("Give your habit a name", true);
      return;
    }
    if (!target || target < 1) {
      showToast("Set a valid target amount", true);
      return;
    }

    Store.addHabit({
      name,
      frequency,
      target,
      unit,
      icon: selectedIcon,
      color: selectedColor,
    });

    document.getElementById("habit-name").value = "";
    document.getElementById("habit-target").value = "";
    renderHabitsList();
    showToast(`"${name}" added ✨`);
  });
}


window.handleDeleteHabit = function (id) {
  const habit = Store.getHabits().find((h) => h.id === id);
  if (!habit) return;
  showConfirm({
    title: "Delete Habit",
    body: `Remove "<strong>${habit.name}</strong>"? All check-ins for this habit will remain in your history.`,
    confirmLabel: "Delete",
    danger: true,
    onConfirm: () => {
      const card = document.querySelector(`[data-id="${id}"]`);
      if (card) {
        card.classList.add("shake");
        card.addEventListener(
          "animationend",
          () => {
            Store.deleteHabit(id);
            renderHabitsList();
            showToast(`"${habit.name}" removed`);
          },
          { once: true },
        );
      } else {
        Store.deleteHabit(id);
        renderHabitsList();
        showToast(`Habit removed`);
      }
    },
  });
};


function initEditModal() {
  document
    .getElementById("close-modal-btn")
    ?.addEventListener("click", closeEditModal);
  document.getElementById("edit-modal")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("edit-modal")) closeEditModal();
  });
  document.getElementById("save-edit-btn")?.addEventListener("click", saveEdit);
}

window.openEditModal = function (id) {
  const habit = Store.getHabits().find((h) => h.id === id);
  if (!habit) return;
  document.getElementById("edit-habit-id").value = id;
  document.getElementById("edit-name").value = habit.name;
  document.getElementById("edit-target").value = habit.target;
  const editUnit = document.getElementById("edit-unit");
  if (editUnit) editUnit.innerHTML = buildUnitOptions(habit.unit);
  document.getElementById("edit-modal").classList.remove("hidden");
};

function closeEditModal() {
  document.getElementById("edit-modal").classList.add("hidden");
}

function saveEdit() {
  const id = document.getElementById("edit-habit-id").value;
  const name = document.getElementById("edit-name").value.trim();
  const target = parseInt(document.getElementById("edit-target").value);
  const unit = document.getElementById("edit-unit").value;
  if (!name) {
    showToast("Name cannot be empty", true);
    return;
  }
  if (!target || isNaN(target) || target < 1) {
    showToast("Set a valid target (must be at least 1)", true);
    return;
  }
  Store.updateHabit(id, { name, target, unit });
  closeEditModal();
  renderHabitsList();
  showToast("Habit updated ✓");
}


function initPanelNav() {
  document.querySelectorAll("[data-panel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.dataset.panel;
      document.querySelectorAll("[data-panel]").forEach((b) => {
        b.classList.remove("active", "text-primary");
        b.classList.add("text-on-surface-variant");
      });
      btn.classList.add("active", "text-primary");
      btn.classList.remove("text-on-surface-variant");
      document
        .querySelectorAll(".panel-content")
        .forEach((p) => p.classList.add("hidden"));
      document.getElementById(`panel-${panel}`)?.classList.remove("hidden");
      activePanel = panel;
      if (panel === "privacy") renderActivityLog();
      if (panel === "account") {
        const u = Store.getUser();
        const an = document.getElementById("account-name");
        if (an && u) an.value = u.name || "";
      }
    });
  });
}


function initAccountPanel() {
  document.getElementById("save-account-btn")?.addEventListener("click", () => {
    const name = document.getElementById("account-name")?.value?.trim();
    if (!name) {
      showToast("Name cannot be empty", true);
      return;
    }
    const existing = Store.getUser() || {};
    Store.saveUser({ ...existing, name });
    renderProfile();
    showToast("Account updated ✓");
  });
}


function initPrivacyPanel() {
  document.getElementById("export-btn")?.addEventListener("click", () => {
    const data = Store.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumina-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully 📦");
    setTimeout(renderActivityLog, 300);
  });

  document
    .getElementById("import-file-input")
    ?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data._version && !data.lumina_habits) {
            showToast("Invalid backup file format", true);
            return;
          }
          showConfirm({
            title: "⚠️ Replace All Data?",
            body: "This will <strong>replace all your current data</strong> (habits, logs, journal, check-ins) with the imported file. This cannot be undone. Proceed with caution.",
            confirmLabel: "Yes, Replace",
            danger: true,
            onConfirm: () => {
              Store.importAll(data);
              showToast("Data imported successfully ✓");
              setTimeout(() => {
                renderProfile();
                renderHabitsList();
                renderActivityLog();
              }, 200);
            },
          });
        } catch {
          showToast(
            "Could not read file. Make sure it is a valid JSON backup.",
            true,
          );
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });

  document.getElementById("clear-log-btn")?.addEventListener("click", () => {
    showConfirm({
      title: "Clear Activity Log",
      body: "This will permanently delete all activity log entries. Your habits and data are unaffected.",
      confirmLabel: "Clear",
      danger: true,
      onConfirm: () => {
        localStorage.removeItem(ActivityLog.KEY);
        renderActivityLog();
        showToast("Activity log cleared");
      },
    });
  });
}


function renderActivityLog() {
  const container = document.getElementById("activity-log-container");
  if (!container) return;
  const entries = ActivityLog.getAll();

  if (!entries.length) {
    container.innerHTML = `<div class="empty-state py-10"><span class="material-symbols-outlined">timeline</span><p class="text-sm mt-2">No activity recorded yet</p></div>`;
    return;
  }

  container.innerHTML = entries
    .map((entry) => {
      const f = ActivityLog.formatEntry(entry);
      return `
      <div class="activity-entry">
        <div class="dot">
          <span class="material-symbols-outlined" style="color:${f.color};font-variation-settings:'FILL' 1">${f.icon}</span>
        </div>
        <div class="content">
          <div class="msg">${f.msg}</div>
          <div class="time">${f.time}</div>
        </div>
      </div>`;
    })
    .join("");
}


function initProfileModal() {
  const modal = document.getElementById("profile-modal");
  const saveBtn = document.getElementById("save-profile-btn");
  const closeBtn = document.getElementById("close-profile-modal");
  const avatarBtn = document.getElementById("profile-avatar-btn");
  const editBtn = document.getElementById("edit-profile-btn");
  const nameInput = document.getElementById("profile-name-input");

  const open = () => {
    const u = Store.getUser();
    if (nameInput && u) nameInput.value = u.name || "";
    modal?.classList.remove("hidden");
  };

  avatarBtn?.addEventListener("click", open);
  editBtn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", () => modal?.classList.add("hidden"));
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
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
    renderProfile();
    showToast("Profile saved ✓");
  });
}


function initClearAllData() {
  document.getElementById("clear-all-data-btn")?.addEventListener("click", () => {
    showConfirm({
      title: "Clear All Data",
      body: "This will delete all existing data of yours and can't be undone. Make sure to export the data if you think its important. Proceed with caution.",
      confirmLabel: "Yes",
      danger: true,
      onConfirm: () => {
        localStorage.clear();
        window.location.href = "../";
      },
    });
  });
}
