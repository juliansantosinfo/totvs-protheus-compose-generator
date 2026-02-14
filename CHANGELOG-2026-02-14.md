# Melhorias Implementadas no TOTVS Protheus Compose Generator

## Data: 14/02/2026

## Resumo das Mudanças

Este documento descreve as melhorias implementadas no **TOTVS-Protheus-Compose-Generator** para refletir as atualizações mais recentes do projeto principal **TOTVS-Protheus-in-Docker**.

---

## 1. Suporte ao Oracle Database ✅

### Arquivos Criados:
- `js/services/oracle.js` - Gerador de serviço Oracle para Docker Compose

### Arquivos Modificados:
- `index.html`:
  - Adicionada opção "Oracle Database" no select de tipo de banco
  - Criada seção completa de configuração do Oracle (container, senha, porta, volumes)
  - Adicionado script `oracle.js` nos imports
  - Adicionadas variáveis JavaScript para elementos do Oracle
  - Implementados event listeners para Oracle (restore backup, password sync)

- `js/utils/helpers.js`:
  - Atualizada função `getDatabaseConfig()` para suportar Oracle
  - Adicionado retorno de `username` para cada tipo de banco

- `js/generators/compose.js`:
  - Adicionada lógica para gerar serviço Oracle no compose
  - Atualizada função `collectVolumes()` para incluir volume do Oracle

- `js/generators/env.js`:
  - Adicionada seção de configuração Oracle no gerador de .env

### Configurações Oracle:
- Container: `totvs_oracle`
- Porta padrão: `21521:1521`
- Usuário padrão: `system`
- Volume: `/opt/oracle/oradata`
- Healthcheck: `./healthcheck.sh`
- User: `oracle`

---

## 2. DATABASE_USERNAME Configurável ✅

### Mudança:
Anteriormente, o username do banco era fixo (postgres/sa). Agora é uma variável de ambiente configurável.

### Implementação:
- `js/utils/helpers.js`: Adicionado campo `username` no retorno de `getDatabaseConfig()`
- `js/services/dbaccess.js`: Healthcheck agora usa `val()` para DATABASE_USERNAME
- `js/services/postgres.js`: Healthcheck atualizado para usar variável de ambiente com fallback
- `index.html`: Adicionados campos `mssql_user`, `oracle_user` no config object

### Valores Padrão:
- PostgreSQL: `postgres`
- MSSQL: `sa`
- Oracle: `system`

---

## 3. Profiles do Docker Compose ✅

### Funcionalidade:
Permite iniciar AppRest e SmartView opcionalmente usando profiles do Docker Compose.

### Implementação:
- `index.html`:
  - Adicionado checkbox "Usar profiles do Docker Compose"
  - Adicionada informação sobre como usar profiles
  - Adicionado campo `use_profiles` no config object (padrão: `true`)

- `js/services/appserver.js`:
  - AppRest agora adiciona `profiles: ['full', 'with-rest']` quando `use_profiles` está habilitado

- `js/services/smartview.js`:
  - SmartView agora adiciona `profiles: ['full', 'with-smartview']` quando `use_profiles` está habilitado

### Uso:
```bash
# Stack básica (sem REST/SmartView)
docker compose up -d

# Stack completa
docker compose --profile full up -d

# Apenas com REST
docker compose --profile with-rest up -d

# Apenas com SmartView
docker compose --profile with-smartview up -d
```

---

## 4. Ulimits para AppServer ✅

### Implementação:
- `js/services/appserver.js`: Adicionado `ulimits` para `nofile` (soft: 65536, hard: 65536)

### Motivo:
Corrige erro `OPERATIONAL LIMITS ARE INSUFFICIENT` em ambientes com limites muito altos.

---

## 5. SmartView com Volume ✅

### Mudança:
SmartView agora possui volume persistente para dados.

### Implementação:
- `js/services/smartview.js`:
  - Adicionado volume `totvs_smartview_data:/totvs/smartview`
  - Removidas variáveis de ambiente desnecessárias (REST_SERVER, REST_PORT, DISCOVERY_URL)
  - Mantido apenas `EXTRACT_RESOURCES` e `TZ`

- `js/generators/compose.js`:
  - Atualizada função `collectVolumes()` para incluir volume do SmartView

---

## 6. Healthcheck Melhorado ✅

### PostgreSQL:
- Agora usa variáveis de ambiente com fallback: `${DATABASE_USERNAME:-postgres}`
- Garante compatibilidade com configurações customizadas

### DBAccess:
- Healthcheck usa `val()` para todas as variáveis (ALIAS, USERNAME, PASSWORD)
- Suporta configuração via .env ou valores diretos

---

## 7. Correções e Melhorias

### JavaScript:
- Removida duplicação de variáveis `mssqlRestoreBackup` e `mssqlRestoreWarning`
- Atualizada função `updateDatabaseConfig()` para suportar 3 tipos de banco
- Adicionados event listeners para sincronização de senha Oracle

### Estrutura:
- Código modular mantido
- Compatibilidade com versão anterior preservada
- Documentação inline atualizada

---

## Compatibilidade

✅ Retrocompatível com configurações existentes  
✅ Funciona com e sem arquivo .env  
✅ Suporta bind mounts e named volumes  
✅ Profiles são opcionais (padrão: habilitado)

---

## Testes Recomendados

1. **Gerar compose com PostgreSQL** (modo tradicional)
2. **Gerar compose com Oracle** (novo)
3. **Gerar compose com profiles habilitado**
4. **Gerar compose com profiles desabilitado**
5. **Gerar .env com Oracle**
6. **Testar banco externo com Oracle**

---

## Próximos Passos (Opcional)

- [ ] Adicionar suporte a Oracle SE2 (requer binários não redistribuíveis)
- [ ] Adicionar validação de portas duplicadas
- [ ] Adicionar preview do docker-compose antes de baixar
- [ ] Adicionar opção de download em ZIP (compose + .env + README)

---

## Referências

- Projeto Principal: [TOTVS-Protheus-in-Docker](https://github.com/juliansantosinfo/TOTVS-Protheus-in-Docker)
- Commits Analisados: 68f7e75, c2e4974, f31103e
- Branch: 12.1.2510 merged to master
