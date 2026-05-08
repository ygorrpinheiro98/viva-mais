# Viva Mais

Plataforma de treino e comunidade para corredores e ciclistas.

O Viva Mais combina interface moderna, rotas de dashboard, PWA, análise de treinos e integração com Strava.

## 🚀 O que este projeto entrega

- Landing page com apresentação do produto e planos
- Página de funcionalidades com recursos de corrida, ciclismo e treinos intervalados
- Dashboard com métricas de desempenho e histórico de atividades
- API local para geração de planos de treino por IA
- Integração com notificações push e sincronização com Strava
- Suporte a PWA e temas claro/escuro

## 🧩 Tecnologias usadas

- React
- Vite
- TypeScript / JSX / TSX
- React Router
- Three.js / React Three Fiber
- Framer Motion
- Lucide Icons

## ⚡ Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Abra o projeto no navegador:

```text
http://localhost:5173
```

> Se a porta acima estiver diferente, o Vite exibirá o endereço correto no terminal.

## 📁 Estrutura principal

- `src/App.jsx` - roteamento principal da aplicação
- `src/pages/` - páginas públicas do site (Home, Funcionalidades, Planos, Contato)
- `src/app/` - área de dashboard e APIs embutidas
- `src/components/` - componentes reutilizáveis do dashboard e UI
- `public/` - ícones, manifest e arquivos estáticos
- `scripts/` - utilitários de geração e esquemas

## 🧪 Scripts úteis

- `npm run dev` — iniciar ambiente de desenvolvimento
- `npm run build` — gerar versão otimizada para produção
- `npm run preview` — rodar preview da build localmente

## 💡 Observações importantes

- O projeto já contém `.gitignore` atualizado para excluir arquivos de build e dados locais
- A branch principal atual é `main`
- O cadastro de hooks e rotas de API está em `src/app/api`

## 🤝 Contribuição

Se quiser melhorar o projeto, siga estas etapas:

1. Faça um fork ou clone deste repositório
2. Crie uma branch de recurso:

```bash
git checkout -b feature/minha-melhoria
```

3. Faça suas alterações e teste localmente
4. Abra um pull request com uma descrição clara do que foi alterado

## 📌 Próximos passos sugeridos

- Ajustar `package.json` se for migrar de Next.js para Vite definitivamente
- Completar autenticação e integração com backend real
- Criar testes automatizados e CI
- Publicar como PWA em produção
