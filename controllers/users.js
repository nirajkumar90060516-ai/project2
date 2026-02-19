const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup");
};

module.exports.signup = (req, res, next) => {

  const { username, email, password } = req.body;

  const newUser = new User({
    username,
    email,
  });

  User.register(newUser, password, (err, user) => {

    if (err) {
      req.flash("error", err.message);
      return res.redirect("/signup");
    }

    req.login(user, (err) => {

      if (err) return next(err);

      req.flash("success", "Welcome to Wanderlust!");

      res.redirect("/listings");
    });

  });

};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {

  req.flash("success", `Welcome back ${req.user.username}`);

  let redirectUrl = res.locals.redirectUrl || "/listings";

  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {

  req.logout((err) => {

    if (err) return next(err);

    req.flash("success", "Logout successful");

    res.redirect("/listings");

  });
};
