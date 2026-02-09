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
        image: `juliansantosinfo/totvs_smartview:${val(config.smartview_version, 'SMARTVIEW_VERSION')}`,
        container_name: val(config.smartview_container_name, 'SMARTVIEW_CONTAINER_NAME'),
        restart: val(config.restart_policy, 'RESTART_POLICY'),
        ports: [
            `${val(config.smartview_app_port, 'SMARTVIEW_APP_PORT')}:7017`,
            `${val(config.smartview_config_port, 'SMARTVIEW_CONFIG_PORT')}:7019`
        ],
        environment: {
            SMARTVIEW_REST_SERVER: val(config.smartview_rest_server, 'SMARTVIEW_REST_SERVER'),
            SMARTVIEW_REST_PORT: val(config.smartview_rest_port, 'SMARTVIEW_REST_PORT'),
            SMARTVIEW_DISCOVERY_URL: val(config.smartview_discovery_url, 'SMARTVIEW_DISCOVERY_URL'),
            EXTRACT_RESOURCES: 'true',
            TZ: val(config.timezone, 'TZ')
        },
        networks: [val(config.network_name, 'NETWORK_NAME')],
        depends_on: {
            apprest: { condition: 'service_started' }
        }
    };
}
