/* eslint-disable */
// First migration: the current db/database.sql captured verbatim.
// Uses IF NOT EXISTS so running `migrate up` against an existing prod DB that
// is already at this schema is a no-op (Phase 4 exit criterion).

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS general (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255),
      name VARCHAR(255),
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS work (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      videos JSON,
      credits TEXT,
      work_order INTEGER,
      description TEXT,
      category TEXT[],
      photos INTEGER[],
      user_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS shot (
      id SERIAL PRIMARY KEY,
      categories TEXT[],
      work_id INTEGER,
      user_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS photo (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      description VARCHAR,
      credits VARCHAR,
      photo_order INTEGER,
      categories TEXT[],
      user_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      work_id INTEGER,
      work_order INTEGER,
      is_work_preview BOOLEAN,
      work_categories VARCHAR(255),
      photo_id INTEGER,
      photo_order INTEGER,
      is_photo_preview BOOLEAN,
      photo_categories VARCHAR(255),
      shot_id INTEGER,
      shot_order INTEGER,
      format VARCHAR(255),
      image VARCHAR(255),
      user_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS slides (
      id SERIAL PRIMARY KEY,
      type VARCHAR(255),
      title VARCHAR(255),
      slide_order INTEGER,
      image VARCHAR(255) DEFAULT NULL,
      videos VARCHAR(255) DEFAULT NULL,
      work_id INTEGER DEFAULT NULL,
      photo_id INTEGER DEFAULT NULL,
      user_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255),
      password VARCHAR(255),
      refresh_token VARCHAR(255),
      expiry_date VARCHAR(255)
    );
  `);
};

// Forward-only baseline: down intentionally does nothing to avoid dropping a
// production schema that predates migrations.
exports.down = () => {};
