CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE workout_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    user_id UUID NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    is_free_exercise BOOLEAN NOT NULL DEFAULT FALSE,
    photo_url VARCHAR(255),
    sets INTEGER,
    reps INTEGER,
    weight INTEGER,
    time INTEGER,

    group_id UUID NOT NULL,
    CONSTRAINT fk_group
        FOREIGN KEY(group_id) 
        REFERENCES workout_groups(id)
        ON DELETE CASCADE
);