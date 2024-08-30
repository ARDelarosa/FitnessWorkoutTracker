const express = require('express');
const app = express();
const {client, createTables} = require('./db');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const workoutRoutes = require('./routes');
const authRoutes = require('./routes');
const { authenticateJWT } = require('./middleware/auth');

dotenv.config();


// returns a middleware that only parses json and only looks at requests where the Content-Type header matches the type option
app.use(bodyParser.json());

// testing 
//app.use('/auth', authRoutes);
//app.use('/workouts', authenticateJWT, workoutRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});