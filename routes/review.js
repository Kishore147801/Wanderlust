const express = require("express");
const router = express.Router({mergeParams : true});

const Listing = require("../models/listing");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isAuthor} = require("../middleware.js");


const reviewController = require("../controllers/review.js");

//Review
//Post Review Route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//Delete Review Route
router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;