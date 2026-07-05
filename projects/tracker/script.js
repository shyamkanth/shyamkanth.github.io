// BreatheEasy Smoking Quitting Tracker Logic

// Global state variables
let appConfig = null;
let dailyLogs = [];
let updateTimerInterval = null;

// Health milestones data definitions (time in seconds)
const milestones = [
    { id: 1, name: "Heart Rate Drops", time: 20 * 60, desc: "Your heart rate and blood pressure drop back to normal levels.", icon: "heart-pulse" },
    { id: 2, name: "Oxygen Levels Rise", time: 12 * 60 * 60, desc: "The carbon monoxide level in your blood drops to normal, increasing blood oxygen levels.", icon: "oxygen" },
    { id: 3, name: "Heart Attack Risk Drops", time: 24 * 60 * 60, desc: "Your risk of a heart attack starts to decrease as circulation improves.", icon: "heart-shield" },
    { id: 4, name: "Taste & Smell Improve", time: 48 * 60 * 60, desc: "Nerve endings begin to heal. Your sense of smell and taste improve noticeably.", icon: "nose-taste" },
    { id: 5, name: "Breathing Becomes Easier", time: 72 * 60 * 60, desc: "Your bronchial tubes relax, making breathing easier. Your lung capacity starts to increase.", icon: "lungs" },
    { id: 6, name: "Circulation & Lung Power", time: 14 * 24 * 60 * 60, desc: "Blood circulation improves significantly, walking becomes easier, and lung function increases up to 30%.", icon: "arrow-path" },
    { id: 7, name: "Cilia Regrowth & Recovery", time: 90 * 24 * 60 * 60, desc: "Coughing, sinus congestion, and shortness of breath decrease. Cilia regrowth in lungs improves mucus clearance.", icon: "fitness" },
    { id: 8, name: "Heart Disease Risk Halved", time: 365 * 24 * 60 * 60, desc: "Your excess risk of coronary heart disease is now half that of a smoker's.", icon: "shield-check" },
    { id: 9, name: "Stroke Risk Normalised", time: 5 * 365 * 24 * 60 * 60, desc: "Your stroke risk is reduced to that of a non-smoker (5-15 years free).", icon: "bolt" },
    { id: 10, name: "Lung Cancer Risk Halved", time: 10 * 365 * 24 * 60 * 60, desc: "Your risk of dying from lung cancer drops to about half of a smoker's risk.", icon: "ribbon" },
    { id: 11, name: "Coronary Risk Restored", time: 15 * 365 * 24 * 60 * 60, desc: "Your risk of coronary heart disease is now identical to someone who has never smoked.", icon: "trophy" }
];

// Inline SVG Icon Helper mapping
function getIconSVG(iconName) {
    const base = 'xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"';
    switch (iconName) {
        case "heart-pulse":
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 11.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V12a.75.75 0 0 1 .75-.75Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6" /></svg>`;
        case "oxygen":
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18m9-9H3" /></svg>`;
        case "heart-shield":
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.75 3.75 0 0 1 21 12Z" /></svg>`;
        case "nose-taste":
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v17.792M14.25 3.104v17.792" /></svg>`;
        case "lungs":
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c4.97 0 9 4.03 9 9 0 3.7-2.23 6.88-5.44 8.27l-3.56-3.56V12.75M12 2.25c-4.97 0-9 4.03-9 9 0 3.7 2.23 6.88 5.44 8.27l3.56-3.56V12.75" /></svg>`;
        case "arrow-path":
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>`;
        case "fitness":
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>`;
        case "shield-check":
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" /></svg>`;
        case "bolt":
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>`;
        case "ribbon":
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 4.038 3.5 6 3.5 6m-16 0s3.5-1.962 3.5-6" /></svg>`;
        case "trophy":
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1-3-3h-3a3 3 0 0 1-3 3m9 0v3.02M7.5 18.75v3.02m10.875-12.75a6.002 6.002 0 0 1-11.75 0h11.75ZM6 9.75a3 3 0 0 1 0-6h1.5M18 9.75a3 3 0 0 0 0-6h-1.5" /></svg>`;
        default:
            return `<svg ${base}><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`;
    }
}

// Motivational Quotes definitions
const quotes = [
    { text: "Your body begins to heal just 20 minutes after your last cigarette.", author: "World Health Organization" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "You are greater than your cravings.", author: "Anonymous" },
    { text: "Every cigarette you don't smoke is a victory for your health and your wallet.", author: "Wellness Coach" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "It is not the mountain we conquer, but ourselves.", author: "Sir Edmund Hillary" }
];

// Run on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('BreatheEasy script loaded');
    initTheme();
    loadAppData();
    setupFormsMinMaxDates();
    renderRandomQuote();

    const exportButton = document.getElementById('btn-export-data');
    const importButton = document.getElementById('btn-import-data');

    if (exportButton) {
        exportButton.addEventListener('click', exportAppData);
    }
    if (importButton) {
        importButton.addEventListener('click', triggerImportFile);
    }
});

// PWA: Service Worker registration and install prompt handling
let deferredInstallPrompt = null;
function triggerInstallPrompt() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(choice => {
        if (choice.outcome === 'accepted') {
            showAlertDialog('Thanks! App will be installed.');
        }
        deferredInstallPrompt = null;
        const btn = document.getElementById('btn-install');
        if (btn) btn.style.display = 'none';
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btn = document.getElementById('btn-install');
    if (btn) {
        btn.style.display = 'inline-flex';
        btn.removeAttribute('aria-hidden');
    }
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const btn = document.getElementById('btn-install');
    if (btn) btn.style.display = 'none';
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('Service Worker registered:', reg.scope);
    }).catch(err => console.warn('Service Worker registration failed:', err));
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('breatheEasy_theme') || 'dark';
    const toggleBtn = document.getElementById('theme-toggle');
    const sunIcon = toggleBtn.querySelector('.sun-icon');
    const moonIcon = toggleBtn.querySelector('.moon-icon');
    const themeSpan = toggleBtn.querySelector('span');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        themeSpan.textContent = 'Dark Mode';
    } else {
        document.body.classList.remove('light-mode');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        themeSpan.textContent = 'Light Mode';
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('breatheEasy_theme', isLight ? 'light' : 'dark');
    initTheme();
}

// Set up datetime-local input max boundaries to avoid picking future dates beyond reasonable ranges
function setupFormsMinMaxDates() {
    const now = new Date();
    // Format local date/time as YYYY-MM-DDThh:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const formattedNow = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    document.getElementById('quit-date').max = formattedNow;
    document.getElementById('onboard-quit-date').max = formattedNow;
    // Set default value in forms to now
    document.getElementById('quit-date').value = formattedNow;
    document.getElementById('onboard-quit-date').value = formattedNow;
}

// Data loading / initializing
function loadAppData() {
    const savedConfig = localStorage.getItem('breatheEasy_config');
    const savedDailyLogs = localStorage.getItem('breatheEasy_dailyLogs');
    
    if (savedDailyLogs) {
        dailyLogs = JSON.parse(savedDailyLogs);
    } else {
        dailyLogs = [];
    }

    if (savedConfig) {
        appConfig = JSON.parse(savedConfig);
        // Hide onboarding, show dashboard timer
        document.getElementById('setup-modal').classList.remove('show');
        
        // Populate settings form fields
        populateSettingsForm();
        
        // Start running calculations
        startTrackers();
    } else {
        // Show onboarding modal
        document.getElementById('setup-modal').classList.add('show');
    }
}

// Form fields population helper
function populateSettingsForm() {
    if (!appConfig) return;
    
    // Set local date string back to input format
    const dateObj = new Date(appConfig.quitDate);
    const tzoffset = dateObj.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(dateObj - tzoffset)).toISOString().slice(0, 16);
    
    document.getElementById('quit-date').value = localISOTime;
    document.getElementById('cigs-per-day').value = appConfig.cigsPerDay;
    document.getElementById('cigs-per-pack').value = appConfig.cigsPerPack;
    document.getElementById('pack-cost').value = appConfig.packCost;
    document.getElementById('currency').value = appConfig.currency;
    document.getElementById('age').value = appConfig.age || '';
    document.getElementById('smoking-history-value').value = appConfig.smokingHistoryValue || '';
    document.getElementById('smoking-history-unit').value = appConfig.smokingHistoryUnit || 'years';
}

// Tab switcher functionality
function switchTab(tabId) {
    // Deactivate all menus & panes
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // Activate target
    const targetButton = document.getElementById(`btn-${tabId}`);
    const targetPane = document.getElementById(`tab-${tabId}`);
    
    if (targetButton && targetPane) {
        targetButton.classList.add('active');
        targetPane.classList.add('active');
    }
    
    // Update Header Metadata
    const headerTitle = document.getElementById('page-title');
    const headerSubtitle = document.getElementById('page-subtitle');
    
    switch (tabId) {
        case 'dashboard':
            headerTitle.textContent = "Dashboard";
            headerSubtitle.textContent = "Track your progress and celebrate life.";
            break;
        case 'health':
            headerTitle.textContent = "Health Progress";
            headerSubtitle.textContent = "Timeline of your body recovering from nicotine.";
            renderHealthTimeline();
            break;
        case 'logs':
            headerTitle.textContent = "Daily Check-in Logs";
            headerSubtitle.textContent = "Review historical log sheets and add new ones.";
            renderLogSheetsTable();
            break;
        case 'settings':
            headerTitle.textContent = "Settings & Resets";
            headerSubtitle.textContent = "Customize habit details and configure preferences.";
            break;
    }
}

// Onboarding Submission
function submitOnboarding(event) {
    event.preventDefault();
    
    const quitDateStr = document.getElementById('onboard-quit-date').value;
    const cigsPerDay = parseInt(document.getElementById('onboard-cigs-per-day').value);
    const cigsPerPack = parseInt(document.getElementById('onboard-cigs-per-pack').value);
    const age = parseInt(document.getElementById('onboard-age').value);
    const smokingHistoryValue = parseInt(document.getElementById('onboard-smoking-history-value').value);
    const smokingHistoryUnit = document.getElementById('onboard-smoking-history-unit').value;
    const packCost = parseFloat(document.getElementById('onboard-pack-cost').value);
    const currency = document.getElementById('onboard-currency').value;
    
    appConfig = {
        quitDate: new Date(quitDateStr).toISOString(),
        cigsPerDay,
        cigsPerPack,
        age,
        smokingHistoryValue,
        smokingHistoryUnit,
        packCost,
        currency
    };
    
    localStorage.setItem('breatheEasy_config', JSON.stringify(appConfig));
    document.getElementById('setup-modal').classList.remove('show');
    
    populateSettingsForm();
    startTrackers();
}

// Save Settings Submission
function saveSettings(event) {
    event.preventDefault();
    
    const quitDateStr = document.getElementById('quit-date').value;
    const cigsPerDay = parseInt(document.getElementById('cigs-per-day').value);
    const cigsPerPack = parseInt(document.getElementById('cigs-per-pack').value);
    const age = parseInt(document.getElementById('age').value);
    const smokingHistoryValue = parseInt(document.getElementById('smoking-history-value').value);
    const smokingHistoryUnit = document.getElementById('smoking-history-unit').value;
    const packCost = parseFloat(document.getElementById('pack-cost').value);
    const currency = document.getElementById('currency').value;
    
    appConfig = {
        quitDate: new Date(quitDateStr).toISOString(),
        cigsPerDay,
        cigsPerPack,
        age,
        smokingHistoryValue,
        smokingHistoryUnit,
        packCost,
        currency
    };
    
    localStorage.setItem('breatheEasy_config', JSON.stringify(appConfig));
    showAlertDialog('Settings updated successfully!', 'Settings Updated');
    
    startTrackers();
}

function getExportData() {
    const exportPayload = {
        appName: 'BreatheEasy',
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {}
    };

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('breatheEasy_')) {
            exportPayload.data[key] = localStorage.getItem(key);
        }
    }

    return exportPayload;
}

function exportAppData() {
    const payload = getExportData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const filename = 'breatheeasy-export.json';

    if (navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, filename);
        showAlertDialog('Your BreatheEasy data export has started.', 'Export Started');
        return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);

    try {
        anchor.click();
        showAlertDialog('Your BreatheEasy data has been exported successfully. Check your browser downloads folder.', 'Export Complete');
    } catch (error) {
        window.open(url, '_blank');
        showAlertDialog('The download could not be triggered automatically. A new tab has been opened to save the file manually.', 'Export Attempted');
    } finally {
        setTimeout(() => {
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

function triggerImportFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.position = 'fixed';
    input.style.top = '-9999px';
    input.style.left = '-9999px';
    input.addEventListener('change', async function(event) {
        if (event.target.files && event.target.files[0]) {
            await handleImportFile(event);
        }
        document.body.removeChild(input);
    });

    document.body.appendChild(input);
    input.click();
}

function handleImportFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        let parsed;
        try {
            parsed = JSON.parse(e.target.result);
        } catch (err) {
            showAlertDialog('The selected file is not valid JSON. Please choose a proper BreatheEasy export file.', 'Invalid File');
            return;
        }

        if (!parsed || parsed.appName !== 'BreatheEasy' || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
            showAlertDialog('This file does not appear to be a valid BreatheEasy export. Import cancelled.', 'Invalid File');
            return;
        }

        const requiredKeys = ['breatheEasy_config', 'breatheEasy_dailyLogs'];
        const hasRequiredData = requiredKeys.every(k => typeof parsed.data[k] === 'string');
        if (!hasRequiredData) {
            showAlertDialog('The selected file does not contain valid BreatheEasy app data. Please choose a correct export file.', 'Invalid File');
            return;
        }

        const confirmed = await showConfirmDialog(
            'Importing this file will overwrite your current BreatheEasy data. This cannot be undone. Do you want to proceed?',
            'Import Data Warning',
            'Import',
            'Cancel'
        );

        if (!confirmed) {
            return;
        }

        applyImportedData(parsed.data);
    };
    reader.readAsText(file);
}

// Expose export/import helpers to inline HTML onclick handlers
window.exportAppData = exportAppData;
window.triggerImportFile = triggerImportFile;
window.handleImportFile = handleImportFile;

function applyImportedData(data) {
    // Remove existing app-related keys before import
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('breatheEasy_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
            localStorage.setItem(key, value);
        }
    });

    showAlertDialog('Import complete. Your BreatheEasy data has been restored.', 'Import Complete');
    loadAppData();
}

// Random Quotes Pick
function renderRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    document.getElementById('quote-text').textContent = quote.text;
    document.getElementById('quote-author').textContent = quote.author;
}

// Main tracking logic & timer intervals
function startTrackers() {
    if (updateTimerInterval) {
        clearInterval(updateTimerInterval);
    }
    
    // Initial updates
    updateDashboard();
    renderRecentCheckins();
    
    // Set 1-second interval loop
    updateTimerInterval = setInterval(() => {
        updateDashboard();
    }, 1000);
}

// Main Dashboard Calculations
function updateDashboard() {
    if (!appConfig) return;
    
    const now = new Date();
    const quitDate = new Date(appConfig.quitDate);
    let diffInSeconds = Math.floor((now - quitDate) / 1000);
    
    // Handle future dates (e.g. user selected quit time slightly in the future)
    if (diffInSeconds < 0) {
        diffInSeconds = 0;
    }
    
    // Time Smoke-Free counters breakdown
    const days = Math.floor(diffInSeconds / (24 * 3600));
    const hours = Math.floor((diffInSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = Math.floor(diffInSeconds % 60);
    
    document.getElementById('count-days').textContent = String(days).padStart(2, '0');
    document.getElementById('count-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('count-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('count-seconds').textContent = String(seconds).padStart(2, '0');
    
    // Update quit date printout
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('quit-date-display').textContent = quitDate.toLocaleDateString(undefined, options);
    
    // Financial calculations:
    // Cigs Avoided = (elapsed seconds / day seconds) * cigs per day
    const dayRatio = diffInSeconds / (24 * 3600);
    const cigsAvoided = dayRatio * appConfig.cigsPerDay;
    document.getElementById('stat-cigarettes-avoided').textContent = Math.floor(cigsAvoided).toLocaleString();
    document.getElementById('stat-cigarettes-rate').textContent = `${appConfig.cigsPerDay} per day skipped`;
    
    // Money saved = (cigs Avoided / cigs per pack) * cost per pack
    const costPerCigarette = appConfig.packCost / appConfig.cigsPerPack;
    const moneySaved = cigsAvoided * costPerCigarette;
    document.getElementById('stat-money-saved').textContent = formatCurrency(moneySaved, appConfig.currency);
    document.getElementById('stat-money-rate').textContent = `Saving ${formatCurrency(appConfig.cigsPerDay * costPerCigarette, appConfig.currency)}/day`;
    
    // Health: Life regained = avoided cigs * 11 minutes
    // Total minutes regained
    const lifeRegainedMinutes = cigsAvoided * 11;
    document.getElementById('stat-life-regained').textContent = formatTimeRegained(lifeRegainedMinutes);
    
    // Sidebar Quick Streak Info
    const sidebarStreak = document.getElementById('sidebar-streak-card');
    const sidebarStreakVal = document.getElementById('sidebar-streak-value');
    if (days >= 1) {
        sidebarStreak.style.display = 'flex';
        sidebarStreakVal.textContent = `${days} Day${days > 1 ? 's' : ''}`;
    } else {
        sidebarStreak.style.display = 'flex';
        sidebarStreakVal.textContent = `${hours} Hour${hours > 1 ? 's' : ''}`;
    }
    
    // Next Milestone Progress updates
    updateNextMilestoneProgress(diffInSeconds);
}

// Formatting helpers
function formatCurrency(amount, symbol) {
    return symbol + parseFloat(amount).toFixed(2);
}

function formatTimeRegained(totalMinutes) {
    if (totalMinutes === 0) return "0m";
    
    const minutes = Math.floor(totalMinutes % 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);
    
    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${minutes}m`;
    
    return result;
}

function formatDurationFromTimestamps(logTimeISO, quitDateISO) {
    const logTime = new Date(logTimeISO);
    const quitDate = new Date(quitDateISO);
    let diffInSeconds = Math.floor((logTime - quitDate) / 1000);
    if (diffInSeconds < 0) diffInSeconds = 0;

    const days = Math.floor(diffInSeconds / (24 * 3600));
    const hours = Math.floor((diffInSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

// Next Milestone progress bar and info update
function updateNextMilestoneProgress(elapsedSeconds) {
    // Find next locked or in-progress milestone
    let nextMilestone = null;
    for (const milestone of milestones) {
        if (elapsedSeconds < milestone.time) {
            nextMilestone = milestone;
            break;
        }
    }
    
    const titleEl = document.getElementById('next-milestone-title');
    const timeLeftEl = document.getElementById('next-milestone-timeleft');
    const barFillEl = document.getElementById('next-milestone-progressbar');
    const percentEl = document.getElementById('next-milestone-percent');
    
    if (nextMilestone) {
        titleEl.textContent = nextMilestone.name;
        
        // Progress percentage calculations
        const percentage = Math.min(100, Math.floor((elapsedSeconds / nextMilestone.time) * 100));
        barFillEl.style.width = `${percentage}%`;
        percentEl.textContent = `${percentage}%`;
        
        // Time left math
        const secondsRemaining = nextMilestone.time - elapsedSeconds;
        timeLeftEl.textContent = formatRemainingSeconds(secondsRemaining);
    } else {
        // All milestones unlocked!
        titleEl.textContent = "All recovery milestones unlocked!";
        timeLeftEl.textContent = "Incredible milestone reached!";
        barFillEl.style.width = "100%";
        percentEl.textContent = "100%";
    }
}

// Formatting remaining seconds helper
function formatRemainingSeconds(secondsRemaining) {
    if (secondsRemaining <= 0) return "";
    
    const days = Math.floor(secondsRemaining / (24 * 3600));
    const hours = Math.floor((secondsRemaining % (24 * 3600)) / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = Math.floor(secondsRemaining % 60);
    
    if (days > 0) {
        return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s remaining`;
    } else {
        return `${seconds}s remaining`;
    }
}

// Health timeline tab builder
function renderHealthTimeline() {
    if (!appConfig) return;
    
    const now = new Date();
    const quitDate = new Date(appConfig.quitDate);
    const elapsedSeconds = Math.max(0, Math.floor((now - quitDate) / 1000));
    
    const listContainer = document.getElementById('milestones-list');
    listContainer.innerHTML = ""; // Clear
    
    let unlockedCount = 0;
    
    milestones.forEach(m => {
        let status = "locked"; // locked, in-progress, unlocked
        let progressPercent = 0;
        let badgeClass = "badge-locked";
        let badgeLabel = "Locked";
        
        if (elapsedSeconds >= m.time) {
            status = "unlocked";
            progressPercent = 100;
            badgeClass = "badge-unlocked";
            badgeLabel = "Unlocked";
            unlockedCount++;
        } else {
            // Find if this is the immediate next active one (in progress) or locked
            // If it is the first one where elapsedSeconds < m.time, we set it as in-progress
            // Actually, we can show progress bar fill relative to elapsed time for any unfinished milestone.
            if (elapsedSeconds > 0 && (milestones.indexOf(m) === 0 || elapsedSeconds >= milestones[milestones.indexOf(m)-1].time)) {
                status = "in-progress";
                progressPercent = Math.min(99, Math.floor((elapsedSeconds / m.time) * 100));
                badgeClass = "badge-in-progress";
                badgeLabel = `${progressPercent}%`;
            } else {
                status = "locked";
                progressPercent = 0;
                badgeClass = "badge-locked";
                badgeLabel = "Locked";
            }
        }
        
        // Build card HTML
        const cardHtml = `
            <div class="timeline-item-card ${status}">
                <div class="timeline-badge">
                    ${getIconSVG(m.icon)}
                </div>
                <div class="card timeline-content-card">
                    <div class="timeline-content-header">
                        <span class="timeline-title">${m.name}</span>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span class="timeline-time-marker">${formatMilestoneTimeLabel(m.time)}</span>
                            <span class="status-indicator-badge ${badgeClass}">${badgeLabel}</span>
                        </div>
                    </div>
                    <p class="timeline-desc">${m.desc}</p>
                    
                    ${status === "in-progress" ? `
                        <div class="progress-bar-container" style="margin-top: 10px; height: 6px;">
                            <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        listContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
    
    // Update timeline counts
    document.getElementById('unlocked-milestones-count').textContent = `${unlockedCount}/${milestones.length}`;
    
    // Average progress across all milestones
    const totalScore = (unlockedCount / milestones.length) * 100;
    document.getElementById('milestones-total-progress').style.width = `${totalScore}%`;
}

// Labels for milestones time thresholds helper
function formatMilestoneTimeLabel(seconds) {
    const hrs = seconds / 3600;
    if (hrs < 1) {
        return `${seconds / 60} Minutes`;
    }
    const days = hrs / 24;
    if (days < 1) {
        return `${hrs} Hours`;
    }
    if (days < 30) {
        return `${Math.round(days)} Day${days > 1 ? 's' : ''}`;
    }
    const months = days / 30;
    if (months < 12) {
        return `${Math.round(months)} Month${months > 1 ? 's' : ''}`;
    }
    const yrs = days / 365;
    return `${Math.round(yrs)} Year${yrs > 1 ? 's' : ''}`;
}



// Relapse Reset handler (Reset only the timer)
function triggerRelapseReset() {
    showConfirmDialog('Did you have a cigarette? This will reset your quit date to right now, but your craving logs and habit settings will be kept. You can do this! Relapses are part of the journey.', 'Relapse Reset', 'Reset', 'Cancel')
        .then(confirmed => {
            if (confirmed) {
                appConfig.quitDate = new Date().toISOString();
                localStorage.setItem('breatheEasy_config', JSON.stringify(appConfig));
                
                // Log a relapse reason automatically if desired or just alert
                showAlertDialog('Timer reset. Every minute is a fresh start. We are in this together!', 'Timer Reset');
                populateSettingsForm();
                startTrackers();
                switchTab('dashboard');
            }
        });
}

// Complete Factory Reset
function triggerFullReset() {
    showConfirmDialog('WARNING: Are you sure you want to delete all settings, quit date, and check-in logs? This action is permanent and cannot be undone.', 'Reset All Data', 'Delete', 'Cancel')
        .then(confirmed => {
            if (confirmed) {
                localStorage.removeItem('breatheEasy_config');
                localStorage.removeItem('breatheEasy_dailyLogs');
                
                appConfig = null;
                dailyLogs = [];
                
                if (updateTimerInterval) {
                    clearInterval(updateTimerInterval);
                }
                
                // Re-initialize state
                loadAppData();
                switchTab('dashboard');
            }
        });
}

// Log Sheet Modal Management
function openLogSheetModal() {
    document.getElementById('logsheet-modal').classList.add('show');
    // Set default slider labels
    updateSliderLabel('craving', 5);
    updateSliderLabel('mood', 5);
    updateSliderLabel('sleep', 5);
    updateSliderLabel('breathing', 5);
    updateSliderLabel('appetite', 5);
    updateSliderLabel('energy', 5);
}

function closeLogSheetModal() {
    document.getElementById('logsheet-modal').classList.remove('show');
    document.getElementById('logsheet-form').reset();
}

function closeLogSheetModalOutside(event) {
    if (event.target === document.getElementById('logsheet-modal')) {
        closeLogSheetModal();
    }
}

// Update text label next to ranges dynamically
function updateSliderLabel(metric, value) {
    const valEl = document.getElementById('val-' + metric);
    if (valEl) {
        valEl.textContent = value;
        if (metric === 'craving') {
            if (value >= 7) valEl.style.color = '#f43f5e';
            else if (value >= 4) valEl.style.color = '#f97316';
            else valEl.style.color = '#10b981';
        } else if (metric === 'mood' || metric === 'sleep' || metric === 'breathing' || metric === 'appetite') {
            if (value >= 7) valEl.style.color = '#10b981';
            else if (value >= 4) valEl.style.color = '#f97316';
            else valEl.style.color = '#f43f5e';
        } else if (metric === 'energy') {
            if (value >= 7) valEl.style.color = '#8b5cf6';
            else if (value >= 4) valEl.style.color = '#f97316';
            else valEl.style.color = '#f43f5e';
        }
    }
}

// Log Sheet Submit Handler
function submitLogSheet(event) {
    event.preventDefault();
    
    if (!appConfig) {
        showAlertDialog('Please complete your tracker setup in the Settings tab first!', 'Setup Required');
        closeLogSheetModal();
        return;
    }

    const logTime = new Date().toISOString();
    const quitDate = new Date(appConfig.quitDate);
    const logDate = new Date(logTime);
    let diffInSeconds = Math.floor((logDate - quitDate) / 1000);
    if (diffInSeconds < 0) diffInSeconds = 0;

    // Time calculations
    const days = Math.floor(diffInSeconds / (24 * 3600));
    const hours = Math.floor((diffInSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    let durationText = "";

    if (days > 0) {
        durationText = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        durationText = `${hours}h ${minutes}m`;
    } else {
        durationText = `${minutes}m`;
    }

    // Cigarettes avoided calculation
    const cigsAvoided = (diffInSeconds / (24 * 3600)) * appConfig.cigsPerDay;
    const cigsAvoidedFormatted = Math.floor(cigsAvoided);

    // Money saved calculation
    const costPerCigarette = appConfig.packCost / appConfig.cigsPerPack;
    const moneySaved = cigsAvoided * costPerCigarette;
    const moneySavedFormatted = formatCurrency(moneySaved, appConfig.currency);

    const quitStatus = document.getElementById('log-status').value;

    const logEntry = {
        id: Date.now().toString(),
        logTime,
        quitDate: appConfig.quitDate,
        quitStatus,
        durationText,
        cigsAvoided: cigsAvoidedFormatted,
        moneySaved: moneySavedFormatted,
        craving: parseInt(document.getElementById('log-craving').value),
        mood: parseInt(document.getElementById('log-mood').value),
        sleep: parseInt(document.getElementById('log-sleep').value),
        breathing: parseInt(document.getElementById('log-breathing').value),
        appetite: parseInt(document.getElementById('log-appetite').value),
        energy: parseInt(document.getElementById('log-energy').value),
        exercise: document.getElementById('log-exercise').value,
        notes: document.getElementById('log-notes').value.trim() || "No notes logged"
    };

    dailyLogs.unshift(logEntry);
    localStorage.setItem('breatheEasy_dailyLogs', JSON.stringify(dailyLogs));
    
    closeLogSheetModal();
    renderLogSheetsTable();

    // Trigger relapse reset if user logs a slip
    if (quitStatus === 'Slipped (Reset needed)') {
        showConfirmDialog('You logged a slip. Would you like to reset your main quit timer to right now? Resets are normal in recovery, keep going!', 'Slip Logged', 'Reset Timer', 'Keep Going')
            .then(confirmed => {
                if (confirmed) {
                    appConfig.quitDate = new Date().toISOString();
                    localStorage.setItem('breatheEasy_config', JSON.stringify(appConfig));
                    populateSettingsForm();
                    startTrackers();
                    switchTab('dashboard');
                }
            });
    } else {
        showAlertDialog('Check-in log entry saved successfully!', 'Check-in Saved');
    }
}

// Log Sheet Delete Handler
function deleteLogSheet(id) {
    showConfirmDialog('Are you sure you want to delete this log sheet record?', 'Delete Log', 'Delete', 'Cancel')
        .then(confirmed => {
            if (confirmed) {
                dailyLogs = dailyLogs.filter(d => d.id !== id);
                localStorage.setItem('breatheEasy_dailyLogs', JSON.stringify(dailyLogs));
                renderLogSheetsTable();
            }
        });
}

function copyLogDetails(id) {
    const entry = dailyLogs.find(d => d.id === id);
    if (!entry) {
        showAlertDialog('Unable to find log details to copy.', 'Copy Failed');
        return;
    }

    const logDate = new Date(entry.logTime).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const quitDate = new Date(entry.quitDate).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const text = [
        `Current Status: ${entry.quitStatus}`,
        `Log Time: ${logDate}`,
        `Quit Date: ${quitDate}`,
        `Duration: ${formatDurationFromTimestamps(entry.logTime, entry.quitDate)}`,
        `Cigs Avoided: ${entry.cigsAvoided}`,
        `Money Saved: ${entry.moneySaved}`,
        `Craving: ${entry.craving}/10`,
        `Mood: ${entry.mood}/10`,
        `Sleep: ${entry.sleep}/10`,
        `Breathing: ${entry.breathing}/10`,
        `Appetite: ${entry.appetite}/10`,
        `Energy: ${entry.energy}/10`,
        `Exercise: ${entry.exercise}`,
        `Notes: ${entry.notes}`
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showAlertDialog('Log details copied to clipboard.', 'Copied'))
            .catch(() => fallbackCopyText(text));
    } else {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showAlertDialog('Log details copied to clipboard.', 'Copied');
    } catch (error) {
        showAlertDialog('Unable to copy log details. Please copy manually.', 'Copy Failed');
    }

    document.body.removeChild(textarea);
}

function showAppDialog(options) {
    return new Promise(resolve => {
        const dialog = document.getElementById('app-dialog');
        const titleEl = dialog.querySelector('.dialog-title');
        const messageEl = dialog.querySelector('.dialog-message');
        const confirmBtn = dialog.querySelector('.dialog-confirm');
        const cancelBtn = dialog.querySelector('.dialog-cancel');

        titleEl.textContent = options.title || 'Notice';
        messageEl.textContent = options.message || '';
        confirmBtn.textContent = options.confirmText || 'OK';
        cancelBtn.textContent = options.cancelText || 'Cancel';
        cancelBtn.style.display = options.type === 'confirm' ? 'inline-flex' : 'none';

        const cleanup = result => {
            dialog.classList.remove('show');
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            document.removeEventListener('keydown', handleKeyDown);
            dialog._cleanup = null;
            resolve(result);
        };
        dialog._cleanup = cleanup;

        const handleKeyDown = event => {
            if (event.key === 'Escape') {
                cleanup(false);
            }
        };

        confirmBtn.onclick = () => cleanup(true);
        cancelBtn.onclick = () => cleanup(false);
        document.addEventListener('keydown', handleKeyDown);
        dialog.classList.add('show');
    });
}

function showAlertDialog(message, title = 'Notice') {
    showAppDialog({ type: 'alert', title, message, confirmText: 'OK' });
}

function showConfirmDialog(message, title = 'Confirm', confirmText = 'Yes', cancelText = 'No') {
    return showAppDialog({ type: 'confirm', title, message, confirmText, cancelText });
}

function handleAppDialogBackdropClick(event) {
    if (event.target.id === 'app-dialog') {
        const dialog = document.getElementById('app-dialog');
        if (dialog._cleanup) {
            dialog._cleanup(false);
        } else {
            dialog.classList.remove('show');
        }
    }
}

function handleAppDialogClose() {
    const dialog = document.getElementById('app-dialog');
    if (dialog._cleanup) {
        dialog._cleanup(false);
    } else {
        dialog.classList.remove('show');
    }
}

// Render Log Sheets History Table and Statistics
function renderLogSheetsTable() {
    const tableBody = document.getElementById('log-sheets-body');
    const noMsg = document.getElementById('no-logs-msg');
    
    tableBody.innerHTML = "";
    
    // Stats elements
    const totalCheckinsEl = document.getElementById('log-count-val');
    const avgCravingEl = document.getElementById('avg-craving-val');
    const avgMoodEl = document.getElementById('avg-mood-val');
    const avgEnergyEl = document.getElementById('avg-energy-val');

    totalCheckinsEl.textContent = dailyLogs.length;

    if (dailyLogs.length === 0) {
        noMsg.style.display = 'block';
        avgCravingEl.textContent = "0.0";
        avgMoodEl.textContent = "0.0";
        avgEnergyEl.textContent = "0.0";
        return;
    }

    noMsg.style.display = 'none';

    let totalCraving = 0;
    let totalMood = 0;
    let totalEnergy = 0;

    dailyLogs.forEach(d => {
        totalCraving += d.craving;
        totalMood += d.mood;
        totalEnergy += d.energy;

        const logDate = new Date(d.logTime);
        const quitDateObj = new Date(d.quitDate);
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const quitOptions = { month: 'short', day: 'numeric', year: 'numeric' };

        const statusClass = d.quitStatus === 'Smoke-Free' ? 'badge-unlocked' : 'badge-locked';

        const row = `
            <tr>
                <td><strong>${logDate.toLocaleDateString(undefined, options)}</strong></td>
                <td>${quitDateObj.toLocaleDateString(undefined, quitOptions)}</td>
                <td><span class="status-indicator-badge ${statusClass}" style="font-size: 10px;">${d.quitStatus === 'Smoke-Free' ? 'Smoke-Free' : 'Slipped'}</span></td>
                <td>${d.durationText}</td>
                <td>${d.cigsAvoided}</td>
                <td style="color: var(--accent-emerald); font-weight: 600;">${d.moneySaved}</td>
                <td><span class="intensity-badge intensity-${d.craving >= 7 ? 'High' : d.craving >= 4 ? 'Medium' : 'Low'}">${d.craving}/10</span></td>
                <td>${d.mood}/10</td>
                <td>${d.sleep}/10</td>
                <td>${d.breathing}/10</td>
                <td>${d.appetite}/10</td>
                <td>${d.energy}/10</td>
                <td><span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);">${d.exercise}</span></td>
                <td class="notes-column" style="max-width: 260px;" title="${d.notes}">${d.notes}</td>
                <td style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                    <button class="btn-copy-mini" onclick="copyLogDetails('${d.id}')" title="Copy record details">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5h7.5M8.25 7.5a2.25 2.25 0 0 1 2.25-2.25h3a2.25 2.25 0 0 1 2.25 2.25v0a2.25 2.25 0 0 1-2.25 2.25h-3A2.25 2.25 0 0 1 8.25 7.5zM15.75 9.75v7.5a2.25 2.25 0 0 1-2.25 2.25H10.5a2.25 2.25 0 0 1-2.25-2.25v-7.5" />
                        </svg>
                    </button>
                    <button class="btn-delete-mini" onclick="deleteLogSheet('${d.id}')" title="Delete record">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    // Compute averages
    avgCravingEl.textContent = (totalCraving / dailyLogs.length).toFixed(1);
    avgMoodEl.textContent = (totalMood / dailyLogs.length).toFixed(1);
    avgEnergyEl.textContent = (totalEnergy / dailyLogs.length).toFixed(1);
    renderRecentCheckins();
}

function renderRecentCheckins() {
    const container = document.getElementById('recent-checkins-list');
    if (!container) return;

    if (!dailyLogs || dailyLogs.length === 0) {
        container.innerHTML = '<div class="no-data-msg">No check-ins yet. Click the log button to add your first entry.</div>';
        return;
    }

    const entries = dailyLogs.slice(0, 10);
    let html = '<div class="recent-checkins-grid" style="display: grid; gap: 12px;">';

    entries.forEach(entry => {
        const logDate = new Date(entry.logTime);
        const formattedDate = logDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        html += `
            <div class="recent-checkin-item" style="display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 12px 14px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);">
                <div>
                    <div style="font-weight: 600;">${formattedDate}</div>
                    <div style="font-size: 13px; color: var(--text-muted);">${entry.quitStatus}</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, auto); gap: 12px; align-items: center; font-size: 13px;">
                    <span>Craving: <strong>${entry.craving}</strong></span>
                    <span>Mood: <strong>${entry.mood}</strong></span>
                    <span>Energy: <strong>${entry.energy}</strong></span>
                </div>
                <button class="btn-copy-mini" onclick="copyLogDetails('${entry.id}')" title="Copy check-in details" style="flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 18px; height: 18px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5h7.5M8.25 7.5a2.25 2.25 0 0 1 2.25-2.25h3a2.25 2.25 0 0 1 2.25 2.25v0a2.25 2.25 0 0 1-2.25 2.25h-3A2.25 2.25 0 0 1 8.25 7.5zM15.75 9.75v7.5a2.25 2.25 0 0 1-2.25 2.25H10.5a2.25 2.25 0 0 1-2.25-2.25v-7.5" />
                    </svg>
                </button>
            </div>`;
    });

    html += '</div>';
    container.innerHTML = html;
}
