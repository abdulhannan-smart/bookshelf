"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReviews = getAllReviews;
exports.getReviewsByBookId = getReviewsByBookId;
exports.getRatingStats = getRatingStats;
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
async function getRatingStats(bookId) {
    const reviews = await getReviewsByBookId(bookId);
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
        breakdown[r.rating]++;
    }
    const total = reviews.length;
    const average = total === 0
        ? null
        : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 100) / 100;
    return { average, total, breakdown };
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