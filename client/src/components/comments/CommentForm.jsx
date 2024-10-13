import React, { useState, useEffect } from "react";
import axios from "axios";

const CommentForm = ({ workoutId, token, selectedComment, setSelectedComment, onCommentAdded }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (selectedComment) {
      setContent(selectedComment.content);
    } else {
      setContent("");
    }
  }, [selectedComment]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedComment) {
        // Update existing comment
        await axios.put(
          `https://fitnessworkouttracker-1.onrender.com/api/comments/${selectedComment.id}`,
          { content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Add a new comment
        await axios.post(
          `https://fitnessworkouttracker-1.onrender.com/api/comments`,
          { workout_id: workoutId, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setSelectedComment(null);
      setContent("");
      onCommentAdded();
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment..."
        required
      />
      <button type="submit">
        {selectedComment ? "Update Comment" : "Add Comment"}
      </button>
      {selectedComment && (
        <button type="button" onClick={() => setSelectedComment(null)}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default CommentForm;
