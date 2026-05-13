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
const express_1 = require("express");
const reviewsService = __importStar(require("../services/reviewsService"));
const router = (0, express_1.Router)();
// GET /api/books/:id/reviews
router.get("/:id/reviews", async (req, res, next) => {
    try {
        const reviews = await reviewsService.listReviewsForBook(req.params.id);
        res.json({ success: true, data: reviews, count: reviews.length });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/books/:id/reviews
router.post("/:id/reviews", async (req, res, next) => {
    try {
        const payload = req.body;
        const review = await reviewsService.addReview(req.params.id, payload);
        res.status(201).json({ success: true, data: review });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=reviews.js.map