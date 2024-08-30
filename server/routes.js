
const express = require('express');
const jwt = require('jsonwebtoken');
const { createUser, findUserByUsername, getWorkouts, createWorkout, updateWorkout, deleteWorkout } = require('./models');
const bcrypt = require('bcrypt');

const router = express.Router();

// authentication routes
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const userId = await createUser(username, password);
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
    res.json({ token });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// workout routes
app.get('/', async (req, res) => {
    const workouts = await getWorkouts(req.user.id);
    res.json(workouts);
});

app.post('/', async (req, res) => {
    const workout = await createWorkout(req.user.id, req.body);
    res.json(workout);
});

app.put('/:id', async (req, res) => {
    const updatedWorkout = await updateWorkout(req.params.id, req.body);
    res.json(updatedWorkout);
});

app.delete('/:id', async (req, res) => {
    await deleteWorkout(req.params.id);
    res.status(204).end();
});

module.exports = router;