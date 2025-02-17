import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import moment from "moment-timezone";

function RegistrationPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [timezone, setTimezone] = useState(moment.tz.guess());
  const [message, setMessage] = useState("");

  const timezones = moment.tz.names();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await API.post("/auth/register", { name, email, password, role, timezone });
      setMessage("Registration successful! Redirecting to login...");
      
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      <h2>Register</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleRegister}>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>

        <label>Timezone:</label>
        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} required>
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>

        <button type="submit">Register</button>
      </form>

      <p>Already have an account? <button onClick={() => navigate("/")}>Login</button></p>
    </div>
  );
}

export default RegistrationPage;
