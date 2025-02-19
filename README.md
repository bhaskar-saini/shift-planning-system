# shiftex - Shift Planning System
In Action - https://shiftex.vercel.app/
<br><br>
## Overview
A Shift Planning System built using the MERN stack (MongoDB, Express.js, React.js, Node.js). This system allows admins to create shifts and assign employees based on their availability, 
with support for global time zones. Employees can see their assigned shifts in their local time and add their weekly availability.<br>
## Features
- **User Registration:** Hashes passwords using bcrypt before storing them in MongoDB.
- **Login Authentication:** Verifies user credentials, generates and returns a JWT token.
- **Role-Based Authorization:** Middleware checks JWT + role permissions before allowing route access.
- **Admin Role:**
  - View employee availability.
  - Create and assign shifts to selected employees as per their availability.
- **Employee Role:**
  - Set their weekly availability for shifts and availability must be at least 4 hours per day.
  - View assigned shifts.
  - View their availability for the week.
- **Time Zone Support:**
  - Employees can set availability in their local time zone.
  - Admins can create shifts in any time zone.
  - Automatic time zone conversion and matching using moment-timezone npm.<br>
  ## Tech Stack
- **Frontend:** React.js, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **API Testing:** Postman
- **Deployment:** Vercel (Frontend), Render (Backend)
## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/bhaskar-saini/shift-planning-system.git
2. Set up backend
   ```bash
   cd backend
   npm install
   node server.js
3. Set up frontend
   ```bash
   cd frontend
   npm install
   npm run dev
4. create .env in frontend as well as in the backend
   ```bash
   //backend env example
   MONGO_URI=your database link create one in MongoDB atlas
   JWT_SECRET=your_key
   //frontend example
   VITE_API_BASE_URL=http://localhost:5000/api
## Contributing
Feel free to open issues or submit pull requests for improvements.
