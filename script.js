// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

// Game variables
let objects = [];
let particles = [];
let score = 0;
let lives = 3;
let slicingPath = [];
const spawnInterval = 1200; 
let lastSpawnTime = 0;

// Utility functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// GameObject class for fruits and bombs
class GameObject {
  constructor(type, x, y, vx, vy) {
    this.type = type; // "fruit" or "bomb"
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 30;
    this.color = type === "fruit" ? "green" : "red";
    this.isSliced = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.09; // Simulate gravity
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  isColliding(sliceX, sliceY) {
    const dx = this.x - sliceX;
    const dy = this.y - sliceY;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }
}

// Particle class for juice splatter
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.radius = randomFloat(2, 5);
    this.color = color;
    this.vx = randomFloat(-3, 3);
    this.vy = randomFloat(-3, 3);
    this.life = 1; // Opacity
    this.decay = randomFloat(0.01, 0.05);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.life})`;
    ctx.fill();
    ctx.closePath();
  }
}

// Spawn objects
function spawnObject() {
  const type = Math.random() < 0.8 ? "fruit" : "bomb";
  const x = randomInt(50, canvas.width - 50);
  const y = canvas.height; // Start at the bottom
  const vx = randomFloat(-2, 2);
  const vy = -randomFloat(6, 10);
  objects.push(new GameObject(type, x, y, vx, vy));
}

// Create particles for juice splatter
function createParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(x, y, color));
  }
}

// Handle slicing
function handleSlicing(x, y) {
  objects = objects.filter((object) => {
    if (!object.isSliced && object.isColliding(x, y)) {
      object.isSliced = true;

      if (object.type === "fruit") {
        score += 10;
        if(score>hiscoreval){
          hiscoreval = score;
          localStorage.setItem("HighScore", JSON.stringify(hiscoreval));
          hiscoreBox.innerHTML = "HighScore: " + hiscoreval;
      }
        splitFruit(object);
        createParticles(object.x, object.y, "34, 139, 34");
      } else if (object.type === "bomb") {
        lives--;
        createParticles(object.x, object.y, "255, 0, 0");
        if (lives <= 0) {
          alert("Game Over! Your score: " + score);
          resetGame();
        }
      }
      updateUI();
      return false;
    }
    return true;
  });
}

// Split fruit into  pieces
function splitFruit(fruit) {
  const leftPiece = new GameObject("fruit", fruit.x - 15, fruit.y, -2, fruit.vy);
  const rightPiece = new GameObject("fruit", fruit.x + 15, fruit.y, 2, fruit.vy);
  leftPiece.radius = rightPiece.radius = fruit.radius / 2;
  leftPiece.color = rightPiece.color = fruit.color;
  objects.push(leftPiece, rightPiece); 
}

// Update UI
function updateUI() {
  document.getElementById("scoreBoard").innerText = `Score: ${score} | Lives: ${lives}`;
}

// Clear canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Reset game
function resetGame() {
  score = 0;
  lives = 3;
  objects = [];
  particles = [];
  updateUI();
}

// Track slicing path
canvas.addEventListener("mousemove", (e) => {
  slicingPath.push({ x: e.offsetX, y: e.offsetY });
  if (slicingPath.length > 5) slicingPath.shift();
  slicingPath.forEach(({ x, y }) => handleSlicing(x, y));
});

// Game loop
function gameLoop(timestamp) {
  clearCanvas();

  // Spawn objects
  if (timestamp - lastSpawnTime > spawnInterval) {
    spawnObject();
    lastSpawnTime = timestamp;
  }

  // Update and draw objects
  objects = objects.filter((object) => {
    object.update();
    object.draw();
    return object.y < canvas.height + object.radius;
  });

  // Update and draw particles
  particles = particles.filter((particle) => {
    particle.update();
    particle.draw();
    return particle.life > 0;
  });

  requestAnimationFrame(gameLoop);
}  

// Start the game
updateUI();
requestAnimationFrame(gameLoop);
let hiscore = localStorage.getItem("hiscore");
if(hiscore === null){
     hiscoreval = 0;
    localStorage.setItem("Highscore", JSON.stringify(hiscoreval))}
    else{
      hiscoreval = JSON.parse(hiscore);
      hiscoreBox.innerHTML = "HighScore: " + hiscore;
  }