const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://postgres:Viper001@localhost:5432/fitness_tracker');


const createTables = async () => {
    const SQL = `
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS exercises CASCADE;
    DROP TABLE IF EXISTS workouts CASCADE;
    DROP TABLE IF EXISTS workout_sessions CASCADE;
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS reviews CASCADE;
    DROP TABLE IF EXISTS review_comments CASCADE;

    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) DEFAULT 'user'
    );
    CREATE TABLE exercises (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE workouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id) NOT NULL,
        name VARCHAR(255) UNIQUE NOT NULL,
        scheduled_date TIMESTAMPTZ,
        status VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE workout_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id) NOT NULL,
        workout_id uuid REFERENCES workouts(id),
        exercise_id uuid REFERENCES exercises(id),
        "order" INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id) NOT NULL,
        workout_id uuid REFERENCES workouts(id),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        exercise_id UUID REFERENCES exercises(id),
        user_id UUID REFERENCES users(id),
        rating INT CHECK (rating >= 1 AND rating <= 5),  -- Rating between 1 and 5
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_review UNIQUE (exercise_id, user_id)
    );

    CREATE TABLE review_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      review_id UUID REFERENCES reviews(id),
      user_id UUID REFERENCES users(id),
      content TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Adding an index on exercise_id to speed up exercise search and reviews lookup
    CREATE INDEX
       idx_exercise_id ON reviews(exercise_id);
    `;
    await client.query(SQL);
};

module.exports = { client, createTables };