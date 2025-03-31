# Understanding Higher-Order Functions and Async Error Handling

## Higher-Order Functions (HOF)
A **Higher-Order Function (HOF)** is a function that either:
1. Takes another function as an argument.
2. Returns another function.

In JavaScript, HOFs are commonly used for operations like function composition, callbacks, and middleware handling in Express.js.
The functions in this file are basically a wrapper for async functions

### Example:
```js
const asyncHandler = (func) => () => {} // HOF
const asyncHandler = (func) => async () => {} // HOF with async
```

## Async Error Handling in Express.js
In Express.js, route handlers that perform asynchronous operations (such as database queries) should handle errors properly. Otherwise, unhandled rejections can cause the server to crash.

### 1. Using Promises
This implementation ensures that any rejected promise from `func` is caught and passed to Express's error-handling middleware.

```js
const asyncHandler = (func) => {
    return (req, res, next) => {
        Promise.resolve(func(req, res, next)).catch((error) => next(error));
    };
};
```

**How it Works:**
- `asyncHandler` takes a function `func` as an argument.
- It returns a new function that calls `func(req, res, next)` and wraps it inside `Promise.resolve()`.
- If `func` throws an error (rejects a promise), the `catch` block ensures that the error is passed to `next(error)`, triggering Express's built-in error handler.

### 2. Using Try-Catch Block
This version explicitly catches errors and sends an appropriate response to the client.

```js
const asyncHandler = (func) => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
```

**How it Works:**
- Calls `func(req, res, next)` inside a `try` block.
- If an error occurs, the `catch` block sends a JSON response with an appropriate status code and error message.

## Why Use `asyncHandler`?
Using this higher-order function:
- Prevents repetitive try-catch blocks in every route.
- Ensures consistent error handling.
- Works seamlessly with Express’s error-handling middleware.

## Usage Example in Express.js
```js
import express from 'express';
import { asyncHandler } from './asyncHandler.js';

const app = express();

app.get('/data', asyncHandler(async (req, res) => {
    const data = await fetchData(); // Assume fetchData is an async function
    res.json({ success: true, data });
}));

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Something went wrong",
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
```


