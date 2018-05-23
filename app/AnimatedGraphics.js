import { Graphics } from 'pixi.js';

export default class AnimatedGraphics {
	constructor(init, animate, lastFrame) {
		this.graphics = new Graphics();
		this.currentFrame = 0;
		this.lastFrame = lastFrame;
		this.animate = animate;
		this.state = 0;
		this.init = init;
		this.init();
		this.graphics.visible = false;
	}

	set x(x) {
		this.graphics.x = x;
	}

	get x() {
		return this.graphics.x;
	}

	set y(y) {
		this.graphics.y = y;
	}

	get y() {
		return this.graphics.y;
	}

	set rotation(rotation) {
		this.graphics.rotation = rotation;
	}

	get rotation() {
		return this.graphics.rotation;
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