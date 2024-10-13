const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors({
    origin: 'https://fitnessworkouttracker.onrender.com',  // Replace with your actual frontend URL
    methods: 'GET,POST,PUT,DELETE',  // Specify allowed methods
    credentials: true  // If you're using cookies with CORS
  }));
app.use(express.json());
const {client, createTables,} = require('./db');
const { seedExercises } = require('./seed');
const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcrypt');
const routes = require('./routes');
app.use (routes);
// app.use("/", ./routes)
const { createUser, getAllExercises } = require('./models');
// Use routes


// testing 
//app.use('/auth', authRoutes);
//app.use('/workouts', authenticateJWT, workoutRoutes);

// Start server
const init = async () => {
    const port = process.env.PORT || 3000;
    await client.connect();
    console.log('Database connected');
    
    await createTables();
    console.log('Tables created');

    await seedExercises();
    console.log('Exercises seeded');

    const hashedPassword = await Promise.all([
        bcrypt.hash('admim_pw', 10), // Admin password
        bcrypt.hash('user_pw', 10),  // User password
    ]);

    const [admin, regularUser, barbellSquat, barbellDeadlift, barbellBenchPress, barbellRow, barbellBicepCurl] = await Promise.all([
        // creating admin user
        createUser('Admin', hashedPassword[0], 'admin'), // Role as admin

        // creating regular user
        createUser('Regular User', hashedPassword[1], 'user'), // Role as user

        /* creating exercises
        createExercise('Barbell Squat', 'legs'),
        createExercise('Barbell Deadlift', 'legs'),
        createExercise('Barbell Bench Press', 'chest'),
        createExercise('Barbell Row', 'back'),
        createExercise('Barbell Bicep Curl', 'arms'),*/
      ]);

      console.log('Dummy users created', admin, regularUser)
      console.log(await getAllExercises());
    
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

init();