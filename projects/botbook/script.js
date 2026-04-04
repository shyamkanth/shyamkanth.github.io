const STORAGE_KEY = "botbook_notes";
const AUTO_SAVE_MS = 1000;

let allNotes = [];
let currentNoteId = null;
let selectedNoteIdForEdit = null;
let selectedNoteIdForDelete = null;
let autoSaveTimer = null;
let lastLineCount = 0;
let lastActiveLine = 0;

const contentEl = document.getElementById("content");
const editorWrapperEl = document.getElementById("editor-wrapper");
const noEditorEl = document.getElementById("no-editor");
const editorTitleEl = document.getElementById("editor-title");
const saveBadgeEl = document.getElementById("save-badge");
const lineNumbersEl = document.getElementById("line-numbers");

const isMobile = () => window.innerWidth < 700;

document.addEventListener("DOMContentLoaded", () => {
  loadNotes();
  renderAllNoteLists();
  setupEvents();
  setupKeyboard();
});

function loadNotes() {
  try {
    allNotes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    allNotes = [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotes));
}

function getContent() {
  return contentEl.innerHTML
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<div>/gi, "\n")
    .replace(/<\/div>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function setContent(text) {
  if (!text) {
    contentEl.innerHTML = "";
    return;
  }
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const lines = escaped.split("\n");
  if (lines.length === 1) {
    contentEl.innerHTML = escaped;
  } else {
    contentEl.innerHTML = lines
      .map((line, i) =>
        i === 0 ? line : `<div>${line === "" ? "<br>" : line}</div>`,
      )
      .join("");
  }
}

function getLineHeight() {
  return parseFloat(getComputedStyle(contentEl).lineHeight) || 29.6;
}

function getRenderedLineCount() {
  const lineHeight = getLineHeight();
  return Math.max(1, Math.round(contentEl.scrollHeight / lineHeight));
}

function getCaretRenderedLine() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return lastActiveLine || 1;

  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(true);

  const dummy = document.createElement("span");
  dummy.textContent = "\u200b";
  try {
    range.insertNode(dummy);
  } catch (e) {
    return lastActiveLine || 1;
  }

  const caretTop = dummy.getBoundingClientRect().top;
  const editorTop = contentEl.getBoundingClientRect().top;
  dummy.parentNode.removeChild(dummy);

  const relativeTop = caretTop - editorTop + contentEl.scrollTop;
  const lineHeight = getLineHeight();
  return Math.max(1, Math.round(relativeTop / lineHeight) + 1);
}

function updateLineNumbers() {
  const lineCount = getRenderedLineCount();
  const activeLine = getCaretRenderedLine();

  if (lineCount === lastLineCount && activeLine === lastActiveLine) return;
  lastLineCount = lineCount;
  lastActiveLine = activeLine;

  lineNumbersEl.innerHTML = "";
  for (let i = 1; i <= lineCount; i++) {
    const span = document.createElement("span");
    span.textContent = i;
    if (i === activeLine) span.className = "active-line";
    lineNumbersEl.appendChild(span);
  }

  const lineHeight = getLineHeight();
  const visibleHeight = lineNumbersEl.clientHeight;
  lineNumbersEl.scrollTop = Math.max(
    0,
    (activeLine - 1) * lineHeight - visibleHeight / 2 + lineHeight / 2,
  );
}

function renderAllNoteLists() {
  renderDesktopList();
  renderMobileList();
}

function renderDesktopList() {
  const el = document.getElementById("notes-list-desktop");
  if (!el) return;
  el.innerHTML = "";
  if (!allNotes.length) {
    el.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined">note_stack</span><p>No notes yet</p></div>`;
    return;
  }
  allNotes.forEach((n) => el.appendChild(makeDesktopNoteItem(n)));
}

function makeDesktopNoteItem(note) {
  const item = document.createElement("div");
  item.className = `note-item ${note.id === currentNoteId ? "active" : ""}`;
  const title = document.createElement("div");
  title.className = "note-item-title";
  title.textContent = note.name;
  const actions = document.createElement("div");
  actions.className = "note-item-actions";
  const editBtn = document.createElement("span");
  editBtn.className = "note-item-action edit material-symbols-outlined";
  editBtn.textContent = "edit";
  editBtn.onclick = (e) => {
    e.stopPropagation();
    openEditModal(note.id, note.name);
  };
  const delBtn = document.createElement("span");
  delBtn.className = "note-item-action delete material-symbols-outlined";
  delBtn.textContent = "close";
  delBtn.onclick = (e) => {
    e.stopPropagation();
    openDeleteModal(note.id, note.name);
  };
  actions.append(editBtn, delBtn);
  item.append(title, actions);
  item.onclick = () => openNote(note.id);
  return item;
}

function renderMobileList() {
  const el = document.getElementById("notes-list-mobile");
  if (!el) return;
  el.innerHTML = "";
  if (!allNotes.length) {
    el.innerHTML = `<div class="sheet-empty"><span class="material-symbols-outlined">note_stack</span>No notes yet. Tap New to create one.</div>`;
    return;
  }
  allNotes.forEach((n) => el.appendChild(makeMobileNoteItem(n)));
}

function makeMobileNoteItem(note) {
  const item = document.createElement("div");
  item.className = `sheet-note-item ${note.id === currentNoteId ? "active" : ""}`;
  const dot = document.createElement("div");
  dot.className = "sheet-note-dot";
  const title = document.createElement("div");
  title.className = "sheet-note-title";
  title.textContent = note.name;
  const actions = document.createElement("div");
  actions.className = "sheet-note-actions";
  const editBtn = document.createElement("span");
  editBtn.className = "sheet-note-action edit material-symbols-outlined";
  editBtn.textContent = "edit";
  editBtn.onclick = (e) => {
    e.stopPropagation();
    closeNotesSheet();
    setTimeout(() => openEditModal(note.id, note.name), 200);
  };
  const delBtn = document.createElement("span");
  delBtn.className = "sheet-note-action delete material-symbols-outlined";
  delBtn.textContent = "delete";
  delBtn.onclick = (e) => {
    e.stopPropagation();
    closeNotesSheet();
    setTimeout(() => openDeleteModal(note.id, note.name), 200);
  };
  actions.append(editBtn, delBtn);
  item.append(dot, title, actions);
  item.onclick = () => {
    openNote(note.id);
    closeNotesSheet();
  };
  return item;
}

function openNote(id) {
  const note = allNotes.find((n) => n.id === id);
  if (!note) return;
  if (currentNoteId !== null) saveCurrentNote();
  currentNoteId = id;
  lastLineCount = 0;
  lastActiveLine = 0;
  noEditorEl.style.display = "none";
  editorWrapperEl.style.display = "flex";
  editorTitleEl.textContent = note.name;
  setContent(note.content || "");
  contentEl.classList.toggle("empty", !note.content?.trim());
  renderAllNoteLists();
  startAutoSave();
  setTimeout(() => {
    contentEl.focus();
    moveCursorToEnd();
    updateLineNumbers();
  }, 80);
}

function moveCursorToEnd() {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(contentEl);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function closeCurrentNote() {
  if (currentNoteId !== null) saveCurrentNote();
  currentNoteId = null;
  stopAutoSave();
  editorWrapperEl.style.display = "none";
  noEditorEl.style.display = "";
  renderAllNoteLists();
}

function saveCurrentNote() {
  if (currentNoteId === null) return;
  const note = allNotes.find((n) => n.id === currentNoteId);
  if (note) {
    note.content = getContent();
    persist();
    saveBadgeEl.style.opacity = "1";
  }
}

function startAutoSave() {
  stopAutoSave();
  autoSaveTimer = setInterval(saveCurrentNote, AUTO_SAVE_MS);
}

function stopAutoSave() {
  clearInterval(autoSaveTimer);
  autoSaveTimer = null;
}

contentEl.addEventListener("input", () => {
  if (currentNoteId !== null) {
    const note = allNotes.find((n) => n.id === currentNoteId);
    if (note) note.content = getContent();
  }
  contentEl.classList.toggle("empty", !contentEl.textContent.trim());
  updateLineNumbers();
});

contentEl.addEventListener("keyup", updateLineNumbers);
contentEl.addEventListener("click", updateLineNumbers);
contentEl.addEventListener("mouseup", updateLineNumbers);

contentEl.addEventListener("focus", () => {
  contentEl.classList.remove("empty");
  setTimeout(updateLineNumbers, 0);
});

contentEl.addEventListener("blur", () => {
  if (!contentEl.textContent.trim()) contentEl.classList.add("empty");
});

contentEl.addEventListener("paste", (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
  setTimeout(updateLineNumbers, 0);
});

function handleCreateNote(e) {
  e.preventDefault();
  const inp = document.getElementById("note-title");
  const title = inp.value.trim();
  if (!title) {
    inp.focus();
    return;
  }
  const newId = allNotes.length
    ? Math.max(...allNotes.map((n) => n.id)) + 1
    : 1;
  allNotes.push({
    id: newId,
    name: title,
    content: "",
    createdAt: new Date().toISOString(),
  });
  persist();
  closeModal("create-modal");
  openNote(newId);
}

function handleEditNote(e) {
  e.preventDefault();
  const inp = document.getElementById("edit-title");
  const name = inp.value.trim();
  if (!name || selectedNoteIdForEdit === null) {
    inp.focus();
    return;
  }
  const note = allNotes.find((n) => n.id === selectedNoteIdForEdit);
  if (note) {
    note.name = name;
    persist();
    if (currentNoteId === selectedNoteIdForEdit)
      editorTitleEl.textContent = name;
    renderAllNoteLists();
  }
  closeModal("edit-modal");
  selectedNoteIdForEdit = null;
}

function handleDeleteNote(e) {
  e.preventDefault();
  if (selectedNoteIdForDelete === null) return;
  const idx = allNotes.findIndex((n) => n.id === selectedNoteIdForDelete);
  if (idx !== -1) {
    allNotes.splice(idx, 1);
    persist();
    if (currentNoteId === selectedNoteIdForDelete) closeCurrentNote();
    renderAllNoteLists();
  }
  closeModal("delete-modal");
  selectedNoteIdForDelete = null;
}

function handleExportNote() {
  if (currentNoteId === null) {
    alert("No note selected");
    return;
  }
  const note = allNotes.find((n) => n.id === currentNoteId);
  if (!note) return;
  download(
    `${note.name.replace(/\s+/g, "_")}.json`,
    JSON.stringify(note, null, 2),
  );
}

function handleExportAll() {
  if (!allNotes.length) {
    alert("No notes to export");
    return;
  }
  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    notes: allNotes,
  };
  download(
    `botbook_backup_${new Date().toISOString().split("T")[0]}.json`,
    JSON.stringify(data, null, 2),
  );
}

function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: filename,
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

function handleImport(e) {
  e.preventDefault();
  const file = document.getElementById("import-file").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      let imported = [];
      if (data.notes && Array.isArray(data.notes)) {
        const existing = new Set(allNotes.map((n) => n.id));
        const maxId = allNotes.length
          ? Math.max(...allNotes.map((n) => n.id))
          : 0;
        data.notes.forEach((n, i) => {
          if (existing.has(n.id)) n.id = maxId + i + 1;
          imported.push(n);
        });
      } else if (data.id && data.name) {
        const maxId = allNotes.length
          ? Math.max(...allNotes.map((n) => n.id))
          : 0;
        imported = [{ ...data, id: maxId + 1 }];
      } else {
        alert("Invalid format");
        return;
      }
      allNotes.push(...imported);
      persist();
      renderAllNoteLists();
      alert(`Imported ${imported.length} note(s)`);
      closeModal("import-modal");
      document.getElementById("import-file").value = "";
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
  reader.readAsText(file);
}

function openModal(id) {
  document.getElementById(id).classList.add("active");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

function openCreateModal() {
  document.getElementById("note-title").value = "";
  openModal("create-modal");
  setTimeout(() => document.getElementById("note-title").focus(), 300);
}

function openEditModal(id, name) {
  selectedNoteIdForEdit = id;
  document.getElementById("edit-title").value = name;
  openModal("edit-modal");
  setTimeout(() => document.getElementById("edit-title").focus(), 300);
}

function openDeleteModal(id, name) {
  selectedNoteIdForDelete = id;
  document.getElementById("delete-note-name").textContent = `Delete "${name}"?`;
  openModal("delete-modal");
}

function openImportModal() {
  openModal("import-modal");
}
function openInfoModal() {
  openModal("info-modal");
}

document.querySelectorAll(".modal-overlay").forEach((m) => {
  m.addEventListener("click", (e) => {
    if (e.target === m) closeModal(m.id);
  });
});

function showNotesSheet() {
  renderMobileList();
  document.getElementById("notes-sheet-overlay").classList.add("active");
  document.getElementById("notes-sheet").classList.add("open");
}
function closeNotesSheet() {
  document.getElementById("notes-sheet-overlay").classList.remove("active");
  document.getElementById("notes-sheet").classList.remove("open");
}
function showMoreSheet() {
  document.getElementById("more-sheet-overlay").classList.add("active");
  document.getElementById("more-sheet").classList.add("open");
}
function closeMoreSheet() {
  document.getElementById("more-sheet-overlay").classList.remove("active");
  document.getElementById("more-sheet").classList.remove("open");
}

document.getElementById("btn-back").onclick = () => {
  saveCurrentNote();
  showNotesSheet();
};

function setupEvents() {
  document
    .getElementById("btn-new-note-desktop")
    ?.addEventListener("click", openCreateModal);
  document
    .getElementById("btn-export-all-desktop")
    ?.addEventListener("click", handleExportAll);
  document
    .getElementById("btn-import-all-desktop")
    ?.addEventListener("click", openImportModal);
  document
    .getElementById("btn-export-note")
    ?.addEventListener("click", handleExportNote);
  document.getElementById("btn-delete-note")?.addEventListener("click", () => {
    if (!currentNoteId) {
      alert("No note selected");
      return;
    }
    const note = allNotes.find((n) => n.id === currentNoteId);
    if (note) openDeleteModal(currentNoteId, note.name);
  });
  document
    .getElementById("create-form")
    ?.addEventListener("submit", handleCreateNote);
  document
    .getElementById("edit-form")
    ?.addEventListener("submit", handleEditNote);
  document
    .getElementById("import-form")
    ?.addEventListener("submit", handleImport);
}

function setupKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "m":
          e.preventDefault();
          openCreateModal();
          break;
        case "e":
          e.preventDefault();
          handleExportAll();
          break;
        case "i":
          e.preventDefault();
          openImportModal();
          break;
        case "s":
          e.preventDefault();
          if (currentNoteId !== null) saveCurrentNote();
          break;
      }
    }
  });
}
