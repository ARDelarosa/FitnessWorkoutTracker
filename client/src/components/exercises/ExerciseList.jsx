import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import axios from "axios";
import ExerciseForm from "./ExerciseForm";
import "./ExerciseList.css";

const ExerciseList = () => {
    const { token } = useContext(AuthContext);
    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});
    const [selectedReview, setSelectedReview] = useState(null);

    // Define fetchExercises outside of useEffect so it can be reused
    const fetchExercises = async () => {
        try {
            const res = await axios.get(`https://fitnessworkouttracker-1.onrender.comm/api/exercises`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExercises(res.data);
        } catch (err) {
            console.error("Error fetching exercises:", err);
        }
    };

    // Fetch exercises when the component mounts
    useEffect(() => {
    const fetchAllExercisesWithReviews = async () => {
        try {
            const res = await axios.get(`https://fitnessworkouttracker-1.onrender.com/api/exercises`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // For each exercise, fetch its reviews
            const exercisesWithReviews = await Promise.all(
                res.data.map(async (exercise) => {
                    const exerciseDetails = await axios.get(`https://fitnessworkouttracker-1.onrender.com/api/exercises/reviews/${exercise.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    return exerciseDetails.data;
                })
            );
            setExercises(exercisesWithReviews);
        } catch (err) {
            console.error("Error fetching exercises with reviews:", err);
        }
    };

    fetchAllExercisesWithReviews();
}, [token]);

    // Handle the rating change for a specific exercise
    const handleRatingChange = (exerciseId, value) => {
        setRatings((prev) => ({ ...prev, [exerciseId]: value }));
    };

    // Handle the comment change for a specific exercise
    const handleCommentChange = (exerciseId, value) => {
        setComments((prev) => ({ ...prev, [exerciseId]: value }));
    };

    // Fetch updated reviews for a specific exercise after submitting a review
const fetchExerciseWithReviews = async (exerciseId) => {
    try {
        const res = await axios.get(`https://fitnessworkouttracker-1.onrender.com/api/exercises/reviews/${exerciseId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setExercises((prevExercises) =>
            prevExercises.map((exercise) =>
                exercise.id === exerciseId ? res.data : exercise
            )
        );
    } catch (error) {
        console.error("Error fetching exercise reviews:", error);
    }
};

    // Function to submit a review for an exercise
    const handleReviewSubmit = async (exerciseId) => {
        try {
            await axios.post(
                `https://fitnessworkouttracker-1.onrender.com/api/exercises/${exerciseId}/reviews`,
                { rating: ratings[exerciseId], comment: comments[exerciseId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRatings((prev) => ({ ...prev, [exerciseId]: 0 }));
            setComments((prev) => ({ ...prev, [exerciseId]: '' }));
            
            // Fetch the updated reviews for this exercise
            await fetchExerciseWithReviews(exerciseId);
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    // Function to start editing a review
    const handleEditReview = (review, exerciseId) => {
        setSelectedReview(review);
        setRatings((prev) => ({ ...prev, [exerciseId]: review.rating }));
        setComments((prev) => ({ ...prev, [exerciseId]: review.comment }));
    };

    // Function to delete an exercise
    const handleDeleteExercise = async (exerciseId) => {
        try {
            await axios.delete(`https://fitnessworkouttracker-1.onrender.com/api/exercises/${exerciseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExercises((prevExercises) => prevExercises.filter((exercise) => exercise.id !== exerciseId));
        } catch (err) {
            console.error("Error deleting exercise:", err);
        }
    };

    // Select an exercise for editing
    const handleEditExercise = (exercise) => {
        setSelectedExercise(exercise);
    };

    return (
        <div className="exercise-container">
            <h2>Exercises</h2>
            <ul className="exercise-list">
                {exercises.map((exercise) => (
                    <li key={exercise.id} className="exercise-item">
                        <img
                            src={exercise.imageurl}
                            alt={exercise.name}
                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                        />
                        <div className="exercise-item-content">
                            <h3>{exercise.name}</h3>
                            <p>{exercise.description}</p>
                            <p>Average Rating: {exercise.avg_rating}</p>
                        </div>

                        {/* Review Form */}
                        <h4>{selectedReview ? "Edit Review" : "Submit a Review"}</h4>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleReviewSubmit(exercise.id);
                        }}>
                            <label>
                                Rating: 1 (worst) - 5 (best)
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={ratings[exercise.id] || ''}
                                    onChange={(e) => handleRatingChange(exercise.id, e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Comment:
                                <textarea
                                    value={comments[exercise.id] || ''}
                                    onChange={(e) => handleCommentChange(exercise.id, e.target.value)}
                                    required
                                />
                            </label>
                            <button type="submit">{selectedReview ? "Update Review" : "Submit Review"}</button>
                        </form>

                        {/* Display Reviews */}
                        <h4>Reviews</h4>
                        {exercise.reviews && exercise.reviews.length > 0 ? (
                            exercise.reviews.map((review) => (
                                <div key={review.user_id} className="review">
                                    <p>Rating: {review.rating}</p>
                                    <p>{review.comment}</p>

                                    {/* Edit Review Button */}
                                    <button onClick={() => handleEditReview(review, exercise.id)}>Edit Review</button>
                                </div>
                            ))
                        ) : (
                            <p>No reviews yet.</p>
                        )}

                        <button onClick={() => handleEditExercise(exercise)}>Edit</button>
                        <button onClick={() => handleDeleteExercise(exercise.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            <ExerciseForm
                token={token}
                setExercises={setExercises}
                selectedExercise={selectedExercise}
                setSelectedExercise={setSelectedExercise}
            />
        </div>
    );
};

export default ExerciseList;
