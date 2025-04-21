// Get DOM elements
const board = document.getElementById("board");
const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const targetScoreDisplay = document.getElementById("target-score");
const statusDisplay = document.getElementById("status");
const countdownContainer = document.getElementById("countdown-container");
const countdownDisplay = document.getElementById("countdown");

// Game settings
const gridSize = 5;
let tiles = [];
let score = 0;
let level = 1;
const totalLevels = 5;
const colors = ["red", "blue", "green", "yellow", "purple"];
// Level targets: Level 1 = 50, and each level increases by 5 points.
const levelTargets = [50, 55, 60, 65, 70];

let selectedTile = null; // The tile index being dragged

// Create the board
function createBoard() {
  tiles = [];
  board.innerHTML = "";
  // Reset score for this level
  score = 0;
  scoreDisplay.textContent = score;
  targetScoreDisplay.textContent = levelTargets[level - 1];
  statusDisplay.textContent = "";

  // Create gridSize x gridSize board
  for (let i = 0; i < gridSize * gridSize; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    // Random color type (an index into the colors array)
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

// Drag start handler
function dragStart(event, index) {
  selectedTile = index;
}

// Drag drop handler – swaps with neighbor if valid
function dragDrop(event, targetIndex) {
  if (isNeighbor(selectedTile, targetIndex)) {
    swapTiles(selectedTile, targetIndex);
    // Check for matches after swap
    if (checkMatches()) {
      // Allow animations to complete, then apply gravity
      setTimeout(applyGravity, 1100);
    }
    updateScoreDisplay();
    updateLevelStatus();
  }
}

// Verify if two tile indices are neighbors (adjacent horizontally or vertically)
function isNeighbor(index1, index2) {
  const row1 = Math.floor(index1 / gridSize);
  const col1 = index1 % gridSize;
  const row2 = Math.floor(index2 / gridSize);
  const col2 = index2 % gridSize;
  return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
}

// Swap two tiles (by swapping their type and displayed background)
function swapTiles(index1, index2) {
  [tiles[index1].dataset.type, tiles[index2].dataset.type] =
    [tiles[index2].dataset.type, tiles[index1].dataset.type];
  [tiles[index1].style.backgroundColor, tiles[index2].style.backgroundColor] =
    [tiles[index2].style.backgroundColor, tiles[index1].style.backgroundColor];
}

// Check for horizontal and vertical matches (3 or more contiguous tiles)
function checkMatches() {
  let matchFound = false;
  for (let i = 0; i < tiles.length; i++) {
    const type = tiles[i].dataset.type;
    if (type === "") continue; // Skip empty tiles
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

// Find contiguous matching tiles in one direction
function findMatches(index, type, direction) {
  let matches = [index];
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  if (direction === "horizontal") {
    // Check left
    for (let c = col - 1; c >= 0; c--) {
      const idx = row * gridSize + c;
      if (tiles[idx].dataset.type === type) matches.push(idx);
      else break;
    }
    // Check right
    for (let c = col + 1; c < gridSize; c++) {
      const idx = row * gridSize + c;
      if (tiles[idx].dataset.type === type) matches.push(idx);
      else break;
    }
  } else if (direction === "vertical") {
    // Check up
    for (let r = row - 1; r >= 0; r--) {
      const idx = r * gridSize + col;
      if (tiles[idx].dataset.type === type) matches.push(idx);
      else break;
    }
    // Check down
    for (let r = row + 1; r < gridSize; r++) {
      const idx = r * gridSize + col;
      if (tiles[idx].dataset.type === type) matches.push(idx);
      else break;
    }
  }
  return matches;
}

// Mark a tile as matched: add sparkle effect, trigger fade-out, and update score.
function markTileMatched(index) {
  const tile = tiles[index];
  if (!tile.classList.contains("matched")) {
    createSparkleEffect(tile);
    tile.classList.add("matched");
    score += 10; // Each matched tile gives 10 points.
    setTimeout(() => {
      tile.dataset.type = "";
      tile.style.backgroundColor = "transparent";
    }, 1000);
  }
}

// Create a sparkle effect on a tile
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

// Apply gravity: Let tiles fall down into empty spaces; generate new tiles at the top.
function applyGravity() {
  let moved = false;
  for (let col = 0; col < gridSize; col++) {
    for (let row = gridSize - 1; row > 0; row--) {
      const index = row * gridSize + col;
      if (tiles[index].dataset.type === "") {
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
    // For the top row, if empty, generate a new random tile.
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
    // After gravity, check for cascaded matches.
    if (checkMatches()) {
      setTimeout(applyGravity, 1100);
    }
  }
}

// Update the on-screen score.
function updateScoreDisplay() {
  scoreDisplay.textContent = score;
}

// Check if the current level’s target score has been reached.
function updateLevelStatus() {
  if (score >= levelTargets[level - 1]) {
    statusDisplay.textContent = `Level ${level} Complete!`;
    board.innerHTML = "";  // Clear the board visually.
    showCountdownAndNextLevel();
  }
}

// Show a 7-second countdown until the next level.
function showCountdownAndNextLevel() {
  let countdown = 7;
  countdownContainer.style.display = "block";
  countdownDisplay.textContent = countdown;
  const interval = setInterval(() => {
    countdown--;
    countdownDisplay.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(interval);
      countdownContainer.style.display = "none";
      nextLevel();
    }
  }, 1000);
}

// Advance to the next level; if all levels are complete, end the game.
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

// Start the game
createBoard();
