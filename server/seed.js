const { client } = require('./db');

const seedExercises = async () => {
    const exercises = [
        { 
            name: 'Barbell Squat', 
            description: 'Legs', 
            imageUrl: 'https://tse2.mm.bing.net/th?id=OIP.0O8khq1UTwRpoCFuhSTy-QAAAA&pid=Api&P=0&h=420'
        },
        { 
            name: 'Barbell Deadlift', 
            description: 'Legs',
            imageUrl: 'https://tse2.mm.bing.net/th?id=OIP.dCf4ocAPuh4D9BRma6YqxgHaEv&pid=Api&P=0&h=220'
        },
        { 
            name: 'Barbell Bench Press', 
            description: 'Chest', 
            imageUrl: 'https://tse1.mm.bing.net/th?id=OIP.TnS5_my2peNgv_hxqSKMoAHaE8&pid=Api&P=0&h=220'
        },
        { 
            name: 'Military Press', 
            description: 'Shoulders', 
            imageUrl: 'https://tse3.mm.bing.net/th?id=OIP.l8MAbK-GDvke2BANAbZljAHaE8&pid=Api&P=0&h=220'
        },
        { 
            name: 'Barbell Row', 
            description: 'Back', 
            imageUrl: 'https://tse2.mm.bing.net/th?id=OIP.7s-5XtM5vwUcGbsvzx9AEQHaE8&pid=Api&P=0&h=220'
        },
        { 
            name: 'Barbell Bicep Curl', 
            description: 'Arms', 
            imageUrl: 'https://tse4.mm.bing.net/th?id=OIP.qCnPT-vCqjzXOMG1TQW5UgHaFL&pid=Api&P=0&h=220'
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
