# Changelog

## [2026-03-08] - Compose Generator Parity & UI Database Version Selection

### Added
- ✅ Opção de selecionar explicitamente a versão da imagem do Banco de Dados no formulário UI, ao invés de atrelar a `appserver_release`.
- ✅ Atualização estrutural completa dos atributos YAML gerados para alinhar nativamente aos projetos de referência estáticos.
- ✅ Combobox dinâmico no `index.html` limitando `[15]` para PostgreSQL, `[2019]` para MSSQL, e `[21.3.0]` para Oracle.

### Changed
- Refatoração dos módulos de gerador Node-like (`js/services/*.js`), modificando propriedades e remapeando variáveis de ambiente legadas para utilizar as novas convenções padronizadas de `DATABASE_USERNAME`, `DATABASE_PASSWORD` e `DATABASE_NAME`.
- Adequação do Hook de parser `val()` no utilitário de leitura pra formatar substituições de `.env` apropriadamente (ex: `\${ENV:-def}`).
- Atualização em opções do `js-yaml.dump` e Regex local da classe generadora para compilar outputs em aspas rígidas, espaçamentos YAML puros, e serializar matrizes nativas alinhando estilo de porta no resultado final.
- `depends_on` da License Server modificado de `service_started` para `service_healthy`.
- Troca de todos arrays `test` no `healthcheck` para utilizar o entrypoint `/healthcheck.sh` universal.

### Files Modified
- `index.html`: Novo seletor de Versão de banco, JavaScript de captura e dinâmica visual de displays flex-column.
- `js/services/*.js`: (Todos DBs e AppServers) Ajustados ambientes gerais e `healthcheck`.
- `js/utils/helpers.js`: Modificação do injetor de fallback de variáveis de ambiente.
- `js/generators/compose.js`: Cabeçalho injetado igual à template e manipulação RegExp do despejo final formatado.

## [2026-02-06] - SmartView Support

### Added
- ✅ Serviço SmartView opcional no gerador
- ✅ Validação automática: SmartView requer servidor REST ativo
- ✅ Sincronização automática de configurações REST → SmartView
- ✅ Versão SmartView: 3.9.0.4558336
- ✅ Porta padrão: 7019
- ✅ Dependência configurada: SmartView depende do AppRest

### Features
- Checkbox para habilitar SmartView
- Ao habilitar SmartView, o servidor REST é automaticamente ativado e bloqueado
- Campos sincronizados:
  - Container REST → Servidor REST do SmartView
  - Porta REST → Porta REST do SmartView
- Comandos Docker incluem URL de acesso ao SmartView

### Technical Details
- **Imagem Docker**: `juliansantosinfo/totvs_smartview:{version}`
- **Porta exposta**: 7019
- **Variáveis de ambiente**:
  - `SMARTVIEW_REST_SERVER`: Nome do container REST
  - `SMARTVIEW_REST_PORT`: Porta do servidor REST
  - `EXTRACT_RESOURCES`: true
  - `TZ`: Fuso horário configurado
- **Dependências**: Requer `apprest` em execução

### Files Modified
- `index.html`: Adicionada seção SmartView com validações
- `generator.js`: Adicionada lógica de geração do serviço SmartView
