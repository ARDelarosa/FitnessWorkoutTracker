import React, { useState, useEffect } from "react";

const WorkoutSessionForm = ({ initialData = {}, onSubmit, onCancel }) => {
  // Form states
  const [exerciseId, setExerciseId] = useState(initialData.exercise_id || "");
  const [sets, setSets] = useState(initialData.sets !== undefined ? initialData.sets : "3");
  const [reps, setReps] = useState(initialData.reps !== undefined ? initialData.reps : "10");

  // Update form fields when `initialData` changes (e.g., when editing a session)
  useEffect(() => {
    if (initialData) {
      setExerciseId(initialData.exercise_id || "");
    setSets(initialData.sets !== undefined ? initialData.sets : "3");
    setReps(initialData.reps !== undefined ? initialData.reps : "10");
    }
  }, [initialData]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!sets || !reps || sets <= 0 || reps <= 0) {
      alert("Please provide valid numbers for sets and reps.");
      return;
    }

    onSubmit({ exercise_id: exerciseId, sets: parseInt(sets), reps: parseInt(reps) });
    setExerciseId("");
    setSets("3");
    setReps("10");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Exercise ID"
        value={exerciseId}
        onChange={(e) => setExerciseId(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Sets"
        value={sets}
        onChange={(e) => setSets(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        required
      />
      <button type="submit">{initialData.id ? "Update Session" : "Add Exercise"}</button>
      {initialData.id && onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default WorkoutSessionForm;
