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
        image: `juliansantosinfo/totvs_licenseserver:${config.licenseserver_version}`,
        container_name: config.licenseserver_container_name,
        restart: config.restart_policy,
        ulimits: {
            nofile: {
                soft: 65536,
                hard: 65536
            }
        },
        environment: {
            LICENSE_TCP_PORT: config.license_tcp_port,
            LICENSE_CONSOLEFILE: config.license_consolefile,
            LICENSE_PORT: config.license_port,
            LICENSE_WEBAPP_PORT: config.license_webapp_port,
            TZ: config.timezone
        },
        networks: [config.network_name]
    };
    
    // Add port mappings if expose_ports is enabled
    if (config.licenseserver_expose_ports) {
        service.ports = [
            `${config.license_tcp_port_external}:${config.license_tcp_port}`,
            `${config.license_port_external}:${config.license_port}`,
            `${config.license_webapp_port_external}:${config.license_webapp_port}`
        ];
    }
    
    return service;
}
