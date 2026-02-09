/**
 * @fileoverview TOTVS License Server service configuration generator
 * @module services/licenseserver
 * @description Generates Docker Compose configuration for TOTVS License Server
 */

/**
 * Generate License Server service configuration
 * @param {Object} config - Full configuration object
 * @returns {Object} License Server service configuration for Docker Compose
 * @description Creates License Server service definition including:
 * - Docker image with version tag
 * - Container name and restart policy
 * - Optional port mappings (if expose_ports is enabled)
 * - Environment variables (ports, console file, timezone)
 * - Network configuration
 * - Ulimits for file descriptors
 */
function generateLicenseServerService(config) {
    const service = {
        image: `juliansantosinfo/totvs_licenseserver:${val(config.licenseserver_version, 'LICENSESERVER_VERSION')}`,
        container_name: val(config.licenseserver_container_name, 'LICENSESERVER_CONTAINER_NAME'),
        restart: val(config.restart_policy, 'RESTART_POLICY'),
        ulimits: {
            nofile: {
                soft: 65536,
                hard: 65536
            }
        },
        environment: {
            LICENSE_TCP_PORT: val(config.license_tcp_port, 'LICENSE_TCP_PORT'),
            LICENSE_CONSOLEFILE: val(config.license_consolefile, 'LICENSE_CONSOLEFILE'),
            LICENSE_PORT: val(config.license_port, 'LICENSE_PORT'),
            LICENSE_WEBAPP_PORT: val(config.license_webapp_port, 'LICENSE_WEBAPP_PORT'),
            TZ: val(config.timezone, 'TZ')
        },
        networks: [val(config.network_name, 'NETWORK_NAME')]
    };
    
    // Add port mappings if expose_ports is enabled
    if (config.licenseserver_expose_ports) {
        service.ports = [
            `${val(config.license_tcp_port_external, 'LICENSE_TCP_PORT_EXTERNAL')}:${val(config.license_tcp_port, 'LICENSE_TCP_PORT')}`,
            `${val(config.license_port_external, 'LICENSE_PORT_EXTERNAL')}:${val(config.license_port, 'LICENSE_PORT')}`,
            `${val(config.license_webapp_port_external, 'LICENSE_WEBAPP_PORT_EXTERNAL')}:${val(config.license_webapp_port, 'LICENSE_WEBAPP_PORT')}`
        ];
    }
    
    return service;
}
