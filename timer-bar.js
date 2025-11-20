// timer-bar.js
// Displays a fixed bar with all running timers from localStorage on every page

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

function updateTimerBar() {
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

// Initial render and update every second
function startTimerBarUpdates() {
    updateTimerBar();
    setInterval(updateTimerBar, 1000);
}

document.addEventListener('DOMContentLoaded', startTimerBarUpdates);