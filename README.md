[![Actions Status](https://github.com/UziTech/await-event-or-error/workflows/CI/badge.svg)](https://github.com/UziTech/await-event-or-error/actions)


# await-event-or-error
Returns a Promise that resolves on an event or rejects on an error

# Examples

Pass an EventEmitter and an event to be watched.

```js
await awaitEventOrError(emitter, "connected");
```

The function can be added to an EventEmitter to allow only passing the event.

```js
emitter.eventOrError = awaitEventOrError;
await emitter.eventOrError("connected");
```

The promise will reject on an `"error"` event by default, but you can specify a different error event.

```js
await emitter.eventOrError("connected", "responseError");
```

If the event emits values they will be returned in an array.

```js
const values = await emitter.eventOrError("connected");
...
emitter.emit("connected", 1, 2);
...
// values === [1, 2]
```
