import CollisionPointGraphics from './CollisionPointGraphics.js';

export default class Bullet extends CollisionPointGraphics {
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