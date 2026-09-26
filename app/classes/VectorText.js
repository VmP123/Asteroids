import { Container, Graphics, Point } from 'pixi.js';

const GLYPHS = {
	'0': [
		[[0, 0], [18, 0], [18, 28], [0, 28], [0, 0]]
	],
	'1': [
		[[9, 0], [9, 28]]
	],
	'2': [
		[[0, 0], [18, 0], [18, 14], [0, 14], [0, 28], [18, 28]]
	],
	'3': [
		[[0, 0], [18, 0], [18, 28], [0, 28]],
		[[0, 14], [18, 14]]
	],
	'4': [
		[[0, 0], [0, 14], [18, 14]],
		[[18, 0], [18, 28]]
	],
	'5': [
		[[18, 0], [0, 0], [0, 14], [18, 14], [18, 28], [0, 28]]
	],
	'6': [
		[[0, 0], [0, 28], [18, 28], [18, 14], [0, 14]]
	],
	'7': [
		[[0, 0], [18, 0], [18, 28]]
	],
	'8': [
		[[0, 0], [18, 0], [18, 28], [0, 28], [0, 0]],
		[[0, 14], [18, 14]]
	],
	'9': [
		[[0, 14], [0, 0], [18, 0], [18, 28]],
		[[0, 14], [18, 14]]
	],
	'A': [
		[[0, 28], [0, 9], [9, 0], [18, 9], [18, 28]],
		[[0, 19], [18, 19]]
	],
	'B': [
		[[0, 0], [0, 28]],
		[[0, 0], [14, 0], [18, 4], [18, 10], [14, 14], [0, 14]],
		[[14, 14], [18, 18], [18, 24], [14, 28], [0, 28]]
	],
	'C': [
		[[18, 0], [0, 0], [0, 28], [18, 28]]
	],
	'D': [
		[[0, 0], [0, 28]],
		[[0, 0], [9, 0], [18, 9], [18, 19], [9, 28], [0, 28]]
	],
	'E': [
		[[18, 0], [0, 0], [0, 28], [18, 28]],
		[[0, 14], [14, 14]]
	],
	'F': [
		[[0, 28], [0, 0], [18, 0]],
		[[0, 14], [14, 14]]
	],
	'G': [
		[[18, 9], [18, 0], [0, 0], [0, 28], [18, 28], [18, 19], [9, 19]]
	],
	'H': [
		[[0, 0], [0, 28]],
		[[18, 0], [18, 28]],
		[[0, 14], [18, 14]]
	],
	'I': [
		[[0, 0], [18, 0]],
		[[9, 0], [9, 28]],
		[[0, 28], [18, 28]]
	],
	'J': [
		[[18, 0], [18, 28], [9, 28], [0, 19]]
	],
	'K': [
		[[0, 0], [0, 28]],
		[[18, 0], [0, 14], [18, 28]]
	],
	'L': [
		[[0, 0], [0, 28], [18, 28]]
	],
	'M': [
		[[0, 28], [0, 0], [9, 9], [18, 0], [18, 28]]
	],
	'N': [
		[[0, 28], [0, 0], [18, 28], [18, 0]]
	],
	'O': [
		[[0, 0], [18, 0], [18, 28], [0, 28], [0, 0]]
	],
	'P': [
		[[0, 28], [0, 0], [18, 0], [18, 14], [0, 14]]
	],
	'Q': [
		[[0, 0], [18, 0], [18, 28], [0, 28], [0, 0]],
		[[9, 19], [18, 28]]
	],
	'R': [
		[[0, 28], [0, 0], [18, 0], [18, 14], [0, 14]],
		[[0, 14], [18, 28]]
	],
	'S': [
		[[18, 0], [0, 0], [0, 14], [18, 14], [18, 28], [0, 28]]
	],
	'T': [
		[[0, 0], [18, 0]],
		[[9, 0], [9, 28]]
	],
	'U': [
		[[0, 0], [0, 28], [18, 28], [18, 0]]
	],
	'V': [
		[[0, 0], [9, 28], [18, 0]]
	],
	'W': [
		[[0, 0], [0, 28], [9, 20], [18, 28], [18, 0]]
	],
	'X': [
		[[0, 0], [18, 28]],
		[[18, 0], [0, 28]]
	],
	'Y': [
		[[0, 0], [9, 10], [18, 0]],
		[[9, 10], [9, 28]]
	],
	'Z': [
		[[0, 0], [18, 0], [0, 28], [18, 28]]
	],
	' ': [],
	'-': [
		[[0, 14], [18, 14]]
	],
	':': [
		[[9, 7], [9, 9]],
		[[9, 19], [9, 21]]
	],
	'.': [
		[[9, 27], [9, 28]]
	],
	'!': [
		[[9, 0], [9, 24]],
		[[9, 27], [9, 28]]
	],
	'?': [
		[[0, 0], [18, 0], [18, 14], [9, 14], [9, 24]],
		[[9, 27], [9, 28]]
	],
	'<': [
		[[18, 0], [0, 14], [18, 28]]
	],
	'>': [
		[[0, 0], [18, 14], [0, 28]]
	],
	'(': [
		[[9, 0], [0, 9], [0, 19], [9, 28]]
	],
	')': [
		[[0, 0], [9, 9], [9, 19], [0, 28]]
	]
};

export default class VectorText extends Container {
	constructor(text = '', options = {}) {
		super();
		this._text = text !== undefined && text !== null ? text.toString() : '';
		this._anchor = new Point(0, 0);
		this.charWidth = 19;
		this.charHeight = 29;
		this.advance = 24;
		this.lineHeight = 48;
		this.yOffset = 11;

		var parsedScale = 1;
		if (options.font && typeof options.font === 'string') {
			var match = options.font.match(/(\d+)px/);
			if (match) {
				parsedScale = parseInt(match[1], 10) / 48;
			}
		} else if (options.size && typeof options.size === 'number') {
			parsedScale = options.size / 48;
		}
		this._fontScale = parsedScale;

		this.graphics = new Graphics(true);
		this.addChild(this.graphics);
		this.renderText();
	}

	get anchor() {
		return this._anchor;
	}

	set anchor(point) {
		if (typeof point === 'number') {
			this._anchor.set(point, point);
		} else if (point) {
			this._anchor.x = point.x !== undefined ? point.x : 0;
			this._anchor.y = point.y !== undefined ? point.y : 0;
		}
		this.renderText();
	}

	get text() {
		return this._text;
	}

	set text(value) {
		var str = value !== undefined && value !== null ? value.toString() : '';
		if (this._text !== str) {
			this._text = str;
			this.renderText();
		}
	}

	renderText() {
		this.graphics.clear();
		this.graphics.lineStyle(1, 0xffffff, 1);

		var str = (this._text || '').toUpperCase();
		var len = str.length;
		if (len === 0) {
			this._calculatedWidth = 0;
			this._calculatedHeight = 0;
			return;
		}

		var scale = this._fontScale;
		var totalWidth = ((len - 1) * this.advance + this.charWidth) * scale;
		var totalHeight = this.lineHeight * scale;
		this._calculatedWidth = totalWidth;
		this._calculatedHeight = totalHeight;

		var offsetX = -this._anchor.x * totalWidth;
		var offsetY = -this._anchor.y * totalHeight;

		for (var i = 0; i < len; i++) {
			var char = str[i];
			var glyph = GLYPHS[char];
			if (glyph) {
				var charX = offsetX + i * this.advance * scale;
				var charY = offsetY + this.yOffset * scale;
				for (var s = 0; s < glyph.length; s++) {
					var segment = glyph[s];
					this.graphics.moveTo(charX + segment[0][0] * scale, charY + segment[0][1] * scale);
					for (var p = 1; p < segment.length; p++) {
						this.graphics.lineTo(charX + segment[p][0] * scale, charY + segment[p][1] * scale);
					}
				}
			}
		}
	}

	get width() {
		return this._calculatedWidth !== undefined ? this._calculatedWidth : super.width;
	}

	get height() {
		return this._calculatedHeight !== undefined ? this._calculatedHeight : super.height;
	}
}
