const numDotsInput = document.getElementById("numDots");
const speedDotsInput = document.getElementById("speedDots");
const sizeDotsInput = document.getElementById("sizeDots");
const toggleSizeInput = document.getElementById("toggleSize");
const skipIntervalInput = document.getElementById("skipInterval");

const toggleGameInput = document.getElementById("toggleGame");
const doubleJumpInput = document.getElementById("doubleJump");

const numDotsVal = document.getElementById("numDotsVal");
const speedDotsVal = document.getElementById("speedDotsVal");
const sizeDotsVal = document.getElementById("sizeDotsVal");
const skipIntervalVal = document.getElementById("skipIntervalVal");

const scoreDisplay = document.getElementById("scoreDisplay");
const circle = document.getElementById('circle');
const radius = circle.offsetWidth/2;
const circumference = Math.PI * radius * 2;

let score = 0
let totalDoubleJumps = 0
let numDots = 100;
let speedDots = 300;
let sizeDots = 10;
let toggleSize = false;
let skipInterval = 15000;

let doubleJumpOccured = false;
let doubleJumpDebounce = false;
let gameActive = false;
let dotLoopPromise = null;
const dotsArray = [];

numDotsInput.addEventListener("input", updateNumDots);
speedDotsInput.addEventListener("input", updateSpeedInput);
sizeDotsInput.addEventListener("input", updateSizeInput);
toggleSizeInput.addEventListener("input", toggleSizeClicked);
skipIntervalInput.addEventListener("input", updateSkipInterval);

toggleGameInput.addEventListener("click", toggleGameClicked);
doubleJumpInput.addEventListener("click", doubleJumpClicked);

function updateNumDots(event) {
    numDots = event.target.value;
    numDotsVal.innerHTML = numDots;
    gameActive = false;
    calculateDotSize();
    generateDots();
}

function updateSpeedInput(event) {
    speedDots = event.target.value;
    speedDotsVal.innerHTML = speedDots;
    gameActive = false;
}

function updateSizeInput(event) {
    sizeDots = event.target.value;
    sizeDotsVal.innerHTML = sizeDots;
    gameActive = false;
    generateDots();
}

function updateSkipInterval(event) {
    skipInterval = event.target.value * 1000;
    skipIntervalVal.innerHTML = event.target.value;
    gameActive = false;
}

function toggleSizeClicked(event) {
    toggleSize = event.target.checked;
    calculateDotSize();
    sizeDotsInput.disabled = toggleSize;
    gameActive = false;
    generateDots();
}

function calculateDotSize() {
    if (toggleSize) {
        sizeDots = Math.round(circumference/numDots);
        sizeDotsInput.value = sizeDots;
        sizeDotsVal.innerHTML = sizeDots;
    }
}

async function toggleGameClicked(event) {

    if (!gameActive && !dotLoopPromise) {
        gameActive = true;
        dotLoopPromise = startDotLoop();
        await dotLoopPromise;
        dotLoopPromise = null;
        score = 0;
        totalDoubleJumps = 0;
        updateScore();
    } else {
        gameActive = false;
    }
}

function doubleJumpClicked(event) {
    if (!gameActive) { return; }
    if (doubleJumpOccured) {
        score += 1;
        doubleJumpOccured = false; //so you cant click multiple times for the same bounce
    } else {
        score -= 1
    }
    updateScore();

}

function generateDots() {
    while (circle.firstChild) { circle.removeChild(circle.firstChild); }
    dotsArray.length = 0;

    for (let i = 0; i < numDots; i++) {
        const angle = 2 * Math.PI / numDots * i - Math.PI/2
        const dot = document.createElement('div');
        let x = radius * Math.cos(angle) + radius
        let y = radius * Math.sin(angle) + radius
        dot.style.left = x + "px";
        dot.style.top = y + "px";
        dot.style.width = sizeDots + "px";
        dot.style.height = sizeDots + "px";
        dot.classList.add('dot');
        circle.appendChild(dot);
        dotsArray.push(dot);
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateScore() {
    scoreDisplay.innerHTML = score + "/" + totalDoubleJumps;
}

async function startDotLoop() {
    const chance = 1/(skipInterval/speedDots)

    for (let i = 0; ; i = (i + 1) % dotsArray.length) {
        if (!gameActive) { return; }
        if (Math.random() < chance && !doubleJumpDebounce) {
            i = (i + 1) % dotsArray.length;
            doubleJumpDebounce = true;
            doubleJumpOccured = true;
            totalDoubleJumps += 1;

            setTimeout(function() {
                doubleJumpOccured = false;
                updateScore();
            }, 1000);

            setTimeout(function() {
                doubleJumpDebounce = false;
            }, 1250);
        }
        try {
            dotsArray[i].style.backgroundColor = "blue";
            dotsArray[i].style.zIndex = "1"
            await sleep(speedDots);
            dotsArray[i].style.backgroundColor = "red";
            dotsArray[i].style.zIndex = "auto"

        } catch (error) {
            console.log("error caught: dots were deleted before color could be changed/reset")
        }

    }
}

generateDots();