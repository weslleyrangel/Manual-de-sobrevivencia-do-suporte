const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@db:5432/itsupport'
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
