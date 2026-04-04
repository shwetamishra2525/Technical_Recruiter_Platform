import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (role && userRole !== role) {
        // Redirect to appropriate dashboard if role doesn't match
        if (userRole === 'hr') return <Navigate to="/hr/dashboard" />;
        return <Navigate to="/candidate/dashboard" />;
    }

    return children;
};

export default PrivateRoute;
