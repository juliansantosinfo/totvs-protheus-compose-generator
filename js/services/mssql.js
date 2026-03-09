/**
 * @fileoverview Microsoft SQL Server service configuration generator
 * @module services/mssql
 * @description Generates Docker Compose configuration for MSSQL database service
 */

/**
 * Generate MSSQL service configuration
 * @param {Object} config - Full configuration object
 * @param {Object} dbConfig - Database-specific configuration from getDatabaseConfig()
 * @returns {Object} MSSQL service configuration for Docker Compose
 * @description Creates a complete MSSQL service definition including:
 * - Docker image with version tag
 * - Container name and restart policy
 * - Port mappings
 * - Environment variables (SA password, EULA acceptance)
 * - Volume mounts for data persistence
 * - Network configuration
 * - Health check using sqlcmd
 */
function generateMssqlService(config, dbConfig) {
    const volume = formatVolume(
        config.mssql_volume_name,
        config.mssql_volume_bind,
        dbConfig.volumePath
    );
    
    return {
        image: `juliansantosinfo/totvs_mssql:${val(config.database_version, 'MSSQL_VERSION')}`,
        container_name: val(config.mssql_container_name, 'MSSQL_CONTAINER_NAME'),
        user: 'root',
        restart: val(config.restart_policy, 'RESTART_POLICY'),
        ports: [`${val(dbConfig.externalPort, 'MSSQL_EXTERNAL_PORT')}:${dbConfig.internalPort}`],
        environment: {
            SA_PASSWORD: val(config.mssql_sa_password, 'DATABASE_PASSWORD'),
            ACCEPT_EULA: val(config.mssql_accept_eula, 'MSSQL_ACCEPT_EULA'),
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
    if (config.mssql_restore_backup) {
        service.environment.RESTORE_BACKUP = val('Y', 'RESTORE_BACKUP');
    }
    
    if (config.debug_script) {
        service.environment.DEBUG_SCRIPT = val(config.debug_script, 'DEBUG_SCRIPT');
    }

    return service;
}
