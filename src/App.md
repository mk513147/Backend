# Express App Explained 

The steps for the code are given below... 

---

## 1. Importing Essential Packages
```js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
```
These are third-party libraries/modules we import to add more functionality to our backend:

- **express**: A fast and minimalist web framework for Node.js. It simplifies the creation of APIs and web applications.
- **cors**: Stands for Cross-Origin Resource Sharing. It lets your frontend (running on one domain like `localhost:3000`) communicate safely with your backend (running on another domain like `localhost:8000`).
- **cookie-parser**: Middleware that parses the cookies attached to the client request. It makes cookies easy to access and manage in the backend.

---

## 2. Creating the Express App Instance
```js
const app = express();
```
- This line initializes a new Express application.
- You can now use `app` to define middleware, routes, error handling, etc.

---

## 3. Adding Middleware to the App
Middleware functions run before the route handler and are used to process requests.

### a. Enabling CORS
```js
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))
```
- **`origin`**: Specifies which frontend domain is allowed to access this backend. It’s pulled from the environment variable `CORS_ORIGIN`, e.g., `http://localhost:3000`.
- **`credentials: true`**: This allows cookies and authorization headers to be sent along with requests. Essential for user login/authentication sessions.

### b. Parsing JSON Request Body
```js
app.use(express.json({ limit: "16kb" }));
```
- Tells Express to automatically parse incoming JSON data in requests.
- `limit: "16kb"` restricts the size of incoming data to prevent overloading or malicious large requests.
- This is crucial when the frontend sends data using `fetch` or `axios` with `Content-Type: application/json`.

### c. Parsing URL-Encoded Data
```js
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
```
- Handles form submissions and query string data.
- `extended: true` enables nested objects (like `user[address][city] = Delhi`).
- `limit: "16kb"` again protects against oversized data.

### d. Serving Static Files
```js
app.use(express.static("public"));
```
- Tells Express to serve files like images, CSS, JS, etc. from the `public` folder.
- For example, an image placed in `public/logo.png` can be accessed via `http://localhost:8000/logo.png`.

### e. Parsing Cookies
```js
app.use(cookieParser());
```
- Makes cookies from the request available via `req.cookies`.
- Useful for handling authentication tokens, session IDs, etc.

---

## 4. Route Handling
Routes determine how the server responds to client requests.

### a. Importing User Routes
```js
import userRouter from './routes/user.routes.js';
```
- `userRouter` is a separate file/module where all user-related routes are defined (like login, register, profile, etc.).
- Keeping routes in separate files improves organization and scalability.

### b. Using the User Routes
```js
app.use("/api/v1/users", userRouter);
```
- This prefixes all routes inside `userRouter` with `/api/v1/users`.
- If `user.routes.js` has a route defined as `router.post("/register")`, it will be accessible at `http://localhost:8000/api/v1/users/register`.
- This versioning (`v1`) makes your API future-proof in case you need to release version 2 later.

---

## 5. Exporting the App
```js
export { app };
```
- This allows the `app` to be imported and used in another file, typically the one where the server is started (like `server.js` or `index.js`).

For example:
```js
import { app } from "./app.js";
app.listen(8000, () => console.log("Server is running on port 8000"));
```

---

## Summary
| Section | Purpose |
|--------|---------|
| express.json() | Parses incoming JSON requests |
| express.urlencoded() | Parses form data and URL-encoded bodies |
| express.static("public") | Serves static files like images, CSS, etc. |
| cookieParser() | Parses cookies in requests |
| cors() | Enables cross-origin access from the frontend |
| app.use() | Attaches middleware or routes to the app |

This setup gives you a strong, scalable, and secure foundation to build backend APIs in Express.

