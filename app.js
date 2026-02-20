if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");


// ================= DATABASE =================

const dbUrl = process.env.ATLASDB_URL;

mongoose.connect(dbUrl)
.then(() => console.log("✅ Connected to DB"))
.catch(err => console.log(err));


// ================= VIEW ENGINE =================

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ================= MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// ================= SESSION STORE =================



const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
});

store.on("error", err => {
  console.log("SESSION ERROR", err);
});


// ================= SESSION =================

const sessionOptions = {
  store,
  secret: process.env.SECRET, // Strong secret from Render
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7*24*60*60*1000),
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  }
};

app.use(session(sessionOptions));


// ================= FLASH =================

app.use(flash());


// ================= PASSPORT =================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ================= GLOBAL VARIABLES =================

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


// ================= ROUTES =================

app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.get("/", (req, res) => {
  res.redirect("/listings");
});


// ================= ERROR =================

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {

  if (res.headersSent) {
    return next(err);
  }

  const { statusCode = 500 } = err;

  res.status(statusCode).render("error", { err });

});


// ================= SERVER =================

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
