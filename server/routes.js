
const express = require('express');
const app = express();
app.use(express.json());
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.secret || "shhh";
router.use(express.json());
router.use(require('morgan')('dev'));
const { authenticateJWT, verifyUserOwnsWorkout, verifyUserOwnsComment, verifyUserOwnership, isAdmin } = require('./middleware');
const {
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
    updateComment,
    deleteComment,

    // reviews functions
    getAllExercisesWithRatings,
    getExerciseWithReviews,
    searchExercisesByName,
    upsertReview,
    getReviewById,
    getReviewsByUser,
    editComment,
    deleteReview,
    addCommentToReview,
    getReviewsCommentById,
    getCommentsByUser,
    deleteReviewComment

 } = require('./models');

// AUTHENTICATION ROUTES reg/login
// Register a new user
router.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;

    // Ensure username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if the user already exists
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' }); // Return to prevent further execution
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the hashed password
        const newUser = await createUser(username, hashedPassword);

        // Generate a token
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });
    
        // Respond with the token and user
        res.status(201).json({ token, user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login a user
router.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    console.log(`Login attempt with username: ${username}`);

    // Ensure both fields are provided
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

    try {
        // Find the user by username
        const user = await getUserByUsername(username);
        console.log("Fetched user:", user);
        if (!user) {
            res.status(401).json({ message: 'Invalid username' });
        }

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid passwrord' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        console.log("Generated token:", token);
        return res.json({ token, user });
    } catch (error) {
       // If an error occurs, log it and return a 500 status code
    console.error('Login error:', error.message);
    
    // Ensure that a response is only sent if headers have not already been sent
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message })
    }
  }
});

router.put('/api/admin/update-password', authenticateJWT, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;  // Get the logged-in user's ID from JWT

    try {
        // Fetch the user from the database
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the current password matches the user's existing password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await updateUser(userId, null, hashedPassword);  // Only update the password

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users
router.get('/api/users', authenticateJWT, async (req, res, next) => {
    console.log('GET /api/users called');
  try {
    const users = await fetchAllUsers();  // No need to pass `req.body` for a GET request
    res.status(200).json(users);  // Use 200 status for successful GET requests
  } catch (ex) {
    next(ex);
  }
});

router.get('/api/users/:id', authenticateJWT, async (req, res, next) => {
   console.log('req.user', req.user);
    try {
        if(req.params.id !== req.user.id){
          const error = Error('not authorized');
          error.status = 401;
          throw error;
        }
        res.send(await getUserById(req.params.id));
      }
      catch(ex){
        next(ex);
      }
});

// Update a user (protected, ownership check)
router.put('/api/users/:id', authenticateJWT, verifyUserOwnership, async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
    try {
        const updatedUser = await updateUser(id, username, password);
        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/api/users/:id', authenticateJWT, verifyUserOwnership, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await deleteUser(id);
        if (deletedUser) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }   
});

// WORKOUT ROUTES
//Get all workouts for the authenticated user (protected)
router.get('/api/users/:user_id/workouts', async (req, res) => {
    const { user_id } = req.params;
    const { startDate, endDate } = req.query; // Extract query params

    try {
        let workouts = await getWorkoutByUserId(user_id);

        // Filter workouts by date range
        if (startDate && endDate) {
            workouts = workouts.filter(
                (workout) =>
                    new Date(workout.scheduled_date) >= new Date(startDate) &&
                    new Date(workout.scheduled_date) <= new Date(endDate)
            );
        }

        res.json(workouts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get a single workout by ID 
router.get('/api/workouts/:workout_id', async (req, res) => {
    try {
        const { id } = req.params;
        const workout = await getWorkoutById(id);
        res.json(workout);
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
});

// create a new workout (protected)
router.post('/api/workouts/:user_id', authenticateJWT, async (req, res) => {
    const {  name, scheduled_date, status } = req.body;
    const user_id = req.user.id; // the authenticated user's ID
    console.log("Request body:", req.body);
    console.log("User ID:", user_id);
    try {
        const workout = await createWorkout(user_id, name, scheduled_date, status);
        res.status(201).json(workout);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/api/workouts/:workout_id', async (req, res) => {
    try {
        const { workout_id } = req.params;
        const { name, scheduled_date, status } = req.body;
        const updatedWorkout = await updateWorkout(workout_id, name, scheduled_date, status);
        res.json(updatedWorkout);
    } catch (error) {
        res.status(404).json({ message: 'Workout not found' });
    }
});

router.delete('/api/users/:user_id/workouts/:id', authenticateJWT, async (req, res, next) => {
    try {
        if(req.params.user_id !== req.user.id){
            const error = Error('not authorized');
            error.status = 401;
            throw error;
          }
        await deleteWorkout({user_id: req.params.user_id, id: req.params.id});
        res.status(204).end();
    } catch (error) {
        next(error)
    }
});

// EXERCISES ROUTES
router.get('/api/exercises', async (req, res) => {
    try {
        const exercises = await getAllExercises();
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/exercises/:id', async (req, res) => {
    try {
        const exercises = await getExercisesById(req.params.id);
        res.json(exercises);
    } catch (error) {
        res.status(404).json({ message: 'Exercise not found' });
    }   
})

router.post('/api/exercises', async (req, res) => {
    try {
        const { name, description } = req.body;
        const exercise = await createExercise(name, description);
        res.json(exercise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/api/exercises/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, imageUrl } = req.body;
        const updatedExercise = await updateExercise(id, name, description, imageUrl);
        res.json(updatedExercise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
});

router.delete('/api/exercises/:id', async (req, res, next) => {
    try {
    await deleteExercise(req.params.id);
    res.status(204).end();
    } catch (error) {
        console.error("error deleting exercise", error);
        next(error)
    }
});

// WORKOUT SESSION ROUTES
// get all sessions for a single workout (only if the user owns the workout)
router.get('/api/workouts/:workout_id/sessions', authenticateJWT, verifyUserOwnsWorkout, async (req, res) => {
    const { workout_id } = req.params;
    const user_id = req.user.id; // the authenticated user's ID
    try {
        const workout = await getWorkoutById(workout_id);
        if (workout && workout.user_id === user_id) {
            const sessions = await getWorkoutSessionByWorkoutId(workout_id);
            res.json(sessions);
        } else {
            res.status(403).json({ message: 'Forbidden: You do not own this workout' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// create a new workout session (only if the user owns the workout)
router.post('/api/workout_sessions', authenticateJWT, verifyUserOwnsWorkout, async (req, res) => {
    const { workout_id, exercise_id, sets, reps} = req.body;
    const user_id = req.user.id; // the authenticated user's ID

    console.log('Request Body:', req.body);

    try {
        if (!workout_id) {
            return res.status(400).json({ message: 'workout_id is required' });
        }

        const workoutSession = await createWorkoutSession(user_id, workout_id, exercise_id, sets, reps);
        res.status(201).json(workoutSession);
    } catch (error) {
        console.error('Error creating workout session:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// update an existing workout session (only if the user owns the workout)
router.put('/api/workouts/sessions/:id', authenticateJWT, verifyUserOwnsWorkout, async (req, res) => {
  console.log("request body", req.body);
    const { id } = req.params;
    const {workout_id, exercise_id, sets, reps } = req.body;
    try {
        const updatedSession = await updateWorkoutSession(id, workout_id, exercise_id, sets, reps);
        if (updatedSession) {
            res.json(updatedSession);
        } else {
            res.status(404).json({ message: 'Session not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }   
});

// delete an existing workout session (only if the user owns the workout)
router.delete('/api/workouts/sessions/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params; // session ID
    const user_id = req.user.id; // the authenticated user's ID

    try {
        // Fetch the session to get the associated workout_id
        const session = await getWorkoutSessionById(id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Fetch the workout to verify ownership
        const workout = await getWorkoutById(session.workout_id);

        // Check if the authenticated user owns the workout
        if (workout && workout.user_id === user_id) {
            // User owns the workout, delete the session
            const deletedSession = await deleteWorkoutSession(id);
            if (deletedSession) {
                res.status(204).end();
            } else {
                res.status(404).json({ message: 'Session not found' });
            }
        } else {
            return res.status(403).json({ message: 'Forbidden: You do not own this workout' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// COMMENT ROUTES

// create a new comment (only if the user owns the workout)
router.post('/api/comments', authenticateJWT, verifyUserOwnsWorkout, async (req, res) => {
    const { workout_id, content } = req.body;
    const user_id = req.user.id; // the authenticated user's ID
    try {
    const comment = await createComment(user_id, workout_id, content);
    res.status(201).json(comment);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
}); 

// get all comments for a single workout (only if the user owns the workout)
router.get('/api/comments/:workout_id', authenticateJWT, verifyUserOwnsWorkout, async (req, res) => {
    const { workout_id } = req.params;
    const user_id = req.user.id; // the authenticated user's ID
    try {
    const workout = await getWorkoutById(workout_id);
    if (workout && workout.user_id === user_id) {
        const comments = await getCommentsByWorkoutId(workout_id);
        res.json(comments);
    } else {
        res.status(403).json({ message: 'Forbidden: You do not own this workout' });
    }
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
});

// update an existing comment (only if the user owns the comment)
router.put('/api/comments/:id', authenticateJWT, verifyUserOwnsComment, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
    const updatedComment = await updateComment(content, id);
    if (updatedComment) {
        res.json(updatedComment);
    } else {
        res.status(404).json({ message: 'Comment not found' });
    }
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
});

// delete an existing comment (only if the user owns this comment)
router.delete('/api/comments/:id', authenticateJWT, verifyUserOwnsComment,  async (req, res) => {
    const { id } = req.params;
    try {
        const deletedComment = await deleteComment(id);
        if (deletedComment) {
            res.status(204).end();
        } else {
            res.status(404).json({ message: 'Comment not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reviews ROUTES

// View all exercises with average rating
router.get('/api/exercises/ratings', async (req, res) => {
    try {
      const exercises = await getAllExercisesWithRatings();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// View details of a specific exercise (with reviews)
router.get('/api/exercises/reviews/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const exercise = await getExerciseWithReviews(id);
    console.log(exercise);
    if (exercise) {
      res.json(exercise);
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serch for exercises by name
router.get('/api/exercises/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search term is required' });
    }
  
    try {
      const exercises = await searchExercisesByName(query);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Submit a review
router.post('/api/exercises/:exerciseId/reviews', authenticateJWT, async (req, res) => {
    const { exerciseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;  // Get logged-in user ID from JWT
  
    try {
      const review = await upsertReview(userId, exerciseId, rating, comment);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// View all reviews written by a user
router.get('/api/users/me/reviews', authenticateJWT, async (req, res) => {
    const userId = req.user.id;
  
    try {
      const reviews = await getReviewsByUser(userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Edit a review
router.put('/api/reviews/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
  
    try {
        // Fetch the existing review first
        const existingReview = await getReviewById(id, userId);
        if (!existingReview) {
            return res.status(404).json({ message: 'Review not found' });
        }
        // Perform the update
        const updatedReview = await upsertReview(userId, existingReview.exercise_id, rating, comment);
        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
  
  // Delete a review
router.delete('/api/reviews/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    try {
      const review = await deleteReview(id, userId);
      if (review) {
        res.status(200).json({ message: 'Review deleted successfully' });
      } else {
        res.status(404).json({ message: 'Review not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// Write a comment on another user's review
router.post('/api/reviews/:reviewId/comments', authenticateJWT, async (req, res) => {
    const { reviewId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
  
    try {
      const comment = await addCommentToReview(userId, reviewId, content);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// View all comments on a review
router.get('/api/users/me/comments', authenticateJWT, async (req, res) => {
    const userId = req.user.id;
  
    try {
      const comments = await getCommentsByUser(userId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Edit a comment
router.put('/api/reviews/comments/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
  
    try {
        // Check if the comment exists before updating
        const existingComment = await getReviewsCommentById(id, userId);
        if (!existingComment) {
          return res.status(404).json({ message: 'Comment not found' });
        }
    
        // Update the comment
        const updatedComment = await editComment(id, userId, content);
        res.status(200).json(updatedComment);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
  });
  
  // Delete a review comment
  router.delete('/api/reviews/comments/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    try {
      const comment = await deleteReviewComment(id, userId);
      if (comment) {
        res.status(200).json({ message: 'Comment deleted successfully' });
      } else {
        res.status(404).json({ message: 'Comment not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

// Middleware for admin-only routes
router.put('/api/admin/update-user/:id', authenticateJWT, isAdmin, async (req, res) => {
    const { id } = req.params;  // ID of the user being updated
    const { username, password } = req.body;  // New details from request body

    try {
        // Admin is updating the user information
        const updatedUser = await updateUser(id, username, password);
        if (updatedUser) {
            res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/api/admin-only-route', authenticateJWT, isAdmin, async (req, res) => {
    // Only admins can delete data here
    try {
        // Admin-specific logic
        res.status(200).json({ message: 'Admin access granted!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;