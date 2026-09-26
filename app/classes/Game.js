import * as PIXI from 'pixi.js';
import 'pixi-particles';

import Asteroid from './Asteroid.js';
import Ship from './Ship.js';
import Bullet from './Bullet.js';
import TimelineEvent from './TimelineEvent.js';
import Timeline from './Timeline.js';
import VectorText from './VectorText.js';
import {STATES, ASTEROID_TYPE, SCORES} from '../enums.js';

export default class Game {
	constructor() {
		this.width = 800;
		this.height = 600;
		this.scale = 1;
		this.state = STATES.ALIVE;
		this.font = '48px Hyperspace';
		this.lastBulletCreated = Date.now();
		this.bulletDelay = 300;
		this.timeline = new Timeline();
		this.asteroids = [];
		this.texts = {};
		this.lives = 3;
		this.score = 0;
		this.level = 1;
		this.emitterConfig = {
			'alpha': {
				'start': 1,
				'end': 1
			},
			'scale': {
				'start': 1,
				'end': 1,
				'minimumScaleMultiplier': 1
			},
			'color': {
				'start': '#ffffff',
				'end': '#ffffff'
			},
			'speed': {
				'start': 75,
				'end': 5,
				'minimumSpeedMultiplier': 1
			},
			'acceleration': {
				'x': 0,
				'y': 0
			},
			'maxSpeed': 0,
			'startRotation': {
				'min': 0,
				'max': 360
			},
			'noRotation': true,
			'rotationSpeed': {
				'min': 0,
				'max': 0
			},
			'lifetime': {
				'min': 0.7,
				'max': 1.3
			},
			'blendMode': 'normal',
			'frequency': 0.01,
			'emitterLifetime': 0.2,
			'maxParticles': 100,
			'pos': {
				'x': 0,
				'y': 0
			},
			'addAtBack': false,
			'spawnType': 'point'
		};

		this.init()
	}

	removeAsteroids() {
		this.asteroids.forEach(function (asteroid) {
			this.app.stage.removeChild(asteroid.getGraphics());
		}.bind(this));
		this.asteroids = [];
	}

	getRandomEdgeSpawn() {
		var edge = Math.floor(Math.random() * 4); // 0: ylä, 1: oikea, 2: ala, 3: vasen
		var spawnOffset = 45; // Asteroidi syntyy kokonaan kentän ulkopuolella
		var x, y, speedX, speedY;

		var forwardSpeed = 0.8 + Math.random() * 1.4;
		var sideSpeed = (Math.random() * 3) - 1.5;

		switch (edge) {
			case 0: // Ylhäältä alas kentälle
				x = Math.random() * this.width;
				y = -spawnOffset;
				speedX = sideSpeed;
				speedY = forwardSpeed;
				break;
			case 1: // Oikealta vasemmalle kentälle
				x = this.width + spawnOffset;
				y = Math.random() * this.height;
				speedX = -forwardSpeed;
				speedY = sideSpeed;
				break;
			case 2: // Alhaalta ylös kentälle
				x = Math.random() * this.width;
				y = this.height + spawnOffset;
				speedX = sideSpeed;
				speedY = -forwardSpeed;
				break;
			case 3: // Vasemmalta oikealle kentälle
			default:
				x = -spawnOffset;
				y = Math.random() * this.height;
				speedX = forwardSpeed;
				speedY = sideSpeed;
				break;
		}

		return {
			x: Math.floor(x),
			y: Math.floor(y),
			speed: { x: speedX, y: speedY }
		};
	}

	createBigAsteroids(count) {
		var asteroids = [];
		var centerX = this.width / 2;
		var centerY = this.height / 2;
		var shipX = (this.ship && this.ship.getGraphics().visible) ? this.ship.x : centerX;
		var shipY = (this.ship && this.ship.getGraphics().visible) ? this.ship.y : centerY;
		var minDistance = 180;

		for(var i = 0; i < count; i++) {
			var spawn, distCenter, distShip;
			var attempts = 0;
			do {
				spawn = this.getRandomEdgeSpawn();

				var dxC = spawn.x - centerX;
				var dyC = spawn.y - centerY;
				distCenter = Math.sqrt(dxC * dxC + dyC * dyC);

				var dxS = spawn.x - shipX;
				var dyS = spawn.y - shipY;
				distShip = Math.sqrt(dxS * dxS + dyS * dyS);

				attempts++;
			} while ((distCenter < minDistance || distShip < minDistance) && attempts < 100);

			var rotation = 2 * Math.PI * Math.random();
			var type = ASTEROID_TYPE.BIG;

			var a = new Asteroid(spawn.x, spawn.y, rotation, spawn.speed, type, {
				hasEnteredField: false
			});

			asteroids.push(a);
		}

		return asteroids;
	}

	createAsteroidGroup(x, y, rotation, distance, type, rotationOffset, count) {
		var asteroids = []
		var speedTotal = 0.5 + Math.random() * 1.5;

		for(var i = 0; i < count; i++) {
			var rot = rotation + ((((2 / count) * i)) * Math.PI + rotationOffset)
			var xd = distance * Math.cos(rot);
			var yd = distance * Math.sin(rot);
			var speed = {x: speedTotal * Math.cos(rot), y: speedTotal * Math.sin(rot)}
			asteroids.push(new Asteroid(x + xd, y + yd, 2 * Math.PI * Math.random(), speed, type));
		}

		return asteroids;
	}

	createSmallAsteroids(oa) {
		return this.createAsteroidGroup(oa.x, oa.y, oa.rotation, 4, ASTEROID_TYPE.SMALL, 0.5 * Math.PI, 2);
	}

	createMiddleAsteroids(oa) {
		return this.createAsteroidGroup(oa.x, oa.y, oa.rotation, 11, ASTEROID_TYPE.MIDDLE, 0.25 * Math.PI, 4);
	}

	isSpawnSafe() {
		var spawnX = this.width / 2;
		var spawnY = this.height / 2;
		var safeDistance = 150;

		for (var i = 0; i < this.asteroids.length; i++) {
			var asteroid = this.asteroids[i];
			var dx = asteroid.x - spawnX;
			var dy = asteroid.y - spawnY;
			if (dx * dx + dy * dy < safeDistance * safeDistance) {
				return false;
			}
		}
		return true;
	}

	tryRespawnShip() {
		if (this.state !== STATES.DEAD || this.lives <= 0) {
			return;
		}

		if (this.isSpawnSafe()) {
			this.respawnShip();
		} else {
			this.timeline.add(new TimelineEvent(this.tryRespawnShip.bind(this), 10));
		}
	}

	respawnShip() {
		this.ship.stopAndHide();
		this.ship.x = this.width / 2;
		this.ship.y = this.height / 2;
		this.ship.rotation = 0;

		this.ship.visible = true;
		this.state = STATES.ALIVE;
	}

	tryCreateBullet() {
		if (Date.now() - this.lastBulletCreated > this.bulletDelay) {
			var bullet = new Bullet(this.ship.x, this.ship.y, this.ship.rotation, 17, this.scale);
			this.app.stage.addChild(bullet.getGraphics());
			this.bullets.push(bullet);

			this.lastBulletCreated = Date.now();
		}
	}

	getAsteroidCount(levelNumber) {
		return levelNumber + 1;
	}

	mainScreen(createAsteroids) {
		this.state = STATES.MAINSCREEN;
		this.ship.visible = false;

		this.removeTitleText();

		if (createAsteroids) {
			this.removeAsteroids();
			this.asteroids = this.createBigAsteroids(4);
			for(var i = 0; i < this.asteroids.length; i++)
				this.app.stage.addChild(this.asteroids[i].getGraphics());
		}

		this.createCenterText('Press S to start')
		this.createTitleText();
	}

	startGame() {
		this.level = 1;
		this.score = 0;
		this.lives = 3;
		this.updateScore();
		this.updateLives();
		this.removeTitleText();
		this.removeAsteroids();
		this.timeline = new Timeline();

		this.ship.stopAndHide();
		this.ship.x = this.width / 2;
		this.ship.y = this.height / 2;
		this.ship.rotation = 0;

		this.state = STATES.DEAD;

		this.startLevel();
	}

	levelCompleted() {
		this.level++;
		this.timeline.add(new TimelineEvent(this.startLevel.bind(this), 120));
	}

	startLevel() {
		this.createCenterText('Level ' + this.level);

		this.timeline.add(new TimelineEvent(
			function () {
				this.removeCenterText();
				this.spawnNextWave();
			}.bind(this),
			120
		));
	}

	spawnNextWave() {
		this.asteroids = this.createBigAsteroids(this.getAsteroidCount(this.level));
		for(var i = 0; i < this.asteroids.length; i++)
			this.app.stage.addChild(this.asteroids[i].getGraphics());

		if (this.state != STATES.ALIVE)
			this.tryRespawnShip();
	}

	removeTitleText() {
		if (this.texts.title) {
			this.app.stage.removeChild(this.texts.title);
			this.texts.title = null;
		}
	}

	createTitleText() {
		this.texts.title = new VectorText('Asteroids', {font: this.font});
		this.texts.title.x = Math.round((this.width - this.texts.title.width) / 2);
		this.texts.title.y = 150;
		this.texts.title.zIndex = 1;
		this.app.stage.addChildAt(this.texts.title);
	}

	removeCenterText() {
		if (this.texts.center) {
			this.app.stage.removeChild(this.texts.center);
			this.texts.center = null;
		}
	}

	createCenterText(text) {
		this.removeCenterText();

		this.texts.center = new VectorText(text, {font: this.font});
		this.texts.center.x = Math.round((this.width - this.texts.center.width) / 2);
		this.texts.center.y = Math.round((this.height - this.texts.center.height) / 2) - 15;
		this.app.stage.addChildAt(this.texts.center, 0);
	}

	updateScore() {
		if (!this.texts.score) {
			this.texts.score = new VectorText(this.score.toString(), {font: this.font});
			this.texts.score.anchor = new PIXI.Point(1, 0);
			this.texts.score.x = 785;
			this.texts.score.y = 0;
			this.texts.score.zIndex = 1;
		}
		else {
			this.texts.score.text = this.score.toString();
		}
	}

	warpAll() {
		this.warp(this.ship);
		this.asteroids.forEach(function (asteroid) {
			this.warp(asteroid);
		}.bind(this));
		this.bullets.forEach(function (bullet) {
			this.warp(bullet);
		}.bind(this));
	}

	warp(movingObject) {
		if (movingObject.hasEnteredField === false) {
			return;
		}

		if (movingObject.x > this.width)
			movingObject.x -= this.width;
		else if (movingObject.x < 0)
			movingObject.x += this.width;

		if (movingObject.y > this.height)
			movingObject.y -= this.height;
		else if (movingObject.y < 0)
			movingObject.y += this.height;
	}

	gameLoop(delta) {
		if (this.state == STATES.GAMEOVER) {
			return;
		}

		this.timeline.update(delta);
		this.emitter.update(delta/60);
		this.ship.update(delta);

		//Asteroids
		for(let i = 0; i < this.asteroids.length; i++) {
			var asteroid = this.asteroids[i];

			asteroid.update(delta);

			if (this.state == STATES.ALIVE && asteroid.collision(this.ship)) {
				this.shipHit();
			}
		}

		// Bullets
		bulletsLoop:
		for(let i = this.bullets.length - 1; i >= 0; i--) {
			this.bullets[i].update(delta);

			if (this.bullets[i].age > this.bullets[i].lifespan) {
				this.app.stage.removeChild(this.bullets[i].getGraphics());
				this.bullets.splice(i, 1);
			} else {
				this.bullets[i].age += delta;

				for (var j = this.asteroids.length - 1; j >= 0 ; j--) {
					if (this.bullets[i].collision(this.asteroids[j])) {
						this.app.stage.removeChild(this.bullets[i].getGraphics());
						this.bullets.splice(i, 1);
						this.app.stage.removeChild(this.asteroids[j].getGraphics());
						var a = this.asteroids.splice(j, 1)[0];

						if (a.type == ASTEROID_TYPE.BIG) {
							var middleAsteroids = this.createMiddleAsteroids(a);
							middleAsteroids.forEach(function (na) {
								 this.app.stage.addChild(na.getGraphics());
								 this.asteroids.push(na);
							}.bind(this));
							this.score += SCORES.BIG;
						}
						else if (a.type == ASTEROID_TYPE.MIDDLE) {
							var smallAsteroids = this.createSmallAsteroids(a);
							smallAsteroids.forEach(function (a) {
								this.app.stage.addChild(a.getGraphics());
								this.asteroids.push(a);
							}.bind(this));
							this.score += SCORES.MIDDLE;
						}
						else if (a.type == ASTEROID_TYPE.SMALL) {
							this.score += SCORES.SMALL;
						}

						this.explosion(a.x, a.y);
						this.updateScore();

						if (this.asteroids.length == 0) {
							this.levelCompleted();
						}

						continue bulletsLoop;
					}
				}
			}
		}

		this.warpAll();
	}

	explosion(x, y) {
		this.emitter.updateSpawnPos(x, y);
		this.emitter.resetPositionTracking();
		this.emitter.emit = true;
	}

	updateLives() {
		if (!this.texts.lives) {
			this.texts.lives = new VectorText(this.lives.toString(), {font: this.font});
			this.texts.lives.anchor = new PIXI.Point(1, 0);
			this.texts.lives.x = 33;
			this.texts.lives.y = 0;
			this.texts.lives.zIndex = 1;
		}
		else {
			this.texts.lives.text = this.lives.toString();
		}
	}

	shipHit() {
		this.state = STATES.DEAD;
		this.lives--;
		this.updateLives();

		this.ship.stopAndHide();

		this.explosion(this.ship.x, this.ship.y);

		if (this.lives > 0) {
			this.timeline.add(new TimelineEvent(this.tryRespawnShip.bind(this), 120));
		}
		else {
			this.timeline.add(new TimelineEvent(this.gameOver.bind(this), 120));
		}
	}

	gameOver() {
		this.createCenterText('Game over');
		this.timeline.add(new TimelineEvent(
			function () { this.mainScreen(false); }.bind(this),
			180
		));
	}

	onKeyDown(key) {
		if (this.state == STATES.ALIVE) {
			if (key.keyCode == 38) {
				if (!this.ship.acceleration) {
					this.ship.acceleration = 0.055;
				}
			}
			else if (key.keyCode == 37) {
				this.ship.rotationDirection = -1;
			}
			else if (key.keyCode == 39) {
				this.ship.rotationDirection = 1;
			}
			else if (key.keyCode == 83) {
				this.tryCreateBullet();
			}
		}
		else if (this.state == STATES.MAINSCREEN) {
			if (key.keyCode == 83) {
				this.startGame();
			}
		}
	}

	onKeyUp(key) {
		if (this.state == STATES.ALIVE) {
			if (key.keyCode == 38) {
				this.ship.acceleration = 0;
			}
			if (key.keyCode == 37 && this.ship.rotationDirection == -1) {
				this.ship.rotationDirection = 0;
			}
			else if (key.keyCode == 39 && this.ship.rotationDirection == 1) {
				this.ship.rotationDirection = 0;
			}
		}
	}

	init() {
		this.app = new PIXI.Application(this.width, this.height, {
			backgroundColor: 0x000000,
			autoResize: true
		});
		document.body.appendChild(this.app.view);
		this.updateDimensions();

		this.ship = new Ship(this.width / 2, this.height / 2, 0, {
			wrapWidth: this.width,
			wrapHeight: this.height
		});
		this.app.stage.addChild(this.ship.getGraphics());
		this.app.stage.addChild(this.ship.afterburner.getGraphics());

		this.mainScreen(true);

		this.updateScore();
		this.app.stage.addChildAt(this.texts.score, 0);

		this.updateLives();
		this.app.stage.addChildAt(this.texts.lives, 0);

		this.bullets = [];

		var pixel = new PIXI.Graphics();
		pixel.lineStyle(1, 0xffffff, 1);
		pixel.moveTo(0,1);
		pixel.lineTo(0,0);

		this.emitter = new PIXI.particles.Emitter(
			this.app.stage,
			[pixel.generateCanvasTexture()],
			this.emitterConfig
		);
		if (this.emitter.startScale) {
			this.emitter.startScale.value = 1 / this.scale;
		}
		this.emitter.emit = false;

		this.timeline = new Timeline();

		this.app.ticker.add(function(delta) {
			this.gameLoop(delta);
		}.bind(this));

		document.addEventListener('keydown', this.onKeyDown.bind(this));
		document.addEventListener('keyup', this.onKeyUp.bind(this));
		window.addEventListener('resize', this.onResize.bind(this));
	}

	onResize() {
		this.updateDimensions();
	}

	updateDimensions() {
		var baseWidth = 800;
		var baseHeight = 600;
		var windowWidth = window.innerWidth || baseWidth;
		var windowHeight = window.innerHeight || baseHeight;

		var scale = Math.min(windowWidth / baseWidth, windowHeight / baseHeight);
		this.scale = scale;

		var canvasWidth = Math.floor(baseWidth * scale);
		var canvasHeight = Math.floor(baseHeight * scale);

		if (this.app) {
			this.app.renderer.resize(canvasWidth, canvasHeight);
			this.app.view.style.width = canvasWidth + 'px';
			this.app.view.style.height = canvasHeight + 'px';
			this.app.stage.scale.set(scale, scale);

			if (this.emitter && this.emitter.startScale) {
				this.emitter.startScale.value = 1 / scale;
			}

			if (this.bullets) {
				this.bullets.forEach(function (bullet) {
					bullet.setScale(scale);
				});
			}
		}
	}
}
