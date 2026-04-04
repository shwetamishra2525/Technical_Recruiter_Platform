import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import HRDashboard from './pages/HRDashboard';
import JDCreator from './pages/JDCreator';
import CandidateDashboard from './pages/CandidateDashboard';
import InterviewRoom from './pages/InterviewRoom';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import CandidateDetails from './pages/CandidateDetails';
import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans transition-colors duration-300">
                    <Navbar />
                    <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

                    {/* HR Routes */}
                    <Route path="/hr/dashboard" element={
                        <PrivateRoute role="hr"><HRDashboard /></PrivateRoute>
                    } />
                    <Route path="/hr/create-jd" element={
                        <PrivateRoute role="hr"><JDCreator /></PrivateRoute>
                    } />
                    <Route path="/hr/application/:id" element={
                        <PrivateRoute role="hr"><CandidateDetails /></PrivateRoute>
                    } />

                    {/* Candidate Routes */}
                    <Route path="/candidate/dashboard" element={
                        <PrivateRoute role="candidate"><CandidateDashboard /></PrivateRoute>
                    } />
                    <Route path="/candidate/interview/:jdId" element={
                        <PrivateRoute role="candidate"><InterviewRoom /></PrivateRoute>
                    } />

                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
        </ThemeProvider>
    );
}

export default App;
