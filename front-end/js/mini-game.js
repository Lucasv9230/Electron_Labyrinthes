// Mini Labyrinthes Game pour la démo
class MiniLabyrinthGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 400;
    this.canvas.height = 400;
    
    this.tileSize = 20;
    this.gridWidth = this.canvas.width / this.tileSize;
    this.gridHeight = this.canvas.height / this.tileSize;
    
    this.player = { x: 1, y: 1, vx: 0, vy: 0 };
    this.key = null;

    // PORTE : dans une case vide, mur à droite
    this.door = { x: this.gridWidth - 3, y: this.gridHeight - 2 };

    this.bird = null;
    this.hasKey = false;
    this.maze = [];
    
    this.colors = {
      wall: '#1a472a',
      path: '#0a1a0a',
      player: '#3df181'
    };
    
    this.generateMaze();
    this.initGame();
    this.setupControls();
    this.gameLoop();
  }
  
  generateMaze() {
    // Initialize with walls
    this.maze = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(1));
    
    // Carving algorithm
    const carve = (x, y) => {
      this.maze[y][x] = 0;
      const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => Math.random() - 0.5);
      
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx > 0 && nx < this.gridWidth - 1 && ny > 0 && ny < this.gridHeight - 1 && this.maze[ny][nx] === 1) {
          this.maze[y + dy / 2][x + dx / 2] = 0;
          carve(nx, ny);
        }
      }
    };
    
    carve(1, 1);

    // Case du joueur
    this.maze[1][1] = 0;

    // Case de la porte (vide)
    this.maze[this.gridHeight - 2][this.gridWidth - 3] = 0;

    // MUR à droite de la porte → touche 100%
    this.maze[this.gridHeight - 2][this.gridWidth - 2] = 1;
  }
  
  initGame() {
    this.hasKey = false;
    
    // Random key position
    let keyOk = false;
    while (!keyOk) {
      const x = Math.floor(Math.random() * (this.gridWidth - 2)) + 1;
      const y = Math.floor(Math.random() * (this.gridHeight - 2)) + 1;
      if (this.maze[y][x] === 0) {
        this.key = { x, y };
        keyOk = true;
      }
    }
    
    // Random bird position
    let birdOk = false;
    while (!birdOk) {
      const x = Math.floor(Math.random() * (this.gridWidth - 2)) + 1;
      const y = Math.floor(Math.random() * (this.gridHeight - 2)) + 1;
      if (this.maze[y][x] === 0 && Math.hypot(x - this.key.x, y - this.key.y) > 3) {
        this.bird = { x, y };
        birdOk = true;
      }
    }
  }
  
  setupControls() {
    window.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowUp':
        case 'z':
        case 'Z':
          this.player.vy = -0.12;
          this.player.vx = 0;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.player.vy = 0.12;
          this.player.vx = 0;
          break;
        case 'ArrowLeft':
        case 'q':
        case 'Q':
          this.player.vx = -0.12;
          this.player.vy = 0;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.player.vx = 0.12;
          this.player.vy = 0;
          break;
      }
    });
  }
  
  isWall(x, y) {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    
    if (tx < 0 || tx >= this.gridWidth || ty < 0 || ty >= this.gridHeight) {
      return true;
    }
    
    return this.maze[ty][tx] === 1;
  }
  
  canMove(x, y) {
    const size = 0.4;
    return !this.isWall(x - size, y - size) &&
           !this.isWall(x + size, y - size) &&
           !this.isWall(x - size, y + size) &&
           !this.isWall(x + size, y + size);
  }
  
  update() {
    const newX = this.player.x + this.player.vx;
    const newY = this.player.y + this.player.vy;
    
    if (this.canMove(newX, newY)) {
      this.player.x = newX;
      this.player.y = newY;
    }

    if (Math.hypot(this.player.x - this.key.x, this.player.y - this.key.y) < 0.5) {
      this.hasKey = true;
    }
    
    if (this.hasKey && Math.hypot(this.player.x - this.door.x, this.player.y - this.door.y) < 0.8) {
      this.initGame();
    }
  }
  
  draw() {
    this.ctx.fillStyle = '#0a1a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = this.colors.wall;
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.maze[y][x] === 1) {
          this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }
    
    // PORTE : touche un mur à 100%
    this.ctx.fillStyle = '#ff6b6b';
    this.ctx.fillRect(
      this.door.x * this.tileSize,
      this.door.y * this.tileSize,
      this.tileSize,
      this.tileSize
    );

    if (!this.hasKey) {
      this.ctx.fillStyle = '#ffd700';
      this.ctx.beginPath();
      this.ctx.arc(
        this.key.x * this.tileSize + this.tileSize / 2,
        this.key.y * this.tileSize + this.tileSize / 2,
        this.tileSize / 3,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
    
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🦅', this.bird.x * this.tileSize + this.tileSize / 2, this.bird.y * this.tileSize + this.tileSize / 2);
    
    this.ctx.fillText('🐛', this.player.x * this.tileSize + this.tileSize / 2, this.player.y * this.tileSize + this.tileSize / 2);
    
    this.ctx.strokeStyle = this.colors.player;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  gameLoop = () => {
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MiniLabyrinthGame('miniGameCanvas');
  });
} else {
  new MiniLabyrinthGame('miniGameCanvas');
}
