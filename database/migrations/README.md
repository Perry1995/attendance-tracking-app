# Database Migrations

This directory contains database migration files for the attendance tracking application.

## Migration Naming Convention

Migrations should be named using the following format:
```
YYYYMMDDHHMMSS_description_of_migration.sql
```

For example:
```
20240105120000_add_notifications_table.sql
20240106093000_add_user_preferences.sql
```

## Running Migrations

### Using Node.js Migration Tool (Recommended)

The backend includes migration scripts. Run migrations with:

```bash
cd backend
npm run migrate
```

### Manual Migration

To apply a migration manually:

```bash
docker exec -i attendance-postgres psql -U attendance_user -d attendance_db < migrations/YYYYMMDDHHMMSS_migration_name.sql
```

### Rollback Migration

Create a corresponding rollback file with the suffix `_rollback.sql`:
```
20240105120000_add_notifications_table_rollback.sql
```

## Migration Best Practices

1. **Always test migrations** on a development database first
2. **Keep migrations atomic** - each migration should be self-contained
3. **Include rollback scripts** for production migrations
4. **Add indexes** for foreign keys and frequently queried columns
5. **Use transactions** for complex migrations
6. **Document breaking changes** in migration comments
7. **Never modify existing migrations** that have been applied to production

## Initial Schema

The initial database schema is created by `init.sql` which runs automatically when the PostgreSQL container starts for the first time.

To reset the database and reapply the initial schema:

```bash
docker-compose down -v
docker-compose up -d postgres
```

⚠️ **Warning**: This will delete all data in the database!
