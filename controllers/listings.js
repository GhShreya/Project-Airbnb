const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews", populate: {path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing no longer exists ＞﹏＜");
        res.redirect("/listings");
    };
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async(req,res,next)=>{
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send()
        // .then(response => {
        //   const match = response.body;});
    
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    // console.log(newListing);
    newListing.owner = req.user._id; //to set user as owner of listing
    newListing.image = {url, filename}; //to set values of image
    newListing.geometry = response.body.features[0].geometry;
    await newListing
        .save()
        .then(()=>{console.log("new listing saved")})
        // .catch((err)=>{console.log(err)});
    req.flash("success", "New listing created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing no longer exists ＞﹏＜");
        res.redirect("/listings");
    };
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async(req,res)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing!");
    // }
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if (typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("error", "Listing Deleted!");
    res.redirect("/listings");
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};