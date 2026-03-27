const androidStrengths = [
  {
    label: "01 // Architecture",
    title: "Clean & Maintainable",
    description:
      "Implementing MVVM and MVI patterns to ensure testable, robust codebases that scale with enterprise growth. Focus on modularity and separation of concerns.",
  },
  {
    label: "02 // Modern UI",
    title: "Declarative Design",
    description:
      "Expertise in Jetpack Compose for building fluid, hardware-accelerated animations and responsive layouts with modern Android development practices.",
  },
  {
    label: "03 // Reliability",
    title: "Performance First",
    description:
      "Deep-dive profiling with Android Studio tools to optimize memory leaks, frame drops, and battery usage ensuring smooth user experiences.",
  },
];

const angularStrengths = [
  {
    label: "01 // Architecture",
    title: "Scalable Structure",
    description:
      "Building Angular applications with feature modules, lazy loading, and clean separation of concerns using services, guards, and resolvers.",
  },
  {
    label: "02 // Reactive UI",
    title: "RxJS & State",
    description:
      "Leveraging RxJS observables, Angular signals, and NgRx for predictable state management and seamless reactive data flows in complex UIs.",
  },
  {
    label: "03 // Developer Experience",
    title: "Type-Safe & Fast",
    description:
      "Strict TypeScript practices, standalone components, and optimized change detection strategies to keep builds lean and teams productive.",
  },
];

const androidSkills = [
  { icon: "code", name: "Kotlin", details: "Coroutines, Flow, Core" },
  { icon: "layers", name: "Compose", details: "Design Systems, Animations" },
  { icon: "database", name: "Persistence", details: "Room, DataStore, SQLite" },
  { icon: "hub", name: "DI", details: "Dagger Hilt, Koin" },
  { icon: "network_check", name: "Networking", details: "Retrofit, OkHttp" },
  { icon: "bug_report", name: "Testing", details: "JUnit, Mockk, Espresso" },
  { icon: "terminal", name: "Architecture", details: "MVVM, MVI, Clean" },
  { icon: "settings", name: "Tools", details: "Git, Firebase, Postman" },
];

const angularSkills = [
  { icon: "code", name: "Angular", details: "v15+, Standalone, Signals" },
  {
    icon: "deployed_code",
    name: "TypeScript",
    details: "Strict Mode, Generics",
  },
  { icon: "sync_alt", name: "RxJS", details: "Observables, Operators" },
  { icon: "storage", name: "State", details: "NgRx, Services, Signals" },
  { icon: "palette", name: "Styling", details: "SCSS, TailwindCSS, Bootstrap" },
  { icon: "api", name: "HTTP", details: "HttpClient, Interceptors" },
  { icon: "route", name: "Routing", details: "Guards, Resolvers, Lazy Load" },
  { icon: "settings", name: "Tooling", details: "Angular CLI, Nx, Webpack" },
];

const industrialProjects = [
  {
    name: "Digital Governance Platform",
    role: "Android Developer",
    duration: "18 months",
    tags: ["KOTLIN", "MVVM", "JETPACK", "BIOMETRIC AUTH"],
    description:
      "GovTech platform serving 100+ million users. Implemented KYC verification with DigiLocker API, biometric authentication (fingerprint & iris), and optimized offline-first functionality for rural connectivity.",
    link: "#",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800",
  },
  {
    name: "HealthTech Nutrition Platform",
    role: "Android Developer",
    duration: "8 months",
    tags: ["ANDROID SDK", "FACE RECOGNITION", "PYTHON RUNTIME"],
    description:
      "Custom Face Recognition SDK for beneficiary identification. Integrated Python runtime for on-device AI/ML execution, optimized models for low-end devices, and exposed SDK for React Native integration.",
    link: "#",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
  },
  {
    name: "ETIM POS System",
    role: "Android Developer",
    duration: "6 months",
    tags: ["KOTLIN", "MVI", "REFACTORING"],
    description:
      "Electronic Ticketing Machine with POS capabilities. Refactored legacy Java to Kotlin using MVI architecture, implemented performance optimizations, and resolved critical production bugs.",
    link: "#",
    image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800",
  },
];

const personalProjects = [
  {
    name: "PasswordVault - Password Manager",
    role: "Android Developer",
    duration: "2 months",
    tags: ["KOTLIN", "AES ENCRYPTION", "ROOM", "MVVM"],
    description:
      "Local password manager with MPIN authentication and AES encryption. Features backup/restore using SAF, password strength metrics, and bin management for enhanced privacy.",
    link: "https://play.google.com/store/apps/details?id=io.github.shyamkanth.passwordvault&pcampaignid=web_share",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800",
  },
  {
    name: "japnaam",
    role: "Android Developer",
    duration: "1 month",
    tags: ["KOTLIN", "ROOM", "MVVM"],
    description:
      "Japnaam is a simple and powerful app designed to support your spiritual journey.It allows you to track your jaap (chant counts) for different mantras, explore a wide collection of aartis and chalisa's, and stay connected with your daily spiritual practices.",
    link: "https://play.google.com/store/apps/details?id=io.github.shyamkanth.japnaam&pcampaignid=web_share",
    image:
      "https://play-lh.googleusercontent.com/83MTuaHZ4aTBW7Dm07XlkuYc4P3uZWlbaZ-Y8rBbqtphoiBKxlZsREdGAc9IrObtb_xnhJ5OU27UfRzVPpuQiEY=w240-h480",
  },
  {
    name: "Money Log - Budget Manager",
    role: "Android Developer",
    duration: "2 months",
    tags: ["KOTLIN", "ROOM", "MVVM"],
    description:
      "Personal expense tracker with transaction logging, category management, and monthly summaries. Built with Room database, DataStore for preferences, and clean MVVM architecture.",
    link: "https://github.com/shyamkanth",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
  },
  {
    name: "Zynance - Expance Tracker",
    role: "Android Developer",
    duration: "1 month",
    tags: ["KOTLIN", "ROOM", "MVVM", "Coroutines"],
    description:
      "Zynance is an Android application designed for managing expenses. Users can perform CRUD operations on their expenses and expense categories. Additionally, the app provides various views to track expenses, including bar charts, pie charts, and a tabular view. With support for Room, Coroutines, and the MVVM architecture, this app ensures a clean and efficient approach to managing personal finances.",
    link: "https://github.com/shyamkanth/Zynance",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
  },
  {
    name: "ApiHub - API Documentation tool",
    role: "Frontend Developer",
    duration: "1 month",
    tags: ["ANGULAR", "TYPESCRIPT", "BOOTSTRAP"],
    description:
      "Web-based API documentation tool supporting nested registries and endpoints. Features copy-to-clipboard, dynamic rendering, local storage persistence, and inline editing with reactive forms.",
    link: "https://github.com/shyamkanth",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
  },
  {
    name: "PayDay - EMI Reminder App",
    name: "PayDay - EMI Reminder App",
    role: "Android Developer",
    duration: "In Progress",
    tags: ["KOTLIN", "ROOM", "MVVM", "DEPENDENCY INJECTION", "HILT"],
    description:
      "Web-based API documentation tool supporting nested registries and endpoints. Features copy-to-clipboard, dynamic rendering, local storage persistence, and inline editing with reactive forms.",
    link: "",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
  },
];

const funProjects = [
  {
    name: "BotBook : Browser Text Editor",
    tags: ["HTML", "CSS", "JAVASCRIPT"],
    description:
      "A fully functional rich text editor that runs entirely in the browser. Supports formatting, live preview, and local save — no backend required.",
    link: "https://shyamkanth.github.io/BotBook/",
    emoji: "✏️",
  },
  {
    name: "Hey Todo : A todo application",
    tags: ["KOTLIN", "ROOM", "COROUTINES"],
    description:
      "Hey Todo is an Android application that allows users to manage their tasks in real-time. Users can create, read, update, and delete tasks with ease.",
    link: "https://github.com/shyamkanth/Hey-Todo",
    emoji: "✏️",
  },
  {
    name: "Multifunctional Calculator in C",
    tags: ["C"],
    description:
      "A multifunctional CLI based C calculator with more than 18 functions including complex matrix operations. ",
    link: "https://github.com/shyamkanth/Calculator-in-c",
    emoji: "✏️",
  },
  {
    name: "Mac UI Notepad",
    tags: ["HTML", "CSS", "JAVASCRIPT"],
    description:
      "A cool Notepad built using Bootstrap and JS having Mac Interface. Must check out. ",
    link: "https://shyamkanth.github.io/Mac-UI-Notepad/",
    emoji: "✏️",
  },
];

const experienceData = [
  {
    role: "Junior Associate Software Engineer",
    company: "Daffodil Software Pvt. Ltd.",
    startDate: "2024-07-01",
    endDate: null,
    period: "JULY 2024 — PRESENT",
    description:
      "Contributing to high-impact Android application serving 100+ million users. Led comprehensive UI overhaul with Material Design, optimized user flows with Kotlin Coroutines and Jetpack Compose.",
    icon: "check",
    isActive: true,
  },
  {
    role: "Android Development Intern",
    company: "Daffodil Software Pvt. Ltd.",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    period: "JAN 2024 — JUNE 2024",
    description:
      "Worked on multiple live Android projects impacting millions. Enhanced core SDK components, improved modularity and performance, assisted in UI/UX improvements while ensuring security and scalability compliance.",
    icon: "history",
    isActive: false,
  },
];

function calcDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;
  if (months < 1) months = 1;
  if (months < 12) return `${months} month${months > 1 ? "s" : ""}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  let str = `${years} yr${years > 1 ? "s" : ""}`;
  if (rem > 0) str += ` ${rem} mo`;
  return str;
}

function renderStrengths(data) {
  const container = document.getElementById("strengths-grid");
  if (!container) return;
  container.innerHTML = data
    .map(
      (s) => `
    <div class="strength-card">
      <span class="strength-label">${s.label}</span>
      <h3 class="strength-title">${s.title}</h3>
      <p class="strength-description">${s.description}</p>
    </div>
  `,
    )
    .join("");
}

function renderSkills(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = data
    .map(
      (skill) => `
    <div class="skill-card">
      <span class="material-symbols-outlined skill-icon">${skill.icon}</span>
      <h4 class="skill-name">${skill.name}</h4>
      <p class="skill-details">${skill.details}</p>
    </div>
  `,
    )
    .join("");
}

function renderProjects(projects, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = projects
    .map(
      (project) => `
    <div class="project-item">
      <div class="project-image">
        <img src="${project.image}" alt="${project.name}" loading="lazy">
      </div>
      <div class="project-info">
        <div class="project-details">
          <h3 class="project-name">${project.name}</h3>
          <p class="project-role-duration">${project.role} — ${project.duration}</p>
          <div class="project-tags">
            ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("")}
          </div>
          <p class="project-description">${project.description}</p>
        </div>
        
        <a href="${project.link}" class="project-link" target="_blank" rel="noopener noreferrer">
          <span class="material-symbols-outlined">arrow_outward</span>
        </a>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderFunProjects() {
  const container = document.getElementById("fun-projects-grid");
  if (!container) return;
  container.innerHTML = funProjects
    .map(
      (project) => `
    <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="fun-card">
      <div class="fun-card-emoji">${project.emoji}</div>
      <div class="fun-card-body">
        <h3 class="fun-card-name">${project.name}</h3>
        <div class="project-tags">
          ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("")}
        </div>
        <p class="fun-card-description">${project.description}</p>
      </div>
      <span class="material-symbols-outlined fun-card-arrow">arrow_outward</span>
    </a>
  `,
    )
    .join("");
}

function renderExperience() {
  const totalExpContainer = document.getElementById("totalExperience");
  const totalExp = calcDuration("2024-01-01", null);
  totalExpContainer.innerHTML = `( ${totalExp} )`;
  const container = document.getElementById("experience-timeline");
  if (!container) return;
  container.innerHTML = experienceData
    .map(
      (exp) => `
    <div class="timeline-item">
      <div class="timeline-icon ${exp.isActive ? "" : "inactive"}">
        <span class="material-symbols-outlined">${exp.icon}</span>
      </div>
      <div class="timeline-content">
        <div class="timeline-header">
          <h4 class="timeline-role">${exp.role}</h4>
          <time class="timeline-period">${exp.period}</time>
        </div>
        <div class="timeline-company">${exp.company}</div>
        <div class="timeline-duration">⏱ ${calcDuration(exp.startDate, exp.endDate)}</div>
        <p class="timeline-description">${exp.description}</p>
      </div>
    </div>
  `,
    )
    .join("");
}

function initProjectTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const projectGrids = document.querySelectorAll(".project-grid");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      projectGrids.forEach((grid) => grid.classList.remove("active-tab"));
      button.classList.add("active");
      const tabType = button.getAttribute("data-tab");
      const targetGrid = document.getElementById(`${tabType}-projects`);
      if (targetGrid) targetGrid.classList.add("active-tab");
    });
  });
}

function initProfileTabs() {
  const tabs = document.querySelectorAll(".profile-tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const platform = tab.getAttribute("data-platform");
      switchProfile(platform);
    });
  });
}

function switchProfile(platform) {
  const isAndroid = platform === "android";

  document.querySelectorAll(".profile-tab-btn").forEach((t) => {
    t.classList.toggle("active", t.getAttribute("data-platform") === platform);
  });

  document.querySelectorAll(".skills-panel").forEach((p) => {
    p.classList.toggle("active", p.getAttribute("data-platform") === platform);
  });

  document.querySelectorAll(".theme-btn").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-theme") === platform);
  });

  document.body.className = isAndroid ? "theme-android" : "theme-angular";

  const heroTitleLine1 = document.getElementById("hero-title-line1");
  const heroTitle = document.getElementById("hero-title-line2");
  const heroBadge = document.getElementById("hero-badge-text");
  const heroDesc = document.getElementById("hero-description");
  const heroVisual = document.getElementById("hero-visual");

  if (heroTitleLine1)
    heroTitleLine1.textContent = isAndroid ? "ANDROID" : "ANGULAR";
  if (heroTitle) heroTitle.textContent = isAndroid ? "ENGINEER" : "DEVELOPER";
  if (heroBadge)
    heroBadge.textContent = isAndroid
      ? "Available for select projects"
      : "Open to frontend opportunities";
  if (heroDesc)
    heroDesc.innerHTML = isAndroid
      ? `Crafting high-performance, scalable mobile experiences with <span class="text-emphasis">Kotlin</span> and <span class="text-emphasis">Jetpack Compose</span>.`
      : `Building scalable, reactive web applications with <span class="text-emphasis">Angular</span> and <span class="text-emphasis">TypeScript</span>.`;

  if (heroVisual) {
    heroVisual.innerHTML = isAndroid
      ? `
      <div class="phone-mockup">
        <div class="mockup-content">
          <div class="mockup-header">
            <div class="signal-bar"></div>
            <span class="material-symbols-outlined">signal_cellular_4_bar</span>
          </div>
          <div class="mockup-feature">
            <span class="material-symbols-outlined">analytics</span>
          </div>
          <div class="mockup-text">
            <div class="text-line"></div>
            <div class="text-line short"></div>
          </div>
          <div class="mockup-buttons">
            <div class="mock-btn primary"></div>
            <div class="mock-btn secondary"></div>
          </div>
        </div>
      </div>
      <div class="accent-corner"></div>
    `
      : `
      <div class="laptop-mockup">
        <div class="laptop-screen">
          <div class="laptop-browser-bar">
            <div class="browser-dots">
              <span></span><span></span><span></span>
            </div>
            <div class="browser-url"></div>
          </div>
          <div class="laptop-content">
            <div class="laptop-sidebar">
              <div class="sidebar-item active"></div>
              <div class="sidebar-item"></div>
              <div class="sidebar-item"></div>
              <div class="sidebar-item"></div>
            </div>
            <div class="laptop-main">
              <div class="laptop-topbar"></div>
              <div class="laptop-code-lines">
                <div class="code-line w60"></div>
                <div class="code-line w80 indent"></div>
                <div class="code-line w50 indent"></div>
                <div class="code-line w70 indent"></div>
                <div class="code-line w40"></div>
                <div class="code-line w65 indent"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="laptop-base">
          <div class="laptop-hinge"></div>
        </div>
      </div>
      <div class="accent-corner"></div>
    `;
  }

  renderStrengths(isAndroid ? androidStrengths : angularStrengths);
}

function initThemeSwitcher() {
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-theme");
      switchProfile(theme);
    });
  });
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const message = form.querySelector("textarea").value.trim();
    if (!name || !email || !message) return;
    const to = "shyamkanth0805@gmail.com";
    const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Hi Shyam,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    );
    window.open(
      `https://mail.google.com/mail/?view=cm&to=${to}&su=${subject}&body=${body}`,
      "_blank",
    );
    form.reset();
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });

      // Close sidebar if open
      closeMobileSidebar();
    });
  });
}

/* ============================================
   HAMBURGER MENU & SIDEBAR
   ============================================ */

function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileSidebar = document.getElementById("mobileSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");

  hamburgerBtn.addEventListener("click", () => {
    openMobileSidebar();
  });

  sidebarCloseBtn.addEventListener("click", () => {
    closeMobileSidebar();
  });

  sidebarOverlay.addEventListener("click", () => {
    closeMobileSidebar();
  });

  // Close sidebar when clicking on links
  document
    .querySelectorAll(".sidebar-link:not(.sidebar-dropdown-toggle)")
    .forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileSidebar();
      });
    });
}

function openMobileSidebar() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileSidebar = document.getElementById("mobileSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  hamburgerBtn.classList.add("active");
  mobileSidebar.classList.add("active");
  sidebarOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeMobileSidebar() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileSidebar = document.getElementById("mobileSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  hamburgerBtn.classList.remove("active");
  mobileSidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

/* ============================================
   SIDEBAR DROPDOWN
   ============================================ */

function initSidebarDropdown() {
  const dropdownToggles = document.querySelectorAll(".sidebar-dropdown-toggle");

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const dropdownId = toggle.getAttribute("data-dropdown");
      const dropdownMenu = document.getElementById(dropdownId);

      // Close other dropdowns
      document.querySelectorAll(".sidebar-dropdown-menu").forEach((menu) => {
        if (menu.id !== dropdownId) {
          menu.classList.remove("active");
          menu.previousElementSibling.classList.remove("active");
        }
      });

      // Toggle current dropdown
      dropdownMenu.classList.toggle("active");
      toggle.classList.toggle("active");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderSkills(androidSkills, "android-skills-grid");
  renderSkills(angularSkills, "angular-skills-grid");
  renderStrengths(androidStrengths);
  renderProjects(industrialProjects, "industrial-projects");
  renderProjects(personalProjects, "personal-projects");
  renderFunProjects();
  renderExperience();
  initProjectTabs();
  initProfileTabs();
  initThemeSwitcher();
  initContactForm();
  initSmoothScroll();
  initHamburgerMenu();
  initSidebarDropdown();
});
