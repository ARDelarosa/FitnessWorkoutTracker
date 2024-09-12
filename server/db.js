const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://postgres:Viper001@localhost:5432/fitness_tracker');
const bcrypt = require('bcrypt');
const uuid = require('uuid');


const createTables = async () => {
    const SQL = `
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS exercises CASCADE;
    DROP TABLE IF EXISTS workouts CASCADE;
    DROP TABLE IF EXISTS workout_sessions CASCADE;
    DROP TABLE IF EXISTS comments CASCADE;
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
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
    `;
    await client.query(SQL);
};

module.exports = { client, createTables };