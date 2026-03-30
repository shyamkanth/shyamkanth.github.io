let allAnnouncements = [];
let filteredAnnouncements = [];
let selectedType = "all";
let sortOrder = "newest";

// ── Data ───────────────────────────────────────────────────────────────────
async function loadAnnouncements() {
  try {
    const response = await fetch("./data/announcements.json");
    if (!response.ok) throw new Error("Failed to load announcements");
    const data = await response.json();
    allAnnouncements = data.announcements || [];
    return allAnnouncements;
  } catch (error) {
    console.error("Error loading announcements:", error);
    return [];
  }
}

function getAllUniqueTypes() {
  const types = new Set();
  allAnnouncements.forEach((a) => {
    if (a.type) types.add(a.type);
  });
  return Array.from(types).sort();
}

function sortAnnouncements(list) {
  const sorted = [...list];
  sorted.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });
  return sorted;
}

// ── Filtering ──────────────────────────────────────────────────────────────
function filterAnnouncements(searchQuery, typeFilter) {
  filteredAnnouncements = allAnnouncements.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery) ||
      a.excerpt.toLowerCase().includes(searchQuery) ||
      a.type.toLowerCase().includes(searchQuery);

    const matchesType = typeFilter === "all" || a.type === typeFilter;

    return matchesSearch && matchesType;
  });

  filteredAnnouncements = sortAnnouncements(filteredAnnouncements);
  renderAnnouncementsGrid();
}

// ── Render: grid ───────────────────────────────────────────────────────────
function renderAnnouncementsGrid() {
  const grid = document.getElementById("announcementsGrid");
  const noResults = document.getElementById("noResults");

  if (!grid) return;

  if (filteredAnnouncements.length === 0) {
    grid.innerHTML = "";
    if (noResults) noResults.style.display = "flex";
    return;
  }

  if (noResults) noResults.style.display = "none";

  grid.innerHTML = filteredAnnouncements
    .map(
      (a) => `
    <article class="blog-card" data-id="${a.id}">
      <div class="blog-card-image">
        <img src="${a.thumbnail}" alt="${a.title}" loading="lazy" />
        <div class="blog-card-overlay">
          <span class="material-symbols-outlined read-more-icon">arrow_outward</span>
        </div>
      </div>
      <div class="blog-card-content">
        <div class="blog-card-meta">
          <time class="blog-card-date">${formatDate(a.date)}</time>
          <span class="announcement-type-badge type-${a.priority}">${a.type}</span>
        </div>
        <h2 class="blog-card-title">${a.title}</h2>
        <p class="blog-card-excerpt">${a.excerpt}</p>
        <a href="announcement.html?id=${a.id}" class="blog-card-link">
          Read Announcement →
        </a>
      </div>
    </article>
  `,
    )
    .join("");

  document.querySelectorAll(".blog-card[data-id]").forEach((card) => {
    card.addEventListener("click", () => {
      window.location.href = `announcement.html?id=${card.dataset.id}`;
    });
  });
}

// ── Render: type filter tags ───────────────────────────────────────────────
function renderTypesFilter() {
  const tagsContainer = document.getElementById("tagsContainer");
  if (!tagsContainer) return;

  const types = getAllUniqueTypes();
  tagsContainer.innerHTML = types
    .map(
      (type) => `
      <button class="tag-filter-btn" data-tag="${type}">
        <span class="tag-filter-dot"></span>
        ${type}
      </button>`,
    )
    .join("");

  // Re-bind after injection
  bindTypeFilterBtns();
}

function bindTypeFilterBtns() {
  const allBtns = document.querySelectorAll(".tag-filter-btn");
  const searchInput = document.getElementById("searchInput");

  allBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      allBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedType = btn.getAttribute("data-tag") || "all";
      filterAnnouncements(
        searchInput?.value.trim().toLowerCase() || "",
        selectedType,
      );
    });
  });
}

// ── Search + sort + sticky bar ─────────────────────────────────────────────
function initializeSearchAndFilter() {
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearch");
  const tagScrollBtn = document.getElementById("tagScrollBtn");
  const tagsContainer = document.querySelector(".tags-filter-container");
  const sortBtns = document.querySelectorAll(".sort-btn");

  initializeStickySearchBar();

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = query ? "block" : "none";
      filterAnnouncements(query, selectedType);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearBtn.style.display = "none";
      filterAnnouncements("", selectedType);
    });
  }

  sortBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sortBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      sortOrder = btn.getAttribute("data-sort");
      filterAnnouncements(
        searchInput?.value.trim().toLowerCase() || "",
        selectedType,
      );
    });
  });

  if (tagScrollBtn && tagsContainer) {
    tagScrollBtn.addEventListener("click", () => {
      tagsContainer.scrollBy({ left: 200, behavior: "smooth" });
    });
  }
}

function initializeStickySearchBar() {
  const searchSection = document.querySelector(".blog-search-section");
  const navbar = document.querySelector(".navbar");
  if (!searchSection) return;

  const initialTop = searchSection.offsetTop;

  window.addEventListener("scroll", () => {
    const navbarHeight = navbar ? navbar.offsetHeight : 68;
    if (window.scrollY > initialTop - navbarHeight) {
      searchSection.classList.add("sticky");
      searchSection.style.top = navbarHeight + "px";
    } else {
      searchSection.classList.remove("sticky");
      searchSection.style.top = "auto";
    }
  });
}

// ── Main init ──────────────────────────────────────────────────────────────
function initializeAnnouncementSystem() {
  loadAnnouncements().then(() => {
    filteredAnnouncements = sortAnnouncements(allAnnouncements);
    renderAnnouncementsGrid();
    renderTypesFilter();
    initializeSearchAndFilter();
  });
}

// ── Detail page ────────────────────────────────────────────────────────────
async function loadAndRenderAnnouncement() {
  const urlParams = new URLSearchParams(window.location.search);
  const announcementId = urlParams.get("id");

  if (!announcementId) {
    renderNotFound();
    return;
  }

  const list = await loadAnnouncements();
  const announcement = list.find((a) => a.id === announcementId);

  if (!announcement) {
    renderNotFound();
    return;
  }

  renderAnnouncement(announcement);
  renderRelatedAnnouncements(announcement, list);
  renderTableOfContents(announcement);

  document.title = `${announcement.title} - Shyam Sunder Kanth`;
}

function renderNotFound() {
  document.getElementById("main").innerHTML = `
          <div class="container">
            <div class="not-found">
              <div class="not-found-code">404</div>
              <h2>Announcement Not Found</h2>
              <p>The announcement you're looking for doesn't exist or has been moved.</p>
              <a href="/announcements/" class="btn-back">
                <span class="material-symbols-outlined">arrow_back</span>
                View All Announcements
              </a>
            </div>
          </div>`;
}

function renderAnnouncement(a) {
  const container = document.getElementById("articleContent");
  if (!container) return;

  let html = `
    <header class="article-header">
      <img src="${a.thumbnail}" alt="${a.title}" class="article-cover-image" />
      <div class="article-header-content">
        <h1 class="article-title">${a.title}</h1>
        <div class="article-meta">
          <div class="article-author">
            <span class="material-symbols-outlined">person</span>
            ${a.author}
          </div>
          <div class="article-date">
            <span class="material-symbols-outlined">calendar_today</span>
            ${formatDate(a.date)}
          </div>
          <div class="article-reading-time">
            <span class="material-symbols-outlined">campaign</span>
            <span class="announcement-type-badge type-${a.priority}">${a.type}</span>
          </div>
        </div>
      </div>
    </header>
    <div class="article-body">
  `;

  a.content.forEach((block, index) => {
    switch (block.type) {
      case "heading":
        const level = block.level || "h2";
        html += `<${level} class="article-heading" id="heading-${index}">${block.text}</${level}>`;
        break;

      case "paragraph":
        html += `<p class="article-paragraph">${block.text}</p>`;
        break;

      case "code":
        html += `
          <div class="article-code-block">
            <div class="code-header">
              <span class="code-language">${block.language || "code"}</span>
              <button class="copy-code-btn" data-code-index="${index}">
                <span class="material-symbols-outlined">content_copy</span>
                Copy
              </button>
            </div>
            <pre><code class="language-${block.language || "plaintext"}">${escapeHtml(block.text)}</code></pre>
          </div>`;
        break;

      case "image":
        html += `
          <figure class="article-figure">
            <img src="${block.src}" alt="${block.alt}" class="article-image" loading="lazy" />
            ${block.alt ? `<figcaption>${block.alt}</figcaption>` : ""}
          </figure>`;
        break;

      case "list":
        html += `
          <ul class="article-list">
            ${block.items.map((item) => `<li>${item}</li>`).join("")}
          </ul>`;
        break;

      case "quote":
        html += `
          <blockquote class="article-quote">
            <p>${block.text}</p>
            ${block.author ? `<footer>— ${block.author}</footer>` : ""}
          </blockquote>`;
        break;
    }
  });

  html += "</div>";
  container.innerHTML = html;

  // Syntax highlight
  container.querySelectorAll("pre code").forEach((block) => {
    if (typeof hljs !== "undefined") hljs.highlightElement(block);
  });

  // Copy buttons
  container.querySelectorAll(".copy-code-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-code-index"));
      const block = a.content[idx];
      if (block?.type === "code") {
        navigator.clipboard.writeText(block.text).then(() => {
          const original = btn.innerHTML;
          btn.innerHTML =
            '<span class="material-symbols-outlined">check</span> Copied!';
          setTimeout(() => (btn.innerHTML = original), 2000);
        });
      }
    });
  });
}

function renderTableOfContents(a) {
  const tocList = document.getElementById("tocList");
  if (!tocList) return;

  const headings = a.content.filter((b) => b.type === "heading");
  if (headings.length === 0) {
    tocList.parentElement.style.display = "none";
    return;
  }

  tocList.innerHTML = headings
    .map((heading) => {
      const level = parseInt(heading.level?.replace("h", "") || "2");
      const indent = (level - 2) * 12;
      const idx = a.content.indexOf(heading);
      return `
        <li style="margin-left:${indent}px">
          <a href="#heading-${idx}" class="toc-link">${heading.text}</a>
        </li>`;
    })
    .join("");
}

function renderRelatedAnnouncements(current, all) {
  const grid = document.getElementById("relatedArticlesGrid");
  if (!grid) return;

  const related = all
    .filter((a) => a.id !== current.id && a.type === current.type)
    .slice(0, 3);

  if (related.length === 0) {
    const section = grid.closest(".related-articles");
    if (section) section.style.display = "none";
    return;
  }

  grid.innerHTML = related
    .map(
      (a) => `
    <article class="blog-card-small">
      <div class="blog-card-image-small">
        <img src="${a.thumbnail}" alt="${a.title}" loading="lazy" />
      </div>
      <div class="blog-card-content-small">
        <time class="blog-card-date-small">${formatDate(a.date)}</time>
        <h3 class="blog-card-title-small">${a.title}</h3>
        <a href="announcement.html?id=${a.id}" class="blog-card-link-small">
          Read More →
        </a>
      </div>
    </article>`,
    )
    .join("");
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
