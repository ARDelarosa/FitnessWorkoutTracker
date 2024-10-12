import React, { useState, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import axios from "axios";

const WorkoutForm = () => {
    const { token, user } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [status, setStatus] = useState("");
  
    const handleSubmit = async (e) => {
      e.preventDefault();

      // Simple validation check
  if (!name || !scheduledDate || !status) {
    console.error("All fields are required");
    return;
  }

      // Format `scheduledDate` to YYYY-MM-DD (date only)
    const formattedDate = new Date(scheduledDate).toISOString().split('T')[0];

    console.log("Submitting workout with:", { userId: user.id, name, formattedDate, status, token });

      try {
        await axios.post(`/api/workouts/${user.id}`, { name, scheduled_date: formattedDate, status }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Optionally clear form or handle success
      } catch (err) {
        console.error("Error creating workout", err);
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Workout Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        <input type="text" placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
        <button type="submit">Create Workout</button>
      </form>
    );
  };
  
  export default WorkoutForm;