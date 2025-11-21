// timer-bar.js
// Displays a fixed bar with all running timers from localStorage on every page except timer.html
// Also shows a flashing popup if a timer finishes while on another page

function pad(n) {
    return n.toString().padStart(2, '0');
}
function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
        return pad(h) + ':' + pad(m) + ':' + pad(s);
    } else {
        return pad(m) + ':' + pad(s);
    }
}

function getRunningTimers() {
    let timers = [];
    let saved = localStorage.getItem('timers');
    if (saved) {
        try {
            timers = JSON.parse(saved);
        } catch {
            timers = [];
        }
    }
    // Only running timers
    return timers.filter(t => t.running && t.endTime);
}

function getAllTimers() {
    let timers = [];
    let saved = localStorage.getItem('timers');
    if (saved) {
        try {
            timers = JSON.parse(saved);
        } catch {
            timers = [];
        }
    }
    return timers;
}

function updateTimerBar() {
    // Don't show on timer.html
    if (window.location.pathname.endsWith('timer.html')) {
        const bar = document.getElementById('global-timer-bar');
        if (bar) bar.style.display = 'none';
        return;
    }
    const bar = document.getElementById('global-timer-bar');
    if (!bar) return;
    const timers = getRunningTimers();
    if (timers.length === 0) {
        bar.style.display = 'none';
        bar.innerHTML = '';
        return;
    }
    bar.style.display = 'flex';
    bar.innerHTML = timers.map(t => {
        // Calculate remaining time
        let remaining = Math.max(0, Math.round((t.endTime - Date.now()) / 1000));
        return `<span class=\"timer-bar-timer\"><b>${t.name || 'Timer'}</b>: <span class=\"timer-bar-time\">${formatTime(remaining)}</span></span>`;
    }).join('<span class="timer-bar-sep">|</span>');
}

// Flashing popup for timer end
let globalFinishedTimerName = null;
function showGlobalTimerPopup(name) {
    globalFinishedTimerName = name;
    let popup = document.getElementById('globalTimerPopup');
    // Play audio
    let audio = document.getElementById('timerAudio');
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'timerAudio';
        audio.src = 'timer.mp3';
        audio.preload = 'auto';
        document.body.appendChild(audio);
    }
    audio.currentTime = 0;
    audio.play();
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'globalTimerPopup';
        popup.innerHTML = `
            <div id="globalPopupContent">
                <span class="flashing">!</span>
                <div id="globalPopupMsg"></div>
                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <button id="globalRestartBtn" style="padding: 12px 24px; font-size: 1.1rem; background: #3a7afe; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Restart Timer</button>
                    <button id="globalStopBtn" style="padding: 12px 24px; font-size: 1.1rem; background: #d32f2f; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Stop</button>
                </div>
            </div>`;
        document.body.appendChild(popup);
        
        // Add event listeners
        document.getElementById('globalRestartBtn').addEventListener('click', function() {
            restartGlobalTimer();
        });
        document.getElementById('globalStopBtn').addEventListener('click', function() {
            stopGlobalTimer();
        });
    }
    document.getElementById('globalPopupMsg').innerHTML = `<b>${name}</b><br>Time is up!`;
    popup.classList.add('flashing-bg');
    popup.style.display = 'flex';
}

function hideGlobalPopup() {
    const popup = document.getElementById('globalTimerPopup');
    if (popup) {
        popup.style.display = 'none';
        popup.classList.remove('flashing-bg');
    }
    const audio = document.getElementById('timerAudio');
    if (audio) { 
        audio.pause(); 
        audio.currentTime = 0; 
    }
    globalFinishedTimerName = null;
}

function restartGlobalTimer() {
    if (globalFinishedTimerName) {
        // Find the finished timer and restart it
        let timers = getAllTimers();
        let timerIdx = timers.findIndex(t => t.name === globalFinishedTimerName && !t.running && t.remaining === 0);
        if (timerIdx !== -1) {
            let timer = timers[timerIdx];
            timer.remaining = timer.total;
            timer.running = true;
            timer.started = true;
            timer.endTime = Date.now() + timer.total * 1000;
            localStorage.setItem('timers', JSON.stringify(timers));
        }
    }
    hideGlobalPopup();
}

function stopGlobalTimer() {
    if (globalFinishedTimerName) {
        // Find the finished timer and reset it
        let timers = getAllTimers();
        let timerIdx = timers.findIndex(t => t.name === globalFinishedTimerName && !t.running && t.remaining === 0);
        if (timerIdx !== -1) {
            let timer = timers[timerIdx];
            timer.remaining = timer.total;
            timer.running = false;
            timer.started = false;
            timer.endTime = null;
            localStorage.setItem('timers', JSON.stringify(timers));
        }
    }
    hideGlobalPopup();
}

// Track finished timers
let lastTimerStates = getAllTimers().map(t => ({name: t.name, running: t.running, remaining: t.remaining, total: t.total}));

function checkForFinishedTimers() {
    // Only on non-timer.html pages
    if (window.location.pathname.endsWith('timer.html')) return;
    const prev = lastTimerStates;
    const curr = getAllTimers();
    curr.forEach((t, idx) => {
        if (prev[idx] && prev[idx].running && t.remaining === 0 && !t.running) {
            // Timer just finished
            showGlobalTimerPopup(t.name || 'Timer');
        }
    });
    lastTimerStates = curr.map(t => ({name: t.name, running: t.running, remaining: t.remaining, total: t.total}));
}

// Initial render and update every second
function startTimerBarUpdates() {
    updateTimerBar();
    setInterval(() => {
        updateTimerBar();
        checkForFinishedTimers();
    }, 1000);
}

document.addEventListener('DOMContentLoaded', startTimerBarUpdates);