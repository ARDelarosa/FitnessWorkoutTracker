const pg = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.secret || "shhh";
const createUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 5);
    const query = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id`;
    const result = await pool.query(query, [username, hashedPassword]);
    return result.rows[0].id;
};

const findUserByUsername = async (username) => {
    const query = `SELECT * FROM users WHERE username = $1`;
    const result = await pool.query(query, [username]);
    return result.rows[0];
};

module.exports = { createUser, findUserByUsername };