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
		this.graphics.x += this.speed.x * delta;
		this.graphics.y += this.speed.y * delta;
		warp(this.graphics);
		this.collisionPolygon.pos.x = this.graphics.x;
		this.collisionPolygon.pos.y = this.graphics.y;
	}
}

class Ship extends CollisionPolygonGraphics {
	constructor(x, y, rotation, speed, type) {
		var x = game.width / 2;
		var	y = game.height / 2;
		var rotation = 0;

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

	update (delta) {
		//ship
		if (this.acceleration != 0) {
			this.speed.x += Math.sin(this.graphics.rotation) * game.ship.acceleration;
			this.speed.y += Math.cos(this.graphics.rotation) * game.ship.acceleration;
		}

		// Friction
		this.speed.x *= 0.995;
		this.speed.y *= 0.995;

		if (this.rotationDirection)
			this.graphics.rotation += this.speed.rotation * delta * this.rotationDirection;

		if (this.speed.x != 0)
			this.graphics.x += delta * this.speed.x;

		if (this.speed.y != 0)
			this.graphics.y -= delta * this.speed.y;

		warp(this.graphics);

		this.collisionPolygon.pos.x = this.graphics.x;
		this.collisionPolygon.pos.y = this.graphics.y;
		this.collisionPolygon.setAngle(this.graphics.rotation);

		this.afterburner.graphics.x = this.graphics.x;
		this.afterburner.graphics.y = this.graphics.y;
		this.afterburner.graphics.rotation = this.graphics.rotation;

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

	set y(y) {
		this.graphics.y = y;
		this.collisionPoint.y = y;
	}

	getGraphics() {
		return this.graphics;
	}

	collision(collisionPolygonGraphics) {
		return SAT.pointInPolygon(this.collisionPoint, collisionPolygonGraphics.getCollisionPolygon());
	}
}

class Bullet extends CollisionPointGraphics {
	constructor (x, y, angle, distance) {
		super(x, y);

		this.x = x + Math.cos(angle + 0.5 * Math.PI) * (-distance);
		this.y = y + Math.sin(angle + 0.5 * Math.PI) * (-distance);

		this.lifespan = 40;
		this.age = 0;

		var speed = 6;
		this.speed = {};
		this.speed.x = Math.sin(game.ship.rotation) * speed;
		this.speed.y = -Math.cos(game.ship.rotation) * speed;
	}

	update (delta) {
		this.graphics.x += delta * this.speed.x;
		this.graphics.y += delta * this.speed.y;
		warp(this.graphics);
		this.collisionPoint.x = this.graphics.x;
		this.collisionPoint.y = this.graphics.y;
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

var game = {
	width: 800,
	height: 600,
	state: STATES.ALIVE,
	font: '48px Hyperspace',
	lastBulletCreated: Date.now(),
	bulletDelay: 300,
	timeline: [],
	asteroids: [],
	texts: {},
	lives: 3,
	score: 0,
	level: 1
}

game.emitterConfig = {
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

function removeAsteroids() {
	game.asteroids.forEach(function (asteroid) {
		game.app.stage.removeChild(asteroid.getGraphics());
	});
	game.asteroids = [];
}

function getRandomY(x) {
	var borderSize = 100;

	if (borderSize <= x && x <= (game.width - borderSize)) {
		y = Math.random() * borderSize * 2
		if (y >= borderSize)
			y = y + (game.height - borderSize * 2)
	}
	else
		y = Math.random() * game.height;

	return Math.floor(y);
}

function createBigAsteroids(count) {
	var asteroids = [];

	for(var i = 0; i < count; i++) {
		var x = Math.floor((Math.random() * 800));
		var y = getRandomY(x);
		var rotation = 2 * Math.PI * Math.random();
		var speed = {x: (Math.random() * 4) - 2, y: (Math.random() * 4) - 2};
		var type = ASTEROID_TYPE.BIG;

		var a = new Asteroid(x, y, rotation, speed, type);

		asteroids.push(a);
	}

	return asteroids;
}

function createAsteroidGroup(x, y, rotation, distance, type, rotationOffset, count) {
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

function createSmallAsteroids(oa) {
	return createAsteroidGroup(oa.x, oa.y, oa.rotation, 4, ASTEROID_TYPE.SMALL, 0.5 * Math.PI, 2);
}

function createMiddleAsteroids(oa) {
	return createAsteroidGroup(oa.x, oa.y, oa.rotation, 11, ASTEROID_TYPE.MIDDLE, 0.25 * Math.PI, 4);
}

function respawnShip() {
	game.ship.x = game.width / 2;
	game.ship.y = game.height / 2;
	game.ship.rotation = 0;

	game.ship.visible = true;
	game.state = STATES.ALIVE;
}

function warp(movingObject) {
	if (movingObject.x > game.width)
		movingObject.x -= game.width;
	else if (movingObject.x < 0)
		movingObject.x += game.width;

	if (movingObject.y > game.height)
		movingObject.y -= game.height;
	else if (movingObject.y < 0)
		movingObject.y += game.height;
}

function tryCreateBullet() {
	if (Date.now() - game.lastBulletCreated > game.bulletDelay) {
		var bullet = new Bullet(game.ship.x, game.ship.y, game.ship.rotation, 17);
		game.app.stage.addChild(bullet.getGraphics());
		game.bullets.push(bullet);

		game.lastBulletCreated = Date.now();
	}
}

function getAsteroidCount(levelNumber) {
	return levelNumber + 1;
}

function onKeyDown(key) {
	if (game.state == STATES.ALIVE) {
		if (key.keyCode == 38) {
			if (!game.ship.acceleration) {
				game.ship.acceleration = 0.055;

				game.ship.afterburner.setCurrentFrame(0);
				game.ship.afterburner.play();
			}
		}
		else if (key.keyCode == 37) {
			game.ship.rotationDirection = -1;
		}
		else if (key.keyCode == 39) {
			game.ship.rotationDirection = 1;
		}
		else if (key.keyCode == 83) {
			tryCreateBullet();
		}
	}
	else if (game.state == STATES.MAINSCREEN) {
		if (key.keyCode == 83) {
			startGame();
		}
	}
}

function onKeyUp(key) {
	if (game.state == STATES.ALIVE) {
		if (key.keyCode == 38) {
			game.ship.acceleration = 0;
			game.ship.afterburner.stopAndHide();
		}
		if (key.keyCode == 37 && game.ship.rotationDirection == -1) {
			game.ship.rotationDirection = 0;
		}
		else if (key.keyCode == 39 && game.ship.rotationDirection == 1) {
			game.ship.rotationDirection = 0;
		}
	}
}

function gameLoop(delta) {
	//delta *= 0.1

	if (game.state == STATES.GAMEOVER) {
		return;
	}

	game.timeline.update(delta);
	game.emitter.update(delta/60);
	game.ship.update(delta);

	//Asteroids
	for(var i = 0; i < game.asteroids.length; i++) {
		var asteroid = game.asteroids[i];

		asteroid.update(delta);

		if (game.state == STATES.ALIVE && asteroid.collision(game.ship)) {;
			shipHit();
		}
	}

	// Bullets
	bulletsLoop:
	for(var i = game.bullets.length - 1; i >= 0; i--) {
		game.bullets[i].update(delta);

		if (game.bullets[i].age > game.bullets[i].lifespan) {
			game.app.stage.removeChild(game.bullets[i].getGraphics());
			game.bullets.splice(i, 1);
		} else {
			game.bullets[i].age += delta;

			for (var j = game.asteroids.length - 1; j >= 0 ; j--) {
				if (game.bullets[i].collision(game.asteroids[j])) {
					game.app.stage.removeChild(game.bullets[i].getGraphics());
					game.bullets.splice(i, 1);
					game.app.stage.removeChild(game.asteroids[j].getGraphics());
					var a = game.asteroids.splice(j, 1)[0];

					if (a.type == ASTEROID_TYPE.BIG) {
						var newAsteroids = createMiddleAsteroids(a);
						 newAsteroids.forEach(function (na) {
						 	game.app.stage.addChild(na.getGraphics());
						 	game.asteroids.push(na);
						 });
						game.score += SCORES.BIG;
					}
					else if (a.type == ASTEROID_TYPE.MIDDLE) {
						var newAsteroids = createSmallAsteroids(a);
						newAsteroids.forEach(function (a) {
							game.app.stage.addChild(a.getGraphics());
							game.asteroids.push(a);
						});
						game.score += SCORES.MIDDLE;
					}
					else if (a.type == ASTEROID_TYPE.SMALL) {
						game.score += SCORES.SMALL;
					}

					game.emitter.updateSpawnPos(a.x, a.y);
					game.emitter.resetPositionTracking();
					game.emitter.emit = true;

					updateScore();

					if (game.asteroids.length == 0) {
						levelCompleted();
					}

					continue bulletsLoop;
				}
			}
		}
	}
}

function mainScreen(createAsteroids) {
	game.state = STATES.MAINSCREEN;
	game.ship.visible = false;

	removeTitleText();

	if (createAsteroids) {
		removeAsteroids();
		game.asteroids = createBigAsteroids(4);
		for(var i = 0; i < game.asteroids.length; i++)
			game.app.stage.addChild(game.asteroids[i].getGraphics());
	}

	createCenterText('Press S to start')
	createTitleText();
}

function startGame() {
	game.level = 1;
	game.score = 0;
	game.lives = 3;
	updateScore();
	updateLives();
	removeTitleText();
	removeAsteroids();

	var x = game.width / 2;
	var y = game.height / 2;
	var rotation = 0;
	game.ship.x = x;
	game.ship.y = y;
	game.ship.rotation = rotation;

	game.state = STATES.DEAD;

	startLevel();
}

function levelCompleted() {
	game.level++;
	game.timeline.add(new TimelineEvent(startLevel,	120));
}

function startLevel() {
	game.timeline.add(new TimelineEvent(
		function () {
			createCenterText('Level ' + game.level);

			game.asteroids = createBigAsteroids(getAsteroidCount(game.level));
			for(var i = 0; i < game.asteroids.length; i++)
				game.app.stage.addChild(game.asteroids[i].getGraphics());
		},
		0
	));

	game.timeline.add(new TimelineEvent(
		function () {
			game.app.stage.removeChild(game.texts.center);
			game.texts.center = null;

			// TODO: Tarkista, että asteroidit ovat tarpeeksi kaukana aluksesta
			if (game.state != STATES.ALIVE)
				respawnShip();
		},
		180
	));
}

function removeTitleText() {
	if (game.texts.title) {
		game.app.stage.removeChild(game.texts.title);
		game.texts.title = null;
	}
}

function createTitleText() {
	game.texts.title = new PIXI.extras.BitmapText('Asteroids', {font: game.font});
	game.texts.title.x = Math.round((game.width - game.texts.title.width) / 2);
	game.texts.title.y = 150;
	game.texts.title.zIndex = 1;
	game.app.stage.addChildAt(game.texts.title);
}

function createCenterText(text) {
	if (game.texts.center) {
		game.app.stage.removeChild(game.texts.center);
		game.texts.center = null;
	}

	game.texts.center = new PIXI.extras.BitmapText(text, {font: game.font});
	game.texts.center.x = Math.round((game.width - game.texts.center.width) / 2);
	game.texts.center.y = Math.round((game.height - game.texts.center.height) / 2) - 15;
	game.texts.center.zIndex = 1;
	game.app.stage.addChildAt(game.texts.center);
}

function updateScore() {
	if (!game.texts.score) {
		game.texts.score = new PIXI.extras.BitmapText(game.score.toString(), {font: game.font});
		game.texts.score.anchor = new PIXI.Point(1, 0);
		game.texts.score.x = 785;
		game.texts.score.y = 0;
		game.texts.score.zIndex = 1;
	}
	else {
		game.texts.score.text = game.score.toString();
	}
}

function updateLives() {
	if (!game.texts.lives) {
		game.texts.lives = new PIXI.extras.BitmapText(game.lives.toString(), {font: game.font});
		game.texts.lives.anchor = new PIXI.Point(1, 0);
		game.texts.lives.x = 33;
		game.texts.lives.y = 0;
		game.texts.lives.zIndex = 1;
	}
	else {
		game.texts.lives.text = game.lives.toString();
	}
}

function shipHit() {
	game.state = STATES.DEAD;
	game.lives--;
	updateLives();

	game.ship.stopAndHide();

	game.emitter.updateSpawnPos(game.ship.x, game.ship.y);
	game.emitter.resetPositionTracking();
	game.emitter.emit = true;

	if (game.lives > 0) {
		game.timeline.add(new TimelineEvent(respawnShip, 120));
	}
	else {
		game.timeline.add(new TimelineEvent(gameOver, 120));
	}
}

function gameOver() {
	createCenterText('Game over');
	game.timeline.add(new TimelineEvent(
		function () { mainScreen(false); },
		180
	));
}

function init() {
	var loader = new PIXI.loaders.Loader();
	loader.add('hyperspace', 'hyperspace.fnt');
	loader.load(function (loader, resources) {
		game.app = new PIXI.Application(game.width, game.height);
		document.body.appendChild(game.app.view);

		game.ship = new Ship(game.width / 2, game.height / 2, 0);
		game.app.stage.addChild(game.ship.getGraphics());
		game.app.stage.addChild(game.ship.afterburner.getGraphics());

		mainScreen(true);

		updateScore();
		game.app.stage.addChildAt(game.texts.score);

		updateLives()
		game.app.stage.addChildAt(game.texts.lives);

		game.bullets = [];

		game.emitter = new PIXI.particles.Emitter(
			game.app.stage,
			[PIXI.Texture.fromImage('FFFFFF-1.png')],
			game.emitterConfig
		);
		game.emitter.emit = false;

		game.timeline = new Timeline();

		game.app.ticker.add(function(delta) {
			gameLoop(delta);
		});

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);

		//test();
	});
}
init();

function test() {
	game.a = createPolygon([-7,-19, -24,-2, -12,19, 7,11, 2,-17], 100, 100, Math.PI*0);
	game.app.stage.addChild(game.a);

	var c = new PIXI.Graphics();
	c.lineStyle(1, 0xFFFFFF);  //(thickness, color)
	c.drawCircle(game.width / 2, game.height / 2, 200);
	c.endFill();
	game.app.stage.addChild(c);

	var p = new PIXI.Graphics();
	p.lineStyle(1, 0xffffff, 1);
	p.drawCircle(150, 150, 0);
	game.app.stage.addChild(p)

	var x;
	var y;
	for (x = 0; x < 800; x = x + 1) {
		for (y = 0; y < 600; y = y + 1) {
			if (SAT.pointInPolygon(new SAT.Vector(x, y), game.a.collisionPolygon)) p.drawCircle(x, y, 1);
		}
	}

	var p1 = new SAT.Polygon(new SAT.Vector(100, 100),[new SAT.Vector(50, 50), new SAT.Vector(150, 50), new SAT.Vector(150, 150), new SAT.Vector(50, 150)]);
	var c1 = new SAT.Circle(new SAT.Vector(100,100), 100);
	console.log(SAT.testPolygonCircle(p1, c1));
	console.log(SAT.testCirclePolygon(c1, p1));
}
