DROP TABLE IF EXISTS submissions CASCADE;

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY NOT NULL,
  poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
  voter_name VARCHAR(255),
  a1_score INTEGER,
  a2_score INTEGER,
  a3_score INTEGER,
  a4_score INTEGER
);
