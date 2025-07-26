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
// grid[y][x] == 1 indicates track present
const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
let money = 0;

// Simple industries at fixed positions
const industries = [
  { x: 2, y: 2, type: 'Mine' },
  { x: 17, y: 17, type: 'Factory' },
];

// Default game settings shared with clients
const settings = {
  trainSpeed: 0.1,
};

// Map of socket.id -> player name
const players = new Map();

// All active trains
const trains = [];

/**
 * Spawn a new train starting on the first track tile in row 10.
 * Returns the created train or null if no starting track.
 */
function spawnTrain() {
  if (grid[10][0] !== 1) return null;
  const train = {
    x: 0,
    y: 10,
    dx: 1,
    dy: 0,
    speed: settings.trainSpeed,
    progress: 0,
    active: true,
  };
  trains.push(train);
  return train;
}

// Determine track connections around a cell
function getConnections(x, y) {
  const c = { n: false, e: false, s: false, w: false };
  if (!grid[y][x]) return c;
  if (y > 0 && grid[y - 1][x]) c.n = true;
  if (x < cols - 1 && grid[y][x + 1]) c.e = true;
  if (y < rows - 1 && grid[y + 1][x]) c.s = true;
  if (x > 0 && grid[y][x - 1]) c.w = true;
  return c;
}

// Move a train one tile according to the track layout
function moveTrain(train) {
  if (!train.active) return;
  train.progress += train.speed;
  if (train.progress < 1) return;

  const nx = train.x + train.dx;
  const ny = train.y + train.dy;
  if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] === 1) {
    train.x = nx;
    train.y = ny;
    train.progress = 0;
    return;
  }

  const con = getConnections(train.x, train.y);
  const opts = [];
  if (con.n && train.dy !== 1) opts.push({ dx: 0, dy: -1 });
  if (con.e && train.dx !== -1) opts.push({ dx: 1, dy: 0 });
  if (con.s && train.dy !== -1) opts.push({ dx: 0, dy: 1 });
  if (con.w && train.dx !== 1) opts.push({ dx: -1, dy: 0 });

  if (opts.length) {
    const o = opts[0];
    train.dx = o.dx;
    train.dy = o.dy;
    train.x += train.dx;
    train.y += train.dy;
    train.progress = 0;
  } else {
    train.active = false;
  }
}

// When clients connect, register player and send current state
io.on('connection', (socket) => {
  socket.on('register', (name) => {
    players.set(socket.id, name || 'Anonymous');
    io.emit('playerList', Array.from(players.values()));
  });

  socket.emit('init', { grid, money, trains, industries, settings });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    io.emit('playerList', Array.from(players.values()));
  });

  // Toggle a track tile and broadcast the new grid
  socket.on('toggleTrack', ({ x, y }) => {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      grid[y][x] = grid[y][x] === 1 ? 0 : 1;
      io.emit('updateGrid', grid);
    }
  });

  // Request to spawn a new train
  socket.on('startTrain', () => {
    const train = spawnTrain();
    if (train) {
      io.emit('trainSpawn', train);
    }
  });
});

// Update all trains and reward deliveries
function updateTrains() {
  trains.forEach((t) => moveTrain(t));
  for (let i = trains.length - 1; i >= 0; i--) {
    if (!trains[i].active) {
      money += 100;
      io.emit('moneyUpdate', money);
      trains.splice(i, 1);
    }
  }
}

// Game loop running on the server
setInterval(() => {
  updateTrains();
  io.emit('state', { trains });
}, 1000 / 60);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
