/**
 * @fileoverview TOTVS SmartView service configuration generator
 * @module services/smartview
 * @description Generates Docker Compose configuration for TOTVS SmartView analytics service
 */

/**
 * Generate SmartView service configuration
 * @param {Object} config - Full configuration object
 * @returns {Object} SmartView service configuration for Docker Compose
 * @description Creates SmartView service definition including:
 * - Docker image with version tag
 * - Container name and restart policy
 * - Port mappings (application and configuration ports)
 * - Environment variables (REST server connection, discovery URL)
 * - Network configuration
 * - Service dependency on AppRest
 * - Profiles for optional deployment
 * @note SmartView requires AppRest service to be running
 */
function generateSmartViewService(config) {
    const volume = formatVolume(
        config.smartview_volume_name || 'totvs_smartview_data',
        config.smartview_volume_bind,
        '/totvs/smartview'
    );
    
    const service = {
        image: `juliansantosinfo/totvs_smartview:${val(config.smartview_version, 'SMARTVIEW_VERSION')}`,
        container_name: val(config.smartview_container_name, 'SMARTVIEW_CONTAINER_NAME'),
        restart: val(config.restart_policy, 'RESTART_POLICY'),
        ports: [
            `${val(config.smartview_app_port, 'SMARTVIEW_APP_PORT')}:7017`,
            `${val(config.smartview_config_port, 'SMARTVIEW_CONFIG_PORT')}:7019`
        ],
        environment: {
            EXTRACT_RESOURCES: 'true',
            DEBUG_SCRIPT: val(config.debug_script, 'DEBUG_SCRIPT'),
            TZ: val(config.timezone, 'TZ')
        },
        volumes: [volume],
        networks: [val(config.network_name, 'NETWORK_NAME')]
    };
    
    // Add profiles if enabled
    if (config.use_profiles) {
        service.profiles = ['full', 'with-smartview'];
    }
    
    return service;
}
