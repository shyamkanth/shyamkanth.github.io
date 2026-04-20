// Main Application Controller
class KineticTerminal {
  constructor() {
    this.currentProject = null;
    this.currentView = null; // null to allow applySettings to set default
    this.currentTaskId = null;
    this.issuesViewType = "table";
    this.filters = { status: "all", priority: "all", assignee: "all", reporter: "all" };
    this.breadcrumbStack = [];
    this.init();
  }

  init() {

    console.log("app.js init");

    this.cacheDOM();
    this.bindEvents();
    this.loadState();

    // Standardize view preference before applying
    const settings = storage.getSettings();

    console.log("settings", settings);

    const rawView = settings.viewMode || "board";
    const initialView = rawView === "kanban" ? "board" : rawView;
    this.currentView = initialView;

    this.applySettings(true);

    // Sort preference from storage
    this.sortPreference = settings.sortPreference || "updated-desc";

    // Initial Badge Refresh
    if (this.currentProject) {
      this.updateSidebarBadges();
    }

    // INITIAL RENDER - Move to next tick so window.app is set
    setTimeout(() => {
      this.render();
      this.transformSelects();
    }, 0);
  }

  cacheDOM() {
    // Main containers
    this.contentArea = document.getElementById("contentArea");
    this.modalOverlay = document.getElementById("modalOverlay");

    // Modals
    this.projectsModal = document.getElementById("projectsModal");
    this.projectFormModal = document.getElementById("projectFormModal");
    this.taskModal = document.getElementById("taskModal");
    this.taskDetailsModal = document.getElementById("taskDetailsModal");

    // Forms
    this.projectForm = document.getElementById("projectForm");
    this.taskForm = document.getElementById("taskForm");
    this.personForm = document.getElementById("personForm");

    // Sidebar
    this.sidebarProjectName = document.getElementById("sidebarProjectName");
    this.sidebarProjectKey = document.getElementById("sidebarProjectKey");
    this.issuesBadge = document.getElementById("issuesBadge");
    this.boardBadge = document.getElementById("boardBadge");
    this.backlogBadge = document.getElementById("backlogBadge");
    this.projectList = document.getElementById("projectList");
  }
  bindEvents() {
    // Navigation
    document.querySelectorAll(".sidebar-link, .nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const view = e.currentTarget.getAttribute("data-view");
        if (view) {
          this.switchView(view);
        }
      });
    });

    // Project switching
    document.getElementById("switchProjectBtn")?.addEventListener("click", () => {
      this.openProjectsModal();
    });

    document.getElementById("switchProjectFooterBtn")?.addEventListener("click", () => {
      this.openProjectsModal();
    });

    // Settings
    document.getElementById("settingsBtn")?.addEventListener("click", () => {
      this.switchView("settings");
    });

    // Create project
    document.getElementById("createNewProjectBtn")?.addEventListener("click", () => {
      this.openProjectForm();
    });

    // Form submissions
    this.projectForm?.addEventListener("submit", (e) => this.handleProjectSubmit(e));
    this.taskForm?.addEventListener("submit", (e) => this.handleTaskSubmit(e));
    this.personForm?.addEventListener("submit", (e) => this.handlePersonSubmit(e));

    // Modal closing
    document.querySelectorAll(".btn-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal, .side-panel");
        if (modal) {
          this.closeModal(modal.id);
        }
      });
    });

    document.querySelectorAll("[data-modal]").forEach((btn) => {
      if (btn.classList.contains("btn-secondary")) {
        btn.addEventListener("click", (e) => {
          const modalId = e.target.dataset.modal;
          this.closeModal(modalId);
        });
      }
    });

    this.modalOverlay?.addEventListener("click", () => {
      this.closeAllModals();
    });

    // Global search
    document.getElementById("globalSearch")?.addEventListener("input", (e) => {
      this.handleGlobalSearch(e.target.value);
    });

    // Keyboard shortcuts
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals();
      }

      const isTyping = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("globalSearch")?.focus();
      }

      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        e.stopPropagation();
        this.openTaskForm();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        e.stopPropagation();
        this.openProjectForm();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        e.stopPropagation();
        this.openProjectsModal();
      }

      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && !isTyping) {
        const views = { "1": "board", "2": "backlog", "3": "timeline", "4": "issues", "5": "reports" };
        if (views[e.key]) this.switchView(views[e.key]);
      }
    }, true);

    // Global click listener for delegation and UI management
    document.addEventListener("click", (e) => {
      const dropToggle = e.target.closest(".dropdown-toggle");
      const dropMenu = e.target.closest(".dropdown-menu");

      // 1. Dropdown Toggles
      if (dropToggle) {
        e.preventDefault();
        const menu = dropToggle.nextElementSibling;
        if (menu && menu.classList.contains("dropdown-menu")) {
          const wasOpen = menu.classList.contains("show");
          this.closeAllMenus();
          if (!wasOpen) menu.classList.add("show");
        }
        return;
      }

      // 2. Handle Closing Menus Next
      if (!dropMenu) {
        this.closeAllMenus();
      }

      // 3. Status change via delegation
      const statusLink = e.target.closest("[data-status-value]");
      if (statusLink) {
        e.preventDefault();
        const taskId = statusLink.dataset.taskId;
        const newStatus = statusLink.dataset.statusValue;
        this.closeAllMenus();
        this.handleStatusChange(taskId, newStatus);
        return;
      }

      // 4. Sort option selection
      const sortLink = e.target.closest("[data-sort-value]");
      if (sortLink) {
        e.preventDefault();
        const value = sortLink.dataset.sortValue;
        this.closeAllMenus();
        this.handleSortChange(value);
        return;
      }

      // 5. Blocker link navigation
      const blockerLink = e.target.closest(".blocker-item.clickable");
      if (blockerLink) {
        e.preventDefault();
        const blockerId = blockerLink.dataset.blockerId;
        if (blockerId) {
          this.openTaskDetails(blockerId);
        }
        return;
      }

      // 6. Action buttons (Edit from Details, etc)
      const actionBtn = e.target.closest("[data-action]");
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        const taskId = actionBtn.dataset.taskId;
        if (action === "edit-task") {
          e.preventDefault();
          this.openTaskForm(taskId || this.currentTaskId);
          return;
        }
        if (action === "delete-task") {
          e.preventDefault();
          this.deleteCurrentTask();
          return;
        }
      }

      // 7. Project selection
      const projectTarget = e.target.closest(".project-card") || e.target.closest(".project-item");
      if (projectTarget) {
        const projectId = projectTarget.dataset.projectId;
        this.selectProject(projectId);
        return;
      }

      // 8. Task click (Board or Issues)
      const taskTarget = e.target.closest(".kanban-card, .issue-card, .issue-table tbody tr[data-task-id]");
      if (taskTarget && !e.target.closest("button") && !e.target.closest("a") && !e.target.closest(".dropdown")) {
        const taskId = taskTarget.dataset.taskId;
        this.openTaskDetails(taskId);
        return;
      }

      // 9. Generic Create Task buttons
      if (e.target.closest(".kanban-add-btn") || e.target.id === "createTaskBtn" || e.target.closest("#createTaskBtn")) {
        this.openTaskForm();
        return;
      }

      // 10. Specific Edit/Delete in Modals (if they don't use data-action)
      if (e.target.id === "editTaskBtn" || e.target.closest("#editTaskBtn")) {
        this.editCurrentTask();
        return;
      }
      if (e.target.id === "deleteTaskBtn" || e.target.closest("#deleteTaskBtn")) {
        this.deleteCurrentTask();
        return;
      }

      // 11. Breadcrumb clicks
      const breadcrumbItem = e.target.closest("[data-breadcrumb-view]");
      if (breadcrumbItem) {
        const view = breadcrumbItem.dataset.breadcrumbView;
        const id = breadcrumbItem.dataset.breadcrumbId;
        this.switchView(view, id);
        return;
      }

      // 12. Search management
      if (!e.target.closest(".search-box")) {
        document.getElementById("searchResults")?.classList.remove("active");
      }
    });

    // Horizontal scroll for project switcher
    this.projectList?.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        this.projectList.scrollLeft += e.deltaY;
      }
    });
  }

  loadState() {
    const projects = storage.getProjects();
    if (projects.length > 0) {
      // Load the last selected project or the first one
      const lastProjectId = localStorage.getItem("lastProjectId");
      const project = lastProjectId
        ? storage.getProject(lastProjectId)
        : projects[0];

      if (project) {
        this.currentProject = project;
        this.updateSidebarProject();
      }
    }
  }
  render() {
    const projects = storage.getProjects();

    // 1. Project Selection Safeguard
    if (!this.currentProject && projects.length > 0) {
      this.currentProject = projects[0];
      this.updateSidebarProject();
    }

    // 2. Default View Safeguard
    if (!this.currentView || this.currentView === "kanban") {
      const settings = storage.getSettings();
      const rawView = settings.viewMode || "board";
      this.currentView = rawView === "kanban" ? "board" : rawView;
    }

    // 3. Ensure content is visible
    if (this.contentArea) {
      this.contentArea.style.opacity = "1";
    }

    this.updateSidebarBadges();
    this.updateActiveLinks();
    this.renderCurrentView();
  }

  switchView(view, taskId = null) {
    const oldView = this.currentView;

    // Save previous view only when first entering issue detail
    if (view === "issueDetail" && oldView !== "issueDetail") {
      this.previousView = oldView;
    }

    this.currentView = view;

    if (taskId) {
      if (view === "issueDetail") {
        const stackIndex = this.breadcrumbStack.indexOf(taskId);
        if (stackIndex !== -1) {
          // Navigating back within the stack
          this.breadcrumbStack = this.breadcrumbStack.slice(0, stackIndex + 1);
        } else if (this.currentTaskId !== taskId) {
          // Navigating forward to a NEW task detail
          if (oldView !== "issueDetail") {
            // New sequence started from a different view
            this.breadcrumbStack = [this.formatViewName(oldView || "Board")];
          }
          this.breadcrumbStack.push(taskId);
        }
      } else {
        // Not a detail view, reset stack
        this.breadcrumbStack = [];
      }
      this.currentTaskId = taskId;
    } else if (view !== "issueDetail") {
      // Direct view switch without task, reset stack and current task
      this.breadcrumbStack = [];
      this.currentTaskId = null;
    }

    this.render();
  }

  updateActiveLinks() {
    const view = this.currentView;
    document.querySelectorAll(".sidebar-link, .nav-link").forEach((link) => {
      const linkView = link.getAttribute("data-view");
      link.classList.remove("active");
      if (linkView === view) {
        link.classList.add("active");
      }
    });
  }

  renderCurrentView() {
    const views = {
      board: () => this.renderBoard(),
      backlog: () => this.renderBacklog(),
      timeline: () => this.renderTimeline(),
      issues: () => this.renderIssues(),
      overview: () => this.renderOverview(),
      noProject: () => this.renderGettingStarted(),
      reports: () => this.renderReports(),
      activity: () => activityManager.renderActivityLog(),
      backup: () => this.renderBackup(),
      settings: () => this.renderSettings(),
      people: () => this.renderPeople(),
      shortcuts: () => this.renderKeyboardShortcuts(),
      issueDetail: () => this.renderIssueDetail(this.currentTaskId),
    };

    const renderFn = views[this.currentView];
    if (renderFn) {
      this.contentArea.innerHTML = renderFn();
      this.setupDynamicEventListeners();
      this.transformSelects();
    }
  }

  transformSelects() {
    document.querySelectorAll(".custom-select, .filter-select").forEach((select) => {
      // Don't transform if already transformed
      if (select.nextElementSibling && select.nextElementSibling.classList.contains("custom-dropdown-wrapper")) {
        const wrapper = select.nextElementSibling;
        const buttonText = wrapper.querySelector("button span");

        // Helper to get display text
        const getDisplayText = () => {
          if (select.multiple) {
            const selected = Array.from(select.selectedOptions);
            if (selected.length === 0) return select.dataset.placeholder || "Select...";
            if (selected.length === 1) return selected[0].text;
            return `${selected.length} selected`;
          }
          return select.options[select.selectedIndex]?.text || select.dataset.placeholder || "Select...";
        };

        if (buttonText) buttonText.textContent = getDisplayText();

        // Update active class in menu
        const menu = wrapper.querySelector(".dropdown-menu");
        if (menu) {
          const selectedValues = select.multiple ? Array.from(select.selectedOptions).map(o => o.value) : [select.value];
          menu.querySelectorAll("a").forEach(a => {
            const val = a.dataset.value;
            a.classList.toggle("active", selectedValues.includes(val));
          });
        }

        if (select.classList.contains("searchable-select")) {
          this.refreshSearchableSelect(select);
        }
        return;
      }

      const isSearchable = select.classList.contains("searchable-select");
      const isMultiple = select.multiple;

      select.style.display = "none";

      const wrapper = document.createElement("div");
      wrapper.className = `dropdown custom-dropdown-wrapper ${isSearchable ? "searchable-dropdown" : ""}`;
      if (select.classList.contains("filter-select")) {
        wrapper.style.minWidth = "150px";
      } else {
        wrapper.style.width = "100%";
      }

      const button = document.createElement("button");
      button.className = "btn btn-secondary dropdown-toggle w-100";
      button.style.justifyContent = "space-between";
      button.style.width = "100%";
      button.type = "button";

      const getDisplayText = () => {
        if (isMultiple) {
          const selected = Array.from(select.selectedOptions);
          if (selected.length === 0) return select.dataset.placeholder || "Select...";
          if (selected.length === 1) return selected[0].text;
          return `${selected.length} selected`;
        }
        return select.options[select.selectedIndex]?.text || select.dataset.placeholder || "Select...";
      };

      button.innerHTML = `<span>${getDisplayText()}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 8px;">
          <polyline points="6 9 12 15 18 9"/>
        </svg>`;

      const menu = document.createElement("div");
      menu.className = "dropdown-menu";
      menu.style.width = "100%";

      if (isSearchable) {
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.className = "dropdown-search-input";
        searchInput.placeholder = "Search...";
        searchInput.style.width = "calc(100% - 16px)";
        searchInput.style.margin = "8px";
        searchInput.style.padding = "8px";
        searchInput.style.background = "var(--bg-secondary)";
        searchInput.style.border = "1px solid var(--border-default)";
        searchInput.style.borderRadius = "var(--radius-sm)";
        searchInput.style.color = "var(--text-primary)";

        searchInput.addEventListener("input", (e) => {
          const val = e.target.value.toLowerCase();
          menu.querySelectorAll("a").forEach(a => {
            const text = a.textContent.toLowerCase();
            a.style.display = text.includes(val) ? "block" : "none";
          });
        });

        menu.appendChild(searchInput);
      }

      const optionsContainer = document.createElement("div");
      optionsContainer.className = "dropdown-options-container";
      optionsContainer.style.maxHeight = "250px";
      optionsContainer.style.overflowY = "auto";

      const renderOptions = () => {
        optionsContainer.innerHTML = "";
        Array.from(select.options).forEach((option) => {
          const a = document.createElement("a");
          a.href = "#";
          a.dataset.value = option.value;
          a.className = option.selected ? "selected" : "";
          a.textContent = option.text;
          a.addEventListener("click", (e) => {
            e.preventDefault();
            if (isMultiple) {
              option.selected = !option.selected;
              a.classList.toggle("selected");
              button.querySelector("span").textContent = getDisplayText();
            } else {
              select.value = option.value;
              button.querySelector("span").textContent = option.text;
              menu.classList.remove("show");
            }
            select.dispatchEvent(new Event("change"));
          });
          optionsContainer.appendChild(a);
        });
      };

      renderOptions();
      menu.appendChild(optionsContainer);

      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Close others
        document.querySelectorAll(".dropdown-menu.show").forEach(m => {
          if (m !== menu) m.classList.remove("show");
        });
        menu.classList.toggle("show");
        if (isSearchable && menu.classList.contains("show")) {
          setTimeout(() => menu.querySelector("input")?.focus(), 10);
        }
      });

      wrapper.appendChild(button);
      wrapper.appendChild(menu);

      select.parentNode.insertBefore(wrapper, select.nextSibling);
    });
  }

  syncCustomSelects() {
    document.querySelectorAll(".custom-select, .filter-select").forEach((select) => {
      const wrapper = select.nextElementSibling;
      if (wrapper && wrapper.classList.contains("custom-dropdown-wrapper")) {
        const buttonText = wrapper.querySelector("button span");
        if (buttonText) {
          buttonText.textContent = select.options[select.selectedIndex]?.text || "";
        }
      }
    });
  }

  renderBoard() {
    if (!this.currentProject) {
      return this.renderNoProject();
    }

    const tasks = this.sortTasks(storage.getTasks(this.currentProject.id));
    const statuses = [
      { key: "todo", label: "To Do" },
      { key: "in-progress", label: "In Progress" },
      { key: "in-review", label: "In Review" },
      { key: "done", label: "Done" },
    ];

    if (tasks.filter(t => t.status !== 'backlog').length === 0) {
      return `
        ${this.renderPageHeader(this.currentProject.name, [this.currentProject.name, "Board"], `
           ${this.renderSortDropdown()}
           <button class="btn btn-primary" id="createTaskBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Issue
          </button>
        `)}
        <div class="content-centered">
          ${this.renderEmptyState("No Issues found", "Start adding by clicking button above or ALT+N")}
        </div>
      `;
    }

    const columnsHTML = statuses
      .map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status.key);
        return `
        <div class="kanban-column" data-status="${status.key}">
          <div class="kanban-column-header">
            <div class="kanban-column-title">
              <span>${status.label}</span>
              <span class="column-count">${columnTasks.length}</span>
            </div>
            <button class="kanban-add-btn" title="Add task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
          <div class="kanban-cards" data-status="${status.key}">
            ${columnTasks.map((task) => this.renderKanbanCard(task)).join("")}
          </div>
          <div class="drop-overlay" data-target-status="${status.key}">
             <div class="drop-hint">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span>Drop Here</span>
             </div>
          </div>
        </div>
      `;
      })
      .join("");

    return `
      ${this.renderPageHeader(
      this.currentProject.name,
      [this.currentProject.name, "Board"],
      `
        ${this.renderSortDropdown()}
        <button class="btn btn-primary" id="createTaskBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Issue
        </button>`
    )}
      <div class="kanban-board" id="kanbanBoard">
        ${columnsHTML}
      </div>
    `;
  }

  initKanbanDragDrop() {
    const board = document.getElementById("kanbanBoard");
    if (!board) return;

    let draggedTaskId = null;
    let sourceStatus = null;

    // Make cards draggable
    board.querySelectorAll(".kanban-card").forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        draggedTaskId = card.dataset.taskId;
        const sourceColumn = card.closest(".kanban-column");
        sourceStatus = sourceColumn ? sourceColumn.dataset.status : null;

        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", draggedTaskId);

        // Slight delay so Chrome renders the drag image before we add the class
        setTimeout(() => {
          card.classList.add("is-dragging");
          board.classList.add("is-dragging");
        }, 0);
      });

      card.addEventListener("dragend", () => {
        draggedTaskId = null;
        sourceStatus = null;
        board.classList.remove("is-dragging");
        board.querySelectorAll(".kanban-column").forEach((col) => {
          col.classList.remove("drag-over");
        });
        board.querySelectorAll(".kanban-card").forEach((c) => {
          c.classList.remove("is-dragging");
        });
      });
    });

    // Listen on each column directly (not the overlay)
    board.querySelectorAll(".kanban-column").forEach((column) => {
      const targetStatus = column.dataset.status;

      column.addEventListener("dragenter", (e) => {
        e.preventDefault();
        if (targetStatus !== sourceStatus) {
          column.classList.add("drag-over");
        }
      });

      column.addEventListener("dragleave", (e) => {
        // Only remove class if we're leaving the column itself, not a child
        if (!column.contains(e.relatedTarget)) {
          column.classList.remove("drag-over");
        }
      });

      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });

      column.addEventListener("drop", (e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
        if (taskId && targetStatus && targetStatus !== sourceStatus) {
          storage.updateTask(taskId, { status: targetStatus });
          this.updateSidebarProject();
          this.renderCurrentView();
          this.showNotification(`Moved to ${targetStatus.replace(/-/g, " ")}`, "success");
        }
        column.classList.remove("drag-over");
      });
    });
  }

  renderKanbanCard(task) {
    const typeIcons = {
      task: "📋",
      bug: "🐛",
      feature: "✨",
      epic: "🎯",
    };

    return `
      <div class="kanban-card" data-task-id="${task.id}" draggable="true">
        <div class="card-header">
          <span class="card-id">${this.escapeHtml(task.id)}</span>
          <span class="card-type">${typeIcons[task.type] || "📋"}</span>
        </div>
        <div class="card-title">${this.escapeHtml(task.title)}</div>
        ${task.description ? `<div class="card-description">${this.escapeHtml(task.description)}</div>` : ""}
        <div class="card-footer">
          <div class="card-meta">
            <span class="priority-badge ${task.priority}">${task.priority}</span>
            ${task.tags.length > 0
        ? `
              <div class="tags">
                ${task.tags
          .slice(0, 2)
          .map(
            (tag) => `<span class="tag">${this.escapeHtml(tag)}</span>`,
          )
          .join("")}
              </div>
            `
        : ""
      }
          </div>
          ${task.assignee ? `<div class="card-assignee" title="${this.escapeHtml(task.assignee)}">${task.assignee.charAt(0).toUpperCase()}</div>` : ""}
        </div>
      </div>
    `;
  }

  renderBacklog() {
    if (!this.currentProject) {
      return this.renderNoProject();
    }

    const tasks = this.sortTasks(storage.getTasks(this.currentProject.id).filter((t) => t.status === "backlog"));

    if (tasks.length === 0) {
      return `
        ${this.renderPageHeader(this.currentProject.name, [this.currentProject.name, "Backlog"], `
          ${this.renderSortDropdown()}
          <button class="btn btn-primary" id="createTaskBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Issue
          </button>
        `)}
        <div class="content-centered">
          ${this.renderEmptyState("No Backlogs yet", "You will see here if there is any kind of that")}
        </div>
      `;
    }

    return `
      ${this.renderPageHeader(
      "Backlog",
      [this.currentProject.name, "Backlog"],
      `<button class="btn btn-primary" id="createTaskBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Issue
        </button>`
    )}
      <div class="table-view full-width">
        ${this.renderTaskTable(tasks)}
      </div>
    `;
  }

  renderIssues() {
    if (!this.currentProject) {
      return this.renderNoProject();
    }

    const allTasks = storage.getTasks(this.currentProject.id);
    const tasks = this.getFilteredTasks();
    const isTable = this.issuesViewType === "table";

    // If project is completely empty (no tasks at all)
    if (allTasks.length === 0) {
      return `
        ${this.renderPageHeader(this.currentProject.name, [this.currentProject.name, "Issues"], `
          ${this.renderSortDropdown()}
          <button class="btn btn-primary" id="createTaskBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Issue
          </button>
        `)}
        <div class="content-centered">
          ${this.renderEmptyState("No Issues found", "Start adding by clicking button above or ALT+N")}
        </div>
      `;
    }

    // Normal view with filters (even if filtered result is empty)
    return `
      ${this.renderPageHeader(
      "All Issues",
      [this.currentProject.name, "Issues"],
      `
        ${this.renderSortDropdown()}
        <button class="btn btn-primary" id="createTaskBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Issue
        </button>`
    )}
      <div class="filters-bar">
        <div class="filter-group">
          <span class="filter-label">Status:</span>
          <select class="filter-select" id="statusFilter" onchange="app.applyFilters()">
            <option value="all" ${this.filters.status === "all" ? "selected" : ""}>All Statuses</option>
            <option value="backlog" ${this.filters.status === "backlog" ? "selected" : ""}>Backlog</option>
            <option value="todo" ${this.filters.status === "todo" ? "selected" : ""}>To Do</option>
            <option value="in-progress" ${this.filters.status === "in-progress" ? "selected" : ""}>In Progress</option>
            <option value="in-review" ${this.filters.status === "in-review" ? "selected" : ""}>In Review</option>
            <option value="done" ${this.filters.status === "done" ? "selected" : ""}>Done</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">Priority:</span>
          <select class="filter-select" id="priorityFilter" onchange="app.applyFilters()">
            <option value="all" ${this.filters.priority === "all" ? "selected" : ""}>All Priorities</option>
            <option value="critical" ${this.filters.priority === "critical" ? "selected" : ""}>Critical</option>
            <option value="high" ${this.filters.priority === "high" ? "selected" : ""}>High</option>
            <option value="medium" ${this.filters.priority === "medium" ? "selected" : ""}>Medium</option>
            <option value="low" ${this.filters.priority === "low" ? "selected" : ""}>Low</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">Assignee:</span>
          <select class="filter-select" id="assigneeFilter" onchange="app.applyFilters()">
            <option value="all" ${this.filters.assignee === "all" ? "selected" : ""}>All Assignees</option>
            ${storage.getPeople().map(p => `
              <option value="${p.name}" ${this.filters.assignee === p.name ? "selected" : ""}>${p.name}</option>
            `).join("")}
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">Reporter:</span>
          <select class="filter-select" id="reporterFilter" onchange="app.applyFilters()">
            <option value="all" ${this.filters.reporter === "all" ? "selected" : ""}>All Reporters</option>
            ${storage.getPeople().map(p => `
              <option value="${p.name}" ${this.filters.reporter === p.name ? "selected" : ""}>${p.name}</option>
            `).join("")}
          </select>
        </div>
        <div class="view-toggle">
          <button class="view-toggle-btn ${isTable ? "active" : ""}" data-issues-view="table">Table</button>
          <button class="view-toggle-btn ${!isTable ? "active" : ""}" data-issues-view="cards">Cards</button>
        </div>
      </div>
      <div class="issues-view-container">
        ${tasks.length === 0
        ? `<div class="text-center" style="padding: 4rem;">
               <h3 style="color: var(--text-secondary);">No issues found matching filters</h3>
               <button class="btn btn-secondary mt-lg" onclick="window.app.clearFilters()">Clear Filters</button>
             </div>`
        : (isTable ? this.renderTaskTable(tasks) : this.renderTaskCards(tasks))}
      </div>
    `;
  }

  getFilteredTasks() {
    if (!this.currentProject) return [];
    let tasks = storage.getTasks(this.currentProject.id);
    if (this.filters.status !== "all") {
      tasks = tasks.filter((t) => t.status === this.filters.status);
    }
    if (this.filters.priority !== "all") {
      tasks = tasks.filter((t) => t.priority === this.filters.priority);
    }
    if (this.filters.assignee !== "all") {
      tasks = tasks.filter((t) => t.assignee === this.filters.assignee);
    }
    if (this.filters.reporter !== "all") {
      tasks = tasks.filter((t) => t.reporter === this.filters.reporter);
    }
    return this.sortTasks(tasks);
  }

  renderTaskCards(tasks) {
    return `
      <div class="issues-grid">
        ${tasks
        .map(
          (task) => `
          <div class="issue-card" data-task-id="${task.id}">
            <div class="issue-card-header">
              <div class="issue-card-identity">
                <span class="issue-card-type-icon">${this.getTypeIcon(task.type)}</span>
                <span class="issue-card-key">${this.escapeHtml(task.id)}</span>
              </div>
              <span class="priority-badge ${task.priority}">${task.priority}</span>
            </div>
            <h3 class="issue-card-title">${this.escapeHtml(task.title)}</h3>
            <div class="issue-card-footer">
              <div class="issue-card-status">
                <span class="status-dot ${task.status}"></span>
                <span class="status-name">${this.formatStatus(task.status)}</span>
              </div>
              <div class="issue-card-assignee">
                ${task.assignee ? `<div class="avatar-small" title="${this.escapeHtml(task.assignee)}">${task.assignee.charAt(0)}</div>` : '<div class="avatar-small unassigned">?</div>'}
              </div>
            </div>
          </div>
        `,
        )
        .join("")}
      </div>
    `;
  }

  getTypeIcon(type) {
    const icons = {
      task: "📋",
      bug: "🐛",
      feature: "✨",
      epic: "🎯",
    };
    return icons[type] || "📋";
  }

  clearFilters() {
    this.filters = { status: "all", priority: "all", assignee: "all", reporter: "all" };
    this.renderCurrentView();
  }

  renderTaskTable(tasks) {
    return `
      <div class="table-wrapper">
        <table class="issue-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Summary</th>
              <th>Type</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${tasks
        .map(
          (task) => `
              <tr data-task-id="${task.id}">
                <td>${this.escapeHtml(task.id)}</td>
                <td style="font-weight: 600;">${this.escapeHtml(task.title)}</td>
                <td>${this.formatType(task.type)}</td>
                <td><span class="status-badge ${task.status}">${this.formatStatus(task.status)}</span></td>
                <td><span class="priority-badge ${task.priority}">${task.priority}</span></td>
                <td>${task.assignee || "-"}</td>
                <td>${new Date(task.createdAt).toLocaleDateString()}</td>
              </tr>
            `,
        )
        .join("")}
          </tbody>
        </table>
      </div>
    `;
  }
  renderTimeline() {
    if (!this.currentProject) return this.renderNoProject();

    const tasks = storage.getTasks(this.currentProject.id);
    const tasksWithDueDate = tasks.filter(t => t.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Calculate Velocity (tasks created per day for last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const velocityCounts = last7Days.map(date => {
      return tasks.filter(t => t.createdAt.startsWith(date)).length;
    });

    const maxCount = Math.max(...velocityCounts, 1);
    const chartWidth = 1000;
    const chartHeight = 120;
    const points = velocityCounts.map((count, i) => {
      const x = (i / (velocityCounts.length - 1)) * chartWidth;
      const y = chartHeight - (count / maxCount) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    const polylinePoints = points;
    const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`;

    return `
      ${this.renderPageHeader("Timeline", [this.currentProject.name, "Timeline"])}
      <div class="timeline-container">
        
        <!-- Project Pulse (Velocity) -->
        <div class="velocity-chart-wrapper">
          <div class="timeline-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Project Pulse (New Issues / Day)
          </div>
          <svg class="velocity-chart" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.5"/>
                <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <polyline class="chart-line" points="${polylinePoints}" />
            <polygon class="chart-area" points="${areaPoints}" />
            
            <!-- Tooltip Hover Points -->
            ${velocityCounts.map((count, i) => {
      const x = (i / (velocityCounts.length - 1)) * chartWidth;
      const y = chartHeight - (count / maxCount) * chartHeight;
      const date = new Date(last7Days[i]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `<circle cx="${x}" cy="${y}" r="7" class="chart-dot">
                        <title>${count} issue${count !== 1 ? 's' : ''} — ${date}</title>
                      </circle>`;
    }).join('')}
          </svg>
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.75rem; color: var(--text-tertiary);">
            ${last7Days.map(date => `<span>${new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>`).join('')}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-2xl);">
          
          <!-- Upcoming Milestones -->
          <div>
            <div class="timeline-section-title" style="margin-bottom: 1rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              Key Milestones & Deadlines
            </div>
            
            ${tasksWithDueDate.length > 0 ? `
              <div class="milestones-grid">
                ${tasksWithDueDate.slice(0, 6).map(task => {
      const date = new Date(task.dueDate);
      const day = date.getDate();
      const month = date.toLocaleDateString(undefined, { month: 'short' });
      return `
                    <div class="milestone-card" onclick="window.app.switchView('issueDetail', '${task.id}')">
                      <div class="milestone-date-box">
                        <span class="ms-day">${day}</span>
                        <span class="ms-month">${month}</span>
                      </div>
                      <div class="milestone-info">
                        <div class="milestone-title">${this.escapeHtml(task.title)}</div>
                        <div class="milestone-status">${task.status} • ${task.id}</div>
                      </div>
                    </div>
                  `;
    }).join('')}
              </div>
            ` : `
              <div class="empty-timeline">
                <p>No issues with deadlines yet.</p>
                <button class="btn btn-secondary mt-3" style="margin-top: 1rem;" onclick="window.app.openTaskForm()">Schedule a Task</button>
              </div>
            `}
          </div>

          <!-- Project Health & Stability (Middle) -->
          <div>
            <div class="timeline-section-title" style="margin-bottom: 1.5rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              Project Health & Stability
            </div>
            
            <div class="health-card">
              <div class="health-meta">
                <div class="health-progress-ring">
                  ${(() => {
        const completed = tasks.filter(t => t.status === 'done').length;
        const total = tasks.length || 1;
        const percent = Math.round((completed / total) * 100);
        return `
                    <svg width="80" height="80" viewBox="0 0 36 36">
                      <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="3" />
                      <path class="ring-progress" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" stroke-width="3" stroke-dasharray="${percent}, 100" />
                      <text x="18" y="20.35" class="ring-text" fill="white" font-size="8" text-anchor="middle">${percent}%</text>
                    </svg>
                    `;
      })()}
                </div>
                <div class="health-stats">
                  <div class="health-stat-item">
                    <span class="label">Total Tasks</span>
                    <span class="value">${tasks.length}</span>
                  </div>
                  <div class="health-stat-item">
                    <span class="label">Completed</span>
                    <span class="value">${tasks.filter(t => t.status === 'done').length}</span>
                  </div>
                </div>
              </div>

              <div class="priority-distribution">
                <div class="dist-title">Priority Spread</div>
                <div class="dist-bar">
                  ${(() => {
        const high = tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length;
        const med = tasks.filter(t => t.priority === 'medium').length;
        const low = tasks.filter(t => t.priority === 'low').length;
        const total = tasks.length || 1;
        return `
                      <div class="dist-segment urgent" style="width: ${(high / total) * 100}%" title="High/Critical"></div>
                      <div class="dist-segment medium" style="width: ${(med / total) * 100}%" title="Medium"></div>
                      <div class="dist-segment low" style="width: ${(low / total) * 100}%" title="Low"></div>
                    `;
      })()}
                </div>
                <div class="dist-legend">
                  <span>Critical: ${tasks.filter(t => t.priority === 'critical').length}</span>
                  <span>Active: ${tasks.filter(t => t.status === 'in-progress').length}</span>
                </div>
              </div>

              <div class="health-breakdown">
                <div class="breakdown-item">
                  <div class="item-header">
                    <span class="dot story"></span>
                    <span class="label">User Stories</span>
                    <span class="val">${tasks.filter(t => t.type === 'story').length}</span>
                  </div>
                  <div class="mini-bar-bg"><div class="mini-bar story" style="width: ${(tasks.filter(t => t.type === 'story').length / tasks.length) * 100}%"></div></div>
                </div>
                <div class="breakdown-item">
                  <div class="item-header">
                    <span class="dot bug"></span>
                    <span class="label">Bugs & Fixes</span>
                    <span class="val">${tasks.filter(t => t.type === 'bug').length}</span>
                  </div>
                  <div class="mini-bar-bg"><div class="mini-bar bug" style="width: ${(tasks.filter(t => t.type === 'bug').length / tasks.length) * 100}%"></div></div>
                </div>
                <div class="breakdown-item">
                  <div class="item-header">
                    <span class="dot task"></span>
                    <span class="label">General Tasks</span>
                    <span class="val">${tasks.filter(t => t.type === 'task').length}</span>
                  </div>
                  <div class="mini-bar-bg"><div class="mini-bar task" style="width: ${(tasks.filter(t => t.type === 'task').length / tasks.length) * 100}%"></div></div>
                </div>
              </div>

              <div class="project-pace-widget">
                 <div class="pace-label">Project Pace</div>
                 <div class="pace-value">${tasks.length > 5 ? 'Stable' : 'Building'}</div>
                 <div class="pace-sub">Based on last 7 days activity</div>
              </div>
            </div>
          </div>

          <!-- Project Roadmap -->
          <div>
            <div class="timeline-section-title" style="margin-bottom: 1rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Project Roadmap
            </div>
            <div class="roadmap-visual">
              ${tasks.slice(0, 5).map(task => `
                <div class="roadmap-item">
                  <div class="roadmap-content" onclick="window.app.switchView('issueDetail', '${task.id}')">
                    <div style="flex: 1;">
                        <div class="roadmap-date">${new Date(task.updatedAt).toLocaleDateString()}</div>
                        <div class="roadmap-task">${this.escapeHtml(task.title)}</div>
                        <div class="roadmap-meta">
                            <span>${task.id}</span>
                        </div>
                    </div>
                    <div class="roadmap-status-container" style="flex-shrink:0">
                        <span class="status-badge ${task.status}">${task.status}</span>
                    </div>
                  </div>
                </div>
              `).slice(0, 5).join('')}
              ${tasks.length === 0 ? '<div style="color: var(--text-tertiary);">No activity yet.</div>' : ''}
            </div>
          </div>

        </div>
      </div>
    `;
  }

  renderReports() {
    if (!this.currentProject) return this.renderNoProject();

    const stats = storage.getStatistics(this.currentProject.id);
    const p = this.currentProject;

    return `
      ${this.renderPageHeader(
      "Reports & Analytics",
      [this.currentProject.name, "Reports"],
      `
        <button class="btn btn-secondary" onclick="window.app.openProjectForm('${p.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit Project
        </button>
      `
    )}
      <div class="reports-container">
        <!-- Project Context Section -->
        <div class="project-brand-section">
          <h1 class="project-brand-title">${this.escapeHtml(p.name)}</h1>
          <p class="project-brand-desc">${this.escapeHtml(p.description || "No description provided for this project.")}</p>
        </div>

        <div class="analytics-dashboard">
          <!-- Overall Health -->
          <div class="analytics-widget">
            <div class="widget-header">
              <span class="widget-title">Project Health</span>
              <span class="badge ${stats.completionRate > 80 ? "success" : stats.completionRate > 40 ? "warning" : "danger"}">${stats.completionRate}% Done</span>
            </div>
            <div class="stat-showcase">
              <span class="stat-value-large">${stats.completionRate}%</span>
              <span class="stat-label-large">Completion Rate</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${stats.completionRate}%"></div>
            </div>
            <div class="data-grid">
              <div class="data-item">
                <span class="data-val">${stats.totalTasks}</span>
                <span class="data-lab">Total Issues</span>
              </div>
              <div class="data-item">
                <span class="data-val">${stats.doneTasks}</span>
                <span class="data-lab">Completed</span>
              </div>
            </div>
          </div>

          <!-- Status Distribution -->
          <div class="analytics-widget">
            <div class="widget-header">
                <span class="widget-title">Status Breakdown</span>
            </div>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-val">${stats.tasksByStatus.todo}</span>
                    <span class="data-lab">To Do</span>
                </div>
                <div class="data-item">
                    <span class="data-val">${stats.tasksByStatus.inProgress}</span>
                    <span class="data-lab">In Progress</span>
                </div>
                <div class="data-item">
                    <span class="data-val">${stats.tasksByStatus.inReview}</span>
                    <span class="data-lab">In Review</span>
                </div>
                <div class="data-item">
                    <span class="data-val">${stats.tasksByStatus.backlog}</span>
                    <span class="data-lab">Backlog</span>
                </div>
            </div>
          </div>

          <!-- Priority & Velocity -->
          <div class="analytics-widget">
            <div class="widget-header">
                <span class="widget-title">Priority & Velocity</span>
            </div>
            <div class="data-grid">
                <div class="data-item" style="border-left: 4px solid var(--danger);">
                    <span class="data-val">${stats.tasksByPriority.critical}</span>
                    <span class="data-lab">Critical Issues</span>
                </div>
                <div class="data-item">
                    <span class="data-val">${stats.recentActivityCount}</span>
                    <span class="data-lab">Updated (5d)</span>
                </div>
            </div>
            <div style="margin-top: 10px;">
                <div class="widget-title" style="font-size: 0.8rem; margin-bottom: 8px;">Task Type Mix</div>
                <div class="progress-track" style="height: 12px; display: flex; background: #eee;">
                    <div style="width: ${(stats.tasksByType.task / stats.totalTasks) * 100 || 0}%; background: var(--primary); height: 100%;" title="Tasks"></div>
                    <div style="width: ${(stats.tasksByType.bug / stats.totalTasks) * 100 || 0}%; background: var(--danger); height: 100%;" title="Bugs"></div>
                    <div style="width: ${(stats.tasksByType.story / stats.totalTasks) * 100 || 0}%; background: var(--success); height: 100%;" title="Stories"></div>
                </div>
                <div style="display: flex; gap: 10px; font-size: 0.7rem; margin-top: 8px; color: var(--text-tertiary);">
                    <span>● Task</span>
                    <span>● Bug</span>
                    <span>● Story</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderBackup() {
    const stats = storage.getStatistics();
    const sizeKB = (stats.databaseSize / 1024).toFixed(2);
    const hasProject = !!this.currentProject;

    return `
      ${this.renderPageHeader("Backup & Restore", [this.currentProject ? this.currentProject.name : "Project", "Backup"])}
      <div class="content-wrapper settings-page">

        <!-- Stats row -->
        <div class="settings-stats-row">
          <div class="settings-stat-card">
            <div class="settings-stat-icon" style="background: rgba(var(--primary-rgb),0.1); color: var(--primary)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <div>
              <div class="settings-stat-value">${stats.totalProjects}</div>
              <div class="settings-stat-label">Projects</div>
            </div>
          </div>
          <div class="settings-stat-card">
            <div class="settings-stat-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <div class="settings-stat-value">${stats.totalTasks}</div>
              <div class="settings-stat-label">Total Issues</div>
            </div>
          </div>
          <div class="settings-stat-card">
            <div class="settings-stat-icon" style="background: rgba(245,158,11,0.1); color: #f59e0b">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <div class="settings-stat-value">${sizeKB} KB</div>
              <div class="settings-stat-label">Database Size</div>
            </div>
          </div>
          ${stats.lastBackup ? `
          <div class="settings-stat-card">
            <div class="settings-stat-icon" style="background: rgba(16,185,129,0.1); color: var(--success)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div class="settings-stat-value" style="font-size:0.9rem">${new Date(stats.lastBackup).toLocaleDateString()}</div>
              <div class="settings-stat-label">Last Backup</div>
            </div>
          </div>` : ""}
        </div>

        <div class="settings-card">
          <div class="settings-card-header">
            <div class="settings-card-icon" style="background: rgba(var(--primary-rgb),0.1); color: var(--primary)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div>
              <div class="settings-card-title">Export Data</div>
              <div class="settings-card-desc">Download a JSON backup of your workspace. Restore it anytime.</div>
            </div>
          </div>
          <div class="settings-card-actions">
            <button class="btn btn-primary" id="exportAllBtn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export All Data
            </button>
            <button class="btn btn-secondary" id="exportProjectBtn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              Export Current Project
            </button>
          </div>
        </div>

        <!-- Import -->
        <div class="settings-card">
          <div class="settings-card-header">
            <div class="settings-card-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div>
              <div class="settings-card-title">Import Data</div>
              <div class="settings-card-desc">Restore from a full backup or import a single exported project.</div>
            </div>
          </div>
          <div class="settings-card-actions">
            <button class="btn btn-secondary" onclick="document.getElementById('importFile').click()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Import Full Backup
            </button>
            <button class="btn btn-secondary" onclick="document.getElementById('importProjectFile').click()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              Import a Project
            </button>
            <input type="file" id="importFile" accept=".json" style="display:none">
            <input type="file" id="importProjectFile" accept=".json" style="display:none">
          </div>
        </div>
      </div>
    `;
  }

  renderSettings() {
    const settings = storage.getSettings();

    return `
      ${this.renderPageHeader("Settings", [this.currentProject ? this.currentProject.name : "Project", "Settings"])}
      <div class="content-wrapper settings-page">

        <!-- Appearance -->
        <div class="settings-card">
          <div class="settings-card-header">
            <div class="settings-card-icon" style="background: rgba(var(--primary-rgb),0.1); color: var(--primary)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            </div>
            <div>
              <div class="settings-card-title">Appearance</div>
              <div class="settings-card-desc">Customize the look and feel of your workspace.</div>
            </div>
          </div>
          <div class="settings-card-body">
            <div class="settings-row">
              <div class="settings-row-info">
                <span class="settings-row-label">Theme</span>
                <span class="settings-row-hint">Choose between dark and light mode</span>
              </div>
              <select id="themeSelect" class="filter-select custom-select">
                <option value="dark" ${settings.theme === "dark" ? "selected" : ""}>Dark</option>
                <option value="light" ${settings.theme === "light" ? "selected" : ""}>Light</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div class="settings-card">
          <div class="settings-card-header">
            <div class="settings-card-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
            <div>
              <div class="settings-card-title">Preferences</div>
              <div class="settings-card-desc">Configure default behaviors for your workspace.</div>
            </div>
          </div>
          <div class="settings-card-body">
            <div class="settings-row">
              <div class="settings-row-info">
                <span class="settings-row-label">Default View</span>
                <span class="settings-row-hint">The view shown when opening a project</span>
              </div>
              <select id="viewModeSelect" class="filter-select custom-select">
                <option value="board" ${settings.viewMode === "board" ? "selected" : ""}>Kanban Board</option>
                <option value="issues" ${settings.viewMode === "issues" ? "selected" : ""}>Issues Table</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="settings-card settings-card-danger" style="margin-top: 2.5rem;">
          <div class="settings-card-header">
            <div class="settings-card-icon" style="background: rgba(239,68,68,0.1); color: var(--danger)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <div class="settings-card-title" style="color:var(--danger)">Danger Zone</div>
              <div class="settings-card-desc">Irreversible actions for your workspace. These cannot be undone.</div>
            </div>
          </div>
          <div class="settings-card-actions">
            <button class="btn btn-danger btn-outline" id="deleteCurrentProjectBtn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              Delete Current Project
            </button>
            <button class="btn btn-danger" id="clearAllDataBtn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              Clear All Data
            </button>
          </div>
        </div>

      </div>
    `;
  }

  renderNoProject() {
    return `
      <div class="content-centered">
        <div class="welcome-overview-screen">
          <div class="overview-animation" style="margin-bottom: 2rem;">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" opacity="0.3"/>
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <h2 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem;">Welcome to Kinetic</h2>
          <p style="color: var(--text-tertiary); font-size: 1.1rem; max-width: 500px; text-align: center; margin-bottom: 2.5rem;">
            Select a project from the sidebar or create a new one to start managing your tasks efficiently.
          </p>
          <button class="btn btn-primary" onclick="window.app.openProjectsModal()">
            Select a Project
          </button>
        </div>
      </div>
    `;
  }

  renderGettingStarted() {
    return `
      <div class="welcome-overview-screen" style="animation: fadeIn 0.5s ease-out;">
        <div class="overview-animation" style="margin-bottom: 2rem;">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <h2 style="color: var(--text-primary); font-size: 2rem; font-weight: 700; margin-bottom: 0.75rem;">Let's get started</h2>
        <p style="color: var(--text-tertiary); max-width: 440px; line-height: 1.7; margin: 0 auto 2rem;">
          Create your first project to start tracking issues, managing your backlog, and building with Kinetic Terminal.
        </p>
        <button class="btn btn-primary" style="font-size: 1rem; padding: 14px 28px;" id="selectProjectBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create First Project
        </button>
      </div>
    `;
  }

  renderOverview() {
    if (!this.currentProject) {
      return this.renderNoProject();
    }

    return `
      ${this.renderPageHeader("Overview", [this.currentProject.name, "Overview"])}
      <div class="content-wrapper text-center welcome-overview-screen" style="padding: 6rem 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
        <div class="overview-animation" style="margin-bottom: 2rem;">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <h2 style="color: var(--text-primary); font-size: 2rem; margin-bottom: 1rem;">Welcome to ${this.escapeHtml(this.currentProject.name)}</h2>
        <p style="color: var(--text-tertiary); max-width: 500px; line-height: 1.6; margin: 0 auto 2rem;">
          Here is your blank workspace. Use the sidebar to navigate to your Boards, check your Backlog, or review your Issues table.
        </p>
      </div>
    `;
  }

  formatViewName(viewId) {
    const map = {
      board: "Board",
      backlog: "Backlog",
      timeline: "Timeline",
      issues: "Issues",
      overview: "Overview",
      reports: "Reports",
      settings: "Settings"
    };
    return map[viewId] || viewId;
  }

  unformatViewName(name) {
    const map = {
      "Board": "board",
      "Backlog": "backlog",
      "Timeline": "timeline",
      "Issues": "issues",
      "Overview": "overview",
      "Reports": "reports",
      "Settings": "settings",
      "People": "people"
    };
    return map[name] || name.toLowerCase();
  }

  sortTasks(tasks) {
    if (!tasks || tasks.length === 0) return [];

    // Create a copy to avoid mutation issues if needed
    const sorted = [...tasks];
    const pref = this.sortPreference || "updated-desc";

    return sorted.sort((a, b) => {
      switch (pref) {
        case "updated-desc":
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "updated-asc":
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        case "priority-desc":
          const pMap = { critical: 4, high: 3, medium: 2, low: 1 };
          return pMap[b.priority] - pMap[a.priority];
        case "title-asc":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }

  renderSortDropdown() {
    const options = [
      { value: "updated-desc", label: "Recently Updated" },
      { value: "updated-asc", label: "Oldest First" },
      { value: "priority-desc", label: "Priority (High to Low)" },
      { value: "title-asc", label: "Title (A-Z)" },
    ];

    const current = this.sortPreference || "updated-desc";
    const currentLabel = options.find((o) => o.value === current)?.label || "Recently Updated";

    return `
      <div class="dropdown sort-dropdown">
        <button class="btn btn-secondary dropdown-toggle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/>
          </svg>
          Sort: ${currentLabel}
        </button>
        <div class="dropdown-menu">
          ${options.map((opt) => `
            <a href="#" class="${opt.value === current ? "active" : ""}" data-sort-value="${opt.value}">${opt.label}</a>
          `).join("")}
        </div>
      </div>
    `;
  }

  applySort(sortKey) {
    this.currentSort = sortKey;
    this.renderCurrentView();
  }

  renderEmptyState(title, subtitle) {
    return `
      <div class="empty-state-container">
        <div class="empty-state-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <h3 class="empty-state-title">${this.escapeHtml(title)}</h3>
        <p class="empty-state-subtitle">${this.escapeHtml(subtitle)}</p>
      </div>
    `;
  }

  setupDynamicEventListeners() {
    // Initialize Kanban drag & drop if board is visible
    this.initKanbanDragDrop();

    // Create task button
    document.getElementById("createTaskBtn")?.addEventListener("click", () => {
      this.openTaskForm();
    });

    document
      .getElementById("selectProjectBtn")
      ?.addEventListener("click", () => {
        this.openProjectsModal();
      });

    // Export buttons
    document.getElementById("exportAllBtn")?.addEventListener("click", () => {
      this.exportAllData();
    });

    document
      .getElementById("exportProjectBtn")
      ?.addEventListener("click", () => {
        this.exportProject();
      });

    // Import full backup
    document.getElementById("importFile")?.addEventListener("change", (e) => {
      this.importData(e.target.files[0]);
    });

    // Import single project
    document.getElementById("importProjectFile")?.addEventListener("change", (e) => {
      this.importProjectFile(e.target.files[0]);
    });

    // Delete current project
    document.getElementById("deleteCurrentProjectBtn")?.addEventListener("click", () => {
      this.deleteCurrentProject();
    });

    // Clear all data
    document
      .getElementById("clearAllDataBtn")
      ?.addEventListener("click", () => {
        this.confirmAction(
          "Permanent Data Deletion",
          "This will permanently delete ALL data including all projects, issues, and settings. This action cannot be undone.",
          "Clear All Data",
          "danger",
          () => {
            if (storage.clearAllData()) {
              this.currentProject = null;
              localStorage.removeItem("lastProjectId");
              this.updateSidebarProject();
              this.render();
            }
          }
        );
      });

    // Settings
    document.getElementById("themeSelect")?.addEventListener("change", (e) => {
      storage.setSetting("theme", e.target.value);
      this.applySettings();
    });

    document.getElementById("viewModeSelect")
      ?.addEventListener("change", (e) => {
        storage.setSetting("viewMode", e.target.value);
      });



    // Filters
    document.getElementById("statusFilter")?.addEventListener("change", () => {
      this.applyFilters();
    });

    document
      .getElementById("priorityFilter")
      ?.addEventListener("change", () => {
        this.applyFilters();
      });

    // View Toggle
    document.querySelectorAll(".view-toggle-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const viewType = e.target.dataset.issuesView;
        if (viewType) {
          this.issuesViewType = viewType;
          this.renderCurrentView();
        }
      });
    });
  }

  // Continue in next part...
  selectProject(projectId) {
    const project = storage.getProject(projectId);
    if (!project) return;

    this.currentProject = project;
    localStorage.setItem("lastProjectId", projectId);
    this.breadcrumbStack = [];

    // Add transition effect to content area
    this.contentArea.style.opacity = "0";
    this.contentArea.style.transform = "scale(0.98)";

    setTimeout(() => {
      this.render();
      this.contentArea.style.transition = "all 0.4s cubic-bezier(0.2, 0, 0, 1)";
      this.contentArea.style.opacity = "1";
      this.contentArea.style.transform = "scale(1)";
    }, 150);

    this.showNotification(`Switched to ${project.name}`, "success");
    this.updateSidebarProject();
    this.closeAllModals();
    this.switchView("board");
  }

  updateSidebarProject() {
    if (this.currentProject) {
      if (this.sidebarProjectName) this.sidebarProjectName.textContent = this.currentProject.name;
      if (this.sidebarProjectName) this.sidebarProjectName.setAttribute("data-tooltip", this.currentProject.name);
      if (this.sidebarProjectKey) this.sidebarProjectKey.textContent = this.currentProject.key;
      const tasks = storage.getTasks(this.currentProject.id);
      if (this.issuesBadge) this.issuesBadge.textContent = tasks.length;
    } else {
      if (this.sidebarProjectName) this.sidebarProjectName.textContent = "Select Project";
      if (this.sidebarProjectKey) this.sidebarProjectKey.textContent = "---";
      if (this.issuesBadge) this.issuesBadge.textContent = "0";
    }
  }

  openProjectsModal() {
    const projects = storage.getProjects();
    const projectList = document.getElementById("projectList");
    const modal = document.getElementById("projectsModal");

    if (projects.length === 0) {
      projectList.innerHTML = `
        <div class="text-center" style="padding: 3rem; width: 100%;">
          <h3 style="color: var(--text-secondary);">No Projects Yet</h3>
          <p style="color: var(--text-tertiary); margin-bottom: 1.5rem;">Create your first project to get started</p>
          <button class="btn btn-primary" onclick="window.app.openProjectForm(); window.app.closeModal('projectsModal');">Create Project</button>
        </div>
      `;
    } else {
      modal.classList.add("switcher-mode");
      projectList.className = "switcher-list";
      projectList.innerHTML = projects
        .map(
          (project, index) => `
        <div class="switcher-item" data-project-id="${project.id}" data-index="${index}">
          <div class="switcher-preview">
            <div class="switcher-icon">${project.key.toUpperCase()}</div>
          </div>
          <div class="switcher-label">
            <span class="switcher-badge">${project.key.charAt(0).toUpperCase()}</span>
            <span>${this.escapeHtml(project.name)}</span>
          </div>
        </div>
      `,
        )
        .join("");

      let currentIndex = projects.findIndex(p => p.id === this.currentProject?.id);
      if (currentIndex === -1) currentIndex = 0;

      const updateFocus = (index) => {
        const items = projectList.querySelectorAll(".switcher-item");
        items.forEach((item, i) => {
          item.classList.toggle("active", i === index);
        });

        // Center the active item
        const activeItem = items[index];
        if (activeItem) {
          const scrollLeft = activeItem.offsetLeft - (projectList.offsetWidth / 2) + (activeItem.offsetWidth / 2);
          projectList.scrollTo({
            left: scrollLeft,
            behavior: "smooth"
          });
        }
      };

      // Initial focus
      setTimeout(() => updateFocus(currentIndex), 100);

      // Keyboard navigation
      const navHandler = (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          currentIndex = (currentIndex + 1) % projects.length;
          updateFocus(currentIndex);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          currentIndex = (currentIndex - 1 + projects.length) % projects.length;
          updateFocus(currentIndex);
        } else if (e.key === "Enter") {
          e.preventDefault();
          const selectedProject = projects[currentIndex];
          this.selectProject(selectedProject.id);
          closeEverything();
        } else if (e.key === "Escape") {
          closeEverything();
        }
      };

      const closeEverything = () => {
        this.closeModal("projectsModal");
        modal.classList.remove("switcher-mode");
        document.removeEventListener("keydown", navHandler);
      };

      document.addEventListener("keydown", navHandler);

      // Add project click listeners for switcher
      projectList.querySelectorAll(".switcher-item").forEach((item, index) => {
        item.addEventListener("click", () => {
          currentIndex = index;
          updateFocus(currentIndex);
          setTimeout(() => {
            this.selectProject(item.dataset.projectId);
            closeEverything();
          }, 200);
        });
      });
    }

    this.openModal("projectsModal");
  }

  openProjectForm(projectId = null) {
    if (projectId) {
      // Edit mode
      const project = storage.getProject(projectId);
      document.getElementById("projectFormTitle").textContent = "Edit Project";
      document.getElementById("projectName").value = project.name;
      document.getElementById("projectKey").value = project.key;
      document.getElementById("projectDesc").value = project.description;
    } else {
      // Create mode
      document.getElementById("projectFormTitle").textContent =
        "Create Project";
      this.projectForm.reset();
    }

    this.closeModal("projectsModal");
    this.openModal("projectFormModal");
  }

  handleProjectSubmit(e) {
    e.preventDefault();

    const projectData = {
      name: document.getElementById("projectName").value.trim(),
      key: document.getElementById("projectKey").value.trim().toUpperCase(),
      description: document.getElementById("projectDesc").value.trim(),
    };

    const project = storage.createProject(projectData);
    this.currentProject = project;
    localStorage.setItem("lastProjectId", project.id);
    this.updateSidebarProject();

    this.closeModal("projectFormModal");
    this.switchView("board");
    this.showNotification("Project created successfully!", "success");
  }

  openTaskForm(taskId = null) {
    if (!this.currentProject) {
      this.showNotification("Please select a project first", "error");
      return;
    }

    if (taskId) {
      // Edit mode
      const task = storage.getTask(taskId);
      this.currentTaskId = taskId;
      document.getElementById("taskModalTitle").textContent = "Edit Issue";
      document.getElementById("taskTitle").value = task.title;
      document.getElementById("taskDesc").value = task.description;
      document.getElementById("taskType").value = task.type;
      document.getElementById("taskStatus").value = task.status;
      document.getElementById("taskPriority").value = task.priority;

      // Setup People Selects
      this.populatePeopleSelects(task.assignee, task.reporter);

      document.getElementById("taskSprint").value = task.sprint || "";
      document.getElementById("taskDueDate").value = task.dueDate || "";
      document.getElementById("taskEstimate").value = task.estimate || "";
      document.getElementById("taskTags").value = task.tags ? task.tags.join(", ") : "";

      // Setup Blockers Select
      this.populateBlockerSelect(task.dependency);

      document.getElementById("taskFormSubmitBtn").textContent = "Update Issue";
    } else {
      // Create mode
      this.currentTaskId = null;
      document.getElementById("taskModalTitle").textContent = "Create Issue";
      this.taskForm.reset();
      this.populatePeopleSelects();
      this.populateBlockerSelect();
      document.getElementById("taskFormSubmitBtn").textContent = "Create Issue";
    }
    this.transformSelects();

    this.openModal("taskModal");
  }

  populatePeopleSelects(selectedAssignee = "", selectedReporter = "Me") {
    const people = storage.getPeople();
    const assigneeSelect = document.getElementById("taskAssignee");
    const reporterSelect = document.getElementById("taskReporter");

    if (assigneeSelect) {
      assigneeSelect.innerHTML = '<option value="">Unassigned</option>' +
        people.map(p => `<option value="${p.name}" ${p.name === selectedAssignee ? 'selected' : ''}>${p.name}</option>`).join("");
    }

    if (reporterSelect) {
      reporterSelect.innerHTML = people.map(p => `<option value="${p.name}" ${p.name === selectedReporter ? 'selected' : ''}>${p.name}</option>`).join("");
    }
  }

  populateBlockerSelect(selectedBlockers = "") {
    if (!this.currentProject) return;

    const tasks = storage.getTasks(this.currentProject.id).filter(t => t.status !== 'done' && t.id !== this.currentTaskId);
    const blockerSelect = document.getElementById("taskDependency");

    if (blockerSelect) {
      const selected = selectedBlockers ? selectedBlockers.split(",").map(s => s.trim()) : [];
      blockerSelect.innerHTML = tasks.map(t =>
        `<option value="${t.id}" ${selected.includes(t.id) ? 'selected' : ''}>${t.id}: ${t.title}</option>`
      ).join("");
    }
  }

  refreshSearchableSelect(select) {
    // Logic to refresh the custom dropdown options when the base select changes
    const wrapper = select.nextElementSibling;
    if (wrapper && wrapper.classList.contains("searchable-dropdown")) {
      const optionsContainer = wrapper.querySelector(".dropdown-options-container");
      const buttonText = wrapper.querySelector("button span");
      const isMultiple = select.multiple;

      const getDisplayText = () => {
        if (isMultiple) {
          const selected = Array.from(select.selectedOptions);
          if (selected.length === 0) return select.dataset.placeholder || "Select...";
          if (selected.length === 1) return selected[0].text;
          return `${selected.length} selected`;
        }
        return select.options[select.selectedIndex]?.text || select.dataset.placeholder || "Select...";
      };

      if (optionsContainer) {
        optionsContainer.innerHTML = "";
        Array.from(select.options).forEach((option) => {
          const a = document.createElement("a");
          a.href = "#";
          a.dataset.value = option.value;
          a.className = option.selected ? "selected" : "";
          a.textContent = option.text;
          a.addEventListener("click", (e) => {
            e.preventDefault();
            if (isMultiple) {
              option.selected = !option.selected;
              a.classList.toggle("selected");
              buttonText.textContent = getDisplayText();
            } else {
              select.value = option.value;
              buttonText.textContent = option.text;
              wrapper.querySelector(".dropdown-menu").classList.remove("show");
            }
            select.dispatchEvent(new Event("change"));
          });
          optionsContainer.appendChild(a);
        });
      }
      buttonText.textContent = getDisplayText();
    }
  }

  handleTaskSubmit(e) {
    e.preventDefault();

    const taskData = {
      title: document.getElementById("taskTitle").value.trim(),
      description: document.getElementById("taskDesc").value.trim(),
      type: document.getElementById("taskType").value,
      status: document.getElementById("taskStatus").value,
      priority: document.getElementById("taskPriority").value,
      assignee: document.getElementById("taskAssignee").value,
      reporter: document.getElementById("taskReporter").value,
      sprint: document.getElementById("taskSprint").value.trim(),
      dueDate: document.getElementById("taskDueDate")?.value || "",
      estimate: document.getElementById("taskEstimate").value,
      tags: document
        .getElementById("taskTags")
        .value.split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      dependency: Array.from(document.getElementById("taskDependency").selectedOptions).map(o => o.value).join(", "),
    };

    if (this.currentTaskId) {
      // Update existing task
      storage.updateTask(this.currentTaskId, taskData);
      this.showNotification("Task updated successfully!", "success");
    } else {
      // Create new task
      storage.createTask(this.currentProject.id, taskData);
      this.showNotification("Task created successfully!", "success");
    }

    this.closeModal("taskModal");
    this.updateSidebarBadges();
    this.renderCurrentView();
  }

  handleSortChange(value) {
    this.sortPreference = value;
    storage.setSetting("sortPreference", value);
    this.render();
  }

  sortTasks(tasks) {
    const pref = this.sortPreference;
    return tasks.sort((a, b) => {
      if (pref === "updated-desc") return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (pref === "updated-asc") return new Date(a.updatedAt) - new Date(b.updatedAt);
      if (pref === "priority-desc") {
        const pMap = { critical: 4, high: 3, medium: 2, low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      if (pref === "title-asc") return a.title.localeCompare(b.title);
      return 0;
    });
  }

  formatRelativeTime(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return then.toLocaleDateString();
  }

  updateSidebarBadges() {
    const issuesBadge = document.getElementById("issuesBadge");
    const backlogBadge = document.getElementById("backlogBadge");
    const boardBadge = document.getElementById("boardBadge");

    if (!this.currentProject) {
      if (issuesBadge) issuesBadge.textContent = "0";
      if (backlogBadge) backlogBadge.textContent = "0";
      if (boardBadge) boardBadge.textContent = "0";
      return;
    }

    const tasks = storage.getTasks(this.currentProject.id);
    if (issuesBadge) issuesBadge.textContent = tasks.length;
    if (backlogBadge) backlogBadge.textContent = tasks.filter(t => t.status === 'backlog').length;
    if (boardBadge) boardBadge.textContent = tasks.filter(t => t.status !== 'backlog' && t.status !== 'done').length;
  }



  openTaskDetails(taskId) {
    this.switchView("issueDetail", taskId);
  }

  renderIssueDetail(taskId) {
    const task = storage.getTask(taskId);
    if (!task) return this.renderNoProject();

    const project = storage.getProject(task.projectId);
    const typeIcons = {
      task: "📋",
      bug: "🐛",
      feature: "✨",
      epic: "🎯",
    };

    // Breadcrumb logic
    const breadcrumbData = [project ? project.name : "Project", ...this.breadcrumbStack];

    // Blockers rendering
    const blockers = task.dependency ? task.dependency.split(",").map(id => id.trim()).filter(id => id) : [];
    const blockersHTML = blockers.length > 0
      ? blockers.map(bid => {
        const btask = storage.getTask(bid);
        return `<div class="blocker-item clickable" data-blocker-id="${bid}">
            <span class="blocker-id">${bid}</span>
            <span class="blocker-title">${btask ? this.escapeHtml(btask.title) : "Unknown Task"}</span>
          </div>`;
      }).join("")
      : '<span class="sidebar-value">None</span>';

    return `
      <div class="issue-view">
        ${this.renderPageHeader(task.id, breadcrumbData, `
          <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle">
              ${this.formatStatus(task.status)}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div class="dropdown-menu">
              <a href="#" data-task-id="${task.id}" data-status-value="todo">To Do</a>
              <a href="#" data-task-id="${task.id}" data-status-value="in-progress">In Progress</a>
              <a href="#" data-task-id="${task.id}" data-status-value="in-review">In Review</a>
              <a href="#" data-task-id="${task.id}" data-status-value="done">Done</a>
            </div>
          </div>
          <button class="btn btn-secondary" data-action="edit-task" data-task-id="${task.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          <button class="btn btn-danger" data-action="delete-task" data-task-id="${task.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete
          </button>
        `)}

        <div class="issue-content">
          <div class="issue-main">
            <div class="issue-title-block">
               <h2 class="task-title-large">${this.escapeHtml(task.title)}</h2>
            </div>
            <div class="issue-section">
              <div class="issue-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Description
              </div>
              <div class="issue-description">${this.escapeHtml(task.description) || "<em>No description provided.</em>"}</div>
            </div>

            <div class="comments-section">
              <div class="issue-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                Activity
              </div>
              
              <div class="comment-list" id="commentList">
                ${this.renderComments(task.comments || [])}
              </div>

              <div class="comment-input-container">
                <div class="comment-avatar">M</div>
                <div class="comment-input-wrapper">
                  <textarea class="comment-textarea" id="commentInput" placeholder="Add a comment..."></textarea>
                  <div class="comment-actions">
                    <button class="btn btn-primary" onclick="window.app.handleAddComment('${task.id}')">Post Comment</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="issue-sidebar">
            <div class="sidebar-group">
              <h4>People</h4>
              <div class="sidebar-item">
                <span class="sidebar-label">Assignee</span>
                <span class="sidebar-value">${task.assignee || "Unassigned"}</span>
              </div>
              <div class="sidebar-item">
                <span class="sidebar-label">Reporter</span>
                <span class="sidebar-value">${task.reporter || "Me"}</span>
              </div>
            </div>

            <div class="sidebar-group">
              <h4>Details</h4>
              <div class="sidebar-item">
                <span class="sidebar-label">Type</span>
                <span class="sidebar-value">${typeIcons[task.type]} ${this.formatType(task.type)}</span>
              </div>
              <div class="sidebar-item">
                <span class="sidebar-label">Priority</span>
                <span class="sidebar-value"><span class="priority-badge ${task.priority}">${task.priority}</span></span>
              </div>
              <div class="sidebar-item">
                <span class="sidebar-label">Status</span>
                <span class="sidebar-value"><span class="status-badge ${task.status}">${this.formatStatus(task.status)}</span></span>
              </div>
              <div class="sidebar-item">
                <span class="sidebar-label">Story Points</span>
                <span class="sidebar-value">${task.estimate || "0"}</span>
              </div>
              <div class="sidebar-item">
                <span class="sidebar-label">Labels</span>
                <span class="sidebar-value">
                  ${task.tags && task.tags.length > 0
        ? task.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join("")
        : '<span style="color: var(--text-tertiary)">None</span>'}
                </span>
              </div>
            </div>

            <div class="sidebar-group">
              <h4>Blockers</h4>
              <div class="blocker-list">${blockersHTML}</div>
            </div>

            <div class="sidebar-group">
              <h4>Dates</h4>
              <div class="sidebar-item">
                <span class="sidebar-label">Created</span>
                <span class="sidebar-value">${new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="sidebar-item">
                <span class="sidebar-label">Updated</span>
                <span class="sidebar-value">${new Date(task.updatedAt).toLocaleDateString()}</span>
              </div>
              <div class="sidebar-item">
                <span class="sidebar-label">Due Date</span>
                <span class="sidebar-value">${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '<span style="color: var(--text-tertiary)">None</span>'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderComments(comments) {
    if (comments.length === 0) {
      return `<p style="color: var(--text-tertiary); margin-bottom: 2rem;">No comments yet.</p>`;
    }

    return comments.map(comment => `
      <div class="comment-item">
        <div class="comment-avatar">${comment.author.charAt(0)}</div>
        <div class="comment-content-wrapper">
          <div class="comment-header">
            <span class="comment-author">${comment.author}</span>
            <span class="comment-time">${new Date(comment.createdAt).toLocaleString()}</span>
          </div>
          <div class="comment-text">${this.escapeHtml(comment.content)}</div>
        </div>
      </div>
    `).join("");
  }

  handleAddComment(taskId) {
    const input = document.getElementById("commentInput");
    const content = input.value.trim();
    if (!content) return;

    storage.addComment(taskId, content);
    input.value = "";
    this.renderCurrentView();
  }

  handleStatusChange(taskId, newStatus) {
    storage.updateTask(taskId, { status: newStatus });
    this.renderCurrentView();
    this.showNotification(`Status updated to ${this.formatStatus(newStatus)}`, "success");
  }

  editCurrentTask() {
    if (this.currentTaskId) {
      this.openTaskForm(this.currentTaskId);
    }
  }

  deleteCurrentTask() {
    if (this.currentTaskId) {
      this.confirmAction(
        "Delete Task",
        "Are you sure you want to delete this task? This action cannot be undone.",
        "Delete Task",
        "danger",
        () => {
          storage.deleteTask(this.currentTaskId);
          this.switchView(this.previousView || "board");
          this.showNotification("Task deleted successfully", "success");
        }
      );
    }
  }

  exportAllData() {
    const { data, filename } = storage.exportAllData();
    this.downloadFile(data, filename);
    this.showNotification("Data exported successfully!", "success");
  }

  exportProject() {
    if (!this.currentProject) {
      this.showNotification("Please select a project to export", "warning");
      return;
    }

    const result = storage.exportProject(this.currentProject.id);
    if (result) {
      this.downloadFile(result.data, result.filename);
      this.showNotification("Project exported successfully!", "success");
    }
  }

  importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = storage.importData(e.target.result, false);

      if (result.success) {
        this.showNotification(result.message, "success");
        this.render();
      } else {
        this.showNotification(result.error, "error");
      }

      // Reset file input
      document.getElementById("importFile").value = "";
    };
    reader.readAsText(file);
  }

  importProjectFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        // Force treat as single-project export
        if (!parsed.project) {
          this.showNotification("Invalid project file — missing project data.", "error");
          return;
        }
        const result = storage.importProject(parsed, false);
        if (result.success) {
          this.showNotification(result.message, "success");
          // Auto-select the newly imported project
          const project = storage.getProject(result.projectId);
          if (project) {
            this.currentProject = project;
            localStorage.setItem("lastProjectId", project.id);
            this.updateSidebarProject();
            this.switchView("board");
          } else {
            this.render();
          }
        } else {
          this.showNotification(result.error, "error");
        }
      } catch {
        this.showNotification("Failed to parse project file.", "error");
      }
      const input = document.getElementById("importProjectFile");
      if (input) input.value = "";
    };
    reader.readAsText(file);
  }
  deleteCurrentProject() {
    if (!this.currentProject) {
      this.showNotification("Please select a project first", "warning");
      return;
    }
    const projectName = this.currentProject.name;
    const projectId = this.currentProject.id;

    this.confirmAction(
      "Delete Project",
      `Are you sure you want to delete project "${projectName}" and all its issues? This action cannot be undone.`,
      "Delete Project",
      "danger",
      () => {
        storage.deleteProject(projectId);

        // Try to switch to another remaining project
        const remaining = storage.getProjects();
        if (remaining.length > 0) {
          this.currentProject = remaining[0];
          localStorage.setItem("lastProjectId", remaining[0].id);
          this.updateSidebarProject();
          this.switchView("board");
          this.showNotification(`"${projectName}" deleted. Switched to "${remaining[0].name}".`, "success");
        } else {
          // No projects left — show welcome screen on the board tab
          this.currentProject = null;
          localStorage.removeItem("lastProjectId");
          this.updateSidebarProject();
          this.switchView("board");
          this.showNotification(`"${projectName}" deleted.`, "success");
        }
      }
    );
  }

  downloadFile(content, filename) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  applyFilters() {
    this.filters.status = document.getElementById("statusFilter")?.value || "all";
    this.filters.priority = document.getElementById("priorityFilter")?.value || "all";
    this.filters.assignee = document.getElementById("assigneeFilter")?.value || "all";
    this.filters.reporter = document.getElementById("reporterFilter")?.value || "all";
    this.renderCurrentView();
  }

  handleGlobalSearch(query) {
    const searchResults = document.getElementById("searchResults");
    if (!query.trim()) {
      searchResults.classList.remove("active");
      return;
    }

    const data = storage.getData();
    const tasks = data.tasks || [];
    const results = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description.toLowerCase().includes(query.toLowerCase()) ||
        task.id.toLowerCase().includes(query.toLowerCase()),
    );

    this.renderSearchResults(results);
  }

  renderSearchResults(results) {
    const searchResults = document.getElementById("searchResults");
    if (results.length === 0) {
      searchResults.innerHTML =
        '<div class="search-no-results">No tasks found</div>';
    } else {
      searchResults.innerHTML = results
        .map((task) => {
          const project = storage.getProject(task.projectId);
          return `
            <div class="search-result-item" data-task-id="${task.id}" data-project-id="${task.projectId}">
              <div class="search-result-header">
                <span class="search-result-title">${this.escapeHtml(task.title)}</span>
                <span class="search-result-id">${this.escapeHtml(task.id)}</span>
              </div>
              <div class="search-result-project">${project ? this.escapeHtml(project.name) : ""}</div>
            </div>
          `;
        })
        .join("");
    }
    searchResults.classList.add("active");

    // Add listeners to results
    searchResults.querySelectorAll(".search-result-item").forEach((item) => {
      item.addEventListener("click", () => {
        const taskId = item.dataset.taskId;
        const projectId = item.dataset.projectId;

        // If it's a different project, switch context
        if (!this.currentProject || this.currentProject.id !== projectId) {
          this.selectProject(projectId);
        }

        setTimeout(() => {
          this.openTaskDetails(taskId);
        }, 100);

        searchResults.classList.remove("active");
        document.getElementById("globalSearch").value = "";
      });
    });
  }

  closeAllMenus() {
    document.querySelectorAll(".dropdown-menu.show, .notifications-dropdown.show").forEach((menu) => {
      menu.classList.remove("show");
    });
  }

  closeAllMenus() {
    document.querySelectorAll(".dropdown-menu.show, .notifications-dropdown.show").forEach((menu) => {
      menu.classList.remove("show");
    });
  }

  applySettings(isInitialLoad = false) {
    const settings = storage.getSettings();

    // Apply Theme
    if (settings.theme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }

    // Apply Default View (only on initial load if not already set)
    if (isInitialLoad && !this.currentView) {
      const rawView = settings.viewMode || "board";
      this.currentView = rawView === "kanban" ? "board" : rawView;
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      this.modalOverlay.classList.add("active");
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
      const activeModals = document.querySelector(".modal.active, .side-panel.active");
      if (!activeModals) {
        this.modalOverlay.classList.remove("active");
      }
    }
  }

  closeAllModals() {
    document.querySelectorAll(".modal, .side-panel").forEach((modal) => {
      modal.classList.remove("active");
    });
    this.modalOverlay.classList.remove("active");
  }

  showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 24px;
      background: ${type === "success" ? "var(--success)" : "var(--danger)"};
      color: var(--bg-main);
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg);
      font-weight: 600;
      z-index: 10000;
      box-shadow: var(--shadow-xl);
      animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  formatStatus(status) {
    const map = {
      backlog: "Backlog",
      todo: "To Do",
      "in-progress": "In Progress",
      "in-review": "In Review",
      done: "Done",
    };
    return map[status] || status;
  }

  formatType(type) {
    const map = {
      task: "Task",
      bug: "Bug",
      feature: "Feature",
      epic: "Epic",
    };
    return map[type] || type;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  renderPageHeader(title, breadcrumbData = [], actionsHTML = "") {
    const breadcrumbHTML =
      breadcrumbData.length > 0
        ? `<div class="breadcrumb">
          ${breadcrumbData
          .map(
            (item, index) => {
              let isClickable = false;
              let targetView = "";
              let targetId = null;

              if (index === 0) {
                // Project Name -> Overview
                isClickable = true;
                targetView = "overview";
              } else if (index === 1 && breadcrumbData.length > 2) {
                // View Name
                isClickable = true;
                targetView = this.previousView || "board";
              } else if (index >= 2 && index < breadcrumbData.length - 1) {
                // Middle items (could be nested tasks)
                isClickable = true;
                targetView = "issueDetail";
                targetId = item;
              }

              return `
                  <span class="breadcrumb-item ${isClickable ? "clickable" : ""}"
                        ${isClickable ? `data-breadcrumb-view="${targetView}" ${targetId ? `data-breadcrumb-id="${targetId}"` : ""}` : ""}>
                    ${this.escapeHtml(item)}
                  </span>
                  ${index < breadcrumbData.length - 1 ? '<span class="breadcrumb-separator">/</span>' : ""}
                `;
            },
          )
          .join("")}
         </div>`
        : "";

    return `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-title-section">
            ${breadcrumbHTML}
            <h1 class="page-title">${this.escapeHtml(title)}</h1>
          </div>
          <div class="page-actions">
            ${actionsHTML}
          </div>
        </div>
      </div>
    `;
  }

  // New views and helpers
  renderPeople() {
    const people = storage.getPeople();
    return `
      ${this.renderPageHeader("People", [this.currentProject ? this.currentProject.name : "Project", "People"], `
        <button class="btn btn-primary" onclick="window.app.openPersonForm()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Person
        </button>
      `)}
      <div class="content-wrapper" style="padding:0">
        <div class="table-wrapper">
          <table class="issue-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Added</th>
                <th style="width: 80px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${people.map(person => `
                <tr data-person-id="${person.id}">
                  <td>
                    <div class="person-cell">
                      <div class="comment-avatar">${person.name.charAt(0)}</div>
                      <span>${this.escapeHtml(person.name)}</span>
                    </div>
                  </td>
                  <td>${this.escapeHtml(person.email)}</td>
                  <td>${person.createdAt ? new Date(person.createdAt).toLocaleDateString() : "N/A"}</td>
                  <td>
                    <div class="table-actions">
                      <button class="btn-icon-sm" onclick="event.stopPropagation(); window.app.openPersonForm('${person.id}')" title="Edit person">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button class="btn-icon-sm btn-danger-soft" onclick="event.stopPropagation(); window.app.deletePerson('${person.id}')" title="Remove person">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  openPersonForm(personId = null) {
    if (personId) {
      const person = storage.getPeople().find(p => p.id === personId);
      if (person) {
        document.getElementById("personName").value = person.name;
        document.getElementById("personEmail").value = person.email;
        document.getElementById("personJoinedDate").value = person.createdAt ? person.createdAt.split('T')[0] : '';
        this.currentPersonId = personId;
        document.querySelector("#personModal h3").textContent = "Edit Person";
        document.getElementById("personFormSubmitBtn").textContent = "Update Person";
      }
    } else {
      document.getElementById("personForm").reset();
      document.getElementById("personJoinedDate").value = new Date().toISOString().split('T')[0];
      this.currentPersonId = null;
      document.querySelector("#personModal h3").textContent = "Add Person";
      document.getElementById("personFormSubmitBtn").textContent = "Add Person";
    }
    this.openModal("personModal");
  }

  handlePersonSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("personName").value.trim();
    const email = document.getElementById("personEmail").value.trim();
    const joinedDate = document.getElementById("personJoinedDate").value;

    if (name) {
      const personData = {
        name,
        email,
        createdAt: joinedDate ? new Date(joinedDate).toISOString() : new Date().toISOString()
      };

      if (this.currentPersonId) {
        storage.updatePerson(this.currentPersonId, personData);
        this.showNotification("Person updated successfully!", "success");
      } else {
        storage.addPerson(personData);
        this.showNotification("Person added successfully!", "success");
      }
      this.closeModal("personModal");
      this.renderCurrentView();
    }
  }

  deletePerson(personId) {
    this.confirmAction(
      "Remove Person",
      "Are you sure you want to remove this person? They will no longer appear in assignee/reporter lists.",
      "Remove",
      "danger",
      () => {
        storage.deletePerson(personId);
        this.renderCurrentView();
        this.showNotification("Person removed", "success");
      }
    );
  }

  renderKeyboardShortcuts() {
    const shortcuts = [
      { key: "Ctrl/Cmd + K", desc: "Focus Global Search" },
      { key: "Alt + N", desc: "Create New Issue" },
      { key: "Ctrl/Cmd + P", desc: "Create New Project" },
      { key: "Ctrl/Cmd + B", desc: "Open Switch Project Modal" },
      { key: "Numbers 1-5", desc: "Switch between Board, Backlog, Timeline, Issues, Reports" },
      { key: "Esc", desc: "Close all Modals/Panels" }
    ];

    return `
      ${this.renderPageHeader("Keyboard Shortcuts", [this.currentProject ? this.currentProject.name : "Project", "Shortcuts"])}
      <div class="content-wrapper">
        <div class="shortcuts-grid">
          ${shortcuts.map(s => `
            <div class="shortcut-card">
              <div class="shortcut-key">${s.key}</div>
              <div class="shortcut-desc">${s.desc}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  confirmAction(title, message, confirmText = "Confirm", type = "primary", callback) {
    const dialog = document.createElement("div");
    dialog.className = "custom-confirm-overlay active";
    dialog.innerHTML = `
      <div class="custom-confirm-modal">
        <div class="confirm-header">
          <h3>${title}</h3>
        </div>
        <div class="confirm-body">
          <p>${message}</p>
        </div>
        <div class="confirm-footer">
          <button class="btn btn-secondary" id="confirmCancel">Cancel</button>
          <button class="btn btn-${type}" id="confirmSubmit">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelector("#confirmCancel").addEventListener("click", () => {
      dialog.remove();
    });

    dialog.querySelector("#confirmSubmit").addEventListener("click", () => {
      callback();
      dialog.remove();
    });
  }
}

// Add notification animations
const notifStyle = document.createElement("style");
notifStyle.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(notifStyle);

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new KineticTerminal();
});
