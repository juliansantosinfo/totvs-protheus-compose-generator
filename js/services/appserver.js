/**
 * @fileoverview TOTVS AppServer service configuration generator
 * @module services/appserver
 * @description Generates Docker Compose configuration for TOTVS Protheus AppServer
 */

/**
 * Generate AppServer service configuration
 * @param {Object} config - Full configuration object
 * @param {string} mode - Server mode ('application' or 'rest')
 * @returns {Object} AppServer service configuration for Docker Compose
 * @description Creates AppServer service definition including:
 * - Docker image with release version
 * - Container name and restart policy
 * - Port mappings (app, web, rest, manager)
 * - Environment variables (mode, database, license, ports)
 * - Volume mounts (data, optional APO and logs)
 * - Network configuration
 * - Service dependencies (license server and dbaccess)
 * - Ulimits for file descriptors
 */
function generateAppServerService(config, mode = 'application') {
    const isRest = mode === 'rest';
    const prefix = isRest ? 'apprest' : 'appserver';
    
    // Base volume (always shared for apprest)
    const dataVolume = formatVolume(
        config.appserver_volume_name,
        config.appserver_volume_bind,
        '/totvs/protheus_data'
    );
    
    const volumes = [dataVolume];
    
    // Add optional APO volume
    const enableApo = isRest ? config.apprest_enable_volume_apo : config.appserver_enable_volume_apo;
    if (enableApo) {
        const apoVolumeName = isRest ? config.apprest_volume_apo : config.appserver_volume_apo;
        const apoVolumeBind = isRest ? config.apprest_volume_apo_bind : config.appserver_volume_apo_bind;
        volumes.push(formatVolume(apoVolumeName, apoVolumeBind, '/totvs/protheus/apo'));
    } else if (isRest && config.appserver_enable_volume_apo) {
        // Share AppServer APO volume if AppRest doesn't have independent
        volumes.push(formatVolume(
            config.appserver_volume_apo,
            config.appserver_volume_apo_bind,
            '/totvs/protheus/apo'
        ));
    }
    
    // Add optional Logs volume
    const enableLogs = isRest ? config.apprest_enable_volume_logs : config.appserver_enable_volume_logs;
    if (enableLogs) {
        const logsVolumeName = isRest ? config.apprest_volume_logs : config.appserver_volume_logs;
        const logsVolumeBind = isRest ? config.apprest_volume_logs_bind : config.appserver_volume_logs_bind;
        volumes.push(formatVolume(logsVolumeName, logsVolumeBind, '/totvs/protheus/bin/appserver'));
    } else if (isRest && config.appserver_enable_volume_logs) {
        // Share AppServer Logs volume if AppRest doesn't have independent
        volumes.push(formatVolume(
            config.appserver_volume_logs,
            config.appserver_volume_logs_bind,
            '/totvs/protheus/bin/appserver'
        ));
    }
    
    const containerName = isRest ? config.apprest_container_name : config.appserver_container_name;
    const port = isRest ? config.apprest_port : config.appserver_port;
    const webPort = isRest ? config.apprest_web_port : config.appserver_web_port;
    const restPort = isRest ? config.apprest_rest_port : config.appserver_rest_port;
    const webManager = isRest ? config.apprest_web_manager : config.appserver_web_manager;
    
    return {
        image: `juliansantosinfo/totvs_appserver:${config.appserver_release}`,
        container_name: containerName,
        restart: config.restart_policy,
        ports: [
            `${port}:${port}`,
            `${webPort}:${webPort}`,
            `${restPort}:${restPort}`,
            `${webManager}:${webManager}`
        ],
        ulimits: {
            nofile: {
                soft: 65536,
                hard: 65536
            }
        },
        environment: {
            APPSERVER_MODE: mode,
            APPSERVER_RPO_CUSTOM: config.appserver_rpo_custom,
            APPSERVER_DBACCESS_DATABASE: config.dbaccess_database_profile,
            APPSERVER_DBACCESS_SERVER: 'totvs_dbaccess',
            APPSERVER_DBACCESS_PORT: 7890,
            APPSERVER_DBACCESS_ALIAS: config.dbaccess_database_alias,
            APPSERVER_CONSOLEFILE: config.appserver_consolefile,
            APPSERVER_MULTIPROTOCOLPORTSECURE: config.appserver_multiprotocolportsecure,
            APPSERVER_MULTIPROTOCOLPORT: config.appserver_multiprotocolport,
            APPSERVER_LICENSE_SERVER: config.licenseserver_container_name,
            APPSERVER_LICENSE_PORT: config.license_port,
            APPSERVER_PORT: port,
            APPSERVER_WEB_PORT: webPort,
            APPSERVER_REST_PORT: restPort,
            APPSERVER_WEB_MANAGER: webManager,
            EXTRACT_RESOURCES: 'true',
            TZ: config.timezone
        },
        volumes: volumes,
        networks: [config.network_name],
        depends_on: {
            licenseserver: { condition: 'service_started' },
            dbaccess: { condition: 'service_healthy' }
        }
    };
}
