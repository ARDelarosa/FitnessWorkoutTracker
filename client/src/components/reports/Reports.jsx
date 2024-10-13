import React, { useState, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import axios from "axios";

const Reports = () => {
    const { token, user } = useContext(AuthContext);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [workouts, setWorkouts] = useState([]);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [error, setError] = useState(null);

    // Fetch workouts for the user within the specified date range
    const fetchWorkoutsReport = async () => {
        try {
            const res = await axios.get(`https://fitnessworkouttracker-1.onrender.com/api/users/${user.id}/workouts`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { startDate, endDate },
            });
            setWorkouts(res.data);
            calculateCompletionPercentage(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching workouts report:", err);
            setError("Failed to fetch workouts report.");
        }
    };

    // Calculate completion percentage
    const calculateCompletionPercentage = (workoutsData) => {
        const totalWorkouts = workoutsData.length;
        const completedWorkouts = workoutsData.filter(
            (workout) => workout.status === "completed"
        ).length;

        if (totalWorkouts > 0) {
            setCompletionPercentage(((completedWorkouts / totalWorkouts) * 100).toFixed(2));
        } else {
            setCompletionPercentage(0);
        }
    };

    // Handle form submission for fetching the report
    const handleGenerateReport = (e) => {
        e.preventDefault();
        fetchWorkoutsReport();
    };

    return (
        <div>
            <h2>Workout Reports</h2>
            <form onSubmit={handleGenerateReport}>
                <div>
                    <label>Start Date:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={!startDate || !endDate}>
                    Generate Report
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            <h3>Completion Percentage: {completionPercentage}%</h3>

            <ul>
                {workouts.map((workout) => (
                    <li key={workout.id}>
                        <strong>{workout.name}</strong> - {workout.scheduled_date} - Status: {workout.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Reports;
