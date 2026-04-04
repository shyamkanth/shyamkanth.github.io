<div align="center">

# ✦ Lumina Habit

**A premium, offline-first habit tracker — beautifully designed, zero dependencies.**

[![License: Apache](https://img.shields.io/badge/License-Apache-green.svg?style=flat-square)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

*Lumina means "light." Be the light of your own consistency.*

</div>

---

## What is Lumina Habit?

Lumina is a **fully offline, browser-based habit tracking application** built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step, no accounts, no cloud. Open the file in a browser and you're up and running.

It blends the discipline of habit science with a design language that feels premium — dark glassmorphism UI, real-time progress rings, GitHub-style consistency heatmaps, a personal journal, and deep analytics. Everything is stored locally in your browser's `localStorage`, meaning your data never leaves your device.

---

## Screenshots

> *The interface speaks for itself — dark, vibrant, and alive.*

| Dashboard | Session Logging | Statistics |
|-----------|----------------|------------|
| Heatmap + Active Rituals + Journal | Log sessions with duration, intensity & notes | Weekly bar chart + streak + peak time insight |

---

## Features

### 🏠 Dashboard
The command centre of your day.

- **Consistency Heatmap** — A full 53-week GitHub-style activity calendar that auto-scrolls to the most recent dates. Color intensity reflects how many habits you completed that day.
- **Active Rituals** — All your habits at a glance with real-time progress bars. Click the circle to instantly mark as complete (auto-logs the remaining balance). Click again to reset the day.
- **Daily Completion %** — Fractional average across all habits, updated in real-time after every log or check-in.
- **Streak Counter** — Tracks your consecutive active days.
- **Daily Sanctuary Log** — A built-in journal for reflections, mood tagging, and personal notes — with a full history modal (View All).

### 🧘 Habit Logging (`/habit`)
Where your sessions are recorded.

- **Smart Habit Selector** — Styled custom dropdown populated from your saved habits.
- **Session Date Picker** — Logs at your current local time on the selected date (no more UTC midnight bug).
- **Duration + Unit** — Supports 20+ measurement units across 7 categories: Time, Volume, Distance, Exercise, Content, Avoidance, and Completion.
- **Session Quality Chips** — Tag sessions as Low / Optimal / Deep Flow / Peak.
- **Reflections** — Optional notes per session.
- **Session History** — Shows the 8 most recent logs inline, with a "View All" modal for the complete history.
- **Milestones** — Unlock badges as your streak grows.
- **Zen Level** — Ranks from Rank I to Sage based on total sessions.
- **Streak Card** — Tracks per-habit consecutive days.

### 📊 Statistics (`/stats`)
Data-driven reflection on your journey.

- **Overall Streak** — Your longest current consecutive active streak.
- **Weekly Bar Chart** — 7-day completion bars using fractional progress (not just binary checks). Today's bar is always highlighted.
- **Top Streaks** — The 3 strongest per-habit streaks ranked.
- **Mini Heatmap** — Last 28 days at a glance.
- **Morning Insight Ring** — Percentage of sessions logged in the 6–10 AM window, with your personal peak hour.
- **Motivational Context** — Streak-relative encouragement message.

### ⚙️ Settings (`/settings`)
Full control over your experience.

- **Add New Habit** — Choose a name, target, unit, icon (from Material Symbols), and one of 20 accent colours.
- **Active Rhythms** — Manage all existing habits with 7-day consistency %, inline edit, and delete.
- **Edit Habit** — Update name, target, and unit without losing history.
- **Account Panel** — Set or update your display name.
- **Privacy & Data Panel**:
  - Export all data as a JSON backup.
  - Import a previous backup (with confirmation guard).
  - Clear all data with a two-step confirmation.
  - Activity log — a complete chronological audit trail of everything: habits added, sessions logged, resets, journal saves, imports/exports.

---

## Accent Colours

Habits are fully colour-coded across 20 options:

`Primary` · `Secondary` · `Tertiary` · `Error` · `Lavender` · `Gold` · `Azure` · `Rose` · `Indigo` · `Emerald` · `Fuchsia` · `Tangerine` · `Ruby` · `Teal` · `Violet` · `Lime` · `Chartreuse` · `Peach` · `Amethyst` · `Cerulean`

---

## How Data Works

Everything lives in your browser's `localStorage` — no internet required after the initial load.

| Key | Contents |
|-----|----------|
| `lumina_habits` | All habit definitions (name, icon, color, target, unit, frequency) |
| `lumina_logs` | Every session ever logged (habitId, date, duration, unit, intensity, notes) |
| `lumina_checkins` | Daily check-in records mapped by date → habitId → boolean |
| `lumina_journal` | Journal entries with timestamp and mood tag |
| `lumina_user` | Your profile (name, memberSince, tier) |
| `lumina_activity_log` | Full audit trail of all app actions (capped at 500 entries) |

**Exporting** produces a single JSON file you can re-import on any browser or device.

---

## Getting Started

### First-time flow
1. Enter your name when prompted — this sets up your profile.
2. Go to **Settings → Add New Habit** and create your first ritual.
3. Return to the **Dashboard** — your habit now appears under Active Rituals.
4. Head to **Habit** page to log your first session.
5. Check the **Stats** page after a few days to see the heatmap and bar chart fill up.

---

## Project Structure

```
lumina-habit/
│
├── index.html          # Dashboard page
├── dashboard.js        # Dashboard-specific logic (heatmap, habits, journal)
├── script.js           # Global Store, utilities, CustomSelect, toast, nav
├── styles.css          # Global design tokens and component styles
│
├── habit/
│   ├── index.html      # Session logging page
│   └── script.js       # Habit selection, form, history, milestones
│
├── stats/
│   ├── index.html      # Analytics page
│   └── script.js       # Bar chart, streaks, heatmap, insight ring
│
└── settings/
    ├── index.html      # Settings page
    └── script.js       # Add/edit/delete habits, panels, import/export
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 (semantic, SEO-ready) |
| Styling | Tailwind CSS (CDN) + custom CSS |
| Logic | Vanilla JavaScript (ES2020+) |
| Fonts | Plus Jakarta Sans (Google Fonts) |
| Icons | Material Symbols Outlined (Google) |
| Storage | Browser `localStorage` |
| Build | None — zero dependencies |

---

## Design Highlights

- **Dark Mode First** — Deep `#0d0f0e` background with glassmorphism navigation.
- **Material Design 3 Color System** — Full token-based surface/role palette.
- **Custom Select Dropdown** — Native `<select>` elements replaced with a fully styled, keyboard-friendly custom widget supporting `optgroup` labels.
- **Micro-animations** — `fade-in-up`, streak badge pulse, progress bar spring transitions.
- **Fully Responsive** — Mobile bottom nav, responsive grid layouts, touch-friendly tap targets.
- **Fixed Modals** — Journal and Session history modals use `position:fixed` full-screen overlays with backdrop blur, responsive width (90% mobile / 70% desktop), gradient headers, and divider-separated items.

---

## Privacy

- 🔒 **100% local** — zero server calls after page load.
- 🚫 **No tracking** — no Google Analytics, no telemetry, nothing.
- 📦 **Your data, your export** — one click to download everything as JSON.
- 🗑 **Full wipe option** — clear all data from Settings with a confirmation guard.

---

## License

[Apache](LICENSE) — free to use, fork, and build upon.

---

<div align="center">

**Built with ❤️ for people who take their growth seriously.**

*Start your streak today.*

</div>
