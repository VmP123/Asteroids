import { Container, Graphics } from 'pixi.js';
import { Polygon, Vector, testPolygonPolygon } from 'sat';

export default class CollisionPolygonGraphics {
	constructor(points, x, y, rotation, options = {}) {
		var pointsWithEndPoints = points.slice();
		pointsWithEndPoints.push(points[0]);
		pointsWithEndPoints.push(points[1]);

		this._points = points;
		this._pointsWithEndPoints = pointsWithEndPoints;

		var maxR = 0;
		for (var i = 0; i < points.length; i += 2) {
			var px = points[i];
			var py = points[i + 1];
			var dist = Math.sqrt(px * px + py * py);
			if (dist > maxR) {
				maxR = dist;
			}
		}
		this.radius = options.radius || maxR;

		this.wrapToroidal = options.wrapToroidal || false;
		this.wrapWidth = options.wrapWidth || 800;
		this.wrapHeight = options.wrapHeight || 600;
		this.hasEnteredField = options.hasEnteredField !== undefined ? options.hasEnteredField : true;

		this._x = x;
		this._y = y;
		this._rotation = rotation;

		this.collisionPolygon = new Polygon(new Vector(0, 0), this.createVectors(points));

		if (this.wrapToroidal) {
			this.container = new Container();
			this.graphics = this.container;

			this.mainGraphics = new Graphics(true);
			this.mainGraphics.lineStyle(1, 0xffffff, 1);
			this.mainGraphics.drawPolygon(pointsWithEndPoints);
			this.container.addChild(this.mainGraphics);

			this.ghostX = new Graphics(true);
			this.ghostX.lineStyle(1, 0xffffff, 1);
			this.ghostX.drawPolygon(pointsWithEndPoints);
			this.ghostX.visible = false;
			this.container.addChild(this.ghostX);
			this.ghostPolygonX = new Polygon(new Vector(0, 0), this.createVectors(points));

			this.ghostY = new Graphics(true);
			this.ghostY.lineStyle(1, 0xffffff, 1);
			this.ghostY.drawPolygon(pointsWithEndPoints);
			this.ghostY.visible = false;
			this.container.addChild(this.ghostY);
			this.ghostPolygonY = new Polygon(new Vector(0, 0), this.createVectors(points));

			this.ghostCorner = new Graphics(true);
			this.ghostCorner.lineStyle(1, 0xffffff, 1);
			this.ghostCorner.drawPolygon(pointsWithEndPoints);
			this.ghostCorner.visible = false;
			this.container.addChild(this.ghostCorner);
			this.ghostPolygonCorner = new Polygon(new Vector(0, 0), this.createVectors(points));
		} else {
			this.graphics = new Graphics(true);
			this.graphics.lineStyle(1, 0xffffff, 1);
			this.graphics.drawPolygon(pointsWithEndPoints);
			this.mainGraphics = this.graphics;
		}

		this.updateTransforms();
	}

	updateTransforms() {
		var x = this._x;
		var y = this._y;
		var rot = this._rotation;

		this.mainGraphics.x = x;
		this.mainGraphics.y = y;
		this.mainGraphics.rotation = rot;

		this.collisionPolygon.pos.x = x;
		this.collisionPolygon.pos.y = y;
		this.collisionPolygon.setAngle(rot);

		if (!this.wrapToroidal) {
			return;
		}

		var W = this.wrapWidth;
		var H = this.wrapHeight;
		var R = this.radius;

		if (!this.hasEnteredField) {
			if (x - R >= 0 && x + R <= W && y - R >= 0 && y + R <= H) {
				this.hasEnteredField = true;
			} else {
				if (this.ghostX) this.ghostX.visible = false;
				if (this.ghostY) this.ghostY.visible = false;
				if (this.ghostCorner) this.ghostCorner.visible = false;
				return;
			}
		}

		var dx = 0;
		if (x - R < 0) {
			dx = W;
		} else if (x + R > W) {
			dx = -W;
		}

		var dy = 0;
		if (y - R < 0) {
			dy = H;
		} else if (y + R > H) {
			dy = -H;
		}

		if (dx !== 0) {
			this.ghostX.visible = true;
			this.ghostX.x = x + dx;
			this.ghostX.y = y;
			this.ghostX.rotation = rot;

			this.ghostPolygonX.pos.x = x + dx;
			this.ghostPolygonX.pos.y = y;
			this.ghostPolygonX.setAngle(rot);
		} else {
			this.ghostX.visible = false;
		}

		if (dy !== 0) {
			this.ghostY.visible = true;
			this.ghostY.x = x;
			this.ghostY.y = y + dy;
			this.ghostY.rotation = rot;

			this.ghostPolygonY.pos.x = x;
			this.ghostPolygonY.pos.y = y + dy;
			this.ghostPolygonY.setAngle(rot);
		} else {
			this.ghostY.visible = false;
		}

		if (dx !== 0 && dy !== 0) {
			this.ghostCorner.visible = true;
			this.ghostCorner.x = x + dx;
			this.ghostCorner.y = y + dy;
			this.ghostCorner.rotation = rot;

			this.ghostPolygonCorner.pos.x = x + dx;
			this.ghostPolygonCorner.pos.y = y + dy;
			this.ghostPolygonCorner.setAngle(rot);
		} else {
			this.ghostCorner.visible = false;
		}
	}

	set x(x) {
		this._x = x;
		this.updateTransforms();
	}

	get x() {
		return this._x;
	}

	set y(y) {
		this._y = y;
		this.updateTransforms();
	}

	get y() {
		return this._y;
	}

	set rotation(rotation) {
		this._rotation = rotation;
		this.updateTransforms();
	}

	get rotation() {
		return this._rotation;
	}

	set visible(visible) {
		this.graphics.visible = visible;
	}

	get visible() {
		return this.graphics.visible;
	}

	getGraphics() {
		return this.graphics;
	}

	getCollisionPolygon() {
		return this.collisionPolygon;
	}

	getCollisionPolygons() {
		var polys = [this.collisionPolygon];
		if (this.wrapToroidal) {
			if (this.ghostX && this.ghostX.visible) {
				polys.push(this.ghostPolygonX);
			}
			if (this.ghostY && this.ghostY.visible) {
				polys.push(this.ghostPolygonY);
			}
			if (this.ghostCorner && this.ghostCorner.visible) {
				polys.push(this.ghostPolygonCorner);
			}
		}
		return polys;
	}

	collision(another) {
		var myPolys = this.getCollisionPolygons();
		var otherPolys = another.getCollisionPolygons ? another.getCollisionPolygons() : [another.getCollisionPolygon()];

		for (var i = 0; i < myPolys.length; i++) {
			for (var j = 0; j < otherPolys.length; j++) {
				if (testPolygonPolygon(myPolys[i], otherPolys[j])) {
					return true;
				}
			}
		}
		return false;
	}

	createVectors(points) {
		var vectors = [];
		for (var i = 0; i < points.length / 2; i++) {
			vectors.push(new Vector(points[i * 2], points[(i * 2) + 1]));
		}
		return vectors;
	}
}