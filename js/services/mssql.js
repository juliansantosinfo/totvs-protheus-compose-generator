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
        image: `juliansantosinfo/totvs_mssql:${config.appserver_release}`,
        container_name: config.mssql_container_name,
        user: 'root',
        restart: config.restart_policy,
        ports: [`${dbConfig.externalPort}:${dbConfig.internalPort}`],
        environment: {
            SA_PASSWORD: config.mssql_sa_password,
            ACCEPT_EULA: config.mssql_accept_eula,
            RESTORE_BACKUP: config.mssql_restore_backup ? 'Y' : 'N',
            TZ: config.timezone
        },
        volumes: [volume],
        networks: [config.network_name],
        healthcheck: {
            test: ['CMD', '/opt/mssql-tools18/bin/sqlcmd', '-S', 'localhost', '-U', 'sa', '-P', config.mssql_sa_password, '-C', '-Q', 'SELECT 1'],
            interval: '10s',
            timeout: '10s',
            retries: 10,
            start_period: '10s'
        }
    };
}
