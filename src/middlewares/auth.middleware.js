import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// This middleware authenticates requests by verifying JWTs, retrieving the user from the database, and attaching the user object to req.user.

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Retrieve the access token from cookies or in case of mobile access -> Authorization header
        // req.header("Authorization")?.replace("Bearer ", "") || req.headers.authorization?.split(" ")[1]
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        // console.log(req.cookies?.accessToken);

        if (!token) throw new apiError(401, `Unauthorized request`);

        // Verify the token using the secret key and decode its contents
        const decodedObj = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedObj?._id).select("-password -refreshToken")

        if (!user) throw new apiError(401, `Invalid access token`)

        // Attach the user object to the request for further middleware or route handlers
        req.user = user;
        next();

    } catch (error) {
        throw new apiError(401, error?.message || `Invalid access token`)
    }
})