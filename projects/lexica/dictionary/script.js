let allWords = [];
let filtered = [];
let editingId = null;
let filtersOpen = false;
let deleteWordId = null;

document.addEventListener("DOMContentLoaded", () => {
  allWords = getWords();
  applyFilters();
  renderWotd();
  renderRightStats();
});

function handleSearch() {
  applyFilters();
}

function toggleFilters() {
  filtersOpen = !filtersOpen;
  document.getElementById("filter-bar").classList.toggle("open", filtersOpen);
}

function applyFilters() {
  const q = (document.getElementById("search-input").value || "")
    .toLowerCase()
    .trim();
  const cat = document.getElementById("cat-filter").value;
  const sort = document.getElementById("sort-filter").value;
  const favOnly = document.getElementById("fav-filter").checked;

  allWords = getWords();
  filtered = allWords.filter((w) => {
    const matchQ =
      !q ||
      w.word.toLowerCase().includes(q) ||
      (w.definition || "").toLowerCase().includes(q) ||
      (w.example || "").toLowerCase().includes(q);
    const matchCat = !cat || w.category === cat;
    const matchFav = !favOnly || w.favorite;
    return matchQ && matchCat && matchFav;
  });

  if (sort === "az") filtered.sort((a, b) => a.word.localeCompare(b.word));
  else if (sort === "za") filtered.sort((a, b) => b.word.localeCompare(a.word));
  else if (sort === "oldest")
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  renderWords();
  renderMeta();
}

function renderMeta() {
  const q = document.getElementById("search-input").value.trim();
  const meta = document.getElementById("results-meta");
  if (q) {
    meta.innerHTML = `<span>${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "<strong style="color:var(--text)">${escapeHtml(q)}</strong>"</span>`;
  } else {
    meta.innerHTML = `<div class="live-dot"></div><span>LIVE INDEXING ${allWords.length.toLocaleString()} TERMS</span>`;
  }
}

function renderWords() {
  const grid = document.getElementById("words-grid");
  const empty = document.getElementById("empty-state");

  if (!filtered.length) {
    grid.innerHTML = "";
    empty.style.display = "flex";
    return;
  }

  empty.style.display = "none";
  grid.innerHTML = filtered.map((w) => wordCardHtml(w)).join("");

  grid.querySelectorAll(".word-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".word-card-fav")) return;
      openViewModal(card.dataset.id);
    });
  });

  grid.querySelectorAll(".word-card-fav").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.id);
    });
  });
}

function wordCardHtml(w) {
  const catClass = getCategoryColor(w.category);
  const tags = (w.tags || [])
    .slice(0, 4)
    .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
    .join("");
  const favIcon = w.favorite ? "favorite" : "favorite_border";
  const favActive = w.favorite ? "active" : "";
  const pronunciation = w.pronunciation
    ? `<div class="word-card-pronunciation">${escapeHtml(w.pronunciation)}</div>`
    : "";

  return `
    <div class="word-card" data-id="${w.id}">
      <div class="word-card-header">
        <div>
          <div class="word-card-type">
            <div class="word-card-name">${escapeHtml(w.word)}</div>
            <span class="pill ${catClass}">${escapeHtml(w.category || "word")}</span>
          </div>
          ${pronunciation}
        </div>
        <button class="word-card-fav ${favActive}" data-id="${w.id}" title="Toggle favorite">
          <span class="material-symbols-outlined">${favIcon}</span>
        </button>
      </div>
      ${w.definition ? `<div class="word-card-definition">${escapeHtml(w.definition)}</div>` : ""}
      ${w.example ? `<div class="word-card-example">"${escapeHtml(w.example)}"</div>` : ""}
      ${tags ? `<div class="word-card-tags">${tags}</div>` : ""}
    </div>
  `;
}

function toggleFavorite(id) {
  const words = getWords();
  const word = words.find((w) => w.id === id);
  if (!word) return;
  word.favorite = !word.favorite;
  word.updatedAt = new Date().toISOString();
  saveWords(words);
  addLog(
    word.favorite ? `Favorited "${word.word}"` : `Unfavorited "${word.word}"`,
    word.favorite ? "Added to favorites" : "Removed from favorites",
    word.favorite ? "fav" : "unfav",
  );
  allWords = words;
  applyFilters();
  renderRightStats();
  showToast(word.favorite ? "★ Added to favorites" : "Removed from favorites");
}

function getWotd() {
  const words = getWords();
  if (!words.length) return null;
  const seed = Math.floor(Date.now() / 86400000);
  return words[seed % words.length];
}

function renderWotd() {
  const wotd = getWotd();
  if (!wotd) {
    document.getElementById("wotd-body").innerHTML = '<div class="wotd-placeholder">Add words to see your Word of the Day</div>';
    return;
  }

  const pronunciation = wotd.pronunciation
    ? `<div class="wotd-pronunciation">${escapeHtml(wotd.pronunciation)}</div>`
    : "";

  document.getElementById("wotd-body").innerHTML = `
    <div class="wotd-bg-inner">
      <div class="wotd-word-overlay">${escapeHtml(wotd.word)}</div>
    </div>
    <div class="wotd-info">
      <div class="wotd-etymology">Etymology Spot</div>
      ${pronunciation}
      <div class="wotd-def">${escapeHtml((wotd.definition || "").slice(0, 100))}${(wotd.definition || "").length > 100 ? "…" : ""}</div>
    </div>
  `;

  // Update mobile WOTD
  document.getElementById("wotd-word-mobile").textContent = wotd.word;
  document.getElementById("wotd-def-mobile").textContent = (wotd.definition || "").slice(0, 80) + ((wotd.definition || "").length > 80 ? "…" : "");
}

function renderRightStats() {
  const words = getWords();
  const el1 = document.getElementById("rs-total");
  const el2 = document.getElementById("rs-favs");
  if (el1) el1.textContent = words.length;
  if (el2) el2.textContent = words.filter((w) => w.favorite).length;
}

/* Word of the Day Modal */
function openWotdModal() {
  const wotd = getWotd();
  if (!wotd) {
    showToast("Add words to see Word of the Day");
    return;
  }

  document.getElementById("view-word-name").textContent = wotd.word;

  const catClass = getCategoryColor(wotd.category);
  const tags = (wotd.tags || [])
    .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
    .join("");
  const pronunciation = wotd.pronunciation
    ? `<div class="wotd-modal-pronunciation">${escapeHtml(wotd.pronunciation)}</div>`
    : "";

  const categoryTag = `<span class="pill ${catClass}">${escapeHtml(wotd.category || "word")}</span>`;
  const favoriteIcon = wotd.favorite ? '<span class="material-symbols-outlined" style="color:#ff6b6b;font-size:20px">favorite</span>' : "";

  document.getElementById("wotd-modal-word").textContent = wotd.word;

  const infoHtml = `
    <div class="wotd-modal-category-row">
      ${categoryTag}
      ${favoriteIcon}
    </div>
    ${pronunciation}
    ${wotd.definition ? `<div class="wotd-modal-definition">${escapeHtml(wotd.definition)}</div>` : '<div class="wotd-modal-definition" style="opacity:0.4">No definition added.</div>'}
    ${wotd.example ? `<div class="wotd-modal-example">"${escapeHtml(wotd.example)}"</div>` : ""}
    ${tags ? `<div class="wotd-modal-tags">${tags}</div>` : ""}
    <div class="wotd-modal-meta">Added ${timeAgo(wotd.createdAt)}${wotd.updatedAt !== wotd.createdAt ? " · Edited " + timeAgo(wotd.updatedAt) : ""}</div>
  `;

  document.getElementById("wotd-modal-info").innerHTML = infoHtml;
  document.getElementById("wotd-modal").classList.add("open");
}

function closeWotdModal() {
  document.getElementById("wotd-modal").classList.remove("open");
}

function handleWotdBackdrop(e) {
  if (e.target === document.getElementById("wotd-modal")) closeWotdModal();
}

/* View Word Modal */
function openViewModal(id) {
  const word = getWords().find((w) => w.id === id);
  if (!word) return;

  document.getElementById("view-word-name").textContent = word.word;

  const catClass = getCategoryColor(word.category);
  const tags = (word.tags || [])
    .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
    .join("");
  const pronunciation = word.pronunciation
    ? `<div class="view-word-pronunciation">${escapeHtml(word.pronunciation)}</div>`
    : "";

  document.getElementById("view-modal-body").innerHTML = `
    <div class="view-word-header">
      <span class="pill ${catClass}">${escapeHtml(word.category || "word")}</span>
      ${word.favorite ? '<span class="material-symbols-outlined" style="color:#ff6b6b;font-size:18px">favorite</span>' : ""}
    </div>
    ${pronunciation}
    ${word.definition ? `<div class="view-word-def">${escapeHtml(word.definition)}</div>` : '<div class="view-word-def" style="opacity:0.4">No definition added.</div>'}
    ${word.example ? `<div class="view-word-example">"${escapeHtml(word.example)}"</div>` : ""}
    ${tags ? `<div class="view-word-tags">${tags}</div>` : ""}
    <div class="view-word-meta">Added ${timeAgo(word.createdAt)}${word.updatedAt !== word.createdAt ? " · Edited " + timeAgo(word.updatedAt) : ""}</div>
  `;

  document.getElementById("view-modal-footer").innerHTML = `
    <button class="btn-secondary" style="flex:1" onclick="closeViewModal();openEditModal('${word.id}')">
      <span class="material-symbols-outlined">edit</span> Edit
    </button>
    <button class="btn-secondary" style="flex:1;color:#f87171;border-color:rgba(248,113,113,0.3)" onclick="openDeleteModal('${word.id}')">
      <span class="material-symbols-outlined">delete</span> Delete
    </button>
  `;

  document.getElementById("view-modal").classList.add("open");
}

function closeViewModal() {
  document.getElementById("view-modal").classList.remove("open");
}

function handleViewBackdrop(e) {
  if (e.target === document.getElementById("view-modal")) closeViewModal();
}

/* Delete Modal */
function openDeleteModal(id) {
  const words = getWords();
  const word = words.find((w) => w.id === id);
  if (!word) return;

  deleteWordId = id;
  document.getElementById("delete-title").textContent = `Delete "${escapeHtml(word.word)}"?`;
  document.getElementById("delete-message").textContent = "This action cannot be undone.";
  document.getElementById("delete-modal").classList.add("open");
}

function closeDeleteModal() {
  document.getElementById("delete-modal").classList.remove("open");
  deleteWordId = null;
}

function handleDeleteBackdrop(e) {
  if (e.target === document.getElementById("delete-modal")) closeDeleteModal();
}

function confirmDelete() {
  if (!deleteWordId) return;
  deleteWord(deleteWordId);
  closeDeleteModal();
}

/* Add/Edit Word Modal */
function openAddModal() {
  editingId = null;
  document.getElementById("add-modal-title").textContent = "Add New Word";
  document.getElementById("save-btn-label").textContent = "Add Word";
  document.getElementById("edit-id").value = "";
  document.getElementById("m-word").value = "";
  document.getElementById("m-pronunciation").value = "";
  document.getElementById("m-def").value = "";
  document.getElementById("m-ex").value = "";
  document.getElementById("m-tags").value = "";
  document.getElementById("m-cat").value = "noun";
  document.getElementById("add-modal").classList.add("open");
  setTimeout(() => document.getElementById("m-word").focus(), 300);
}

function openEditModal(id) {
  const word = getWords().find((w) => w.id === id);
  if (!word) return;
  editingId = id;

  document.getElementById("add-modal-title").textContent = "Edit Word";
  document.getElementById("save-btn-label").textContent = "Save Changes";
  document.getElementById("edit-id").value = id;
  document.getElementById("m-word").value = word.word;
  document.getElementById("m-pronunciation").value = word.pronunciation || "";
  document.getElementById("m-def").value = word.definition || "";
  document.getElementById("m-ex").value = word.example || "";
  document.getElementById("m-tags").value = (word.tags || []).join(", ");
  document.getElementById("m-cat").value = word.category || "noun";
  document.getElementById("add-modal").classList.add("open");
  setTimeout(() => document.getElementById("m-word").focus(), 300);
}

function closeAddModal() {
  document.getElementById("add-modal").classList.remove("open");
  editingId = null;
}

function handleAddBackdrop(e) {
  if (e.target === document.getElementById("add-modal")) closeAddModal();
}

function handleSaveWord() {
  const word = document.getElementById("m-word").value.trim();
  const pronunciation = document.getElementById("m-pronunciation").value.trim();
  const def = document.getElementById("m-def").value.trim();
  const ex = document.getElementById("m-ex").value.trim();
  const tagsRaw = document.getElementById("m-tags").value.trim();
  const cat = document.getElementById("m-cat").value;
  const tags = tagsRaw
    ? tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    : [];

  if (!word) {
    document.getElementById("m-word").focus();
    return;
  }

  const words = getWords();

  if (editingId) {
    const idx = words.findIndex((w) => w.id === editingId);
    if (idx !== -1) {
      words[idx] = {
        ...words[idx],
        word,
        pronunciation,
        definition: def,
        example: ex,
        category: cat,
        tags,
        updatedAt: new Date().toISOString(),
      };
      saveWords(words);
      addLog(`Edited "${word}"`, `Updated definition and details`, "edit");
      showToast(`"${word}" updated!`);
    }
  } else {
    words.unshift({
      id: generateId(),
      word,
      pronunciation,
      definition: def,
      example: ex,
      category: cat,
      tags,
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    saveWords(words);
    addLog(`Saved "${word}"`, `Added as ${cat}`, "add");
    showToast(`"${word}" added!`);
  }

  closeAddModal();
  closeViewModal();
  allWords = getWords();
  applyFilters();
  renderWotd();
  renderRightStats();
}

function deleteWord(id) {
  const words = getWords();
  const word = words.find((w) => w.id === id);
  if (!word) return;

  const updated = words.filter((w) => w.id !== id);
  saveWords(updated);
  addLog(`Deleted "${word.word}"`, "Removed from lexicon", "delete");
  closeViewModal();
  allWords = updated;
  applyFilters();
  renderWotd();
  renderRightStats();
  showToast(`"${word.word}" deleted.`);
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}