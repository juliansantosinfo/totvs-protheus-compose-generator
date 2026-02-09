/**
 * @fileoverview TOTVS DBAccess service configuration generator
 * @module services/dbaccess
 * @description Generates Docker Compose configuration for TOTVS DBAccess middleware
 */

/**
 * Generate DBAccess service configuration
 * @param {Object} config - Full configuration object
 * @param {string} dbService - Database service name ('postgres' or 'mssql')
 * @returns {Object} DBAccess service configuration for Docker Compose
 * @description Creates DBAccess service definition including:
 * - Docker image with version tag
 * - Container name and restart policy
 * - Optional port mappings (if expose_ports is enabled)
 * - Environment variables (database connection, license server)
 * - Network configuration
 * - Service dependencies (database and license server)
 * - Health check using isql
 */
function generateDbAccessService(config, dbService) {
    const service = {
        image: `juliansantosinfo/totvs_dbaccess:${config.dbaccess_version}`,
        container_name: config.dbaccess_container_name,
        restart: config.restart_policy,
        environment: {
            DATABASE_PROFILE: config.dbaccess_database_profile,
            DATABASE_SERVER: config.dbaccess_database_server,
            DATABASE_PORT: config.dbaccess_database_port,
            DATABASE_ALIAS: config.dbaccess_database_alias,
            DATABASE_NAME: config.dbaccess_database_name,
            DATABASE_USERNAME: config.dbaccess_database_username,
            DATABASE_PASSWORD: config.dbaccess_database_password,
            DBACCESS_LICENSE_SERVER: config.licenseserver_container_name,
            DBACCESS_LICENSE_PORT: config.license_port,
            DBACCESS_CONSOLEFILE: config.dbaccess_consolefile,
            TZ: config.timezone
        },
        networks: [config.network_name],
        depends_on: {},
        healthcheck: {
            test: ['CMD', 'isql', '-b', config.dbaccess_database_alias, config.dbaccess_database_username, config.dbaccess_database_password],
            interval: '10s',
            timeout: '10s',
            retries: 10,
            start_period: '10s'
        }
    };
    
    // Add database dependency only if not using external database
    if (!config.use_external_database) {
        service.depends_on[dbService] = { condition: 'service_healthy' };
    }
    service.depends_on.licenseserver = { condition: 'service_started' };
    
    // Add port mappings if expose_ports is enabled
    if (config.dbaccess_expose_ports) {
        service.ports = [
            `${config.dbaccess_port_7890}:7890`,
            `${config.dbaccess_port_7891}:7891`
        ];
    }
    
    return service;
}
