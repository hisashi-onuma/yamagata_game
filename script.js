const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

let brickWidth = 25;
let brickHeight = 12;
let brickPadding = 5;
let brickOffsetTop = 30;
let brickOffsetLeft = 62;

let score = 0;
let lives = 3;

const yamagataShape = [
    [0,0,0,0,0,0,1,1,1,1,1,0], // Top of the head/hair
    [0,0,0,0,0,1,1,1,1,1,1,1],
    [0,0,0,0,1,1,1,1,1,1,1,1],
    [0,0,0,1,1,0,1,1,1,1,1,0], // Forehead
    [0,0,1,1,0,0,1,1,1,1,0,0], // Nose bridge
    [0,1,1,0,0,0,0,1,1,0,0,0], // Nose tip
    [0,1,1,0,0,0,0,1,1,1,0,0], // Upper lip area
    [0,0,1,1,0,0,1,1,1,1,1,0], // Mouth/Chin
    [0,0,0,1,1,1,1,1,1,1,1,0], // Chin/Jawline
    [0,0,0,0,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,0], // Neck
    [0,0,0,0,0,0,1,1,0,0,0,0],
];

let bricks = [];
let brickCount = 0;
yamagataShape.forEach((row, r) => {
    row.forEach((col, c) => {
        if (col === 1) {
            let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
            let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
            bricks.push({ x: brickX, y: brickY, status: 1, width: brickWidth, height: brickHeight });
            brickCount++;
        }
    });
});

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

const messages = ['きたきた！', 'イテテ', 'アチチ～', 'うまいよ！', 'ちょうしいい♪', 'おっとっと', 'まずねまれ'];
const messageArea = document.getElementById('messageArea');

function increaseSpeed() {
    // Increase speed by 20% while preserving direction
    dx *= 1.2;
    dy *= 1.2;
}

function collisionDetection() {
    bricks.forEach(b => {
        if (b.status == 1) {
            if (x > b.x && x < b.x + b.width && y > b.y && y < b.y + b.height) {
                dy = -dy;
                b.status = 0;
                score++;

                // Display random message
                const randomIndex = Math.floor(Math.random() * messages.length);
                messageArea.textContent = messages[randomIndex];

                if (score == brickCount) {
                    // Clear interval so speed doesn't increase on win screen
                    clearInterval(speedInterval); 
                    alert("YOU WIN, CONGRATULATIONS!");
                    document.location.reload();
                }
            }
        }
    });
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    bricks.forEach(b => {
        if (b.status == 1) {
            ctx.beginPath();
            ctx.rect(b.x, b.y, b.width, b.height);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }
    });
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

let paddleHits = 0;
const hitsToMove = 5;

function moveBricks() {
    let gameOver = false;
    bricks.forEach(b => {
        if (b.status === 1) {
            b.y += brickHeight + 5; // Move bricks down
            if (b.y + b.height > canvas.height - paddleHeight) {
                gameOver = true;
            }
        }
    });
    if (gameOver) {
        lives = 0; // This will trigger the game over alert in the main loop
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            paddleHits++;
            if (paddleHits > 0 && paddleHits % hitsToMove === 0) {
                moveBricks();
            }
        } else {
            lives--;
            if (lives <= 0) {
                clearInterval(speedInterval);
                alert("GAME OVER");
                document.location.reload();
                return; // Stop the loop
            }
            x = canvas.width / 2;
            y = canvas.height - 30;
            dx = 2;
            dy = -2;
            paddleX = (canvas.width - paddleWidth) / 2;
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;

    if (lives <= 0) {
        clearInterval(speedInterval);
        alert("GAME OVER");
        document.location.reload();
        return; // Stop the loop
    }

    requestAnimationFrame(draw);
}

let speedInterval = setInterval(increaseSpeed, 15000);
draw();
