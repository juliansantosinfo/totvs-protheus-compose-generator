// Generator function to create docker-compose YAML
function generateDockerCompose(config) {
    const dbService = config.database_type === 'postgresql' ? 'postgres' : 'mssql';
    const dbContainer = config.database_type === 'postgresql' ? config.postgres_container_name : config.mssql_container_name;
    const dbInternalPort = config.database_type === 'postgresql' ? 5432 : 1433;
    const dbExternalPort = config.database_type === 'postgresql' ? config.postgres_external_port : config.mssql_external_port;
    const dbVolumeName = config.database_type === 'postgresql' ? config.postgres_volume_name : config.mssql_volume_name;
    const dbVolumeBind = config.database_type === 'postgresql' ? config.postgres_volume_bind : config.mssql_volume_bind;
    const dbVolumePath = config.database_type === 'postgresql' ? '/var/lib/postgresql/data' : '/var/opt/mssql/data';
    
    const composeDict = {
        version: '3.8',
        services: {}
    };
    
    // Database Service (only if not using external)
    if (!config.use_external_database) {
        if (config.database_type === 'postgresql') {
        const postgresVolume = config.postgres_volume_bind ? 
            `${config.postgres_volume_bind}:${dbVolumePath}` : 
            `${config.postgres_volume_name}:${dbVolumePath}`;
            
        composeDict.services.postgres = {
            image: `juliansantosinfo/totvs_postgres:${config.appserver_release}`,
            container_name: config.postgres_container_name,
            user: 'root',
            restart: config.restart_policy,
            ports: [`${dbExternalPort}:${dbInternalPort}`],
            environment: {
                POSTGRES_USER: config.postgres_user,
                POSTGRES_PASSWORD: config.postgres_password,
                POSTGRES_DB: config.postgres_db,
                POSTGRES_INITDB_ARGS: config.postgres_initdb_args,
                TZ: config.timezone
            },
            volumes: [postgresVolume],
            networks: [config.network_name],
            healthcheck: {
                test: ['CMD-SHELL', `pg_isready -U ${config.postgres_user} -d ${config.postgres_db}`],
                interval: '10s',
                timeout: '5s',
                retries: 5,
                start_period: '10s'
            }
        };
    } else {
        const mssqlVolume = config.mssql_volume_bind ? 
            `${config.mssql_volume_bind}:${dbVolumePath}` : 
            `${config.mssql_volume_name}:${dbVolumePath}`;
            
        composeDict.services.mssql = {
            image: `juliansantosinfo/totvs_mssql:${config.appserver_release}`,
            container_name: config.mssql_container_name,
            user: 'root',
            restart: config.restart_policy,
            ports: [`${dbExternalPort}:${dbInternalPort}`],
            environment: {
                SA_PASSWORD: config.mssql_sa_password,
                ACCEPT_EULA: config.mssql_accept_eula,
                TZ: config.timezone
            },
            volumes: [mssqlVolume],
            networks: [config.network_name],
            healthcheck: {
                test: ['CMD', '/opt/mssql-tools18/bin/sqlcmd', '-S', 'localhost', '-U', 'sa', '-P', config.mssql_sa_password, '-C', '-Q', 'SELECT 1'],
                interval: '10s',
                timeout: '10s',
                retries: 10,
                start_period: '10s'
            }
        };
    }
    }
    
    // License Server
    const licenseServerDict = {
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
    
    if (config.licenseserver_expose_ports) {
        licenseServerDict.ports = [
            `${config.license_tcp_port_external}:${config.license_tcp_port}`,
            `${config.license_port_external}:${config.license_port}`,
            `${config.license_webapp_port_external}:${config.license_webapp_port}`
        ];
    }
    
    composeDict.services.licenseserver = licenseServerDict;
    
    // DBAccess
    const dbAccessDict = {
        image: `juliansantosinfo/totvs_dbaccess:${config.dbaccess_version}`,
        container_name: config.dbaccess_container_name,
        restart: config.restart_policy,
        environment: {
            DATABASE_PROFILE: config.dbaccess_database_profile,
            DATABASE_SERVER: config.dbaccess_database_server,
            DATABASE_PORT: config.dbaccess_database_port,
            DATABASE_ALIAS: config.dbaccess_database_alias,
            DATABASE_NAME: config.dbaccess_database_name,
            DATABASE_USERNAME: config.dbaccess_database_username,
            DATABASE_PASSWORD: config.dbaccess_database_password,
            DBACCESS_LICENSE_SERVER: config.licenseserver_container_name,
            DBACCESS_LICENSE_PORT: config.license_port,
            DBACCESS_CONSOLEFILE: config.dbaccess_consolefile,
            TZ: config.timezone
        },
        networks: [config.network_name],
        depends_on: {},
        healthcheck: {
            test: ['CMD', 'isql', '-b', config.dbaccess_database_alias, config.dbaccess_database_username, config.dbaccess_database_password],
            interval: '10s',
            timeout: '10s',
            retries: 10,
            start_period: '10s'
        }
    };
    
    // Only add database dependency if not using external
    if (!config.use_external_database) {
        dbAccessDict.depends_on[dbService] = { condition: 'service_healthy' };
    }
    dbAccessDict.depends_on.licenseserver = { condition: 'service_started' };
    
    if (config.dbaccess_expose_ports) {
        dbAccessDict.ports = [
            `${config.dbaccess_port_7890}:7890`,
            `${config.dbaccess_port_7891}:7891`
        ];
    }
    
    composeDict.services.dbaccess = dbAccessDict;
    
    // AppServer
    const appserverVolume = config.appserver_volume_bind ? 
        `${config.appserver_volume_bind}:/totvs/protheus_data` : 
        `${config.appserver_volume_name}:/totvs/protheus_data`;
        
    composeDict.services.appserver = {
        image: `juliansantosinfo/totvs_appserver:${config.appserver_release}`,
        container_name: config.appserver_container_name,
        restart: config.restart_policy,
        ports: [
            `${config.appserver_port}:${config.appserver_port}`,
            `${config.appserver_web_port}:${config.appserver_web_port}`,
            `${config.appserver_rest_port}:${config.appserver_rest_port}`,
            `${config.appserver_web_manager}:${config.appserver_web_manager}`
        ],
        ulimits: {
            nofile: {
                soft: 65536,
                hard: 65536
            }
        },
        environment: {
            APPSERVER_MODE: 'application',
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
            APPSERVER_PORT: config.appserver_port,
            APPSERVER_WEB_PORT: config.appserver_web_port,
            APPSERVER_REST_PORT: config.appserver_rest_port,
            APPSERVER_WEB_MANAGER: config.appserver_web_manager,
            EXTRACT_RESOURCES: 'true',
            TZ: config.timezone
        },
        volumes: [appserverVolume],
        networks: [config.network_name],
        depends_on: {
            licenseserver: { condition: 'service_started' },
            dbaccess: { condition: 'service_healthy' }
        }
    };
    
    // Add optional volumes for AppServer
    if (config.appserver_enable_volume_apo) {
        if (config.appserver_volume_apo_bind) {
            composeDict.services.appserver.volumes.push(`${config.appserver_volume_apo_bind}:/totvs/protheus/apo`);
        } else {
            composeDict.services.appserver.volumes.push(`${config.appserver_volume_apo}:/totvs/protheus/apo`);
        }
    }
    if (config.appserver_enable_volume_logs) {
        if (config.appserver_volume_logs_bind) {
            composeDict.services.appserver.volumes.push(`${config.appserver_volume_logs_bind}:/totvs/protheus/bin/appserver`);
        } else {
            composeDict.services.appserver.volumes.push(`${config.appserver_volume_logs}:/totvs/protheus/bin/appserver`);
        }
    }
    
    // AppRest (optional)
    if (config.include_rest_server) {
        composeDict.services.apprest = {
            image: `juliansantosinfo/totvs_appserver:${config.appserver_release}`,
            container_name: config.apprest_container_name,
            restart: config.restart_policy,
            ports: [
                `${config.apprest_port}:${config.apprest_port}`,
                `${config.apprest_web_port}:${config.apprest_web_port}`,
                `${config.apprest_rest_port}:${config.apprest_rest_port}`,
                `${config.apprest_web_manager}:${config.apprest_web_manager}`
            ],
            ulimits: {
                nofile: {
                    soft: 65536,
                    hard: 65536
                }
            },
            environment: {
                APPSERVER_MODE: 'rest',
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
                APPSERVER_PORT: config.apprest_port,
                APPSERVER_WEB_PORT: config.apprest_web_port,
                APPSERVER_REST_PORT: config.apprest_rest_port,
                APPSERVER_WEB_MANAGER: config.apprest_web_manager,
                EXTRACT_RESOURCES: 'true',
                TZ: config.timezone
            },
            volumes: [appserverVolume],
            networks: [config.network_name],
            depends_on: {
                licenseserver: { condition: 'service_started' },
                dbaccess: { condition: 'service_healthy' }
            }
        };
        
        // Add optional volumes for AppRest (independent or shared)
        if (config.apprest_enable_volume_apo) {
            if (config.apprest_volume_apo_bind) {
                composeDict.services.apprest.volumes.push(`${config.apprest_volume_apo_bind}:/totvs/protheus/apo`);
            } else {
                composeDict.services.apprest.volumes.push(`${config.apprest_volume_apo}:/totvs/protheus/apo`);
            }
        } else if (config.appserver_enable_volume_apo) {
            // Share AppServer APO volume if not using independent
            if (config.appserver_volume_apo_bind) {
                composeDict.services.apprest.volumes.push(`${config.appserver_volume_apo_bind}:/totvs/protheus/apo`);
            } else {
                composeDict.services.apprest.volumes.push(`${config.appserver_volume_apo}:/totvs/protheus/apo`);
            }
        }
        
        if (config.apprest_enable_volume_logs) {
            if (config.apprest_volume_logs_bind) {
                composeDict.services.apprest.volumes.push(`${config.apprest_volume_logs_bind}:/totvs/protheus/bin/appserver`);
            } else {
                composeDict.services.apprest.volumes.push(`${config.apprest_volume_logs}:/totvs/protheus/bin/appserver`);
            }
        } else if (config.appserver_enable_volume_logs) {
            // Share AppServer Logs volume if not using independent
            if (config.appserver_volume_logs_bind) {
                composeDict.services.apprest.volumes.push(`${config.appserver_volume_logs_bind}:/totvs/protheus/bin/appserver`);
            } else {
                composeDict.services.apprest.volumes.push(`${config.appserver_volume_logs}:/totvs/protheus/bin/appserver`);
            }
        }
    }
    
    // Volumes
    const volumesDict = {};
    
    // Add database volume only if not using bind mount and not external
    if (!config.use_external_database && !dbVolumeBind) {
        volumesDict[dbVolumeName] = { driver: 'local' };
    }
    
    // Add appserver volume only if not using bind mount
    if (!config.appserver_volume_bind) {
        volumesDict[config.appserver_volume_name] = { driver: 'local' };
    }
    
    // Add apprest volumes only if using independent volumes and not bind mounts
    if (config.include_rest_server) {
        if (config.apprest_enable_volume_apo && !config.apprest_volume_apo_bind) {
            volumesDict[config.apprest_volume_apo] = { driver: 'local' };
        }
        if (config.apprest_enable_volume_logs && !config.apprest_volume_logs_bind) {
            volumesDict[config.apprest_volume_logs] = { driver: 'local' };
        }
    }
    
    // Only add volumes if not using bind mounts
    if (config.appserver_enable_volume_apo && !config.appserver_volume_apo_bind) {
        volumesDict[config.appserver_volume_apo] = { driver: 'local' };
    }
    if (config.appserver_enable_volume_logs && !config.appserver_volume_logs_bind) {
        volumesDict[config.appserver_volume_logs] = { driver: 'local' };
    }
    
    composeDict.volumes = volumesDict;
    
    // Networks
    composeDict.networks = {};
    composeDict.networks[config.network_name] = { driver: 'bridge' };
    
    return jsyaml.dump(composeDict, { lineWidth: -1, noRefs: true });
}
