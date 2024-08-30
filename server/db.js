const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/fitness_tracker');
const uuid = require('uuid');
const bcrypt = require('bcrypt');