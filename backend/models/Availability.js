const mongoose = require("mongoose");
const moment = require("moment-timezone");

const AvailabilitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    startTime: { type: Date, required: true, set: (val) => moment(val).utc().toDate() },
    endTime: { type: Date, required: true, set: (val) => moment(val).utc().toDate() },
    timezone: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Availability", AvailabilitySchema);
