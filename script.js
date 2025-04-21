// DOM element references
const board = document.getElementById("board");
const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const targetScoreDisplay = document.getElementById("target-score");
const statusDisplay = document.getElementById("status");

// Game settings and variables
const gridSize = 8;
let tiles = [];        // Holds tile DOM elements
let score = 0;
let level = 1;
const totalLevels = 5;
const colors = ["red", "blue", "green", "yellow", "purple"];
// Level targets: Level 1: 50; then increases by 5 per level
const levelTargets = [50, 55, 60, 65, 70];
let selectedTile = null;  // Index of the tile being dragged

// Create the game board
function createBoard() {
  tiles = [];
  board.innerHTML = "";
  score = 0;
  scoreDisplay.textContent = score;
  targetScoreDisplay.textContent = levelTargets[level - 1];
  statusDisplay.textContent = "";

  // Create an 8x8 grid
  for (let i = 0; i < gridSize * gridSize; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    // Randomly assign a color index
    const randIndex = Math.floor(Math.random() * colors.length);
    tile.dataset.type = randIndex;
    tile.style.backgroundColor = colors[randIndex];
    tile.draggable = true;
    // Drag events for swapping
    tile.addEventListener("dragstart", (event) => dragStart(event, i));
    tile.addEventListener("dragover", (event) => event.preventDefault());
    tile.addEventListener("drop", (event) => dragDrop(event, i));
    tiles.push(tile);
    board.appendChild(tile);
  }
}

// Save the starting tile index when dragging begins.
function dragStart(event, index) {
  selectedTile = index;
}

// When dropping on a tile, if it’s a neighbor, swap and check for matches.
function dragDrop(event, targetIndex) {
  if (isNeighbor(selectedTile, targetIndex)) {
    swapTiles(selectedTile, targetIndex);
    // Check for matches after the swap
    if (checkMatches()) {
      // Wait for animations to finish before applying gravity
      setTimeout(applyGravity, 1100);
    }
    updateScoreDisplay();
    updateLevelStatus();
  }
}

// Returns true if two tile indices are direct neighbors.
function isNeighbor(index1, index2) {
  const row1 = Math.floor(index1 / gridSize);
  const col1 = index1 % gridSize;
  const row2 = Math.floor(index2 / gridSize);
  const col2 = index2 % gridSize;
  return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
}

// Swap the "type" and the displayed background color between two tiles.
function swapTiles(index1, index2) {
  [tiles[index1].dataset.type, tiles[index2].dataset.type] =
    [tiles[index2].dataset.type, tiles[index1].dataset.type];
  [tiles[index1].style.backgroundColor, tiles[index2].style.backgroundColor] =
    [tiles[index2].style.backgroundColor, tiles[index1].style.backgroundColor];
}

// Check for horizontal and vertical matches across the board.
// Returns true if at least one match is found.
function checkMatches() {
  let matchFound = false;
  for (let i = 0; i < tiles.length; i++) {
    const type = tiles[i].dataset.type;
    if (type === "") continue; // Skip empty spaces
    const horizMatches = findMatches(i, type, "horizontal");
    const vertMatches = findMatches(i, type, "vertical");
    if (horizMatches.length >= 3) {
      horizMatches.forEach(idx => markTileMatched(idx));
      matchFound = true;
    }
    if (vertMatches.length >= 3) {
      vertMatches.forEach(idx => markTileMatched(idx));
      matchFound = true;
    }
  }
  return matchFound;
}

// Look for contiguous tiles that match in the given direction.
function findMatches(index, type, direction) {
  let matches = [index];
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  if (direction === "horizontal") {
    // Check left side
    for (let c = col - 1; c >= 0; c--) {
      const idx = row * gridSize + c;
      if (tiles[idx].dataset.type === type) matches.push(idx);
      else break;
    }
    // Check right side
    for (let c = col + 1; c < gridSize; c++) {
      const idx = row * gridSize + c;
      if (tiles[idx].dataset.type === type) matches.push(idx);
      else break;
    }
  } else if (direction === "vertical") {
    // Check upward
    for (let r = row - 1; r >= 0; r--) {
      const idx = r * gridSize + col;
      if (tiles[idx].dataset.type === type) matches.push(idx);
      else break;
    }
    // Check downward
    for (let r = row + 1; r < gridSize; r++) {
      const idx = r * gridSize + col;
      if (tiles[idx].dataset.type === type) matches.push(idx);
      else break;
    }
  }
  return matches;
}

// Mark a tile as matched by adding animations, sparkles, and updating the score.
function markTileMatched(index) {
  const tile = tiles[index];
  if (!tile.classList.contains("matched")) {
    createSparkleEffect(tile);
    tile.classList.add("matched");
    score += 10; // 10 points per tile
    // After the animation, clear the tile (set to empty/transparent)
    setTimeout(() => {
      tile.dataset.type = "";
      tile.style.backgroundColor = "transparent";
    }, 1000);
  }
}

// Create a sparkle effect inside a tile.
function createSparkleEffect(tile) {
  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("sparkle");
    sparkle.style.left = `${Math.random() * 30 + 10}px`;
    sparkle.style.top = `${Math.random() * 30 + 10}px`;
    tile.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 500);
  }
}

// Let the tiles "fall" (gravity): tiles above an empty space drop down,
// and empty spaces at the top are then filled with new random tiles.
function applyGravity() {
  let moved = false;
  for (let col = 0; col < gridSize; col++) {
    for (let row = gridSize - 1; row > 0; row--) {
      const index = row * gridSize + col;
      if (tiles[index].dataset.type === "") {
        // Look upward for a non-empty tile
        for (let r = row - 1; r >= 0; r--) {
          const aboveIdx = r * gridSize + col;
          if (tiles[aboveIdx].dataset.type !== "") {
            swapTiles(index, aboveIdx);
            moved = true;
            break;
          }
        }
      }
    }
    // If the top tile is empty, generate a new random tile.
    const topIndex = col;
    if (tiles[topIndex].dataset.type === "") {
      const randIndex = Math.floor(Math.random() * colors.length);
      tiles[topIndex].dataset.type = randIndex;
      tiles[topIndex].style.backgroundColor = colors[randIndex];
      tiles[topIndex].classList.remove("matched");
    }
  }
  if (moved) {
    setTimeout(applyGravity, 100);
  } else {
    // Check if new matches have cascaded.
    if (checkMatches()) {
      setTimeout(applyGravity, 1100);
    }
  }
}

// Update the score display.
function updateScoreDisplay() {
  scoreDisplay.textContent = score;
}

// Check if the level target has been reached. If so, clear the board and advance
// to the next level (after a 7‑second delay). Also, the score is reset for each level.
function updateLevelStatus() {
  if (score >= levelTargets[level - 1]) {
    statusDisplay.textContent = `Level ${level} Complete!`;
    board.innerHTML = "";  // Clear board visuals
    setTimeout(nextLevel, 7000);
  }
}

// Move to the next level. If all levels are finished, show a game-complete message.
function nextLevel() {
  level++;
  if (level > totalLevels) {
    statusDisplay.textContent = "You beat the game!";
    board.innerHTML = "";
  } else {
    levelDisplay.textContent = level;
    createBoard();
  }
}

// Initialize the game
createBoard();
