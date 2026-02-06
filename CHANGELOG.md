# Changelog

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
