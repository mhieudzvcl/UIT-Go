-- PostgreSQL init script: auto-run when db container starts
-- Creates all databases needed for UIT-Go services
-- (Tables will be created separately when services connect or via manual setup)

-- Postgres doesn't support IF NOT EXISTS for CREATE DATABASE, so we just create them.
-- If database already exists, the script will fail, but that's fine for idempotency.

CREATE DATABASE payments;
CREATE DATABASE tripdb;
CREATE DATABASE userdb;
