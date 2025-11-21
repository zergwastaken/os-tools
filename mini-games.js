// ==================== SNAKE GAME ====================
const snakeCanvas = document.getElementById('snakeCanvas');
const snakeCtx = snakeCanvas.getContext('2d');
const snakeScoreEl = document.getElementById('snakeScore');
const snakeStartBtn = document.getElementById('snakeStart');

let snake = [{x: 150, y: 150}];
let snakeDir = {x: 0, y: 0};
let snakeFood = {x: 0, y: 0};
let snakeScore = 0;
let snakeGame = null;
const gridSize = 15;

function drawSnake() {
    snakeCtx.fillStyle = '#1a1f35';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    
    // Draw snake
    snakeCtx.fillStyle = '#3a7afe';
    snake.forEach((segment, i) => {
        snakeCtx.fillStyle = i === 0 ? '#5a9aff' : '#3a7afe';
        snakeCtx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
    });
    
    // Draw food
    snakeCtx.fillStyle = '#ff3a3a';
    snakeCtx.fillRect(snakeFood.x, snakeFood.y, gridSize - 2, gridSize - 2);
}

function moveSnake() {
    const head = {x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y};
    
    // Check collision with walls
    if (head.x < 0 || head.x >= snakeCanvas.width || head.y < 0 || head.y >= snakeCanvas.height) {
        endSnakeGame();
        return;
    }
    
    // Check collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endSnakeGame();
        return;
    }
    
    snake.unshift(head);
    
    // Check if ate food
    if (head.x === snakeFood.x && head.y === snakeFood.y) {
        snakeScore++;
        snakeScoreEl.textContent = snakeScore;
        placeSnakeFood();
    } else {
        snake.pop();
    }
    
    drawSnake();
}

function placeSnakeFood() {
    snakeFood.x = Math.floor(Math.random() * (snakeCanvas.width / gridSize)) * gridSize;
    snakeFood.y = Math.floor(Math.random() * (snakeCanvas.height / gridSize)) * gridSize;
}

function startSnakeGame() {
    snake = [{x: 150, y: 150}];
    snakeDir = {x: gridSize, y: 0};
    snakeScore = 0;
    snakeScoreEl.textContent = snakeScore;
    placeSnakeFood();
    drawSnake();
    if (snakeGame) clearInterval(snakeGame);
    snakeGame = setInterval(moveSnake, 100);
    snakeStartBtn.textContent = 'Playing...';
    snakeStartBtn.disabled = true;
}

function endSnakeGame() {
    clearInterval(snakeGame);
    snakeGame = null;
    snakeStartBtn.textContent = 'Game Over - Play Again';
    snakeStartBtn.disabled = false;
}

document.addEventListener('keydown', (e) => {
    if (!snakeGame) return;
    if (e.key === 'ArrowUp' && snakeDir.y === 0) snakeDir = {x: 0, y: -gridSize};
    if (e.key === 'ArrowDown' && snakeDir.y === 0) snakeDir = {x: 0, y: gridSize};
    if (e.key === 'ArrowLeft' && snakeDir.x === 0) snakeDir = {x: -gridSize, y: 0};
    if (e.key === 'ArrowRight' && snakeDir.x === 0) snakeDir = {x: gridSize, y: 0};
});

snakeStartBtn.addEventListener('click', startSnakeGame);
drawSnake();

// ==================== MEMORY MATCH GAME ====================
const memoryGrid = document.getElementById('memoryGrid');
const memoryMovesEl = document.getElementById('memoryMoves');
const memoryPairsEl = document.getElementById('memoryPairs');
const memoryStartBtn = document.getElementById('memoryStart');

const memorySymbols = ['🚢', '⚓', '🧭', '🌊', '🔭', '⛵', '🐚', '🦈'];
let memoryCards = [];
let memoryFlipped = [];
let memoryMoves = 0;
let memoryPairs = 0;

function createMemoryGame() {
    memoryCards = [...memorySymbols, ...memorySymbols]
        .sort(() => Math.random() - 0.5)
        .map((symbol, index) => ({symbol, index, matched: false}));
    
    memoryGrid.innerHTML = '';
    memoryCards.forEach((card, i) => {
        const div = document.createElement('div');
        div.className = 'memory-card';
        div.dataset.index = i;
        div.addEventListener('click', () => flipMemoryCard(i));
        memoryGrid.appendChild(div);
    });
    
    memoryFlipped = [];
    memoryMoves = 0;
    memoryPairs = 0;
    memoryMovesEl.textContent = memoryMoves;
    memoryPairsEl.textContent = memoryPairs;
}

function flipMemoryCard(index) {
    if (memoryFlipped.length === 2 || memoryFlipped.includes(index) || memoryCards[index].matched) return;
    
    const card = memoryGrid.children[index];
    card.textContent = memoryCards[index].symbol;
    card.classList.add('flipped');
    memoryFlipped.push(index);
    
    if (memoryFlipped.length === 2) {
        memoryMoves++;
        memoryMovesEl.textContent = memoryMoves;
        
        const [first, second] = memoryFlipped;
        if (memoryCards[first].symbol === memoryCards[second].symbol) {
            memoryCards[first].matched = true;
            memoryCards[second].matched = true;
            memoryPairs++;
            memoryPairsEl.textContent = memoryPairs;
            memoryFlipped = [];
            
            if (memoryPairs === 8) {
                setTimeout(() => alert(`You won in ${memoryMoves} moves!`), 300);
            }
        } else {
            setTimeout(() => {
                memoryGrid.children[first].textContent = '';
                memoryGrid.children[first].classList.remove('flipped');
                memoryGrid.children[second].textContent = '';
                memoryGrid.children[second].classList.remove('flipped');
                memoryFlipped = [];
            }, 800);
        }
    }
}

memoryStartBtn.addEventListener('click', createMemoryGame);
createMemoryGame();

// ==================== REACTION TIME GAME ====================
const reactionBox = document.getElementById('reactionBox');
const reactionBestEl = document.getElementById('reactionBest');
const reactionResetBtn = document.getElementById('reactionReset');

let reactionStart = 0;
let reactionBest = localStorage.getItem('reactionBest') || null;
let reactionTimeout = null;
let reactionState = 'ready'; // ready, waiting, click

if (reactionBest) reactionBestEl.textContent = reactionBest;

reactionBox.addEventListener('click', () => {
    if (reactionState === 'ready') {
        reactionState = 'waiting';
        reactionBox.style.background = '#d32f2f';
        reactionBox.textContent = 'Wait for green...';
        reactionTimeout = setTimeout(() => {
            reactionState = 'click';
            reactionBox.style.background = '#4caf50';
            reactionBox.textContent = 'Click Now!';
            reactionStart = Date.now();
        }, Math.random() * 3000 + 1000);
    } else if (reactionState === 'waiting') {
        clearTimeout(reactionTimeout);
        reactionState = 'ready';
        reactionBox.style.background = 'rgba(58, 122, 254, 0.3)';
        reactionBox.textContent = 'Too early! Click to try again';
    } else if (reactionState === 'click') {
        const time = Date.now() - reactionStart;
        reactionBox.textContent = `${time} ms - Click to try again`;
        reactionBox.style.background = 'rgba(58, 122, 254, 0.3)';
        reactionState = 'ready';
        
        if (!reactionBest || time < parseInt(reactionBest)) {
            reactionBest = time;
            reactionBestEl.textContent = time;
            localStorage.setItem('reactionBest', time);
        }
    }
});

reactionResetBtn.addEventListener('click', () => {
    localStorage.removeItem('reactionBest');
    reactionBest = null;
    reactionBestEl.textContent = '-';
});

// ==================== NUMBER GUESS GAME ====================
const guessInput = document.getElementById('guessInput');
const guessHint = document.getElementById('guessHint');
const guessAttemptsEl = document.getElementById('guessAttempts');
const guessSubmitBtn = document.getElementById('guessSubmit');
const guessNewBtn = document.getElementById('guessNew');

let guessTarget = Math.floor(Math.random() * 100) + 1;
let guessAttempts = 0;

function makeGuess() {
    const guess = parseInt(guessInput.value);
    if (!guess || guess < 1 || guess > 100) return;
    
    guessAttempts++;
    guessAttemptsEl.textContent = guessAttempts;
    
    if (guess === guessTarget) {
        guessHint.textContent = `🎉 Correct! You got it in ${guessAttempts} attempts!`;
        guessHint.style.color = '#4caf50';
        guessSubmitBtn.disabled = true;
    } else if (guess < guessTarget) {
        guessHint.textContent = '⬆️ Too low! Try higher';
        guessHint.style.color = '#ffb13a';
    } else {
        guessHint.textContent = '⬇️ Too high! Try lower';
        guessHint.style.color = '#ffb13a';
    }
    
    guessInput.value = '';
}

function newGuessGame() {
    guessTarget = Math.floor(Math.random() * 100) + 1;
    guessAttempts = 0;
    guessAttemptsEl.textContent = guessAttempts;
    guessHint.textContent = 'Guess a number between 1-100';
    guessHint.style.color = '#b3c6ff';
    guessSubmitBtn.disabled = false;
    guessInput.value = '';
}

guessSubmitBtn.addEventListener('click', makeGuess);
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') makeGuess();
});
guessNewBtn.addEventListener('click', newGuessGame);

// ==================== WHACK-A-MOLE GAME ====================
const moleGrid = document.getElementById('moleGrid');
const moleScoreEl = document.getElementById('moleScore');
const moleTimeEl = document.getElementById('moleTime');
const moleStartBtn = document.getElementById('moleStart');

let moleScore = 0;
let moleTime = 30;
let moleInterval = null;
let moleTimer = null;
let currentMole = null;

function showMole() {
    if (currentMole) currentMole.classList.remove('active');
    
    const holes = document.querySelectorAll('.mole-hole');
    const randomIndex = Math.floor(Math.random() * holes.length);
    currentMole = holes[randomIndex];
    currentMole.classList.add('active');
    
    setTimeout(() => {
        if (currentMole) currentMole.classList.remove('active');
    }, 800);
}

function whackMole(e) {
    if (e.target.classList.contains('active')) {
        moleScore++;
        moleScoreEl.textContent = moleScore;
        e.target.classList.remove('active');
    }
}

function startMoleGame() {
    moleScore = 0;
    moleTime = 30;
    moleScoreEl.textContent = moleScore;
    moleTimeEl.textContent = moleTime;
    moleStartBtn.disabled = true;
    
    moleInterval = setInterval(showMole, 1000);
    moleTimer = setInterval(() => {
        moleTime--;
        moleTimeEl.textContent = moleTime;
        if (moleTime <= 0) {
            clearInterval(moleInterval);
            clearInterval(moleTimer);
            if (currentMole) currentMole.classList.remove('active');
            moleStartBtn.disabled = false;
            alert(`Game Over! Final Score: ${moleScore}`);
        }
    }, 1000);
}

document.querySelectorAll('.mole-hole').forEach(hole => {
    hole.addEventListener('click', whackMole);
});
moleStartBtn.addEventListener('click', startMoleGame);

// ==================== SIMON SAYS GAME ====================
const simonBtns = document.querySelectorAll('.simon-btn');
const simonLevelEl = document.getElementById('simonLevel');
const simonStartBtn = document.getElementById('simonStart');

let simonSequence = [];
let simonPlayerSequence = [];
let simonLevel = 0;
let simonPlaying = false;

const simonColors = {
    green: '#4caf50',
    red: '#f44336',
    yellow: '#ffeb3b',
    blue: '#2196f3'
};

function flashSimonBtn(color) {
    const btn = document.querySelector(`[data-color="${color}"]`);
    const originalBg = btn.style.background;
    btn.style.background = simonColors[color];
    btn.style.opacity = '1';
    
    setTimeout(() => {
        btn.style.background = originalBg;
        btn.style.opacity = '0.6';
    }, 400);
}

function playSimonSequence() {
    simonPlaying = true;
    let i = 0;
    const interval = setInterval(() => {
        flashSimonBtn(simonSequence[i]);
        i++;
        if (i >= simonSequence.length) {
            clearInterval(interval);
            simonPlaying = false;
        }
    }, 800);
}

function addSimonStep() {
    const colors = ['green', 'red', 'yellow', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    simonSequence.push(randomColor);
    simonLevel++;
    simonLevelEl.textContent = simonLevel;
    simonPlayerSequence = [];
    playSimonSequence();
}

function handleSimonClick(e) {
    if (simonPlaying || simonSequence.length === 0) return;
    
    const color = e.target.dataset.color;
    flashSimonBtn(color);
    simonPlayerSequence.push(color);
    
    const index = simonPlayerSequence.length - 1;
    if (simonPlayerSequence[index] !== simonSequence[index]) {
        alert(`Game Over! You reached level ${simonLevel}`);
        simonSequence = [];
        simonPlayerSequence = [];
        simonLevel = 0;
        simonLevelEl.textContent = simonLevel;
        simonStartBtn.disabled = false;
        return;
    }
    
    if (simonPlayerSequence.length === simonSequence.length) {
        setTimeout(addSimonStep, 1000);
    }
}

function startSimonGame() {
    simonSequence = [];
    simonPlayerSequence = [];
    simonLevel = 0;
    simonLevelEl.textContent = simonLevel;
    simonStartBtn.disabled = true;
    setTimeout(addSimonStep, 500);
}

simonBtns.forEach(btn => {
    btn.addEventListener('click', handleSimonClick);
});
simonStartBtn.addEventListener('click', startSimonGame);
