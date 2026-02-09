/**
 * @fileoverview Utility functions for Docker Compose generation
 * @module utils/helpers
 * @description Provides helper functions for value formatting and configuration processing
 */

/**
 * Helper function to return value or environment variable reference
 * @param {*} value - The actual value to use
 * @param {string} envVar - The environment variable name
 * @param {boolean} useEnv - Whether to use environment variables
 * @returns {string|*} Environment variable reference or actual value
 * @example
 * val('postgres', 'DB_USER', true) // Returns '${DB_USER}'
 * val('postgres', 'DB_USER', false) // Returns 'postgres'
 */
function val(value, envVar, useEnv) {
    return useEnv ? `\${${envVar}}` : value;
}

/**
 * Get database service configuration based on type
 * @param {Object} config - Configuration object
 * @returns {Object} Database service details
 */
function getDatabaseConfig(config) {
    const isPostgres = config.database_type === 'postgresql';
    
    return {
        service: isPostgres ? 'postgres' : 'mssql',
        container: isPostgres ? config.postgres_container_name : config.mssql_container_name,
        internalPort: isPostgres ? 5432 : 1433,
        externalPort: isPostgres ? config.postgres_external_port : config.mssql_external_port,
        volumeName: isPostgres ? config.postgres_volume_name : config.mssql_volume_name,
        volumeBind: isPostgres ? config.postgres_volume_bind : config.mssql_volume_bind,
        volumePath: isPostgres ? '/var/lib/postgresql/data' : '/var/opt/mssql/data'
    };
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
