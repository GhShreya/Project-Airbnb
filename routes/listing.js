const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

router
    .route("/")
    .get(wrapAsync(listingController.index))   //Index Route
    // .post(upload.single("listing[image]"), (req, res)=>{res.send(req.file)});
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));  //Create Route

//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm); //keep the new route above :id routes, as you don't want new to be interpreted as id.

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))   //Show Route
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))  //Update Route
    .delete(isLoggedIn, wrapAsync(listingController.destroyListing));  //Delete Route

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
