if(process.env.NODE_ENV!="production"){   //Debugging Or Development Phase
    require('dotenv').config();
}
// console.log(process.env.SECRET);

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
// const MongoStore = require('connect-mongo')(session); // Pass session here
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const signup = require("./controllers/user.js");


//Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const port = 8080; 
//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
// console.log(dbUrl);

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

const store = (MongoStore.default ? MongoStore.default : MongoStore).create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,  //Seconds
});

store.on("error",(err)=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{   
    console.log(err);
});
async function main(){
    //await mongoose.connect(MONGO_URL);
    await mongoose.connect(dbUrl);
};

//Accesing Routes
app.get("/",signup.renderSignupForm);



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.all(/.*/,(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});
//Errorhandling Middleware
app.use((err,req,res,next)=>{
    // res.send("Something went wrong!");
    let{statuscode=500,message="Something went wrong"} = err;
    // res.status(statuscode).send(message)
    res.status(statuscode).render("error.ejs",{message});
});

app.listen(port,()=>{
    console.log(`server is running on the port ${port}`);
});