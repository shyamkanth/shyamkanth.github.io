(function () {
  const notifications = [
    {
      id: 'lexica_launch',
      category: 'New Project',
      heading: 'Lexica : Your personal dictionary [Released]',
      description: 'Explore words like never before with our new dictionary app.',
      date_added: '04/05/2026', // Format: MM/DD/YYYY
      navigateTo: '/projects/lexica/',
    },
    {
      id: 'announcement_lexica',
      category: 'Announcement Added',
      heading: 'Lexica : Announcement',
      description: 'Explore words like never before with our new dictionary app.',
      date_added: '04/05/2026',
      navigateTo: '/announcements/announcement.html?id=lexica-personal-dictionary-a-private-linguistic-vault',
    },
    {
      id: 'lumina_launch',
      category: 'New Project',
      heading: 'Lumina : Habit tracker [Released]',
      description: 'Major update with new progress tracking features and dark mode refinements.',
      date_added: '04/04/2026',
      navigateTo: '/projects/lumina/',
    },
    {
      id: 'announcement_lumina',
      category: 'Announcement Added',
      heading: 'Lumina : Announcement',
      description: 'Read about our new habit tracker website.',
      date_added: '04/04/2026',
      navigateTo: '/announcements/announcement.html?id=lumina-habit-a-beautiful-static-habit-tracker-built-with-van',
    },
    {
      id: 'botbook_update',
      category: 'Project Update',
      heading: 'BotBook - Version 2.0 [Live Now]',
      description: 'Major update with new ui and features.',
      date_added: '04/04/2026',
      navigateTo: '/projects/botbook/',
    },
    {
      id: 'announcement_botbook',
      category: 'Announcement Added',
      heading: 'BotBook V2.0: Announcement',
      description: 'Checkout our revamped BotBook website with cool and modern UI and extra features.',
      date_added: '04/04/2026',
      navigateTo: '/announcements/announcement.html?id=botbook-v2-minimalist-notes-architecture',
    },
    {
      id: 'privacy_policy_password_vault',
      category: 'Privacy Policy Update',
      heading: 'Password Vault Privacy Policy : Updated',
      description: 'Kindly go through the updated privacy policy for the password vault application.',
      date_added: '03/26/2026',
      navigateTo: '/privacy-policy/policy.html?id=password-vault',
    },
    {
      id: 'privacy_policy_japnaam',
      category: 'Privacy Policy Update',
      heading: 'Japnaam Privacy Policy : Updated',
      description: 'Kindly go through the updated privacy policy for the japnaam application.',
      date_added: '03/24/2026',
      navigateTo: '/privacy-policy/policy.html?id=japnaam',
    },
    {
      id: 'welcome_announcement',
      category: 'Announcement Added',
      heading: 'Portfolio Redesign Live!',
      description: 'Welcome to the new and improved portfolio experience.',
      date_added: '03/22/2026',
      navigateTo: '/',
    }
  ];

  const categoryIcons = {
    'New Project': 'rocket_launch',
    'Project Update': 'update',
    'Announcement Added': 'campaign',
    'Announcement Update': 'edit_notifications',
    'Blog Added': 'article',
    'Blog Update': 'history_edu',
    'Privacy Policy Added': 'policy',
    'Privacy Policy Update': 'gavel',
    'New App Launch': 'install_mobile',
  };

  const getReadNotifications = () => {
    try {
      return JSON.parse(localStorage.getItem('read_notifications') || '[]');
    } catch (e) {
      return [];
    }
  };

  const markAsRead = (id) => {
    const read = getReadNotifications();
    if (!read.includes(id)) {
      read.push(id);
      localStorage.setItem('read_notifications', JSON.stringify(read));
    }
  };

  const calculateRelativeTime = (dateStr) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
    if (diffMonth > 0) return `${diffMonth} mon${diffMonth > 1 ? 's' : ''} ago`;
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hr${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  const isWithinOneMonth = (dateStr) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    return diffMs <= oneMonthMs;
  };

  const getUnreadCount = () => {
    const read = getReadNotifications();
    return notifications.filter(n => !read.includes(n.id) && isWithinOneMonth(n.date_added)).length;
  };

  const injectStyles = () => {
    const styles = `
      #notification-container {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999;
        font-family: var(--font, "Plus Jakarta Sans", sans-serif);
      }

      #notification-fab {
        width: 60px;
        height: 60px;
        background: var(--bg-card, #111312);
        border: 2px solid var(--accent, #00ff87);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      #notification-fab:hover {
        transform: scale(1.1);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
      }

      #notification-fab .material-symbols-outlined {
        font-size: 28px;
        color: var(--accent, #00ff87);
      }

      @keyframes bell-pulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--accent-rgb, 0, 255, 135), 0.4); }
        70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(var(--accent-rgb, 0, 255, 135), 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--accent-rgb, 0, 255, 135), 0); }
      }

      .pulse-animation {
        animation: bell-pulse 2s infinite;
      }

      #notification-container.panel-active #notification-fab {
        opacity: 0;
        visibility: hidden;
        transform: scale(0.5);
        pointer-events: none;
      }

      #notification-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background: var(--accent, #00ff87);
        color: #000;
        font-size: 11px;
        font-weight: 800;
        min-width: 20px;
        height: 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border: 2px solid var(--bg-card, #111312);
      }

      #notification-panel {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 450px;
        max-height: 50vh; /* Adjusted to ~30-40% height as requested */
        background: rgba(17, 19, 18, 0.85); /* var(--bg-card) with alpha */
        backdrop-filter: blur(20px);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        transform-origin: bottom right;
      }

      #notification-panel.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      .panel-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.02);
      }

      .panel-title {
        font-size: 14px;
        font-weight: 800;
        color: var(--text, #edf2ee);
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }

      .close-panel-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        color: var(--text-muted, #7a9080);
        transition: all 0.2s;
        background: rgba(255, 255, 255, 0.05);
      }

      .close-panel-btn:hover {
        background: rgba(var(--accent-rgb, 0, 255, 135), 0.1);
        color: var(--accent, #00ff87);
        transform: rotate(90deg);
      }

      .close-panel-btn .material-symbols-outlined {
        font-size: 18px;
      }

      .panel-body {
        overflow-y: auto;
        flex: 1;
      }

      .panel-body::-webkit-scrollbar { width: 3px; }
      .panel-body::-webkit-scrollbar-track { background: transparent; }
      .panel-body::-webkit-scrollbar-thumb { background: var(--border, rgba(255, 255, 255, 0.08)); border-radius: 3px; }

      .notification-item {
        padding: 18px 20px;
        border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        cursor: pointer;
        transition: background 0.2s;
        display: flex;
        gap: 15px;
        position: relative;
      }

      .notification-item:last-child { border-bottom: none; }
      .notification-item:hover { background: rgba(var(--accent-rgb, 0, 255, 135), 0.04); }

      .notification-item.unread::before {
        content: "";
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background: var(--accent, #00ff87);
        border-radius: 50%;
      }

      .item-icon-container {
        width: 40px;
        height: 40px;
        background: rgba(var(--accent-rgb, 0, 255, 135), 0.1);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .item-icon-container .material-symbols-outlined {
        font-size: 20px;
        color: var(--accent, #00ff87);
      }

      .item-content { flex: 1; min-width: 0; }

      .item-badge {
        display: inline-block;
        padding: 2px 8px;
        background: rgba(var(--accent-rgb, 0, 255, 135), 0.08);
        border: 1px solid rgba(var(--accent-rgb, 0, 255, 135), 0.2);
        color: var(--accent, #00ff87);
        font-size: 10px;
        font-weight: 700;
        border-radius: 3px;
        margin-bottom: 6px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .item-heading {
        font-size: 14px;
        font-weight: 700;
        color: var(--text, #edf2ee);
        margin-bottom: 4px;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item-desc {
        font-size: 13px;
        color: var(--text-muted, #7a9080);
        margin-bottom: 8px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .item-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .item-time {
        font-size: 11px;
        color: var(--text-muted, #7a9080);
        font-family: var(--font-mono, "JetBrains Mono", monospace);
      }

      .item-arrow {
        font-size: 16px;
        color: var(--accent, #00ff87);
        transition: transform 0.2s;
      }

      .notification-item:hover .item-arrow { transform: translateX(3px); }

      /* Unread Toggle Switch */
      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .unread-toggle-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }

      .unread-toggle-label {
        font-size: 14px;
        font-weight: 800;
        color: var(--text-muted, #7a9080);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .switch {
        position: relative;
        display: inline-block;
        width: 35px;
        height: 22px;
      }

      .switch input { opacity: 0; width: 0; height: 0; }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(255, 255, 255, 0.1);
        transition: .3s;
        border-radius: 20px;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 12px;
        width: 12px;
        left: 5px;
        bottom: 5px;
        background-color: var(--text-muted, #7a9080);
        transition: .3s;
        border-radius: 50%;
      }
    

      input:checked + .slider {
        background-color: rgba(var(--accent-rgb, 0, 255, 135), 0.2);
      }

      input:checked + .slider:before {
        transform: translateX(14px);
        background-color: var(--accent, #00ff87);
      }

      .empty-unread-state {
        padding: 60px 20px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: var(--text-muted, #7a9080);
      }

      .empty-unread-icon {
        font-size: 48px;
        opacity: 0.2;
      }

      .empty-unread-text {
        font-size: 14px;
        font-weight: 500;
      }

      @media (max-width: 480px) {
        #notification-panel {
          width: calc(100vw - 60px);
          max-height: 50vh;
          bottom: 80px;
          right: 0;
        }
          .close-panel-btn{
          display: none;
          }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  };

  const renderNotifications = () => {
    const listBody = document.querySelector('#notification-panel .panel-body');
    const unreadToggle = document.querySelector('#unread-toggle');
    if (!listBody) return;

    const read = getReadNotifications();
    const showUnreadOnly = unreadToggle ? unreadToggle.checked : false;

    let filtered = notifications
      .sort((a, b) => new Date(b.date_added) - new Date(a.date_added));

    if (showUnreadOnly) {
      filtered = filtered.filter(n => !read.includes(n.id));
    }

    if (filtered.length === 0) {
      listBody.innerHTML = `
        <div class="empty-unread-state">
          <span class="material-symbols-outlined empty-unread-icon">
            ${showUnreadOnly ? 'notifications_paused' : 'notifications'}
          </span>
          <p class="empty-unread-text">
            ${showUnreadOnly ? 'No unread notifications present' : 'No notifications yet'}
          </p>
        </div>
      `;
    } else {
      listBody.innerHTML = filtered
        .map(n => {
          const isRead = read.includes(n.id);
          const icon = categoryIcons[n.category] || 'notifications';
          const relativeTime = calculateRelativeTime(n.date_added);

          return `
            <div class="notification-item ${isRead ? '' : 'unread'}" data-id="${n.id}" data-url="${n.navigateTo}">
              <div class="item-icon-container">
                <span class="material-symbols-outlined">${icon}</span>
              </div>
              <div class="item-content">
                <span class="item-badge">${n.category}</span>
                <h3 class="item-heading">${n.heading}</h3>
                <p class="item-desc">${n.description}</p>
                <div class="item-meta">
                  <span class="item-time">${relativeTime}</span>
                  <span class="material-symbols-outlined item-arrow">arrow_forward</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
    }

    // Update count
    const count = getUnreadCount();
    const badge = document.getElementById('notification-badge');
    const fab = document.getElementById('notification-fab');

    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
      fab.classList.add('pulse-animation');
    } else {
      badge.style.display = 'none';
      fab.classList.remove('pulse-animation');
    }

    // Attach listeners
    document.querySelectorAll('.notification-item').forEach(item => {
      item.onclick = function () {
        const id = this.getAttribute('data-id');
        const url = this.getAttribute('data-url');
        markAsRead(id);
        window.location.href = url;
      };
    });
  };

  const createDOM = () => {
    const container = document.createElement('div');
    container.id = 'notification-container';

    container.innerHTML = `
      <div id="notification-fab">
        <span class="material-symbols-outlined">notifications</span>
        <div id="notification-badge" style="display:none">0</div>
      </div>
      <div id="notification-panel">
        <div class="panel-header">
          <span class="panel-title">Notifications</span>
          <div class="header-actions">
            <label class="unread-toggle-wrapper">
              <span class="unread-toggle-label">Unread</span>
              <div class="switch">
                <input type="checkbox" id="unread-toggle">
                <span class="slider"></span>
              </div>
            </label>
            <div class="close-panel-btn" id="notification-close">
              <span class="material-symbols-outlined">close</span>
            </div>
          </div>
        </div>
        <div class="panel-body"></div>
      </div>
    `;

    document.body.appendChild(container);

    const fab = container.querySelector('#notification-fab');
    const panel = container.querySelector('#notification-panel');
    const closeBtn = container.querySelector('#notification-close');
    const unreadToggle = container.querySelector('#unread-toggle');

    const togglePanel = (show) => {
      if (show) {
        if (unreadToggle) unreadToggle.checked = false; // Reset toggle when opening
        container.classList.add('panel-active');
        panel.classList.add('active');
        renderNotifications(); // Refresh list to respect reset toggle
      } else {
        container.classList.remove('panel-active');
        panel.classList.remove('active');
      }
    };

    fab.onclick = (e) => {
      e.stopPropagation();
      togglePanel(true);
    };

    closeBtn.onclick = (e) => {
      e.stopPropagation();
      togglePanel(false);
    };

    if (unreadToggle) {
      unreadToggle.onchange = () => renderNotifications();
    }

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        togglePanel(false);
      }
    });

    renderNotifications();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectStyles();
      createDOM();
    });
  } else {
    injectStyles();
    createDOM();
  }
})();
