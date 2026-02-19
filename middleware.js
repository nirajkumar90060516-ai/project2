const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema");


// ================= LOGIN CHECK =================
module.exports.isLoggedIn = (req, res, next) => {

  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Pehle login karo!");
    return res.redirect("/login");
  }

  next();
};



// ================= SAVE REDIRECT URL =================
module.exports.saveRedirectUrl = (req, res, next) => {

  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl;
  }

  next();
};



// ================= OWNER CHECK =================
module.exports.isOwner = async (req, res, next) => {

  try {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // ✅ safety check (important)
    if (!req.user) {
      req.flash("error", "Please login first!");
      return res.redirect("/login");
    }

    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You don't have permission!");
      return res.redirect(`/listings/${id}`);
    }

    next();

  } catch (err) {
    next(err);
  }

};



// ================= VALIDATE LISTING =================
module.exports.validateListing = (req, res, next) => {

  const { error } = listingSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    return next(new ExpressError(400, errMsg));
  }

  next();
};



// ================= VALIDATE REVIEW =================
module.exports.validateReview = (req, res, next) => {

  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    return next(new ExpressError(400, errMsg));
  }

  next();
};



// ================= REVIEW AUTHOR CHECK =================
module.exports.isReviewAuthor = async (req, res, next) => {

  try {

    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      req.flash("error", "Review not found!");
      return res.redirect(`/listings/${id}`);
    }

    // ✅ safety check
    if (!req.user) {
      req.flash("error", "Please login first!");
      return res.redirect("/login");
    }

    if (!review.author.equals(req.user._id)) {
      req.flash("error", "You don't have permission!");
      return res.redirect(`/listings/${id}`);
    }

    next();

  } catch (err) {
    next(err);
  }

};
