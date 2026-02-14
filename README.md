# TOTVS Protheus Docker Compose Generator - Standalone

Versão standalone que **não requer backend Python**. Funciona 100% no navegador usando apenas HTML, CSS e JavaScript.

## 🚀 Recursos

- **Sem dependências de servidor**: Roda completamente no navegador
- **Geração local de YAML**: Usa a biblioteca js-yaml via CDN
- **Suporte a 3 bancos de dados**: PostgreSQL, Microsoft SQL Server e Oracle Database
- **Profiles do Docker Compose**: AppRest e SmartView opcionais
- **Configuração via .env**: Opção de usar variáveis de ambiente
- Interface idêntica à versão com backend
- Download direto do arquivo docker-compose.yaml e .env
- Todas as funcionalidades da versão original

## 📋 Como Usar

### Opção 1: Abrir diretamente no navegador

Simplesmente abra o arquivo `index.html` no seu navegador:

```bash
# No Linux/Mac
open index.html

# Ou no Windows
start index.html

# Ou arraste o arquivo para o navegador
```

### Opção 2: Servidor HTTP local (recomendado)

Para evitar problemas com CORS e ter melhor experiência:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (se tiver npx)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

## 🎯 Vantagens da Versão Standalone

✅ **Portabilidade**: Copie os arquivos para qualquer lugar  
✅ **Sem instalação**: Não precisa instalar Python, pip ou dependências  
✅ **Offline**: Funciona sem internet (após carregar o js-yaml do CDN uma vez)  
✅ **Simples**: Arquivos HTML + JS modulares  
✅ **Rápido**: Geração instantânea no navegador  

## 📁 Estrutura

```
TOTVS-Protheus-Compose-Generator/
├── index.html                  # Interface completa
├── js/
│   ├── utils/
│   │   └── helpers.js         # Funções auxiliares
│   ├── services/
│   │   ├── postgres.js        # Gerador PostgreSQL
│   │   ├── mssql.js           # Gerador MSSQL
│   │   ├── oracle.js          # Gerador Oracle
│   │   ├── licenseserver.js   # Gerador License Server
│   │   ├── dbaccess.js        # Gerador DBAccess
│   │   ├── appserver.js       # Gerador AppServer/AppRest
│   │   └── smartview.js       # Gerador SmartView
│   ├── generators/
│   │   ├── compose.js         # Orquestrador do docker-compose
│   │   └── env.js             # Gerador de arquivo .env
│   └── generator.js           # Entry point
└── README.md                   # Este arquivo
```

## 🔧 Tecnologias

- **HTML5 + CSS3**: Interface responsiva com tema dark/light
- **JavaScript (ES6+)**: Lógica modular de geração
- **js-yaml**: Biblioteca para gerar YAML (via CDN)
- **JSZip**: Biblioteca para gerar arquivos ZIP (via CDN)

## 🆕 Novidades (Fevereiro 2026)

### Suporte ao Oracle Database
- Oracle XE 21c como opção de banco de dados
- Configuração completa (container, senha, porta, volumes)
- Healthcheck específico para Oracle

### Profiles do Docker Compose
- AppRest e SmartView agora são opcionais via profiles
- Use `--profile full` para stack completa
- Use `--profile with-rest` apenas para REST
- Use `--profile with-smartview` apenas para SmartView

### DATABASE_USERNAME Configurável
- Username do banco agora é variável de ambiente
- Valores padrão: `postgres`, `sa`, `system`
- Permite customização via .env

### Melhorias no SmartView
- Volume persistente para dados
- Configuração simplificada
- Integração com profiles

## 📝 Diferenças da Versão com Backend

| Recurso | Backend Python | Standalone |
|---------|---------------|------------|
| Instalação | Requer Python + pip | Nenhuma |
| Servidor | FastAPI + Uvicorn | Opcional (HTTP simples) |
| Geração YAML | PyYAML (servidor) | js-yaml (navegador) |
| Validação | Pydantic (servidor) | JavaScript (cliente) |
| Performance | Servidor | Instantânea (local) |
| Bancos Suportados | PostgreSQL, MSSQL, Oracle | PostgreSQL, MSSQL, Oracle |

## 🌐 Compatibilidade

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 💡 Exemplos de Uso

### Stack Básica (PostgreSQL + AppServer)
```bash
docker compose -f docker-compose-postgresql.yaml -p totvs up -d
```

### Stack Completa (com REST e SmartView)
```bash
docker compose -f docker-compose-postgresql.yaml --profile full -p totvs up -d
```

### Apenas com REST
```bash
docker compose -f docker-compose-postgresql.yaml --profile with-rest -p totvs up -d
```

### Oracle Database
```bash
docker compose -f docker-compose-oracle.yaml -p totvs up -d
```

## 🔗 Links Úteis

- [Projeto Principal](https://github.com/juliansantosinfo/TOTVS-Protheus-in-Docker)
- [Dockerfile Generator](https://juliansantosinfo.github.io/TOTVS-Protheus-Dockerfile-Generator/)
- [Documentação TOTVS](https://tdn.totvs.com/)

## 📄 Licença

MIT License - Mesmo do projeto principal TOTVS-Protheus-in-Docker

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação
