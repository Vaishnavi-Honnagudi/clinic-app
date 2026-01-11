import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: String,
  addedBy: String
});

export default mongoose.model("Patient", patientSchema);
