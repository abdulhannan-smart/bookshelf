"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode ?? 500;
    const message = statusCode === 500 ? "Internal Server Error" : err.message;
    if (statusCode === 500) {
        console.error("[Error]", err);
    }
    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
    });
}
function notFoundHandler(_req, res) {
    res.status(404).json({
        success: false,
        error: "Route not found",
        statusCode: 404,
    });
}
//# sourceMappingURL=errorHandler.js.map