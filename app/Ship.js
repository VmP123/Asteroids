import CollisionPolygonGraphics from './CollisionPolygonGraphics.js';
import AnimatedGraphics from './AnimatedGraphics.js'

export default class Ship extends CollisionPolygonGraphics {
	constructor(x, y, rotation) {
		super([0,-17, -11,13, 11,13], x, y, rotation);
		this.acceleration = 0;
		this.speed = {x: 0, y: 0, rotation: 0.07};

		this.afterburner = new AnimatedGraphics(function () {
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