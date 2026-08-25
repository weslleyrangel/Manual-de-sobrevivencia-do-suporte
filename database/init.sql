-- Initial schema setup
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'N1',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy user for testing (password is '123')
INSERT INTO users (email, password_hash, is_verified) 
VALUES ('admin@suporte.com', '$2a$10$XQxZzZ.zZzZzZzZzZzZzZ.zZzZzZzZzZzZzZzZzZzZzZzZzZzZzZz', true)
ON CONFLICT (email) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS problems (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solutions (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id),
    author_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    media_urls TEXT[], -- Array de strings para armazenar as URLs de mídias (fotos/vídeos)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
