import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navigation from './components/navigation/Navigation';
import HomePage from './components/homepage/HomePage';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import WorkoutList from './components/workouts/WorkoutList';
import WorkoutSessionList from './components/sessions/WorkoutSessionList';
import ExerciseList from './components/exercises/ExerciseList';
import Reports from './components/reports/Reports';
import WorkoutDetails from './components/workouts/WorkoutDetails';
import AdminPanel from './components/admin/AdminAuth';
import './App.css';

// AdminRoute component for protecting admin routes
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');  // Get the token
  const role = localStorage.getItem('role');  // Get the role

  if (!token || role !== 'admin') {
    // If the user is not logged in or not an admin, redirect to login
    return <Navigate to="/login" />;
  }

  // Render the admin route if the user is an admin
  return children;
};

// Function to handle applying different body classes based on the route
const BodyClassController = () => {
  const location = useLocation(); // Get the current route

  useEffect(() => {
    // Apply different classes based on the current path
    if (location.pathname === '/' || location.pathname === '/home') {
      document.body.classList.add('home-page');
      document.body.classList.remove('non-home');
    } else {
      document.body.classList.add('non-home');
      document.body.classList.remove('home-page');
    }
  }, [location]); // Run whenever the route changes

  return null; // This component doesn't render anything
};
  
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <BodyClassController />
        <Navigation>
          <Routes>
            <Route path="/" element={<Navigation> <HomePage /> </Navigation>} />
            <Route path="/admin-panel" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/workouts" element={<Navigation> <WorkoutList /> </Navigation>} />
            <Route path="/workouts/:workoutId" element={<Navigation> <WorkoutDetails /> </Navigation>} />
            <Route path="/workouts/:workoutId/sessions" element={<Navigation> <WorkoutSessionList /> </Navigation>} />
            <Route path="/exercises" element={<Navigation> <ExerciseList /> </Navigation>} />
            <Route path="/reports" element={<Navigation> <Reports /> </Navigation>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Navigation>
      </Router>
    </AuthProvider>
  );
};

export default App
