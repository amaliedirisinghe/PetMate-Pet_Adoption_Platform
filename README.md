# PetMate - Social Service Pet Adoption Platform

PetMate is a university project that provides a simple social-service style platform for connecting users with pets available for adoption.

The system includes user registration and approval, authentication, pet submission and approval, adoption requests, and an administrator dashboard for managing the platform.

> **University Project:** IT-250

---

## Features

### User Features

* User registration with name, email, password, and phone
* Account status management:

  * Pending
  * Active
  * Blocked
* Session-based authentication
* User dashboard
* View available pets
* Add pets for adoption
* Upload pet photos
* Specify pet age in years and months
* View submitted pets
* Submit adoption requests
* View adoption request status
* Logout functionality

### Administrator Features

* Administrator authentication
* View and manage registered users
* Approve or block user accounts
* Review pets submitted for adoption
* Approve or reject pet listings
* Review adoption requests
* Manage adoption request status
* Record administrative actions

---
## Screenshots

### Home Page

![PetMate Home Page I](screenshots/Home%20Page%20I.png)

![PetMate Home Page II](screenshots/Home%20Page%20II.png)

![PetMate Home Page III](screenshots/Home%20Page%20III.png)

### Authentication

![PetMate Login](screenshots/Login.png)

![PetMate Registration](screenshots/Registration.png)

### Admin Dashboard

![Admin Dashboard I](screenshots/Admin%20Dashboard%20I.png)

![Admin Dashboard II](screenshots/Admin%20Dashboard%20II.png)

![Admin Dashboard III](screenshots/Admin%20Dashboard%20III.png)

### User Dashboard

![PetMate User Dashboard](screenshots/User%20Dashboard.png)

## Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap 5
* Google Fonts

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* bcryptjs
* express-session
* CORS
* Multer

---

## Project Structure

```text
IT-250/
│
├── config/
│   └── upload.js
│
├── Database/
│   ├── petmate.users.json
│   ├── petmate.pets.json
│   ├── petmate.adoptionrequests.json
│   ├── petmate.admin_actions.json
│   └── seed.js
│
├── models/
│   ├── User.js
│   ├── Pet.js
│   ├── AdoptionRequest.js
│   └── AdminAction.js
│
├── routes/
│   ├── auth.js
│   ├── pets.js
│   ├── adoptionRequests.js
│   └── admin.js
│
├── admin-dashboard.html
├── dashboard.html
├── index.html
├── login.html
├── register.html
├── status.html
├── styles.css
│
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md
```

> The `.env` file is used locally and is intentionally excluded from GitHub.

---

## Prerequisites

Before running PetMate, install:

* Node.js 14 or higher
* npm
* MongoDB Community Server or MongoDB Atlas
* Git (if cloning the project)

MongoDB should be running before starting the application.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/amaliedirisinghe/IT-250.git
cd IT-250
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
SESSION_SECRET=your-local-session-secret
MONGODB_URI=mongodb://127.0.0.1:27017/petmate
```

For security, do not commit the `.env` file to GitHub.

### 4. Start MongoDB

If using a local MongoDB installation, make sure the MongoDB service is running.

The default database used by PetMate is:

```text
petmate
```

### 5. Set up the database

The project includes a database setup script that imports the sample collections and recreates the required database views.

Run:

```bash
npm run setup
```

The setup creates:

* `users`
* `pets`
* `adoptionrequests`
* `admin_actions`
* `pendingUsersView`
* `pendingPetsView`
* `pendingAdoptionRequestsView`

> **Note:** The setup script restores the included sample data and recreates the collections. It should not be run when you want to preserve changes made to your current database.

### 6. Start the application

For normal use:

```bash
npm start
```

For development with automatic server restarting:

```bash
npm run dev
```

The server runs at:

```text
http://localhost:3000
```

Open the address in your browser to access PetMate.

---

## Environment Variables

PetMate uses environment variables for configuration.

| Variable         | Description                            |
| ---------------- | -------------------------------------- |
| `MONGODB_URI`    | MongoDB connection string              |
| `SESSION_SECRET` | Secret used to secure Express sessions |

Example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/petmate
SESSION_SECRET=your-local-session-secret
```

Never commit real production credentials or secrets to the repository.

---

## Demo Admin Account

The project includes a demo administrator account for testing the Admin Dashboard.

**Login credentials:**

* **Email:** `admin@gmail.com`
* **Password:** `123456`

After logging in with these credentials, you can access the **Admin Dashboard** and test:

* User account approval and blocking
* Pet listing approval and rejection
* Adoption request management
* Administrative action records

> **Note:** These are fictional demo credentials created specifically for this university project. They must not be used for real accounts or production systems.

---

## User Flow

```text
Homepage
   ↓
Register
   ↓
Account Status: Pending
   ↓
Administrator Approval
   ↓
Account Status: Active
   ↓
Login
   ↓
User Dashboard
   ↓
View Available Pets
   ↓
Submit Adoption Request
```

Users can also submit their own pets for adoption:

```text
User Dashboard
   ↓
Add Pet
   ↓
Pet Status: Pending
   ↓
Administrator Review
   ↓
Pet Approved
   ↓
Appears in Available Pets
```

---

## Administrator Flow

The administrator can:

1. View pending user registrations
2. Approve or block users
3. View pets submitted by users
4. Approve or reject pet listings
5. Review adoption requests
6. Update adoption request status
7. View recorded administrative actions

---

## Database

PetMate uses MongoDB as its database.

### Collections

#### `users`

Stores registered user accounts.

```javascript
{
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  status: String,
  createdAt: Date
}
```

Passwords are hashed using bcrypt before being stored.

#### `pets`

Stores pets submitted for adoption.

```javascript
{
  name: String,
  type: String,
  ageYears: Number,
  ageMonths: Number,
  description: String,
  photo: String,
  addedBy: ObjectId,
  status: String,
  createdAt: Date
}
```

#### `adoptionrequests`

Stores adoption requests submitted by users.

```javascript
{
  petId: ObjectId,
  userId: ObjectId,
  status: String,
  requestDate: Date,
  approvedDate: Date
}
```

#### `admin_actions`

Stores administrator activity and approval actions.

```javascript
{
  adminId: ObjectId,
  actionType: String,
  targetId: ObjectId,
  targetType: String,
  details: String,
  timestamp: Date
}
```

---

## Database Views

The project also includes MongoDB views for administrator-related pending records:

* `pendingUsersView`
* `pendingPetsView`
* `pendingAdoptionRequestsView`

These provide filtered information for pending users, pets, and adoption requests.

---

## Testing the Application

### Register a User

1. Open the PetMate homepage.
2. Select **Register**.
3. Enter the required details.
4. Submit the registration.
5. The account will initially have a `pending` status.

### Approve the User

1. Log in using the demo administrator account.
2. Open the **Admin Dashboard**.
3. Review the pending user.
4. Approve the user account.
5. The user's status becomes `active`.

### Login

1. Open the Login page.
2. Enter the registered email and password.
3. Active users are redirected to the dashboard.
4. Pending users are redirected to the account status page.
5. Blocked users cannot access the dashboard.

### Add a Pet

An active user can:

1. Open the dashboard.
2. Select **Add a Pet for Adoption**.
3. Enter the pet's details.
4. Specify age in years and months.
5. Upload a pet photo.
6. Submit the listing.

The pet remains pending until an administrator approves it.

### Approve a Pet

1. Log in to the Admin Dashboard.
2. Open the pending pets section.
3. Review the submitted pet.
4. Approve the pet listing.
5. The approved pet becomes available to users.

### Request Adoption

After a pet is approved:

1. Log in as an active user.
2. Open the User Dashboard.
3. Select an available pet.
4. Submit an adoption request.
5. The request is sent to the administrator for review.

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description                       |
| ------ | ------------------ | --------------------------------- |
| POST   | `/api/register`    | Register a new user               |
| POST   | `/api/login`       | Authenticate a user               |
| POST   | `/api/logout`      | Logout                            |
| GET    | `/api/user`        | Get current user                  |
| GET    | `/api/user/status` | Get current user's account status |

Additional endpoints are implemented for pets, adoption requests, and administrator operations.

---

## Security

PetMate includes several basic security measures:

* Passwords are hashed using bcrypt.
* Authentication uses Express sessions.
* Session secrets are stored in environment variables.
* `.env` is excluded from version control.
* Uploaded files are excluded from the Git repository.
* MongoDB connection details can be configured through environment variables.

---

## Design

PetMate uses a simple, friendly design intended for a pet adoption service.

### Color Scheme

| Purpose         | Color     |
| --------------- | --------- |
| Primary         | `#6EC1A6` |
| Secondary       | `#F4A261` |
| Background      | `#F9FAF7` |
| Card Background | `#FFFFFF` |
| Primary Text    | `#2F3E46` |
| Secondary Text  | `#6C757D` |

---

## Demo Data

The repository contains sample MongoDB data for demonstration and testing purposes.

The included database records are **fictional/demo records** and are not intended to represent real users.

---

## Notes

* PetMate was developed as a university project.
* The project does not include payment functionality.
* MongoDB is required for the application to operate.
* The included `Database/seed.js` script is provided to recreate the sample database environment.
* Uploaded pet images are stored locally and are excluded from the Git repository.
* The application is intended for educational and demonstration purposes.

---

## License

This project was developed as a university project for **IT-250**.
