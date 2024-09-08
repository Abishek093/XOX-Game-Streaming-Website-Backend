"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = void 0;
const handleResponse = (res, statusCode, data) => {
    res.status(statusCode).json(data);
};
exports.handleResponse = handleResponse;
