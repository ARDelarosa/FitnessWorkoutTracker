import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChangePassword from './AdminForm';


const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch the list of users when the component loads
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Token:", token);
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user || user.role !== 'admin') {
            console.error("Unauthorized access: Not an admin or missing token");
            return;  // Handle unauthorized access here
          }

          console.log("Token:", token);

        const response = await axios.get(`https://fitnessworkouttracker-1.onrender.com/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://fitnessworkouttracker-1.onrender.com/api/admin/update-user/${selectedUser.id}`, {
        username,
        password,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(response.data.message);
      // Optionally: Update the UI to reflect the updated user information
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("Error updating user");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://fitnessworkouttracker-1.onrender.com/api/admin-only-route`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setMessage("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      setMessage("Error deleting user.");
    }
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <h2>Manage Users</h2>
      <form onSubmit={handleUserUpdate}>
        <div>
          <label>Select User:</label>
          <select
            value={selectedUser?.id || ''}
            onChange={(e) => 
              setSelectedUser(users.find((user) => user.id === e.target.value))
            }
          >
            <option value="">-- Select User --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Update User</button>
      </form>

      {/* Display delete button separately */}
    {selectedUser && (
      <button onClick={() => handleDeleteUser(selectedUser.id)}>Delete User</button>
    )}

      {message && <p>{message}</p>}
      <ChangePassword />  {/* Add ChangePassword component here */}
    </div>
  );
};

export default AdminPanel;
