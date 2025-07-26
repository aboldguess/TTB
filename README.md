# Transport Tycoon Basic - Multiplayer Edition

This project is a tiny demo inspired by **Transport Tycoon Deluxe**. It now
supports multiple players connecting through a simple Socket.IO server. Players
share the same map and can place track tiles together in real time.

## Requirements

- [Node.js](https://nodejs.org/) 18+ installed on your system.

## Quick setup

1. Clone or download this repository.
2. Run the provided setup script:

   ```bash
   ./setup.sh
   ```

   The script installs all required Node.js packages.
3. Start the server:

   ```bash
   npm start
   ```

4. Open <http://localhost:3000> in any modern web browser. Open multiple
   browser windows or share the URL with friends on the same network to play
together.

## Game controls

- **Click** on a grid cell to place or remove a track tile.
- Press **Space** to start the train once the first cell has track.
- The train generates $100 every time it reaches the end of the line.

## Project structure

- `server.js` – Node.js server running Express and Socket.IO.
- `public/` – Frontend files served to the browser.
  - `index.html` – Game page.
  - `client.js` – Client-side logic and Socket.IO connection.
  - `style.css` – Basic styling.
- `setup.sh` – Helper script that installs dependencies.
- `package.json` – Node package definitions.

## Notes

This example aims to be intentionally small and easy to understand.
It does not handle advanced game logic, persistence or security and should be
considered a prototype.
