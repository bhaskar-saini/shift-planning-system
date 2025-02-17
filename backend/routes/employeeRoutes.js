const express = require("express");
const Availability = require("../models/Availability");
const authMiddleware = require("../middleware/auth");
const moment = require("moment-timezone");
const Shift = require("../models/Shift");

const router = express.Router();

router.post("/availability", authMiddleware, async (req, res) => {
  try {
    const { days, startTime, endTime, timezone } = req.body;
    const userId = req.user.id;

    if (!days || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ message: "Please select at least one day." });
    }

    if (!startTime || !endTime || !timezone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const weekAvailability = [];
    const dayMapping = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const startOfWeek = moment().startOf("isoWeek").utc();

    for (let day of days) {
      if (!(day in dayMapping)) {
        return res.status(400).json({ message: `Invalid day: ${day}` });
      }

      const dateStr = startOfWeek.clone().add(dayMapping[day], "days").format("YYYY-MM-DD");
      const startUTC = moment.tz(`${dateStr} ${startTime}`, timezone).utc().toDate();
      const endUTC = moment.tz(`${dateStr} ${endTime}`, timezone).utc().toDate();

      if (moment(endUTC).diff(moment(startUTC), "hours") < 4) {
        return res.status(400).json({ message: "Minimum 4 hours required per day." });
      }

      weekAvailability.push({ userId, date: dateStr, startTime: startUTC, endTime: endUTC, timezone });
    }

    await Availability.insertMany(weekAvailability);
    res.status(201).json({ message: "Availability added successfully for selected days." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/availability", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const availability = await Availability.find({ userId })
      .select("date startTime endTime timezone")
      .lean();

    if (!availability.length) {
      return res.status(404).json({ message: "No availability found." });
    }

    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/shifts", authMiddleware, async (req, res) => {
  try {
    const shifts = await Shift.find({ employeeId: req.user.id })
      .select("date startTime endTime timezone")
      .lean();

    if (!shifts.length) {
      return res.status(404).json({ message: "No shifts assigned." });
    }

    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
