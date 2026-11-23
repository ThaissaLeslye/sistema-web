# Sistema Web — Gestão de Clientes

Aplicação web desenvolvida em **React**, **TypeScript (modo estrito)** e **Vite** para consulta de clientes, contas bancárias, agências e cadastro em memória a partir de dados consumidos em tempo de execução via Google Sheets (CSV).

## Arquitetura e Organização de Pastas

```text
src/
├── components/   # Componentes reutilizáveis de interface e resiliência (ex.: ErrorBoundary)
├── context/      # Estado global em memória para clientes, contas e agências
├── pages/        # Telas principais (Listagem, Detalhes do Cliente, Novo Cliente, Agências)
├── services/     # Comunicação HTTP (Fetch API) e parser/normalizador de CSV
├── types/        # Contratos TypeScript estritos do domínio bancário
└── utils/        # Máscaras, formatadores (BRL, datas, CPF/CNPJ) e validações

```

## Fluxo de Versionamento (Git Flow)

- **`main`**: Branch de produção estável (base do deploy).
- **`develop`**: Branch de integração contínua das funcionalidades.
- **`feature/*`**: Branches isoladas por entrega, integradas à `develop` sequencialmente via Pull Request sem avanço rápido (`--no-ff`) para rastreabilidade completa do histórico.

## Como Executar Localmente

```bash
npm install
npm run dev

```

Para validar tipagem e análise estática de código:

```bash
npm run lint
npm run build

```
