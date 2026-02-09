# Modular Generator Architecture

## 📁 Estrutura de Diretórios

```
js/
├── generator.js              # Entry point principal
├── utils/
│   └── helpers.js           # Funções utilitárias
├── services/
│   ├── postgres.js          # Gerador PostgreSQL
│   ├── mssql.js             # Gerador MSSQL
│   ├── licenseserver.js     # Gerador License Server
│   ├── dbaccess.js          # Gerador DBAccess
│   ├── appserver.js         # Gerador AppServer/AppRest
│   └── smartview.js         # Gerador SmartView
└── generators/
    ├── compose.js           # Orquestrador Docker Compose
    └── env.js               # Gerador arquivo .env
```

## 🎯 Responsabilidades dos Módulos

### utils/helpers.js
**Funções utilitárias compartilhadas**
- `val(value, envVar, useEnv)` - Retorna valor ou referência de variável de ambiente
- `getDatabaseConfig(config)` - Extrai configuração do banco de dados
- `formatVolume(volumeName, volumeBind, containerPath)` - Formata string de volume

### services/*.js
**Geradores de serviços individuais**

Cada módulo exporta uma função que recebe a configuração e retorna um objeto de serviço Docker Compose:

- **postgres.js**: `generatePostgresService(config, dbConfig)`
- **mssql.js**: `generateMssqlService(config, dbConfig)`
- **licenseserver.js**: `generateLicenseServerService(config)`
- **dbaccess.js**: `generateDbAccessService(config, dbService)`
- **appserver.js**: `generateAppServerService(config, mode)`
- **smartview.js**: `generateSmartViewService(config)`

### generators/compose.js
**Orquestrador principal**
- `generateDockerCompose(config)` - Função principal que:
  1. Inicializa estrutura do compose
  2. Adiciona serviços condicionalmente
  3. Coleta volumes
  4. Define redes
  5. Converte para YAML

- `collectVolumes(config, dbConfig)` - Coleta todos os volumes nomeados

### generators/env.js
**Gerador de arquivo .env**
- `generateEnvFile(config)` - Função principal
- `generateEnvHeader()` - Cabeçalho com timestamp
- `generateNetworkEnv(config)` - Seção de rede
- `generateDatabaseEnv(config)` - Seção de banco de dados
- `generateDbAccessEnv(config)` - Seção DBAccess
- `generateLicenseServerEnv(config)` - Seção License Server
- `generateAppServerEnv(config)` - Seção AppServer
- `generateAppRestEnv(config)` - Seção AppRest
- `generateSmartViewEnv(config)` - Seção SmartView

## 🔄 Fluxo de Execução

```
index.html (formulário)
    ↓
Coleta FormData
    ↓
generateDockerCompose(config)
    ↓
getDatabaseConfig() → helpers.js
    ↓
generatePostgresService() ou generateMssqlService() → services/
    ↓
generateLicenseServerService() → services/
    ↓
generateDbAccessService() → services/
    ↓
generateAppServerService('application') → services/
    ↓
[opcional] generateAppServerService('rest') → services/
    ↓
[opcional] generateSmartViewService() → services/
    ↓
collectVolumes()
    ↓
jsyaml.dump() → YAML string
```

## 📝 Padrões de Código

### Documentação JSDoc
Todos os módulos e funções devem ter documentação JSDoc completa:

```javascript
/**
 * @fileoverview Descrição do arquivo
 * @module caminho/do/modulo
 * @description Descrição detalhada
 */

/**
 * Descrição da função
 * @param {Type} param - Descrição do parâmetro
 * @returns {Type} Descrição do retorno
 * @description Descrição detalhada do comportamento
 */
function minhaFuncao(param) {
    // implementação
}
```

### Nomenclatura
- **Funções**: camelCase iniciando com verbo (`generateService`, `formatVolume`)
- **Constantes**: UPPER_SNAKE_CASE
- **Variáveis**: camelCase descritivo
- **Arquivos**: lowercase com hífen se necessário

### Estrutura de Retorno
Todos os geradores de serviço retornam objetos compatíveis com Docker Compose spec:

```javascript
{
    image: 'string',
    container_name: 'string',
    restart: 'string',
    ports: ['array'],
    environment: { object },
    volumes: ['array'],
    networks: ['array'],
    depends_on: { object },
    healthcheck: { object }
}
```

## 🧪 Testabilidade

A arquitetura modular facilita testes unitários:

```javascript
// Testar geração de serviço PostgreSQL
const config = { /* mock config */ };
const dbConfig = getDatabaseConfig(config);
const service = generatePostgresService(config, dbConfig);
assert(service.image.includes('totvs_postgres'));
```

## 🔧 Manutenção

### Adicionar Novo Serviço
1. Criar arquivo em `js/services/novo-servico.js`
2. Implementar função `generateNovoServicoService(config)`
3. Adicionar documentação JSDoc completa
4. Importar em `index.html`
5. Chamar em `generators/compose.js`

### Modificar Serviço Existente
1. Localizar arquivo em `js/services/`
2. Modificar função geradora
3. Atualizar documentação JSDoc
4. Testar geração completa

### Adicionar Variável de Ambiente
1. Adicionar campo no formulário (`index.html`)
2. Coletar em FormData
3. Adicionar em função geradora apropriada
4. Adicionar em `generators/env.js` na seção correspondente

## 📚 Benefícios da Modularização

✅ **Separação de Responsabilidades**: Cada módulo tem uma função clara  
✅ **Facilidade de Manutenção**: Mudanças isoladas em arquivos específicos  
✅ **Reutilização**: Funções utilitárias compartilhadas  
✅ **Testabilidade**: Módulos podem ser testados independentemente  
✅ **Documentação**: JSDoc fornece documentação inline  
✅ **Escalabilidade**: Fácil adicionar novos serviços  
✅ **Legibilidade**: Código organizado e bem estruturado  

## 🚀 Próximos Passos

1. ✅ Criar estrutura modular
2. ⏳ Atualizar index.html para importar módulos
3. ⏳ Testar geração completa
4. ⏳ Validar compatibilidade com funcionalidades existentes
5. ⏳ Adicionar testes unitários (futuro)
6. ⏳ Migrar para TypeScript (futuro)
