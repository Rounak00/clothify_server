const CustomErrorHandler = require("../services/customErrorHandler");
const validationError = require("joi").ValidationError;
 function errorHandler(err, req, res, next) {
    let errorStatus = err.status || 500;
    let errorMessage = err.message || "Internal Server Error";

    if (err.isJoi) {
        errorStatus = 422;
        errorMessage = err.details?.[0]?.message || err.message;
    }

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