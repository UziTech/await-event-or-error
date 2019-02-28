const {EventEmitter} = require("events");
const awaitEventOrError = require("../");

describe("await-event-or-error", () => {
	let emitter;

	beforeEach(() => {
		emitter = new EventEmitter();
	});

	describe("invalid arguments", () => {
		test("should throw when no emitter", () => {
			expect(() => {
				awaitEventOrError();
			}).toThrow();
		});

		test("should throw when no successEvent", () => {
			expect(() => {
				awaitEventOrError(emitter);
			}).toThrow();
		});

		test("should throw when invalid emitter", () => {
			expect(() => {
				awaitEventOrError({}, "success");
			}).toThrow();
		});

		test("should throw when invalid successEvent", () => {
			expect(() => {
				awaitEventOrError(emitter, {});
			}).toThrow();
		});
	});

	describe("attached to emitter", () => {
		beforeEach(() => {
			emitter.eventOrError = awaitEventOrError;
		});
		test("should pass on event", async () => {
			const promise = emitter.eventOrError("success");
			emitter.emit("success");
			await expect(promise).resolves.not.toThrow();
		});

		test("should fail on error", async () => {
			const promise = emitter.eventOrError("success");
			emitter.emit("error", new Error("Error"));
			await expect(promise).rejects.toThrow("Error");
		});

		test("should fail on responseError", async () => {
			const promise = emitter.eventOrError("success", "responseError");
			emitter.emit("responseError", new Error("Error"));
			await expect(promise).rejects.toThrow("Error");
		});
	});

	describe("pass emitter", () => {
		test("should pass on event", async () => {
			const promise = awaitEventOrError(emitter, "success");
			emitter.emit("success");
			await expect(promise).resolves.not.toThrow();
		});

		test("should fail on error", async () => {
			const promise = awaitEventOrError(emitter, "success");
			emitter.emit("error", new Error("Error"));
			await expect(promise).rejects.toThrow("Error");
		});

		test("should fail on responseError", async () => {
			const promise = awaitEventOrError(emitter, "success", "responseError");
			emitter.emit("responseError", new Error("Error"));
			await expect(promise).rejects.toThrow("Error");
		});
	});

	describe("return value", () => {
		test("should return array on event", async () => {
			const promise = awaitEventOrError(emitter, "success");
			emitter.emit("success");
			await expect(promise).resolves.toEqual([]);
		});

		test("should return array on single argument", async () => {
			const promise = awaitEventOrError(emitter, "success");
			emitter.emit("success", "arg1");
			await expect(promise).resolves.toEqual(["arg1"]);
		});

		test("should return array on multiple argument", async () => {
			const promise = awaitEventOrError(emitter, "success");
			emitter.emit("success", 1, 2);
			await expect(promise).resolves.toEqual([1, 2]);
		});
	});

	describe("multiple listeners", () => {
		test("should resolve all on success", async () => {
			const promise1 = awaitEventOrError(emitter, "success");
			const promise2 = awaitEventOrError(emitter, "success");
			emitter.emit("success", 1);
			await expect(promise1).resolves.toEqual([1]);
			await expect(promise2).resolves.toEqual([1]);
		});

		test("should resolve only event", async () => {
			const promise1 = awaitEventOrError(emitter, "success");
			const promise2 = awaitEventOrError(emitter, "success2");
			emitter.emit("success", 1);
			emitter.emit("success2", 2);
			await expect(promise1).resolves.toEqual([1]);
			await expect(promise2).resolves.toEqual([2]);
		});

		test("should reject all events on error", async () => {
			const promise1 = awaitEventOrError(emitter, "success");
			const promise2 = awaitEventOrError(emitter, "success");
			emitter.emit("error", new Error("Error"));
			await expect(promise1).rejects.toThrow("Error");
			await expect(promise2).rejects.toThrow("Error");
		});

		test("should reject all events on error", async () => {
			const promise1 = awaitEventOrError(emitter, "success");
			const promise2 = awaitEventOrError(emitter, "success2");
			emitter.emit("error", new Error("Error"));
			await expect(promise1).rejects.toThrow("Error");
			await expect(promise2).rejects.toThrow("Error");
		});
	});
});
