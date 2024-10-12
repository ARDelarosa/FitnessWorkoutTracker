import React from "react";
import { AuthContext } from "../../AuthContext";
import axios from "axios";
import CommentList from "../comments/CommentList";

const WorkoutDetails = ({ match }) => {
  const { token } = useContext(AuthContext);
  const [workout, setWorkout] = useState(null);
  const workoutId = match.params.workoutId;

  // Fetch workout details
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const res = await axios.get(`/api/workouts/${workoutId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkout(res.data);
      } catch (err) {
        console.error("Error fetching workout details:", err);
      }
    };
    if (workoutId) {
      fetchWorkout();
    }
  }, [token, workoutId]);

  if (!workout) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{workout.name}</h2>
      <p>{workout.scheduled_date}</p>
      <p>Status: {workout.status}</p>
      <CommentList workoutId={workout.id} />

      {/* Render comments for this workout */}
      <CommentList workoutId={workout.id} />
    </div>
  );
};

export default WorkoutDetails;
