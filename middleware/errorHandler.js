const CustomErrorHandler = require("../services/customErrorHandler");
// const validationError = require("joi").ValidationError;
 function errorHandler(err, req, res, next) {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Internal Server Error";

    // if (err instanceof ValidationError) {
    //     statusCode = 422;
    //     errorMessage= err.message;
       
    // }

    // if (err instanceof CustomErrorHandler) {
    //     statusCode = err.status;
    //     data = {
    //         message: err.message
    //     }
    // }
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack
    });
}
module.exports = errorHandler;