const express = require("express");
const Queue = require("../models/Queue");
const router = express.Router();

router.post("/add", async (req, res) => {
  const entry = await Queue.create(req.body);
  res.json(entry);
});

router.get("/", async (req, res) => {
  const queue = await Queue.find().sort({ createdAt: 1 });
  res.json(queue);
});

module.exports = router;
