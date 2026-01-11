const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    problem: {
      type: String,
      default: "",
    },
    medicine: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["waiting", "called", "completed"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);