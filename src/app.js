import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// we always use app.use for middlewares
//cors allows to establish proper/controlled connection between the frontend and backend
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))


app.use(express.json({ limit: "16kb" }));// gets json data
app.use(express.urlencoded({ extended: true, limit: "16kb" }));// this gets data from the url, the extended property helps getting nested data
app.use(express.static("public"));// it helps store data/assets in public folder
app.use(cookieParser());// this helps the server read and manage cookies sent by the browser.


// routes import
import userRouter from './routes/user.routes.js';

// routes declaration
app.use("/api/v1/users", userRouter)// passing the control to router/ any changes will be done in the router 
// http://localhost:8000/api/v1/users/register

export { app };