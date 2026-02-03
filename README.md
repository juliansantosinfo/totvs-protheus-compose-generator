# TOTVS Protheus Docker Compose Generator - Standalone

Versão standalone que **não requer backend Python**. Funciona 100% no navegador usando apenas HTML, CSS e JavaScript.

## 🚀 Recursos

- **Sem dependências de servidor**: Roda completamente no navegador
- **Geração local de YAML**: Usa a biblioteca js-yaml via CDN
- Interface idêntica à versão com backend
- Download direto do arquivo docker-compose.yaml
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
✅ **Simples**: Apenas 2 arquivos (HTML + JS)  
✅ **Rápido**: Geração instantânea no navegador  

## 📁 Estrutura

```
web-dockercompose-creator-standalone/
├── index.html      # Interface completa com CSS inline
├── generator.js    # Lógica de geração do YAML
└── README.md       # Este arquivo
```

## 🔧 Tecnologias

- **HTML5 + CSS3**: Interface responsiva
- **JavaScript (ES6+)**: Lógica de geração
- **js-yaml**: Biblioteca para gerar YAML (via CDN)

## 📝 Diferenças da Versão com Backend

| Recurso | Backend Python | Standalone |
|---------|---------------|------------|
| Instalação | Requer Python + pip | Nenhuma |
| Servidor | FastAPI + Uvicorn | Opcional (HTTP simples) |
| Geração YAML | PyYAML (servidor) | js-yaml (navegador) |
| Validação | Pydantic (servidor) | JavaScript (cliente) |
| Performance | Servidor | Instantânea (local) |

## 🌐 Compatibilidade

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 💡 Dica

Para usar offline, salve a página completa (Ctrl+S) no navegador. Isso baixará o js-yaml localmente.

## 📄 Licença

MIT License - Mesmo do projeto principal TOTVS-Protheus-in-Docker
