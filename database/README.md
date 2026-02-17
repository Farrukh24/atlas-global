# Atlas Global Logistics - Database Initialization

This directory is mapped to `/docker-entrypoint-initdb.d/` in the `postgres` container.

## Initialization Rules:
1.  **Alphabetical Order**: Files are executed in alphabetical order. 
2.  **File Format**: Place `.sql` or `.sh` files here.
3.  **Schema and Seed**: 
    - `01_schema.sql`: Contains the table definitions and PostGIS extension setup.
    - `02_seed.sql`: Contains initial data for testing.

## PostGIS:
The `postgis/postgis` image is used, so the extension is available out of the box. Ensure your schema file includes:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Persistence:
Data is persisted in the `postgres_data` Docker volume. To reset the database including the volume:
`docker-compose down -v`
