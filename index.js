const STATES = {
	MAINSCREEN: 1,
	ALIVE: 2,
	DEAD: 3,
	GAMEOVER: 4
}

const ASTEROID_TYPE = {
	BIG: 1,
	MIDDLE: 2,
	SMALL: 3
}

const SCORES = {
	BIG: 10,
	MIDDLE: 20,
	SMALL: 40
}

var emitterConfig = {
	"alpha": {
		"start": 1,
		"end": 1
	},
	"scale": {
		"start": 1,
		"end": 1,
		"minimumScaleMultiplier": 1
	},
	"color": {
		"start": "#ffffff",
		"end": "#ffffff"
	},
	"speed": {
		"start": 75,
		"end": 5,
		"minimumSpeedMultiplier": 1
	},
	"acceleration": {
		"x": 0,
		"y": 0
	},
	"maxSpeed": 0,
	"startRotation": {
		"min": 0,
		"max": 360
	},
	"noRotation": true,
	"rotationSpeed": {
		"min": 0,
		"max": 0
	},
	"lifetime": {
		"min": 0.7,
		"max": 1.3
	},
	"blendMode": "normal",
	"frequency": 0.01,
	"emitterLifetime": 0.2,
	"maxParticles": 100,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "point"
};

class AnimatedGraphics {
	constructor(init, animate, lastFrame) {
		this.graphics = new PIXI.Graphics();
		this.currentFrame = 0;
		this.lastFrame = lastFrame;
		this.animate = animate;
		this.state = 0;
		this.init = init;
		this.init();
		this.graphics.visible = false;
	}

	set x(x) {
		this.graphics.x = x;
	}

	get x() {
		return this.graphics.x;
	}

	set y(y) {
		this.graphics.y = y;
	}

	get y() {
		return this.graphics.y;
	}

	set rotation(rotation) {
		this.graphics.rotation = rotation;
	}

	get rotation() {
		return this.graphics.rotation;
	}

	stopAndHide() {
		this.state = 0;
		this.graphics.visible = false;
	}

	play() {
		this.state = 1;
		this.graphics.visible = true;
	}

	update() {
		if (this.state == 1) {
			this.animate(this.currentFrame++);
		}
	}

	setCurrentFrame(currentFrame) {
		this.currentFrame = currentFrame;
	}

	getGraphics() {
		return this.graphics;
	}
}

class CollisionPolygonGraphics {
	constructor(points, x, y, rotation) {
		var pointsWithEndPoints = points.slice();
		pointsWithEndPoints.push(points[0]);
		pointsWithEndPoints.push(points[1]);

		this.graphics = new PIXI.Graphics();
		this.graphics.lineStyle(1, 0xffffff, 1);
		this.graphics.drawPolygon(pointsWithEndPoints);
		this.graphics.x = x;
		this.graphics.y = y;
		this.graphics.rotation = rotation;

		this.collisionPolygon = new SAT.Polygon(new SAT.Vector(0, 0), this.createVectors(points));
		this.collisionPolygon.pos.x = x;
		this.collisionPolygon.pos.y = y;
		this.collisionPolygon.setAngle(rotation);
	}

	set x(x) {
		this.graphics.x = x;
		this.collisionPolygon.pos.x = x;
	}

	get x() {
		return this.graphics.x;
	}

	set y(y) {
		this.graphics.y = y;
		this.collisionPolygon.pos.y = y;
	}

	get y() {
		return this.graphics.y;
	}

	set rotation(rotation) {
		this.graphics.rotation = rotation;
		this.collisionPolygon.setAngle(rotation);
	}

	get rotation() {
		return this.graphics.rotation;
	}

	set visible(visible) {
		this.graphics.visible = visible;
	}

	getGraphics() {
		return this.graphics;
	}

	getCollisionPolygon() {
		return this.collisionPolygon;
	}

	collision(anotherCollisionPolygonGraphics) {
		return SAT.testPolygonPolygon(this.getCollisionPolygon(), anotherCollisionPolygonGraphics.getCollisionPolygon());
	}

	createVectors(points) {
		var vectors = []
		var i;
		for (i = 0; i < points.length / 2; i++) {
			vectors.push(new SAT.Vector(points[i * 2], points[(i * 2) + 1]));
		}

		return vectors;
	}
}

class Asteroid extends CollisionPolygonGraphics {
	constructor(x, y, rotation, speed, type) {
		var points;

		if (type === ASTEROID_TYPE.BIG)
			points = [-18,-38, -38,-3, -28,22, 27,27, 42,12, 22,-28];
		else if (type === ASTEROID_TYPE.MIDDLE)
			points = [-7,-19, -24,-2, -12,19, 7,11, 2,-17];
		else if (type === ASTEROID_TYPE.SMALL)
			points = [-8,-8, -7,10, 7,8, 9,-9, 0,-13];

		super(points, x, y, rotation);
		this.speed = speed;
		this.type = type;
	}

	update(delta) {
		this.x += this.speed.x * delta;
		this.y += this.speed.y * delta;
	}
}

class Ship extends CollisionPolygonGraphics {
	constructor(x, y, rotation, speed, type) {
		super([0,-17, -11,13, 11,13], x, y, rotation);
		this.acceleration = 0;
		this.speed = {x: 0, y: 0, rotation: 0.07};

		this.afterburner = new AnimatedGraphics(function (frame) {
			this.graphics.lineStyle(1, 0xffffff, 1);

			this.graphics.moveTo(-5, 14);
			this.graphics.lineTo(0, 22);
			this.graphics.lineTo(5, 14);
		},
		function (frame) {
			if (frame != 0 && frame % 5 == 0) {
				this.graphics.visible = !this.graphics.visible;
			}
		});
	}

	set x(x) {
		super.x = x;
		this.afterburner.x = this.x;
	}

	get x() {
		return super.x;
	}

	set y(y) {
		super.y = y;
		this.afterburner.y = this.y;
	}

	get y() {
		return super.y;
	}

	set rotation(rotation) {
		super.rotation = rotation;
		this.afterburner.rotation = this.rotation;
	}

	get rotation() {
		return super.rotation;
	}

	update (delta) {
		//ship
		if (this.acceleration != 0) {
			this.speed.x += Math.sin(this.graphics.rotation) * this.acceleration;
			this.speed.y += Math.cos(this.graphics.rotation) * this.acceleration;
		}

		// Friction
		this.speed.x *= 0.995;
		this.speed.y *= 0.995;

		if (this.rotationDirection)
			this.rotation += this.speed.rotation * delta * this.rotationDirection;

		this.x += delta * this.speed.x;
		this.y -= delta * this.speed.y;

		this.afterburner.update();
	}

	stopAndHide() {
		this.acceleration = 0;
		this.speed.x = 0;
		this.speed.y = 0;
		this.rotationDirection = 0;
		this.afterburner.stopAndHide();

		this.graphics.visible = false;
	}
}

class CollisionPointGraphics {
	constructor (x, y) {
		this.graphics = new PIXI.Graphics();
		this.graphics.lineStyle(1, 0xffffff, 1);
		this.graphics.moveTo(0,1);
		this.graphics.lineTo(0,0);

		this.graphics.x = x;
		this.graphics.y = y;

		this.collisionPoint = new SAT.Vector(x, y);
	}

	set x(x) {
		this.graphics.x = x;
		this.collisionPoint.x = x;
	}

	get x() {
		return this.graphics.x;
	}

	set y(y) {
		this.graphics.y = y;
		this.collisionPoint.y = y;
	}

	get y() {
		return this.graphics.y;
	}

	getGraphics() {
		return this.graphics;
	}

	collision(collisionPolygonGraphics) {
		return SAT.pointInPolygon(this.collisionPoint, collisionPolygonGraphics.getCollisionPolygon());
	}
}

class Bullet extends CollisionPointGraphics {
	//static lastBulletCreated = Date.now()

	constructor (x, y, angle, distance) {
		super(x, y);

		this.x = x + Math.cos(angle + 0.5 * Math.PI) * (-distance);
		this.y = y + Math.sin(angle + 0.5 * Math.PI) * (-distance);

		this.lifespan = 40;
		this.age = 0;

		var speed = 6;
		this.speed = {};
		this.speed.x = Math.sin(angle) * speed;
		this.speed.y = -Math.cos(angle) * speed;
	}

	update (delta) {
		this.x += delta * this.speed.x;
		this.y += delta * this.speed.y;
	}
}

class TimelineEvent {
	constructor(func, delay) {
		this.func = func;
		this.delay = delay;
	}
}

class Timeline {
	constructor() {
		this.timelineEvents = []
	}

	add(timelineEvent) {
		this.timelineEvents.push(timelineEvent);
	}

	update(delta) {
		if (this.timelineEvents.length == 0)
			return;

		var te = this.timelineEvents[0];
		te.delay -= delta;

		if (te.delay <= 0) {
			if (te.func)
				te.func();
			this.timelineEvents.splice(0, 1);
		}
	}
}

class Game {
	constructor() {
		this.width = 800;
		this.height = 600;
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

		this.init()
	}

	removeAsteroids() {
		this.asteroids.forEach(function (asteroid) {
			this.app.stage.removeChild(asteroid.getGraphics());
		}.bind(this));
		this.asteroids = [];
	}
	
	getRandomY(x) {
		var borderSize = 100;
		var y;

		if (borderSize <= x && x <= (this.width - borderSize)) {
			y = Math.random() * borderSize * 2
			if (y >= borderSize)
				y = y + (this.height - borderSize * 2)
		}
		else
			y = Math.random() * this.height;
	
		return Math.floor(y);
	}
	
	createBigAsteroids(count) {
		var asteroids = [];
	
		for(var i = 0; i < count; i++) {
			var x = Math.floor((Math.random() * 800));
			var y = this.getRandomY(x);
			var rotation = 2 * Math.PI * Math.random();
			var speed = {x: (Math.random() * 4) - 2, y: (Math.random() * 4) - 2};
			var type = ASTEROID_TYPE.BIG;
	
			var a = new Asteroid(x, y, rotation, speed, type);
	
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

	respawnShip() {
		this.ship.x = this.width / 2;
		this.ship.y = this.height / 2;
		this.ship.rotation = 0;
	
		this.ship.visible = true;
		this.state = STATES.ALIVE;
	}

	tryCreateBullet() {
		if (Date.now() - this.lastBulletCreated > this.bulletDelay) {
			var bullet = new Bullet(this.ship.x, this.ship.y, this.ship.rotation, 17);
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
	
		var x = this.width / 2;
		var y = this.height / 2;
		var rotation = 0;
		this.ship.x = x;
		this.ship.y = y;
		this.ship.rotation = rotation;
	
		this.state = STATES.DEAD;
	
		this.startLevel();
	}
	
	levelCompleted() {
		this.level++;
		this.timeline.add(new TimelineEvent(this.startLevel.bind(this), 120));
	}
	
	startLevel() {
		this.timeline.add(new TimelineEvent(
			function () {
				this.createCenterText('Level ' + this.level);
	
				this.asteroids = this.createBigAsteroids(this.getAsteroidCount(this.level));
				for(var i = 0; i < this.asteroids.length; i++)
					this.app.stage.addChild(this.asteroids[i].getGraphics());
			}.bind(this),
			0
		));
	
		this.timeline.add(new TimelineEvent(
			function () {
				this.app.stage.removeChild(this.texts.center);
				this.texts.center = null;
	
				// TODO: Tarkista, että asteroidit ovat tarpeeksi kaukana aluksesta
				if (this.state != STATES.ALIVE)
					this.respawnShip();
			}.bind(this),
			180
		));
	}

	removeTitleText() {
		if (this.texts.title) {
			this.app.stage.removeChild(this.texts.title);
			this.texts.title = null;
		}
	}
	
	createTitleText() {
		this.texts.title = new PIXI.extras.BitmapText('Asteroids', {font: this.font});
		this.texts.title.x = Math.round((this.width - this.texts.title.width) / 2);
		this.texts.title.y = 150;
		this.texts.title.zIndex = 1;
		this.app.stage.addChild(this.texts.title);
	}
	
	createCenterText(text) {
		if (this.texts.center) {
			this.app.stage.removeChild(this.texts.center);
			this.texts.center = null;
		}
	
		this.texts.center = new PIXI.extras.BitmapText(text, {font: this.font});
		this.texts.center.x = Math.round((this.width - this.texts.center.width) / 2);
		this.texts.center.y = Math.round((this.height - this.texts.center.height) / 2) - 15;
		this.texts.center.zIndex = 1;
		this.app.stage.addChild(this.texts.center);
	}
	
	updateScore() {
		if (!this.texts.score) {
			this.texts.score = new PIXI.extras.BitmapText(this.score.toString(), {font: this.font});
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
		for(var i = 0; i < this.asteroids.length; i++) {
			var asteroid = this.asteroids[i];
	
			asteroid.update(delta);
	
			if (this.state == STATES.ALIVE && asteroid.collision(this.ship)) {;
				this.shipHit();
			}
		}
	
		// Bullets
		bulletsLoop:
		for(var i = this.bullets.length - 1; i >= 0; i--) {
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
							var newAsteroids = this.createMiddleAsteroids(a);
							newAsteroids.forEach(function (na) {
								 this.app.stage.addChild(na.getGraphics());
								 this.asteroids.push(na);
							}.bind(this));
							this.score += SCORES.BIG;
						}
						else if (a.type == ASTEROID_TYPE.MIDDLE) {
							var newAsteroids = this.createSmallAsteroids(a);
							newAsteroids.forEach(function (a) {
								this.app.stage.addChild(a.getGraphics());
								this.asteroids.push(a);
							}.bind(this));
							this.score += SCORES.MIDDLE;
						}
						else if (a.type == ASTEROID_TYPE.SMALL) {
							this.score += SCORES.SMALL;
						}
	
						this.emitter.updateSpawnPos(a.x, a.y);
						this.emitter.resetPositionTracking();
						this.emitter.emit = true;
	
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
	
	updateLives() {
		if (!this.texts.lives) {
			this.texts.lives = new PIXI.extras.BitmapText(this.lives.toString(), {font: this.font});
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
	
		this.emitter.updateSpawnPos(this.ship.x, this.ship.y);
		this.emitter.resetPositionTracking();
		this.emitter.emit = true;
	
		if (this.lives > 0) {
			this.timeline.add(new TimelineEvent(this.respawnShip.bind(this), 120));
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
	
					this.ship.afterburner.setCurrentFrame(0);
					this.ship.afterburner.play();
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
				this.ship.afterburner.stopAndHide();
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
		var loader = new PIXI.loaders.Loader();
		loader.add('hyperspace', 'hyperspace.fnt');
		loader.load(function(loader, resources) {
			this.app = new PIXI.Application(this.width, this.height);
			document.body.appendChild(this.app.view);
	
			this.ship = new Ship(this.width / 2, this.height / 2, 0);
			this.app.stage.addChild(this.ship.getGraphics());
			this.app.stage.addChild(this.ship.afterburner.getGraphics());
	
			this.mainScreen(true);
	
			this.updateScore();
			this.app.stage.addChild(this.texts.score);
	
			this.updateLives()
			this.app.stage.addChild(this.texts.lives);
	
			this.bullets = [];
	
			var pixel = new PIXI.Graphics();
			pixel.lineStyle(1, 0xffffff, 1);
			pixel.moveTo(0,1);
			pixel.lineTo(0,0);

			this.emitter = new PIXI.particles.Emitter(
				this.app.stage,
				[pixel.generateCanvasTexture()],
				emitterConfig
			);
			this.emitter.emit = false;
	
			this.timeline = new Timeline();
	
			this.app.ticker.add(function(delta) {
				this.gameLoop(delta);
			}.bind(this));
	
			document.addEventListener('keydown', this.onKeyDown.bind(this));
			document.addEventListener('keyup', this.onKeyUp.bind(this));
		}.bind(this));
	}
}

new Game();
