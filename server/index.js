const express = require('express');
const app = express();
const {client, createTables} = require('./db');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const routes = require('./routes');
const models = require('./models');
const { isLoggedIn } = require('./middleware');

dotenv.config();


// returns a middleware that only parses json and only looks at requests where the Content-Type header matches the type option
app.use(bodyParser.json());

// testing 
//app.use('/auth', authRoutes);
//app.use('/workouts', authenticateJWT, workoutRoutes);

const init = async () => {
    const port = process.env.PORT || 3000;
    await client.connect();
    console.log('Database connected');
    
    await createTables();
    console.log('Tables created');

    const [john, lucy, david, emmett, barbellSquat, barbellDeadlift, barbellBenchPress, barbellRow, barbellBicepCurl] = await Promise.all([
        createUser({ username: 'John Smith', password: 'm_pw'}),
        createUser({ username: 'Lucy Williams', password: 'l_pw'}),
        createUser({ username: 'David Torres', password: 'e_pw'}),
        createUser({ username: 'Emmett Brown', password: 'c_pw'}),
        createExercise({ name: 'Barbell Squat' }),
        createExercise({ name: 'Barbell Deadlift' }),
        createExercise({ name: 'Barbell Bench Press' }),
        createExercise({ name: 'Barbell Row' }),
        createExercise({ name: 'Barbell Bicep Curl' })
      ]);

      console.log(await models.fetchAllUsers());
      console.log(await models.getAllExercises());
    
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

init();