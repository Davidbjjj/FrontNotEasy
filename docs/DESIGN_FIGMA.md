# NotEasy — Especificação do design (Figma) para o front

Fonte: arquivo Figma **Noteasy** (`S4ZY1sjwRZrCVyhImaa2Iy`)
- Página **Fluxo** (`0:1`): telas de Acesso, Cadastro, Redefinição de senha, Início Sessão (aluno/professor), Questões, Landing page, versões Tablet e Android.
- Página **Componenetes** (`1:2`): Colors, Primary/Secundary Button, textfield, Text Field, Tag, chip, List-default, filtros, delivery_status, ícones, Keyboards.

Base do projeto: **1366 × 768 px** (web). Tablet: 1024 × 768 e 768 × 1024. Celular: 360 × 640 (Android, ≈80% do público docente; tela de referência 6,3″–6,6″, 19,5:9).

Todos os valores abaixo já estão disponíveis como variáveis CSS em `src/global.css` (prefixo `--ne-`).

---

## 1. Cores

| Grupo | Darker | Dark | **Base** | Light | Lighter |
|---|---|---|---|---|---|
| Primary (vermelho GGE) | `#8B1E18` | `#A52520` | **`#D12E25`** | `#E65D56` | `#F3CECF` |
| Secundary (azul marinho) | `#0F1F3D` | `#142B5C` | **`#1A3979`** | `#4A6BA8` | `#B8C7E8` |
| Success (acertos/desempenho) | `#044A01` | `#067003` | **`#09A704`** | `#2DB929` | `#B8E6B6` |
| Error (dificuldades/erros) | `#B01400` | `#D11800` | **`#FF2104`** | `#FF5242` | `#FF8A7F` |
| Warning (atenção/revisão) | `#9A420A` | `#B84F0C` | **`#E8720E`** | `#F28F3F` | `#F5B878` |

Base & gray scale: `#000000` · `#656565` (gray-dark) · `#D9D9D9` (gray-medium) · `#F6F6F6` (gray-light, fundo das telas) · `#FFFFFF`.

Uso:
- **Texto pequeno colorido** deve usar a variação *dark* das semânticas (`#067003`, `#D11800`, `#B84F0C`) para manter contraste AA. A variação base fica para barras, ícones, bordas e textos ≥ 18px bold.
- Fundo do ícone inativo do menu: `rgba(243, 206, 207, 0.6)`.
- Painel de conteúdo: `rgba(255, 255, 255, 0.6)`, raio 14.

## 2. Tipografia

- Família principal: **Alexandria** (400, 500, 600, 700). Apoio: **Roboto**. Carregadas no `public/index.html` via Google Fonts.
- Escala usada nas telas:
  - Título de tela (Acessar / Redefinir senha / Cadastro): 32px, 600, `#D12E25`
  - Nome do usuário e itens do header: 24px, 500, `#1A3979`
  - Título de card (disciplina): 20px, 500, `#142B5C`
  - Texto de botão: 16px, 700 (focus: 20px)
  - Rótulo de campo: 15–16px, 600, preto
  - Valor de campo numérico: 16px, 500, **espaçamento entre dígitos 15%** (nota do componente textfield)
  - Corpo/filtros: 14px, 500
  - Tag/chip: 12px, 500, line-height 13px
  - Texto de apoio do campo: 12px, 400

## 3. Elevação, raios e medidas

- Sombra **M3/Elevation Light/3**: `0 1px 3px rgba(0,0,0,.3), 0 4px 8px 3px rgba(0,0,0,.15)` → campos de formulário.
- Sombra de cards e botões: `0 1px 1.5px rgba(0,0,0,.3), 0 4px 4px rgba(0,0,0,.15)`.
- Raio padrão: **8px**. Painéis: 14px. Cards de formulário (login/cadastro): 16px. Barras de progresso: 36px.
- Altura de botões e campos: **64px** (largura 284–420px). Busca rápida: 54px. Filtros: 46px. Header: 100px.

## 4. Componentes

### Primary Button
| Estado | Fundo | Texto | Borda |
|---|---|---|---|
| enable | `#D12E25` | branco, 16px bold | — |
| focus | `#F3CECF` | `#8B1E18`, 20px bold | — |
| select (carregando, ex.: "CONSULTANDO...") | `#A52520` | branco, 16px bold, tracking 0.48px | `#3A1E1E` |
| dependent | branco | `#B84F0C`, 16px regular | `#E8720E` |

### Secundary Button
| Estado | Fundo | Texto | Borda |
|---|---|---|---|
| enable | branco | `#D12E25`, 16px bold | — |
| focus | `#E65D56` | branco, 20px bold | — |
| selected | branco | `#A52520` | `#A52520` |
| dependent | branco | `#B84F0C` | `#E8720E` |

> **Regra de acessibilidade do Figma:** quando um formulário exige preenchimento, o botão começa no estado **dependent** com o texto "Preencha o campo para prosseguir" / "Preencha todos os itens para prosseguir" — **não usar cinza** para desabilitado (contraste ruim e não é lido por leitores de tela).

### textfield
- Fundo branco, raio 8 só nos cantos de cima, sombra Elevation 3, padding 6/12/4, altura 64.
- Rótulo dentro do campo (Alexandria SemiBold 15–16px) e valor/máscara abaixo.
- Borda inferior por estado: default `1px #142B5C` · activated `1px #142B5C` (rótulo 80% opacidade) · correct `2px #09A704` · error `2px #FF2104` + ícone ⓘ vermelho + apoio "preenchimento obrigatório" `#D11800` · attention `2px #E8720E` + ícone ⚠ + apoio `#B84F0C` · help-text `1px #646464` + "preenchimento opcional".
- Senha: ícone olho em vermelho à direita (fechado/aberto).
- Máscaras: CPF `000.000.000-00`, RG `00.000.000-0`, data `00/00/0000`, telefone `(00) 00000-0000`. E-mail, senha e nome podem usar placeholder ("Digite aqui...").

### Tag (chip de assunto)
Fundo `#B8C7E8`, texto `#142B5C` 12px 500, altura 28, padding 0 12, raio 8. Classe pronta: `.ne-tag`.

### Card de lista (List-default)
Branco, raio 8, sombra de card, padding 6. Linha principal: imagem 84×84 (raio 8) · disciplina (20px `#142B5C`) + professor/turma (14px `#1A3979` com ícone) · "Questões realizadas: X realizadas de Y" + barra de progresso 17px · "Prazo entrega" + status com ícone de cronômetro · seta → (32px). Linha inferior: tags.
- Cor do progresso: 0% → texto `#FF2104` (barra cinza); intermediário → `#E8720E`; alto → `#09A704`. Classes prontas: `.ne-progress`, `.ne-progress__fill--low|mid|high`.
- Status de prazo: "em 15 dias" (ícone azul), "em 3 dias" (ícone laranja), "vencido"/"atrasado" (vermelho).

### Filtros (filtro1/2/3)
Borda 1px `#1A3979`, raio 8, altura 46. Rótulo preto 14px ("Ordenar por:", "Filtro por data:", "Filtro por evolução") + valor (`#1A3979` ou `#656565` "selecionar") + chevron. Classe pronta: `.ne-filter`.

### Busca rápida
Borda 1px `#D12E25`, raio 8, altura 54, rótulo "Busca rápida:" 16px 500, placeholder 14px `#656565` "Digite aqui a disciplina, nome do(a) professor(a), título da atividade", lupa vermelha à direita.

### Alternência de visualização
Dois botões 46px (grade / lista); ativo fundo `#D12E25` ícone branco, inativo fundo `#F3CECF` ícone vermelho.

## 5. Estrutura das telas

### Acesso (login) — `390:10`
- Fundo `#F6F6F6`. Esquerda: foto (alunos + professor) de x=80 até a metade, altura total; balão branco (raio 16) com logo GGE + noteasy e a frase "Aqui, enquanto o(a) aluno(a) pratica, o(a) professor(a) descobre onde focar." em `#1A3979` 20px.
- Direita: card branco (raio 16) com "Acessar" (vermelho 32px), campos E-mail e Senha (textfield), link "Recuperar senha" (azul sublinhado), botão primário **ACESSAR**, texto "Ainda não possui cadastro?" (`#8B1E18`), botão secundário **REALIZAR CADASTRO**.
- Tablet: só o card centralizado. Celular: card em largura total.

### Redefinição de senha — `655:893`
Mesmo layout do acesso. Card: "Redefinir senha", texto "Para criar nova senha atenda os critérios abaixo:", checklist com marcador circular (✕ vermelho / ✓ verde), campo Nova Senha, botão primário **Confirmar** e secundário **Voltar para login**.

### Cadastro (estudante / docente) — `405:64`, `405:82`, `617:1360`
Header branco com logos + "Cadastro - Estudante" em vermelho. Etapas numeradas ("1. Dados do(a) estudante", "1 de 3"): Identificar perfil → Dados do(a) estudante → Contato → Criar senha. Campos textfield empilhados, botão dependent até preencher, depois **PRÓXIMO**/**CRIAR SENHA**. Docente tem etapa extra "Disciplinas" (2/5…5/5).

### Início Sessão (aluno / professor) — `856:2149`, `1123:1294`
- **Header** 100px, branco, borda inferior 3px `#D12E25`, padding lateral 80: avatar 54px + nome (24px `#1A3979`) à esquerda; à direita "notificações", "suporte", "sair" (24px `#1A3979`, minúsculas) com ícones 32px.
- **Menu lateral**: item ativo é uma aba vermelha de 54px colada à borda esquerda (raio 8 à direita) com ícone + "Questões" (18px 600 branco); demais itens são quadrados 50px com fundo rosa e ícone vermelho, espaçados 28px.
- **Conteúdo**: busca rápida + alternância grade/lista no topo; painel translúcido (raio 14) com filtros e lista de cards; barra de rolagem azul `#4A6BA8` (8px).
- Professor: botão primário "Adicionar Nova Lista" acima da lista; card mostra turma e "Alunos que finalizaram/entregaram a lista X de 38".

### Resolver atividade — `903:2326` (questoes1..3)
Faixa vermelha "← Matemática | Desafio I: ..." colada à esquerda; caixa "Prazo entrega vencido" à direita (borda vermelha). Progresso laranja com % acima e "10 de 20". Card com cabeçalho `#4A6BA8` ("QUESTÃO 10" + estrelas de dificuldade), enunciado, alternativas com borda azul 1px e selecionada em `#B8C7E8`, tag do assunto. Paginação "10–20 [‹ ANTERIOR] [PRÓXIMA ›]" (anterior: branco/borda azul; próxima: `#4A6BA8`). Modal de envio: "FINALIZAR E ENVIAR RESPOSTAS?" com **SIM, CONFIRMAR ENVIO** / **NÃO, CANCELAR** e aviso de atraso quando fora do prazo.

---

## 6. Revisão do projeto — o que estava divergente e foi ajustado

| Área | Antes (projeto) | Agora (Figma) | Arquivos |
|---|---|---|---|
| Paleta | Azul `#2563EB` como primária, vermelho `#C1121F`, cinzas Tailwind | Tokens `--ne-*` do Figma; tokens legados (`--primary-blue` etc.) apontam para eles, então o branding da instituição continua funcionando | `src/global.css` |
| Tema antd | `colorPrimary #0958D9` (azul) | `#D12E25`, link `#1A3979`, raio 8, fonte Alexandria, `controlHeightLG` 54 | `src/index.js` |
| Fonte | Sistema / Inter / Segoe / Poppins | Alexandria + Roboto em todo o app | `public/index.html`, 8 CSS |
| Cores fixas | ~360 hex fora da paleta em 38 arquivos | Trocados por `var(--ne-*)` equivalente | vários `*.css` |
| Botão base | Azul, 44px, cinza quando desabilitado | Primary/Secundary/dependent do Figma, opção `size="lg"` (64px) | `src/ui/Button/*` |
| Login | Ícones nos campos, botão "ENTRAR", balão pequeno, layout quebrava no tablet (`translateX(250px)`) | Textfield do Figma, **ACESSAR** + estado dependent, balão azul 20px, tablet com card centralizado | `login/.../Login.module.css`, `LoginComponent.js` |
| Header | 70px, borda cinza, "Ajuda/Sair", avatar vermelho 40px | 100px, borda vermelha 3px, "notificações / suporte / sair" azul 24px, avatar 54px | `TopBar/*` |
| Menu lateral | Botões vermelhos com fundo branco e rótulo abaixo | Aba ativa vermelha colada à esquerda + quadrados rosa | `VerticalNavbar.css`, `BottomNavbar.css` |
| Layout | Fundo `#F8FAFC`, card branco com sombra | Fundo `#F6F6F6`, painel translúcido raio 14, scrollbar azul | `MainLayout.css` |
| Busca | Pílula cinza | Busca rápida com borda vermelha, 54px | `busca/GlobalSearch.module.css` |
| Redefinir senha | Imagem inexistente (`/assets/redefinir-senha.png`), input genérico, botão cinza desabilitado | Mesmo layout do login, textfield, checklist com marcador ✕/✓, botões do Figma | `senha/*` |
| Cadastros | Gradiente azul (aluno) e roxo (instituição) | Fundo cinza claro, card branco, título vermelho, botões 64px | `RegistrationComponent.css`, `InstituicaoRegister.module.css` |
| Questão / lista | Azul e verde Tailwind | Cabeçalho `#4A6BA8`, alternativas e paginação do Figma, tags e cards do design | `Question.css`, `Questoes.css` |

## 7. Pendências para a equipe decidir / implementar

1. **Regras de senha divergem**: Figma pede 6–12 caracteres, 1 símbolo e 1 maiúscula; o código (`RedefinirSenhaComponent.js` e `perfil/passwordRules.ts`) exige 8+, maiúscula, minúscula, número e especial. Precisa alinhar com o backend antes de mudar.
2. **Card List-default** completo (imagem 84px, prazo com ícone, seta) ainda não existe como componente React; as classes `.ne-tag`, `.ne-progress` e `.ne-filter` já estão prontas para montá-lo em `ActivityList`/`QuestionList`.
3. **Alternância grade/lista** e **busca rápida dentro do conteúdo** (no Figma ela fica abaixo do header, não dentro dele).
4. **Cadastro em etapas** ("1 de 3", máscaras com espaçamento de 15% entre dígitos) — o formulário atual de aluno é de etapa única.
5. **Estrelas de dificuldade** no cabeçalho da questão e caixa "Prazo entrega vencido".
6. Cores fixas dentro de arquivos `.tsx/.js` (estilos inline e gráficos) não foram varridas; usar `var(--ne-*)` ou `--chart-1..5`.
7. Página "Notas" do Figma (`371:7`) não foi revisada.
