DROP TABLE IF EXISTS polls CASCADE;

CREATE TABLE polls (
  id SERIAL PRIMARY KEY NOT NULL,
  creator_email VARCHAR(255) NOT NULL,
  result_url VARCHAR(255) NOT NULL UNIQUE,
  submission_url VARCHAR(255) NOT NULL UNIQUE,
  question VARCHAR(255) NOT NULL,
  answer_1 VARCHAR(255) NOT NULL,
  description_1 TEXT,
  answer_2 VARCHAR(255) NOT NULL,
  description_2 TEXT,
  answer_3 VARCHAR(255) NOT NULL,
  description_3 TEXT,
  answer_4 VARCHAR(255) NOT NULL,
  description_4 TEXT,
  name_required BOOLEAN
);
