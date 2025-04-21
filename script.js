const board = document.getElementById("board");
const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const targetScoreDisplay = document.getElementById("target-score");
const movesDisplay = document.getElementById("moves");
const statusDisplay = document.getElementById("status");

const gridSize = 8;
let tiles = [];
let score = 0;
let movesRemaining = 30;
let level = 1;
const colors = ["rgba(255, 0, 0, 0.5)", "rgba(0, 255, 0, 0.5)", "rgba(0, 0, 255, 0.5)", "rgba(255, 255, 0, 0.5)", "rgba(255, 0, 255, 0.5)"];
const levelTargets = [50, 55, 60, 65, 70];

let selectedTile = null;

function createBoard() {
    tiles = [];
    board.innerHTML = "";
    score = 0;
    movesRemaining = 30;
    scoreDisplay.textContent = score;
    movesDisplay.textContent = movesRemaining;
    targetScoreDisplay.textContent = levelTargets[level - 1];

    for (let i = 0; i < gridSize * gridSize; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.dataset.type = Math.floor(Math.random() * colors.length);
        tile.style.backgroundColor = colors[tile.dataset.type];
        tile.draggable = true;
        tile.addEventListener("dragstart", (event) => dragStart(event, i));
        tile.addEventListener("dragover", (event) => event.preventDefault());
        tile.addEventListener("drop", (event) => dragDrop(event, i));
        tiles.push(tile);
        board.appendChild(tile);
    }
}

function dragStart(event, index) {
    selectedTile = index;
}

function dragDrop(event, targetIndex) {
    if (isNeighbor(selectedTile, targetIndex)) {
        swapTiles(selectedTile, targetIndex);
        checkMatches();
        movesRemaining--;
        updateScore();
        updateStatus();
    }
}

function isNeighbor(index1, index2) {
    const row1 = Math.floor(index1 / gridSize);
    const col1 = index1 % gridSize;
    const row2 = Math.floor(index2 / gridSize);
    const col2 = index2 % gridSize;

    return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
}

function swapTiles(index1, index2) {
    [tiles[index1].dataset.type, tiles[index2].dataset.type] = [tiles[index2].dataset.type, tiles[index1].dataset.type];
    [tiles[index1].style.backgroundColor, tiles[index2].style.backgroundColor] = [tiles[index2].style.backgroundColor, tiles[index1].style.backgroundColor];
}

function checkMatches() {
    for (let i = 0; i < tiles.length; i++) {
        const type = tiles[i].dataset.type;

        const horizontalMatches = findMatches(i, type, "horizontal");
        const verticalMatches = findMatches(i, type, "vertical");

        if (horizontalMatches.length >= 3 || verticalMatches.length >= 3) {
            const matches = horizontalMatches.concat(verticalMatches);
            matches.forEach(index => {
                createSparkleEffect(tiles[index]);
                tiles[index].classList.add("matched");
                setTimeout(() => {
                    tiles[index].style.backgroundColor = "transparent";
                }, 1000);
            });
        }
    }
}

function createSparkleEffect(tile) {
    for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement("div");
        sparkle.classList.add("sparkle");
        sparkle.style.left = `${Math.random() * 30 + 10}px`;
        sparkle.style.top = `${Math.random() * 30 + 10}px`;
        tile.appendChild(sparkle);
        setTimeout(() => { sparkle.remove(); }, 500);
    }
}

function updateScore() {
    score += 10;
    scoreDisplay.textContent = score;
}

function updateStatus() {
    movesDisplay.textContent = movesRemaining;
    if (score >= levelTargets[level - 1]) {
        statusDisplay.textContent = `Level ${level} Complete!`;
        setTimeout(nextLevel, 7000);
    }
}

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

createBoard();
