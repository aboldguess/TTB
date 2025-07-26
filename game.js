/*
 * Transport Tycoon Basic
 * A very small demo inspired by Transport Tycoon Deluxe.
 * This example allows the user to build a simple horizontal railway
 * and run a train that generates money whenever it completes a trip
 * from the left side of the map to the right side.
 */

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Grid configuration
const rows = 20;
const cols = 20;
const cellSize = canvas.width / cols; // assumes square canvas

// Store the track layout. 0 = empty, 1 = track
const grid = [];
for (let y = 0; y < rows; y++) {
    grid[y] = new Array(cols).fill(0);
}

// Player money
let money = 0;

// Train object. Starts off the map to the left.
const train = {
    x: -1,       // column position
    y: 10,       // row position (middle of map)
    speed: 0.1,  // cells per frame
    progress: 0, // progress inside the current cell
    active: false
};

// Draw grid and train
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each cell
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.strokeStyle = '#ddd';
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            if (grid[y][x] === 1) {
                // track cell
                ctx.fillStyle = '#444';
                ctx.fillRect(x * cellSize + cellSize * 0.25,
                             y * cellSize + cellSize * 0.45,
                             cellSize * 0.5,
                             cellSize * 0.1);
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

// Update train position
function updateTrain() {
    if (!train.active) return;

    train.progress += train.speed;
    if (train.progress >= 1) {
        train.x += 1;
        train.progress = 0;
        // Check if track continues
        if (train.x >= cols || grid[train.y][train.x] !== 1) {
            // End of line reached
            train.active = false;
            train.x = -1;
            money += 100; // reward for successful delivery
            document.getElementById('money').textContent = `Money: $${money}`;
        }
    }
}

// Main game loop
function loop() {
    updateTrain();
    draw();
    requestAnimationFrame(loop);
}

// Start animation loop
requestAnimationFrame(loop);

// Toggle track placement on click
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (x >= 0 && x < cols && y >= 0 && y < rows) {
        // Place or remove track
        grid[y][x] = grid[y][x] === 1 ? 0 : 1;
        draw();
    }
});

// Start train when user presses the space bar
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !train.active) {
        // Only start if the first cell has track
        if (grid[train.y][0] === 1) {
            train.active = true;
            train.x = 0;
            train.progress = 0;
        }
    }
});
