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
function showGlobalTimerPopup(name) {
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
        popup.innerHTML = `<div id="globalPopupContent"><span class="flashing">!</span><div id="globalPopupMsg"></div></div>`;
        document.body.appendChild(popup);
    }
    document.getElementById('globalPopupMsg').innerHTML = `<b>${name}</b><br>Time is up!<br><span style="font-size:1.1rem;">(Click anywhere to close)</span>`;
    popup.classList.add('flashing-bg');
    popup.style.display = 'flex';
    popup.onclick = function() {
        popup.style.display = 'none';
        popup.classList.remove('flashing-bg');
        var audio = document.getElementById('timerAudio');
        if (audio) { audio.pause(); audio.currentTime = 0; }
    };
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