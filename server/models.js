const pg = require('pg');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const { client } = require('./db');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.secret || "shhh";


// Authentication
const authenticate = async({ username, password })=> {
    const SQL = `
      SELECT id, username, password
      FROM users
      WHERE username=$1;
    `;
    const response = await client.query(SQL, [username]);
    console.log("resonse rows", response.rows);
    if(!response.rows.length || (await bcrypt.compare(password, response.rows[0].password)) === false){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    const token = await jwt.sign({ id: response.rows[0].id }, jwtSecret);
    console.log("this is the in authenticate token:", token);
    return {token: token};
  };

  const findUserWithToken = async(token)=> {
    let id;
    console.log("this is the token:", token);
    try {
      const payload = await jwt.verify(token, jwtSecret);
      id = payload.id;
    
    }
    catch(ex){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    const SQL = `
      SELECT id, username
      FROM users 
      WHERE id=$1;
    `;
    const response = await client.query(SQL, [id]);
    if(!response.rows.length){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    return response.rows[0];
  };

  // User Model Functions
  const createUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 5);
    const SQL = `
    INSERT INTO users (username, password)
    VALUES ($1, $2)
    RETURNING id
    `;
    const result = await client.query(SQL, [uuid.v4(), username, hashedPassword]);
    return result.rows[0].id;
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

const updateUser = async (id, username, password) => {
    const hashedPassword = await bcrypt.hash(password, 5);
    const SQL = `
    UPDATE users
    SET username = $2, password = $3
    WHERE id = $1
    RETURNING *
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
      const result = await client.query(SQL, [uuid.v4(), userId, name, scheduledDate, status]);
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

  const deleteWorkout = async (id) => {
    const SQL = `
      DELETE FROM workouts
      WHERE id = $1
      RETURNING *
    `;
    const result = await client.query(SQL, [id]);
    return result.rows[0];
  };

  // Exercise model functions
  const createExercise = async (name, description) => {
    const SQL = `
      INSERT INTO exercises (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await client.query(SQL, [uuid.v4(), name, description]);
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
      WHERE id = $4
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
    const SQL = `
      INSERT INTO workout_sessions (user_id, workout_id, exercise_id, "order")
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await client.query(SQL, [uuid.v4(), userId, workoutId, exerciseId, order]);
    return result.rows[0];
  }

  const getWorkoutSessionByWorkoutId = async (workoutId) => {
    const SQL = `
      SELECT * FROM workout_sessions
      WHERE workout_id = $1
      ORDER BY "order"
    `;
    const result = await client.query(SQL, [workoutId]);
    return result.rows;
  }
  const updateWorkoutSession = async (id, workoutId, exerciseId, order) => {
    const SQL = `
      UPDATE workout_sessions
      SET exercise_id = $1, workout_id = $2, "order" = $3, updated_at = NOW()
      WHERE id = $3
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
  const result = await client.query(SQL, [uuid.v4(), userId, workoutId, content]);
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

const updateComment = async (content, id) => {
  const SQL = `
    UPDATE comments
    SET content = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await client.query(SQL, [content, id]);
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
    authenticate,
    findUserWithToken,

    // user functions
    createUser,
    getUserById,
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
    updateWorkoutSession,
    deleteWorkoutSession,

    // comment functions
    createComment,
    getCommentsByWorkoutId,
    updateComment,
    deleteComment
};