const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.secret || "shhh";
const { getUserById, getWorkoutById, getCommentById } = require('./models');


// Middleware to authenticate JWT
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await getUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      req.user = user; // Add the user object to the request
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized: Token required' });
  }
};

// Middleware to verify that a user can only update/delete their own account
const verifyUserOwnership = async (req, res, next) => {
  const { workout_id } = req.body; // ID of the workout being accessed
  const user_id = req.user.id; // The authenticated user ID from the JWT token

  try {
      // Fetch the workout to check ownership
      const workout = await getWorkoutById(workout_id);
      if (!workout) {
          return res.status(404).json({ message: 'Workout not found' });
      }

      // Ensure the workout belongs to the authenticated user
      if (workout.user_id !== user_id) {
          return res.status(403).json({ message: 'Forbidden: You do not own this workout' });
      }

      // Proceed to the next middleware if ownership is verified
      next();
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};

// Middleware to check if the authenticated user owns the specified workout
const verifyUserOwnsWorkout = async (req, res, next) => {
  const sessionId = req.params.id;
  const workout_id = req.body.workout_id || req.params.workout_id;
  const user_id = req.user.id; // The authenticated user ID from the JWT token
  try {
      const workout = await getWorkoutById(workout_id);
      if (workout && workout.user_id === user_id) {
          next();
      } else {
          return res.status(403).json({ message: 'Forbidden: You do not own this workout' });
      }
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};

const verifyUserOwnsComment = async (req, res, next) => {
  const { id } = req.params; // The comment ID
  const user_id = req.user.id; // The authenticated user ID

  try {
      const comment = await getCommentById(id); // Function to get the comment by its ID
      if (!comment) {
          return res.status(404).json({ message: 'Comment not found' });
      }

      // Check if the authenticated user owns the comment
      if (comment.user_id === user_id) {
          next(); // User owns the comment, proceed to the next middleware or route
      } else {
          return res.status(403).json({ message: 'Forbidden: You do not own this comment' });
      }
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};


const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access forbidden: Admins only' });
  }
  next();
};

module.exports = { authenticateJWT, verifyUserOwnsWorkout, verifyUserOwnsComment, verifyUserOwnership, isAdmin };