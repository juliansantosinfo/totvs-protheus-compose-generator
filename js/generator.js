/**
 * @fileoverview Main entry point for TOTVS Protheus Docker Compose Generator
 * @description Modular architecture for generating docker-compose.yaml and .env files
 * 
 * @architecture
 * - js/utils/helpers.js - Utility functions (val, getDatabaseConfig, formatVolume)
 * - js/services/*.js - Individual service generators (postgres, mssql, licenseserver, etc)
 * - js/generators/compose.js - Main Docker Compose orchestrator
 * - js/generators/env.js - Environment file generator
 * 
 * @usage
 * Include this file in index.html after js-yaml:
 * <script src="js/generator.js"></script>
 * 
 * @exports generateDockerCompose(config) - Returns docker-compose.yaml string
 * @exports generateEnvFile(config) - Returns .env file string
 */

// This file serves as the main entry point and loads all modules in correct order
// All module files are loaded via script tags in index.html
