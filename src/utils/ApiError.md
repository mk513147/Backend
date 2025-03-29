# Understanding `apiError` and Stack Trace

## What is `apiError`?
`apiError` is a custom error class in JavaScript that extends the built-in `Error` class. It helps in handling API-related errors in a structured way.

### Code:
```js
class apiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = "",
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { apiError }
```

## Breaking Down the Code:
1. **Extends `Error` class** → Makes `apiError` a special type of error.
2. **Constructor Parameters:**
   - `statusCode`: HTTP status code (e.g., 404, 500).
   - `message`: Description of the error.
   - `errors`: Additional error details.
   - `stack`: Stack trace (helps with debugging).
3. **Uses `super(message)`** → Calls the parent `Error` class constructor.
4. **Custom Properties:**
   - `statusCode`: Stores the HTTP error code.
   - `success`: Always `false` (indicates failure).
   - `data`: Set to `null` (can be changed later).
   - `errors`: Stores additional error details.
5. **Handles Stack Trace:**
   - If a stack trace is provided, it is used.
   - Otherwise, `Error.captureStackTrace(this, this.constructor);` generates it.

---

## What is `super(message)`?
`super(message)` is used to call the constructor of the parent class (`Error`). It ensures that the `message` property is properly initialized in the `Error` class.

### Example:
```js
class CustomError extends Error {
    constructor(message) {
        super(message); // Calls the Error constructor
        this.name = "CustomError";
    }
}

try {
    throw new CustomError("Something went wrong!");
} catch (error) {
    console.error(error.name);  // CustomError
    console.error(error.message); // Something went wrong!
    console.error(error.stack);   // Stack trace
}
```

### Why `super(message)` is Important:
- It ensures the error message is properly assigned.
- It allows `Error` to work as expected.
- Without it, the `message` property might not be set correctly.

---

## What is a Stack Trace?
A **stack trace** is a list of function calls that shows how an error happened and where in the code it occurred.

### Example:
```js
function firstFunction() {
    secondFunction();
}

function secondFunction() {
    thirdFunction();
}

function thirdFunction() {
    throw new Error("Something went wrong!");
}

firstFunction();
```

### Output:
```
Error: Something went wrong!
    at thirdFunction (file.js:10:11)
    at secondFunction (file.js:6:5)
    at firstFunction (file.js:2:5)
    at file.js:13:1
```

### What This Means:
- The error **started in `thirdFunction`**.
- `thirdFunction` was **called by `secondFunction`**.
- `secondFunction` was **called by `firstFunction`**.
- The error traces back **step by step**, showing exactly where the issue happened.

---

## Using `apiError` with Stack Trace
### Example:
```js
import { apiError } from "./apiError";

function firstFunction() {
    secondFunction();
}

function secondFunction() {
    thirdFunction();
}

function thirdFunction() {
    try {
        throw new apiError(404, "Resource not found");
    } catch (error) {
        console.error("Error Message:", error.message);
        console.error("Status Code:", error.statusCode);
        console.error("Stack Trace:\n", error.stack);
    }
}

firstFunction();
```

### Output:
```
Error Message: Resource not found
Status Code: 404
Stack Trace:
apiError: Resource not found
    at thirdFunction (file.js:12:9)
    at secondFunction (file.js:7:5)
    at firstFunction (file.js:3:5)
    at file.js:17:1
```

### Why This is Useful:
- **Clear error messages** make debugging easier.
- **Stack trace shows the exact path** where the error occurred.
- **Custom error handling** makes APIs more maintainable.

---

## Example Without `apiError`
If you don’t use the `apiError` class, you can still handle errors using JavaScript's built-in `Error` class. However, you will lose the structured format and additional properties like `statusCode`.

### Example Without `apiError`:
```js
function firstFunction() {
    secondFunction();
}

function secondFunction() {
    thirdFunction();
}

function thirdFunction() {
    try {
        throw new Error("Resource not found");
    } catch (error) {
        console.error("Error Message:", error.message);
        console.error("Stack Trace:\n", error.stack);
    }
}

firstFunction();
```

### Output:
```
Error Message: Resource not found
Stack Trace:
Error: Resource not found
    at thirdFunction (file.js:10:9)
    at secondFunction (file.js:7:5)
    at firstFunction (file.js:3:5)
    at file.js:17:1
```

### Key Differences Without `apiError`
❌ **No `statusCode`** – You only get the error message.  
❌ **No structured API error response** – You need to manually add extra details.  
✅ **Still has a stack trace** – You can debug the error location.  

If you are building an API, using `apiError` makes handling errors more structured and meaningful. But if you just need basic error handling, `Error` works fine! 🚀

---

## Summary:
✅ `apiError` helps in handling API errors in a structured way.
✅ A **stack trace** helps debug errors by showing the function call sequence.
✅ `Error.captureStackTrace()` generates cleaner stack traces.
✅ Using `try-catch`, we can handle errors gracefully and log them.
✅ Without `apiError`, error handling is less structured but still possible.

Now, whenever you encounter an error, **check the stack trace first** to understand where it happened! 🚀

