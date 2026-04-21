// UI Enhancement Module
class UIEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardShortcuts();
    this.setupTooltips();
    this.setupAnimations();
    this.setupTheme();
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + K - Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("globalSearch")?.focus();
      }

      // Ctrl/Cmd + N - New task
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        if (window.app?.currentProject) {
          window.app.openTaskForm();
        }
      }

      // Ctrl/Cmd + P - New project
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        window.app?.openProjectForm();
      }

      // Ctrl/Cmd + B - Switch project
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        window.app?.openProjectsModal();
      }

      // Numbers 1-5 - Switch views (when not in input)
      if (!e.target.matches("input, textarea, select")) {
        const views = ["board", "backlog", "timeline", "issues", "reports"];
        const num = parseInt(e.key);
        if (num >= 1 && num <= 5) {
          e.preventDefault();
          window.app?.switchView(views[num - 1]);
        }
      }

      // Escape - Close modals
      if (e.key === "Escape") {
        window.app?.closeAllModals();
      }
    });

    // Show keyboard shortcuts hint
    this.createKeyboardShortcutsHint();
  }

  createKeyboardShortcutsHint() {
    const shortcuts = [
      { key: "⌘K", desc: "Search" },
      { key: "⌘N", desc: "New Task" },
      { key: "⌘P", desc: "New Project" },
      { key: "⌘B", desc: "Switch Project" },
      { key: "1-5", desc: "Switch Views" },
      { key: "ESC", desc: "Close" },
    ];

    // Could add a shortcuts panel here if needed
  }

  setupTooltips() {
    // Simple tooltip implementation
    document.addEventListener("mouseover", (e) => {
      const element = e.target.closest("[data-tooltip]");
      if (element) {
        const text = element.getAttribute("data-tooltip");
        if (text) {
          this.showTooltip(element, text);
        }
      }
    });

    document.addEventListener("mouseout", (e) => {
      const element = e.target.closest("[data-tooltip]");
      if (element) {
        this.hideTooltip();
      }
    });
  }

  showTooltip(element, text) {
    const existing = document.querySelector(".custom-tooltip");
    if (existing) {
      existing.remove();
    }

    const tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip";
    tooltip.textContent = text;
    tooltip.style.cssText = `
      position: fixed;
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      color: var(--text-primary);
      padding: 8px 16px;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 500;
      z-index: 10001;
      pointer-events: none;
      box-shadow: var(--shadow-lg);
      animation: fadeIn 0.15s ease;
    `;

    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top = rect.bottom + 8;
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

    // Adjust if tooltip goes off screen
    if (left < 8) left = 8;
    if (left + tooltipRect.width > window.innerWidth - 8) {
      left = window.innerWidth - tooltipRect.width - 8;
    }
    if (top + tooltipRect.height > window.innerHeight - 8) {
      top = rect.top - tooltipRect.height - 8;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    // Store reference
    this.currentTooltip = tooltip;
  }

  hideTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.style.animation = "fadeOut 0.15s ease";
      setTimeout(() => {
        this.currentTooltip?.remove();
        this.currentTooltip = null;
      }, 150);
    }
  }

  setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.animation = "fadeInUp 0.5s ease forwards";
          }, index * 50);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements as they're added
    const observeNewElements = () => {
      document
        .querySelectorAll(".kanban-card, .project-card, .activity-item")
        .forEach((el) => {
          if (!el.hasAttribute("data-observed")) {
            el.setAttribute("data-observed", "true");
            observer.observe(el);
          }
        });
    };

    // Initial observation
    setTimeout(observeNewElements, 100);

    // Re-observe when content changes
    const contentArea = document.getElementById("contentArea");
    if (contentArea) {
      const contentObserver = new MutationObserver(observeNewElements);
      contentObserver.observe(contentArea, {
        childList: true,
        subtree: true,
      });
    }
  }

  setupTheme() {
    // Load theme preference
    const theme = storage.getSetting("theme") || "dark";
    this.applyTheme(theme);

    // Listen for theme changes
    document.getElementById("themeSelect")?.addEventListener("change", (e) => {
      this.applyTheme(e.target.value);
    });
  }

  applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    // Could add light theme styles here if needed
  }

  // Utility: Show loading state
  showLoading(container) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; padding: 4rem;">
        <div class="spinner"></div>
      </div>
    `;
  }

  // Utility: Empty state
  showEmptyState(container, title, description, actionText, actionCallback) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <h3>${title}</h3>
        <p>${description}</p>
        ${actionText ? `<button class="btn btn-primary" id="emptyStateAction">${actionText}</button>` : ""}
      </div>
    `;

    if (actionCallback) {
      document
        .getElementById("emptyStateAction")
        ?.addEventListener("click", actionCallback);
    }
  }

  // Smooth scroll to element
  scrollToElement(selector, offset = 0) {
    const element = document.querySelector(selector);
    if (element) {
      const top =
        element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  }

  // Debounce utility
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  // Copy to clipboard
  copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast("Copied to clipboard!", "success");
      });
    } else {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      this.showToast("Copied to clipboard!", "success");
    }
  }

  // Toast notification
  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      color: var(--text-primary);
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg);
      font-weight: 500;
      z-index: 10000;
      box-shadow: var(--shadow-xl);
      animation: slideInUp 0.3s ease;
      min-width: 300px;
      text-align: center;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOutDown 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Add animation styles
const uiStyle = document.createElement("style");
uiStyle.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid var(--border-default);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-state svg {
    margin: 0 auto 1rem;
    display: block;
  }

  .empty-state h3 {
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    color: var(--text-tertiary);
    margin-bottom: 1.5rem;
  }

  /* Scrollbar enhancements */
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--bg-hover) var(--bg-secondary);
  }

  /* Focus styles */
  *:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* Selection */
  ::selection {
    background: rgba(var(--primary-rgb), 0.3);
    color: var(--text-primary);
  }

  /* Smooth transitions */
  * {
    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
`;
document.head.appendChild(uiStyle);

// Initialize UI enhancements
document.addEventListener("DOMContentLoaded", () => {
  window.uiEnhancer = new UIEnhancer();
});
