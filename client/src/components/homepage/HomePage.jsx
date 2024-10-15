import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import './Home.css';

const HomePage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/workouts');
    }
  }, [token, navigate]);

  return (
    <div className='home-container'>
      <h1>Welcome to Fitness Tracker</h1>
      <p>Please login or sign up to get started.</p>
      <div className='content-box'>
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/signup">
          <button>Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;