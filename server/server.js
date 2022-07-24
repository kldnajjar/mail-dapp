const express = require("express");
const cors = require("cors");
let Gun = require("gun");
// const corsOptions = require("./src/configs/corsOrigin/corsOptions");

// implements forked version of bullet catcher with
// additional error handling
require("dotenv").config();

const app = express();
const port = process.env.PORT || 9765;

app.use(Gun.serve);

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

Gun({
  web: server,
  // peers: [
  //   "https://mykmail-server-usa.herokuapp.com/gun",
  //   "https://mykmail-server-eu.herokuapp.com/gun",
  // ],
  // verify: {
  //   check: function () {
  //     console.log("PEER CONNECTED!!");
  //     return true;
  //   },
  // },
});

// parse application/json
app.use(express.json());

// if you're allowing gun access to more than one http origin,
// you'll want to make sure that CORs for API routes is configured
app.use(cors());
