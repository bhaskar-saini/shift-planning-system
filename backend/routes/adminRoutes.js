const express = require("express");
const Shift = require("../models/Shift");
const Availability = require("../models/Availability");
const authMiddleware = require("../middleware/auth");
const moment = require("moment-timezone");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/all-availability", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const availability = await Availability.find().populate("userId", "name email");

    if (!availability.length) {
      return res.status(404).json({ message: "No availability records found." });
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/availability/:employeeId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employeeId format" });
    }

    const availability = await Availability.find({ userId: employeeId }).populate("userId", "name email");

    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/available-employees/:date/:startTime/:endTime/:timezone(*)", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { date, startTime, endTime, timezone } = req.params;

    if (!moment.tz.zone(timezone)) {
      return res.status(400).json({ message: "Invalid timezone provided." });
    }

    const shiftStartUTC = moment.tz(`${date} ${startTime}`, timezone).utc().toDate();
    const shiftEndUTC = moment.tz(`${date} ${endTime}`, timezone).utc().toDate();

    const employees = await Availability.find({
      date,
      startTime: { $lte: shiftStartUTC },
      endTime: { $gte: shiftEndUTC },
    }).populate("userId", "name email");

    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/shifts", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { employeeId, date, startTime, endTime, timezone } = req.body;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employeeId format" });
    }

    if (!employeeId || !date || !startTime || !endTime || !timezone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const shiftDate = date;
    const shiftStartUTC = moment.tz(`${date} ${startTime}`, timezone).utc().toDate();
    const shiftEndUTC = moment.tz(`${date} ${endTime}`, timezone).utc().toDate();

    if (!shiftStartUTC || !shiftEndUTC) {
      return res.status(400).json({ message: "Invalid date or time format." });
    }

    const availability = await Availability.findOne({
      userId: employeeId,
      date: shiftDate,
      startTime: { $lte: shiftStartUTC },
      endTime: { $gte: shiftEndUTC },
    });

    if (!availability) {
      return res.status(400).json({ message: "Employee is not available for this shift" });
    }

    const overlappingShift = await Shift.findOne({
      employeeId,
      date: shiftDate,
      $or: [
        { startTime: { $lt: shiftEndUTC, $gte: shiftStartUTC } },
        { endTime: { $gt: shiftStartUTC, $lte: shiftEndUTC } },
        { startTime: { $lte: shiftStartUTC }, endTime: { $gte: shiftEndUTC } }
      ],
    });

    if (overlappingShift) {
      return res.status(400).json({ message: "Shift overlaps with an existing shift" });
    }

    const shift = new Shift({
      adminId: req.user.id,
      employeeId,
      date: shiftDate,
      startTime: shiftStartUTC,
      endTime: shiftEndUTC,
      timezone,
    });

    await shift.save();
    res.status(201).json({ message: "Shift created successfully", shift });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/shifts", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    
    const shifts = await Shift.find().populate("employeeId", "name email");

    if (!shifts.length) {
      return res.status(404).json({ message: "No shifts assigned." });
    }

    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
