require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteMany({ role: "doctor" });
  await User.create({
    name: "Doctor",
    email: "doctor@gmail.com",
    password: "1234",
    role: "doctor"
  });
  console.log("Doctor seeded");
  process.exit();
});
