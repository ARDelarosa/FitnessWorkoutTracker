import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import CommentList from "../comments/CommentList";
import CommentForm from "../comments/CommentForm";

const WorkoutList = () => {
  
  const { token, user } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState({ name: "", scheduled_date: "", status: "" });
  const [workoutToEdit, setWorkoutToEdit] = useState(null); // Track workout being edited
  const [isEditing, setIsEditing] = useState(false); // Flag for editing state
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [refreshComments, setRefreshComments] = useState(false);

  const navigate = useNavigate();

  // Format date to 'yyyy-MM-dd'
const formatDate = (dateString) => {
  if (!dateString) return ""; // Return an empty string if dateString is invalid

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateString); 
    return "";
  }

  return date.toISOString().split("T")[0];
};


  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await axios.get(`https://fitnessworkouttracker-1.onrender.com/api/users/${user.id}/workouts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkouts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching workouts:", err);
      }
    };

    if (user && user.id) {
      fetchWorkouts();
    }
    console.log("user object in WorkoutList:", user);
  }, [token, user]);


  // Handle input changes for the new workout form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorkout((prev) => ({ ...prev, [name]: value || "" }));
  };

  // Handle creating or updating a workout
  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    const formattedDate = new Date(newWorkout.scheduled_date).toISOString().split('T')[0];

    if (!user || !user.id) {
      console.error("User information is not available.");
      return;
    }

    try {
      if (isEditing) {
        // Update workout
        await axios.put(
          `https://fitnessworkouttracker-1.onrender.com/api/workouts/${workoutToEdit}`,
          { name: newWorkout.name, scheduled_date: formattedDate, status: newWorkout.status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWorkouts((prevWorkouts) =>
          prevWorkouts.map((workout) =>
            workout.id === workoutToEdit
              ? { ...workout, name: newWorkout.name, scheduled_date: formattedDate, status: newWorkout.status }
              : workout
          )
        );
        setIsEditing(false);
        setWorkoutToEdit(null);
      } else {
        // Create workout
        const res = await axios.post(
          `https://fitnessworkouttracker-1.onrender.com/api/workouts/${user.id}`,
          { name: newWorkout.name, scheduled_date: formattedDate, status: newWorkout.status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWorkouts((prevWorkouts) => [...prevWorkouts, res.data]);
      }

      // Clear the form
      setNewWorkout({ name: "", scheduled_date: "", status: "" });
    } catch (err) {
      console.error("Error creating/updating workout", err);
    }
  };

  // Set workout to edit
  const handleEditWorkout = (workout) => {
    setNewWorkout({
      name: workout.name,
      scheduled_date: formatDate(workout.scheduled_date),
      status: workout.status,
    });
    setWorkoutToEdit(workout.id);
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setWorkoutToEdit(null);
    setNewWorkout({ name: "", scheduled_date: "", status: "" });
  };

  // Handle deleting a workout
  const handleDeleteWorkout = async (workoutId) => {
    try {
      await axios.delete(`https://fitnessworkouttracker-1.onrender.com/api/users/${user.id}/workouts/${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts((prevWorkouts) => prevWorkouts.filter((workout) => workout.id !== workoutId));
    } catch (err) {
      console.error("Error deleting workout", err);
    }
  };

  const handleViewSessions = (workout) => {
    navigate(`/workouts/${workout.id}/sessions`, {
      state: { workoutName: workout.name },
    });
  };

  const handleToggleCommentForm = (workoutId) => {
    setSelectedWorkoutId(workoutId);
    setShowCommentForm((prev) => !prev);
    setSelectedComment(null); // Reset selected comment when toggling the form
  };

  const handleEditComment = (comment) => {
    setSelectedComment(comment); // Set the selected comment for editing
    setSelectedWorkoutId(comment.workout_id); // Ensure it matches the workout for the comment
    setShowCommentForm(true); // Show the comment form with the selected comment for editing
  };

  const handleAddorUpdateComment = () => {
    setShowCommentForm(false); // Hide the form after adding the comment
    setRefreshComments((prev) => !prev); // Toggle the refresh state to trigger a re-fetch in CommentList
    setSelectedComment(null); // Clear the selected comment after the operation
  };

  return (
    <div>
      <h2>Welcome, {user?.username || "User"}!</h2>
      <h1>Your Workouts</h1>


      <Link to="/exercises">Go to Exercises</Link>
      <br />
      <Link to="/reports">Go to Reports</Link>

      {user && user.id ? (
        // Workout Form for creating and updating
        <form onSubmit={handleWorkoutSubmit}>
          <h3>{isEditing ? "Edit Workout" : "Create New Workout"}</h3>
          <input
            type="text"
            name="name"
            placeholder="Workout Name"
            value={newWorkout.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="scheduled_date"
            value={formatDate(newWorkout.scheduled_date)}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="status"
            placeholder="Status (e.g., planned, completed)"
            value={newWorkout.status}
            onChange={handleInputChange}
            required
          />
          <button type="submit">{isEditing ? "Update Workout" : "Create Workout"}</button>
          {isEditing && <button type="button" onClick={handleCancelEdit}>Cancel Edit</button>}
        </form>
      ) : (
        <p>Loading user information...</p>
      )}

      {/* List of workouts */}
      <ul>
        {workouts.map((workout) => (
          <li key={workout.id}>
            <div>
              {workout.name} - {formatDate(workout.scheduled_date)} - Status: {workout.status}
              <button onClick={() => handleViewSessions(workout)}>View Sessions</button>
              <button onClick={() => handleEditWorkout(workout)}>Edit</button>
              <button onClick={() => handleDeleteWorkout(workout.id)}>Delete</button>
            </div>
            <button onClick={() => handleToggleCommentForm(workout.id)}>
                {showCommentForm && selectedWorkoutId === workout.id ? "Cancel" : "Add New Comment"}
              </button>
              {/* Show Comment Form only if the button was clicked for this workout */}
              {showCommentForm && selectedWorkoutId === workout.id && (
                <CommentForm
                  workoutId={selectedWorkoutId}
                  token={token}
                  selectedComment={selectedComment} // Pass the selected comment for editing
                  setSelectedComment={setSelectedComment} // Allows clearing the selected comment
                  onCommentAdded={handleAddorUpdateComment}
                />
              )}
                <CommentList 
                  workoutId={workout.id} 
                  token={token}
                  refreshComments={refreshComments} // Pass refreshComments state to CommentList
                  onEditComment={handleEditComment} // Pass the function to select a comment for editing
                />
          </li>
        ))}
      </ul>
    </div>
  );
}; 

export default WorkoutList;