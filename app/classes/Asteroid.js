import CollisionPolygonGraphics from './CollisionPolygonGraphics.js';
import { ASTEROID_TYPE } from '../enums.js';

export default class Asteroid extends CollisionPolygonGraphics {
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
		this.x += this.speed.x * delta;
		this.y += this.speed.y * delta;
	}
}