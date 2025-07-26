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
// Each grid cell is either null or an object like { owner, color }
const grid = Array.from({ length: rows }, () => new Array(cols).fill(null));
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

// Predefined colours for players' tracks
const playerColours = ['#ff0000', '#0000ff', '#00aa00', '#aa00aa', '#ff8800'];

// Map of socket.id -> { name, colour }
const players = new Map();

// All active trains
const trains = [];

/**
 * Spawn a new train starting on the first track tile in row 10.
 * Returns the created train or null if no starting track.
 */
function spawnTrain() {
  // Starting cell must contain track to allow train spawning
  if (!grid[10][0]) return null;
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
  if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx]) {
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
    // Assign a colour to the player based on join order
    const colour = playerColours[players.size % playerColours.length];
    players.set(socket.id, { name: name || 'Anonymous', color: colour });
    io.emit('playerList', Array.from(players.values()).map((p) => p.name));
  });

  socket.emit('init', { grid, money, trains, industries, settings });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    io.emit('playerList', Array.from(players.values()).map((p) => p.name));
  });

  // Toggle a track tile and broadcast the new grid
  socket.on('toggleTrack', ({ x, y }) => {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      if (grid[y][x]) {
        // Remove existing track
        grid[y][x] = null;
      } else {
        // Add new track owned by the player
        const player = players.get(socket.id);
        grid[y][x] = { owner: socket.id, color: player ? player.color : '#444' };
      }
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
