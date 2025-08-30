// Global Variables
let move_speed = 3, gravity = 0.2;
let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');
let sound_point = new Audio('sounds effect/point.mp3');
let sound_die = new Audio('sounds effect/die.mp3');

let bird_props;
let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');
let score_title = document.querySelector('.score_title');
let highScore = 0;

// Menu Elements
const homeMenu = document.getElementById("home-menu");
const pauseMenu = document.getElementById("pause-menu");
const gameOverMenu = document.getElementById("game-over");
const scoreboard = document.getElementById("scoreboard");
const finalScore = document.getElementById("final-score");
const finalHighScore = document.getElementById("final-high-score");
const howto = document.getElementById("howto");

let game_state = "Home";
let bird_dy = 0;
let animationId;

// ------------------ INITIALIZE & BUTTON EVENTS ------------------ //
window.addEventListener('load', () => {
    if (localStorage.getItem("flappyHighScore")) {
        highScore = parseInt(localStorage.getItem("flappyHighScore"));
    }
    score_title.innerHTML = `High Score: ${highScore}`;
});

// Start Game
document.getElementById("btn-start").addEventListener("click", () => {
    homeMenu.classList.add("hidden");
    scoreboard.classList.remove("hidden");
    resetGame();

    bird.classList.remove("hidden");
    bird.classList.add("fly-in");
    setTimeout(() => bird.classList.remove("fly-in"), 1000);

    startCountdown(() => {
        game_state = "Play";
        play();
    });
});

function startCountdown(callback) {
    const countdownEl = document.getElementById("countdown");
    countdownEl.classList.remove("hidden");

    let messages = ["Ready", "Set", "Go!"];
    let i = 0;

    function showMessage() {
        countdownEl.textContent = messages[i];

        // restart animasi
        countdownEl.classList.remove("pop");
        void countdownEl.offsetWidth; // trik reflow
        countdownEl.classList.add("pop");

        i++;
        if (i < messages.length) {
            setTimeout(showMessage, 1000); // tunggu 1 detik antar pesan
        } else {
            setTimeout(() => {
                countdownEl.classList.add("hidden");
                callback(); // mulai game
            }, 1000);
        }
    }

    showMessage();
}


// Toggle How to Play
document.getElementById("btn-howto").addEventListener("click", () => {
    howto.classList.toggle("hidden");
});

// Pause / Resume (Key: P)
document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "p" && game_state === "Play") {
        game_state = "Pause";
        pauseMenu.classList.remove("hidden");
        cancelAnimationFrame(animationId);
    } else if (e.key.toLowerCase() === "p" && game_state === "Pause") {
        game_state = "Play";
        pauseMenu.classList.add("hidden");
        play();
    }
});

// Resume button
document.getElementById("btn-resume").addEventListener("click", () => {
    pauseMenu.classList.add("hidden");
    game_state = "Play";
    play();
});

// Restart buttons
document.getElementById("btn-restart").addEventListener("click", restartGame);
document.getElementById("btn-restart2").addEventListener("click", restartGame);

// Back to Home buttons
document.getElementById("btn-home").addEventListener("click", backToHome);
document.getElementById("btn-home2").addEventListener("click", backToHome);

// Exit button
document.getElementById("btn-exit").addEventListener("click", () => {
    window.location.href = "about:blank"; 
    alert("Game closed! Terima kasih sudah main 😊");
});

// ------------------ GAME LOOP ------------------ //
function resetGame() {
    document.querySelectorAll(".pipe_sprite").forEach((e) => e.remove());
    bird.style.top = "40vh";
    img.style.display = "block";
    img.src = "images/Bird.png";
    score_val.innerHTML = "0";
    bird_dy = -6.5;
}

function play() {
    // Gravity
    function apply_gravity() {
        if (game_state !== "Play") return;

        bird_dy += gravity;
        document.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "ArrowUp") {
                img.src = "images/Bird-2.png";
                bird_dy = -6.5;
            }
        });
        document.addEventListener("keyup", (e) => {
            if (e.key === " " || e.key === "ArrowUp") {
                img.src = "images/Bird.png";
            }
        });

        bird_props = bird.getBoundingClientRect();

        if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
            endGame();
            return;
        }

        bird.style.top = bird_props.top + bird_dy + "px";
        bird_props = bird.getBoundingClientRect();

        animationId = requestAnimationFrame(apply_gravity);
    }
    requestAnimationFrame(apply_gravity);

    // Pipes
    let pipe_seperation = 0;
    let pipe_gap = 35;

    function create_pipe() {
        if (game_state !== "Play") return;

        if (pipe_seperation > 115) {
            pipe_seperation = 0;
            let pipe_posi = Math.floor(Math.random() * 43) + 8;

            let pipe_sprite_inv = document.createElement("div");
            pipe_sprite_inv.className = "pipe_sprite";
            pipe_sprite_inv.style.top = pipe_posi - 70 + "vh";
            pipe_sprite_inv.style.left = "100vw";
            document.body.appendChild(pipe_sprite_inv);

            let pipe_sprite = document.createElement("div");
            pipe_sprite.className = "pipe_sprite";
            pipe_sprite.style.top = pipe_posi + pipe_gap + "vh";
            pipe_sprite.style.left = "100vw";
            pipe_sprite.increase_score = "1";
            document.body.appendChild(pipe_sprite);
        }
        pipe_seperation++;
        requestAnimationFrame(create_pipe);
    }
    requestAnimationFrame(create_pipe);

    // Move pipes
    function move() {
        if (game_state !== "Play") return;

        let pipe_sprite = document.querySelectorAll(".pipe_sprite");
        pipe_sprite.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();

            if (pipe_sprite_props.right <= 0) {
                element.remove();
            } else {
                // Collision
                let birdHitboxWidth = bird_props.width * 0.8; 
                let birdHitboxHeight = bird_props.height * 0.8; 

                if (
                    bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width &&
                    bird_props.left + birdHitboxWidth > pipe_sprite_props.left &&
                    bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height &&
                    bird_props.top + birdHitboxHeight > pipe_sprite_props.top
                ) {
                    endGame();
                    return;
                } else {
                    // Score
                    if (
                        pipe_sprite_props.right < bird_props.left &&
                        pipe_sprite_props.right + move_speed >= bird_props.left &&
                        element.increase_score === "1"
                    ) {
                        score_val.innerHTML = parseInt(score_val.innerHTML) + 1;
                        element.increase_score = "0";
                        sound_point.play();
                    }
                    element.style.left = pipe_sprite_props.left - move_speed + "px";
                }
            }
        });
        requestAnimationFrame(move);
    }
    requestAnimationFrame(move);
}

// ------------------ GAME STATES ------------------ //
function endGame() {
    game_state = "End";
    img.style.display = "none";
    sound_die.play();
    finalScore.innerHTML = score_val.innerHTML;
    updateLeaderboard(parseInt(score_val.innerHTML));

    if (parseInt(score_val.innerHTML) > highScore) {
        highScore = parseInt(score_val.innerHTML);
        localStorage.setItem("flappyHighScore", highScore);
    }
    finalHighScore.innerHTML = `High Score: ${highScore}`;
    gameOverMenu.classList.remove("hidden");
}

function restartGame() {
    gameOverMenu.classList.add("hidden");
    pauseMenu.classList.add("hidden");
    resetGame();

    bird.classList.remove("hidden");
    bird.classList.add("fly-in");
    setTimeout(() => bird.classList.remove("fly-in"), 1000);

    score_title.innerHTML = `High Score: ${highScore}`;
    game_state = "Play";
    play();
}

function backToHome() {
    gameOverMenu.classList.add("hidden");
    pauseMenu.classList.add("hidden");
    scoreboard.classList.add("hidden");
    resetGame();

    bird.classList.add("hidden"); // sembunyikan burung saat balik home

    homeMenu.classList.remove("hidden");
    game_state = "Home";
}

// ------------------ LEADERBOARD ------------------ //
function updateLeaderboard(newScore) {
    let scores = JSON.parse(localStorage.getItem("flappyLeaderboard")) || [];
    scores.push(newScore);
    scores.sort((a, b) => b - a);
    scores = scores.slice(0, 5);
    localStorage.setItem("flappyLeaderboard", JSON.stringify(scores));

    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = "";
    scores.forEach((s) => {
        const li = document.createElement("li");
        li.textContent = `${s}`;
        leaderboardList.appendChild(li);
    });
}
