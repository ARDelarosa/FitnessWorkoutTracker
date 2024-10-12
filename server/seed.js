const { client } = require('./db');

const seedExercises = async () => {
    const exercises = [
        { 
            name: 'Barbell Squat', 
            description: 'Legs', 
            imageUrl: 'https://example.com/barbell-squat.jpg'
        },
        { 
            name: 'Barbell Deadlift', 
            description: 'Legs', 
            imageUrl: 'https://example.com/barbell-deadlift.jpg'
        },
        { 
            name: 'Barbell Bench Press', 
            description: 'Chest', 
            imageUrl: 'https://example.com/barbell-bench-press.jpg'
        },
        { 
            name: 'Military Press', 
            description: 'Shoulders', 
            imageUrl: 'https://example.com/military-press.jpg'
        },
        { 
            name: 'Barbell Row', 
            description: 'Back', 
            imageUrl: 'https://example.com/barbell-row.jpg'
        },
        { 
            name: 'Barbell Bicep Curl', 
            description: 'Arms', 
            imageUrl: 'https://example.com/barbell-bicep-curl.jpg'
        }
    ];

    try {
        await Promise.all(exercises.map(async (exercise) => {
            const result = await client.query(
                `INSERT INTO exercises (name, description, imageUrl) 
                VALUES ($1, $2, $3) 
                ON CONFLICT (name) DO NOTHING 
                RETURNING *;`,
                [exercise.name, exercise.description, exercise.imageUrl]
            );
            console.log('Seeded exercise:', result.rows[0]);
        }));
    } catch (err) {
        console.error('Error seeding exercises:', err.message);
    }
};

module.exports = { seedExercises };
