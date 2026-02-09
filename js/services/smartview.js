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
 * @note SmartView requires AppRest service to be running
 */
function generateSmartViewService(config) {
    return {
        image: `juliansantosinfo/totvs_smartview:${config.smartview_version}`,
        container_name: config.smartview_container_name,
        restart: config.restart_policy,
        ports: [
            `${config.smartview_app_port}:7017`,
            `${config.smartview_config_port}:7019`
        ],
        environment: {
            SMARTVIEW_REST_SERVER: config.smartview_rest_server,
            SMARTVIEW_REST_PORT: config.smartview_rest_port,
            SMARTVIEW_DISCOVERY_URL: config.smartview_discovery_url,
            EXTRACT_RESOURCES: 'true',
            TZ: config.timezone
        },
        networks: [config.network_name],
        depends_on: {
            apprest: { condition: 'service_started' }
        }
    };
}
