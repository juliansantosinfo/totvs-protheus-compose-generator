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
        image: `juliansantosinfo/totvs_postgres:${val(config.appserver_release, 'APPSERVER_RELEASE')}`,
        container_name: val(config.postgres_container_name, 'POSTGRES_CONTAINER_NAME'),
        user: 'root',
        restart: val(config.restart_policy, 'RESTART_POLICY'),
        ports: [`${val(dbConfig.externalPort, 'POSTGRES_EXTERNAL_PORT')}:${dbConfig.internalPort}`],
        environment: {
            POSTGRES_USER: val(config.postgres_user, 'POSTGRES_USER'),
            POSTGRES_PASSWORD: val(config.postgres_password, 'POSTGRES_PASSWORD'),
            POSTGRES_DB: val(config.postgres_db, 'POSTGRES_DB'),
            POSTGRES_INITDB_ARGS: val(config.postgres_initdb_args, 'POSTGRES_INITDB_ARGS'),
            RESTORE_BACKUP: val(config.postgres_restore_backup ? 'Y' : 'N', 'RESTORE_BACKUP'),
            DEBUG_SCRIPT: val(config.debug_script, 'DEBUG_SCRIPT'),
            TZ: val(config.timezone, 'TZ')
        },
        volumes: [volume],
        networks: [val(config.network_name, 'NETWORK_NAME')],
        healthcheck: {
            test: [
                'CMD-SHELL', 
                `pg_isready -U \${${config.use_env_file ? 'DATABASE_USERNAME:-postgres' : config.postgres_user}} -d \${${config.use_env_file ? 'DATABASE_NAME:-protheus' : config.postgres_db}}`
            ],
            interval: '10s',
            timeout: '5s',
            retries: 5,
            start_period: '10s'
        }
    };
}
