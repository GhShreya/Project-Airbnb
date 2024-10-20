const Listing = require("./models/listing");
const ExpressError = require("./utils/expressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl; //if user not logged in then save users post url in session.redirectUrl
        req.flash("error", "Login to proceed!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl; //storing in local variables
    }
    next();
};

module.exports.isOwner = async(req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "Permission Denied!!");
        return res.redirect(`/listings/${id}`);   
    }
    next();
};

module.exports.validateListing = (req,res,next)=>{
    const data = req.body;
    console.log(req.body);
    let {error} = listingSchema.validate(data[0]);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        console.log(error);
        throw new ExpressError(400, errMsg);
    }else{
        next();
    } 
};

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }   
};

module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "Permission Denied!!");
        return res.redirect(`/listings/${id}`); 
    }
    next();
}