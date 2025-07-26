# Transport Tycoon Basic - Multiplayer Edition

This project is a tiny demo inspired by **Transport Tycoon Deluxe**. It now
supports multiple players connecting through a simple Socket.IO server. Players
share the same map, build tracks with proper orientations and spawn trains that
travel along them. A couple of demo industries are shown on the grid.

## Requirements

- [Node.js](https://nodejs.org/) 18+ installed on your system.

## Quick setup

1. Clone or download this repository.
2. Run the provided setup script:

   ```bash
   ./setup.sh
   ```

   The script installs all required Node.js packages.
   If you are on **Windows**, open a terminal that can run shell scripts, such
   as **Git Bash** or **WSL**, and execute the command above. If you prefer using
   Command Prompt or PowerShell, run `npm install` manually instead of the
   script.
3. Start the server:

   ```bash
   npm start
   ```

4. Open <http://localhost:3000> in any modern web browser. Open multiple
   browser windows or share the URL with friends on the same network to play
together.

## Hosting on a Raspberry Pi

Use the provided `host.sh` script to quickly run the server on a Raspberry Pi.
Pass an optional port number to change the default (`3000`):

```bash
./host.sh 8080
```

If no port is supplied, the server listens on port 3000.

## Game controls

- **Click** on a grid cell to place or remove a track tile.
- Press **Space** to spawn a train on the existing track.
- Each train that reaches a dead end earns $100.
- Industries are displayed on the map and more than one player can join.

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
