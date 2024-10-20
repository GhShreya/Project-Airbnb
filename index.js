if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
// console.log(process.env);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
// var bodyParser = require('body-parser');
 
//Routes
const listingRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/review.js");
const userRoute = require("./routes/user.js");


main()
    .then(()=>{
        console.log("Connected to Database")
    })
    .catch((err)=>{
        console.log(err);   
    })

async function main(){
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error", (err)=>{
    console.log("ERROR in Mongo Session Store", err);
})
const sessionOptions = {
    store:store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() +7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly:true
    }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine("ejs", ejsMate);


//Root Route
// app.get("/", (req, res)=>{
//     res.send("root working.")
// });

//Content-flash
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings",listingRoute);   
app.use("/listings/:id/reviews", reviewRoute);
app.use("/", userRoute);

//Demo-User
// app.get("/demouser", async(req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     let regUser = await User.register(fakeUser, "password");
//     console.log(regUser);
// });

// app.get("/test",async (req,res)=>{
//     let sampListing = new Listing({
//         title:"Penthouse",
//         description:"By the Beach..",
//         price:3000,
//         location:"Ooty, Bengaluru",
//         country:"India",
//     });
//      await sampListing
//         .save()
//         .then(()=>{
//             console.log("Data saved..");
//         })
//         .catch((err)=>{
//             console.log(err);
//         });
//         res.send("test successful");
// })

//Handling 404
app.all("*", (req,res,next)=>{
    next(new ExpressError(404, "Page not found!"));
});

//Error Handler
app.use((err, req, res, next)=>{
    let {statusCode=500, message="Something went wrong!"}= err;
    res.render("listings/error.ejs", {message});
    //res.status(statusCode).send(message);
    });

app.listen(port, ()=>{
    console.log(`App is listening on port ${port}.`);
});