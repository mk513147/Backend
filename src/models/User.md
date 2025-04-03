# Explanation of the Mongoose User Schema

## Importing Dependencies
```javascript
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";// Used for hashing password
import jwt from "jsonwebtoken";// Used for generating tokens (think of it like a ticket you need to get while entering a park)
```
- **mongoose**: This is the primary library used for interacting with MongoDB in a structured way.
- **Schema**: This allows us to define the structure of our MongoDB documents.
- **bcrypt**: A library used for hashing passwords to enhance security.
- **jsonwebtoken (jwt)**: Used to create access and refresh tokens for user authentication.

## Defining the User Schema
```javascript
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    fullName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    }],
    refreshToken: {
        type: String,
    }
}, { timestamps: true })
```
### Field Explanations
- **username, email, fullName**: Required fields that must be unique. The `lowercase: true` ensures consistency.
- **avatar, coverImage**: Stores URLs to images.
- **password**: Required and stored in hashed form.
- **watchHistory**: Stores references (ObjectIds) of videos the user has watched.
- **refreshToken**: Stores the refresh token for re-authentication.
- **timestamps: true**: Automatically adds `createdAt` and `updatedAt` fields.

## Pre-save Hook for Password Hashing
```javascript
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
```
- Before saving a user, this function checks if the password field has been modified.
- If modified, it hashes the password using `bcrypt` with a salt round of 10.

## Password Verification Method
```javascript
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}
```
- Compares the provided password with the stored hashed password.

## Generating Access Token
```javascript
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
};
```
### Explanation
- Creates a **JWT access token** with:
  - User ID
  - Email
  - Username
  - Full Name
- Uses `process.env.ACCESS_TOKEN_SECRET` as the signing key.
- Expires after `process.env.ACCESS_TOKEN_EXPIRY` (e.g., 15 minutes).

## Generating Refresh Token
```javascript
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
};
```
### Explanation
- Creates a **JWT refresh token** containing only the user ID.
- Uses `process.env.REFRESH_TOKEN_SECRET` as the signing key.
- Expires after `process.env.REFRESH_TOKEN_EXPIRY` (e.g., 7 days).

## Example Usage
```javascript
const user = await User.findOne({ username: "exampleUser" });
const accessToken = user.generateAccessToken();
const refreshToken = user.generateRefreshToken();
console.log({ accessToken, refreshToken });
```

## Registering the Model
```javascript
export const User = mongoose.model("User", userSchema);
```
- This creates a `User` model from the schema, allowing interaction with the database.

## Access Token vs. Refresh Token
| Feature | Access Token | Refresh Token |
|---------|-------------|--------------|
| Purpose | Authenticate API requests | Obtain a new access token |
| Contains | User details | Only user ID |
| Expiration | Short (e.g., 15 min) | Long (e.g., 7 days) |
| Security | Sent in headers with requests | Stored securely, used only when access token expires |

## Example Authentication Flow
1. **User logs in**:
   - Credentials are verified.
   - Access and refresh tokens are generated.
   - Access token is sent to the client (expires quickly).
2. **User makes API request**:
   - Access token is sent in headers (`Authorization: Bearer <token>`).
3. **Access token expires**:
   - Client sends the refresh token to get a new access token.
4. **Refresh token expires**:
   - User must log in again.

## Real-Life Analogy of Access and Refresh Tokens
### **Amusement Park Example** 🎢
1. **Access Token → Entry Ticket 🎟️**
   - When you buy a ticket at the entrance, you get a wristband (access token).
   - This wristband allows you to enter and enjoy the rides.
   - But it is **valid only for a few hours** (like an access token expires after a short time).
   - Once it expires, you can’t use it anymore to enter rides.

2. **Refresh Token → Membership Card 🏆**
   - If you are a VIP **member** of the park, you get a membership card (refresh token).
   - When your wristband expires, instead of buying a new ticket, you show your membership card at a special counter.
   - They **give you a new wristband** (new access token) without asking you to pay again or re-register.
   - This membership card is **valid for a longer period** but cannot be used to directly enter the rides.

### **How This Relates to Authentication**
- The **access token** (wristband) allows **immediate access** to services but has a **short lifespan**.
- The **refresh token** (membership card) is used to **get a new access token** when the old one expires, without needing to log in again.
- If you **lose the membership card (refresh token)**, you have to **sign up again (log in again)**.

This system ensures **security** while allowing a smooth experience for users. 🚀

