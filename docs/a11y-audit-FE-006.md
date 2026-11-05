# FE-006 · Auditoria de acessibilidade e mobile

Data: 2026-11-05 · Escopo: todas as rotas de `src/RouterConfig.js` que renderizam sem dados reais.

## Como reproduzir

```bash
npx react-scripts build
node <servidor estático com fallback para index.html> build   # porta 3000
node scripts/axe-app.js            # DETAIL=1 para listar todos os nós
```

O script (`scripts/axe-app.js`) usa axe-core com as tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`
e `wcag22aa` (tamanho de alvo), simulando um usuário por papel (visitante, aluno, professor,
instituição) com a API mockada (respostas vazias). Para cada tela, em desktop (1280 px) e celular
(**360 px**), ele:

1. roda o axe;
2. navega 40x com Tab e confere se cada elemento focado tem indicador de foco visível (desktop);
3. confere que a página não rola na horizontal e que nada fora de um contêiner com rolagem
   ultrapassa a largura da tela (celular, WCAG 1.4.10).

Telas cobertas (22 rotas × 2 viewports): `/`, `/login`, `/cadastro-instituicao`, `/redefinir-senha`,
`/validar-token`, `/reset-password`, `/access-denied`, rota inexistente; aluno: `/disciplinas`,
`/disciplinas/:id`, `/atividades`, `/atividades/:id`, `/listas`, `/listas/:id/questoes`, `/questoes`,
`/config`; professor: `/disciplinas`, `/atividades`, `/listas`, `/listas/:id/questoes/professor`,
`/config`; instituição: `/instituicao`.

## Achados e correções

| # | Tela | Regra | Problema | Correção |
|---|------|-------|----------|----------|
| 1 | `/atividades/:id` | color-contrast (AA) | Badge de status: texto branco sobre `#10b981`/`#ef4444`/`#9e9e9e` (< 4,5:1) | Usa os tokens `--color-success`, `--color-danger`, `--text-light` (`EventResumoAluno.css`) |
| 2 | `/validar-token` | label (crítico) | Os 6 campos do código não tinham rótulo | `role="group"` + `aria-label` por dígito, `autocomplete="one-time-code"` (`TokenInput.js`) |
| 3 | `/validar-token` | link-in-text-block | Link de e-mail do suporte distinguível só pela cor | Link sublinhado e com cor de contraste maior (`styles.css`) |
| 4 | `/validar-token` | foco | `outline: none` nos campos; só a borda mudava | `:focus-visible` com anel de 2 px |
| 5 | `/redefinir-senha` | target-size, label, ordem | Tela usava classes Tailwind que o projeto não carrega (sem estilo), campos só com placeholder, `<h2>` sem `<h1>`, imagem com `alt` redundante, checklist de regras só por cor | Reescrita com CSS module e tokens: `<main>`, `<h1>`, `<label>`, `aria-describedby`, alvos de 44 px, regra atendida/pendente dita em texto (✓ + texto para leitor de tela), botões `type="button"` |
| 6 | login, cadastro de instituição, painel da instituição | foco visível | antd remove o outline de `input`/`select` | Regra global em `global.css` com anel de foco `--color-focus` |

## Resultado após as correções

- axe (A/AA, WCAG 2.2 AA): **0 violações** nas 22 rotas, em desktop e em 360 px.
- Reflow a 360 px: **nenhuma** rota com rolagem horizontal da página.
- Teclado: todas as rotas sem elementos sem indicador de foco, exceto os dois itens abaixo.

## Pendências conhecidas

- O `iframe` do botão do Google em `/login` não tem indicador de foco controlável (conteúdo de terceiro).
- Um `input` na tela da instituição ainda é reportado sem indicador de foco; precisa de inspeção com dados reais.
- **Teste manual com leitor de tela (NVDA/VoiceOver) não foi feito**: exige uma pessoa e dispositivo.
  Roteiro sugerido: login → disciplinas → atividade → responder lista → perfil, conferindo nome/papel/estado
  dos controles, anúncio de erros e ordem de leitura. Registrar o resultado neste arquivo.
- A auditoria roda com a API vazia; estados com dados reais (tabelas cheias, gráficos, modais abertos)
  não são cobertos pelo script e devem ser revisados nas PRs que os tocarem, usando o checklist do template de PR.
- Modais e popovers (criar lista, adicionar questões, respostas) só são exercitados abertos manualmente.
