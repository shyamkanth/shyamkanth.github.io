let selectedCategory = "noun";

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadActivity();
  setupCategoryChips();
});

function loadStats() {
  const words = getWords();
  const total = words.length;
  const week = getWordsThisWeek();
  const favs = getFavoriteCount();

  document.getElementById("stat-total").textContent = total.toLocaleString();
  document.getElementById("stat-week").textContent = week;
  document.getElementById("stat-favs").textContent = favs;

  const growth =
    total > 0
      ? "+" + Math.round((week / Math.max(total - week, 1)) * 100) + "%"
      : "";
  const growthEl = document.getElementById("stat-growth");
  if (growthEl && week > 0) growthEl.textContent = growth;

  const weekSub = document.getElementById("stat-week-sub");
  if (weekSub)
    weekSub.textContent =
      week >= 7 ? "On fire! 🔥" : week > 0 ? "Keep it up!" : "Start today!";
}

function loadActivity() {
  const logs = getLogs();
  document.getElementById("activity-list").innerHTML = renderActivityItems(
    logs,
    10,
  );
}

function setupCategoryChips() {
  document.querySelectorAll("#category-chips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll("#category-chips .chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedCategory = chip.dataset.cat;
    });
  });
}

function handleQuickAdd(e) {
  e.preventDefault();
  const word = document.getElementById("q-word").value.trim();
  const def = document.getElementById("q-def").value.trim();
  const ex = document.getElementById("q-ex").value.trim();

  if (!word) return;

  const words = getWords();
  const newWord = {
    id: generateId(),
    word,
    pronunciation: "",
    definition: def,
    example: ex,
    category: selectedCategory,
    favorite: false,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  words.unshift(newWord);
  saveWords(words);
  addLog(`Saved "${word}"`, `Added to lexicon as ${selectedCategory}`, "add");

  document.getElementById("q-word").value = "";
  document.getElementById("q-def").value = "";
  document.getElementById("q-ex").value = "";

  document
    .querySelectorAll("#category-chips .chip")
    .forEach((c) => c.classList.remove("active"));
  document
    .querySelector('#category-chips .chip[data-cat="noun"]')
    .classList.add("active");
  selectedCategory = "noun";

  loadStats();
  loadActivity();
  showToast(`"${word}" saved to your lexicon!`);
}

function openModal() {
  document.getElementById("modal-backdrop").classList.add("open");
  setTimeout(() => document.getElementById("m-word").focus(), 300);
}

function closeModal() {
  document.getElementById("modal-backdrop").classList.remove("open");
  document.getElementById("m-word").value = "";
  document.getElementById("m-pronunciation").value = "";
  document.getElementById("m-def").value = "";
  document.getElementById("m-ex").value = "";
  document.getElementById("m-tags").value = "";
}

function handleBackdropClick(e) {
  if (e.target === document.getElementById("modal-backdrop")) closeModal();
}

function handleModalAdd() {
  const word = document.getElementById("m-word").value.trim();
  const pron = document.getElementById("m-pronunciation").value.trim();
  const def = document.getElementById("m-def").value.trim();
  const ex = document.getElementById("m-ex").value.trim();
  const cat = document.getElementById("m-cat").value;
  const tagsRaw = document.getElementById("m-tags").value.trim();

  if (!word) {
    document.getElementById("m-word").focus();
    return;
  }

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const words = getWords();
  words.unshift({
    id: generateId(),
    word,
    pronunciation: pron,
    definition: def,
    example: ex,
    category: cat,
    favorite: false,
    tags: tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  saveWords(words);
  addLog(`Saved "${word}"`, `Added as ${cat}`, "add");

  closeModal();
  loadStats();
  loadActivity();
  showToast(`"${word}" added!`);
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}