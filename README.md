# ✈️ Airline Management System

A comprehensive web-based application for managing airline operations, bookings, and fleet logistics. Built with a **React** frontend and **Node.js/Express** backend, powered by **Supabase (PostgreSQL)**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Active-success.svg)

## ✨ Features

### 🌍 Public Interface
- **Flight Search**: Search for flights by origin, destination, and date.
- **Real-time Availability**: View seat availability by class (Economy, Business, First).
- **Booking Flow**: Book flights, manage passenger details, and generate "boarding passes".
- **Responsive Design**: Modern UI capable of working on various screen sizes.

### 🛠️ Admin Dashboard
- **Operational Overview**: Track total flights, active bookings, and revenue.
- **Flight Management**: Schedule, delay, or cancel flights.
- **Fleet Management**: Manage aircraft, track maintenance status.
- **Route Management**: Add/Edit airlines and airports.
- **Crew Management**: Assign pilots and crew to flights.
- **Passenger History**: View booking history and passenger profiles.

## 🚀 Tech Stack

- **Frontend**: React (Vite), Tailwind-like CSS, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS).
- **Tools**: Nodemon, Postman (for API testing).

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- A Supabase account and project.

### 1. Database Setup (Supabase)
1. Create a new Supabase project.
2. Navigate to the SQL Editor in Supabase.
3. Copy the contents of `SUPABASE_SETUP.md` (or the provided SQL schema) and run it to create tables and policies.
4. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Project Settings > API.

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
```
Seed the database with initial data:
```bash
npm run seed
```
Start the server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
# App runs on http://localhost:5173
```

## 📂 Project Structure

```
airline-management/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/           # Axios setup
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   └── ...
├── server/                 # Node.js Backend
│   ├── config/            # Supabase configuration
│   ├── controllers/       # Request handlers
│   ├── routes/            # API routes
│   └── seed.js            # Database seeding script
└── ...
```

## 🔒 Security
- **Row Level Security (RLS)**: Enabled on Supabase to secure data access.
- **Environment Variables**: Sensitive keys are stored in `.env` (not committed).

## 🤝 Contributing
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License
Distributed under the MIT License.
