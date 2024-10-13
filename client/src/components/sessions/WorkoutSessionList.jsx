import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import { useParams, useLocation } from "react-router-dom";

const WorkoutSessionList = () => {
    const { workoutId } = useParams(); // Get workout ID from URL
    const { token } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [newSession, setNewSession] = useState({ exercise_id: "", sets: 3, reps: 10 });
    const [isEditing, setIsEditing] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState(null);

    const location = useLocation(); // Use useLocation to get workout name
    const workoutName = location.state?.workoutName || "Unnamed Workout"; // Get from query params

    console.log("Received state object:", location.state)
    console.log(`Received workoutName: ${workoutName}`);

    // Fetch workout sessions
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await axios.get(`https://fitnessworkouttracker-1.onrender.com/api/workouts/${workoutId}/sessions`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSessions(res.data);
            } catch (err) {
                console.error("Error fetching sessions:", err);
            }
        };

        const fetchExercises = async () => {
            try {
                const res = await axios.get(`https://fitnessworkouttracker-1.onrender.com/api/exercises`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setExercises(res.data);
            } catch (err) {
                console.error("Error fetching exercises:", err);
            }
        };

        if (workoutId) {
            fetchSessions();
            fetchExercises();
        }
    }, [token, workoutId]);

    // Get exercise name by ID
    const getExerciseNameById = (exerciseId) => {
      const exercise = exercises.find((ex) => ex.id === exerciseId);
      return exercise ? exercise.name : "Unknown Exercise";
  };

    // Handle input changes for new or edited session
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSession((prev) => ({ ...prev, [name]: value }));
    };

    // Create or update a session
    const handleSessionSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Update session
                await axios.put(
                  `https://fitnessworkouttracker-1.onrender.com/api/workouts/sessions/${sessionToEdit}`,
                  { 
                      workout_id: workoutId, 
                      exercise_id: newSession.exercise_id, 
                      sets: parseInt(newSession.sets), 
                      reps: parseInt(newSession.reps) 
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
              );
            } else {
                // Create new session
                const res = await axios.post(
                    `https://fitnessworkouttracker-1.onrender.com/api/workout_sessions`,
                    { 
                      workout_id: workoutId, 
                      exercise_id: newSession.exercise_id, 
                      sets: parseInt(newSession.sets), 
                      reps: parseInt(newSession.reps) 
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSessions((prevSessions) => [...prevSessions, res.data]);
            }
            // Reset form state
            setNewSession({ exercise_id: "", sets: 3, reps: 10 });
            setIsEditing(false);
        } catch (err) {
            console.error("Error creating/updating session:", err);
        }
    };

    // Edit a session
    const handleEditSession = (session) => {
      setNewSession({
        exercise_id: session.exercise_id,
        sets: session.sets !== undefined ? session.sets : 3, // Default value of 3 if undefined
        reps: session.reps !== undefined ? session.reps : 10 // Default value of 10 if undefined
      });
      setIsEditing(true);
      setSessionToEdit(session.id);
    };

    // Clear session state on cancel
    const handleCancelEdit = () => {
      setIsEditing(false);
      setSessionToEdit(null);
      setNewSession({ exercise_id: "", sets: 3, reps: 10 }); // Reset to default values
    };

    // Delete a session
    const handleDeleteSession = async (sessionId) => {
        try {
            await axios.delete(`https://fitnessworkouttracker-1.onrender.com/api/workouts/sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId));
        } catch (err) {
            console.error("Error deleting session:", err);
        }
    };

    return (
        <div>
            <h1>Workout Sessions for: {workoutName}</h1>
            <form onSubmit={handleSessionSubmit}>
                <label>
                    Exercise:
                    <select name="exercise_id" value={newSession.exercise_id} onChange={handleInputChange} required>
                        <option value="">Select Exercise</option>
                        {exercises.map((exercise) => (
                            <option key={exercise.id} value={exercise.id}>
                                {exercise.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Sets:
                    <input
                        type="number"
                        name="sets"
                        value={newSession.sets}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Reps:
                    <input
                        type="number"
                        name="reps"
                        value={newSession.reps}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <button type="submit">{isEditing ? "Update Session" : "Add Exercise"}</button>
                {isEditing && (
                    <button type="button" onClick={handleCancelEdit}>
                        Cancel
                    </button>
                )}
            </form>
            <ul>
                {sessions.map((session) => (
                    <li key={session.id}>
                        Exercise: {getExerciseNameById(session.exercise_id)} | Sets: {session.sets} | Reps: {session.reps}
                        <button onClick={() => handleEditSession(session)}>Edit</button>
                        <button onClick={() => handleDeleteSession(session.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WorkoutSessionList;
