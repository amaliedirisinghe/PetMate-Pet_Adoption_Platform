# PetMate - Social Service Pet Adoption Platform

A university project for a pet adoption platform with user registration, account status management, and authentication.

## Features

- **User Registration**: Create account with name, email, password, and phone
- **Account Status Management**: Pending → Active → Dashboard flow
- **Session-based Authentication**: Secure login with Express sessions
- **MongoDB Integration**: User data stored in MongoDB with Mongoose
- **Password Hashing**: Secure password storage with bcrypt

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5
- Google Fonts (Poppins, Inter)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt
- express-session

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd IT-250
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI if needed (default: `mongodb://localhost:27017/petmate`)
   - Change `SESSION_SECRET` for production

4. **Start MongoDB**
   - If using local MongoDB, ensure it's running:
     ```bash
     # Windows
     net start MongoDB
     
     # macOS/Linux
     sudo systemctl start mongod
     ```
   - Or use MongoDB Atlas and update `MONGODB_URI` in `.env`

5. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open browser: `http://localhost:3000`

## User Flow

1. **Homepage** → View featured pets and how it works
2. **Register** → Create account (status: pending)
3. **Status Page** → Check account approval status
4. **Login** → Authenticate (redirects based on status)
5. **Dashboard** → User dashboard (requires active status)

## API Endpoints

### POST `/api/register`
Register a new user
- **Body**: `{ name, email, password, phone }`
- **Response**: `{ message, userId }`

### POST `/api/login`
Login user
- **Body**: `{ email, password }`
- **Response**: `{ redirect: "status" | "dashboard", message }`

### GET `/api/user/status`
Get current user's status
- **Query**: `?email=user@example.com` (optional if session exists)
- **Response**: `{ status: "pending" | "active" | "blocked", email }`

### POST `/api/logout`
Logout user
- **Response**: `{ message }`

## Database Schema

### User Collection
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (optional),
  role: String (default: "user"),
  status: String (default: "pending", enum: ["pending", "active", "blocked"]),
  createdAt: Date (default: now)
}
```

## Testing the Application

1. **Register a new user**
   - Go to Register page
   - Fill in the form
   - Account will be created with status "pending"

2. **Check status**
   - After registration, you'll be redirected to status page
   - Click "Check Status" to verify current status

3. **Activate account (for testing)**
   - Use MongoDB Compass or mongo shell
   - Update user status to "active":
     ```javascript
     db.users.updateOne(
       { email: "user@example.com" },
       { $set: { status: "active" } }
     )
     ```

4. **Login**
   - Use registered email and password
   - If status is "active", you'll be redirected to dashboard
   - If status is "pending", you'll be redirected to status page

## Project Structure

```
IT-250/
├── models/
│   └── User.js          # User Mongoose model
├── routes/
│   └── auth.js          # Authentication routes
├── index.html           # Homepage
├── register.html        # Registration page
├── status.html          # Account status page
├── login.html           # Login page
├── dashboard.html       # User dashboard
├── styles.css           # Custom styles
├── server.js            # Express server
├── package.json         # Dependencies
└── README.md            # This file
```

## Color Scheme

- Primary: #6EC1A6 (mint green)
- Secondary: #F4A261 (soft orange)
- Background: #F9FAF7
- Card background: #FFFFFF
- Text primary: #2F3E46
- Text secondary: #6C757D
- Status colors:
  - Pending: #FACC15
  - Approved: #22C55E
  - Blocked: #EF4444

## Notes

- This is a university project focusing on the initial user flow
- Admin dashboard, pet listings, and adoption features are out of scope
- Session-based authentication is used for security
- Passwords are hashed using bcrypt before storage

## License

University Project - IT-250
