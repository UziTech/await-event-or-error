const {EventEmitter} = require("events");

module.exports = function (emitter, successEvent, errorEvent = "error") {
	if (this instanceof EventEmitter) {
		if (typeof successEvent !== "undefined") {
			errorEvent = successEvent;
		}
		successEvent = emitter;
		emitter = this;
	}

	if (!(emitter instanceof EventEmitter)) {
		throw new Error("Must provide an emitter");
	}

	if (typeof successEvent !== "string" && !(successEvent instanceof Symbol)) {
		throw new Error("Must provide an event name");
	}


	if (!emitter.awaitingEvents) {
		emitter.awaitingEvents = new Map();
	}

	let promises = emitter.awaitingEvents.get(successEvent);
	if (!promises) {
		const successListener = (...args) => {
			emitter.off(errorEvent, errorListener);
			emitter.awaitingEvents.get(successEvent).forEach(p => {
				p.resolve(args);
			});
			emitter.awaitingEvents.delete(successEvent);
		};
		const errorListener = (err) => {
			emitter.off(successEvent, successListener);
			emitter.awaitingEvents.get(successEvent).forEach(p => {
				p.reject(err);
				emitter.awaitingEvents.delete(successEvent);
			});
		};
		emitter.once(successEvent, successListener);
		emitter.once(errorEvent, errorListener);
		promises = [];
	}

	return new Promise((resolve, reject) => {
		promises.push({resolve, reject});
		emitter.awaitingEvents.set(successEvent, promises);
	});
};
