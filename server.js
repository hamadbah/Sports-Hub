//npm i express mongoose dotenv ejs morgan method-override express-session bcrypt
const dotenv = require("dotenv");
dotenv.config();
const express = require("express"); 
const app = express();
// For CSS or Static Folder this is required 
const path = require('path');

// Middlewares
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

//To use session in your application
const session = require("express-session");
const passUserToView = require('./middleware/pass-user-to-view');
const isSignedIn = require('./middleware/is-signed-in');

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));

// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));

// Morgan for logging HTTP requests
app.use(morgan('dev'));

// Static Folder 
app.use(express.static(path.join(__dirname, 'public')));

// Session Configurations
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passUserToView);
// GET

app.get("/", async(req, res) => {
  res.render("index.ejs");
});

// Require Controller - Importing the controller
const authController = require("./controllers/auth");
const clubController = require("./controllers/club");
const lessonController = require('./controllers/lesson');
const User = require("./models/user");
app.use("/auth", authController);
app.use("/clubs", isSignedIn, clubController);
app.use('/lessons', isSignedIn, lessonController);

app.listen(port, () => {
  console.log(`The express app is ready on port http://localhost:${port}`);
});