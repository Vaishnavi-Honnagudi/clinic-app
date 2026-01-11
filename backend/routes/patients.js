import express from "express";
import Patient from "../models/Patient.js";

const router = express.Router();

// Add patient (doctor only)
router.post("/", async (req, res) => {
  const patient = await Patient.create(req.body);
  res.json(patient);
});

// Get all patients
router.get("/", async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

export default router;
