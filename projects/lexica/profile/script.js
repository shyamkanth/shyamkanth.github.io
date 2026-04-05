let isEditing = false;
let logsShown = 10;
let lastExportTime = null;

document.addEventListener("DOMContentLoaded", () => {
  loadProfileDisplay();
  loadProfileStats();
  loadActivityLog();
  loadLastExport();
});

function loadProfileDisplay() {
  const p = getProfile();
  document.getElementById("profile-display-name").textContent =
    p.name || "Lexicographer";
  document.getElementById("profile-title-display").textContent =
    p.title || "Word Collector";

  const words = getWords();
  const badge = getBadge(words.length);
  document.getElementById("profile-badge").textContent = badge;
}

function getBadge(count) {
  if (count >= 500) return "Master Lexicographer";
  if (count >= 200) return "Editor-in-Chief";
  if (count >= 100) return "Senior Scribe";
  if (count >= 50) return "Word Collector";
  if (count >= 10) return "Apprentice";
  return "Newcomer";
}

function loadProfileStats() {
  const words = getWords();
  document.getElementById("p-total").textContent = words.length;
  document.getElementById("p-week").textContent = getWordsThisWeek();
  document.getElementById("p-favs").textContent = getFavoriteCount();
  const cats = new Set(words.map((w) => w.category).filter(Boolean));
  document.getElementById("p-cats").textContent = cats.size;
}

function loadLastExport() {
  const ts = localStorage.getItem("lexica_last_export");
  const el = document.getElementById("data-last-export");
  if (ts) {
    lastExportTime = ts;
    el.innerHTML = `Last Export: <span style="color:var(--accent)">${timeAgo(ts)}</span>`;
  }
}

function toggleEditMode() {
  isEditing = !isEditing;
  const p = getProfile();

  document.getElementById("profile-display-name").style.display = isEditing
    ? "none"
    : "";
  document.getElementById("profile-title-display").style.display = isEditing
    ? "none"
    : "";
  document.getElementById("profile-edit-fields").style.display = isEditing
    ? "flex"
    : "none";

  const cancelBtn = document.getElementById("cancel-edit-btn");
  const saveBtn = document.getElementById("save-edit-btn");
  const desktopBtn = document.getElementById("desktop-edit-btn");
  const mobileBtn = document.getElementById("edit-toggle-btn");

  if (isEditing) {
    document.getElementById("edit-name").value = p.name || "";
    document.getElementById("edit-title").value = p.title || "";
    cancelBtn.style.display = "flex";
    saveBtn.style.display = "flex";
    desktopBtn.style.display = "none";
    mobileBtn.querySelector(".material-symbols-outlined").textContent = "close";
  } else {
    cancelBtn.style.display = "none";
    saveBtn.style.display = "none";
    desktopBtn.style.display = "flex";
    mobileBtn.querySelector(".material-symbols-outlined").textContent = "edit";
  }
}

function cancelEdit() {
  isEditing = true;
  toggleEditMode();
}

function saveProfile_() {
  const name = document.getElementById("edit-name").value.trim();
  const title = document.getElementById("edit-title").value.trim();

  if (!name) {
    document.getElementById("edit-name").focus();
    return;
  }

  const p = { name, title };
  saveProfile(p);
  addLog("Updated Profile", `Name set to "${name}"`, "profile");

  isEditing = true;
  toggleEditMode();
  loadProfileDisplay();
  loadActivityLog();
  showToast("Profile saved!");
}

function loadActivityLog() {
  const logs = getLogs();
  const list = document.getElementById("activity-log-list");
  const more = document.getElementById("activity-log-more");

  if (!logs.length) {
    list.innerHTML =
      '<div style="text-align:center;padding:32px;color:var(--text-muted);font-size:13px;">No activity yet. Start adding words!</div>';
    more.style.display = "none";
    return;
  }

  list.innerHTML = logs
    .slice(0, logsShown)
    .map(
      (log) => `
    <div class="activity-item">
      <div class="activity-item-icon">
        <span class="material-symbols-outlined">${getLogIcon(log.type)}</span>
      </div>
      <div class="activity-content">
        <div class="activity-title">${escapeHtml(log.action)}</div>
        <div class="activity-sub">${escapeHtml(log.detail)}</div>
      </div>
      <div class="activity-time">${timeAgo(log.timestamp)}</div>
    </div>
  `,
    )
    .join("");

  more.style.display = logs.length > logsShown ? "block" : "none";
}

function loadMoreLogs() {
  logsShown += 20;
  loadActivityLog();
}

function clearLogs() {
  if (!confirm("Clear all activity history? This cannot be undone.")) return;
  saveLogs([]);
  logsShown = 10;
  loadActivityLog();
  showToast("Activity log cleared.");
}

function handleExport() {
  const words = getWords();
  const logs = getLogs();
  const profile = getProfile();

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    profile,
    words,
    logs,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: `lexica_backup_${new Date().toISOString().split("T")[0]}.json`,
  });
  a.click();
  URL.revokeObjectURL(a.href);

  const now = new Date().toISOString();
  localStorage.setItem("lexica_last_export", now);
  addLog("Exported Data", `Full backup of ${words.length} words`, "export");
  loadLastExport();
  loadActivityLog();
  showToast(`Exported ${words.length} words!`);
}

function handleImport() {
  document.getElementById("import-input").click();
}

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);

      if (data.words && Array.isArray(data.words)) {
        const existing = getWords();
        const existingIds = new Set(existing.map((w) => w.id));

        const toMerge = data.words.filter((w) => !existingIds.has(w.id));
        const merged = [...existing, ...toMerge];
        saveWords(merged);

        if (data.profile) saveProfile(data.profile);

        addLog(
          "Imported Data",
          `Merged ${toMerge.length} new words from backup`,
          "import",
        );
        loadProfileDisplay();
        loadProfileStats();
        loadActivityLog();
        showToast(`Imported ${toMerge.length} words!`);
      } else {
        showToast("Invalid file format.");
      }
    } catch (err) {
      showToast("Error reading file.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

/* Clear All Data Modal Functions */
function openClearDataModal() {
  document.getElementById("clear-data-modal").classList.add("open");
}

function closeClearDataModal() {
  document.getElementById("clear-data-modal").classList.remove("open");
}

function handleClearDataBackdrop(e) {
  if (e.target === document.getElementById("clear-data-modal")) {
    closeClearDataModal();
  }
}

function confirmClearAllData() {
  // Get the profile to preserve it
  const profile = getProfile();

  // Clear all localStorage except profile and export time
  const keysToPreserve = ["lexica_profile", "lexica_last_export"];
  const allKeys = Object.keys(localStorage);

  allKeys.forEach(key => {
    if (!keysToPreserve.includes(key)) {
      localStorage.removeItem(key);
    }
  });

  // Log the action before clearing logs (it will be cleared anyway)
  // But we can still add a log to show the action happened
  addLog("Cleared All Data", "Complete reset of words and activity history", "delete");

  // Clear the logs (this happens after the log is added)
  saveLogs([]);

  // Close the modal
  closeClearDataModal();

  // Reset UI
  logsShown = 10;
  loadProfileDisplay();
  loadProfileStats();
  loadActivityLog();

  // Show confirmation
  showToast("All data cleared. Profile preserved!");
}

/* Add Word Modal Functions */
function openAddModal() {
  const modal = document.getElementById("add-modal");
  modal.classList.add("open");
  document.getElementById("add-modal-title").textContent = "Add New Word";
  document.getElementById("save-btn-label").textContent = "Add Word";
  document.getElementById("edit-id").value = "";

  // Clear form
  document.getElementById("m-word").value = "";
  document.getElementById("m-pronunciation").value = "";
  document.getElementById("m-def").value = "";
  document.getElementById("m-ex").value = "";
  document.getElementById("m-tags").value = "";
  document.getElementById("m-cat").value = "noun";

  setTimeout(() => document.getElementById("m-word").focus(), 300);
}

function closeAddModal() {
  document.getElementById("add-modal").classList.remove("open");
}

function handleAddBackdrop(e) {
  if (e.target === document.getElementById("add-modal")) {
    closeAddModal();
  }
}

function handleSaveWord() {
  const editId = document.getElementById("edit-id").value;
  const word = document.getElementById("m-word").value.trim();
  const pronunciation = document.getElementById("m-pronunciation").value.trim();
  const definition = document.getElementById("m-def").value.trim();
  const example = document.getElementById("m-ex").value.trim();
  const tagsRaw = document.getElementById("m-tags").value.trim();
  const category = document.getElementById("m-cat").value;

  if (!word) {
    document.getElementById("m-word").focus();
    return;
  }

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const words = getWords();

  if (editId) {
    // Edit existing
    const idx = words.findIndex((w) => w.id === editId);
    if (idx !== -1) {
      words[idx] = {
        ...words[idx],
        word,
        pronunciation,
        definition,
        example,
        tags,
        category,
        updatedAt: new Date().toISOString(),
      };
      saveWords(words);
      addLog(`Edited "${word}"`, "Updated definition and details", "edit");
      showToast(`"${word}" updated!`);
    }
  } else {
    // Add new
    const newWord = {
      id: generateId(),
      word,
      pronunciation,
      definition,
      example,
      tags,
      category,
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    words.unshift(newWord);
    saveWords(words);
    addLog(`Saved "${word}"`, `Added to lexicon as ${category}`, "add");
    showToast(`"${word}" added to your lexicon!`);
  }

  closeAddModal();
  loadProfileStats();
  loadActivityLog();
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}