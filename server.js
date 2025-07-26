const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the public directory
app.use(express.static('public'));

// Basic game state shared by all players
const rows = 20;
const cols = 20;
const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
let money = 0;

// Train starts off the map to the left
const train = {
  x: -1,
  y: 10,
  speed: 0.1,
  progress: 0,
  active: false,
};

// When clients connect, send them the current game state
io.on('connection', (socket) => {
  socket.emit('init', { grid, money, train });

  // Toggle a track tile and broadcast the new grid
  socket.on('toggleTrack', ({ x, y }) => {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      grid[y][x] = grid[y][x] === 1 ? 0 : 1;
      io.emit('updateGrid', grid);
    }
  });

  // Request to start the train
  socket.on('startTrain', () => {
    if (!train.active && grid[train.y][0] === 1) {
      train.active = true;
      train.x = 0;
      train.progress = 0;
    }
  });
});

// Update train position on the server
function updateTrain() {
  if (!train.active) return;
  train.progress += train.speed;
  if (train.progress >= 1) {
    train.x += 1;
    train.progress = 0;
    // Check if track continues
    if (train.x >= cols || grid[train.y][train.x] !== 1) {
      train.active = false;
      train.x = -1;
      money += 100; // reward for successful delivery
      io.emit('moneyUpdate', money);
    }
  }
}

// Game loop running on the server
setInterval(() => {
  updateTrain();
  io.emit('state', { train });
}, 1000 / 60);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
