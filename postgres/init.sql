-- PostgreSQL initialization script for GeneralStaff
-- This script runs when the PostgreSQL container starts for the first time

-- Create the main database (if not exists)
-- Note: The database is created via POSTGRES_DB env var, but we can also create schemas here

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create application user (optional, for more granular permissions)
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'generalstaff_app') THEN
--         CREATE ROLE generalstaff_app WITH LOGIN PASSWORD 'changeme';
--     END IF;
-- END
-- $$;

-- Grant permissions to the application user
-- GRANT ALL PRIVILEGES ON DATABASE generalstaff TO generalstaff_app;
-- GRANT ALL ON SCHEMA public TO generalstaff_app;

-- Set default privileges for future objects
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO generalstaff_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO generalstaff_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO generalstaff_app;

-- Create a schema for the application (optional)
-- CREATE SCHEMA IF NOT EXISTS generalstaff;
-- GRANT ALL ON SCHEMA generalstaff TO generalstaff_app;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'GeneralStaff database initialized successfully';
END $$;