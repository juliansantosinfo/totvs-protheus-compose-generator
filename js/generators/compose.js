/**
 * @fileoverview Main Docker Compose YAML generator
 * @module generators/compose
 * @description Orchestrates all service modules to generate complete docker-compose.yaml
 */

/**
 * Generate complete Docker Compose configuration
 * @param {Object} config - Full configuration object from form
 * @returns {string} Complete docker-compose.yaml content
 * @description Main orchestrator that:
 * 1. Stores config globally for val() function
 * 2. Initializes compose structure (version, services, volumes, networks)
 * 3. Adds database service (if not external)
 * 4. Adds License Server (always required)
 * 5. Adds DBAccess (always required)
 * 6. Adds AppServer (always required)
 * 7. Adds AppRest (if enabled)
 * 8. Adds SmartView (if enabled)
 * 9. Collects all volumes (excluding bind mounts)
 * 10. Defines network configuration
 * 11. Converts to YAML format
 * 12. Adds header if using .env file
 */
function generateDockerCompose(config) {
    // Store config globally for val() function
    window._currentConfig = config;
    
    const dbConfig = getDatabaseConfig(config);
    
    // Initialize compose structure
    const composeDict = {
        version: '3.8',
        services: {}
    };
    
    // Add database service (only if not using external)
    if (!config.use_external_database) {
        if (config.database_type === 'postgresql') {
            composeDict.services.postgres = generatePostgresService(config, dbConfig);
        } else {
            composeDict.services.mssql = generateMssqlService(config, dbConfig);
        }
    }
    
    // Add License Server (always required)
    composeDict.services.licenseserver = generateLicenseServerService(config);
    
    // Add DBAccess (always required)
    composeDict.services.dbaccess = generateDbAccessService(config, dbConfig.service);
    
    // Add AppServer (always required)
    composeDict.services.appserver = generateAppServerService(config, 'application');
    
    // Add AppRest (optional)
    if (config.include_rest_server) {
        composeDict.services.apprest = generateAppServerService(config, 'rest');
    }
    
    // Add SmartView (optional, requires AppRest)
    if (config.include_smartview) {
        composeDict.services.smartview = generateSmartViewService(config);
    }
    
    // Collect volumes (only named volumes, not bind mounts)
    composeDict.volumes = collectVolumes(config, dbConfig);
    
    // Define network
    composeDict.networks = {};
    composeDict.networks[config.network_name] = { driver: 'bridge' };
    
    // Convert to YAML
    let yaml = jsyaml.dump(composeDict, { lineWidth: -1, noRefs: true });
    
    // Add header if using .env file
    if (config.use_env_file) {
        const header = `# This docker-compose.yaml uses environment variables from .env file
# Make sure to place the .env file in the same directory
# 
`;
        yaml = header + yaml;
    }
    
    return yaml;
}

/**
 * Collect all named volumes (excluding bind mounts)
 * @param {Object} config - Full configuration object
 * @param {Object} dbConfig - Database configuration
 * @returns {Object} Volumes object for Docker Compose
 * @description Collects volumes from:
 * - Database (if not external and not bind mount)
 * - AppServer data (if not bind mount)
 * - AppServer APO (if enabled and not bind mount)
 * - AppServer logs (if enabled and not bind mount)
 * - AppRest APO (if independent and not bind mount)
 * - AppRest logs (if independent and not bind mount)
 */
function collectVolumes(config, dbConfig) {
    const volumes = {};
    
    // Database volume
    if (!config.use_external_database && !dbConfig.volumeBind) {
        volumes[dbConfig.volumeName] = { driver: 'local' };
    }
    
    // AppServer data volume
    if (!config.appserver_volume_bind) {
        volumes[config.appserver_volume_name] = { driver: 'local' };
    }
    
    // AppServer APO volume
    if (config.appserver_enable_volume_apo && !config.appserver_volume_apo_bind) {
        volumes[config.appserver_volume_apo] = { driver: 'local' };
    }
    
    // AppServer logs volume
    if (config.appserver_enable_volume_logs && !config.appserver_volume_logs_bind) {
        volumes[config.appserver_volume_logs] = { driver: 'local' };
    }
    
    // AppRest volumes (only if independent)
    if (config.include_rest_server) {
        if (config.apprest_enable_volume_apo && !config.apprest_volume_apo_bind) {
            volumes[config.apprest_volume_apo] = { driver: 'local' };
        }
        if (config.apprest_enable_volume_logs && !config.apprest_volume_logs_bind) {
            volumes[config.apprest_volume_logs] = { driver: 'local' };
        }
    }
    
    return volumes;
}
