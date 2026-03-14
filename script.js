let settings = {};
let timerState = {};
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
    const storedSettings = localStorage.getItem('timerSettings') || '{}';
    const storedState = localStorage.getItem('timerState') || '{}';
    const combined = storedSettings + '|' + storedState;

    if (combined !== lastSettingsJson) {
        lastSettingsJson = combined;
        try {
            settings = JSON.parse(storedSettings);
        } catch (e) {
            settings = {};
        }
        try {
            timerState = JSON.parse(storedState);
        } catch (e) {
            timerState = {};
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
            if (timerState.started) {
                startEndTimeTimer();
            } else {
                // Show initially without starting
                const dist = Math.floor((endTime - new Date().getTime()) / 1000);
                updateDisplay(dist);
            }
        } else {
            updateDisplay(0);
        }
    } else {
        // Fixed-time or default mode
        if (timerState.started && timerState.fixedEndTime) {
            remainingTime = Math.floor((timerState.fixedEndTime - new Date().getTime()) / 1000);
            if (remainingTime < 0) remainingTime = 0;
            startFixedTimer();
        } else {
            remainingTime = parseInt(settings.duration) || 0;
            updateDisplay(remainingTime);
        }
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
        
        if (!timerState.started) {
            timerState.started = true;
            
            if (settings.mode === 'end-time') {
                localStorage.setItem('timerState', JSON.stringify(timerState));
                startEndTimeTimer();
            } else {
                remainingTime = parseInt(settings.duration) || 0;
                timerState.fixedEndTime = new Date().getTime() + (remainingTime * 1000);
                localStorage.setItem('timerState', JSON.stringify(timerState));
                startFixedTimer();
            }

            // Confetti Celebration
            const duration = 2 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min, max) {
              return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function() {
              const timeLeft = animationEnd - Date.now();

              if (timeLeft <= 0) {
                return clearInterval(interval);
              }

              const particleCount = 50 * (timeLeft / duration);
              confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
              confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
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
