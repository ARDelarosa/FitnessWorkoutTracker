import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
      const storedUser = localStorage.getItem("user");
      console.log("Stored user in localStorage:", localStorage.getItem("user"));

      if (!storedUser) {
        return null;
      }
      
      try {
        return JSON.parse(storedUser);
      } catch (error) { 
        console.error("Error parsing stored user:", error);
        return null;
      }
    });

    // Initialize token and user from localStorage
    const [token, setToken] = useState(localStorage.getItem("token") || "");

          // Sync token to localStorage when it changes
    useEffect(() => {
        if (token) {
        localStorage.setItem("token", token);
        } else {
        localStorage.removeItem("token");
        }
    }, [token]);

    // Sync user to localStorage when it changes
    useEffect(() => {
        if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        } else {
        localStorage.removeItem("user");
        }
        console.log("User object from localStorage:", user);
    }, [user]);

    const login = (token, userData) => {
        // Remove sensitive information like password from userData
        const sanitizedUser = { ...userData };
        delete sanitizedUser.password;

        console.log("Logging in with sanitized user: ", sanitizedUser);
        setToken(token);
        setUser(sanitizedUser);
    };

    const logout = (navigate) => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );  
};