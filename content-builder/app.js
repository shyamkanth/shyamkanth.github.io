(function () {
  document.body.classList.add("locked");
  document.addEventListener("DOMContentLoaded", () => {
    const referrer = document.referrer;
    const isInternal = referrer.includes(window.location.origin);
    const isLocal =
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost";
    if (!isInternal && !isLocal) {
      document.getElementById("restrictedOverlay").classList.add("show");
      document.getElementById("welcomeOverlay")?.classList.remove("show");
    } else {
      document.body.classList.remove("locked");
    }
  });
})();

// ══════════════════════════════════════════════════════════════════
// TEMPLATES
// ══════════════════════════════════════════════════════════════════
const TEMPLATES = {
  blog: {
    meta: {
      title: "Your Blog Post Title",
      author: "Shyam Sunder Kanth",
      date: new Date().toISOString().split("T")[0],
      thumbnail:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
      tags: ["kotlin", "android"],
      readTime: "8 min read",
      excerpt:
        "A short summary of what this post is about. This appears on the blog listing card.",
    },
    content: [
      { type: "heading", text: "Introduction", level: "h2" },
      {
        type: "paragraph",
        text: "Start with a compelling introduction that sets the context for your readers. Explain what they'll learn and why it matters.",
      },
      { type: "heading", text: "Section One", level: "h2" },
      {
        type: "paragraph",
        text: "Describe the first major concept here. Keep paragraphs focused and readable.",
      },
      {
        type: "list",
        items: ["Key point one", "Key point two", "Key point three"],
      },
      { type: "heading", text: "Code Example", level: "h2" },
      {
        type: "code",
        language: "kotlin",
        text: '// Your code snippet here\nfun main() {\n    println("Hello, World!")\n}',
      },
      { type: "heading", text: "Conclusion", level: "h2" },
      {
        type: "paragraph",
        text: "Wrap up the key takeaways and next steps for the reader.",
      },
    ],
  },

  announcement: {
    meta: {
      title: "App Name vX.X — Feature Highlight",
      author: "Shyam Sunder Kanth",
      date: new Date().toISOString().split("T")[0],
      thumbnail:
        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=400&fit=crop",
      type: "RELEASE",
      priority: "info",
      excerpt:
        "Short description of this release or update shown on the announcements card.",
    },
    content: [
      { type: "heading", text: "What's New", level: "h2" },
      {
        type: "paragraph",
        text: "Summarise the release in one or two sentences. What changed, and why does it matter?",
      },
      { type: "heading", text: "Highlights", level: "h2" },
      {
        type: "list",
        items: [
          "New feature or improvement one",
          "New feature or improvement two",
          "Bug fix or performance improvement",
          "UI or UX enhancement",
        ],
      },
      { type: "heading", text: "Migration Note", level: "h2" },
      {
        type: "paragraph",
        text: "If users need to do anything on their end (clear cache, re-authenticate, update settings), mention it here.",
      },
      {
        type: "quote",
        text: "A memorable quote or mission statement about the release.",
        author: "Shyam Sunder Kanth",
      },
      { type: "heading", text: "Download", level: "h2" },
      {
        type: "paragraph",
        text: "The update is live on the Google Play Store. Search for the app or use the link in the Projects section.",
      },
    ],
  },

  privacy: {
    meta: {
      id: "your-app-id",
      appName: "Your App Name",
      tagline: "Short description of what the app does",
      emoji: "📱",
      platform: "Android",
      version: "1.0",
      effectiveDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      lastUpdated: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      tags: ["ANDROID", "LOCAL STORAGE"],
      contact: "you+appname@gmail.com",
      color: "#00ff87",
    },
    sections: [
      {
        type: "pp-section",
        id: "introduction",
        title: "Introduction",
        content:
          "Welcome to [App Name]. Your privacy is important to us. This Privacy Policy explains how our app handles your information, including what data we collect, how we use it, and your rights regarding that data.",
      },
      {
        type: "pp-section-sub",
        id: "information-we-collect",
        title: "Information We Collect",
        subsections: [
          {
            subtitle: "Personal Data",
            content:
              "We do not collect, store, or share any personal data such as your name, email address, or phone number.",
          },
          {
            subtitle: "Usage Data",
            content:
              "We may collect anonymous usage information such as app performance, error logs, and crash reports to improve the quality and stability of the app.",
          },
        ],
      },
      {
        type: "pp-section-list",
        id: "how-we-use",
        title: "How We Use Information",
        content: "",
        list: [
          "To provide core app functionality.",
          "To analyze app performance and fix bugs or crashes.",
        ],
      },
      {
        type: "pp-section",
        id: "data-security",
        title: "Data Security",
        content:
          "Your data security is our priority. All data is stored locally on your device and never uploaded to our servers. You are in full control of your information at all times.",
      },
      {
        type: "pp-section",
        id: "data-sharing",
        title: "Data Sharing",
        content:
          "We do not share, sell, or transmit your personal information to any third parties.",
      },
      {
        type: "pp-section",
        id: "third-party",
        title: "Third-Party Services",
        content:
          "The app may use third-party libraries such as Firebase for crash reporting. These services collect only non-identifiable information to help improve app stability.",
      },
      {
        type: "pp-section",
        id: "your-rights",
        title: "Your Rights",
        content:
          "Since all your data is stored locally on your device, you may manage, delete, or back up your information at any time through the app's settings.",
      },
      {
        type: "pp-section",
        id: "changes",
        title: "Changes to This Privacy Policy",
        content:
          "We may update this Privacy Policy from time to time. Changes will be posted within the app and on this page with an updated effective date.",
      },
      {
        type: "pp-contact",
        id: "contact",
        title: "Contact Us",
        content:
          "If you have any questions or concerns about this Privacy Policy or the app, please contact us at:",
        contactEmail: "you+appname@gmail.com",
      },
    ],
  },
};

// ══════════════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════════════
let mode = "blog";
let blocks = [];
let dragSrc = null;
let blockCounter = 0;

// ══════════════════════════════════════════════════════════════════
// MODE CONFIG
// ══════════════════════════════════════════════════════════════════
const MODES = {
  blog: {
    label: "Blog Post",
    icon: "article",
    metaFields: [
      {
        id: "title",
        label: "Title",
        type: "input",
        placeholder: "Your blog post title...",
      },
      {
        id: "author",
        label: "Author",
        type: "input",
        placeholder: "Shyam Sunder Kanth",
        defaultVal: "Shyam Sunder Kanth",
      },
      { id: "date", label: "Date", type: "date" },
      {
        id: "thumbnail",
        label: "Thumbnail URL",
        type: "input",
        placeholder: "https://...",
      },
      {
        id: "tags",
        label: "Tags",
        type: "tags",
        placeholder: "Add tag + Enter",
      },
      {
        id: "readTime",
        label: "Read Time",
        type: "input",
        placeholder: "8 min read",
      },
      {
        id: "excerpt",
        label: "Excerpt",
        type: "textarea",
        placeholder: "Short summary shown on the card...",
      },
    ],
  },
  announcement: {
    label: "Announcement",
    icon: "campaign",
    metaFields: [
      {
        id: "title",
        label: "Title",
        type: "input",
        placeholder: "Announcement title...",
      },
      {
        id: "author",
        label: "Author",
        type: "input",
        placeholder: "Shyam Sunder Kanth",
        defaultVal: "Shyam Sunder Kanth",
      },
      { id: "date", label: "Date", type: "date" },
      {
        id: "thumbnail",
        label: "Thumbnail URL",
        type: "input",
        placeholder: "https://...",
      },
      {
        id: "type",
        label: "Type",
        type: "select",
        options: ["RELEASE", "UPDATE", "NEWS"],
      },
      {
        id: "priority",
        label: "Priority",
        type: "select",
        options: ["info", "warning", "critical"],
      },
      {
        id: "excerpt",
        label: "Excerpt",
        type: "textarea",
        placeholder: "Short summary shown on the card...",
      },
    ],
  },
  privacy: {
    label: "Privacy Policy",
    icon: "policy",
    metaFields: [
      {
        id: "id",
        label: "App ID (slug)",
        type: "input",
        placeholder: "password-vault",
      },
      {
        id: "appName",
        label: "App Name",
        type: "input",
        placeholder: "Password Vault",
      },
      {
        id: "tagline",
        label: "Tagline",
        type: "input",
        placeholder: "Short description of the app...",
      },
      { id: "emoji", label: "Emoji", type: "input", placeholder: "🔐" },
      {
        id: "platform",
        label: "Platform",
        type: "select",
        options: ["Android", "iOS", "Web", "Cross-platform"],
      },
      { id: "version", label: "Version", type: "input", placeholder: "1.0" },
      {
        id: "effectiveDate",
        label: "Effective Date",
        type: "input",
        placeholder: "September 9, 2025",
      },
      {
        id: "lastUpdated",
        label: "Last Updated",
        type: "input",
        placeholder: "September 9, 2025",
      },
      {
        id: "tags",
        label: "Tags",
        type: "tags",
        placeholder: "Add tag + Enter",
      },
      {
        id: "contact",
        label: "Contact Email",
        type: "input",
        placeholder: "you+appname@gmail.com",
      },
      {
        id: "color",
        label: "Accent Color",
        type: "input",
        placeholder: "#00ff87",
        defaultVal: "#00ff87",
      },
    ],
  },
};

const BLOCK_TYPES = {
  blog: [
    { type: "heading", icon: "title", label: "Heading" },
    { type: "paragraph", icon: "notes", label: "Paragraph" },
    { type: "code", icon: "code", label: "Code" },
    { type: "list", icon: "format_list_bulleted", label: "List" },
    { type: "quote", icon: "format_quote", label: "Quote" },
    { type: "image", icon: "image", label: "Image" },
  ],
  announcement: [
    { type: "heading", icon: "title", label: "Heading" },
    { type: "paragraph", icon: "notes", label: "Paragraph" },
    { type: "code", icon: "code", label: "Code" },
    { type: "list", icon: "format_list_bulleted", label: "List" },
    { type: "quote", icon: "format_quote", label: "Quote" },
    { type: "image", icon: "image", label: "Image" },
  ],
  privacy: [
    { type: "pp-section", icon: "segment", label: "Section" },
    {
      type: "pp-section-list",
      icon: "format_list_bulleted",
      label: "Section + List",
    },
    { type: "pp-section-sub", icon: "account_tree", label: "Subsections" },
    { type: "pp-contact", icon: "alternate_email", label: "Contact Section" },
  ],
};

// ══════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  renderMeta();
  renderBlockTypes();
  renderCanvas();
  bindTopNav();
  bindSidebarMobile();
  setDefaultDate();
  showWelcomeDialog();
  bindImportModal();
});

function setDefaultDate() {
  const dateInput = document.getElementById("meta-date");
  if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
}

// ══════════════════════════════════════════════════════════════════
// WELCOME DIALOG
// ══════════════════════════════════════════════════════════════════
function showWelcomeDialog() {
  const overlay = document.getElementById("welcomeOverlay");
  overlay.classList.add("show");

  document.getElementById("welcomeNewBtn").addEventListener("click", () => {
    overlay.classList.remove("show");
    showToast("Starting fresh — pick a mode and add blocks!");
  });

  document.getElementById("welcomeImportBtn").addEventListener("click", () => {
    overlay.classList.remove("show");
    showImportModal();
  });

  // Template cards
  document.querySelectorAll(".welcome-template-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tpl = btn.dataset.template;
      overlay.classList.remove("show");
      loadTemplate(tpl);
    });
  });
}

// ══════════════════════════════════════════════════════════════════
// LOAD TEMPLATE
// ══════════════════════════════════════════════════════════════════
function loadTemplate(templateKey) {
  const tpl = TEMPLATES[templateKey];
  if (!tpl) return;

  // Switch mode
  const targetMode = templateKey; // "blog" | "announcement" | "privacy"
  if (targetMode !== mode) {
    mode = targetMode;
    blocks = [];
    document
      .querySelectorAll(".mode-btn")
      .forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    renderMeta();
    renderBlockTypes();
  } else {
    blocks = [];
  }

  // Fill meta fields
  if (mode === "privacy") {
    _fillMetaFields(tpl.meta, mode);
    fillPrivacyBlocks({ sections: tpl.sections });
  } else {
    _fillMetaFields(tpl.meta, mode);
    fillContentBlocks(tpl.content || []);
  }

  renderCanvas();

  const names = {
    blog: "Article",
    announcement: "Announcement",
    privacy: "Privacy Policy",
  };
  showToast(
    `${names[templateKey]} template loaded — ${blocks.length} blocks ready`,
  );
}

// shared meta filler used by both template and import
function _fillMetaFields(metaObj, targetMode) {
  const cfg = MODES[targetMode];
  cfg.metaFields.forEach((f) => {
    if (f.type === "tags") {
      const input = document.getElementById("tags-bare-input");
      if (input && Array.isArray(metaObj.tags)) {
        input._tags = [...metaObj.tags];
        renderTagChips(input._tags);
      }
    } else if (f.type === "select") {
      const el = document.getElementById(`meta-${f.id}`);
      if (el && metaObj[f.id] !== undefined) {
        // set matching option
        const opt = Array.from(el.options).find(
          (o) => o.value.toLowerCase() === String(metaObj[f.id]).toLowerCase(),
        );
        if (opt) el.value = opt.value;
      }
    } else {
      const el = document.getElementById(`meta-${f.id}`);
      if (el && metaObj[f.id] !== undefined && metaObj[f.id] !== null) {
        el.value = metaObj[f.id];
      }
    }
  });
}

// ══════════════════════════════════════════════════════════════════
// IMPORT MODAL
// ══════════════════════════════════════════════════════════════════
function bindImportModal() {
  document
    .getElementById("importBtn")
    .addEventListener("click", showImportModal);
  document
    .getElementById("importModalClose")
    .addEventListener("click", hideImportModal);
  document
    .getElementById("importCancelBtn")
    .addEventListener("click", hideImportModal);
  document
    .getElementById("importConfirmBtn")
    .addEventListener("click", doImport);
  document
    .getElementById("importClearInputBtn")
    .addEventListener("click", () => {
      document.getElementById("importJsonInput").value = "";
      hideImportError();
      hideImportDetected();
    });
  document.getElementById("importOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("importOverlay"))
      hideImportModal();
  });
  document.getElementById("importJsonInput").addEventListener("input", () => {
    const val = document.getElementById("importJsonInput").value.trim();
    hideImportError();
    if (!val) {
      hideImportDetected();
      return;
    }
    try {
      const obj = JSON.parse(val);
      const detected = detectImportType(obj);
      if (detected) showImportDetected(detected);
      else hideImportDetected();
    } catch (e) {
      hideImportDetected();
    }
  });
}

function showImportModal() {
  document.getElementById("importJsonInput").value = "";
  hideImportError();
  hideImportDetected();
  document.getElementById("importOverlay").classList.add("show");
  setTimeout(() => document.getElementById("importJsonInput").focus(), 300);
}
function hideImportModal() {
  document.getElementById("importOverlay").classList.remove("show");
}
function showImportError(msg) {
  const el = document.getElementById("importError");
  document.getElementById("importErrorMsg").textContent = msg;
  el.style.display = "flex";
}
function hideImportError() {
  document.getElementById("importError").style.display = "none";
}

function showImportDetected(type) {
  let existing = document.getElementById("importDetectedBadge");
  if (!existing) {
    existing = document.createElement("div");
    existing.id = "importDetectedBadge";
    existing.className = "import-detected";
    existing.innerHTML = `<span class="material-symbols-outlined mi">check_circle</span><span></span>`;
    document.querySelector(".import-modal-body").appendChild(existing);
  }
  const labels = {
    blog: "Blog Post",
    announcement: "Announcement",
    privacy: "Privacy Policy",
  };
  existing.querySelector("span:last-child").textContent =
    `Detected: ${labels[type] || type}`;
  existing.style.display = "flex";
}
function hideImportDetected() {
  const el = document.getElementById("importDetectedBadge");
  if (el) el.style.display = "none";
}

function detectImportType(obj) {
  if (obj.appName || obj.sections || obj.effectiveDate || obj.lastUpdated)
    return "privacy";
  if (obj.type && ["RELEASE", "UPDATE", "NEWS"].includes(obj.type))
    return "announcement";
  if (obj.priority && ["info", "warning", "critical"].includes(obj.priority))
    return "announcement";
  if (obj.content && Array.isArray(obj.content)) {
    if (obj.readTime) return "blog";
    if (obj.content.length > 0) return "blog";
  }
  if (obj.title && obj.excerpt) return "blog";
  return null;
}

function doImport() {
  const raw = document.getElementById("importJsonInput").value.trim();
  if (!raw) {
    showImportError("Please paste a JSON object first.");
    return;
  }
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    showImportError("Invalid JSON — " + e.message);
    return;
  }
  const detectedMode = detectImportType(obj);
  if (!detectedMode) {
    showImportError("Could not detect content type.");
    return;
  }

  if (detectedMode !== mode) {
    mode = detectedMode;
    blocks = [];
    document
      .querySelectorAll(".mode-btn")
      .forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    renderMeta();
    renderBlockTypes();
  } else {
    blocks = [];
  }

  hideImportModal();

  if (mode === "privacy") {
    _fillMetaFields(obj, mode);
    fillPrivacyBlocks(obj);
  } else {
    _fillMetaFields(obj, mode);
    fillContentBlocks(obj.content || []);
  }

  renderCanvas();
  const labels = {
    blog: "Blog Post",
    announcement: "Announcement",
    privacy: "Privacy Policy",
  };
  showToast(
    `Imported ${labels[detectedMode]} — ${blocks.length} block${blocks.length !== 1 ? "s" : ""} loaded`,
  );
}

// ── Fill blog/announcement content blocks ──────────────────────
function fillContentBlocks(contentArray) {
  blocks = [];
  contentArray.forEach((item) => {
    const id = ++blockCounter;
    let data = {};
    switch (item.type) {
      case "heading":
        data = { text: item.text || "", level: item.level || "h2" };
        break;
      case "paragraph":
        data = { text: item.text || "" };
        break;
      case "code":
        data = { text: item.text || "", language: item.language || "kotlin" };
        break;
      case "list":
        data = {
          items:
            Array.isArray(item.items) && item.items.length
              ? [...item.items]
              : [""],
        };
        break;
      case "quote":
        data = { text: item.text || "", author: item.author || "" };
        break;
      case "image":
        data = { src: item.src || "", alt: item.alt || "" };
        break;
      default:
        data = {};
    }
    blocks.push({ id, type: item.type, data });
  });
}

// ── Fill privacy sections ───────────────────────────────────────
function fillPrivacyBlocks(obj) {
  blocks = [];
  const sections = obj.sections || [];
  sections.forEach((section) => {
    const id = ++blockCounter;
    let type, data;
    if (section.contactEmail !== undefined) {
      type = "pp-contact";
      data = {
        id: section.id || "contact",
        title: section.title || "Contact Us",
        content: section.content || "",
        contactEmail: section.contactEmail || "",
      };
    } else if (
      Array.isArray(section.subsections) &&
      section.subsections.length > 0
    ) {
      type = "pp-section-sub";
      data = {
        id: section.id || "",
        title: section.title || "",
        subsections: section.subsections.map((sub) => ({
          subtitle: sub.subtitle || "",
          content: sub.content || "",
        })),
      };
    } else if (Array.isArray(section.list)) {
      type = "pp-section-list";
      data = {
        id: section.id || "",
        title: section.title || "",
        content: section.content || "",
        list: section.list.length ? [...section.list] : [""],
      };
    } else {
      type = "pp-section";
      data = {
        id: section.id || "",
        title: section.title || "",
        content: section.content || "",
      };
    }
    blocks.push({ id, type, data });
  });
}

// ══════════════════════════════════════════════════════════════════
// TOP NAV
// ══════════════════════════════════════════════════════════════════
function bindTopNav() {
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const m = btn.dataset.mode;
      if (m === mode) return;
      mode = m;
      blocks = [];
      document
        .querySelectorAll(".mode-btn")
        .forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
      renderMeta();
      renderBlockTypes();
      renderCanvas();
      setDefaultDate();
    });
  });
  document.getElementById("clearBtn").addEventListener("click", () => {
    if (blocks.length === 0) return;
    if (confirm("Clear all blocks?")) {
      blocks = [];
      renderCanvas();
    }
  });
  document
    .getElementById("generateBtn")
    .addEventListener("click", generateOutput);
}

// ══════════════════════════════════════════════════════════════════
// SIDEBAR — META FIELDS
// ══════════════════════════════════════════════════════════════════
function renderMeta() {
  const container = document.getElementById("metaFields");
  const cfg = MODES[mode];
  container.innerHTML = cfg.metaFields
    .map((f) => {
      if (f.type === "input" || f.type === "date") {
        return `<div class="meta-field"><label class="meta-label" for="meta-${f.id}">${f.label}</label><input class="meta-input" id="meta-${f.id}" type="${f.type === "date" ? "date" : "text"}" placeholder="${f.placeholder || ""}" value="${f.defaultVal || ""}" /></div>`;
      }
      if (f.type === "textarea") {
        return `<div class="meta-field"><label class="meta-label" for="meta-${f.id}">${f.label}</label><textarea class="meta-textarea" id="meta-${f.id}" placeholder="${f.placeholder || ""}"></textarea></div>`;
      }
      if (f.type === "select") {
        return `<div class="meta-field"><label class="meta-label" for="meta-${f.id}">${f.label}</label><select class="meta-select" id="meta-${f.id}">${f.options.map((o) => `<option value="${o}">${o}</option>`).join("")}</select></div>`;
      }
      if (f.type === "tags") {
        return `<div class="meta-field"><label class="meta-label">${f.label}</label><div class="tags-input-wrapper" id="tags-wrapper" onclick="document.getElementById('tags-bare-input').focus()"><input class="tags-bare-input" id="tags-bare-input" placeholder="${f.placeholder || ""}" /></div></div>`;
      }
      return "";
    })
    .join("");

  const tagsInput = document.getElementById("tags-bare-input");
  if (tagsInput) {
    tagsInput._tags = [];
    tagsInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const val = tagsInput.value.trim().replace(/,$/, "");
        if (val && !tagsInput._tags.includes(val)) {
          tagsInput._tags.push(val);
          renderTagChips(tagsInput._tags);
        }
        tagsInput.value = "";
      }
      if (e.key === "Backspace" && !tagsInput.value && tagsInput._tags.length) {
        tagsInput._tags.pop();
        renderTagChips(tagsInput._tags);
      }
    });
  }
}

function renderTagChips(tags) {
  const wrapper = document.getElementById("tags-wrapper");
  const input = document.getElementById("tags-bare-input");
  if (!wrapper || !input) return;
  wrapper.querySelectorAll(".tag-chip").forEach((c) => c.remove());
  tags.forEach((tag, i) => {
    const chip = document.createElement("span");
    chip.className = "tag-chip";
    chip.innerHTML = `${tag}<button class="tag-chip-remove" data-idx="${i}" title="Remove">×</button>`;
    chip.querySelector(".tag-chip-remove").addEventListener("click", () => {
      tags.splice(i, 1);
      renderTagChips(tags);
    });
    wrapper.insertBefore(chip, input);
  });
}

function getTags() {
  const input = document.getElementById("tags-bare-input");
  return input ? [...(input._tags || [])] : [];
}

// ══════════════════════════════════════════════════════════════════
// SIDEBAR — BLOCK TYPE BUTTONS
// ══════════════════════════════════════════════════════════════════
function renderBlockTypes() {
  const container = document.getElementById("blockTypesBtns");
  const types = BLOCK_TYPES[mode] || BLOCK_TYPES.blog;
  container.innerHTML = types
    .map(
      (bt) =>
        `<button class="block-type-btn" data-type="${bt.type}" title="Add ${bt.label}"><span class="material-symbols-outlined mi">${bt.icon}</span><span>${bt.label}</span></button>`,
    )
    .join("");
  container.querySelectorAll(".block-type-btn").forEach((btn) => {
    btn.addEventListener("click", () => addBlock(btn.dataset.type));
  });
}

// ══════════════════════════════════════════════════════════════════
// CANVAS
// ══════════════════════════════════════════════════════════════════
function renderCanvas() {
  const canvas = document.getElementById("canvas");
  if (blocks.length === 0) {
    canvas.innerHTML = `<div class="canvas-empty" id="canvasEmpty"><span class="material-symbols-outlined mi">add_box</span><h3>Start Building</h3><p>Click a block type in the sidebar to add content. Drag to reorder.</p></div>`;
  } else {
    canvas.innerHTML = `<div class="blocks-list" id="blocksList"></div>`;
    const list = document.getElementById("blocksList");
    blocks.forEach((block) => list.appendChild(createBlockEl(block)));
    initDragDrop();
  }
}

function addBlock(type) {
  const id = ++blockCounter;
  const block = { id, type, data: defaultData(type) };
  blocks.push(block);
  const canvas = document.getElementById("canvas");
  const empty = document.getElementById("canvasEmpty");
  if (empty) {
    canvas.innerHTML = `<div class="blocks-list" id="blocksList"></div>`;
    initDragDrop();
  }
  const list = document.getElementById("blocksList");
  const el = createBlockEl(block);
  list.appendChild(el);
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  initDragDrop();
  showToast(
    `${type.replace("pp-", "").charAt(0).toUpperCase() + type.replace("pp-", "").slice(1)} block added`,
  );
}

function defaultData(type) {
  switch (type) {
    case "heading":
      return { text: "", level: "h2" };
    case "paragraph":
      return { text: "" };
    case "code":
      return { text: "", language: "kotlin" };
    case "list":
      return { items: [""] };
    case "quote":
      return { text: "", author: "" };
    case "image":
      return { src: "", alt: "" };
    case "pp-section":
      return { id: "", title: "", content: "" };
    case "pp-section-list":
      return { id: "", title: "", content: "", list: [""] };
    case "pp-section-sub":
      return {
        id: "",
        title: "",
        subsections: [{ subtitle: "", content: "" }],
      };
    case "pp-contact":
      return {
        id: "contact",
        title: "Contact Us",
        content:
          "If you have any questions or concerns about this Privacy Policy or the app, please contact us at:",
        contactEmail: "",
      };
    default:
      return {};
  }
}

// ══════════════════════════════════════════════════════════════════
// BLOCK ELEMENT BUILDER
// ══════════════════════════════════════════════════════════════════
function createBlockEl(block) {
  const el = document.createElement("div");
  el.className = "block-item";
  el.dataset.id = block.id;
  el.draggable = true;
  const allTypes = [...BLOCK_TYPES.blog, ...BLOCK_TYPES.privacy];
  const bt = allTypes.find((b) => b.type === block.type);
  el.innerHTML = `
    <div class="block-header" title="Drag to reorder">
      <span class="drag-handle"><span class="material-symbols-outlined mi">drag_indicator</span></span>
      <span class="block-type-label">${bt?.label || block.type}</span>
      <div class="block-actions">
        <button class="block-action-btn delete" title="Delete block"><span class="material-symbols-outlined mi">delete</span></button>
      </div>
    </div>
    <div class="block-body">${buildBlockBody(block)}</div>`;
  el.querySelector(".block-action-btn.delete").addEventListener("click", () => {
    blocks = blocks.filter((b) => b.id !== block.id);
    el.style.animation = "blockOut 0.2s ease forwards";
    setTimeout(() => {
      el.remove();
      if (blocks.length === 0) renderCanvas();
    }, 200);
  });
  bindBlockInputs(el, block);
  return el;
}

const styleSheet = document.styleSheets[0];
try {
  styleSheet.insertRule(
    `@keyframes blockOut { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(0.96) translateY(-6px)} }`,
    styleSheet.cssRules.length,
  );
} catch (e) {}

function buildBlockBody(block) {
  switch (block.type) {
    case "heading":
      return `<div class="block-row"><select class="block-select" data-field="level" style="max-width:90px"><option value="h2" ${block.data.level === "h2" ? "selected" : ""}>H2</option><option value="h3" ${block.data.level === "h3" ? "selected" : ""}>H3</option></select><input class="block-input" data-field="text" placeholder="Heading text..." value="${esc(block.data.text)}" /></div>`;
    case "paragraph":
      return `<textarea class="block-textarea" data-field="text" placeholder="Write your paragraph...">${esc(block.data.text)}</textarea>`;
    case "code":
      return `<select class="block-select" data-field="language">${["kotlin", "java", "typescript", "javascript", "python", "xml", "json", "bash", "plaintext"].map((l) => `<option value="${l}" ${block.data.language === l ? "selected" : ""}>${l}</option>`).join("")}</select><textarea class="block-code-area" data-field="text" placeholder="Paste your code here...">${esc(block.data.text)}</textarea>`;
    case "list":
      return `<div class="list-items" data-list-container>${(block.data.items || [""]).map((item, i) => `<div class="list-item-row" data-index="${i}"><input class="block-input" data-field="items" data-index="${i}" placeholder="List item ${i + 1}..." value="${esc(item)}" /><button class="list-item-remove" data-remove-index="${i}" title="Remove"><span class="material-symbols-outlined mi">remove</span></button></div>`).join("")}</div><button class="add-list-item-btn" data-add-item><span class="material-symbols-outlined mi">add</span> Add Item</button>`;
    case "quote":
      return `<label class="field-label">Quote Text</label><textarea class="block-textarea" data-field="text" placeholder="Quote text...">${esc(block.data.text)}</textarea><label class="field-label">Author (optional)</label><input class="block-input" data-field="author" placeholder="Author name..." value="${esc(block.data.author)}" />`;
    case "image":
      return `<label class="field-label">Image URL</label><input class="block-input" data-field="src" placeholder="https://..." value="${esc(block.data.src)}" /><label class="field-label">Alt Text / Caption</label><input class="block-input" data-field="alt" placeholder="Describe the image..." value="${esc(block.data.alt)}" />`;
    case "pp-section":
      return `<div class="block-row"><div style="flex:1"><label class="field-label">Section ID</label><input class="block-input" data-field="id" placeholder="data-security" value="${esc(block.data.id)}" /></div><div style="flex:2"><label class="field-label">Section Title</label><input class="block-input" data-field="title" placeholder="Data Security" value="${esc(block.data.title)}" /></div></div><label class="field-label">Content</label><textarea class="block-textarea" data-field="content" placeholder="Section content...">${esc(block.data.content)}</textarea>`;
    case "pp-section-list":
      return `<div class="block-row"><div style="flex:1"><label class="field-label">Section ID</label><input class="block-input" data-field="id" placeholder="how-we-use" value="${esc(block.data.id)}" /></div><div style="flex:2"><label class="field-label">Section Title</label><input class="block-input" data-field="title" placeholder="How We Use Information" value="${esc(block.data.title)}" /></div></div><label class="field-label">Intro Content (optional)</label><textarea class="block-textarea" data-field="content" placeholder="Optional intro paragraph before the list...">${esc(block.data.content)}</textarea><label class="field-label">List Items</label><div class="list-items" data-list-container>${(block.data.list || [""]).map((item, i) => `<div class="list-item-row" data-index="${i}"><input class="block-input" data-field="list" data-index="${i}" placeholder="List item ${i + 1}..." value="${esc(item)}" /><button class="list-item-remove" data-remove-index="${i}" title="Remove"><span class="material-symbols-outlined mi">remove</span></button></div>`).join("")}</div><button class="add-list-item-btn" data-add-item><span class="material-symbols-outlined mi">add</span> Add Item</button>`;
    case "pp-section-sub":
      return `<div class="block-row"><div style="flex:1"><label class="field-label">Section ID</label><input class="block-input" data-field="id" placeholder="information-we-collect" value="${esc(block.data.id)}" /></div><div style="flex:2"><label class="field-label">Section Title</label><input class="block-input" data-field="title" placeholder="Information We Collect" value="${esc(block.data.title)}" /></div></div><label class="field-label">Subsections</label><div class="subsections-container" data-subsections-container>${(block.data.subsections || []).map((sub, i) => buildSubsectionRow(sub, i)).join("")}</div><button class="add-list-item-btn" data-add-subsection><span class="material-symbols-outlined mi">add</span> Add Subsection</button>`;
    case "pp-contact":
      return `<div class="block-row"><div style="flex:1"><label class="field-label">Section ID</label><input class="block-input" data-field="id" placeholder="contact" value="${esc(block.data.id)}" /></div><div style="flex:2"><label class="field-label">Section Title</label><input class="block-input" data-field="title" placeholder="Contact Us" value="${esc(block.data.title)}" /></div></div><label class="field-label">Content</label><textarea class="block-textarea" data-field="content" placeholder="If you have any questions...">${esc(block.data.content)}</textarea><label class="field-label">Contact Email</label><input class="block-input" data-field="contactEmail" placeholder="you+appname@gmail.com" value="${esc(block.data.contactEmail)}" />`;
    default:
      return "";
  }
}

function buildSubsectionRow(sub, i) {
  return `<div class="pp-subsection-row" data-sub-index="${i}" style="background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:12px;margin-bottom:8px;"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;"><span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;">Subsection ${i + 1}</span><button class="block-action-btn delete" data-remove-sub="${i}" title="Remove subsection" style="width:24px;height:24px;"><span class="material-symbols-outlined mi">remove</span></button></div><label class="field-label" style="margin-top:0">Subtitle</label><input class="block-input" data-sub-field="subtitle" data-sub-index="${i}" placeholder="Personal Data" value="${esc(sub.subtitle)}" /><label class="field-label">Content</label><textarea class="block-textarea" data-sub-field="content" data-sub-index="${i}" placeholder="Subsection content...">${esc(sub.content)}</textarea></div>`;
}

// ══════════════════════════════════════════════════════════════════
// BIND BLOCK INPUTS
// ══════════════════════════════════════════════════════════════════
function bindBlockInputs(el, block) {
  el.querySelectorAll("[data-field]").forEach((input) => {
    const field = input.dataset.field;
    const idx = input.dataset.index;
    const evt =
      input.tagName === "TEXTAREA" || input.tagName === "INPUT"
        ? "input"
        : "change";
    input.addEventListener(evt, () => {
      if (field === "items") block.data.items[parseInt(idx)] = input.value;
      else if (field === "list") block.data.list[parseInt(idx)] = input.value;
      else block.data[field] = input.value;
    });
  });
  el.querySelectorAll("[data-sub-field]").forEach((input) => {
    const field = input.dataset.subField;
    const idx = parseInt(input.dataset.subIndex);
    const evt =
      input.tagName === "TEXTAREA" || input.tagName === "INPUT"
        ? "input"
        : "change";
    input.addEventListener(evt, () => {
      if (!block.data.subsections) block.data.subsections = [];
      if (!block.data.subsections[idx]) block.data.subsections[idx] = {};
      block.data.subsections[idx][field] = input.value;
    });
  });
  const addSubBtn = el.querySelector("[data-add-subsection]");
  if (addSubBtn) {
    addSubBtn.addEventListener("click", () => {
      if (!block.data.subsections) block.data.subsections = [];
      const newSub = { subtitle: "", content: "" };
      block.data.subsections.push(newSub);
      const container = el.querySelector("[data-subsections-container]");
      const i = block.data.subsections.length - 1;
      const div = document.createElement("div");
      div.innerHTML = buildSubsectionRow(newSub, i);
      const row = div.firstElementChild;
      container.appendChild(row);
      bindSubsectionRow(row, block, i);
    });
  }
  el.querySelectorAll("[data-remove-sub]").forEach((btn) => {
    btn.addEventListener("click", () =>
      removeSubsection(el, block, parseInt(btn.dataset.removeSub)),
    );
  });
  const addBtn = el.querySelector("[data-add-item]");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const isPrivacyList = block.type === "pp-section-list";
      const arr = isPrivacyList ? block.data.list : block.data.items;
      arr.push("");
      const container = el.querySelector("[data-list-container]");
      const i = arr.length - 1;
      const row = document.createElement("div");
      row.className = "list-item-row";
      row.dataset.index = i;
      row.innerHTML = `<input class="block-input" data-field="${isPrivacyList ? "list" : "items"}" data-index="${i}" placeholder="List item ${i + 1}..." /><button class="list-item-remove" data-remove-index="${i}" title="Remove"><span class="material-symbols-outlined mi">remove</span></button>`;
      const newInput = row.querySelector("input");
      newInput.addEventListener("input", () => {
        arr[i] = newInput.value;
      });
      row.querySelector(".list-item-remove").addEventListener("click", () => {
        if (isPrivacyList) removePrivacyListItem(el, block, i);
        else removeListItem(el, block, i);
      });
      container.appendChild(row);
      newInput.focus();
    });
  }
  el.querySelectorAll("[data-remove-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.removeIndex);
      if (block.type === "pp-section-list") removePrivacyListItem(el, block, i);
      else removeListItem(el, block, i);
    });
  });
}

function bindSubsectionRow(row, block, i) {
  row.querySelectorAll("[data-sub-field]").forEach((input) => {
    const field = input.dataset.subField;
    const evt =
      input.tagName === "TEXTAREA" || input.tagName === "INPUT"
        ? "input"
        : "change";
    input.addEventListener(evt, () => {
      if (!block.data.subsections[i]) block.data.subsections[i] = {};
      block.data.subsections[i][field] = input.value;
    });
  });
  const removeBtn = row.querySelector("[data-remove-sub]");
  if (removeBtn)
    removeBtn.addEventListener("click", () =>
      removeSubsection(
        row.closest(".block-item"),
        block,
        parseInt(removeBtn.dataset.removeSub),
      ),
    );
}

function removeSubsection(el, block, idx) {
  if (block.data.subsections.length <= 1) return;
  block.data.subsections.splice(idx, 1);
  const container = el.querySelector("[data-subsections-container]");
  container.innerHTML = block.data.subsections
    .map((sub, i) => buildSubsectionRow(sub, i))
    .join("");
  container
    .querySelectorAll(".pp-subsection-row")
    .forEach((row, i) => bindSubsectionRow(row, block, i));
}

function removeListItem(el, block, idx) {
  if (block.data.items.length <= 1) return;
  block.data.items.splice(idx, 1);
  const container = el.querySelector("[data-list-container]");
  container.innerHTML = block.data.items
    .map(
      (item, i) =>
        `<div class="list-item-row" data-index="${i}"><input class="block-input" data-field="items" data-index="${i}" placeholder="List item ${i + 1}..." value="${esc(item)}" /><button class="list-item-remove" data-remove-index="${i}" title="Remove"><span class="material-symbols-outlined mi">remove</span></button></div>`,
    )
    .join("");
  container.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", () => {
      block.data.items[parseInt(inp.dataset.index)] = inp.value;
    });
  });
  container.querySelectorAll("[data-remove-index]").forEach((btn) => {
    btn.addEventListener("click", () =>
      removeListItem(el, block, parseInt(btn.dataset.removeIndex)),
    );
  });
}

function removePrivacyListItem(el, block, idx) {
  if (block.data.list.length <= 1) return;
  block.data.list.splice(idx, 1);
  const container = el.querySelector("[data-list-container]");
  container.innerHTML = block.data.list
    .map(
      (item, i) =>
        `<div class="list-item-row" data-index="${i}"><input class="block-input" data-field="list" data-index="${i}" placeholder="List item ${i + 1}..." value="${esc(item)}" /><button class="list-item-remove" data-remove-index="${i}" title="Remove"><span class="material-symbols-outlined mi">remove</span></button></div>`,
    )
    .join("");
  container.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", () => {
      block.data.list[parseInt(inp.dataset.index)] = inp.value;
    });
  });
  container.querySelectorAll("[data-remove-index]").forEach((btn) => {
    btn.addEventListener("click", () =>
      removePrivacyListItem(el, block, parseInt(btn.dataset.removeIndex)),
    );
  });
}

// ══════════════════════════════════════════════════════════════════
// DRAG & DROP
// ══════════════════════════════════════════════════════════════════
function initDragDrop() {
  const list = document.getElementById("blocksList");
  if (!list) return;
  list.querySelectorAll(".block-item").forEach((item) => {
    item.addEventListener("dragstart", onDragStart);
    item.addEventListener("dragend", onDragEnd);
    item.addEventListener("dragover", onDragOver);
    item.addEventListener("dragleave", onDragLeave);
    item.addEventListener("drop", onDrop);
  });
}
function onDragStart(e) {
  dragSrc = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", this.dataset.id);
}
function onDragEnd() {
  this.classList.remove("dragging");
  document
    .querySelectorAll(".block-item")
    .forEach((el) =>
      el.classList.remove("drag-target-above", "drag-target-below"),
    );
  dragSrc = null;
}
function onDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  if (!dragSrc || dragSrc === this) return;
  e.dataTransfer.dropEffect = "move";
  const rect = this.getBoundingClientRect();
  const mid = rect.top + rect.height / 2;
  this.classList.remove("drag-target-above", "drag-target-below");
  this.classList.add(
    e.clientY < mid ? "drag-target-above" : "drag-target-below",
  );
}
function onDragLeave() {
  this.classList.remove("drag-target-above", "drag-target-below");
}
function onDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  if (!dragSrc || dragSrc === this) return;
  const srcId = parseInt(dragSrc.dataset.id);
  const tgtId = parseInt(this.dataset.id);
  const above = this.classList.contains("drag-target-above");
  const srcIdx = blocks.findIndex((b) => b.id === srcId);
  const [moved] = blocks.splice(srcIdx, 1);
  const newIdx = blocks.findIndex((b) => b.id === tgtId);
  blocks.splice(above ? newIdx : newIdx + 1, 0, moved);
  this.classList.remove("drag-target-above", "drag-target-below");
  renderCanvas();
}

// ══════════════════════════════════════════════════════════════════
// GENERATE OUTPUT
// ══════════════════════════════════════════════════════════════════
async function generateOutput() {
  const titleEl =
    document.getElementById("meta-title") ||
    document.getElementById("meta-appName");
  const title = titleEl?.value.trim();
  if (!title) {
    showToast("Please add a title first");
    return;
  }
  showModal();
  await runGeneratingAnimation();
  const obj = buildObject();
  const json = JSON.stringify(obj, null, 2);
  document.getElementById("modalGenerating").style.display = "none";
  document.getElementById("modalOutput").style.display = "block";
  document.getElementById("outputCode").textContent = json;
  document.getElementById("copyBtn").onclick = () => {
    navigator.clipboard.writeText(json).then(() => {
      const msg = document.getElementById("copySuccess");
      msg.classList.add("show");
      setTimeout(() => msg.classList.remove("show"), 2500);
    });
  };
}

async function runGeneratingAnimation() {
  const steps = document.querySelectorAll(".gen-step");
  for (let i = 0; i < steps.length; i++) {
    steps[i].classList.add("active");
    await delay(420);
    steps[i].classList.remove("active");
    steps[i].classList.add("done");
  }
  await delay(200);
}

function buildObject() {
  if (mode === "privacy") return buildPrivacyObject();
  const cfg = MODES[mode];
  const obj = {};
  const title = document.getElementById("meta-title")?.value.trim() || "";
  obj.id = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60);
  cfg.metaFields.forEach((f) => {
    if (f.type === "tags") obj[f.id] = getTags();
    else {
      const el = document.getElementById(`meta-${f.id}`);
      if (el) obj[f.id] = el.value.trim();
    }
  });
  obj.content = blocks.map((block) => {
    const out = { type: block.type };
    switch (block.type) {
      case "heading":
        out.text = block.data.text || "";
        if (block.data.level !== "h2") out.level = block.data.level;
        break;
      case "paragraph":
        out.text = block.data.text || "";
        break;
      case "code":
        out.language = block.data.language || "plaintext";
        out.text = block.data.text || "";
        break;
      case "list":
        out.items = (block.data.items || []).filter((i) => i.trim() !== "");
        break;
      case "quote":
        out.text = block.data.text || "";
        if (block.data.author?.trim()) out.author = block.data.author.trim();
        break;
      case "image":
        out.src = block.data.src || "";
        out.alt = block.data.alt || "";
        break;
    }
    return out;
  });
  return obj;
}

function buildPrivacyObject() {
  const cfg = MODES.privacy;
  const obj = {};
  cfg.metaFields.forEach((f) => {
    if (f.type === "tags") obj[f.id] = getTags();
    else {
      const el = document.getElementById(`meta-${f.id}`);
      if (el) obj[f.id] = el.value.trim();
    }
  });
  obj.sections = blocks.map((block) => {
    const section = {};
    switch (block.type) {
      case "pp-section":
        section.id = block.data.id || "";
        section.title = block.data.title || "";
        section.content = block.data.content || "";
        break;
      case "pp-section-list":
        section.id = block.data.id || "";
        section.title = block.data.title || "";
        if (block.data.content?.trim())
          section.content = block.data.content.trim();
        section.list = (block.data.list || []).filter((i) => i.trim() !== "");
        break;
      case "pp-section-sub":
        section.id = block.data.id || "";
        section.title = block.data.title || "";
        section.subsections = (block.data.subsections || []).map((sub) => ({
          subtitle: sub.subtitle || "",
          content: sub.content || "",
        }));
        break;
      case "pp-contact":
        section.id = block.data.id || "contact";
        section.title = block.data.title || "Contact Us";
        section.content = block.data.content || "";
        section.contactEmail = block.data.contactEmail || "";
        break;
    }
    return section;
  });
  return obj;
}

// ══════════════════════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════════════════════
function showModal() {
  document.getElementById("modalGenerating").style.display = "flex";
  document.getElementById("modalOutput").style.display = "none";
  document
    .querySelectorAll(".gen-step")
    .forEach((s) => s.classList.remove("active", "done"));
  document.getElementById("modalOverlay").classList.add("show");
}
function hideModal() {
  document.getElementById("modalOverlay").classList.remove("show");
}
document.getElementById("modalClose").addEventListener("click", hideModal);
document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalOverlay")) hideModal();
});

// ══════════════════════════════════════════════════════════════════
// MOBILE SIDEBAR
// ══════════════════════════════════════════════════════════════════
function bindSidebarMobile() {
  const toggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlayMob");
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  });
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });
}

// ══════════════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════════════
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.querySelector("span:last-child").textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}
