const pg = require('pg');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const { client } = require('./db');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.secret || "shhh";

  // User Model Functions
  const createUser = async (username, hashedPassword, role= 'user') => {
    const SQL = `
    INSERT INTO users (id, username, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, role
    `;
    const result = await client.query(SQL, [uuid.v4(), username, hashedPassword, role]);
    return result.rows[0];
};

const fetchAllUsers = async () => {
    const SQL = `
    SELECT * FROM users
    `;
    const result = await client.query(SQL);
    return result.rows;
};


const getUserById = async (id) => {
    const SQL = `
    SELECT id, username, role
    FROM users
    WHERE id = $1
    `;
    const result = await client.query(SQL, [id]);
    return result.rows[0];
  };

  const getUserByUsername = async (username) => {
    const SQL = `
    SELECT * FROM users
    WHERE LOWER(username) = LOWER($1) -- Case-insensitive username = $1
    `;
    const result = await client.query(SQL, [username]);
    return result.rows[0];
  };
const updateUser = async (id, username, password) => {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;;
    const SQL = `
    UPDATE users
    SET username = COALESCE($2, username), -- Update username if provided
        password = COALESCE($3, password) -- Update password if provided
    WHERE id = $1
    RETURNING id, username, role
    `;
    const result = await client.query(SQL, [id, username, hashedPassword]);
    return result.rows[0];
  };

const deleteUser = async (id) => {
    const SQL = `
    DELETE FROM users
    WHERE id = $1
    RETURNING *
    `;
    const result = await client.query(SQL, [id]);
    return result.rows[0];
  };

  // Workout model functions
  const createWorkout = async (userId, name, scheduledDate, status) => {
      const SQL = `
        INSERT INTO workouts (user_id, name, scheduled_date, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      try {
      const result = await client.query(SQL, [userId, name, scheduledDate, status]);
      return result.rows[0];
    } catch (err) {
      console.error("Error creating workout:", err);
      throw err;
    }
  };

  const getWorkoutByUserId = async (userId) => {
    const SQL = `
      SELECT * FROM workouts
      WHERE user_id = $1
    `;
    const result = await client.query(SQL, [userId]);
    return result.rows;
  };

  const getWorkoutById = async (id) => {
    const SQL = `
      SELECT * FROM workouts
      WHERE id = $1
    `;
    const result = await client.query(SQL, [id]);
    return result.rows[0];
  };

  const updateWorkout = async (id, name, scheduledDate, status) => {
    const SQL = `
      UPDATE workouts
      SET name = $1, scheduled_date = $2, status = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const result = await client.query(SQL, [name, scheduledDate, status, id]);
    return result.rows[0];
  };

  const deleteWorkout = async ({ user_id, id }) => {
    const SQL = `
      DELETE FROM workouts
      WHERE user_id = $1 AND id = $2
      RETURNING *;
    `;
    const result = await client.query(SQL, [user_id, id]);

    // If no workout was deleted, return null
    if (result.rows.length === 0) {
        return null;
    }

    // Return the deleted workout's details
    return result.rows[0];
};

  // Exercise model functions
  const createExercise = async (name, description) => {
    const SQL = `
      INSERT INTO exercises (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await client.query(SQL, [name, description]);
    return result.rows[0];
  };

  const getAllExercises = async () => {
    const SQL = `
      SELECT * FROM exercises;
    `;
    const result = await client.query(SQL);
    return result.rows;
  };

  const getExercisesById = async (id) => {
    const SQL = `
      SELECT * FROM exercises
      WHERE id = $1
    `;
    const result = await client.query(SQL, [id]);
    return result.rows[0];
  };

  const updateExercise = async (id, name, description, imageUrl) => {
    const SQL = `
      UPDATE exercises
      SET name = $1, description = $2, imageUrl = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    try {
      const result = await client.query(SQL, [name, description, imageUrl ,id]);
      return result.rows[0];
    } catch (err) {
      console.error('Error updating exercise:', err.message);
      throw err;
    }
  };

  const deleteExercise = async (id) => {
    await client.query(`DELETE FROM reviews WHERE exercise_id = $1`, [id]);
    const SQL = `
      DELETE FROM exercises
      WHERE id = $1
      RETURNING *;
    `;
    const result = await client.query(SQL, [id]);
    return result.rows[0];
  };
  
  // Workout Session Model Functions
  const createWorkoutSession = async (userId, workoutId, exerciseId, sets, reps) => {
    
    const SQL = `
      INSERT INTO workout_sessions (user_id, workout_id, exercise_id, sets, reps)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    try {
        const result = await client.query(SQL, [userId, workoutId, exerciseId, sets, reps]);
        return result.rows[0];
    } catch (error) {
        console.error("Error creating workout session:", error.message);
        throw error; // Ensure we log any errors here
    }
};

  const getWorkoutSessionByWorkoutId = async (workoutId) => {
    const SQL = `
      SELECT * FROM workout_sessions
      WHERE workout_id = $1
    `;
    const result = await client.query(SQL, [workoutId]);
    return result.rows;
  }
  const getWorkoutSessionById = async (sessionId) => {
    const SQL = `
      SELECT * FROM workout_sessions
      WHERE id = $1
    `;
    const result = await client.query(SQL, [sessionId]);
    return result.rows[0];
};
  const updateWorkoutSession = async (id, workoutId, exerciseId, sets, reps) => {
    const SQL = `
      UPDATE workout_sessions
      SET exercise_id = $1, workout_id = $2, sets = $3, reps = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    const result = await client.query(SQL, [exerciseId, workoutId, sets, reps, id]);
    return result.rows[0];
  }
  const deleteWorkoutSession = async (id) => {
    const SQL = `
      DELETE FROM workout_sessions
      WHERE id = $1
      RETURNING *
    `;
    const result = await client.query(SQL, [id]);
    return result.rows[0];
  }

// Comment Model Functions
const createComment = async (userId, workoutId, content) => {
  const SQL = `
    INSERT INTO comments (user_id, workout_id, content)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await client.query(SQL, [userId, workoutId, content]);
  return result.rows[0];
};

const getCommentsByWorkoutId = async (workoutId) => {
  const SQL = `
    SELECT * FROM comments
    WHERE workout_id = $1
  `;
  const result = await client.query(SQL, [workoutId]);
  return result.rows;
};

const getCommentById = async (id) => {
  const SQL = `
    SELECT * FROM comments
    WHERE id = $1
  `;
  try {
    const result = await client.query(SQL, [id]);
    return result.rows[0]; // Return the first row if found, else undefined
  } catch (error) {
    throw new Error(`Error fetching comment by ID: ${error.message}`);
  }
};


const updateComment = async (content, commentId) => {
  const SQL = `
    UPDATE comments
    SET content = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await client.query(SQL, [content, commentId]);
  return result.rows[0];
};

const deleteComment = async (id) => {
  const SQL = `
    DELETE FROM comments
    WHERE id = $1
    RETURNING *
  `;
  const result = await client.query(SQL, [id]);
  return result.rows[0];
};

// Reviews functionsfor non-logged in users and logged in users
const getAllExercisesWithRatings = async () => {
  const SQL = `
    SELECT e.id, e.name, e.description, COALESCE(AVG(r.rating), 0) as avg_rating
    FROM exercises e
    LEFT JOIN reviews r ON e.id = r.exercise_id
    GROUP BY e.id
    ORDER BY e.name ASC;
  `;
  const result = await client.query(SQL);
  return result.rows;
};

const getExerciseWithReviews = async (exerciseId) => {
  const SQL = `
    SELECT e.id, e.name, e.description, e.imageurl, COALESCE(AVG(r.rating), 0) as avg_rating, 
           json_agg(json_build_object('user_id', r.user_id, 'rating', r.rating, 'comment', r.comment, 'created_at', r.created_at)) AS reviews
    FROM exercises e
    LEFT JOIN reviews r ON e.id = r.exercise_id
    WHERE e.id = $1
    GROUP BY e.id;
  `;
  const result = await client.query(SQL, [exerciseId]);
  return result.rows[0];  // Only one exercise will be returned
};

const searchExercisesByName = async (searchTerm) => {
  const SQL = `
    SELECT e.id, e.name, e.description, COALESCE(AVG(r.rating), 0) as avg_rating
    FROM exercises e
    LEFT JOIN reviews r ON e.id = r.exercise_id
    WHERE e.name ILIKE '%' || $1 || '%'
    GROUP BY e.id
    ORDER BY e.name ASC;
  `;
  const result = await client.query(SQL, [searchTerm]);
  return result.rows;
};

// Reviews functions for logged in users

// Create a new review
const upsertReview = async (userId, exerciseId, rating, comment) => {
  const SQL = `
    INSERT INTO reviews (user_id, exercise_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, exercise_id) 
    DO UPDATE SET rating = $3, comment = $4, created_at = NOW()
    RETURNING *;
  `;
  const result = await client.query(SQL, [userId, exerciseId, rating, comment]);
  return result.rows[0];
};

// Get a review by ID
const getReviewById = async (id, userId) => {
  const SQL = `
    SELECT * FROM reviews
    WHERE id = $1 AND user_id = $2
  `;
  const result = await client.query(SQL, [id, userId]);
  return result.rows[0];
};


const getReviewsByUser = async (userId) => {
  const SQL = `
    SELECT r.id, r.exercise_id, e.name AS exercise_name, r.rating, r.comment, r.created_at
    FROM reviews r
    JOIN exercises e ON r.exercise_id = e.id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC;
  `;
  const result = await client.query(SQL, [userId]);
  return result.rows;
};

const deleteReview = async (reviewId, userId) => {
  const SQL = `
    DELETE FROM reviews
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const result = await client.query(SQL, [reviewId, userId]);
  return result.rows[0];
};

const addCommentToReview = async (userId, reviewId, content) => {
  const SQL = `
    INSERT INTO review_comments (user_id, review_id, content)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await client.query(SQL, [userId, reviewId, content]);
  return result.rows[0];
};

const getReviewsCommentById = async (commentId, userId) => {
  const SQL = `
    SELECT * FROM review_comments
    WHERE id = $1 AND user_id = $2
  `;
  const result = await client.query(SQL, [commentId, userId]);
  return result.rows[0];  // Return the comment if found
};

const getCommentsByUser = async (userId) => {
  const SQL = `
    SELECT rc.id, rc.review_id, rc.content, rc.created_at, e.name AS exercise_name
    FROM review_comments rc
    JOIN reviews r ON rc.review_id = r.id
    JOIN exercises e ON r.exercise_id = e.id
    WHERE rc.user_id = $1
    ORDER BY rc.created_at DESC;
  `;
  const result = await client.query(SQL, [userId]);
  return result.rows;
};

const editComment = async (commentId, userId, content) => {
  const SQL = `
    UPDATE review_comments
    SET content = $1, updated_at = NOW()
    WHERE id = $2 AND user_id = $3
    RETURNING *;
  `;
  const result = await client.query(SQL, [content, commentId, userId]);
  return result.rows[0];
};

const deleteReviewComment = async (commentId, userId) => {
  const SQL = `
    DELETE FROM review_comments
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const result = await client.query(SQL, [commentId, userId]);
  return result.rows[0];
};


module.exports = {
    // authentication functions

    // user functions
    createUser,
    getUserById,
    getUserByUsername,
    fetchAllUsers,
    updateUser,
    deleteUser,

    // workout functions
    createWorkout,
    getWorkoutByUserId,
    getWorkoutById,
    updateWorkout,
    deleteWorkout,

    // exercise functions
    createExercise,
    getAllExercises,
    getExercisesById,
    updateExercise,
    deleteExercise,

    // workout session functions
    createWorkoutSession,
    getWorkoutSessionByWorkoutId,
    getWorkoutSessionById,
    updateWorkoutSession,
    deleteWorkoutSession,

    // comment functions
    createComment,
    getCommentsByWorkoutId,
    getCommentById,
    updateComment,
    deleteComment,

    // reviews for non-logged in users and logged in users
    getAllExercisesWithRatings,
    getExerciseWithReviews,
    searchExercisesByName,

    // reviews for logged in users
    upsertReview,
    getReviewsByUser,
    getReviewById,
    editComment,
    deleteReview,
    addCommentToReview,
    getReviewsCommentById,
    getCommentsByUser,
    deleteReviewComment
};