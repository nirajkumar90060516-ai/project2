const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {

  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // FIX: rating ko number me convert kare
  const newReview = new Review({
    comment: req.body.review.comment,
    rating: Number(req.body.review.rating)
  });

  newReview.author = req.user._id;

  await newReview.save();

  listing.reviews.push(newReview._id);

  await listing.save();

  req.flash("success", "New Review Created!");

  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {

  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");

  res.redirect(`/listings/${id}`);
};
