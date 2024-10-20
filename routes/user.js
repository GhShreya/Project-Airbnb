const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
    .route("/signup")
    .get(userController.renderSignupForm)   //Signup Form render
    .post(wrapAsync(userController.signup));  //Signup Route

router
    .route("/login")
    .get(userController.renderLoginForm)  //Login Form render
    .post(saveRedirectUrl, passport.authenticate("local", {failureRedirect:"/login", failureFlash:true}), userController.Login);  //Login Route

//Logout
router.get("/logout",userController.Logout);

module.exports = router;