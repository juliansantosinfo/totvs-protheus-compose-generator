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
        image: `juliansantosinfo/totvs_dbaccess:${val(config.dbaccess_version, 'DBACCESS_VERSION')}`,
        container_name: val(config.dbaccess_container_name, 'DBACCESS_CONTAINER_NAME'),
        restart: val(config.restart_policy, 'RESTART_POLICY'),
        environment: {
            DATABASE_PROFILE: val(config.dbaccess_database_profile, 'DBACCESS_DATABASE_PROFILE'),
            DATABASE_SERVER: val(config.dbaccess_database_server, 'DBACCESS_DATABASE_SERVER'),
            DATABASE_PORT: val(config.dbaccess_database_port, 'DBACCESS_DATABASE_PORT'),
            DATABASE_ALIAS: val(config.dbaccess_database_alias, 'DBACCESS_DATABASE_ALIAS'),
            DATABASE_NAME: val(config.dbaccess_database_name, 'DBACCESS_DATABASE_NAME'),
            DATABASE_USERNAME: val(config.dbaccess_database_username, 'DBACCESS_DATABASE_USERNAME'),
            DATABASE_PASSWORD: val(config.dbaccess_database_password, 'DBACCESS_DATABASE_PASSWORD'),
            DBACCESS_LICENSE_SERVER: val(config.licenseserver_container_name, 'LICENSESERVER_CONTAINER_NAME'),
            DBACCESS_LICENSE_PORT: val(config.license_port, 'LICENSE_PORT'),
            DBACCESS_CONSOLEFILE: val(config.dbaccess_consolefile, 'DBACCESS_CONSOLEFILE'),
            DEBUG_SCRIPT: val(config.debug_script, 'DEBUG_SCRIPT'),
            TZ: val(config.timezone, 'TZ')
        },
        networks: [val(config.network_name, 'NETWORK_NAME')],
        depends_on: {},
        healthcheck: {
            test: [
                'CMD', 
                'isql', 
                '-b', 
                val(config.dbaccess_database_alias, 'DBACCESS_DATABASE_ALIAS'),
                val(config.dbaccess_database_username, 'DBACCESS_DATABASE_USERNAME'),
                val(config.dbaccess_database_password, 'DBACCESS_DATABASE_PASSWORD')
            ],
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
        service.ports = [`${val(config.dbaccess_port, 'DBACCESS_PORT')}:7890`];
    }
    
    return service;
}
