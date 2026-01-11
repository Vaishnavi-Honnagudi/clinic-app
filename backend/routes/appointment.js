const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

/**
 * ===============================
 * PATIENT BOOKS APPOINTMENT
 * POST /appointments/book
 * ===============================
 */
router.post("/book", async (req, res) => {
  try {
    const { patientId, patientName, problem } = req.body;

    if (!patientId || !patientName) {
      return res.status(400).json({ message: "Missing patient data" });
    }

    const appointment = await Appointment.create({
      patientId,
      patientName,
      problem,
      status: "waiting",
    });

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ===============================
 * GET ACTIVE QUEUE (Doctor + Patient)
 * GET /appointments
 * ===============================
 */
router.get("/", async (req, res) => {
  try {
    const list = await Appointment.find({
      status: { $ne: "completed" },
    }).sort({ createdAt: 1 });

    res.json(list); // ALWAYS ARRAY
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ===============================
 * DOCTOR CALLS PATIENT
 * PUT /appointments/call/:id
 * ===============================
 */
router.put("/call/:id", async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "called" },
      { new: true }
    );

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ===============================
 * DOCTOR ADDS MEDICINE & COMPLETES
 * PUT /appointments/medicine/:id
 * ===============================
 */
router.put("/medicine/:id", async (req, res) => {
  try {
    const { medicine } = req.body;

    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        medicine,
        status: "completed",
      },
      { new: true }
    );

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ===============================
 * PATIENT VIEWS OWN APPOINTMENT
 * GET /appointments/patient/:patientId
 * ===============================
 */
router.get("/patient/:patientId", async (req, res) => {
  try {
    const appt = await Appointment.findOne({
      patientId: req.params.patientId,
      status: { $ne: "completed" },
    });

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ===============================
 * PATIENT UPDATES PROBLEM (ONLY IF WAITING)
 * PUT /appointments/update/:id
 * ===============================
 */
router.put("/update/:id", async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);

    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appt.status !== "waiting") {
      return res
        .status(400)
        .json({ message: "Cannot update after being called" });
    }

    appt.problem = req.body.problem;
    await appt.save();

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;