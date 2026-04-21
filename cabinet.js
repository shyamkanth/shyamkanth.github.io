(function () {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").then(() => {
        console.log("Service Worker Registered");
      });
    });
  }
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  function _go(p) {
    window.location.href = p;
  }

  function _injectStyles() {
    if (document.getElementById("_cp_st")) return;
    const s = document.createElement("style");
    s.id = "_cp_st";
    s.textContent = `
      #_cp_ov {
        position:fixed;inset:0;z-index:99999;
        background:rgba(0,0,0,0.6);
        backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
        display:flex;align-items:flex-start;justify-content:center;
        padding-top:30vh;
        opacity:0;animation:_cpFi .18s ease forwards;
      }
      @media (max-width: 480px) {
        #_cp_ov {
          padding-top: 15vh;
        }
      }
      @keyframes _cpFi{from{opacity:0}to{opacity:1}}
      #_cp_bx {
        width:100%;max-width:580px;margin:0 16px;
        background:#111312;
        border:1px solid rgba(255,255,255,0.1);
        border-radius:12px;overflow:hidden;
        box-shadow:0 32px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(0,255,135,0.08);
        transform:scale(0.95) translateY(-10px);
        animation:_cpSi .22s cubic-bezier(.34,1.56,.64,1) forwards;
      }
      @keyframes _cpSi{from{transform:scale(0.95) translateY(-10px)}to{transform:scale(1) translateY(0)}}
      #_cp_iw {
        display:flex;align-items:center;gap:12px; justify-content:space-between;
        padding:16px 20px;
        border-bottom:1px solid rgba(255,255,255,0.07);
      }
      #_cp_si {
        font-family:'Material Symbols Outlined';font-size:20px;
        color:#00ff87;flex-shrink:0;user-select:none;
        font-variation-settings:'FILL' 0,'wght' 400;
      }
      #_cp_in {
        width:100%;background:none;border:none;outline:none;
        font-family:'Plus Jakarta Sans',sans-serif;
        font-size:17px;font-weight:500;color:#edf2ee;
        caret-color:#00ff87;letter-spacing:.01em;
      }
      #_cp_in::placeholder{color:#7a9080;}
      #_cp_esc {
        font-family:'JetBrains Mono',monospace;font-size:11px;
        color:#7a9080;background:rgba(255,255,255,0.06);
        border:1px solid rgba(255,255,255,0.1);
        padding:3px 8px;border-radius:4px;flex-shrink:0;
      }
      #_cp_badge {
        display:none;
        font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.06em;
        color:#f0a500;background:rgba(240,165,0,0.1);
        border:1px solid rgba(240,165,0,0.3);
        padding:3px 8px;border-radius:4px;flex-shrink:0;white-space:nowrap;
      }
      .cp_sh {
        padding:7px 20px 4px;
        font-family:'JetBrains Mono',monospace;
        font-size:10px;color:#4a6050;letter-spacing:.14em;text-transform:uppercase;
      }
      #_cp_rl{max-height:340px;overflow-y:auto;padding:6px 0;}
      #_cp_rl:empty{display:none;}
      .cpi {
        display:flex;align-items:center;gap:14px;
        padding:11px 20px;cursor:pointer;
        transition:background .12s;
        border-left:2px solid transparent;
      }
      .cpi:hover,.cpi.cpa {
        background:rgba(0,255,135,0.06);
        border-left-color:#00ff87;
      }
      .cpi.secret:hover,.cpi.secret.cpa {
        background:rgba(240,165,0,0.06);
        border-left-color:#f0a500;
      }
      .cpi_ic {
        font-family:'Material Symbols Outlined';font-size:18px;
        color:#00ff87;opacity:.75;flex-shrink:0;width:22px;
        text-align:center;user-select:none;
        font-variation-settings:'FILL' 1,'wght' 400;
      }
      .cpi_ic.s { color:#f0a500; }
      .cpi_tx{flex:1;min-width:0;}
      .cpi_lb {
        font-family:'Plus Jakarta Sans',sans-serif;
        font-size:14px;font-weight:600;color:#edf2ee;
      }
      .cpi_lb mark{background:none;color:#00ff87;font-weight:800;}
      .cpi_lb mark.s{color:#f0a500;}
      .cpi_dc {
        font-family:'JetBrains Mono',monospace;font-size:11px;
        color:#7a9080;letter-spacing:.04em;margin-top:2px;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      }
      .cpi_ar {
        font-family:'Material Symbols Outlined';font-size:15px;
        color:#7a9080;opacity:0;transition:opacity .12s;user-select:none;
      }
      .cpi:hover .cpi_ar,.cpi.cpa .cpi_ar{opacity:1;color:#00ff87;}
      .cpi.secret:hover .cpi_ar,.cpi.secret.cpa .cpi_ar{color:#f0a500;}
      #_cp_em {
        padding:28px 20px;text-align:center;
        font-family:'JetBrains Mono',monospace;
        font-size:12px;color:#7a9080;letter-spacing:.08em;
      }
      #_cp_ft {
        display:flex;align-items:center;gap:16px;flex-wrap:wrap;
        padding:10px 20px;
        border-top:1px solid rgba(255,255,255,0.06);
      }
      .cph {
        display:flex;align-items:center;gap:5px;
        font-family:'JetBrains Mono',monospace;
        font-size:10px;color:#7a9080;letter-spacing:.08em;
      }
      .cphk {
        background:rgba(255,255,255,0.06);
        border:1px solid rgba(255,255,255,0.1);
        border-radius:3px;padding:2px 6px;
        font-size:10px;color:#aabfa5;
      }
      #_cp_rl::-webkit-scrollbar{width:3px;}
      #_cp_rl::-webkit-scrollbar-thumb{background:#00ff87;border-radius:2px;}
      #_cp_rl::-webkit-scrollbar-track{background:transparent;}
    `;
    document.head.appendChild(s);
  }

  let _isOpen = false;
  let _ai = 0;
  let _fl = [];

  function _hl(text, q, cls) {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    return (
      text.slice(0, i) +
      `<mark class="${cls || ""}">` +
      text.slice(i, i + q.length) +
      "</mark>" +
      text.slice(i + q.length)
    );
  }

  function _parse(raw) {
    const prefixLower = GHOST_KEY.toLowerCase();
    if (raw.toLowerCase().startsWith(prefixLower)) {
      const q = raw.slice(GHOST_KEY.length);
      const ql = q.toLowerCase().trim();
      const items = ql
        ? GHOST_COMMANDS.filter(
            (c) =>
              c.label.toLowerCase().includes(ql) ||
              c.desc.toLowerCase().includes(ql),
          )
        : [...GHOST_COMMANDS];
      return {
        isSecret: true,
        query: q,
        sections: [{ title: "Secret", secret: true, items }],
      };
    }
    const ql = raw.toLowerCase().trim();
    const items = ql
      ? PUBLIC_COMMANDS.filter(
          (c) =>
            c.label.toLowerCase().includes(ql) ||
            c.desc.toLowerCase().includes(ql),
        )
      : [...PUBLIC_COMMANDS];
    return {
      isSecret: false,
      query: raw,
      sections: [{ title: "General", secret: false, items }],
    };
  }

  function _render(raw) {
    const rl = document.getElementById("_cp_rl");
    const em = document.getElementById("_cp_em");
    const esc = document.getElementById("_cp_esc");
    const badge = document.getElementById("_cp_badge");
    if (!rl) return;

    const { isSecret, query, sections } = _parse(raw);

    if (esc && badge) {
      if (isSecret) {
        esc.style.display = "none";
        badge.style.display = "block";
        badge.textContent = "⚡ GHOST MODE";
      } else {
        esc.style.display = "";
        badge.style.display = "none";
      }
    }

    _fl = sections.flatMap((s) => s.items);
    if (_ai >= _fl.length) _ai = 0;

    if (_fl.length === 0) {
      rl.innerHTML = "";
      if (em) em.style.display = "block";
      return;
    }
    if (em) em.style.display = "none";

    let flatIdx = 0;
    let html = "";
    sections.forEach((sec) => {
      html += `<div class="cp_sh">${sec.title}</div>`;
      sec.items.forEach((c) => {
        const active = flatIdx === _ai ? " cpa" : "";
        const secClass = sec.secret ? " secret" : "";
        const iconClass = sec.secret ? "cpi_ic s" : "cpi_ic";
        const markCls = sec.secret ? "s" : "";
        html += `
          <div class="cpi${active}${secClass}" data-i="${flatIdx}">
            <span class="${iconClass}">${c.icon}</span>
            <div class="cpi_tx">
              <div class="cpi_lb">${_hl(c.label, query.trim(), markCls)}</div>
              <div class="cpi_dc">${c.desc}</div>
            </div>
            <span class="cpi_ar">arrow_forward</span>
          </div>`;
        flatIdx++;
      });
    });
    rl.innerHTML = html;

    rl.querySelectorAll(".cpi").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        _setActive(parseInt(el.dataset.i));
      });
      el.addEventListener("click", () => {
        _exec(parseInt(el.dataset.i));
      });
    });
  }

  /**
   * Command Pallette options start
   * Make sure to obfuscate the code and update in cabinet.min.js to test.
   * Code obfuscated using : https://codebeautify.org/javascript-obfuscator
   */
  const PUBLIC_COMMANDS = [
    {
      label: "Portfolio",
      desc: "View portfolio",
      icon: "docs",
      action: () => _go("/"),
    },
    {
      label: "Privacy Policy",
      desc: "View app privacy policies",
      icon: "policy",
      action: () => _go("/privacy-policy/"),
    },
    {
      label: "Announcements",
      desc: "View all announcements",
      icon: "campaign",
      action: () => _go("/announcements/"),
    },
    {
      label: "Blog",
      desc: "Read articles and insights",
      icon: "article",
      action: () => _go("/blogs/"),
    },
    {
      label: "Kinetic Actions - Professional Task Management",
      desc: "A powerful, minimalist project management tool featuring Kanban boards, backlogs, and Eisenhower matrices.",
      icon: "tactic",
      action: () => _go("/projects/kinetic-actions/"),
    },
    {
      label: "Lumina - Habit Tracker",
      desc: "Your personal browser based habit tracker",
      icon: "tactic",
      action: () => _go("/projects/lumina/"),
    },
    {
      label: "Lexica - Personal Dictionary",
      desc: "Your browser based personal dictionary",
      icon: "tactic",
      action: () => _go("/projects/lexica/"),
    },
    {
      label: "BotBook - Minimal Note Companion",
      desc: "Your browser based notebook for quick access.",
      icon: "tactic",
      action: () => _go("/projects/botbook/"),
    },
  ];

  const GHOST_KEY = "v0id.run";
  const GHOST_COMMANDS = [
    {
      label: "Content Builder",
      desc: "Create blog posts & announcements",
      icon: "construction",
      action: () => _go("/content-builder/"),
    },
    // ── Add more secret commands below ──
  ];

  /**
   * Command Pallette options end
   * Make sure to obfuscate the code and update in cabinet.min.js to test.
   * Code obfuscated using : https://codebeautify.org/javascript-obfuscator
   */

  /**
   * Steps to follow after adding any project :
   * Add project and test thoroughly then publish.
   * Add the project to the PUBLIC_COMMANDS / GHOST_COMMANDS array in cabinet.js file..
   * Add project info and links in the projects section in script.js file.
   * (Optional) Create announcement for that if applicable.
   * (Optional) Create privacy policy for that if applicable.
   * (Optional) Create blog for that if applicable.
   * [Mandatory] Create notifications for all (New Project, Announcement, Privacy Policy, Blog, etc.) in notification.js file.
   * Commit and Push the files.
   */

  function _setActive(i) {
    _ai = i;
    document.querySelectorAll("#_cp_rl .cpi").forEach((el) => {
      el.classList.toggle("cpa", parseInt(el.dataset.i) === i);
    });
  }

  function _exec(i) {
    const cmd = _fl[i];
    if (!cmd) return;
    cmd.action();
    _close();
  }

  function _scrollA() {
    document
      .getElementById("_cp_rl")
      ?.querySelector(".cpa")
      ?.scrollIntoView({ block: "nearest" });
  }

  function _show() {
    if (_isOpen) return;
    _isOpen = true;
    _injectStyles();

    const ov = document.createElement("div");
    ov.id = "_cp_ov";
    ov.innerHTML = `
      <div id="_cp_bx">
        <div id="_cp_iw">
          <span id="_cp_si">search</span>
          <input id="_cp_in" placeholder="Search commands…" autocomplete="off" spellcheck="false" />
          <span id="_cp_esc">ESC</span>
          <span id="_cp_badge"></span>
        </div>
        <div id="_cp_rl"></div>
        <div id="_cp_em" style="display:none">No commands found</div>
        <div id="_cp_ft">
          <span class="cph"><span class="cphk">↑↓</span>&nbsp;navigate</span>
          <span class="cph"><span class="cphk">↵</span>&nbsp;open</span>
          <span class="cph"><span class="cphk">ESC</span>&nbsp;close</span>
          <span class="cph"><span class="cphk">Ctrl+/</span>&nbsp;toggle</span>
        </div>
      </div>`;

    document.body.appendChild(ov);
    document.body.style.overflow = "hidden";

    _ai = 0;
    _render("");

    const inp = document.getElementById("_cp_in");
    setTimeout(() => inp?.focus(), 20);

    inp?.addEventListener("input", (e) => {
      _ai = 0;
      _render(e.target.value);
    });
    inp?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        _ai = (_ai + 1) % (_fl.length || 1);
        _setActive(_ai);
        _scrollA();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        _ai = (_ai - 1 + (_fl.length || 1)) % (_fl.length || 1);
        _setActive(_ai);
        _scrollA();
      } else if (e.key === "Enter") {
        e.preventDefault();
        _exec(_ai);
      } else if (e.key === "Escape") {
        _close();
      }
    });

    ov.addEventListener("click", (e) => {
      if (e.target === ov) _close();
    });
  }

  function _close() {
    const ov = document.getElementById("_cp_ov");
    if (!ov) return;
    ov.style.transition = "opacity .15s ease";
    ov.style.opacity = "0";
    setTimeout(() => {
      ov.remove();
      document.body.style.overflow = "";
      _isOpen = false;
      _ai = 0;
    }, 150);
  }

  document.addEventListener("keydown", (e) => {
    const _k = String.fromCharCode(0x10 ^ 0x3f);
    const _isSlash = e.key === _k || e.code === "Slash";
    if (e.ctrlKey && _isSlash) {
      e.preventDefault();
      _isOpen ? _close() : _show();
    }
    if (e.key === "Escape" && _isOpen) _close();
  });

  let _pressTimer;
  let _touchStartX, _touchStartY;
  document.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      _touchStartX = e.touches[0].clientX;
      _touchStartY = e.touches[0].clientY;
      _pressTimer = setTimeout(() => {
        _isOpen ? _close() : _show();
      }, 2000);
    }
  });
  document.addEventListener("touchend", () => clearTimeout(_pressTimer));
  document.addEventListener("touchmove", (e) => {
    if (!_pressTimer) return;
    const dx = e.touches[0].clientX - _touchStartX;
    const dy = e.touches[0].clientY - _touchStartY;
    if (Math.sqrt(dx * dx + dy * dy) > 10) clearTimeout(_pressTimer);
  });
})();
