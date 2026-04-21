// Views Module - Advanced view management and drag-and-drop
class ViewManager {
  constructor() {
    this.draggedElement = null;
    this.init();
  }

  init() {
    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    // Drag start
    document.addEventListener("dragstart", (e) => {
      if (e.target.closest(".kanban-card")) {
        this.draggedElement = e.target.closest(".kanban-card");
        this.draggedElement.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", this.draggedElement.innerHTML);
      }
    });

    // Drag end
    document.addEventListener("dragend", (e) => {
      if (this.draggedElement) {
        this.draggedElement.classList.remove("dragging");
        this.draggedElement = null;
      }
    });

    // Drag over
    document.addEventListener("dragover", (e) => {
      const kanbanCards = e.target.closest(".kanban-cards");
      if (kanbanCards && this.draggedElement) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        const afterElement = this.getDragAfterElement(kanbanCards, e.clientY);
        if (afterElement == null) {
          kanbanCards.appendChild(this.draggedElement);
        } else {
          kanbanCards.insertBefore(this.draggedElement, afterElement);
        }
      }
    });

    // Drop
    document.addEventListener("drop", (e) => {
      const kanbanCards = e.target.closest(".kanban-cards");
      if (kanbanCards && this.draggedElement) {
        e.preventDefault();

        const taskId = this.draggedElement.dataset.taskId;
        const newStatus = kanbanCards.dataset.status;

        // Update task status
        this.updateTaskStatus(taskId, newStatus);
      }
    });
  }

  getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".kanban-card:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element;
  }

  updateTaskStatus(taskId, newStatus) {
    const task = storage.getTask(taskId);
    if (task && task.status !== newStatus) {
      // CRITICAL FIX: Just update the status, don't create a new task
      storage.updateTask(taskId, { status: newStatus });

      // Show a subtle notification
      this.showStatusChangeNotification(taskId, task.status, newStatus);

      // Refresh the current view after a short delay
      setTimeout(() => {
        if (window.app) {
          window.app.renderCurrentView();
        }
      }, 300);
    }
  }

  showStatusChangeNotification(taskId, oldStatus, newStatus) {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      color: var(--text-primary);
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg);
      font-weight: 500;
      z-index: 10000;
      box-shadow: var(--shadow-xl);
      animation: slideInUp 0.3s ease;
      font-size: 0.9rem;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary);">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span><strong>${taskId}</strong> moved to <strong>${this.formatStatus(newStatus)}</strong></span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutDown 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 2000);
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
}

// Add slide animations
const viewStyle = document.createElement("style");
viewStyle.textContent = `
  .kanban-card.dragging {
    opacity: 0.5;
    cursor: grabbing;
  }
  
  @keyframes slideInUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(viewStyle);

// Initialize view manager
document.addEventListener("DOMContentLoaded", () => {
  window.viewManager = new ViewManager();
});
