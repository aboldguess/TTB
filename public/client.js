/*
 * Transport Tycoon Basic - Multiplayer Client
 * Connects to the Socket.IO server and renders the shared game state.
 */

const socket = io();
// Ask the player for a name when they join
const playerName = prompt('Enter your name') || 'Anonymous';
socket.emit('register', playerName);

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Grid configuration
const rows = 20;
const cols = 20;
const cellSize = canvas.width / cols; // assumes square canvas

// Game state received from the server
const grid = [];
let money = 0;
const trains = [];
const industries = [];
let settings = {};

// Compute track connections for a cell
function getConnections(x, y) {
  const c = { n: false, e: false, s: false, w: false };
  if (!grid[y] || grid[y][x] !== 1) return c;
  if (y > 0 && grid[y - 1][x] === 1) c.n = true;
  if (x < cols - 1 && grid[y][x + 1] === 1) c.e = true;
  if (y < rows - 1 && grid[y + 1][x] === 1) c.s = true;
  if (x > 0 && grid[y][x - 1] === 1) c.w = true;
  return c;
}

// Draw grid, industries and trains
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw each cell and any track
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.strokeStyle = '#ddd';
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      if (grid[y] && grid[y][x] === 1) {
        const con = getConnections(x, y);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = cellSize * 0.1;
        ctx.beginPath();
        const cx = x * cellSize + cellSize / 2;
        const cy = y * cellSize + cellSize / 2;
        if (con.n) { ctx.moveTo(cx, cy); ctx.lineTo(cx, y * cellSize); }
        if (con.e) { ctx.moveTo(cx, cy); ctx.lineTo((x + 1) * cellSize, cy); }
        if (con.s) { ctx.moveTo(cx, cy); ctx.lineTo(cx, (y + 1) * cellSize); }
        if (con.w) { ctx.moveTo(cx, cy); ctx.lineTo(x * cellSize, cy); }
        ctx.stroke();
      }
    }
  }

  // Draw industries
  industries.forEach((ind) => {
    ctx.fillStyle = ind.type === 'Mine' ? '#964B00' : '#0066cc';
    ctx.fillRect(
      ind.x * cellSize + cellSize * 0.1,
      ind.y * cellSize + cellSize * 0.1,
      cellSize * 0.8,
      cellSize * 0.8
    );
  });

  // Draw all trains
  trains.forEach((t) => {
    if (!t.active) return;
    ctx.fillStyle = 'red';
    const tx = (t.x + t.progress) * cellSize + cellSize / 2;
    const ty = (t.y + 0.5) * cellSize;
    ctx.beginPath();
    ctx.arc(tx, ty, cellSize * 0.3, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Animation loop only draws; state comes from the server
function loop() {
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Handle initial state from the server
socket.on('init', (state) => {
  for (let y = 0; y < rows; y++) {
    grid[y] = state.grid[y].slice();
  }
  trains.length = 0;
  state.trains.forEach((t) => trains.push({ ...t }));
  industries.length = 0;
  state.industries.forEach((i) => industries.push(i));
  settings = state.settings;
  money = state.money;
  document.getElementById('money').textContent = `Money: $${money}`;
  draw();
});

// Grid updates from other players
socket.on('updateGrid', (serverGrid) => {
  for (let y = 0; y < rows; y++) {
    grid[y] = serverGrid[y].slice();
  }
});

// Train position updates
socket.on('state', ({ trains: serverTrains }) => {
  for (let i = 0; i < serverTrains.length; i++) {
    if (trains[i]) {
      Object.assign(trains[i], serverTrains[i]);
    } else {
      trains[i] = { ...serverTrains[i] };
    }
  }
  trains.length = serverTrains.length;
});

// A train spawned by another player
socket.on('trainSpawn', (train) => {
  trains.push(train);
});

// Update list of connected players
socket.on('playerList', (list) => {
  document.getElementById('players').textContent = `Players: ${list.join(', ')}`;
});

// Money updates
socket.on('moneyUpdate', (value) => {
  money = value;
  document.getElementById('money').textContent = `Money: $${money}`;
});

// Toggle track placement on click
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);
  socket.emit('toggleTrack', { x, y });
});

// Request to start the train with the space bar
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    socket.emit('startTrain');
  }
});
