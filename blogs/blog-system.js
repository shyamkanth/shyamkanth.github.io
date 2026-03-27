// Blog System - Handles all blog functionality
let allBlogs = [];
let filteredBlogs = [];
let selectedTag = "all";
let sortOrder = "newest"; // 'newest' or 'oldest'

// ============================================
// DATA LOADING
// ============================================

async function loadBlogs() {
  try {
    const response = await fetch("./data/blogs.json");
    if (!response.ok) throw new Error("Failed to load blogs");
    const data = await response.json();
    allBlogs = data.blogs || [];
    return allBlogs;
  } catch (error) {
    console.error("Error loading blogs:", error);
    return [];
  }
}

function getAllUniqueTags() {
  const tags = new Set();
  allBlogs.forEach((blog) => {
    blog.tags?.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

// ============================================
// SORT FUNCTIONALITY
// ============================================

function sortBlogs(blogs) {
  const sorted = [...blogs];
  sorted.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (sortOrder === "newest") {
      return dateB - dateA; // Newest first (descending)
    } else {
      return dateA - dateB; // Oldest first (ascending)
    }
  });

  return sorted;
}

// ============================================
// SEARCH & FILTER
// ============================================

function initializeSearchAndFilter() {
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearch");
  const tagFilterBtns = document.querySelectorAll(".tag-filter-btn");
  const tagScrollBtn = document.getElementById("tagScrollBtn");
  const tagsContainer = document.querySelector(".tags-filter-container");
  const sortBtns = document.querySelectorAll(".sort-btn");

  // Initialize sticky search bar
  initializeStickySearchBar();

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      clearBtn.style.display = query ? "block" : "none";
      filterBlogs(query, selectedTag);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearBtn.style.display = "none";
      filterBlogs("", selectedTag);
    });
  }

  tagFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tagFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTag = btn.getAttribute("data-tag") || "all";
      const query = searchInput?.value.trim().toLowerCase() || "";
      filterBlogs(query, selectedTag);
    });
  });

  // Sort functionality
  sortBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sortBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      sortOrder = btn.getAttribute("data-sort");
      filterBlogs(searchInput?.value.trim().toLowerCase() || "", selectedTag);
    });
  });

  // Horizontal tag scrolling
  if (tagScrollBtn && tagsContainer) {
    tagScrollBtn.addEventListener("click", () => {
      tagsContainer.scrollBy({
        left: 200,
        behavior: "smooth",
      });
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
    const currentScroll = window.scrollY;

    // Check if scroll position is below the original position of search section
    if (currentScroll > initialTop - navbarHeight) {
      searchSection.classList.add("sticky");
      searchSection.style.top = navbarHeight + "px";
    } else {
      searchSection.classList.remove("sticky");
      searchSection.style.top = "auto";
    }
  });
}

function filterBlogs(searchQuery, tagFilter) {
  filteredBlogs = allBlogs.filter((blog) => {
    const matchesSearch =
      !searchQuery ||
      blog.title.toLowerCase().includes(searchQuery) ||
      blog.excerpt.toLowerCase().includes(searchQuery) ||
      blog.tags.some((tag) => tag.toLowerCase().includes(searchQuery));

    const matchesTag = tagFilter === "all" || blog.tags.includes(tagFilter);

    return matchesSearch && matchesTag;
  });

  // Apply sorting
  filteredBlogs = sortBlogs(filteredBlogs);

  renderBlogsGrid();
}

// ============================================
// RENDERING
// ============================================

function renderBlogsGrid() {
  const grid = document.getElementById("blogsGrid");
  const noResults = document.getElementById("noResults");

  if (!grid) return;

  if (filteredBlogs.length === 0) {
    grid.innerHTML = "";
    if (noResults) noResults.style.display = "flex";
    return;
  }

  if (noResults) noResults.style.display = "none";

  grid.innerHTML = filteredBlogs
    .map(
      (blog) => `
    <article class="blog-card">
      <div class="blog-card-image">
        <img src="${blog.thumbnail}" alt="${blog.title}" loading="lazy" />
        <div class="blog-card-overlay">
          <span class="material-symbols-outlined read-more-icon">arrow_outward</span>
        </div>
      </div>
      <div class="blog-card-content">
        <div class="blog-card-meta">
          <time class="blog-card-date">${formatDate(blog.date)}</time>
          <span class="blog-card-read-time">${blog.readTime}</span>
        </div>
        <h2 class="blog-card-title">${blog.title}</h2>
        <p class="blog-card-excerpt">${blog.excerpt}</p>
        <div class="blog-card-tags">
          ${blog.tags.map((tag) => `<span class="blog-tag">${tag}</span>`).join("")}
        </div>
        <a href="article.html?id=${blog.id}" class="blog-card-link">
          Read Article →
        </a>
      </div>
    </article>
  `,
    )
    .join("");

  // Add click event to cards
  document.querySelectorAll(".blog-card").forEach((card, index) => {
    card.addEventListener("click", () => {
      const blogId = filteredBlogs[index].id;
      window.location.href = `article.html?id=${blogId}`;
    });
  });
}

function renderTagsFilter() {
  const tagsContainer = document.getElementById("tagsContainer");
  if (!tagsContainer) return;

  const tags = getAllUniqueTags();
  tagsContainer.innerHTML = tags
    .map(
      (tag) =>
        `<button class="tag-filter-btn" data-tag="${tag}">
        <span class="tag-filter-dot"></span>
        ${tag}
      </button>`,
    )
    .join("");

  // Re-initialize click handlers for newly created buttons
  const tagFilterBtns = document.querySelectorAll(".tag-filter-btn");
  const searchInput = document.getElementById("searchInput");

  tagFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tagFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTag = btn.getAttribute("data-tag") || "all";
      const query = searchInput?.value.trim().toLowerCase() || "";
      filterBlogs(query, selectedTag);
    });
  });
}

function initializeBlogSystem() {
  loadBlogs().then(() => {
    filteredBlogs = allBlogs;
    // Apply initial sorting
    filteredBlogs = sortBlogs(filteredBlogs);
    renderBlogsGrid();
    renderTagsFilter();
    initializeSearchAndFilter();
  });
}

// ============================================
// ARTICLE PAGE
// ============================================

async function loadAndRenderArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id");

  if (!articleId) {
    window.location.href = "index.html";
    return;
  }

  const blogs = await loadBlogs();
  const article = blogs.find((b) => b.id === articleId);

  if (!article) {
    window.location.href = "index.html";
    return;
  }

  renderArticle(article);
  renderRelatedArticles(article, blogs);
  renderTableOfContents(article);

  // Update page title and meta tags
  document.title = `${article.title} - Shyam Sunder Kanth`;
}

function renderArticle(article) {
  const container = document.getElementById("articleContent");
  if (!container) return;

  let htmlContent = `
    <header class="article-header">
      <img src="${article.thumbnail}" alt="${article.title}" class="article-cover-image" />
      <div class="article-header-content">
        <h1 class="article-title">${article.title}</h1>
        <div class="article-meta">
          <div class="article-author">
            <span class="material-symbols-outlined">person</span>
            ${article.author}
          </div>
          <div class="article-date">
            <span class="material-symbols-outlined">calendar_today</span>
            ${formatDate(article.date)}
          </div>
          <div class="article-reading-time">
            <span class="material-symbols-outlined">schedule</span>
            ${article.readTime}
          </div>
        </div>
        <div class="article-tags">
          ${article.tags.map((tag) => `<span class="article-tag">${tag}</span>`).join("")}
        </div>
      </div>
    </header>

    <div class="article-body">
  `;

  // Render content blocks
  article.content.forEach((block, index) => {
    switch (block.type) {
      case "heading":
        const level = block.level || "h2";
        htmlContent += `<${level} class="article-heading" id="heading-${index}">${block.text}</${level}>`;
        break;

      case "paragraph":
        htmlContent += `<p class="article-paragraph">${block.text}</p>`;
        break;

      case "code":
        htmlContent += `
          <div class="article-code-block">
            <div class="code-header">
              <span class="code-language">${block.language || "code"}</span>
              <button class="copy-code-btn" data-code-index="${index}">
                <span class="material-symbols-outlined">content_copy</span>
                Copy
              </button>
            </div>
            <pre><code class="language-${block.language || "plaintext"}">${escapeHtml(block.text)}</code></pre>
          </div>
        `;
        break;

      case "image":
        htmlContent += `
          <figure class="article-figure">
            <img src="${block.src}" alt="${block.alt}" class="article-image" loading="lazy" />
            ${block.alt ? `<figcaption>${block.alt}</figcaption>` : ""}
          </figure>
        `;
        break;

      case "list":
        htmlContent += `
          <ul class="article-list">
            ${block.items.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        `;
        break;

      case "quote":
        htmlContent += `
          <blockquote class="article-quote">
            <p>${block.text}</p>
            ${block.author ? `<footer>— ${block.author}</footer>` : ""}
          </blockquote>
        `;
        break;
    }
  });

  htmlContent += "</div>";
  container.innerHTML = htmlContent;

  // Highlight code blocks
  container.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });

  // Add copy functionality to code blocks
  container.querySelectorAll(".copy-code-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const codeIndex = parseInt(btn.getAttribute("data-code-index"));
      const codeBlock = article.content[codeIndex];
      if (codeBlock && codeBlock.type === "code") {
        navigator.clipboard.writeText(codeBlock.text).then(() => {
          const originalText = btn.innerHTML;
          btn.innerHTML =
            '<span class="material-symbols-outlined">check</span> Copied!';
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        });
      }
    });
  });
}

function renderTableOfContents(article) {
  const tocList = document.getElementById("tocList");
  if (!tocList) return;

  const headings = article.content.filter((block) => block.type === "heading");

  if (headings.length === 0) {
    tocList.parentElement.style.display = "none";
    return;
  }

  tocList.innerHTML = headings
    .map((heading, index) => {
      const level = parseInt(heading.level?.replace("h", "") || "2");
      const indent = (level - 2) * 12;
      return `
        <li style="margin-left: ${indent}px;">
          <a href="#heading-${article.content.indexOf(heading)}" class="toc-link">
            ${heading.text}
          </a>
        </li>
      `;
    })
    .join("");
}

function renderRelatedArticles(currentArticle, allArticles) {
  const relatedGrid = document.getElementById("relatedArticlesGrid");
  if (!relatedGrid) return;

  // Find related articles by matching tags
  const related = allArticles
    .filter(
      (article) =>
        article.id !== currentArticle.id &&
        article.tags.some((tag) => currentArticle.tags.includes(tag)),
    )
    .slice(0, 3);

  if (related.length === 0) {
    relatedGrid.parentElement.style.display = "none";
    return;
  }

  relatedGrid.innerHTML = related
    .map(
      (article) => `
    <article class="blog-card-small">
      <div class="blog-card-image-small">
        <img src="${article.thumbnail}" alt="${article.title}" loading="lazy" />
      </div>
      <div class="blog-card-content-small">
        <time class="blog-card-date-small">${formatDate(article.date)}</time>
        <h3 class="blog-card-title-small">${article.title}</h3>
        <a href="article.html?id=${article.id}" class="blog-card-link-small">
          Read More →
        </a>
      </div>
    </article>
  `,
    )
    .join("");
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
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
