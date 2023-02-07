SELECT 'CREATE DATABASE bugs'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bugs')\gexec