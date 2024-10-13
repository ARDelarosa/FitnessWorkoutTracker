import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import axios from "axios";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // clear any previous errors
            setError("");

            const res = await axios.post(`https://fitnessworkouttracker-1.onrender.com/api/auth/login`, {
                username,
                password 
            });

            //Debugging log: Check repsonse data from backend
            console.log("Response from backend: ", res.data);

            // Check that token and user data are present
            const { token, user } = res.data;
            if (!token || !user) {
                console.error("missing token or user in response", res.data);
                return;
            }

            // Debugging log: Check vaules being passed to login function
            console.log("Logging in with token: ", token, "and user: ", user);

            // Call login function from AuthContext
            login(token, user);

            navigate("/workouts");
        } catch (err) {
            if (err.response  && err.response.status === 401) {
                setError(" Username or password is incorrect");
            } else {
                setError("An error occurred. Please try again.");
            }
            console.error("Login error" ,err);
        }
    };

    return (
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          {/* Display error message if there is one */}
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      );
    };

export default Login;