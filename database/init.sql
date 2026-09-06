-- Schema Completo do IT Support Knowledge Catalog

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) DEFAULT 'Analista de Suporte',
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'MEMBER',
    job_title VARCHAR(255) DEFAULT 'Analista de Suporte · Nível 1',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    token_expires_at TIMESTAMP,
    reset_password_token VARCHAR(255),
    reset_password_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS problems (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Atendimento',
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'RESOLVIDO',
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    is_draft BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_problems_author ON problems(author_id);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);

CREATE TABLE IF NOT EXISTS solutions (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    steps JSONB DEFAULT '[]'::jsonb,
    media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_solutions_problem ON solutions(problem_id);

ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS job_title VARCHAR(255) DEFAULT 'Analista de Suporte · Nível 1',
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reset_password_expires_at TIMESTAMP;

ALTER TABLE problems 
    ADD COLUMN IF NOT EXISTS accepted_solution_id INTEGER REFERENCES solutions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS closing_reason TEXT,
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP;

-- Índice GIN otimizado para busca textual rápida
CREATE INDEX IF NOT EXISTS idx_problems_fts ON problems 
    USING gin(to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '')));


