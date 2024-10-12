import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";

const Navigation = ({ children }) => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Pages where the logout button should not appear
  const noLogoutPaths = ["/login", "/signup"];

  // Handle logout click
  const handleLogout = () => {
    logout(navigate); // Pass navigate to logout
  };

   // Handle navigate to home click
   const handleNavigateHome = () => {
    navigate("/"); // Redirect to homepage
  };

  return (
    <div>
      {/* Always show the homepage button */}
      <div style={{ position: "fixed", top: 10, right: 10 }}>
        <button onClick={handleNavigateHome} style={{ marginRight: 10 }}>
          Homepage
        </button>

        {/* Conditionally render the logout button */}
        {!noLogoutPaths.includes(location.pathname) && (
          <button onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
      
      {/* Render the main content */}
      {children}
    </div>
  );
};

export default Navigation;
