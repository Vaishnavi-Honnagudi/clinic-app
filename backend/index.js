require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// DATABASE
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch(err => console.error(err));

// ROUTES  🔴 DO NOT CHANGE THESE PATHS
app.use("/auth", require("./routes/auth"));
app.use("/appointments", require("./routes/appointment"));

// ROOT CHECK
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// SERVER
app.listen(5000, () => {
  console.log("Backend running on 5000");
});
