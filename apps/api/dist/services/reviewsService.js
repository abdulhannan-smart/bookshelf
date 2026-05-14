"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReviewsForBook = listReviewsForBook;
exports.getRatingStats = getRatingStats;
exports.addReview = addReview;
const repo = __importStar(require("../data/reviewsRepository"));
const booksRepo = __importStar(require("../data/booksRepository"));
function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
async function listReviewsForBook(bookId) {
    const book = await booksRepo.getBookById(bookId);
    if (!book) {
        throw createHttpError(`Book with id '${bookId}' not found`, 404);
    }
    return repo.getReviewsByBookId(bookId);
}
async function getRatingStats(bookId) {
    const book = await booksRepo.getBookById(bookId);
    if (!book) {
        throw createHttpError(`Book with id '${bookId}' not found`, 404);
    }
    return repo.getRatingStats(bookId);
}
async function addReview(bookId, input) {
    const book = await booksRepo.getBookById(bookId);
    if (!book) {
        throw createHttpError(`Book with id '${bookId}' not found`, 404);
    }
    const { reviewer, rating, body } = input;
    if (!reviewer?.trim()) {
        throw createHttpError("'reviewer' is required", 400);
    }
    if (rating === undefined || rating === null || typeof rating !== "number") {
        throw createHttpError("'rating' must be a number", 400);
    }
    if (rating < 1 || rating > 5) {
        throw createHttpError("'rating' must be between 1 and 5", 400);
    }
    if (!body?.trim()) {
        throw createHttpError("'body' is required", 400);
    }
    return repo.createReview({ bookId, reviewer, rating, body });
}
//# sourceMappingURL=reviewsService.js.map