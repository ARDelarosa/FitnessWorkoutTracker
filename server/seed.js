const { client } = require('./db');

const seedExercises = async () => {
    const exercises = [
        { 
            name: 'Barbell Squat', 
            description: 'Legs', 
            imageUrl: 'https://images.unsplash.com/photo-1541600383005-565c949cf777?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c3F1YXR8ZW58MHx8MHx8fDA%3D'
        },
        { 
            name: 'Barbell Deadlift', 
            description: 'Legs', 
            imageUrl: 'https://plus.unsplash.com/premium_photo-1661580867087-5a561da6662a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGVhZGxpZnR8ZW58MHx8MHx8fDA%3D'
        },
        { 
            name: 'Barbell Bench Press', 
            description: 'Chest', 
            imageUrl: 'https://media.istockphoto.com/id/1028273740/photo/man-during-bench-press-exercise.jpg?s=2048x2048&w=is&k=20&c=Fj6PNUHbrtB1MirwMdO4_wcwlwwzWSLCw8hXjZeHRbU='
        },
        { 
            name: 'Military Press', 
            description: 'Shoulders', 
            imageUrl: 'https://media.istockphoto.com/id/932361894/photo/young-woman-lifting-weights-over-her-head-in-a-gym.jpg?s=612x612&w=0&k=20&c=cVfs9GAZ7G2n-JCZsRN3wFbyfzkCR2qp8w0-qOspdoE='
        },
        { 
            name: 'Barbell Row', 
            description: 'Back', 
            imageUrl: 'https://media.istockphoto.com/id/957253398/photo/the-power-of-group-training.jpg?s=2048x2048&w=is&k=20&c=-sVRKohBmGaqQYGpylRkruDHr2ebCt3c9L3kX4f2pqc='
        },
        { 
            name: 'Barbell Bicep Curl', 
            description: 'Arms', 
            imageUrl: 'https://media.istockphoto.com/id/2162698855/photo/a-muscular-bodybuilder-trains-his-biceps-with-a-barbell-in-a-gym.jpg?s=2048x2048&w=is&k=20&c=ee8yq5NgN7oxzwy4fZ2FAUJXrqNOKXT1tQU9FcjjrbA='
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
