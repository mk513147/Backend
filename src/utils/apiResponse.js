// This class will be used for handling the api responses effeciently
// Can be written as a function but it is efficient for making small utility and for simple use cases as cannot be extended

class apiResponse {
    constructor(statusCode, data, message = "Success") {
        this.data = data;
        this.statusCode = statusCode;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { apiResponse }