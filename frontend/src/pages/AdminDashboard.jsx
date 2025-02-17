import { useEffect, useState } from "react";
import moment from "moment-timezone";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

function AdminDashboard() {
  const [availabilities, setAvailabilities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availabilityTimezone, setAvailabilityTimezone] = useState(moment.tz.guess());
  const [shiftTimezone, setShiftTimezone] = useState(moment.tz.guess());

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedShiftEmployee, setSelectedShiftEmployee] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const availabilityResponse = await API.get("/admin/all-availability");
        setAvailabilities(availabilityResponse.data);

        const uniqueEmployees = [
          ...new Map(
            availabilityResponse.data.map((item) => [item.userId._id, item.userId])
          ).values(),
        ];

        setEmployees(uniqueEmployees);

        // const shiftResponse = await API.get("/admin/shifts");
        // setShifts(shiftResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const fetchEmployeeAvailability = async (employeeId) => {
    setLoading(true);
    setSelectedEmployee(employeeId);

    try {
      if (!employeeId) {
        const response = await API.get("/admin/all-availability");
        setAvailabilities(response.data);
      } else {
        const response = await API.get(`/admin/availability/${employeeId}`);
        setAvailabilities(response.data);
      }

      const selectedEmp = employees.find((emp) => emp._id === employeeId);
      setAvailabilityTimezone(selectedEmp ? selectedEmp.timezone : moment.tz.guess());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedShiftEmployee) {
      const emp = employees.find(e => e._id === selectedShiftEmployee);
      if (emp) {
        setShiftTimezone(emp.timezone || moment.tz.guess());
      } else {
        setShiftTimezone(moment.tz.guess());
      }
    }
  }, [selectedShiftEmployee, employees]);

  const handleCreateShift = async (e) => {
    e.preventDefault();
    setMessage("");

    console.log("Selected Employee:", selectedShiftEmployee);
    console.log("Date:", date);
    console.log("Start Time:", startTime);
    console.log("End Time:", endTime);
    console.log("Timezone:", shiftTimezone);

    if (!selectedShiftEmployee || !date || !startTime || !endTime || !shiftTimezone) {
      setMessage("All fields are required");
      console.log("Error: Missing required fields!");
      return;
    }

    try {
      const response = await API.post("/admin/shifts", {
        employeeId: selectedShiftEmployee,
        date,
        startTime,
        endTime,
        timezone: shiftTimezone,
      });

      setMessage(response.data.message);
      console.log("Shift Created:", response.data);

      const shiftResponse = await API.get("/admin/shifts");
      setShifts(shiftResponse.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Shift creation failed");
    }
  };

  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="admin-dashboard">
      <h2>Welcome Admin</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>Employee Availability</h3>

      <label>Select Employee:</label>
      <select
        onChange={(e) => fetchEmployeeAvailability(e.target.value)}
        value={selectedEmployee}
      >
        <option value="">All Employees</option>
        {employees.map((emp) => (
          <option key={emp._id} value={emp._id}>
            {emp.name} ({emp.email})
          </option>
        ))}
      </select>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Timezone</th>
            </tr>
          </thead>
          <tbody>
            {availabilities.map((availability) => (
              <tr key={availability._id}>
                <td>{availability.userId?.name || "Unknown"}</td>
                <td>{availability.userId?.email || "Unknown"}</td>
                <td>{availability.date}</td>
                <td>{new Date(availability.startTime).toLocaleTimeString()}</td>
                <td>{new Date(availability.endTime).toLocaleTimeString()}</td>
                <td>{availability.timezone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Create a Shift</h3>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleCreateShift}>
        <label>Employee:</label>
        <select value={selectedShiftEmployee} onChange={(e) => setSelectedShiftEmployee(e.target.value)} required>
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name} ({emp.email})
            </option>
          ))}
        </select>

        <label>Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <label>Start Time:</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />

        <label>End Time:</label>
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />

        <label>Timezone:</label>
        <select value={shiftTimezone} onChange={(e) => setShiftTimezone(e.target.value)} required>
          <option value="">Select Timezone</option>
          {moment.tz.names().map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>

        <button type="submit">Create Shift</button>
      </form>

      <h3>Assigned Shifts</h3>
      {shifts.length === 0 ? (
        <p>No shifts assigned yet.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Timezone</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift._id}>
                <td>{shift.employeeId?.name || "Unknown"}</td>
                <td>{shift.employeeId?.email || "Unknown"}</td>
                <td>{shift.date}</td>
                <td>{new Date(shift.startTime).toLocaleTimeString()}</td>
                <td>{new Date(shift.endTime).toLocaleTimeString()}</td>
                <td>{shift.timezone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;
