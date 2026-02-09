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
        image: `juliansantosinfo/totvs_appserver:${val(config.appserver_release, 'APPSERVER_RELEASE')}`,
        container_name: val(containerName, isRest ? 'APPREST_CONTAINER_NAME' : 'APPSERVER_CONTAINER_NAME'),
        restart: val(config.restart_policy, 'RESTART_POLICY'),
        ports: [
            `${val(port, isRest ? 'APPREST_PORT' : 'APPSERVER_PORT')}:${val(port, isRest ? 'APPREST_PORT' : 'APPSERVER_PORT')}`,
            `${val(webPort, isRest ? 'APPREST_WEB_PORT' : 'APPSERVER_WEB_PORT')}:${val(webPort, isRest ? 'APPREST_WEB_PORT' : 'APPSERVER_WEB_PORT')}`,
            `${val(restPort, isRest ? 'APPREST_REST_PORT' : 'APPSERVER_REST_PORT')}:${val(restPort, isRest ? 'APPREST_REST_PORT' : 'APPSERVER_REST_PORT')}`,
            `${val(webManager, isRest ? 'APPREST_WEB_MANAGER' : 'APPSERVER_WEB_MANAGER')}:${val(webManager, isRest ? 'APPREST_WEB_MANAGER' : 'APPSERVER_WEB_MANAGER')}`
        ],
        ulimits: {
            nofile: {
                soft: 65536,
                hard: 65536
            }
        },
        environment: {
            APPSERVER_MODE: mode,
            APPSERVER_RPO_CUSTOM: val(config.appserver_rpo_custom, 'APPSERVER_RPO_CUSTOM'),
            APPSERVER_DBACCESS_DATABASE: val(config.dbaccess_database_profile, 'DBACCESS_DATABASE_PROFILE'),
            APPSERVER_DBACCESS_SERVER: 'totvs_dbaccess',
            APPSERVER_DBACCESS_PORT: 7890,
            APPSERVER_DBACCESS_ALIAS: val(config.dbaccess_database_alias, 'DBACCESS_DATABASE_ALIAS'),
            APPSERVER_CONSOLEFILE: val(config.appserver_consolefile, 'APPSERVER_CONSOLEFILE'),
            APPSERVER_MULTIPROTOCOLPORTSECURE: val(config.appserver_multiprotocolportsecure, 'APPSERVER_MULTIPROTOCOLPORTSECURE'),
            APPSERVER_MULTIPROTOCOLPORT: val(config.appserver_multiprotocolport, 'APPSERVER_MULTIPROTOCOLPORT'),
            APPSERVER_LICENSE_SERVER: val(config.licenseserver_container_name, 'LICENSESERVER_CONTAINER_NAME'),
            APPSERVER_LICENSE_PORT: val(config.license_port, 'LICENSE_PORT'),
            APPSERVER_PORT: val(port, isRest ? 'APPREST_PORT' : 'APPSERVER_PORT'),
            APPSERVER_WEB_PORT: val(webPort, isRest ? 'APPREST_WEB_PORT' : 'APPSERVER_WEB_PORT'),
            APPSERVER_REST_PORT: val(restPort, isRest ? 'APPREST_REST_PORT' : 'APPSERVER_REST_PORT'),
            APPSERVER_WEB_MANAGER: val(webManager, isRest ? 'APPREST_WEB_MANAGER' : 'APPSERVER_WEB_MANAGER'),
            EXTRACT_RESOURCES: 'true',
            TZ: val(config.timezone, 'TZ')
        },
        volumes: volumes,
        networks: [val(config.network_name, 'NETWORK_NAME')],
        depends_on: {
            licenseserver: { condition: 'service_started' },
            dbaccess: { condition: 'service_healthy' }
        }
    };
}
