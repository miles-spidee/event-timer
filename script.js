let settings = {};
let lastSettingsJson = '';
let timerInterval = null;
let isRunning = false;
let endTime = null;
let remainingTime = 0;

let timerDisplay, eventTitle, eventSubtitle;

function formatTime(seconds) {
    if (seconds < 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const hDisplay = h < 10 ? "0" + h : h;
    const mDisplay = m < 10 ? "0" + m : m;
    const sDisplay = s < 10 ? "0" + s : s;
    
    return hDisplay + ":" + mDisplay + ":" + sDisplay;
}

function updateDisplay(seconds) {
    timerDisplay.textContent = formatTime(seconds);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isRunning = false;
    remainingTime = 0;
}

function startEndTimeTimer() {
    stopTimer();
    isRunning = true;
    
    timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = Math.floor((endTime - now) / 1000);
        if (distance < 0) {
            stopTimer();
            updateDisplay(0);
            return;
        }
        updateDisplay(distance);
    }, 1000);
}

function startFixedTimer() {
    if (isRunning) return;
    isRunning = true;
    
    timerInterval = setInterval(() => {
        remainingTime--;
        if (remainingTime <= 0) {
            stopTimer();
            updateDisplay(0);
            return;
        }
        updateDisplay(remainingTime);
    }, 1000);
}

function loadSettings() {
    const stored = localStorage.getItem('timerSettings');
    if (stored !== lastSettingsJson) {
        lastSettingsJson = stored || '{}';
        if (stored) {
            try {
                settings = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse settings:', e);
                settings = {};
            }
        } else {
            settings = {};
        }
        applySettings();
    }
}

function applySettings() {
    if (!eventTitle || !eventSubtitle) return;
    // Update titles
    eventTitle.textContent = settings.title || "Event Title";
    eventSubtitle.textContent = settings.subtitle || "Event Subtitle";
    
    // Stop any running timer
    stopTimer();
    
    // Apply new settings
    if (settings.mode === 'end-time' && settings.endTime) {
        endTime = new Date(settings.endTime).getTime();
        if (!isNaN(endTime)) {
            startEndTimeTimer();
        } else {
            updateDisplay(0);
        }
    } else {
        // Fixed-time or default mode
        remainingTime = parseInt(settings.duration) || 0;
        updateDisplay(remainingTime);
    }
}

function init() {
    timerDisplay = document.getElementById('timer-display');
    eventTitle = document.getElementById('event-title');
    eventSubtitle = document.getElementById('event-subtitle');
    
    // Force a load by resetting the tracker when elements are first available
    lastSettingsJson = 'UNINITIALIZED'; 
    loadSettings();
}

// Load and apply settings when page loads
document.addEventListener('DOMContentLoaded', init);

// Spacebar to start timer
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if ((settings.mode === 'fixed-time' || !settings.mode) && !isRunning) {
            startFixedTimer();
        }
    }
});

// Poll for changes every 300ms
setInterval(() => {
    loadSettings();
}, 300);

// Listen for storage changes (cross-tab)
window.addEventListener('storage', (e) => {
    if (e.key === 'timerSettings') {
        loadSettings();
    }
});
