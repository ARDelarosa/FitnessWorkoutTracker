
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.secret || "shhh";
router.use(express.json());
router.use(require('morgan')('dev'));
const { isLoggedIn } = require('./middleware');
const {
    authenticate,
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
 } = require('./models');


// authentication routes
router.get('/api/auth/me', isLoggedIn,(req, res, next)=> {
    try {
      res.send(req.user);
    }
    catch(ex){
      next(ex);
    }
  });
  
  router.post('/api/auth/login', async (req, res) => {
    try {
        res.send(await authenticate(req.body));
      }
      catch(ex){
        next(ex);
      }
});

// create a new user
router.post('/api/auth/register', async (req, res) => {
    try { 
        res.status(201).send(await createUser(req.body));
      } catch(ex) {
        next(ex);
      }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        res.status(201).send(await fetchAllUsers(req.body));
    } catch(ex) {
      next(ex);
    }
});

router.get('/api/users/:id', async (req, res) => {
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

router.put('/api/users/:id', async (req, res) => {
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

router.delete('/api/users/:id', async (req, res) => {
    try {
        if(req.params.user_id !== req.user.id){
          const error = Error('not authorized');
          error.status = 401;
          throw error;
        }
        await deleteUser({user_id: req.params.user_id, id: req.params.id });
        res.sendStatus(204);
      }
      catch(ex){
        next(ex);
      }
});

// workout routes
router.get('/api/users/:user_id/workouts', async (req, res) => {
    try {
        const workouts = await getWorkoutByUserId(req.user_id);
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/workouts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const workout = await getWorkoutById(id);
        res.json(workout);
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
});

router.post('/api/workouts/', async (req, res) => {
    try {
        const { user_id, name, scheduled_date, status } = req.body;
        const workout = await createWorkout(user_id, name, scheduled_date, status);
        res.status(201).json(workout);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/api/workouts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, scheduled_date, status } = req.body;
        const updatedWorkout = await updateWorkout(id, name, scheduled_date, status);
        res.json(updatedWorkout);
    } catch (error) {
        res.status(404).json({ message: 'Workout not found' });
    }
});

router.delete('/api/workouts/:id', async (req, res) => {
    try {
        if(req.params.user_id !== req.user.id){
            const error = Error('not authorized');
            error.status = 401;
            throw error;
          }
        await deleteWorkout(req.params.id);
        res.status(204).end();
    } catch (error) {
        next(error)
    }
});

// exercise routes
router.get('/api/exercises/', async (req, res) => {
    try {
        const exercises = await getAllExercises();
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/exercises/:id/', async (req, res) => {
    try {
        const exercises = await getExercisesById(req.params.id);
        res.json(exercises);
    } catch (error) {
        res.status(404).json({ message: 'Exercise not found' });
    }   
})

router.post('/api/exercises/', async (req, res) => {
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
        const { name, description } = req.body;
        const updatedExercise = await updateExercise(id, name, description);
        res.json(updatedExercise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
});

router.delete('/api/exercises/:id', async (req, res) => {
    try {
    await deleteExercise(req.params.id);
    res.status(204).end();
    } catch (error) {
        next(error)
    }
});

// workout session routes
router.get('/api/workouts/:id/sessions', async (req, res) => {
    try {
    const sessions = await getWorkoutSessionByWorkoutId(req.params.id);
    res.json(sessions);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
});

router.post('/api/workouts/:id/sessions', async (req, res) => {
    try {
    const { id } = req.params;
    const { workout_id, exercise_id, order } = req.body;
    const session = await createWorkoutSession(id, workout_id, exercise_id, order);
    res.json(session);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
});

router.put('/api/workouts/:id/sessions/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const {workout_id, exercise_id, order } = req.body;
    const updatedSession = await updateWorkoutSession(id, workout_id, exercise_id, order);
    res.json(updatedSession);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
});

router.delete('/api/workouts/:id/sessions/:id', async (req, res) => {
    try {
    await deleteWorkoutSession(req.params.id);
    res.status(204).end();
    } catch (error) {
    next(error)
    }
});

// comment routes
router.post('/api/comments/', async (req, res) => {
    try {
    const { id } = req.user;
    const { workout_id, content } = req.body;
    const comment = await createComment(id, workout_id, content);
    res.json(comment);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
}); 

router.get('/api/comments/:workout_id', async (req, res) => {
    try {
    const { workout_id } = req.params;
    const comments = await getCommentsByWorkoutId( workout_id );
    res.json(comments);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
});

router.put('/api/comments/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const { content } = req.body;
    const updatedComment = await updateComment(id, content);
    res.json(updatedComment);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
});

router.delete('/api/comments/:id', async (req, res) => {
    try {
    await deleteComment(req.params.id);
    res.status(204).end();
    } catch (error) {
    next(error)
    }
});

module.exports = router;