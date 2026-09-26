import { Graphics } from 'pixi.js';
import { Vector, pointInPolygon } from 'sat';

export default class CollisionPointGraphics {
	constructor (x, y, scale = 1) {
		this.graphics = new Graphics(true);
		this.graphics.lineStyle(1, 0xffffff, 1);
		this.graphics.moveTo(0,1);
		this.graphics.lineTo(0,0);

		this.graphics.x = x;
		this.graphics.y = y;
		this.setScale(scale);

		this.collisionPoint = new Vector(x, y);
	}

	setScale(scale) {
		if (scale && scale > 0) {
			this.graphics.scale.set(1 / scale, 1 / scale);
		}
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
		if (collisionPolygonGraphics.getCollisionPolygons) {
			var polys = collisionPolygonGraphics.getCollisionPolygons();
			for (var i = 0; i < polys.length; i++) {
				if (pointInPolygon(this.collisionPoint, polys[i])) {
					return true;
				}
			}
			return false;
		}
		return pointInPolygon(this.collisionPoint, collisionPolygonGraphics.getCollisionPolygon());
	}
}