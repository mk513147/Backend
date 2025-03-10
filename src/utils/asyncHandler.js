// The functions in this file is basically a wrapper for async functions
// There are two ways to handle this

// Higher Order Functions - A higher-order function (HOF) is a function that does one of the following:

// 1. Takes another function as an argument
// 2. Returns another function

// const asyncHandler = () => {}// normal function
// const asyncHandler = (func) => () => {}// HOF
// const asyncHandler = (func) => async () => {}// HOF with async


// 1 - By using promises
const asyncHandler = (func) => {
    return (req, res, next) => {
        Promise.resolve(func(req, res, next)).catch((error) => next(error))
    }
}

// 2 - By using try-catch block
// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//         await func(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

export { asyncHandler }
