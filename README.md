# AIgen Prompt Factory

Gerador de prompts de sistema e wizard de ideias de jogos em português, desenvolvido com React, TypeScript, Vite, Tailwind CSS e shadcn/ui.

## Desenvolvimento

Requer Node.js 18 ou superior e npm. O ambiente cloud foi validado com Node.js 24.22.1 e npm 11.9.0. O gerenciador adotado é npm, com versões reproduzíveis no `package-lock.json`.

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 8080 --strictPort
```

O servidor de desenvolvimento usa a porta 8080. A variável `PORT` permite alterar a porta padrão. O `postinstall` já executa o build de produção.

## Verificação

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run test:watch` mantém os testes em observação. Os testes Vitest cobrem a formatação dos prompts, a compatibilidade dos dados salvos, as transições e validações do wizard, sugestões, regras de escopo, exportação e recuperação de armazenamento inválido. `npm run preview` serve o build de produção na porta 4173.

Para conferir a interface, selecione um modelo, edite o campo Papel e confirme a atualização nas abas Visualização e JSON. `Ctrl/Cmd+S` salva o estado no navegador; desfazer/refazer alterna entre as mudanças de modelo. Ao sair do gerador, alterações pendentes também são salvas. As chaves de armazenamento existentes foram preservadas.

## Wizard de ideias de jogos

Abra **Ideia de jogo** na navegação ou acesse `/ideia-do-jogo`. O fluxo tem cinco etapas: ponto de partida, experiência do jogador, ciclo de gameplay, primeiro protótipo e revisão.

- Comece com sua própria ideia ou explore sugestões locais. Aplicar uma sugestão altera somente a resposta escolhida.
- Use **Ainda não decidi** para registrar decisões pendentes. A revisão diferencia essas decisões das perguntas ainda não respondidas.
- Volte a qualquer etapa para editar; as outras respostas são preservadas. O resumo mostra a ideia, a mecânica e o teste inicial enquanto você escreve.
- Escolha plataforma, equipe e tempo disponível. Ambições como multiplayer e mundo aberto geram orientações de escopo, sem mudar automaticamente o protótipo.
- Na revisão, copie ou baixe o conceito em Markdown com pitch, experiência, gameplay, escopo e decisões abertas. **Concluir revisão** exige preencher ou marcar para depois todas as perguntas essenciais; não significa que a ideia já foi validada com jogadores.

O rascunho é salvo automaticamente no navegador, incluindo a etapa atual. Ele usa a chave versionada `aigen.game-idea.v1`, separada dos prompts. Ao navegar para outra ferramenta ou sair da página, alterações pendentes são salvas. Não há sincronização entre dispositivos. Se o navegador bloquear o armazenamento, a tela avisa e permite continuar e exportar o conceito. **Nova ideia** pede confirmação antes de substituir o rascunho.

As sugestões são exemplos locais e as orientações de escopo seguem regras explícitas. O wizard funciona sem chamadas ao Gemini, credenciais ou backend.

## Organização

```text
src/
  main.tsx                 # Entrada do Vite
  app/                     # Composição da aplicação, tema e notificações
  features/
    game-ideas/
      components/          # Wizard, perguntas, resumo, revisão e orientação de escopo
      data/                # Etapas, perguntas e sugestões locais
      hooks/               # Estado do wizard e salvamento automático
      lib/                 # Validação, transições, escopo e documento exportado
      services/            # Leitura e gravação do rascunho versionado
      types.ts             # Esquemas Zod e tipos compartilhados
    prompts/
      components/          # Gerador, campos, visualização, dicas e histórico
      data/                # Modelos de prompt predefinidos
      hooks/               # Estado e ações do gerador
      lib/                 # Formatação pura e testes
      services/            # Persistência local e integrações externas
      types.ts             # Tipos compartilhados da funcionalidade
  components/              # Componentes compartilhados
    ui/                    # Primitivas shadcn/ui
  hooks/                   # Hooks compartilhados
  lib/                     # Utilitários compartilhados
  index.css                # Estilos globais e tokens visuais
```

A entrada é `main.tsx → app/App.tsx`. O React Router disponibiliza o gerador de prompts em `/` e o wizard, carregado sob demanda, em `/ideia-do-jogo`. Existe uma única composição de aplicação; não há roteamento Next.js. O componente do gerador cuida da apresentação, `usePromptGenerator` coordena ações e estado, `formatPrompt` monta o texto e `generatorStorage` encapsula o armazenamento. No wizard, as regras e o documento são independentes de React, e a persistência é validada com Zod.

Novas funcionalidades devem ficar em `features/<funcionalidade>`. Mantenha em `components/ui`, `hooks` e `lib` apenas elementos reutilizados entre funcionalidades. Testes ficam ao lado do módulo que verificam.

## Deploy na VPS com Docker

O projeto inclui `Dockerfile`, `compose.yaml` e Nginx para servir o build de produção. Na VPS, com Docker e Compose v2 instalados:

```sh
cp .env.example .env
docker compose up -d --build --wait
```

A porta padrão é **8080**. Consulte o [guia de deploy](deploy/README.md) para clonar o projeto, configurar porta/domínio/HTTPS, atualizar e diagnosticar o serviço.

## Integrações externas

A edição e a visualização de prompts funcionam sem backend, banco ou credenciais. As ações de IA utilizam o Gemini; o envio usa webhooks configurados na interface. Essas integrações externas não fazem parte dos testes locais.

O serviço Gemini ainda contém uma chave fixa herdada do projeto. A gestão dessa credencial precisa ser migrada para um backend antes de uma validação real ou publicação da integração; variáveis Vite também são expostas ao navegador. Não inclua credenciais em novos arquivos ou commits.

## Lovable

O projeto também pode ser editado e publicado pelo [Lovable](https://lovable.dev/projects/6076a73b-ec6a-446c-80cd-4b6af2804b03).
