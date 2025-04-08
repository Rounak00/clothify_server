
class CustomErrorHandler extends Error {
    constructor(status, msg) {
        super();
        this.status = status;
        this.message = msg;
        this.success = false;
    }

    static alreadyExist(message) {
        return new CustomErrorHandler(409, message);
    }

    static wrongCredentials(message="Your email & password is wrong") {
        return new CustomErrorHandler(401, message);
    }

    static unAuthorized(message="Unauthorised User") {
        return new CustomErrorHandler(403, message);
    }

    static notFound(message="404 Not Found") {
        return new CustomErrorHandler(404, message);
    }

    static serverError(message="Internal Server Error") {
        return new CustomErrorHandler(500, message);
    }

    // static validationError(error) {
    //     if (error instanceof Joi.ValidationError) {
    //         const errorMessages = error.details.map((err) => err.message).join(", ");
    //         return new CustomErrorHandler(422, errorMessages); // 422 Unprocessable Entity
    //     }
    //     return new CustomErrorHandler(400, "Invalid Request Data");
    // }
}

module.exports= CustomErrorHandler;

// const validateRequest = (schema) => {
//     return (req, res, next) => {
//         const { error } = schema.validate(req.body, { abortEarly: false });

//         if (error) {
//             return next(CustomErrorHandler.validationError(error));
//         }

//         next();
//     };
// };