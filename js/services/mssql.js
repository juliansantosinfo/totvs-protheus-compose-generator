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
        image: `juliansantosinfo/totvs_mssql:${val(config.appserver_release, 'APPSERVER_RELEASE')}`,
        container_name: val(config.mssql_container_name, 'MSSQL_CONTAINER_NAME'),
        user: 'root',
        restart: val(config.restart_policy, 'RESTART_POLICY'),
        ports: [`${val(dbConfig.externalPort, 'MSSQL_EXTERNAL_PORT')}:${dbConfig.internalPort}`],
        environment: {
            SA_PASSWORD: val(config.mssql_sa_password, 'MSSQL_SA_PASSWORD'),
            ACCEPT_EULA: val(config.mssql_accept_eula, 'MSSQL_ACCEPT_EULA'),
            RESTORE_BACKUP: val(config.mssql_restore_backup ? 'Y' : 'N', 'RESTORE_BACKUP'),
            DEBUG_SCRIPT: val(config.debug_script, 'DEBUG_SCRIPT'),
            TZ: val(config.timezone, 'TZ')
        },
        volumes: [volume],
        networks: [val(config.network_name, 'NETWORK_NAME')],
        healthcheck: {
            test: ['CMD', '/opt/mssql-tools18/bin/sqlcmd', '-S', 'localhost', '-U', 'sa', '-P', config.mssql_sa_password, '-C', '-Q', 'SELECT 1'],
            interval: '10s',
            timeout: '10s',
            retries: 10,
            start_period: '10s'
        }
    };
}
