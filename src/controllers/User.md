# Step-by-Step Explanation of User Controller/Authentication Code

## Functions used

1. [Token Generator Function](#2-token-generation-function)
2. [Register User Function](#4-register-user-function)
3. [Login User Function](#5-login-user-function)
4. [Logout User Function](#6-logout-user-function)
5. [Refresh Access Token Function](#7-refresh-access-token)
6. [Change User password Function](#8-changing-user-password)
7. [Getting the current user Function](#9-fetching-the-current-user)
8. [Updating the avatar image Function](#10-updating-the-user-avatar-image)
9. [Updating the cover image Function](#note-the-cover-image-is-also-updated-with-the-same-method)
10. [Get User Channel Profile](#11-get-user-channel-profile)

    -[Using regular JS](#regular-query-based-implementation)

    -[Using Aggregation Queries](#aggregation-based-implementation)

## 1. Importing Dependencies

```javascript
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
```

- Required modules and utility functions are imported.
- `asyncHandler` handles async errors.
- `apiError` and `apiResponse` manage API error and success responses.
- `User` is the Mongoose model for users.
- `uploadOnCloudinary` is used to upload images to Cloudinary.
- `jsonwebtoken` is used for token generation.
- `mongoose` is used for MongoDB operations.

---

## 2. Token Generation Function

```javascript
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, `Error while generating tokens!!`);
  }
};
```

### Steps:

1. Find the user by `userId`.
2. Generate access and refresh tokens by the methods we created in the **User Model**.
3. Store the refresh token in the database.
4. Save the user document to the database. `{ validateBeforeSave: false }` This prevents any default validation before saving.
5. Return both tokens.
6. If an error occurs, throw an API error.

[⬆ Back to top](#functions-used)

---

## 3. Cookie Options

Used while returning sending a cookie as a response.

```javascript
const options = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
};
```

### Explanation:

- `httpOnly`: Prevents client-side JavaScript from accessing cookies.
- `secure`: Ensures cookies are only sent over HTTPS.
- `sameSite`: Controls cross-site request behavior. `sameSite: "lax",` This allows the cookies to be sent only with **GET** requests.

---

## 4. Register User Function

This function is used to create an account.

```javascript
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((item) => item?.trim() === "")
  ) {
    throw new apiError(400, `All fields are required!!`);
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser)
    throw new apiError(
      409,
      `User with the same username or email already exists!`
    );

  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) throw new apiError(400, `Avatar is required`);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) throw new apiError(400, `Avatar is required`);

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser)
    throw new apiError(500, `Something went wrong while registering the user!`);

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, `User Registered Successfully.`));
});
```

### Steps:

1. Extract user details from `req.body`.
2. Validate that no fields are empty.

   - `.some` This method returns true if any value meets the condition else it returns false

3. `$or: [{ username }, { email }],` This checks if a user with the same username or email exists.

   - `.findOne()` method returns a single object/document and `.find` returns an array of all the documents that match the query.

4. Extract the avatar image from `req.files`.

   - We get the `req.files` by using the multer middleware.
   - `req.files?.avatar[0]?.path` we get the local path of avatar file by using this.

5. Then we check for the cover Image.
6. Validate the avatar image.
7. Upload the avatar and cover image to Cloudinary.

   - If there is no cover image provided then it will return null.

8. Create a new user entry in the database.

   - If the cover image is null then set it as an empty string.

9. Remove the password and refresh token before returning the response.
   - The `.select()` method excludes or includes the fields in the string. '-' means exclude.
10. Send a success response with the created user data.

[⬆ Back to top](#functions-used)

---

## 5. Login User Function

```javascript
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username))
    throw new apiError(400, `Email or username is required`);

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) throw new apiError(404, `User not found`);

  const isPassCorrect = await user.isPasswordCorrect(password);
  if (!isPassCorrect) throw new apiError(401, `Invalid user credentials`);

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});
```

### Steps:

1. Extract login details.
2. Validate input (email or username is required).
3. Find the user in the database.
4. Validate the password with the help of the method we created in the user model.
5. Generate access and refresh tokens through the functio declared at the start of the code
6. Remove sensitive data before responding through `.select()` method.
7. Send response with cookies and user data.

[⬆ Back to top](#functions-used)

---

## 6. Logout User Function

```javascript
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User Logged out successfully!"));
});
```

### Steps:

1. Use the `auth.middleware.js` in the route to get the user in `req.user`
2. Find the user through `req.user.id` and remove the refresh token from the database.
3. Clear `accessToken` and `refreshToken` cookies.
4. Send a logout success response.

[⬆ Back to top](#functions-used)

---

## 7. Refresh Access Token

```javascript
try {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken)
    throw new apiError(401, `Refresh token is required`);

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);

  if (!user) throw new apiError(404, `User not found`);

  if (incomingRefreshToken !== user.refreshToken)
    throw new apiError(401, `Invalid refresh token`);

  const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new apiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        `Token refreshed successfully`
      )
    );
} catch (error) {
  throw new apiError(401, `Invalid refresh token`);
}
```

### Steps:

1. Retrieve the refresh token from cookies or request body(in case it comes from mobile).
2. Validate the refresh token.
3. Decode the refresh token using `jwt.verify()` method which comes with the jsonWebToken and returns an **object**.
4. Find the user associated with the token.
5. Ensure the refresh token matches the one stored in the database.
6. Generate a new access and refresh token.
7. Store tokens in cookies and send the response.

[⬆ Back to top](#functions-used)

---

## 8. Changing User Password

This function allows a logged-in user to change their password.

```javascript
const { oldPassword, newPassword } = req.body;

if (!(oldPassword || newPassword))
  throw new apiError(401, `Password is required`);

const user = await User.findById(req.user._id);

const passCheck = await user.isPasswordCorrect(oldPassword);

if (!passCheck) throw new apiError(401, `Invalid password`);

user.password = newPassword;

await user.save({ validateBeforeSave: false });

return res
  .status(200)
  .json(new apiResponse(200, {}, `Password changed successfully`));
```

### Steps:

1. Extract oldPassword and newPassword from req.body.
2. Validate the input fields.
3. Retrieve the user using req.user.\_id.
4. Verify the old password using isPasswordCorrect() method from user model.
5. Update the password and save the changes.
6. Send a success response.

[⬆ Back to top](#functions-used)

---

## 9. Fetching the Current User

This function retrieves the logged-in user's details.

```javascript
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, `User Fetched successfully`));
});
```

### Steps:

1. Respond with the current user details stored in req.user.
2. Send a success response.

[⬆ Back to top](#functions-used)

---

## 10. Updating the user avatar image

This function updates the avatar image which we have stored in the web service(in this case it is **Cloudinary**).

```javascript
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) throw new apiError(401, `Avatar is required`);

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) throw new apiError(500, `Error while uploading the avatar`);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new apiResponse(200, user, "Avatar Image updated successfully"));
});
```

### Steps:

1. Get the file path by using **Multer** middleware in the `req.file?.path`.
2. Validate the path.
3. Upload the file on cloudinary throught the method defined in the **Utils** folder.
4. Validate the url response we get after uploading the file i.e. Checking it is uploaded properly or not.
5. Find the user from the database and update its avatar path.
6. Return response on success

### NOTE: The cover image is also updated with the same method

[⬆ Back to top](#functions-used)

---

## 11. Get User Channel Profile

This function retrieves a user's channel profile based on their username. It returns:

- Basic user information (`fullName`, `email`, `avatar`, `coverImage`)
- The **number of subscribers** the user has
- The **number of channels** the user is subscribed to
- A boolean flag indicating whether the **requesting user** has subscribed to this channel
- **This function can be written in two ways:**
  - Regular query based implementation
  - Aggregation-Based Implementation

---

### Regular Query-Based Implementation

❌ Use Regular Queries:

- When the logic is very simple
- When the dataset is small
- If you need custom logic that's hard to express in aggregation

```javascript
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) throw new apiError(401, `Username is required`);

  const user = await User.findOne({ username: username.toLowerCase() }).select(
    "fullName email avatar coverImage _id"
  );

  if (!user) throw new apiError(404, `Channel not found`);

  const subscribers = await Subscription.find({ channel: user._id }).select(
    "subscriber"
  );
  const subscribedTo = await Subscription.find({ subscriber: user._id }).select(
    "channel"
  );

  const subscriberCount = subscribers.length;
  const subscriberToCount = subscribedTo.length;
  const isSubscribed = subscribers.some(
    (sub) => sub.subscriber.toString() === req.user._id.toString()
  );

  return res.status(200).json(
    new apiResponse(
      200,
      {
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage,
        subscriberCount,
        subscriberToCount,
        isSubscribed,
      },
      `Channel fetched successfully`
    )
  );
});
```

### Steps:

1. Get the username from the url(req.params)
2. Validate the username.
3. Find the the user from the DB via the username.

4. Get the subscribers and no of channels (subscribedTo) `Subscription.find({ channel: user._id }).select("subscriber");` from the Subscription model/document.
5. Get the subscriber and channel count using the length property of array as the `.find()` returns an array of objects.
6. Check if the user is subscribed to the using the `.some()` method and comparing the subscribers id to the users id.
7. Return the repsonse along with the required fields.

[⬆ Back to top](#functions-used)

### Aggregation-Based Implementation

✅ Use Aggregation:

- When performance is critical
- When you're doing joins, filtering, and counting
- When working with large datasets

```javascript
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) throw new apiError(401, `Username is required`);

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        subscriberToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        subscriberToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel.length) throw new apiError(404, `Channel not found`);

  return res
    .status(200)
    .json(new apiResponse(200, channel[0], `Channel fetched successfully`));
});
```

### Steps:

1. Get the username from the url(req.params)
2. `$match` - Filters the user by username.
3. `$lookup (Subscribers)` - Joins subscriptions where the user is the channel.
4. `$lookup (Subscribed To)` - Joins subscriptions where the user is the subscriber.
5. `$addFields` - Adds computed values:

   - `subscriberCount`: total number of subscribers
   - `subscriberToCount`: total number of subscriptions
   - `isSubscribed`: checks if `req.user._id` exists in the `subscribers.subscriber` list

6. `$project`: Selects the fields to return in the response.

---

[⬆ Back to top](#functions-used)
