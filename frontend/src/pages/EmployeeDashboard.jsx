import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import moment from "moment-timezone";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [error, setError] = useState("");

  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timezone, setTimezone] = useState(moment.tz.guess()); // Default: User's timezone
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }

    const fetchShifts = async () => {
      try {
        const response = await API.get("/employee/shifts");
        setShifts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch shifts");
      } finally {
        setLoadingShifts(false);
      }
    };

    const fetchAvailability = async () => {
      try {
        const response = await API.get("/employee/availability");
        setAvailability(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch availability");
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchShifts();
    fetchAvailability();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (selectedDays.length === 0) {
      setMessage("Please select at least one day.");
      return;
    }

    try {
      const response = await API.post("/employee/availability", {
        days: selectedDays,
        startTime,
        endTime,
        timezone,
      });

      setMessage(response.data.message || "Availability set successfully!");
      setSelectedDays([]);
      setStartTime("");
      setEndTime("");
      setTimezone(moment.tz.guess());

      const updatedAvailability = await API.get("/employee/availability");
      setAvailability(updatedAvailability.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to set availability");
    }
  };

  const toggleDaySelection = (day) => {
    setSelectedDays((prevDays) =>
      prevDays.includes(day) ? prevDays.filter((d) => d !== day) : [...prevDays, day]
    );
  };

  return (
    <div className="employee-dashboard">
      <h2>Welcome Employee</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>My Assigned Shifts</h3>
      {loadingShifts ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : shifts.length === 0 ? (
        <p>No shifts assigned yet.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Timezone</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift._id}>
                <td>{shift.date}</td>
                <td>{new Date(shift.startTime).toLocaleTimeString()}</td>
                <td>{new Date(shift.endTime).toLocaleTimeString()}</td>
                <td>{shift.timezone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Set Your Weekly Availability</h3>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleAvailabilitySubmit}>
        <label>Select Days of the Week:</label>
        <div className="days-checkbox">
          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
            <label key={day}>
              <input
                type="checkbox"
                value={day}
                checked={selectedDays.includes(day)}
                onChange={() => toggleDaySelection(day)}
              />
              {day}
            </label>
          ))}
        </div>

        <label>Start Time:</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />

        <label>End Time:</label>
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />

        <label>Timezone:</label>
        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} required>
          <option value="">Select Timezone</option>
          {moment.tz.names().map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>

        <button type="submit">Set Availability</button>
      </form>

      <h3>My Availability</h3>
      {loadingAvailability ? (
        <p>Loading...</p>
      ) : availability.length === 0 ? (
        <p>No availability set yet.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Timezone</th>
            </tr>
          </thead>
          <tbody>
            {availability.map((slot) => (
              <tr key={slot._id}>
                <td>{slot.date}</td>
                <td>{new Date(slot.startTime).toLocaleTimeString()}</td>
                <td>{new Date(slot.endTime).toLocaleTimeString()}</td>
                <td>{slot.timezone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmployeeDashboard;