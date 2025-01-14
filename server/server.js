const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const userController = require("./controllers/userController");
const sessionController = require("./controllers/sessionController");
const boardController = require("./controllers/boardController");

const loginRouter = require('./router/loginRouter');
const boardRouter = require('./router/boardRouter');

// setup app and port
const app = express();
const PORT = process.env.PORT || 3000;
// Ideally this should be stored in a .env file or something similar
const SECRET = "PpHbKAXUt6iC5Z80OWrGwKNVYQsOqdra";
const ONE_DAY = 1000 * 60 * 60 * 24;

const mongoURI = "your-mongo-db-uri";
mongoose.connect(mongoURI, {
  // options for the connect method to parse the URI
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // sets the name of the DB that our collections are part of
  dbName: "tmnt",
})
  .then(() => console.log("Connected to Mongo DB."))
  .catch((err) => console.log(err));

// handle parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// By default, the session `store` instance defaults to a new `MemoryStore` instance
// It is NOT intended to be used in production
// If this application moves to production, a different store instance
// (e.g. MongoDB, redis) needs to be setup
app.use(
  session({
    secret: SECRET,
    resave: true,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_DAY,
    },
  })
);

// enable ALL CORS requests
app.use(cors());

// handle requests for static files (bundle.js)
app.use("/build", express.static(path.resolve(__dirname, "../build")));

// route handlers
app.post(
  "/api",
  sessionController.isLoggedIn,
  userController.getBoardIds,
  boardController.getBoards,

  (_, res) => {
    res.status(200).json(res.locals.boards);
  }
);

app.use('/boards', boardRouter);
app.use("/login", loginRouter);

app.post(
  "/signup",
  userController.createUser,
  sessionController.startSession,
  (_, res) => {
    // what should happen here on successful log in?
    console.log("completing post request to '/signup");
    res.status(200).json(res.locals.user);
  }
);

app.delete(
  "/logout",
  sessionController.terminateSession,
  (req, res) => {
    console.log("completing delete request to '/logout");
    res.sendStatus(200);
  }
)

app.use('/sessionTest',
  // sessionController.startSession,
  sessionController.isLoggedIn,
  (req, res) => {
    console.log("completing request to '/sessionTest");
    res.sendStatus(200);
  })

app.use("/api", sessionController.isLoggedIn, (req, res) => {
  console.log('completing request to "/api"');
});

// server index.html
app.get("/", (req, res) => {
  console.log(`Get request for '/'.  sending index.html`);
  res.status(200).sendFile(path.resolve(__dirname, "../index.html"));
});

// define catch-all route handler for requests to an unknown route
app.use((req, res) => res.status(404).send("No page found at that location"));

// global error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: "Express error handler caught unknown middleware error",
    status: 500,
    message: { err: "An error occurred" + err },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

// start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
