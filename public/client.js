/*
 * Transport Tycoon Basic - Multiplayer Client
 * Connects to the Socket.IO server and renders the shared game state.
 */

const socket = io();

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
const train = {
  x: -1,
  y: 10,
  speed: 0.1,
  progress: 0,
  active: false,
};

// Draw grid and train
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw each cell
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.strokeStyle = '#ddd';
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      if (grid[y] && grid[y][x] === 1) {
        // track cell
        ctx.fillStyle = '#444';
        ctx.fillRect(
          x * cellSize + cellSize * 0.25,
          y * cellSize + cellSize * 0.45,
          cellSize * 0.5,
          cellSize * 0.1
        );
      }
    }
  }

  // Draw train if active
  if (train.active) {
    ctx.fillStyle = 'red';
    const tx = (train.x + train.progress) * cellSize + cellSize / 2;
    const ty = train.y * cellSize + cellSize / 2;
    ctx.beginPath();
    ctx.arc(tx, ty, cellSize * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
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
  Object.assign(train, state.train);
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
socket.on('state', ({ train: serverTrain }) => {
  Object.assign(train, serverTrain);
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
