const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require("bcrypt");

router.get("/sign-up", (req, res) => {
    res.render("auth/sign-up.ejs");
});

router.post("/sign-up", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username});
    if (userInDatabase) {
        return res.send("Username already taken");
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.send("Password and Confirm Password must match!");
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;

    const user = await User.create(req.body);
    res.send(`Thanks for signing up ${user.username}`);
})

router.get("/sign-in", (req, res) => {
    res.render("auth/sign-in.ejs");
});

router.post("/sign-in", async (req, res) => {
    const userInDatabase = await User.findOne({username: req.body.username});
    if (!userInDatabase){
        return res.send("Login Failed. Please try again later.");
    }
    const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password);
    if (!validPassword){
        return res.send("Login Failed. Please try again later.");
    }
    req.session.user = {
        username: userInDatabase.username,
        _id: userInDatabase._id,
        role: userInDatabase.role
    };
    res.redirect("/")

})

router.get("/sign-out", (req, res) => {
    req.session.destroy();
    res.redirect("/");
})

module.exports = router;