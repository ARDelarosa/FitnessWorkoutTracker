import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthContext";

const ExerciseForm = ({ setExercises, selectedExercise, setSelectedExercise }) => {
    const [name, setName] = useState(selectedExercise ? selectedExercise.name : "");
    const [description, setDescription] = useState(selectedExercise ? selectedExercise.description : "");
    const [imageUrl, setImageUrl] = useState(selectedExercise ? selectedExercise.imageUrl : "");
    const { token } = useContext(AuthContext);

    // Initialize form fields if editing an existing exercise
    useEffect(() => {
        if (selectedExercise) {
            setName(selectedExercise.name);
            setDescription(selectedExercise.description);
            setImageUrl(selectedExercise.imageUrl);
        } else {
            setName("");
            setDescription("");
            setImageUrl("");
        }
    }, [selectedExercise]);

    // Handle form submission for create and update
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name || !description) {
            console.error("Name and description are required.");
            return;
        }

        const exerciseData = { name, description, imageUrl };
        
        if (selectedExercise) {
            // Update existing exercise
            try {
                const res = await axios.put(
                    `http://localhost:3000/api/exercises/${selectedExercise.id}`,
                    exerciseData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setExercises((prevExercises) =>
                    prevExercises.map((exercise) =>
                        exercise.id === res.data.id ? res.data : exercise
                    )
                );
                setSelectedExercise(null); // Clear the form
            } catch (err) {
                console.error("Error updating exercise:", err);
            }
        } else {
            // Create new exercise
            try {
                const res = await axios.post(
                    "http://localhost:3000/api/exercises",
                    exerciseData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setExercises((prevExercises) => [...prevExercises, res.data]);
            } catch (err) {
                console.error("Error creating exercise", err);
            }
        }
        setName("");
        setDescription("");
        setImageUrl("");
    };

    const handleCancel = () => {
        setSelectedExercise(null);
        setName("");
        setDescription("");
        setImageUrl("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{selectedExercise ? "Edit Exercise" : "Add New Exercise"}</h2>
            <div>
                <label>Exercise Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
            </div>
            <div>
                <label>Image URL:</label>
                <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />
            </div>
            <button type="submit">{selectedExercise ? "Update Exercise" : "Create Exercise"}</button>
            {/* Cancel Edit Button */}
            {selectedExercise && <button type="button" onClick={handleCancel}>Cancel</button>}
        </form>
    ); 
};

export default ExerciseForm;