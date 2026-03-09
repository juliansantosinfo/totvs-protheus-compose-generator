/**
 * @fileoverview PostgreSQL service configuration generator
 * @module services/postgres
 * @description Generates Docker Compose configuration for PostgreSQL database service
 */

/**
 * Generate PostgreSQL service configuration
 * @param {Object} config - Full configuration object
 * @param {Object} dbConfig - Database-specific configuration from getDatabaseConfig()
 * @returns {Object} PostgreSQL service configuration for Docker Compose
 * @description Creates a complete PostgreSQL service definition including:
 * - Docker image with version tag
 * - Container name and restart policy
 * - Port mappings
 * - Environment variables (user, password, database, locale)
 * - Volume mounts for data persistence
 * - Network configuration
 * - Health check for service readiness
 */
function generatePostgresService(config, dbConfig) {
    const volume = formatVolume(
        config.postgres_volume_name,
        config.postgres_volume_bind,
        dbConfig.volumePath
    );
    
    return {
        image: `juliansantosinfo/totvs_postgres:${val(config.database_version, 'POSTGRES_VERSION')}`,
        container_name: val(config.postgres_container_name, 'POSTGRES_CONTAINER_NAME'),
        user: 'root',
        restart: val(config.restart_policy, 'RESTART_POLICY'),
        ports: [`${val(dbConfig.externalPort, 'POSTGRES_EXTERNAL_PORT')}:${dbConfig.internalPort}`],
        environment: {
            POSTGRES_USER: val(config.postgres_user, 'DATABASE_USERNAME'),
            POSTGRES_PASSWORD: val(config.postgres_password, 'DATABASE_PASSWORD'),
            POSTGRES_DB: val(config.postgres_db, 'DATABASE_NAME'),
            POSTGRES_INITDB_ARGS: val(config.postgres_initdb_args, 'POSTGRES_INITDB_ARGS'),
            TZ: val(config.timezone, 'TZ')
        },
        volumes: [volume],
        networks: [val(config.network_name, 'NETWORK_NAME')],
        healthcheck: {
            test: ['CMD', '/healthcheck.sh'],
            interval: '10s',
            timeout: '10s',
            retries: 10,
            start_period: '10s'
        }
    };
    
    // Conditionally add optional environment variables
    if (config.postgres_restore_backup) {
        service.environment.RESTORE_BACKUP = val('Y', 'RESTORE_BACKUP');
    }
    
    if (config.debug_script) {
        service.environment.DEBUG_SCRIPT = val(config.debug_script, 'DEBUG_SCRIPT');
    }

    return service;
}
