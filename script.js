// Get references to DOM elements
const board = document.getElementById("board");
const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const targetScoreDisplay = document.getElementById("target-score");
const movesDisplay = document.getElementById("moves");
const statusDisplay = document.getElementById("status");

// Game variables
const gridSize = 8;
let tiles = [];
let score = 0;
let movesRemaining = 30;
let level = 1;
const colors = ["red", "blue", "green", "yellow", "purple"];
const levelTargets = [50, 55, 60, 65, 70]; // Each level's target is 5 points higher

let selectedTile = null;

// Create the game board
function createBoard() {
  tiles = [];
  board.innerHTML = "";
  // Reset score and moves for the new level
  score = 0;
  movesRemaining = 30;
  scoreDisplay.textContent = score;
  movesDisplay.textContent = movesRemaining;
  targetScoreDisplay.textContent = levelTargets[level - 1];
  statusDisplay.textContent = "";

  // Create 8x8 grid tiles
  for (let i = 0; i < gridSize * gridSize; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    // Randomly assign a color (represented by an index)
    const randIndex = Math.floor(Math.random() * colors.length);
    tile.dataset.type = randIndex;
    tile.style.backgroundColor = colors[randIndex];
    tile.draggable = true;
    tile.addEventListener("dragstart", (event) => dragStart(event, i));
    tile.addEventListener("dragover", (event) => event.preventDefault());
    tile.addEventListener("drop", (event) => dragDrop(event, i));
    tiles.push(tile);
    board.appendChild(tile);
  }
}

// Handle drag start
function dragStart(event, index) {
  selectedTile = index;
}

// Handle drop event and attempt a swap with a neighbor
function dragDrop(event, targetIndex) {
  if (isNeighbor(selectedTile, targetIndex)) {
    swapTiles(selectedTile, targetIndex);
    // After swapping, check for matches (horizontal & vertical)
    checkMatches();
    movesRemaining--;
    movesDisplay.textContent = movesRemaining;
    updateScoreDisplay();
    updateStatus();
  }
}

// Check that two indices are directly adjacent (neighboring)
function isNeighbor(index1, index2) {
  const row1 = Math.floor(index1 / gridSize);
  const col1 = index1 % gridSize;
  const row2 = Math.floor(index2 / gridSize);
  const col2 = index2 % gridSize;
  return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
}

// Swap the content (color/type) of two tiles
function swapTiles(index1, index2) {
  [tiles[index1].dataset.type, tiles[index2].dataset.type] = [
    tiles[index2].dataset.type,
    tiles[index1].dataset.type,
  ];
  [tiles[index1].style.backgroundColor, tiles[index2].style.backgroundColor] = [
    tiles[index2].style.backgroundColor,
    tiles[index1].style.backgroundColor,
  ];
}

// Check entire grid for horizontal and vertical matches (3 or more contiguous tiles)
function checkMatches() {
  for (let i = 0; i < tiles.length; i++) {
    const type = tiles[i].dataset.type;
    if (type === "") continue; // Skip empty tiles
    let horizontalMatches = findMatches(i, type, "horizontal");
    let verticalMatches = findMatches(i, type, "vertical");

    if (horizontalMatches.length >= 3) {
      horizontalMatches.forEach((index) => markTileMatched(index));
    }
    if (verticalMatches.length >= 3) {
      verticalMatches.forEach((index) => markTileMatched(index));
    }
  }
}

// Given a direction, return an array of indices that match the given type
function findMatches(index, type, direction) {
  let matches = [index];
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;

  if (direction === "horizontal") {
    // Check left
    for (let c = col - 1; c >= 0; c--) {
      let idx = row * gridSize + c;
      if (tiles[idx].dataset.type === type) {
        matches.push(idx);
      } else {
        break;
      }
    }
    // Check right
    for (let c = col + 1; c < gridSize; c++) {
      let idx = row * gridSize + c;
      if (tiles[idx].dataset.type === type) {
        matches.push(idx);
      } else {
        break;
      }
    }
  } else if (direction === "vertical") {
    // Check up
    for (let r = row - 1; r >= 0; r--) {
      let idx = r * gridSize + col;
      if (tiles[idx].dataset.type === type) {
        matches.push(idx);
      } else {
        break;
      }
    }
    // Check down
    for (let r = row + 1; r < gridSize; r++) {
      let idx = r * gridSize + col;
      if (tiles[idx].dataset.type === type) {
        matches.push(idx);
      } else {
        break;
      }
    }
  }
  return matches;
}

// Mark the tile as matched by triggering the sparkle and fade-out effect.
// Also, add points for every tile that is matched.
function markTileMatched(index) {
  const tile = tiles[index];
  if (!tile.classList.contains("matched")) {
    createSparkleEffect(tile);
    tile.classList.add("matched");
    // After the fade-out animation, clear the tile (reveals the background)
    setTimeout(() => {
      tile.dataset.type = "";
      tile.style.backgroundColor = "transparent";
    }, 1000);
    // Increase score – here, each matched tile adds 10 points.
    score += 10;
  }
}

// Create multiple sparkles on a tile to add visual interest.
function createSparkleEffect(tile) {
  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("sparkle");
    sparkle.style.left = `${Math.random() * 30 + 10}px`;
    sparkle.style.top = `${Math.random() * 30 + 10}px`;
    tile.appendChild(sparkle);
    setTimeout(() => {
      sparkle.remove();
    }, 500);
  }
}

// Update the score display
function updateScoreDisplay() {
  scoreDisplay.textContent = score;
}

// Check if the level's target score has been reached.
// If so, remove all tiles, show a message, and after 7 seconds, advance to the next level.
function updateStatus() {
  if (score >= levelTargets[level - 1]) {
    statusDisplay.textContent = `Level ${level} Complete!`;
    board.innerHTML = "";
    setTimeout(nextLevel, 7000);
  }
}

// Advance to the next level. If level > 5, show a game-complete message.
function nextLevel() {
  level++;
  if (level > levelTargets.length) {
    statusDisplay.textContent = "You beat the game!";
    board.innerHTML = "";
  } else {
    levelDisplay.textContent = level;
    createBoard();
  }
}

// Start the game
createBoard();
