const pg = require('pg');
const client = new pg.Client({connectionString: process.env.DATABASE_URL});


const createTables = async () => {
    const SQL = `
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS exercises (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        imageUrl VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        name VARCHAR(255) NOT NULL,
        scheduled_date DATE NOT NULL,
        status VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workout_id UUID REFERENCES workouts(id),
        exercise_id UUID REFERENCES exercises(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workout_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
        exercise_id UUID REFERENCES exercises(id),
        "sets" INTEGER NOT NULL DEFAULT 3,
        "reps" INTEGER NOT NULL DEFAULT 10,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        workout_id UUID REFERENCES workouts(id),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        exercise_id UUID REFERENCES exercises(id),
        user_id UUID REFERENCES users(id),
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_review UNIQUE (exercise_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS review_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        review_id UUID REFERENCES reviews(id),
        user_id UUID REFERENCES users(id),
        content TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_exercise_id
        ON reviews(exercise_id);
    `;

    await client.query(SQL);
};

module.exports = { client, createTables };