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
		var r = collisionPolygonGraphics.radius || 0;
		var rSq = r * r;

		if (collisionPolygonGraphics.getCollisionPolygons) {
			var polys = collisionPolygonGraphics.getCollisionPolygons();
			for (var i = 0; i < polys.length; i++) {
				var poly = polys[i];
				if (rSq > 0) {
					var dx = this.collisionPoint.x - poly.pos.x;
					var dy = this.collisionPoint.y - poly.pos.y;
					if (dx * dx + dy * dy > rSq) {
						continue;
					}
				}
				if (pointInPolygon(this.collisionPoint, poly)) {
					return true;
				}
			}
			return false;
		}

		var singlePoly = collisionPolygonGraphics.getCollisionPolygon();
		if (rSq > 0) {
			var dX = this.collisionPoint.x - singlePoly.pos.x;
			var dY = this.collisionPoint.y - singlePoly.pos.y;
			if (dX * dX + dY * dY > rSq) {
				return false;
			}
		}
		return pointInPolygon(this.collisionPoint, singlePoly);
	}
}