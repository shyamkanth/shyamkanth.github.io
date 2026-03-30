/**
 * Item shapes
 * ──────────────────────────────────────────────────────────────────────────────
 * Simple link   : { label: "CONTACT", href: "#contact" }
 * Dropdown      : { label: "About", dropdown: [ { label: "...", href: "..." }, ... ] }
 * External link : { label: "GitHub", href: "https://...", external: true }
 */

// Navabar and sidebar routes
const navRoutes = [
  {
    label: "About",
    dropdown: [
      { label: "Core Strength", href: "#about" },
      { label: "Technical Stack", href: "#skills" },
      { label: "Experience", href: "#experience" },
    ],
  },
  {
    label: "Projects",
    dropdown: [
      { label: "All Projects", href: "#projects" },
      { label: "Just For Fun", href: "#fun" },
    ],
  },
  {
    label: "More",
    dropdown: [
      { label: "Blogs", href: "/blogs/" },
      { label: "Announcements", href: "/announcements/" },
      { label: "Privacy Policies", href: "/privacy-policy/" },
    ],
  },
  { label: "CONTACT", href: "#contact" },
];

// Footer routes
const footerRoutes = [
  { label: "Blogs", href: "blogs/" },
  { label: "Privacy Policy", href: "privacy-policy/" },
  { label: "GitHub", href: "https://github.com/shyamkanth", external: true },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/shyam-sunder-kanth/",
    external: true,
  },
];

// Do not edit below unless changing HTML structure

function renderNavLinks() {
  const container = document.querySelector(".nav-links");
  if (!container) return;

  container.innerHTML = navRoutes
    .map((item) => {
      if (item.dropdown) {
        return `
          <div class="nav-dropdown">
            <button class="nav-link dropdown-toggle">
              ${item.label}
              <span class="material-symbols-outlined dropdown-icon">expand_more</span>
            </button>
            <div class="dropdown-menu">
              ${item.dropdown
                .map(
                  (child) =>
                    `<a href="${child.href}" class="dropdown-item"${child.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${child.label}</a>`,
                )
                .join("")}
            </div>
          </div>`;
      }
      return `<a href="${item.href}" class="nav-link"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${item.label}</a>`;
    })
    .join("");
}

function renderSidebarLinks() {
  const container = document.querySelector(".sidebar-nav");
  if (!container) return;

  const toId = (label) =>
    label.toLowerCase().replace(/\s+/g, "-") + "-dropdown";

  container.innerHTML = navRoutes
    .map((item) => {
      if (item.dropdown) {
        const dropdownId = toId(item.label);
        return `
          <div class="sidebar-dropdown">
            <button class="sidebar-link sidebar-dropdown-toggle" data-dropdown="${dropdownId}">
              ${item.label}
              <span class="material-symbols-outlined dropdown-icon">expand_more</span>
            </button>
            <div class="sidebar-dropdown-menu" id="${dropdownId}">
              ${item.dropdown
                .map(
                  (child) =>
                    `<a href="${child.href}" class="sidebar-dropdown-item"${child.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${child.label}</a>`,
                )
                .join("")}
            </div>
          </div>`;
      }
      return `<a href="${item.href}" class="sidebar-link"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${item.label}</a>`;
    })
    .join("");
}

function renderFooterLinks() {
  const container = document.querySelector(".footer-links");
  if (!container) return;

  container.innerHTML = footerRoutes
    .map(
      (item) =>
        `<a href="${item.href}" class="footer-link"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${item.label}</a>`,
    )
    .join("");
}

function handleRouting() {
  const path = window.location.pathname;
  if (path === "/" || path === "/index.html") return;
  const allInternalRoutes = [];
  [...navRoutes, ...footerRoutes].forEach((route) => {
    if (route.href && !route.external) allInternalRoutes.push(route.href);
    if (route.dropdown) {
      route.dropdown.forEach((child) => {
        if (!child.external) allInternalRoutes.push(child.href);
      });
    }
  });

  allInternalRoutes.push("/content-builder/", "/oops/");

  const cleanPath = path.endsWith("/") ? path : path + "/";

  const isValid = allInternalRoutes.some((route) => {
    const cleanRoute = route.endsWith("/") ? route : route + "/";
    const absoluteRoute = cleanRoute.startsWith("/")
      ? cleanRoute
      : "/" + cleanRoute;
    return cleanPath === absoluteRoute;
  });

  const isActualFile = path.split("/").pop().includes(".");

  if (!isValid && !isActualFile) {
    window.location.href = "/oops/";
  }
}

function initRoutes() {
  handleRouting();
  renderNavLinks();
  renderSidebarLinks();
  renderFooterLinks();

  if (typeof initSidebarDropdown === "function") {
    initSidebarDropdown();
  } else {
    document.addEventListener("sidebarReady", initSidebarDropdown);
  }
}

document.addEventListener("DOMContentLoaded", initRoutes);
