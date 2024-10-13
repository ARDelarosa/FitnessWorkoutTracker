import React, { useEffect, useState } from "react";
import axios from "axios";

const CommentList = ({ workoutId, token, refreshComments, onEditComment }) => {
    const [comments, setComments] = useState([]);
    
    // Fetch comments for a specific workout
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await axios.get(`https://fitnessworkouttracker.onrender.com/api/comments/${workoutId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setComments(res.data);
            } catch (err) {
                console.error("Error fetching comments:", err);
            }
        };
        if (workoutId) {
            fetchComments();
        }    
    }, [token, workoutId, refreshComments]);

    // Handle delete comment
    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`https://fitnessworkouttracker.onrender.com/api/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Remove the deleted comment from the state to update the UI
            setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };

    // Select comment for editing
    const handleEditComment = (comment) => {
        onEditComment(comment); // Notify WorkoutList to edit this comment
  };

    return (
        <div>
            <h4>Comments</h4>
            <ul>
                {comments.map((comment) => (
                    <li key={comment.id}>
                        {comment.content}
                        {/* Edit button for each comment */}
                        <button onClick={() => handleEditComment(comment)}>Edit</button>
                        {/* Delete button for each comment */}
                        <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                    </li>
                ))}
            </ul>

        </div>
    );
    };

export default CommentList;