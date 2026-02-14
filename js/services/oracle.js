/**
 * @fileoverview Oracle Database service configuration generator
 * @module services/oracle
 * @description Generates Docker Compose configuration for Oracle Database service
 */

/**
 * Generate Oracle service configuration
 * @param {Object} config - Full configuration object
 * @param {Object} dbConfig - Database-specific configuration from getDatabaseConfig()
 * @returns {Object} Oracle service configuration for Docker Compose
 * @description Creates a complete Oracle service definition including:
 * - Docker image with version tag
 * - Container name and restart policy
 * - Port mappings
 * - Environment variables (password, timezone)
 * - Volume mounts for data persistence
 * - Network configuration
 * - Health check for service readiness
 */
function generateOracleService(config, dbConfig) {
    const volume = formatVolume(
        config.oracle_volume_name,
        config.oracle_volume_bind,
        dbConfig.volumePath
    );
    
    return {
        image: `juliansantosinfo/totvs_oracle:${val(config.appserver_release, 'APPSERVER_RELEASE')}`,
        container_name: val(config.oracle_container_name, 'ORACLE_CONTAINER_NAME'),
        user: 'oracle',
        restart: val(config.restart_policy, 'RESTART_POLICY'),
        ports: [`${val(dbConfig.externalPort, 'ORACLE_EXTERNAL_PORT')}:${dbConfig.internalPort}`],
        environment: {
            ORACLE_PASSWORD: val(config.oracle_password, 'ORACLE_PASSWORD'),
            RESTORE_BACKUP: val(config.oracle_restore_backup ? 'Y' : 'N', 'RESTORE_BACKUP'),
            DEBUG_SCRIPT: val(config.debug_script, 'DEBUG_SCRIPT'),
            TZ: val(config.timezone, 'TZ')
        },
        volumes: [volume],
        networks: [val(config.network_name, 'NETWORK_NAME')],
        healthcheck: {
            test: ['CMD-SHELL', './healthcheck.sh'],
            interval: '20s',
            timeout: '10s',
            retries: 10,
            start_period: '10s'
        }
    };
}
