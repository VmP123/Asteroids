import { Container, Graphics } from 'pixi.js';

export default class AnimatedGraphics {
	constructor(init, animate, lastFrame, options = {}) {
		this.wrapToroidal = options.wrapToroidal || false;
		this.wrapWidth = options.wrapWidth || 800;
		this.wrapHeight = options.wrapHeight || 600;
		this.radius = options.radius || 25;

		this._x = 0;
		this._y = 0;
		this._rotation = 0;

		this.currentFrame = 0;
		this.lastFrame = lastFrame;
		this.animate = animate;
		this.state = 0;
		this.init = init;

		if (this.wrapToroidal) {
			this.container = new Container();
			this.graphics = this.container;

			this.mainGraphics = new Graphics(true);
			this.init.call({ graphics: this.mainGraphics });
			this.container.addChild(this.mainGraphics);

			this.ghostX = new Graphics(true);
			this.init.call({ graphics: this.ghostX });
			this.ghostX.visible = false;
			this.container.addChild(this.ghostX);

			this.ghostY = new Graphics(true);
			this.init.call({ graphics: this.ghostY });
			this.ghostY.visible = false;
			this.container.addChild(this.ghostY);

			this.ghostCorner = new Graphics(true);
			this.init.call({ graphics: this.ghostCorner });
			this.ghostCorner.visible = false;
			this.container.addChild(this.ghostCorner);
		} else {
			this.graphics = new Graphics(true);
			this.mainGraphics = this.graphics;
			this.init();
		}

		this.graphics.visible = false;
		this.updateTransforms();
	}

	updateTransforms() {
		var x = this._x;
		var y = this._y;
		var rot = this._rotation;

		this.mainGraphics.x = x;
		this.mainGraphics.y = y;
		this.mainGraphics.rotation = rot;

		if (!this.wrapToroidal) {
			return;
		}

		var W = this.wrapWidth;
		var H = this.wrapHeight;
		var R = this.radius;

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
		} else {
			this.ghostX.visible = false;
		}

		if (dy !== 0) {
			this.ghostY.visible = true;
			this.ghostY.x = x;
			this.ghostY.y = y + dy;
			this.ghostY.rotation = rot;
		} else {
			this.ghostY.visible = false;
		}

		if (dx !== 0 && dy !== 0) {
			this.ghostCorner.visible = true;
			this.ghostCorner.x = x + dx;
			this.ghostCorner.y = y + dy;
			this.ghostCorner.rotation = rot;
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