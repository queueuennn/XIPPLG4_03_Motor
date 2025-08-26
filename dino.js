// Game Configuration
let soundEnabled = true;
let darkMode = false;

//board
let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

//dino
let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;

let dinoRun1 = new Image();
let dinoRun2 = new Image();
let dinoDead = new Image();

dinoRun1.src = "./img/frog_running_1.png";
dinoRun2.src = "./img/frog_running_2.png";
dinoDead.src = "./img/frog_dead.png"; // <- make sure this file exists

let dinoImg = dinoRun1; // start with first frame

let dino = {
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight
};

let frameCount = 0; // animation counter

//cactus
let cactusArray = [];

let cactus1Width = 50;
let cactus2Width = 69;
let cactus3Width = 102;

let cactusHeight = 70;
let cactusX = 700;
let cactusY = boardHeight - cactusHeight;

let cactus1Img;
let cactus2Img;
let cactus3Img;

//physics
let velocityX = -5; //cactus moving left speed
let velocityY = 0;
let gravity = .4;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //load images
    dinoImg = new Image();
    dinoImg.src = "./img/frog_running_1.png";
    dinoImg.onload = function() {
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    }

    cactus1Img = new Image();
    cactus1Img.src = "./img/cactus1.png";

    cactus2Img = new Image();
    cactus2Img.src = "./img/cactus2.png";

    cactus3Img = new Image();
    cactus3Img.src = "./img/cactus3.png";

    // Setup theme toggle button
    document.getElementById("toggle-theme").addEventListener("click", toggleTheme);
    
    // Setup restart button
    document.getElementById("restart-button").addEventListener("click", restartGame);
    
    requestAnimationFrame(update);
    setInterval(placeCactus, 1000); //every 1 second
    document.addEventListener("keydown", moveDino);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //dino
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY); //apply gravity to current dino.y, making sure it doesn't exceed the ground
    frameCount++;
if (!gameOver) {
    if (frameCount % 20 < 10) {
        dinoImg = dinoRun1;
    } else {
        dinoImg = dinoRun2;
    }
}
context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);


    //cactus
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

        if (detectCollision(dino, cactus)) {
            gameOver = true;
            document.getElementById("final-score-value").textContent = score; // Display final score
            document.getElementById("final-score").style.display = "block"; // Show final score section
            dinoImg.src = "./img/dead-kangaroo.png"; 
            context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height); // Keep the dinosaur visible
        }
    }

    //score
    context.fillStyle="black";
    context.font="20px courier";
    score++;
    context.fillText(score, 5, 20);
}

function moveDino(e) {
    if (gameOver) {
        return;
    }

    if ((e.code == "Space" || e.code == "ArrowUp") && dino.y == dinoY) {
        //jump
        velocityY = -13;
    }
    else if (e.code == "ArrowDown" && dino.y == dinoY) {
        //duck
    }

}

function placeCactus() {
    if (gameOver) {
        return;
    }

    //place cactus
    let cactus = {
        img : null,
        x : cactusX,
        y : cactusY,
        width : null,
        height: cactusHeight
    }

    let placeCactusChance = Math.random(); //0 - 0.9999...

    if (placeCactusChance > .90) { //10% you get cactus3
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .70) { //30% you get cactus2
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .50) { //50% you get cactus1
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
        cactusArray.push(cactus);
    }

    if (cactusArray.length > 5) {
        cactusArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function restartGame() {
    // Reset game state
    gameOver = false;
    score = 0;
    cactusArray = [];
    dino.y = dinoY; // Reset dino position
    velocityY = 0; // Reset velocity
    dinoImg.src = "./img/dino-run1.png"; // Reset dino image
    document.getElementById("final-score").style.display = "none"; // Hide final score
    requestAnimationFrame(update); // Restart the game loop
}

function toggleTheme() {
    const body = document.body;
    const themeButton = document.getElementById("toggle-theme");
    
    if (body.classList.contains("dark-mode")) {
        body.classList.remove("dark-mode");
        themeButton.textContent = "🌙 Dark Mode";
    } else {
        body.classList.add("dark-mode");
        themeButton.textContent = "☀️ Light Mode";
    }
}
