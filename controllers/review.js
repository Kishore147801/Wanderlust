const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async(req,res)=>{
    //console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    //console.log(newReview);

    listing.reviews.push(newReview);

    req.flash("success","New Review Created!");

    await newReview.save();
    await listing.save();

    //console.log("New review saved");
    //res.send("New review saved");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview = async(req,res)=>{
    let{id,reviewId} = req.params;

    req.flash("success","Review Deleted!");
    
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}