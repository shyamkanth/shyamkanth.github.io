// Activity Log Manager
class ActivityManager {
  constructor() {
    this.init();
  }

  init() {
    // Activity manager is ready
  }

  renderActivityLog() {
    const projectId = window.app && window.app.currentProject ? window.app.currentProject.id : null;
    const activities = storage.getActivityLog(100, projectId);

    if (activities.length === 0) {
      return `
        <div class="content-wrapper">
          <div class="page-header">
            <div class="page-header-content">
              <div class="page-title-section">
                <div class="breadcrumb">
                  <span class="breadcrumb-item">Settings</span>
                  <span class="breadcrumb-separator">/</span>
                  <span class="breadcrumb-item">Activity Log</span>
                </div>
                <h1 class="page-title">Activity Log</h1>
              </div>
              <div class="page-actions">
                <button class="btn btn-danger btn-sm" id="clearActivityLogBtn">Clear Log</button>
              </div>
            </div>
          </div>
          <div class="content-wrapper">
            <div class="text-center" style="padding: 4rem;">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.3;">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">No Activity Yet</h3>
              <p style="color: var(--text-tertiary);">Activity will appear here as you work on your projects</p>
            </div>
          </div>
        </div>
      `;
    }

    const activityHTML = activities
      .map((activity) => {
        const icon = this.getActivityIcon(activity.type);
        const timeAgo = this.getTimeAgo(activity.timestamp);

        return `
        <div class="activity-item">
          <div class="activity-icon ${activity.type}">
            ${icon}
          </div>
          <div class="activity-content">
            <div class="activity-title">${this.escapeHtml(activity.action)}</div>
            <div class="activity-description">${this.escapeHtml(activity.description)}</div>
            <div class="activity-time">${timeAgo}</div>
          </div>
        </div>
      `;
      })
      .join("");

    return `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-title-section">
            <div class="breadcrumb">
              <span class="breadcrumb-item">Settings</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item">Activity Log</span>
            </div>
            <h1 class="page-title">Activity Log</h1>
          </div>
          <div class="page-actions">
            <button class="btn btn-danger btn-sm" id="clearActivityLogBtn">Clear Log</button>
          </div>
        </div>
      </div>
      <div class="content-wrapper">
        <div class="activity-log">
          ${activityHTML}
        </div>
      </div>
    `;
  }

  getActivityIcon(type) {
    const icons = {
      create: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>`,
      update: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>`,
      delete: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>`,
      system: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>`,
    };
    return icons[type] || icons.system;
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return time.toLocaleDateString();
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  setupEventListeners() {
    document.addEventListener("click", (e) => {
      if (
        e.target.id === "clearActivityLogBtn" ||
        e.target.closest("#clearActivityLogBtn")
      ) {
        this.clearLog();
      }
    });
  }

  clearLog() {
    if (
      confirm(
        "Are you sure you want to clear the activity log? This cannot be undone.",
      )
    ) {
      storage.clearActivityLog();
      if (window.app) {
        window.app.renderCurrentView();
      }
    }
  }
}

// Initialize activity manager
const activityManager = new ActivityManager();
activityManager.setupEventListeners();
