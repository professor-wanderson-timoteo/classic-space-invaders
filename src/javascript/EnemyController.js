import Enemy from './Enemy.js';
import MovingDirection from './MovingDirection.js';

export default class EnemyController {
  enemyMap = [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [4, 4, 1, 1, 1, 1, 1, 1, 4, 4],
    [2, 2, 2, 3, 3, 3, 3, 2, 2, 2],
    [2, 2, 2, 3, 3, 3, 3, 2, 5, 5],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [5, 5, 2, 4, 4, 4, 2, 2, 2, 2],
  ];
  enemyRows = [];

  currentDirection = MovingDirection.right;
  xVelocity = 0;
  yVelocity = 0;
  defaultXVelocity = 3;
  defaultYVelocity = 2;
  moveDownTimerDefault = 30;
  moveDownTimer = this.moveDownTimerDefault;
  fireBulletTimerDefault = 100;
  fireBulletTimer = this.fireBulletTimerDefault;

  constructor(canvas, enemyBulletController, playerBulletController, updateScoreCallback) {
    this.canvas = canvas;
    this.enemyBulletController = enemyBulletController;
    this.playerBulletController = playerBulletController;
    this.enemyDeathSound = new Audio("src/assets/sounds/enemy-death.wav");
    this.enemyDeathSound.volume = 0.1;
    this.updateScoreCallback = updateScoreCallback;

    this.createEnemies();
  }

  draw(ctx) {
    this.decrementMoveDownTimer();
    this.updateVelocityAndDirection();
    this.collissionDetection();
    this.drawEnemies(ctx);
    this.resetMoveDownTimer();
    this.fireBullet();
  }

  collissionDetection() {
    this.enemyRows.forEach((enemyRow) => {
      enemyRow.forEach((enemy, enemyIndex) => {
        if(this.playerBulletController.collideWith(enemy)) {
          this.enemyDeathSound.currentTime = 0;
          this.enemyDeathSound.play();
          console.log(`Inimigo do tipo ${enemy.enemyType} destruído`);
          this.updateScoreCallback(enemy.enemyType);  // Atualize a pontuação
          enemyRow.splice(enemyIndex, 1);
        }
      });
    });
    this.enemyRows = this.enemyRows.filter((enemyRow) => enemyRow.length > 0);
  }

  fireBullet(){
    this.fireBulletTimer--;
    if(this.fireBulletTimer <= 0) {
      this.fireBulletTimer = this.fireBulletTimerDefault;
      const allEnemies = this.enemyRows.flat();
      const enemyIndex = Math.floor(Math.random() * allEnemies.length);
      const enemy =  allEnemies[enemyIndex];
      this.enemyBulletController.shoot(enemy.x + enemy.width / 2, enemy.y, -3);
    }
  }

  resetMoveDownTimer() {
    if(this.moveDownTimer <= 0 ) {
      this.moveDownTimer = this.moveDownTimerDefault;
    }
  }

  decrementMoveDownTimer() {
    if(
      this.currentDirection === MovingDirection.downLeft ||
      this.currentDirection === MovingDirection.downRight
    ) {
      this.moveDownTimer--;
    }
  }

  updateVelocityAndDirection() {
    for(const enemyRow of this.enemyRows) {
      if(this.currentDirection === MovingDirection.right) {
        this.xVelocity = this.defaultXVelocity;
        this.yVelocity = 0;
        const rightMostEnemy =  enemyRow[enemyRow.length - 1];
        if(rightMostEnemy.x + rightMostEnemy.width >= this.canvas.width) {
          this.currentDirection = MovingDirection.downLeft;
          break;
        }
      } else if(this.currentDirection === MovingDirection.downLeft) {
        if(this.moveDown(MovingDirection.left)) {
          break;
        }
      } else if(this.currentDirection === MovingDirection.left) {
        this.xVelocity = -this.defaultXVelocity;
        this.yVelocity = 0;
        const leftMostEnemy = enemyRow[0];
        if (leftMostEnemy.x <= 0) {
          this.currentDirection = MovingDirection.downRight;
          break;
        }
      } else if( this.currentDirection === MovingDirection.downRight) {
        if(this.moveDown(MovingDirection.right)) {
          break;
        }
      }
    }
  }

  moveDown(newDirection) {
    this.xVelocity = 0;
    this.yVelocity = this.defaultYVelocity;
    if(this.moveDownTimer <= 0) {
      this.currentDirection = newDirection;
      return true;
    } else {
      return false;
    }
  }

  drawEnemies(ctx) {
    this.enemyRows.flat().forEach((enemy) => {
      enemy.move(this.xVelocity, this.yVelocity);
      enemy.draw(ctx);
    });
  }

  createEnemies() {
    this.enemyMap.forEach((row, rowIndex) => {
      this.enemyRows[rowIndex] = [];
      row.forEach((enemyNumber, enemyIndex) => {
        if(enemyNumber > 0) {
          this.enemyRows[rowIndex].push(new Enemy(enemyIndex * 50, rowIndex * 35, enemyNumber));
        }
      });
    }); 
  }
  
  collideWith(sprite) {
    return this.enemyRows.flat().some((enemy) => enemy.collideWith(sprite));
  }
}
