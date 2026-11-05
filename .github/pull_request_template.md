## O que muda

<!-- Descreva a mudança e o ticket (ex.: FE-006). -->

## Como testar

<!-- Passos, papéis (aluno/professor/instituição) e dados usados. -->

## Checklist de acessibilidade (WCAG 2.1 AA)

Marque cada item ou escreva "N/A" com o motivo. Detalhes e comandos em `docs/a11y-audit-FE-006.md`.

- [ ] `npm run test:a11y:app` roda sem violações novas nas telas afetadas (inclui o reflow a 360 px)
- [ ] Se criei/alterei um componente de `src/ui`: `npm run test:a11y` (Storybook) sem violações
- [ ] Todo campo tem `<label>` (ou `aria-label`); placeholder não substitui rótulo
- [ ] Tudo que é clicável é `<button>`/`<a>` e funciona só com teclado (Tab, Enter, Espaço, Esc)
- [ ] Ordem de foco segue a ordem visual; modais prendem e devolvem o foco; o foco é sempre visível
- [ ] Contraste de texto >= 4.5:1 (3:1 para texto grande e ícones); estado nunca só por cor
- [ ] Alvos de toque >= 44 px no celular; imagens informativas têm `alt`, decorativas têm `alt=""`
- [ ] Tela usável a 360 px de largura, sem rolagem horizontal da página
- [ ] Erros e status dinâmicos são anunciados (`role="alert"` / `aria-live`)
- [ ] Testei com leitor de tela (NVDA/VoiceOver) o fluxo principal alterado

## Screenshots (desktop e 360 px)
