import React, { useState, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:3000/api/auth/register", {
                username,
                password,
            });

            console.log("Response from register:", res.data);

            // On successful registration, login the user by storing the token in local storage
            login(res.data.token, res.data.user);

            // Redirect the user to the workouts page
            navigate("/workouts");
        } catch (err){
            setError("Registration failed. Please try again.");
            console.error("SignUp error", err);
        }
    };

    return (
        <form onSubmit={handleSignUp}>
            <h2>Sign Up</h2>
            {error && <p style={{color: "red"}}>{error}</p>}
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
            <button type="submit">Sign Up</button>
        </form>
    );
};

export default SignUp;