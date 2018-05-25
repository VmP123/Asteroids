export default class Timeline {
	constructor() {
		this.timelineEvents = []
	}

	add(timelineEvent) {
		this.timelineEvents.push(timelineEvent);
	}

	update(delta) {
		if (this.timelineEvents.length == 0)
			return;

		var te = this.timelineEvents[0];
		te.delay -= delta;

		if (te.delay <= 0) {
			if (te.func)
				te.func();
			this.timelineEvents.splice(0, 1);
		}
	}
}