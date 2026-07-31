const {describe, test, beforeEach} = require("node:test");
const assert = require("node:assert/strict");
const {EventEmitter} = require("events");
const awaitEventOrError = require("../");

describe("await-event-or-error", () => {
	let emitter;

	beforeEach(() => {
		emitter = new EventEmitter();
	});

	describe("invalid arguments", () => {
		test("should throw when no emitter", () => {
			assert.throws(() => {
				awaitEventOrError();
			});
		});

		test("should throw when no successEvent", () => {
			assert.throws(() => {
				awaitEventOrError(emitter);
			});
		});

		test("should throw when invalid emitter", () => {
			assert.throws(() => {
				awaitEventOrError({}, "success");
			});
		});

		test("should throw when invalid successEvent", () => {
			assert.throws(() => {
				awaitEventOrError(emitter, {});
			});
		});
	});

	describe("attached to emitter", () => {
		beforeEach(() => {
			emitter.eventOrError = awaitEventOrError;
		});
		test("should pass on event", async () => {
			const promise = emitter.eventOrError("success");
			emitter.emit("success");
			await assert.doesNotReject(promise);
		});

		test("should fail on error", async () => {
			const promise = emitter.eventOrError("success");
			emitter.emit("error", new Error("Error"));
			await assert.rejects(promise, {message: "Error"});
		});

		test("should fail on responseError", async () => {
			const promise = emitter.eventOrError("success", "responseError");
			emitter.emit("responseError", new Error("Error"));
			await assert.rejects(promise, {message: "Error"});
		});
	});

	describe("pass emitter", () => {
		test("should pass on event", async () => {
			const promise = awaitEventOrError(emitter, "success");
			emitter.emit("success");
			await assert.doesNotReject(promise);
		});

		test("should fail on error", async () => {
			const promise = awaitEventOrError(emitter, "success");
			emitter.emit("error", new Error("Error"));
			await assert.rejects(promise, {message: "Error"});
		});

		test("should fail on responseError", async () => {
			const promise = awaitEventOrError(emitter, "success", "responseError");
			emitter.emit("responseError", new Error("Error"));
			await assert.rejects(promise, {message: "Error"});
		});
	});

	describe("return value", () => {
		test("should return array on event", async () => {
			const promise = awaitEventOrError(emitter, "success");
			emitter.emit("success");
			assert.deepStrictEqual(await promise, []);
		});

		test("should return array on single argument", async () => {
			const promise = awaitEventOrError(emitter, "success");
			emitter.emit("success", "arg1");
			assert.deepStrictEqual(await promise, ["arg1"]);
		});

		test("should return array on multiple argument", async () => {
			const promise = awaitEventOrError(emitter, "success");
			emitter.emit("success", 1, 2);
			assert.deepStrictEqual(await promise, [1, 2]);
		});
	});

	describe("multiple listeners", () => {
		test("should resolve all on success", async () => {
			const promise1 = awaitEventOrError(emitter, "success");
			const promise2 = awaitEventOrError(emitter, "success");
			emitter.emit("success", 1);
			assert.deepStrictEqual(await promise1, [1]);
			assert.deepStrictEqual(await promise2, [1]);
		});

		test("should resolve only event", async () => {
			const promise1 = awaitEventOrError(emitter, "success");
			const promise2 = awaitEventOrError(emitter, "success2");
			emitter.emit("success", 1);
			emitter.emit("success2", 2);
			assert.deepStrictEqual(await promise1, [1]);
			assert.deepStrictEqual(await promise2, [2]);
		});

		test("should reject all events on error", async () => {
			const promise1 = awaitEventOrError(emitter, "success");
			const promise2 = awaitEventOrError(emitter, "success");
			emitter.emit("error", new Error("Error"));
			await assert.rejects(promise1, {message: "Error"});
			await assert.rejects(promise2, {message: "Error"});
		});

		test("should reject all events on error", async () => {
			const promise1 = awaitEventOrError(emitter, "success");
			const promise2 = awaitEventOrError(emitter, "success2");
			emitter.emit("error", new Error("Error"));
			await assert.rejects(promise1, {message: "Error"});
			await assert.rejects(promise2, {message: "Error"});
		});
	});
});
