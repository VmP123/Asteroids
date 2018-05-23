import { Graphics } from 'pixi.js';
import { Vector, pointInPolygon } from 'sat';

export default class CollisionPointGraphics {
	constructor (x, y) {
		this.graphics = new Graphics();
		this.graphics.lineStyle(1, 0xffffff, 1);
		this.graphics.moveTo(0,1);
		this.graphics.lineTo(0,0);

		this.graphics.x = x;
		this.graphics.y = y;

		this.collisionPoint = new Vector(x, y);
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
		return pointInPolygon(this.collisionPoint, collisionPolygonGraphics.getCollisionPolygon());
	}
}