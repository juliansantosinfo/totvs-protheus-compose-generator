/**
 * @fileoverview Utility functions for Docker Compose generation
 * @module utils/helpers
 * @description Provides helper functions for value formatting and configuration processing
 */

/**
 * Helper function to return value or environment variable reference
 * @param {*} value - The actual value to use
 * @param {string} envVar - The environment variable name
 * @returns {string|*} Environment variable reference or actual value
 * @example
 * val('postgres', 'DB_USER') // Returns '${DB_USER}' if config.use_env_file is true
 * val('postgres', 'DB_USER') // Returns 'postgres' if config.use_env_file is false
 * @note Reads config.use_env_file from global scope
 */
function val(value, envVar) {
    // Check if we should use env vars (from config passed to generator)
    return window._currentConfig?.use_env_file ? `\${${envVar}}` : value;
}

/**
 * Get database service configuration based on type
 * @param {Object} config - Configuration object
 * @returns {Object} Database service details
 */
function getDatabaseConfig(config) {
    const dbType = config.database_type;
    
    if (dbType === 'postgresql') {
        return {
            service: 'postgres',
            container: config.postgres_container_name,
            internalPort: 5432,
            externalPort: config.postgres_external_port,
            volumeName: config.postgres_volume_name,
            volumeBind: config.postgres_volume_bind,
            volumePath: '/var/lib/postgresql/data',
            username: config.postgres_user || 'postgres'
        };
    } else if (dbType === 'oracle') {
        return {
            service: 'oracle',
            container: config.oracle_container_name,
            internalPort: 1521,
            externalPort: config.oracle_external_port,
            volumeName: config.oracle_volume_name,
            volumeBind: config.oracle_volume_bind,
            volumePath: '/opt/oracle/oradata',
            username: config.oracle_user || 'system'
        };
    } else {
        return {
            service: 'mssql',
            container: config.mssql_container_name,
            internalPort: 1433,
            externalPort: config.mssql_external_port,
            volumeName: config.mssql_volume_name,
            volumeBind: config.mssql_volume_bind,
            volumePath: '/var/opt/mssql/data',
            username: config.mssql_user || 'sa'
        };
    }
}

/**
 * Format volume string for Docker Compose
 * @param {string} volumeName - Named volume or bind mount path
 * @param {string} volumeBind - Bind mount path (optional)
 * @param {string} containerPath - Container mount path
 * @returns {string} Formatted volume string
 */
function formatVolume(volumeName, volumeBind, containerPath) {
    return volumeBind ? `${volumeBind}:${containerPath}` : `${volumeName}:${containerPath}`;
}
