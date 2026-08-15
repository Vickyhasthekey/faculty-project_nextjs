CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS faculty (
  id BIGSERIAL PRIMARY KEY,
  professor TEXT NOT NULL,
  university TEXT NOT NULL,
  department TEXT NOT NULL,
  interest TEXT NOT NULL,
  personal_website TEXT NOT NULL DEFAULT '',
  embedding vector(384) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS faculty_university_idx ON faculty (university);
CREATE INDEX IF NOT EXISTS faculty_department_idx ON faculty (department);
