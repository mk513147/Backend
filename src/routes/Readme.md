# 📁 `user.routes.js` – User API Routes Documentation

This file delivers all the info that we get from the user to the controllers.

---

## 🛠 Imports

```js
import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
```

### Explanation:

- `Router`: From Express, helps organize routes.
- `user.controller.js`: Contains all the logic for handling each user-related action.
- `multer.middleware.js`: Handles file uploads (avatar, cover).
- `auth.middleware.js`: Verifies JWT tokens for protected routes.

---

## 🧾 Initialize Router

```js
const router = Router();
```

> Creates a new router instance to define user-related routes.

---

## 👤 Registration Route

```js
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
```

- **POST /register**
  - Registers a new user.
  - Accepts one avatar image and one cover image.
  - Uses `multer` to handle multiple fields.

---

## 🔐 Authentication Routes

```js
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
```

- **POST /login**: Authenticates user and issues token.
- **POST /logout**: Logs out user (requires valid token).
- **POST /refresh-token**: Generates a new access token.

---

## 🔒 Password Management

```js
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
```

- **POST /change-password**: Changes the password for logged-in users.

---

## 👤 User Info & Watch History

```js
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);
```

- **GET /current-user**: Gets current user data.
- **GET /channel/:username**: Gets public channel info by username.
- **GET /watch-history**: Fetches user's viewing history.

---

## ✏️ Update Account Details

```js
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
```

- **PATCH /update-account**: Update basic user info (name, bio, email).
- **PATCH /update-avatar**: Upload a new profile picture.
- **PATCH /update-cover-image**: Upload a new cover banner.

---

## 📤 Export Router

```js
export default router;
```

> Makes the router available to be used in your main Express app.
