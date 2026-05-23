// Game Constants and Configurations
const WIDTH = 9;
const HEIGHT = 9;
const CELL_SIZE = 50; // px
const BOMB_LIFESPAN = 2; // turns

// DOM Elements
const startBtn = document.getElementById('start-btn');
const manualScreen = document.getElementById('manual-screen');
const gameScreen = document.getElementById('game-screen');
const boardElement = document.getElementById('game-board');
const actionLog = document.getElementById('action-log');
const gameOverModal = document.getElementById('game-over-modal');
const winnerText = document.getElementById('winner-text');
const restartBtn = document.getElementById('restart-btn');

const btnMinus = document.getElementById('minus-player-btn');
const btnPlus = document.getElementById('plus-player-btn');
const displayCount = document.getElementById('player-count-display');
const charSelectGrid = document.getElementById('char-select-grid');

// Game State
let totalPlayers = 2;
let board = [];
let players = [];
let bombs = [];
let items = [];
let currentPlayerIndex = 0;
let currentAP = 2;
let bombPlacedThisTurn = false;
let gameOver = false;

// Character Selection
const availableChars = ['assets/char1.png', 'assets/char2.png'];
let playerSelectedChars = [0, 1, 0, 1, 0, 1]; // Indexes for up to 6 players

function updateCharSelectUI() {
    charSelectGrid.innerHTML = '';
    for (let i = 0; i < totalPlayers; i++) {
        const box = document.createElement('div');
        box.style.width = '60px';
        box.style.height = '60px';
        box.style.border = `4px solid var(--p${i+1}-color)`;
        box.style.backgroundImage = `url('${availableChars[playerSelectedChars[i]]}')`;
        box.style.backgroundSize = 'cover';
        box.style.backgroundPosition = 'center';
        box.style.cursor = 'pointer';
        box.style.display = 'flex';
        box.style.alignItems = 'flex-end';
        box.style.justifyContent = 'center';
        
        const label = document.createElement('span');
        label.innerText = `P${i+1}`;
        label.style.backgroundColor = 'rgba(0,0,0,0.7)';
        label.style.width = '100%';
        label.style.fontSize = '0.6rem';
        label.style.padding = '2px 0';
        
        box.appendChild(label);
        
        box.addEventListener('click', () => {
            playerSelectedChars[i] = (playerSelectedChars[i] + 1) % availableChars.length;
            updateCharSelectUI();
        });
        
        charSelectGrid.appendChild(box);
    }
}

// Player Selector Logic
btnMinus.addEventListener('click', () => {
    if (totalPlayers > 2) {
        totalPlayers--;
        displayCount.innerText = totalPlayers;
        updateCharSelectUI();
    }
});
btnPlus.addEventListener('click', () => {
    if (totalPlayers < 6) {
        totalPlayers++;
        displayCount.innerText = totalPlayers;
        updateCharSelectUI();
    }
});

// Initial draw of character select
updateCharSelectUI();

// Audio (Optional) - using console log for now
function logAction(msg) {
    actionLog.innerText = msg;
}

// Initialization
function initGame() {
    board = [];
    bombs = [];
    items = [];
    gameOver = false;
    
    // Initialize Board Grid
    for (let y = 0; y < HEIGHT; y++) {
        board[y] = [];
        for (let x = 0; x < WIDTH; x++) {
            if (x % 2 !== 0 && y % 2 !== 0) {
                board[y][x] = { type: 'solid' };
            } else {
                board[y][x] = null;
            }
        }
    }

    // Generate Breakable Walls
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            if (board[y][x] === null && Math.random() < 0.35) {
                // Protect spawn areas for up to 6 players
                const safeZones = [
                    [0,0], [1,0], [0,1], [1,1], // top left
                    [8,8], [7,8], [8,7], [7,7], // bottom right
                    [0,8], [1,8], [0,7], [1,7], // bottom left
                    [8,0], [7,0], [8,1], [7,1], // top right
                    [4,0], [3,0], [5,0], [4,1], // top mid
                    [4,8], [3,8], [5,8], [4,7]  // bottom mid
                ];
                let isSafe = false;
                safeZones.forEach(coord => {
                    if (x === coord[0] && y === coord[1]) isSafe = true;
                });
                if (isSafe) continue;
                
                board[y][x] = { type: 'breakable' };
            }
        }
    }

    // Initialize Players
    const allPossiblePlayers = [
        { id: 1, name: 'Player 1', x: 0, y: 0, hp: 2, maxAP: 2, fireRange: 2, maxBombs: 1, bombsActive: 0, color: 'p1', sprite: availableChars[playerSelectedChars[0]] },
        { id: 2, name: 'Player 2', x: 8, y: 8, hp: 2, maxAP: 2, fireRange: 2, maxBombs: 1, bombsActive: 0, color: 'p2', sprite: availableChars[playerSelectedChars[1]] },
        { id: 3, name: 'Player 3', x: 0, y: 8, hp: 2, maxAP: 2, fireRange: 2, maxBombs: 1, bombsActive: 0, color: 'p3', sprite: availableChars[playerSelectedChars[2]] },
        { id: 4, name: 'Player 4', x: 8, y: 0, hp: 2, maxAP: 2, fireRange: 2, maxBombs: 1, bombsActive: 0, color: 'p4', sprite: availableChars[playerSelectedChars[3]] },
        { id: 5, name: 'Player 5', x: 4, y: 0, hp: 2, maxAP: 2, fireRange: 2, maxBombs: 1, bombsActive: 0, color: 'p5', sprite: availableChars[playerSelectedChars[4]] },
        { id: 6, name: 'Player 6', x: 4, y: 8, hp: 2, maxAP: 2, fireRange: 2, maxBombs: 1, bombsActive: 0, color: 'p6', sprite: availableChars[playerSelectedChars[5]] }
    ];

    players = allPossiblePlayers.slice(0, totalPlayers);

    // Show/Hide UI Panels
    for (let i = 1; i <= 6; i++) {
        const panel = document.getElementById(`panel-p${i}`);
        if (i <= totalPlayers) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    }

    currentPlayerIndex = 0;
    currentAP = players[currentPlayerIndex].maxAP;
    bombPlacedThisTurn = false;

    manualScreen.classList.remove('active');
    gameScreen.classList.add('active');
    gameOverModal.classList.add('hidden');

    updateUI();
    renderBoard();
    logAction("Game Started! Player 1's turn.");
}

// Rendering
function renderBoard() {
    boardElement.innerHTML = '';

    // Draw Walls
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            if (board[y][x]) {
                const el = document.createElement('div');
                el.classList.add('entity');
                el.style.left = `${x * CELL_SIZE}px`;
                el.style.top = `${y * CELL_SIZE}px`;
                if (board[y][x].type === 'solid') {
                    el.classList.add('solid-wall');
                } else if (board[y][x].type === 'breakable') {
                    el.classList.add('break-wall');
                }
                boardElement.appendChild(el);
            }
        }
    }

    // Draw Items
    items.forEach(item => {
        const el = document.createElement('div');
        el.classList.add('entity', 'item');
        el.style.left = `${item.x * CELL_SIZE}px`;
        el.style.top = `${item.y * CELL_SIZE}px`;
        if (item.buff === 'fire') el.innerText = '🧨';
        if (item.buff === 'bomb') el.innerText = '➕';
        if (item.buff === 'speed') el.innerText = '👟';
        boardElement.appendChild(el);
    });

    // Draw Bombs
    bombs.forEach(bomb => {
        const el = document.createElement('div');
        el.classList.add('entity', 'bomb');
        el.style.left = `${bomb.x * CELL_SIZE}px`;
        el.style.top = `${bomb.y * CELL_SIZE}px`;
        
        const txt = document.createElement('span');
        txt.classList.add('bomb-text');
        txt.innerText = bomb.timer;
        el.appendChild(txt);
        
        boardElement.appendChild(el);
    });

    // Draw Players
    players.forEach(p => {
        const el = document.createElement('div');
        el.classList.add('entity', 'player', p.color);
        if (p.hp <= 0) el.classList.add('dead');
        el.style.left = `${p.x * CELL_SIZE}px`;
        el.style.top = `${p.y * CELL_SIZE}px`;
        
        // Render character sprite
        el.style.backgroundImage = `url('${p.sprite}')`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.backgroundColor = 'transparent'; // Override default solid color
        el.style.border = `4px solid var(--${p.color}-color)`; // Keep the colored border to identify player
        el.style.borderRadius = '5px'; // slightly square for characters
        el.style.boxShadow = 'none';
        
        boardElement.appendChild(el);
    });
}

function updateUI() {
    for (let i = 0; i < totalPlayers; i++) {
        let pIndex = i + 1; // 1-indexed for HTML IDs
        document.getElementById(`p${pIndex}-hp`).innerText = `HP: ${'❤️'.repeat(players[i].hp)}${'🖤'.repeat(2 - players[i].hp)}`;
        document.getElementById(`p${pIndex}-ap`).innerText = currentPlayerIndex === i ? currentAP : 0;
        document.getElementById(`p${pIndex}-maxap`).innerText = players[i].maxAP;
        document.getElementById(`p${pIndex}-fire`).innerText = players[i].fireRange;
        document.getElementById(`p${pIndex}-bombs`).innerText = players[i].bombsActive;
        document.getElementById(`p${pIndex}-maxbombs`).innerText = players[i].maxBombs;
        document.getElementById(`p${pIndex}-speed`).innerText = players[i].maxAP;

        const turnIndicator = document.getElementById(`p${pIndex}-turn-indicator`);
        if (currentPlayerIndex === i) {
            turnIndicator.classList.remove('hidden');
        } else {
            turnIndicator.classList.add('hidden');
        }
    }
}

// Logic functions
function endTurn() {
    if (gameOver) return;

    let p = players[currentPlayerIndex];

    // Decrement bomb timers for the current player's bombs
    bombs.forEach(bomb => {
        if (bomb.ownerId === p.id) {
            bomb.timer--;
        }
    });

    triggerExplosions();

    if (checkGameOver()) return;

    // Move to next alive player
    do {
        currentPlayerIndex = (currentPlayerIndex + 1) % totalPlayers;
    } while (players[currentPlayerIndex].hp <= 0);

    currentAP = players[currentPlayerIndex].maxAP;
    bombPlacedThisTurn = false;

    updateUI();
    renderBoard();
    logAction(`${players[currentPlayerIndex].name}'s Turn`);
}

function triggerExplosions() {
    let explodedBombs = [];
    let explodingThisFrame = [];

    // Find bombs that should explode
    bombs.forEach(b => {
        if (b.timer <= 0 && !b.exploded) {
            explodingThisFrame.push(b);
        }
    });

    while (explodingThisFrame.length > 0) {
        let b = explodingThisFrame.pop();
        b.exploded = true;
        explodedBombs.push(b);
        
        let owner = players.find(p => p.id === b.ownerId);
        if (owner) owner.bombsActive--;

        // Calculate explosion tiles
        let tilesToDamage = [{x: b.x, y: b.y, center: true}];
        
        const dirs = [[0,-1], [0,1], [-1,0], [1,0]];
        dirs.forEach(d => {
            for (let r = 1; r <= b.range; r++) {
                let nx = b.x + d[0] * r;
                let ny = b.y + d[1] * r;
                if (nx < 0 || nx >= WIDTH || ny < 0 || ny >= HEIGHT) break;
                
                // Add tile to damage
                tilesToDamage.push({x: nx, y: ny, center: false});
                
                // Stop fire if it hits a wall
                if (board[ny][nx] && board[ny][nx].type === 'solid') break;
                if (board[ny][nx] && board[ny][nx].type === 'breakable') break; // Fire stops after breaking one wall
            }
        });

        // Apply Damage and draw explosion
        tilesToDamage.forEach(tile => {
            drawExplosion(tile.x, tile.y);
            
            // Damage Walls
            if (board[tile.y][tile.x]) {
                if (board[tile.y][tile.x].type === 'breakable') {
                    board[tile.y][tile.x] = null;
                    // Spawn item 30% chance
                    if (Math.random() < 0.3) {
                        const buffTypes = ['fire', 'bomb', 'speed'];
                        items.push({
                            x: tile.x, 
                            y: tile.y, 
                            buff: buffTypes[Math.floor(Math.random() * buffTypes.length)]
                        });
                    }
                }
            }

            // Damage Items
            items = items.filter(i => !(i.x === tile.x && i.y === tile.y));

            // Damage Players
            players.forEach(p => {
                if (p.hp > 0 && p.x === tile.x && p.y === tile.y) {
                    if (tile.center) {
                        p.hp = 0; // Instant kill at center
                        logAction(`${p.name} was instantly killed by a bomb!`);
                    } else {
                        p.hp--;
                        logAction(`${p.name} hit by explosion! HP left: ${p.hp}`);
                    }
                }
            });

            // Chain Reaction
            bombs.forEach(otherBomb => {
                if (!otherBomb.exploded && otherBomb.x === tile.x && otherBomb.y === tile.y) {
                    otherBomb.timer = 0; // Trigger instantly
                    explodingThisFrame.push(otherBomb);
                }
            });
        });
    }

    // Remove exploded bombs from array
    bombs = bombs.filter(b => !b.exploded);
}

function drawExplosion(x, y) {
    const el = document.createElement('div');
    el.classList.add('entity', 'explosion');
    el.style.left = `${x * CELL_SIZE}px`;
    el.style.top = `${y * CELL_SIZE}px`;
    boardElement.appendChild(el);
    setTimeout(() => {
        if(boardElement.contains(el)) el.remove();
    }, 300);
}

function checkGameOver() {
    let alive = players.filter(p => p.hp > 0);
    if (alive.length === 0) {
        gameOver = true;
        winnerText.innerText = "DRAW! EVERYBODY DIED.";
        gameOverModal.classList.remove('hidden');
        return true;
    } else if (alive.length === 1) {
        gameOver = true;
        winnerText.innerText = `${alive[0].name.toUpperCase()} WINS!`;
        gameOverModal.classList.remove('hidden');
        return true;
    }
    return false;
}

function movePlayer(dx, dy) {
    if (gameOver) return;
    let p = players[currentPlayerIndex];
    let nx = p.x + dx;
    let ny = p.y + dy;

    if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && !board[ny][nx]) {
        // Can move
        p.x = nx;
        p.y = ny;
        currentAP--;
        
        // Pick up items
        let itemIndex = items.findIndex(i => i.x === p.x && i.y === p.y);
        if (itemIndex > -1) {
            let item = items[itemIndex];
            if (item.buff === 'fire') { p.fireRange++; logAction(`${p.name} picked up Fire Up!`); }
            if (item.buff === 'bomb') { p.maxBombs++; logAction(`${p.name} picked up Bomb Up!`); }
            if (item.buff === 'speed') { p.maxAP++; logAction(`${p.name} picked up Speed Up!`); }
            items.splice(itemIndex, 1);
        }

        updateUI();
        renderBoard();

        if (currentAP <= 0) {
            endTurn();
        }
    } else {
        logAction("Path blocked!");
    }
}

function placeBomb() {
    if (gameOver) return;
    let p = players[currentPlayerIndex];
    
    // Check if already placed a bomb this turn
    if (bombPlacedThisTurn) {
        logAction("You can only place ONE bomb per turn!");
        return;
    }

    // Check if reached max bombs
    if (p.bombsActive >= p.maxBombs) {
        logAction("Max bombs reached!");
        return;
    }

    // Check if there's already a bomb here
    if (bombs.find(b => b.x === p.x && b.y === p.y)) {
        logAction("There is already a bomb here!");
        return;
    }

    bombs.push({
        x: p.x,
        y: p.y,
        timer: BOMB_LIFESPAN,
        range: p.fireRange,
        ownerId: p.id,
        exploded: false
    });

    p.bombsActive++;
    bombPlacedThisTurn = true;
    logAction(`${p.name} placed a bomb!`);
    
    updateUI();
    renderBoard();
}

// Input Handling
function handleInput(playerIdx, action) {
    if (gameOver || currentPlayerIndex !== playerIdx) return;
    
    if (action === 'up') movePlayer(0, -1);
    else if (action === 'down') movePlayer(0, 1);
    else if (action === 'left') movePlayer(-1, 0);
    else if (action === 'right') movePlayer(1, 0);
    else if (action === 'bomb') placeBomb();
    else if (action === 'skip') { currentAP = 0; endTurn(); }
}

function flashButton(btnId) {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 150);
    }
}

// Keyboard Mapping
const keyMap = {
    // P1
    'w': { p: 0, act: 'up', btn: 'btn-p1-w' },
    's': { p: 0, act: 'down', btn: 'btn-p1-s' },
    'a': { p: 0, act: 'left', btn: 'btn-p1-a' },
    'd': { p: 0, act: 'right', btn: 'btn-p1-d' },
    'b': { p: 0, act: 'bomb', btn: 'btn-p1-b' },
    'v': { p: 0, act: 'skip', btn: 'btn-p1-v' },
    // P2
    'ArrowUp': { p: 1, act: 'up', btn: 'btn-p2-up' },
    'ArrowDown': { p: 1, act: 'down', btn: 'btn-p2-down' },
    'ArrowLeft': { p: 1, act: 'left', btn: 'btn-p2-left' },
    'ArrowRight': { p: 1, act: 'right', btn: 'btn-p2-right' },
    'Enter': { p: 1, act: 'bomb', btn: 'btn-p2-enter' },
    'Shift': { p: 1, act: 'skip', btn: 'btn-p2-shift' },
    // P3
    'i': { p: 2, act: 'up', btn: 'btn-p3-up' },
    'k': { p: 2, act: 'down', btn: 'btn-p3-down' },
    'j': { p: 2, act: 'left', btn: 'btn-p3-left' },
    'l': { p: 2, act: 'right', btn: 'btn-p3-right' },
    'm': { p: 2, act: 'bomb', btn: 'btn-p3-bomb' },
    'n': { p: 2, act: 'skip', btn: 'btn-p3-skip' },
    // P4
    't': { p: 3, act: 'up', btn: 'btn-p4-up' },
    'g': { p: 3, act: 'down', btn: 'btn-p4-down' },
    'f': { p: 3, act: 'left', btn: 'btn-p4-left' },
    'h': { p: 3, act: 'right', btn: 'btn-p4-right' },
    'y': { p: 3, act: 'bomb', btn: 'btn-p4-bomb' },
    'u': { p: 3, act: 'skip', btn: 'btn-p4-skip' }
};

window.addEventListener('keydown', (e) => {
    if(!gameOverModal.classList.contains('hidden') || manualScreen.classList.contains('active')) return;

    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    const key = e.key;
    const lowerKey = key.length === 1 ? key.toLowerCase() : key;
    
    if (keyMap[lowerKey] || keyMap[key]) {
        const mapping = keyMap[lowerKey] || keyMap[key];
        // Ensure player is active
        if (mapping.p < totalPlayers) {
            flashButton(mapping.btn);
            handleInput(mapping.p, mapping.act);
        }
    }
});

// UI Button Clicks
const btnMap = {
    // P1
    'btn-p1-w': { p: 0, act: 'up' }, 'btn-p1-s': { p: 0, act: 'down' },
    'btn-p1-a': { p: 0, act: 'left' }, 'btn-p1-d': { p: 0, act: 'right' },
    'btn-p1-b': { p: 0, act: 'bomb' }, 'btn-p1-v': { p: 0, act: 'skip' },
    // P2
    'btn-p2-up': { p: 1, act: 'up' }, 'btn-p2-down': { p: 1, act: 'down' },
    'btn-p2-left': { p: 1, act: 'left' }, 'btn-p2-right': { p: 1, act: 'right' },
    'btn-p2-enter': { p: 1, act: 'bomb' }, 'btn-p2-shift': { p: 1, act: 'skip' },
    // P3
    'btn-p3-up': { p: 2, act: 'up' }, 'btn-p3-down': { p: 2, act: 'down' },
    'btn-p3-left': { p: 2, act: 'left' }, 'btn-p3-right': { p: 2, act: 'right' },
    'btn-p3-bomb': { p: 2, act: 'bomb' }, 'btn-p3-skip': { p: 2, act: 'skip' },
    // P4
    'btn-p4-up': { p: 3, act: 'up' }, 'btn-p4-down': { p: 3, act: 'down' },
    'btn-p4-left': { p: 3, act: 'left' }, 'btn-p4-right': { p: 3, act: 'right' },
    'btn-p4-bomb': { p: 3, act: 'bomb' }, 'btn-p4-skip': { p: 3, act: 'skip' },
    // P5
    'btn-p5-up': { p: 4, act: 'up' }, 'btn-p5-down': { p: 4, act: 'down' },
    'btn-p5-left': { p: 4, act: 'left' }, 'btn-p5-right': { p: 4, act: 'right' },
    'btn-p5-bomb': { p: 4, act: 'bomb' }, 'btn-p5-skip': { p: 4, act: 'skip' },
    // P6
    'btn-p6-up': { p: 5, act: 'up' }, 'btn-p6-down': { p: 5, act: 'down' },
    'btn-p6-left': { p: 5, act: 'left' }, 'btn-p6-right': { p: 5, act: 'right' },
    'btn-p6-bomb': { p: 5, act: 'bomb' }, 'btn-p6-skip': { p: 5, act: 'skip' }
};

Object.keys(btnMap).forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
        // Handle click
        btn.addEventListener('click', () => {
            // Only allow input if player is active
            if (btnMap[btnId].p < totalPlayers) {
                flashButton(btnId);
                handleInput(btnMap[btnId].p, btnMap[btnId].act);
            }
        });
        
        // Handle touch for mobile
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            if (btnMap[btnId].p < totalPlayers) {
                flashButton(btnId);
                handleInput(btnMap[btnId].p, btnMap[btnId].act);
            }
        });
    }
});

startBtn.addEventListener('click', () => {
    initGame();
    window.focus();
});
restartBtn.addEventListener('click', () => {
    initGame();
    window.focus();
});
