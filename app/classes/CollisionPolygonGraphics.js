import { Graphics } from 'pixi.js';
import { Polygon, Vector, testPolygonPolygon } from 'sat';

export default class CollisionPolygonGraphics {
	constructor(points, x, y, rotation) {
		var pointsWithEndPoints = points.slice();
		pointsWithEndPoints.push(points[0]);
		pointsWithEndPoints.push(points[1]);

		this.graphics = new Graphics();
		this.graphics.lineStyle(1, 0xffffff, 1);
		this.graphics.drawPolygon(pointsWithEndPoints);
		this.graphics.x = x;
		this.graphics.y = y;
		this.graphics.rotation = rotation;

		this.collisionPolygon = new Polygon(new Vector(0, 0), this.createVectors(points));
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
		return testPolygonPolygon(this.getCollisionPolygon(), anotherCollisionPolygonGraphics.getCollisionPolygon());
	}

	createVectors(points) {
		var vectors = []
		var i;
		for (i = 0; i < points.length / 2; i++) {
			vectors.push(new Vector(points[i * 2], points[(i * 2) + 1]));
		}

		return vectors;
	}
}