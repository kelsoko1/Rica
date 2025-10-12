#!/bin/bash
set -e

# Create multiple databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE ;
    CREATE DATABASE activepieces;
    
    -- Create users for each database
    CREATE USER  WITH PASSWORD '';
    CREATE USER activepieces WITH PASSWORD 'activepieces';
    
    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE  TO ;
    GRANT ALL PRIVILEGES ON DATABASE activepieces TO activepieces;
EOSQL

echo "Multiple databases created successfully!"
