/**
 * @fileoverview Environment file (.env) generator
 * @module generators/env
 * @description Generates .env file with all configuration variables
 */

/**
 * Generate .env file content
 * @param {Object} config - Full configuration object
 * @returns {string} Complete .env file content
 * @description Generates environment file with sections:
 * - Header with generation timestamp
 * - Network configuration
 * - Database configuration (internal or external)
 * - DBAccess configuration
 * - License Server configuration
 * - AppServer configuration
 * - AppRest configuration (if enabled)
 * - SmartView configuration (if enabled)
 */
function generateEnvFile(config) {
    let content = generateEnvHeader();
    content += generateNetworkEnv(config);
    content += generateDatabaseEnv(config);
    content += generateDbAccessEnv(config);
    content += generateLicenseServerEnv(config);
    content += generateAppServerEnv(config);
    
    if (config.include_rest_server) {
        content += generateAppRestEnv(config);
    }
    
    if (config.include_smartview) {
        content += generateSmartViewEnv(config);
    }
    
    return content;
}

/**
 * Generate .env file header
 * @returns {string} Header section with timestamp
 */
function generateEnvHeader() {
    return `# TOTVS Protheus Docker Compose - Environment Variables
# Generated on ${new Date().toISOString()}

`;
}

/**
 * Generate network configuration section
 * @param {Object} config - Configuration object
 * @returns {string} Network environment variables
 */
function generateNetworkEnv(config) {
    return `# Network Configuration
NETWORK_NAME=${config.network_name}
RESTART_POLICY=${config.restart_policy}
DEBUG_SCRIPT=${config.debug_script}
TZ=${config.timezone}

`;
}

/**
 * Generate database configuration section
 * @param {Object} config - Configuration object
 * @returns {string} Database environment variables
 */
function generateDatabaseEnv(config) {
    if (config.use_external_database) {
        return `# External Database Configuration
EXTERNAL_DB_HOST=${config.external_db_host}
EXTERNAL_DB_PORT=${config.external_db_port}
EXTERNAL_DB_USERNAME=${config.external_db_username}
EXTERNAL_DB_PASSWORD=${config.external_db_password}

`;
    }
    
    if (config.database_type === 'postgresql') {
        return `# PostgreSQL Configuration
POSTGRES_CONTAINER_NAME=${config.postgres_container_name}
POSTGRES_USER=${config.postgres_user}
POSTGRES_PASSWORD=${config.postgres_password}
POSTGRES_DB=${config.postgres_db}
POSTGRES_INITDB_ARGS=${config.postgres_initdb_args}
POSTGRES_EXTERNAL_PORT=${config.postgres_external_port}
POSTGRES_VOLUME_NAME=${config.postgres_volume_name}
${config.postgres_volume_bind ? `POSTGRES_VOLUME_BIND=${config.postgres_volume_bind}` : '# POSTGRES_VOLUME_BIND='}
RESTORE_BACKUP=${config.postgres_restore_backup ? 'Y' : 'N'}

`;
    } else if (config.database_type === 'oracle') {
        return `# Oracle Configuration
ORACLE_CONTAINER_NAME=${config.oracle_container_name}
ORACLE_PASSWORD=${config.oracle_password}
ORACLE_EXTERNAL_PORT=${config.oracle_external_port}
ORACLE_VOLUME_NAME=${config.oracle_volume_name}
${config.oracle_volume_bind ? `ORACLE_VOLUME_BIND=${config.oracle_volume_bind}` : '# ORACLE_VOLUME_BIND='}
RESTORE_BACKUP=${config.oracle_restore_backup ? 'Y' : 'N'}

`;
    } else {
        return `# MSSQL Configuration
MSSQL_CONTAINER_NAME=${config.mssql_container_name}
MSSQL_SA_PASSWORD=${config.mssql_sa_password}
MSSQL_ACCEPT_EULA=${config.mssql_accept_eula}
MSSQL_EXTERNAL_PORT=${config.mssql_external_port}
MSSQL_VOLUME_NAME=${config.mssql_volume_name}
${config.mssql_volume_bind ? `MSSQL_VOLUME_BIND=${config.mssql_volume_bind}` : '# MSSQL_VOLUME_BIND='}
RESTORE_BACKUP=${config.mssql_restore_backup ? 'Y' : 'N'}

`;
    }
}

/**
 * Generate DBAccess configuration section
 * @param {Object} config - Configuration object
 * @returns {string} DBAccess environment variables
 */
function generateDbAccessEnv(config) {
    return `# DBAccess Configuration
DBACCESS_CONTAINER_NAME=${config.dbaccess_container_name}
DBACCESS_VERSION=${config.dbaccess_version}
DBACCESS_DATABASE_PROFILE=${config.dbaccess_database_profile}
DBACCESS_DATABASE_SERVER=${config.dbaccess_database_server}
DBACCESS_DATABASE_PORT=${config.dbaccess_database_port}
DBACCESS_DATABASE_ALIAS=${config.dbaccess_database_alias}
DBACCESS_DATABASE_NAME=${config.dbaccess_database_name}
DBACCESS_DATABASE_USERNAME=${config.dbaccess_database_username}
DBACCESS_DATABASE_PASSWORD=${config.dbaccess_database_password}
DBACCESS_CONSOLEFILE=${config.dbaccess_consolefile}
${config.dbaccess_expose_ports ? `DBACCESS_PORT_7890=${config.dbaccess_port_7890}\nDBACCESS_PORT_7891=${config.dbaccess_port_7891}` : '# DBACCESS_EXPOSE_PORTS=false'}

`;
}

/**
 * Generate License Server configuration section
 * @param {Object} config - Configuration object
 * @returns {string} License Server environment variables
 */
function generateLicenseServerEnv(config) {
    return `# License Server Configuration
LICENSESERVER_CONTAINER_NAME=${config.licenseserver_container_name}
LICENSESERVER_VERSION=${config.licenseserver_version}
LICENSE_TCP_PORT=${config.license_tcp_port}
LICENSE_PORT=${config.license_port}
LICENSE_WEBAPP_PORT=${config.license_webapp_port}
LICENSE_CONSOLEFILE=${config.license_consolefile}
${config.licenseserver_expose_ports ? `LICENSE_TCP_PORT_EXTERNAL=${config.license_tcp_port_external}\nLICENSE_PORT_EXTERNAL=${config.license_port_external}\nLICENSE_WEBAPP_PORT_EXTERNAL=${config.license_webapp_port_external}` : '# LICENSESERVER_EXPOSE_PORTS=false'}

`;
}

/**
 * Generate AppServer configuration section
 * @param {Object} config - Configuration object
 * @returns {string} AppServer environment variables
 */
function generateAppServerEnv(config) {
    return `# AppServer Configuration
APPSERVER_CONTAINER_NAME=${config.appserver_container_name}
APPSERVER_RELEASE=${config.appserver_release}
APPSERVER_PORT=${config.appserver_port}
APPSERVER_WEB_PORT=${config.appserver_web_port}
APPSERVER_REST_PORT=${config.appserver_rest_port}
APPSERVER_WEB_MANAGER=${config.appserver_web_manager}
APPSERVER_RPO_CUSTOM=${config.appserver_rpo_custom}
APPSERVER_CONSOLEFILE=${config.appserver_consolefile}
APPSERVER_MULTIPROTOCOLPORTSECURE=${config.appserver_multiprotocolportsecure}
APPSERVER_MULTIPROTOCOLPORT=${config.appserver_multiprotocolport}
APPSERVER_VOLUME_NAME=${config.appserver_volume_name}
${config.appserver_volume_bind ? `APPSERVER_VOLUME_BIND=${config.appserver_volume_bind}` : '# APPSERVER_VOLUME_BIND='}
${config.appserver_enable_volume_apo ? `APPSERVER_VOLUME_APO=${config.appserver_volume_apo}\n${config.appserver_volume_apo_bind ? `APPSERVER_VOLUME_APO_BIND=${config.appserver_volume_apo_bind}` : '# APPSERVER_VOLUME_APO_BIND='}` : '# APPSERVER_ENABLE_VOLUME_APO=false'}
${config.appserver_enable_volume_logs ? `APPSERVER_VOLUME_LOGS=${config.appserver_volume_logs}\n${config.appserver_volume_logs_bind ? `APPSERVER_VOLUME_LOGS_BIND=${config.appserver_volume_logs_bind}` : '# APPSERVER_VOLUME_LOGS_BIND='}` : '# APPSERVER_ENABLE_VOLUME_LOGS=false'}

`;
}

/**
 * Generate AppRest configuration section
 * @param {Object} config - Configuration object
 * @returns {string} AppRest environment variables
 */
function generateAppRestEnv(config) {
    return `# AppRest Configuration
APPREST_CONTAINER_NAME=${config.apprest_container_name}
APPREST_PORT=${config.apprest_port}
APPREST_WEB_PORT=${config.apprest_web_port}
APPREST_REST_PORT=${config.apprest_rest_port}
${config.apprest_enable_volume_apo ? `APPREST_VOLUME_APO=${config.apprest_volume_apo}\n${config.apprest_volume_apo_bind ? `APPREST_VOLUME_APO_BIND=${config.apprest_volume_apo_bind}` : '# APPREST_VOLUME_APO_BIND='}` : '# APPREST_ENABLE_VOLUME_APO=false'}
${config.apprest_enable_volume_logs ? `APPREST_VOLUME_LOGS=${config.apprest_volume_logs}\n${config.apprest_volume_logs_bind ? `APPREST_VOLUME_LOGS_BIND=${config.apprest_volume_logs_bind}` : '# APPREST_VOLUME_LOGS_BIND='}` : '# APPREST_ENABLE_VOLUME_LOGS=false'}

`;
}

/**
 * Generate SmartView configuration section
 * @param {Object} config - Configuration object
 * @returns {string} SmartView environment variables
 */
function generateSmartViewEnv(config) {
    return `# SmartView Configuration
SMARTVIEW_CONTAINER_NAME=${config.smartview_container_name}
SMARTVIEW_VERSION=${config.smartview_version}
SMARTVIEW_APP_PORT=${config.smartview_app_port}
SMARTVIEW_CONFIG_PORT=${config.smartview_config_port}
SMARTVIEW_REST_SERVER=${config.smartview_rest_server}
SMARTVIEW_REST_PORT=${config.smartview_rest_port}
SMARTVIEW_DISCOVERY_URL=${config.smartview_discovery_url}

`;
}
