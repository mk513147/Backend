# Middleware

### **What is Middleware?**  
Middleware is a function that sits between the request (from the client) and the response (from the server). It processes the request, performs checks or modifications, and then either allows it to continue or stops it if something is wrong.  

Think of middleware as a **security checkpoint** at an airport:
- If you have the right ticket and documents, you can proceed to the plane.  
- If something is wrong (like missing a visa), you are stopped and not allowed to continue.  

### **Step-by-Step Explanation of `verifyJWT` Middleware**

#### **1️⃣ Middleware Function Declaration**
```javascript
export const verifyJWT = asyncHandler(async (req, res, next) => {
```
- Defines an **Express.js middleware** to check JWT authentication.
- Uses `asyncHandler` to handle errors in async functions.
- `next` allows the request to continue if authentication succeeds.

---

#### **2️⃣ Extracting the JWT Token**
```javascript
const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
```
- Extracts the token from **cookies** (for web) or the `Authorization` **header** (for mobile/Postman requests).

---

#### **3️⃣ If No Token is Found → Reject the Request**
```javascript
if (!token) throw new apiError(401, `Unauthorized request`);
```
- If the token is **missing**, rejects the request with a `401 Unauthorized` error.

---

#### **4️⃣ Verifying the Token**
```javascript
const decodedObj = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
```
- **Decodes and verifies** the token using `ACCESS_TOKEN_SECRET`.
- If valid, returns a decoded object (`decodedObj`) containing the user’s details.

---

#### **5️⃣ Fetching the User from the Database**
```javascript
const user = await User.findById(decodedObj?._id).select("-password -refreshToken");
```
- Retrieves the user from the database while **excluding** sensitive fields (`password`, `refreshToken`).

---

#### **6️⃣ If No User is Found → Reject the Request**
```javascript
if (!user) throw new apiError(401, `Invalid access token`);
```
- If the user **was deleted** but still has a token, rejects the request.

---

#### **7️⃣ Attach User to the Request and Proceed**
```javascript
req.user = user;
next();
```
- Attaches the authenticated user to `req.user` for further processing.
- Calls `next()` to pass the request to the next handler.

---

#### **8️⃣ Error Handling**
```javascript
catch (error) {
    throw new apiError(401, error?.message || `Invalid access token`);
}
```
- Handles any errors and sends a `401 Unauthorized` response.

---

### **How This Middleware Works in a Route**

```javascript
import express from "express";
import { verifyJWT } from "./middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", verifyJWT, (req, res) => {
    res.json({ message: `Welcome ${req.user.name}!`, user: req.user });
});

export default router;
```

- When a request is made to `/profile`:  
  1. `verifyJWT` **checks authentication**.
  2. If valid, it **attaches the user** to `req.user`.
  3. The route handler **returns the user’s data**.

---

### **Summary**
✅ **Middleware** is a function that runs between a request and the final response.  
✅ **`verifyJWT` middleware** ensures only authenticated users can access protected routes.  
✅ It **extracts, verifies, and decodes** the JWT.  
✅ It **fetches the user** from the database and attaches them to `req.user`.  
✅ If the user is valid, the request proceeds. Otherwise, it is rejected.  

Would you like a flowchart or a diagram to visualize this? 🚀
