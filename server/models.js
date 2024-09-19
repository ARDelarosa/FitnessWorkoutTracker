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
    SELECT * FROM users
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
      const result = await client.query(SQL, [userId, name, scheduledDate, status]);
      return result.rows[0];
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
      RETURNING *
    `;
    await client.query(SQL, [user_id, id]);
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

  const updateExercise = async (id, name, description) => {
    const SQL = `
      UPDATE exercises
      SET name = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await client.query(SQL, [name, description, id]);
    return result.rows[0];
  };

  const deleteExercise = async (id) => {
    const SQL = `
      DELETE FROM exercises
      WHERE id = $1
      RETURNING *
    `;
    const result = await client.query(SQL, [id]);
    return result.rows[0];
  };

  // Workout Session Model Functions
  const createWorkoutSession = async (userId, workoutId, exerciseId, order) => {
    console.log("Creating workout session for workout_id:", workoutId); // Add logging here
    console.log("User ID:", userId);
    console.log("Exercise ID:", exerciseId);
    console.log("Order:", order);

    const SQL = `
      INSERT INTO workout_sessions (user_id, workout_id, exercise_id, "order")
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    try {
        const result = await client.query(SQL, [userId, workoutId, exerciseId, order]);
        console.log("Workout session created:", result.rows[0]);
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
      ORDER BY "order"
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
  const updateWorkoutSession = async (id, workoutId, exerciseId, order) => {
    const SQL = `
      UPDATE workout_sessions
      SET exercise_id = $1, workout_id = $2, "order" = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const result = await client.query(SQL, [exerciseId, workoutId, order, id]);
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
    deleteComment
};