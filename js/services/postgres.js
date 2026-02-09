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
        image: `juliansantosinfo/totvs_postgres:${config.appserver_release}`,
        container_name: config.postgres_container_name,
        user: 'root',
        restart: config.restart_policy,
        ports: [`${dbConfig.externalPort}:${dbConfig.internalPort}`],
        environment: {
            POSTGRES_USER: config.postgres_user,
            POSTGRES_PASSWORD: config.postgres_password,
            POSTGRES_DB: config.postgres_db,
            POSTGRES_INITDB_ARGS: config.postgres_initdb_args,
            RESTORE_BACKUP: config.postgres_restore_backup ? 'Y' : 'N',
            TZ: config.timezone
        },
        volumes: [volume],
        networks: [config.network_name],
        healthcheck: {
            test: ['CMD-SHELL', `pg_isready -U ${config.postgres_user} -d ${config.postgres_db}`],
            interval: '10s',
            timeout: '5s',
            retries: 5,
            start_period: '10s'
        }
    };
}
