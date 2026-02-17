import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ToastProvider from './components/Toast'

// Pages
import DashboardPage from './pages/DashboardPage/DashboardPage'
import FlightsPage from './pages/FlightsPage/FlightsPage'
import BookingPage from './pages/BookingPage/BookingPage'
import BookingConfirmPage from './pages/BookingConfirmPage/BookingConfirmPage'
import BookingsPage from './pages/BookingsPage/BookingsPage'
import ManageFlightsPage from './pages/ManageFlightsPage/ManageFlightsPage'
import ManageAirlinesPage from './pages/ManageAirlinesPage/ManageAirlinesPage'
import ManageAircraftPage from './pages/ManageAircraftPage/ManageAircraftPage'
import ManageAirportsPage from './pages/ManageAirportsPage/ManageAirportsPage'
import PassengersPage from './pages/PassengersPage/PassengersPage'
import CrewPage from './pages/CrewPage/CrewPage'

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-wrapper">
                <Navbar />
                <div className="page-content">
                    {children}
                </div>
            </div>
        </div>
    )
}

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/flights" element={<FlightsPage />} />
                        <Route path="/book/:flightId" element={<BookingPage />} />
                        <Route path="/booking-confirm/:id" element={<BookingConfirmPage />} />
                        <Route path="/bookings" element={<BookingsPage />} />

                        {/* Admin / Management Routes */}
                        <Route path="/manage/flights" element={<ManageFlightsPage />} />
                        <Route path="/manage/airlines" element={<ManageAirlinesPage />} />
                        <Route path="/manage/aircraft" element={<ManageAircraftPage />} />
                        <Route path="/manage/airports" element={<ManageAirportsPage />} />
                        <Route path="/manage/passengers" element={<PassengersPage />} />
                        <Route path="/manage/crew" element={<CrewPage />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </ToastProvider>
    )
}

export default App
