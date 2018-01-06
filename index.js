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

const STATES = {
	ALIVE: 1,
	DEAD: 2,
	GAMEOVER: 3,
	MAINSCREEN: 4
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
		game.app.stage.removeChild(asteroid);
	});
	game.asteroids = [];
}

function createBigAsteroids(count) {
	var asteroids = [];
	for(var i = 0; i < count; i++) {
		var x = (Math.random() * 540) + 40;
		var y = (Math.random() * 480);
		var rotation = 2 * Math.PI * Math.random();
		//var rotation = 0.25 * Math.PI;

		var a = createPolygon([-18,-38, -38,-3, -28,22, 27,27, 42,12, 22,-28, -18,-38], x, y, rotation);
		a.speed = {x: (Math.random() * 4) - 2, y: (Math.random() * 4) - 2};
		a.type = ASTEROID_TYPE.BIG;

		asteroids.push(a);
	}

	return asteroids;
}

function createVectors(points) {
	var vectors = []
	for (i = 0; i < points.length / 2; i++) {
		vectors.push(new SAT.Vector(points[i], points[i + 1]));
	}
	return vectors;
}

function createPolygon(points, x, y, rotation) {
	var p = new PIXI.Graphics();
	p.lineStyle(1, 0xffffff, 1);
	p.drawPolygon(points);
	p.x = x;
	p.y = y;
	p.rotation = rotation;
	p.collisionPolygon = new SAT.Polygon(new SAT.Vector(0, 0), createVectors(points));
	p.collisionPolygon.pos.x = x;
	p.collisionPolygon.pos.y = x;
	p.collisionPolygon.setAngle(rotation);

	return p;
}

function createAsteroidGroup(x, y, rotation, distance, points, type, rotationOffset, count) {
	var asteroids = []
	var speed = 0.5 + Math.random() * 1.5;

	for(var i = 0; i < count; i++) {
		var rot = rotation + ((((2 / count) * i)) * Math.PI + rotationOffset)
		xd = distance * Math.cos(rot);
		yd = distance * Math.sin(rot);
		a = createPolygon(points, x + xd, y + yd, 2 * Math.PI * Math.random());
		a.speed = {x: speed * Math.cos(rot), y: speed * Math.sin(rot)}
		a.type = type;
		asteroids.push(a);
	}

	return asteroids;
}

function createSmallestAsteroids(oa) {
	var points = [-8,-8, -7,10, 7,8, 9,-9, 0,-13, -8,-8];
	var asteroids = createAsteroidGroup(oa.x, oa.y, oa.rotation, 4, points, ASTEROID_TYPE.SMALL, 0.5 * Math.PI, 2)

	return asteroids;

	return [];
}

function createSmallAsteroids(oa) {
	var points = [-7,-19, -24,-2, -12,19, 7,11, 2,-17, -7,-19];
	var asteroids = createAsteroidGroup(oa.x, oa.y, oa.rotation, 11, points, ASTEROID_TYPE.MIDDLE, 0.25 * Math.PI, 4)

	return asteroids;
}

function createShip() {
	var ship = createPolygon([0,-17, -11,13, 11,13, 0,-17], game.width / 2, game.height / 2, 0 /*Math.PI * 0.25*/);
	ship.acceleration = {x: 0, y: 0, total: 0};
	ship.speed = {x: 0, y: 0, rotation: 0.07};

	ship.afterburner = new AnimatedGraphics(function (frame) {
		this.graphics.lineStyle(1, 0xffffff, 1);

		this.graphics.moveTo(-5, 14);
		this.graphics.lineTo(0, 22);
		this.graphics.lineTo(5, 14);
	},
	function (frame) {
		this.graphics.x = game.ship.x;
		this.graphics.y = game.ship.y;
		this.graphics.rotation = game.ship.rotation;

		if (frame != 0 && frame % 5 == 0) {
			this.graphics.visible = !this.graphics.visible;
		}
	});

	return ship;
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

function createBullet() {
	var bullet = new PIXI.Graphics();
	bullet.lineStyle(1, 0xffffff, 1);

	game.lastBulletCreated = 0;

	bullet.moveTo(0,1);
	bullet.lineTo(0,0);

	Math.cos(game.ship.rotation);
	bullet.x = game.ship.x + Math.cos(game.ship.rotation + 0.5 * Math.PI) * (-17);
	bullet.y = game.ship.y + Math.sin(game.ship.rotation + 0.5 * Math.PI) * (-17);
	bullet.collisionPoint = new SAT.Vector(bullet.x, bullet.y);

	bullet.lifespan = 40;
	bullet.age = 0;

	var speed = 6;
	bullet.speed = {};
	bullet.speed.x = Math.sin(game.ship.rotation) * speed;
	bullet.speed.y = -Math.cos(game.ship.rotation) * speed;

	return bullet;
}

function tryCreateBullet() {
	if (Date.now() - game.lastBulletCreated > game.bulletDelay) {
		var bullet = createBullet();
		game.lastBulletCreated = Date.now();
		game.app.stage.addChild(bullet);
		game.bullets.push(bullet);
	}
}

function getAsteroidCount(levelNumber) {
	return levelNumber + 1;
}

function onKeyDown(key) {
	if (game.state == STATES.ALIVE) {
		if (key.keyCode == 38) {
			if (!game.ship.acceleration.total) {
				game.ship.acceleration.total = 0.055;

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
			game.ship.acceleration.total = 0;
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

function handleTimeline(delta) {
	if (game.timeline.length == 0)
		return;

	var task = game.timeline[0];
	task.d -= delta;

	if (task.d <= 0) {
		if (task.f)
			task.f();
		game.timeline.splice(0, 1);
	}
}

function gameLoop(delta) {
	//delta *= 0.1

	if (game.state == STATES.GAMEOVER) {
		return;
	}

	handleTimeline(delta);

	game.emitter.update(delta/60);

	//ship
	if (game.ship.acceleration.total != 0) {
		game.ship.speed.x += Math.sin(game.ship.rotation) * game.ship.acceleration.total;
		game.ship.speed.y += Math.cos(game.ship.rotation) * game.ship.acceleration.total;
	}

	// Friction
	game.ship.speed.x *= 0.995;
	game.ship.speed.y *= 0.995;

	if (game.ship.rotationDirection)
		game.ship.rotation += game.ship.speed.rotation * delta * game.ship.rotationDirection;

	if (game.ship.speed.x != 0)
		game.ship.x += delta * game.ship.speed.x;

	if (game.ship.speed.y != 0)
		game.ship.y -= delta * game.ship.speed.y;

	warp(game.ship);
	game.ship.collisionPolygon.pos.x = game.ship.x;
	game.ship.collisionPolygon.pos.y = game.ship.y;
	game.ship.collisionPolygon.setAngle(game.ship.rotation);

	game.ship.afterburner.update();

	//Asteroids
	for(var i = 0; i < game.asteroids.length; i++) {
		var asteroid = game.asteroids[i];

		asteroid.x += asteroid.speed.x * delta;
		asteroid.y += asteroid.speed.y * delta;
		warp(asteroid);
		asteroid.collisionPolygon.pos.x = asteroid.x;
		asteroid.collisionPolygon.pos.y = asteroid.y;

		if (game.state == STATES.ALIVE) {
			var hit = SAT.testPolygonPolygon(game.ship.collisionPolygon, asteroid.collisionPolygon)
			if (hit)
				shipHit();
		}
	}

	// Bullets
	bulletsLoop:
	for(var i = game.bullets.length - 1; i >= 0; i--) {
		game.bullets[i].x += delta * game.bullets[i].speed.x;
		game.bullets[i].y += delta * game.bullets[i].speed.y;
		warp(game.bullets[i]);
		game.bullets[i].collisionPoint.x = game.bullets[i].x;
		game.bullets[i].collisionPoint.y = game.bullets[i].y;

		if (game.bullets[i].age > game.bullets[i].lifespan) {
			game.app.stage.removeChild(game.bullets[i]);
			game.bullets.splice(i, 1);
		} else {
			game.bullets[i].age += delta;

			for (var j = game.asteroids.length - 1; j >= 0 ; j--) {
				if (SAT.pointInPolygon(game.bullets[i].collisionPoint, game.asteroids[j].collisionPolygon)) {
					game.app.stage.removeChild(game.bullets[i]);
					game.bullets.splice(i, 1);
					game.app.stage.removeChild(game.asteroids[j]);
					var a = game.asteroids.splice(j, 1)[0];
					if (a.type == ASTEROID_TYPE.BIG) {
						var smallAsteroids = createSmallAsteroids(a);
						smallAsteroids.forEach(function (sa) {
							game.app.stage.addChild(sa);
							game.asteroids.push(sa);
						});
						game.score += SCORES.BIG;
					}
					else if (a.type == ASTEROID_TYPE.MIDDLE) {
						var smallestAsteroids = createSmallestAsteroids(a);
						smallestAsteroids.forEach(function (sa) {
							game.app.stage.addChild(sa);
							game.asteroids.push(sa);
						});
						game.score += SCORES.MIDDLE;
					}
					else if (a.type == ASTEROID_TYPE.SMALL) {
						game.score += SCORES.SMALL;
					}
					game.emitter.updateSpawnPos(a.x, a.y);
					game.emitter.resetPositionTracking();
					game.emitter.emit = true;

					updateScore(game.score.toString());

					if (game.asteroids.length == 0) {
						levelCompleted();
					}


					continue bulletsLoop;
				}
			}
		}
	}
}

function mainScreen() {
	game.state = STATES.MAINSCREEN;
	game.ship.visible = false;

	game.asteroids = createBigAsteroids(4);
	for(var i = 0; i < game.asteroids.length; i++)
		game.app.stage.addChild(game.asteroids[i]);

	createCenterText('Press S to start')
	createTitleText();
}

function startGame() {
	game.level = 1;
	game.score = 0;
	removeTitleText();
	removeAsteroids();
	startLevel();
}

function levelCompleted() {
	console.log('levelCompleted');

	game.level++;
	game.timeline.push({
		f: function () {
			startLevel();
		},
		d:120
	});
}

function startLevel() {
	game.timeline.push({
		f: function () {
			createCenterText('Level ' + game.level);

			game.asteroids = createBigAsteroids(getAsteroidCount(game.level));
			for(var i = 0; i < game.asteroids.length; i++)
				game.app.stage.addChild(game.asteroids[i]);
		},
		d:0
	});

	game.timeline.push({
		f: function () {
			game.app.stage.removeChild(game.texts.center);
			game.texts.center = null;

			game.state = STATES.ALIVE;
			game.ship.visible = true;
		},
		d:180
	});
}

function removeTitleText() {
	game.app.stage.removeChild(game.texts.title);
	game.texts.title = null;
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

function updateScore(text) {
	if (!game.texts.score) {
		game.texts.score = new PIXI.extras.BitmapText(text, {font: game.font});
		game.texts.score.anchor = new PIXI.Point(1, 0);
		game.texts.score.x = 785;
		game.texts.score.y = 0;
		game.texts.score.zIndex = 1;
	}
	else {
		game.texts.score.text = text
	}
}

function stopShip() {
	game.ship.acceleration.total = 0;
	game.ship.speed.x = 0;
	game.ship.speed.y = 0;
	game.ship.afterburner.stopAndHide();
}

function shipHit() {
	game.state = STATES.DEAD;

	stopShip();

	game.app.stage.removeChild(game.ship);

	game.emitter.updateSpawnPos(game.ship.x, game.ship.y);
	game.emitter.resetPositionTracking();
	game.emitter.emit = true;
}

function init() {
	var loader = new PIXI.loaders.Loader();
	loader.add('hyperspace', 'hyperspace.fnt');
	loader.load(function (loader, resources) {
		game.app = new PIXI.Application(game.width, game.height);
		document.body.appendChild(game.app.view);

		game.ship = createShip();
		game.app.stage.addChild(game.ship);
		game.app.stage.addChild(game.ship.afterburner.getGraphics());

		mainScreen();

		updateScore(game.score.toString());
		game.app.stage.addChildAt(game.texts.score);

		game.bullets = [];

		game.emitter = new PIXI.particles.Emitter(
			game.app.stage,
			[PIXI.Texture.fromImage('FFFFFF-1.png')],
			game.emitterConfig
		);
		game.emitter.emit = false;

		game.app.ticker.add(function(delta) {
			gameLoop(delta);
		});

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
	});
}
init();
