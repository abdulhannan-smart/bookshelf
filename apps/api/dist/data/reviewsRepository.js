"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReviews = getAllReviews;
exports.getReviewsByBookId = getReviewsByBookId;
exports.createReview = createReview;
const uuid_1 = require("uuid");
const jsonStore_1 = require("./jsonStore");
const FILE = "reviews.json";
async function getAllReviews() {
    return (0, jsonStore_1.readJson)(FILE);
}
async function getReviewsByBookId(bookId) {
    const reviews = await getAllReviews();
    return reviews.filter((r) => r.bookId === bookId);
}
async function createReview(input) {
    const reviews = await getAllReviews();
    const newReview = {
        ...input,
        id: `review_${(0, uuid_1.v4)().replace(/-/g, "").slice(0, 8)}`,
        createdAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    await (0, jsonStore_1.writeJson)(FILE, reviews);
    return newReview;
}
//# sourceMappingURL=reviewsRepository.js.map