document.addEventListener("DOMContentLoaded", () => {
  initDesktopNav("stats");
  buildMobileNav("stats");
  renderStreak();
  renderBarChart();
  renderStreakList();
  renderMotivational();
  renderMiniHeatmap();
  setTimeout(renderInsight, 400);
});

function renderStreak() {
  const streak = Store.getStreak();
  const el = document.getElementById("streak-display");
  if (el) el.textContent = `${streak} Day${streak !== 1 ? "s" : ""}`;
}

function renderBarChart() {
  const chart = document.getElementById("bar-chart");
  if (!chart) return;
  const weekly = Store.getWeeklyData();
  const todayIdx = 6;

  const completedDays = weekly.filter((d) => d.pct >= 50).length;
  const summaryEl = document.getElementById("weekly-summary");
  if (summaryEl) {
    const habits = Store.getHabits();
    summaryEl.textContent = !habits.length
      ? "Add habits to track your weekly consistency"
      : completedDays > 0
        ? `You hit your goals on ${completedDays} out of 7 days this week`
        : "Start checking in to see your weekly pattern";
  }

  chart.innerHTML = weekly
    .map((day, i) => {
      const pct = day.pct === 0 ? 3 : Math.max(6, day.pct);
      const isHigh = day.pct >= 70;
      const isEmpty = day.pct === 0;
      const bg = isEmpty
        ? "background:#1e201f"
        : isHigh
          ? "background:linear-gradient(135deg,#a4ffb9,#00fd86)"
          : `background:rgba(164,255,185,${((day.pct / 100) * 0.55 + 0.15).toFixed(2)})`;

      return `
      <div class="flex-1 flex flex-col items-center gap-2 md:gap-4">
        <div class="bar-col w-full rounded-t-lg" style="height:${pct}%;${bg}" data-label="${day.pct}%"></div>
        <span class="text-[10px] md:text-xs font-label day-label ${i === todayIdx ? "active" : "text-on-surface-variant"}">${day.label}</span>
      </div>`;
    })
    .join("");
}

function renderStreakList() {
  const container = document.getElementById("streak-list");
  if (!container) return;
  const habits = Store.getHabits();
  const checkins = Store.getCheckins();

  if (!habits.length) {
    container.innerHTML = `<div class="empty-state" style="padding:12px"><p class="text-sm">No habits yet</p></div>`;
    return;
  }

  const habitStreaks = habits
    .map((habit) => {
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        if ((checkins[key] || {})[habit.id]) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      return { ...habit, streak };
    })
    .sort((a, b) => b.streak - a.streak);

  const colors = ["text-primary", "text-tertiary", "text-on-surface-variant"];
  const dots = ["bg-primary", "bg-tertiary", "bg-on-surface-variant"];

  container.innerHTML = habitStreaks
    .slice(0, 3)
    .map(
      (h, i) => `
    <div class="streak-row flex items-center justify-between p-2.5 bg-surface-container-highest rounded-lg ${i === 2 ? "opacity-60" : ""}">
      <div class="flex items-center gap-2.5">
        <div class="w-2 h-2 rounded-full ${dots[i] || "bg-primary"}"></div>
        <span class="text-sm font-medium truncate max-w-[120px]">${h.name}</span>
      </div>
      <span class="text-sm font-bold ${colors[i] || "text-primary"} shrink-0">${h.streak}d</span>
    </div>`,
    )
    .join("");
}

function renderMotivational() {
  const el = document.getElementById("motivational-text");
  if (!el) return;
  const streak = Store.getStreak();
  const habits = Store.getHabits();
  if (!habits.length) {
    el.textContent = "Add your first habit to begin your journey.";
    return;
  }
  const pct = Math.min(99, Math.round(50 + (streak / 30) * 40));
  el.textContent =
    streak > 0
      ? `You're more consistent than ${pct}% of users.`
      : "Every streak starts with day one.";
}

function renderMiniHeatmap() {
  const grid = document.getElementById("mini-heatmap");
  if (!grid) return;
  const heatmap = Store.getHeatmapData();
  grid.innerHTML = "";
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const lvl = heatmap[key] ?? 0;
    const opacities = [
      "bg-surface-container-highest",
      "bg-primary/20",
      "bg-primary/40",
      "bg-primary/60",
      "bg-primary",
    ];
    const shadow = lvl === 4 ? "box-shadow:0 0 6px rgba(164,255,185,0.4)" : "";
    const cell = document.createElement("div");
    cell.className = `stat-heatmap-cell aspect-square rounded-sm ${opacities[lvl]}`;
    cell.style.cssText = shadow;
    cell.title = `${key}: ${lvl > 0 ? lvl + " habit(s)" : "No activity"}`;
    grid.appendChild(cell);
  }
}

function renderInsight() {
  const logs = Store.getLogs();
  const hours = logs.map((l) => new Date(l.date).getHours());
  const morningH = hours.filter((h) => h >= 6 && h <= 10).length;
  const totalH = hours.length || 1;
  const pct = Math.round((morningH / totalH) * 100);
  const displayPct = logs.length ? pct : 0;

  const ring = document.getElementById("insight-ring");
  const pctEl = document.getElementById("insight-pct");
  const textEl = document.getElementById("insight-text");
  const peakEl = document.getElementById("peak-time");

  if (pctEl) pctEl.textContent = logs.length ? `${displayPct}%` : "—";

  if (ring && logs.length) {
    const offset = 351.8 - (351.8 * displayPct) / 100;
    ring.style.strokeDashoffset = offset;
  }

  if (textEl) {
    textEl.textContent = logs.length
      ? `${displayPct}% of your sessions happen in the morning window (6–10 AM). Morning sessions tend to set a positive tone for the rest of the day.`
      : "Log some sessions to discover your peak performance window.";
  }

  if (peakEl && hours.length) {
    const freq = {};
    hours.forEach((h) => (freq[h] = (freq[h] || 0) + 1));
    const peak = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (peak) {
      const t = new Date(0, 0, 0, parseInt(peak)).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      peakEl.textContent = `Peak Time: ${t}`;
    }
  }
}
