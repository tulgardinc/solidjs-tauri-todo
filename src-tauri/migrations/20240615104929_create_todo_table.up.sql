-- Add up migration script here
CREATE TABLE todos (
    id INTEGER PRIMARY KEY NOT NULL UNIQUE,
    name TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
);
