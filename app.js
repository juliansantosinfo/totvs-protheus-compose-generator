// Utility Functions
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    
    if (field.type === 'password') {
        field.type = 'text';
        button.textContent = '🙈';
    } else {
        field.type = 'password';
        button.textContent = '👁️';
    }
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    body.classList.toggle('light-theme');
    
    if (body.classList.contains('light-theme')) {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark';
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light';
        localStorage.setItem('theme', 'dark');
    }
}

function showAlert(type, message) {
    const alert = type === 'success' ? successAlert : errorAlert;
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

function closeModal() {
    composeModal.style.display = 'none';
}

// Port Conflict Validation
function validatePorts() {
    const ports = new Map();
    const portInputs = document.querySelectorAll('input[type="number"]');
    let hasConflict = false;
    
    // Clear previous warnings
    document.querySelectorAll('.port-warning').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.port-conflict').forEach(el => el.classList.remove('port-conflict'));
    
    portInputs.forEach(input => {
        const port = parseInt(input.value);
        if (port && input.name.includes('port') && !input.name.includes('internal')) {
            const parent = input.closest('.section');
            const serviceName = parent?.querySelector('.section-title')?.textContent || 'Unknown';
            
            if (ports.has(port)) {
                hasConflict = true;
                input.classList.add('port-conflict');
                const warning = input.nextElementSibling;
                if (warning && warning.classList.contains('port-warning')) {
                    warning.textContent = `Conflito com ${ports.get(port)}`;
                    warning.style.display = 'block';
                }
            } else {
                ports.set(port, serviceName);
            }
        }
    });
    
    return !hasConflict;
}

// Docker Commands Generator
function generateDockerCommands(config) {
    const dbService = config.database_type === 'postgresql' ? 'postgres' : 'mssql';
    const services = ['licenseserver', 'dbaccess', 'appserver'];
    if (config.include_rest_server) services.push('apprest');
    if (config.include_smartview) services.push('smartview');
    
    let commands = `# Iniciar todos os serviços
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f appserver

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Reiniciar um serviço
docker-compose restart appserver

# Ver status dos containers
docker-compose ps

# Acessar shell do AppServer
docker exec -it ${config.appserver_container_name} bash`;

    if (!config.use_external_database) {
        commands += `

# Acessar banco de dados
docker exec -it ${config.database_type === 'postgresql' ? config.postgres_container_name : config.mssql_container_name} ${config.database_type === 'postgresql' ? 'psql -U postgres' : '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C'}

# Backup do volume de dados (exemplo)
docker run --rm -v ${config.database_type === 'postgresql' ? config.postgres_volume_name : config.mssql_volume_name}:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data`;
    } else {
        commands += `

# Nota: Usando banco de dados externo em ${config.external_db_host}:${config.external_db_port}`;
    }

    if (config.include_smartview) {
        commands += `

# Acessar SmartView
# Aplicação: http://localhost:${config.smartview_app_port}
# Configuração: http://localhost:${config.smartview_config_port}`;
    }

    commands += `

# Ver uso de recursos
docker stats`;

    return commands;
}

// Database Configuration Update
function updateDatabaseConfig() {
    const isPostgres = databaseTypeSelect.value === 'postgresql';
    const isExternal = useExternalDatabase.checked;
    
    postgresConfig.style.display = !isExternal && isPostgres ? 'block' : 'none';
    mssqlConfig.style.display = !isExternal && !isPostgres ? 'block' : 'none';
    
    if (isExternal) {
        dbAccessProfile.value = isPostgres ? 'POSTGRES' : 'MSSQL';
        dbAccessServer.value = externalDbHost.value || '';
        dbAccessPort.value = externalDbPort.value || (isPostgres ? '5432' : '1433');
        dbAccessUsername.value = externalDbUsername.value || (isPostgres ? 'postgres' : 'sa');
        dbAccessPassword.value = externalDbPassword.value || '';
    } else {
        dbAccessProfile.value = isPostgres ? 'POSTGRES' : 'MSSQL';
        dbAccessServer.value = isPostgres ? postgresContainerName.value : mssqlContainerName.value;
        dbAccessPort.value = isPostgres ? '5432' : '1433';
        dbAccessUsername.value = isPostgres ? 'postgres' : 'sa';
        dbAccessPassword.value = isPostgres ? postgresPassword.value : mssqlPassword.value;
    }
}

// Global Variables
let currentConfig = null;
let currentYaml = null;
let form, composeModal, outputBox, commandsBox, downloadBtn, loading, successAlert, errorAlert;
let includeRestCheckbox, restServerConfig, apprestEnableVolumeApo, apprestVolumeApoConfig;
let apprestEnableVolumeLogs, apprestVolumeLogsConfig, databaseTypeSelect, postgresConfig, mssqlConfig;
let dbAccessProfile, dbAccessServer, dbAccessPort, dbAccessUsername, dbAccessPassword;
let postgresPassword, mssqlPassword, postgresContainerName, mssqlContainerName;
let includeSmartviewCheckbox, smartviewConfig, smartviewRestServer, smartviewRestPort, smartviewDiscoveryUrl;
let apprestContainerName, apprestRestPort, useExternalDatabase, externalDatabaseConfig;
let externalDbHost, externalDbPort, externalDbUsername, externalDbPassword;
let enableVolumeApo, volumeApoConfig, enableVolumeLogs, volumeLogsConfig;
let dbAccessExposePorts, dbAccessPortsConfig, licenseServerExposePorts, licenseServerPortsConfig;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('themeIcon').textContent = '🌙';
        document.getElementById('themeText').textContent = 'Dark';
    }
    
    // Initialize DOM elements
    form = document.getElementById('configForm');
    composeModal = document.getElementById('composeModal');
    outputBox = document.getElementById('outputBox');
    commandsBox = document.getElementById('commandsBox');
    downloadBtn = document.getElementById('downloadBtn');
    loading = document.getElementById('loading');
    successAlert = document.getElementById('successAlert');
    errorAlert = document.getElementById('errorAlert');
    includeRestCheckbox = document.getElementById('include_rest_server');
    restServerConfig = document.getElementById('restServerConfig');
    apprestEnableVolumeApo = document.getElementById('apprest_enable_volume_apo');
    apprestVolumeApoConfig = document.getElementById('apprestVolumeApoConfig');
    apprestEnableVolumeLogs = document.getElementById('apprest_enable_volume_logs');
    apprestVolumeLogsConfig = document.getElementById('apprestVolumeLogsConfig');
    databaseTypeSelect = document.getElementById('database_type');
    postgresConfig = document.getElementById('postgresConfig');
    mssqlConfig = document.getElementById('mssqlConfig');
    dbAccessProfile = document.getElementById('dbaccess_database_profile');
    dbAccessServer = document.getElementById('dbaccess_database_server');
    dbAccessPort = document.getElementById('dbaccess_database_port');
    dbAccessUsername = document.getElementById('dbaccess_database_username');
    dbAccessPassword = document.getElementById('dbaccess_database_password');
    postgresPassword = document.getElementById('postgres_password');
    mssqlPassword = document.getElementById('mssql_sa_password');
    postgresContainerName = document.getElementById('postgres_container_name');
    mssqlContainerName = document.getElementById('mssql_container_name');
    includeSmartviewCheckbox = document.getElementById('include_smartview');
    smartviewConfig = document.getElementById('smartviewConfig');
    smartviewRestServer = document.getElementById('smartview_rest_server');
    smartviewRestPort = document.getElementById('smartview_rest_port');
    smartviewDiscoveryUrl = document.getElementById('smartview_discovery_url');
    apprestContainerName = document.getElementById('apprest_container_name');
    apprestRestPort = document.getElementById('apprest_rest_port');
    useExternalDatabase = document.getElementById('use_external_database');
    externalDatabaseConfig = document.getElementById('externalDatabaseConfig');
    externalDbHost = document.getElementById('external_db_host');
    externalDbPort = document.getElementById('external_db_port');
    externalDbUsername = document.getElementById('external_db_username');
    externalDbPassword = document.getElementById('external_db_password');
    enableVolumeApo = document.getElementById('appserver_enable_volume_apo');
    volumeApoConfig = document.getElementById('volumeApoConfig');
    enableVolumeLogs = document.getElementById('appserver_enable_volume_logs');
    volumeLogsConfig = document.getElementById('volumeLogsConfig');
    dbAccessExposePorts = document.getElementById('dbaccess_expose_ports');
    dbAccessPortsConfig = document.getElementById('dbAccessPortsConfig');
    licenseServerExposePorts = document.getElementById('licenseserver_expose_ports');
    licenseServerPortsConfig = document.getElementById('licenseServerPortsConfig');
    
    // Event Listeners
    postgresPassword.addEventListener('input', function() {
        if (databaseTypeSelect.value === 'postgresql') {
            dbAccessPassword.value = this.value;
        }
    });

    mssqlPassword.addEventListener('input', function() {
        if (databaseTypeSelect.value === 'mssql') {
            dbAccessPassword.value = this.value;
        }
    });

    postgresContainerName.addEventListener('input', function() {
        if (databaseTypeSelect.value === 'postgresql') {
            dbAccessServer.value = this.value;
        }
    });

    mssqlContainerName.addEventListener('input', function() {
        if (databaseTypeSelect.value === 'mssql') {
            dbAccessServer.value = this.value;
        }
    });

    includeRestCheckbox.addEventListener('change', function() {
        restServerConfig.style.display = this.checked ? 'block' : 'none';
    });
    
    includeSmartviewCheckbox.addEventListener('change', function() {
        smartviewConfig.style.display = this.checked ? 'block' : 'none';
        if (this.checked) {
            includeRestCheckbox.checked = true;
            includeRestCheckbox.disabled = true;
            restServerConfig.style.display = 'block';
        } else {
            includeRestCheckbox.disabled = false;
        }
    });
    
    apprestContainerName.addEventListener('input', function() {
        smartviewRestServer.value = this.value;
        smartviewDiscoveryUrl.value = `http://${this.value}:${apprestRestPort.value}/rest/.well-known/treports/security`;
    });
    
    apprestRestPort.addEventListener('input', function() {
        smartviewRestPort.value = this.value;
        smartviewDiscoveryUrl.value = `http://${apprestContainerName.value}:${this.value}/rest/.well-known/treports/security`;
    });
    
    apprestEnableVolumeApo.addEventListener('change', function() {
        apprestVolumeApoConfig.style.display = this.checked ? 'block' : 'none';
    });
    
    apprestEnableVolumeLogs.addEventListener('change', function() {
        apprestVolumeLogsConfig.style.display = this.checked ? 'block' : 'none';
    });
    
    enableVolumeApo.addEventListener('change', function() {
        volumeApoConfig.style.display = this.checked ? 'block' : 'none';
    });
    
    enableVolumeLogs.addEventListener('change', function() {
        volumeLogsConfig.style.display = this.checked ? 'block' : 'none';
    });
    
    dbAccessExposePorts.addEventListener('change', function() {
        dbAccessPortsConfig.style.display = this.checked ? 'block' : 'none';
    });
    
    licenseServerExposePorts.addEventListener('change', function() {
        licenseServerPortsConfig.style.display = this.checked ? 'block' : 'none';
    });

    databaseTypeSelect.addEventListener('change', updateDatabaseConfig);
    
    useExternalDatabase.addEventListener('change', function() {
        externalDatabaseConfig.style.display = this.checked ? 'block' : 'none';
        updateDatabaseConfig();
    });
    
    externalDbHost.addEventListener('input', function() {
        if (useExternalDatabase.checked) {
            dbAccessServer.value = this.value;
        }
    });
    
    externalDbPort.addEventListener('input', function() {
        if (useExternalDatabase.checked) {
            dbAccessPort.value = this.value;
        }
    });
    
    externalDbUsername.addEventListener('input', function() {
        if (useExternalDatabase.checked) {
            dbAccessUsername.value = this.value;
        }
    });
    
    externalDbPassword.addEventListener('input', function() {
        if (useExternalDatabase.checked) {
            dbAccessPassword.value = this.value;
        }
    });
    
    // Port validation on input
    document.querySelectorAll('input[type="number"]').forEach(input => {
        if (input.name.includes('port')) {
            input.addEventListener('input', validatePorts);
        }
    });
    
    updateDatabaseConfig();

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate ports before submission
        if (!validatePorts()) {
            showAlert('error', '❌ Conflito de portas detectado! Corrija antes de continuar.');
            return;
        }
        
        dbAccessProfile.disabled = false;
        dbAccessServer.disabled = false;
        dbAccessPort.disabled = false;
        dbAccessUsername.disabled = false;
        dbAccessPassword.disabled = false;
        smartviewRestServer.disabled = false;
        smartviewRestPort.disabled = false;
        
        loading.style.display = 'block';

        const formData = new FormData(form);
        const config = {
            database_type: formData.get('database_type'),
            timezone: formData.get('timezone'),
            include_smartview: formData.get('include_smartview') === 'on',
            include_rest_server: formData.get('include_rest_server') === 'on' || formData.get('include_smartview') === 'on',
            use_external_database: formData.get('use_external_database') === 'on',
            external_db_host: formData.get('external_db_host'),
            external_db_port: parseInt(formData.get('external_db_port')) || (formData.get('database_type') === 'postgresql' ? 5432 : 1433),
            external_db_username: formData.get('external_db_username'),
            external_db_password: formData.get('external_db_password'),
            network_name: formData.get('network_name'),
            restart_policy: formData.get('restart_policy'),
            postgres_container_name: formData.get('postgres_container_name'),
            mssql_container_name: formData.get('mssql_container_name'),
            licenseserver_container_name: formData.get('licenseserver_container_name'),
            dbaccess_container_name: formData.get('dbaccess_container_name'),
            appserver_container_name: formData.get('appserver_container_name'),
            apprest_container_name: formData.get('apprest_container_name'),
            postgres_user: 'postgres',
            postgres_password: formData.get('postgres_password'),
            postgres_db: formData.get('dbaccess_database_name'),
            postgres_initdb_args: '--locale=pt_BR.ISO-8859-1 -E LATIN1',
            postgres_external_port: parseInt(formData.get('postgres_external_port')),
            postgres_volume_name: formData.get('postgres_volume_name'),
            postgres_volume_bind: formData.get('postgres_volume_bind'),
            mssql_sa_password: formData.get('mssql_sa_password'),
            mssql_accept_eula: 'Y',
            mssql_external_port: parseInt(formData.get('mssql_external_port')),
            mssql_volume_name: formData.get('mssql_volume_name'),
            mssql_volume_bind: formData.get('mssql_volume_bind'),
            dbaccess_database_profile: formData.get('dbaccess_database_profile'),
            dbaccess_database_server: formData.get('dbaccess_database_server'),
            dbaccess_database_port: parseInt(formData.get('dbaccess_database_port')),
            dbaccess_database_alias: formData.get('dbaccess_database_alias'),
            dbaccess_database_name: formData.get('dbaccess_database_name'),
            dbaccess_database_username: formData.get('dbaccess_database_username'),
            dbaccess_database_password: formData.get('dbaccess_database_password'),
            dbaccess_consolefile: formData.get('dbaccess_consolefile'),
            dbaccess_version: formData.get('dbaccess_version'),
            dbaccess_expose_ports: formData.get('dbaccess_expose_ports') === 'on',
            dbaccess_port_7890: parseInt(formData.get('dbaccess_port_7890')),
            dbaccess_port_7891: parseInt(formData.get('dbaccess_port_7891')),
            license_tcp_port: parseInt(formData.get('license_tcp_port')),
            license_port: parseInt(formData.get('license_port')),
            license_webapp_port: parseInt(formData.get('license_webapp_port')),
            license_consolefile: formData.get('license_consolefile'),
            licenseserver_version: formData.get('licenseserver_version'),
            licenseserver_expose_ports: formData.get('licenseserver_expose_ports') === 'on',
            license_tcp_port_external: parseInt(formData.get('license_tcp_port_external')),
            license_port_external: parseInt(formData.get('license_port_external')),
            license_webapp_port_external: parseInt(formData.get('license_webapp_port_external')),
            appserver_release: formData.get('appserver_release'),
            appserver_port: parseInt(formData.get('appserver_port')),
            appserver_web_port: parseInt(formData.get('appserver_web_port')),
            appserver_rest_port: parseInt(formData.get('appserver_rest_port')),
            appserver_web_manager: parseInt(formData.get('appserver_web_manager')),
            appserver_rpo_custom: formData.get('appserver_rpo_custom'),
            appserver_consolefile: formData.get('appserver_consolefile'),
            appserver_multiprotocolportsecure: parseInt(formData.get('appserver_multiprotocolportsecure')),
            appserver_multiprotocolport: parseInt(formData.get('appserver_multiprotocolport')),
            appserver_volume_name: formData.get('appserver_volume_name'),
            appserver_volume_bind: formData.get('appserver_volume_bind'),
            appserver_volume_apo: formData.get('appserver_volume_apo'),
            appserver_volume_logs: formData.get('appserver_volume_logs'),
            appserver_enable_volume_apo: formData.get('appserver_enable_volume_apo') === 'on',
            appserver_enable_volume_logs: formData.get('appserver_enable_volume_logs') === 'on',
            appserver_volume_apo_bind: formData.get('appserver_volume_apo_bind'),
            appserver_volume_logs_bind: formData.get('appserver_volume_logs_bind'),
            apprest_port: parseInt(formData.get('apprest_port')),
            apprest_web_port: parseInt(formData.get('apprest_web_port')),
            apprest_rest_port: parseInt(formData.get('apprest_rest_port')),
            apprest_web_manager: parseInt(formData.get('apprest_web_manager')),
            apprest_enable_volume_apo: formData.get('apprest_enable_volume_apo') === 'on',
            apprest_volume_apo: formData.get('apprest_volume_apo'),
            apprest_volume_apo_bind: formData.get('apprest_volume_apo_bind'),
            apprest_enable_volume_logs: formData.get('apprest_enable_volume_logs') === 'on',
            apprest_volume_logs: formData.get('apprest_volume_logs'),
            apprest_volume_logs_bind: formData.get('apprest_volume_logs_bind'),
            smartview_container_name: formData.get('smartview_container_name'),
            smartview_version: formData.get('smartview_version'),
            smartview_app_port: parseInt(formData.get('smartview_app_port')),
            smartview_config_port: parseInt(formData.get('smartview_config_port')),
            smartview_rest_server: formData.get('smartview_rest_server'),
            smartview_rest_port: parseInt(formData.get('smartview_rest_port')),
            smartview_discovery_url: formData.get('smartview_discovery_url')
        };

        try {
            const yamlContent = generateDockerCompose(config);
            
            currentConfig = config;
            currentYaml = yamlContent;
            outputBox.textContent = yamlContent;
            commandsBox.textContent = generateDockerCommands(config);
            composeModal.style.display = 'block';
            showAlert('success', '✅ Docker Compose gerado com sucesso!');
        } catch (error) {
            showAlert('error', '❌ Erro: ' + error.message);
            console.error('Generation error:', error);
        } finally {
            loading.style.display = 'none';
            dbAccessProfile.disabled = true;
            dbAccessServer.disabled = true;
            dbAccessPort.disabled = true;
            dbAccessUsername.disabled = true;
            dbAccessPassword.disabled = true;
            smartviewRestServer.disabled = true;
            smartviewRestPort.disabled = true;
        }
    });

    downloadBtn.addEventListener('click', async () => {
        if (!currentYaml) return;

        try {
            const blob = new Blob([currentYaml], { type: 'application/x-yaml' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `docker-compose-${currentConfig.database_type}.yaml`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showAlert('success', '✅ Download iniciado!');
        } catch (error) {
            showAlert('error', '❌ Erro ao fazer download: ' + error.message);
        }
    });

    window.onclick = function(event) {
        if (event.target === composeModal) {
            closeModal();
        }
    };
});
