import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    const existingUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existingUser) throw new apiError(409, `User with the same username or email already exists!`)

    // 4th - Step
    // use multer to get request from the body
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
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
    const createdUser = await User.findById(user._id).select("-password -refreshTokens")
    if (!createdUser) throw new apiError(500, `Something went wrong while registering the user!`)

    return res.status(201).json(new apiResponse(200, createdUser, `User Registered Sucessfully.`))
})

export { registerUser }