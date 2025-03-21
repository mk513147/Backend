import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// function for generating access and refresh token
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // check if the tokens are generated successfully
        // console.log("Access token", accessToken);
        // console.log("Refresh token", refreshToken);


        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new apiError(500, `Error while genrating tokens!!`)
    }

}

// options for the cookies
const options = {
    httpOnly: true, // The cookie cannot be accessed by JavaScript on the client-side, making it more secure.
    secure: true, // The cookie is only sent over HTTPS, ensuring encrypted transmission.
    sameSite: "lax", // "None" if frontend and backend are on different origins
}


const registerUser = asyncHandler(async (req, res) => {
    // get the user details from frontend
    // Check wether the fields are empty
    // Check if the user already exists
    // Check for images, check for avtar image, Use the middleware to store image
    // Upload the images online (cloudinary)
    // create user object - create entry in DB
    // remove the password and refresh token rom response
    // check wether the user has been created in db
    // return response

    // 1st - 
    // Take the details from the body by destructuring 
    const { fullName, email, username, password } = req.body;
    // console.log(email);

    // 2nd - Step
    // .some() -> Checks if at least one element in the array satisfies a given condition. And return boolean values
    if ([fullName, email, username, password].some((item) => item?.trim() === "")) {
        throw new apiError(400, `All fields are required!!`);
    }

    // 3rd - Step
    // .findOne() -> This method is commonly used in MongoDB to retrieve a single document/object from a collection that matches a given query. It returns only the first match
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existingUser) throw new apiError(409, `User with the same username or email already exists!`)

    // 4th - Step
    // use multer to get request from the body
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; // Gives undefined error as there is no array
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if (!avatarLocalPath) throw new apiError(400, `Avatar is required`);

    // 5th - Step
    // Upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) throw new apiError(400, `Avatar is required`)

    // 6th - Step
    // Create user 
    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    // 7th & 8th - Step
    // The .select() method in Mongoose is used to specify which fields to include or exclude in the query result. It helps optimize performance by retrieving only the necessary data.
    // 🔹 The - (minus) sign before a field excludes it. You cannot mix inclusion and exclusion(except _id, which is an exception).
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) throw new apiError(500, `Something went wrong while registering the user!`)

    return res.status(201).json(new apiResponse(200, createdUser, `User Registered Sucessfully.`))
})

const loginUser = asyncHandler(async (req, res) => {
    // take email, password form req.body
    // validate
    // find the user from db
    // give access token
    // give refresh token
    // send cookie
    const { email, username, password } = req.body;

    if (!(email || username)) throw new apiError(400, `Email or username is required`);

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) throw new apiError(404, `User not found`);

    const isPassCorrect = await user.isPasswordCorrect(password);

    if (!isPassCorrect) throw new apiError(401, `Invalid user credentials`);

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // remove password and refreshtoken from the sent data/ can be done another way
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
                "User logged in successfully")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    // find the user from database and update the refreshtoken
    // remove the tokens from user
    // send response
    await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: undefined
        },
    },
        {
            new: true,// this is necessary to get the updated document
        })

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User Logged out successfully!"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // get the refresh token from the cookies or body
    // check if the refresh token is valid
    // decode the refresh token
    // find the user from the decoded refresh token
    // validate the user
    // check if the user has the same refresh token in the db
    // generate new access token
    // send the tokens in the response

    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) throw new apiError(401, `Refresh token is required`);

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) throw new apiError(404, `User not found`);

        if (incomingRefreshToken !== user.refreshToken) throw new apiError(401, `Invalid refresh token`);

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new apiResponse(200, { accessToken, refreshToken: newRefreshToken }, `Token refreshed successfully`))
    } catch (error) {
        throw new apiError(401, `Invalid refresh token`);
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // get the old and new password from the body/frontend
    // validate the password
    // get the user from the db/req.user as this function only works when the user is loggedin
    // check if the old password is correct 
    // change the password
    // save the changes 
    // send the response

    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword || newPassword)) throw new apiError(401, `Password is required`);

    const user = await User.findById(req.user._id);

    const passCheck = await user.isPasswordCorrect(oldPassword);

    if (!passCheck) throw new apiError(401, `Invalid password`);

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new apiResponse(200, {}, `Password changed successfully`));

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new apiResponse(200, req.user, `User Fetched successfully`));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!(fullName || email)) throw new apiError(401, `All fields are required`);

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullName,
                email
            },
        },
        {
            new: true,
        }
    ).select("-password");
    return res
        .status(200)
        .json(new apiResponse(200, user, "Account details updated successfully"));
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;// we can access this as we have used multer
    if (!avatarLocalPath) throw new apiError(401, `Avatar is required`);

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) throw new apiError(500, `Error while uploading the avatar`);

    const user = await User.findByIdAndUpdate(req.user._id,
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
})
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) throw new apiError(401, `Avatar is required`);

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) throw new apiError(500, `Error while uploading the cover image`);

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        {
            new: true,
        }
    ).select("-password");
    return res
        .status(200)
        .json(new apiResponse(200, user, "Cover Image updated successfully"));
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserCoverImage,
    updateUserAvatar
}