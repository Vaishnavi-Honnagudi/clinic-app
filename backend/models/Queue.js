const mongoose = require("mongoose");

const QueueSchema = new mongoose.Schema({
  patientName: String,
  status: {
    type: String,
    default: "waiting"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Queue", QueueSchema);
