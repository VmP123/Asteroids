var game = {
	world: null,
	ship: null
}

function createAsteroid() {
	var asteroid = new PIXI.Graphics();
	asteroid.clear();
	asteroid.lineStyle(1, 0xffffff, 1);
	asteroid.drawPolygon([20,10, 40,30, 60,20, 80,60, 65,75, 10,70, 0,45, 20,10]);

	asteroid.pivot.x = 38;
	asteroid.pivot.y = 48;

	return asteroid;
}

function createAsteroids() {
	var asteroids = [];
	for(var i = 0; i < 10; i++) {
		var asteroid = createAsteroid();

		asteroid.x = (Math.random() * 540) + 40;
		asteroid.y = (Math.random() * 480);
		asteroid.rotation =  2 * Math.PI * Math.random();
		asteroid.speed = {};
		asteroid.speed.x = (Math.random() * 4) - 2;
		asteroid.speed.y = (Math.random() * 4) - 2;
		asteroids.push(asteroid);
	}

	return asteroids;
}

function createShip() {
	var vertices = [[10, 40], [20, 10], [30, 40], [10, 40]];
	var convexShape = new p2.Convex({ vertices: vertices });
	var convexBody = new p2.Body({
		mass: 1,
		position: [320,240],
		angularVelocity: 0,
		damping: 0.5
	});
	convexBody.addShape(convexShape);
	game.world.addBody(convexBody);
	game.shipBody = convexBody;

	console.log(convexBody);

	var ship = new PIXI.Graphics();

	ship.clear();
	ship.lineStyle(1, 0xffffff, 1);
	ship.drawPolygon([10,40, 20,10, 30,40, 10,40])

	// Suihkumoottori
	// ship.moveTo(15,40);
	// ship.lineTo(20,45);
	// ship.lineTo(25,40);

	ship.x = convexBody.position[0];
	ship.y = convexBody.position[1];

	ship.pivot.x = 20;
	ship.pivot.y = 27;

	ship.rotation = Math.PI * 0.25
	ship.rotationSpeed = 0.07;

	ship.acceleration = {};
	ship.acceleration.current = 0;
	ship.acceleration.x = 0;
	ship.acceleration.y = 0;

	ship.speed = {};
	ship.speed.x = 0;
	ship.speed.y = 0;

	return ship;
}

function warp(movingObject) {
	if (movingObject.x > 640)
		movingObject.x = 0;
	else if (movingObject.x < -0)
		movingObject.x = 640;

	if (movingObject.y > 480)
		movingObject.y = 0;
	else if (movingObject.y < 0)
		movingObject.y = 480;
}

function onKeyDown(key) {
	if (key.keyCode == 38) {
		game.ship.acceleration.current = 0.055;
		game.shipBody.force[1]=500;
	}
	if (key.keyCode == 37) {
		game.ship.rotationDirection = -1;
	}

	if (key.keyCode == 39) {
		game.ship.rotationDirection = 1;
	}
}

function onKeyUp(key) {
	if (key.keyCode == 38) {
		game.ship.acceleration.current = 0;
	}
	if (key.keyCode == 37 && game.ship.rotationDirection == -1) {
		game.ship.rotationDirection = 0;
	}
	else if (key.keyCode == 39 && game.ship.rotationDirection == 1) {
		game.ship.rotationDirection = 0;
	}
}

function init() {
	var app = new PIXI.Application(640, 480);
	document.body.appendChild(app.view);

	game.world = new p2.World({
		gravity: [0, 0]
	});

	game.asteroids = createAsteroids();
	for(var i = 0; i < game.asteroids.length; i++)
		app.stage.addChild(game.asteroids[i]);

	game.ship = createShip();
	//game.ship.x = 320;
	//game.ship.y = 240;
	app.stage.addChild(game.ship);

	app.ticker.add(function(delta) {
		game.world.step(delta/60);

		game.ship.x = game.shipBody.position[0];
		game.ship.y = game.shipBody.position[1];
		game.ship.rotation = game.shipBody.angle;

		// for(var i = 0; i < 10; i++) {
		// 	var asteroid = game.asteroids[i];
		//
		// 	asteroid.x += asteroid.speed.x * delta;
		// 	asteroid.y += asteroid.speed.y * delta;
		//
		// 	warp(asteroid);
		// }
		//
		// if (game.ship.acceleration.current != 0) {
		// 	game.ship.speed.x += Math.sin(game.ship.rotation) * game.ship.acceleration.current;
		// 	game.ship.speed.y += Math.cos(game.ship.rotation) * game.ship.acceleration.current;
		// }
		//
		// // Friction
		// game.ship.speed.x *= 0.995;
		// game.ship.speed.y *= 0.995;
		//
		// if (game.ship.rotationDirection)
		// 	game.ship.rotation += game.ship.rotationSpeed * delta * game.ship.rotationDirection;
		//
		// if (game.ship.speed.x != 0)
		// 	game.ship.x += delta * game.ship.speed.x;
		//
		// if (game.ship.speed.y != 0)
		// 	game.ship.y -= delta * game.ship.speed.y;
		//
		// warp(game.ship);
	});

	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);
}
init();
