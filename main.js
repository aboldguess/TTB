// Transport Tycoon Basic demo
// ---------------------------
// This file implements a very small browser game inspired by Transport Tycoon
// Deluxe. The objective is to connect the top-left tile of the grid to the
// bottom-right tile using roads. When a connection exists the bus will move
// along the found route.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Number of tiles along one side of the square map
const tileCount = 20;
// Pixel width/height of each tile. The canvas is a square so this is computed
// by dividing the canvas width once during initialisation.
const tileSize = canvas.width / tileCount;

// 2D array representing road placements. A value of 1 means a road is present
// while 0 means the tile is empty.
const grid = Array.from({ length: tileCount }, () => Array(tileCount).fill(0));
// Ensure start and end tiles are roads so a path can exist from the beginning.
grid[0][0] = 1;
grid[tileCount - 1][tileCount - 1] = 1;

// Simple bus object which holds the current path and index of the next step
const bus = {
  path: [],
  index: 0,
};

// Breadth-first search to discover a route through roads from (0,0) to the
// opposite corner. Returns an array of coordinate pairs. If no route exists an
// empty array is returned.
function findPath() {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const visited = Array.from({ length: tileCount }, () =>
    Array(tileCount).fill(false)
  );
  const queue = [[0, 0, []]]; // x, y and path so far
  visited[0][0] = true;

  while (queue.length) {
    const [x, y, path] = queue.shift();
    const newPath = path.concat([[x, y]]);

    if (x === tileCount - 1 && y === tileCount - 1) {
      // Destination reached
      return newPath;
    }

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < tileCount &&
        ny < tileCount &&
        !visited[nx][ny] &&
        grid[nx][ny]
      ) {
        visited[nx][ny] = true;
        queue.push([nx, ny, newPath]);
      }
    }
  }
  // No route found
  return [];
}

// Draw the grid, roads and bus on the canvas. This runs every animation frame.
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < tileCount; x++) {
    for (let y = 0; y < tileCount; y++) {
      // Draw grid outline
      ctx.strokeStyle = '#ccc';
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);

      if (grid[x][y]) {
        // Road tile
        ctx.fillStyle = '#888';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  // Draw the bus on top of the grid if a path is available
  if (bus.path.length) {
    const [bx, by] = bus.path[bus.index];
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(
      bx * tileSize + tileSize / 2,
      by * tileSize + tileSize / 2,
      tileSize / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Queue next frame
  requestAnimationFrame(draw);
}

// Advance the bus along its current path. Called on a fixed interval.
function updateBus() {
  if (bus.path.length) {
    bus.index = (bus.index + 1) % bus.path.length;
  }
}

// Click handler for building and removing roads. After a click the bus route is
// recalculated so it can immediately react to the new layout.
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tileSize);
  const y = Math.floor((e.clientY - rect.top) / tileSize);

  // Toggle road state
  grid[x][y] = grid[x][y] ? 0 : 1;
  bus.path = findPath();
  bus.index = 0;
});

// Initial route discovery and start the main loops
bus.path = findPath();
setInterval(updateBus, 500); // Move the bus twice every second
requestAnimationFrame(draw);
