# Contrato da API do professor (FE-201 a FE-209)

Implementado no back-end (`BackNotEasy`) e consumido por `src/professor/professorService.ts`.
Todas as rotas exigem `Authorization: Bearer <token>`. Salvo indicação, o papel é **PROFESSOR**
(**INSTITUICAO** também é aceita e enxerga o escopo da instituição). Aluno recebe `403`; sem token, `401`.
Erros de regra de negócio voltam como `400` com a mensagem em texto puro no corpo.

Datas e horas são instantes ISO-8601 em UTC (`2026-11-20T15:30:00Z`); o front converte para o fuso do navegador.

## Modelo novo

- **Questão** ganhou `tipo` (`OBJETIVA` | `ABERTA`), `rubrica` (só aberta, só o professor vê), `dificuldade`
  (`FACIL` | `MEDIA` | `DIFICIL`) e `tags[]`.
- **Resposta** ganhou `textoResposta`, `notaQuestao` (0–10), `feedback` e `corrigidaEm` (nulo = pendente).
- **Lista** ganhou `abreEm`, `fechaEm`, `maxTentativas`, `regraNota`, `tempoLimiteMinutos`, `embaralharQuestoes`,
  `embaralharAlternativas` e `status` (`RASCUNHO` | `PUBLICADA`; listas antigas contam como publicadas).
- `ListaResponseDTO` (`GET /listas/professor/{id}` etc.) agora devolve também `disciplinaId`, `disciplinaNome`, `status`
  e as regras acima. `fechaEm` alimenta o "prazo" dos cartões de lista.

## FE-201 · Fila de correção

- `POST /listas/{listaId}/questoes` — cria questão. Corpo: `{ tipo, cabecalho?, enunciado, alternativas?, gabarito?,
  rubrica?, assunto?, dificuldade?, tags? }`. Objetiva exige ≥ 2 alternativas e `gabarito`; aberta não tem alternativas.
- Aluno envia a resposta aberta em `POST /enviaresposta` ou `POST /respostas/multiplas` com `textoResposta`
  (≤ 10 000 caracteres, obrigatório em questão aberta). Reenviar com texto diferente volta a resposta para a fila.
- `GET /correcao/pendentes?listaId=&disciplinaId=&busca=` → `{ total, items[], listas[], disciplinas[] }`.
  Só entram respostas de alunos que **finalizaram** a lista. `listas`/`disciplinas` são as opções de filtro (sem filtrar).
  "Turma" = disciplina (o sistema não tem turma separada).
- `GET /correcao/respostas/{id}` → resposta do aluno + enunciado + `rubrica` + `restantes` (pendentes no total).
- `PUT /correcao/respostas/{id}` `{ nota, feedback? }` → `{ respostaId, restantes, notaLancada }`.
  Nota 0–10 (até 2 casas). Recalcula a nota da lista. Quando a **última** resposta aberta da lista daquele aluno é corrigida,
  gera notificação `NOTA_LANCADA` (link `/listas/{id}/revisao` se o gabarito está liberado, senão `/listas/{id}/questoes`).
- **Nota da lista:** cada questão vale 1/total. Objetiva = 0 ou 1; aberta = nota/10 (pendente = 0, por isso a nota é parcial
  até corrigir). `visao`/`finalizar` devolvem `pendenteCorrecao`.
- `GET /listas/{id}/estudantes/{eid}/revisao` — itens `ABERTA` trazem `textoResposta`, `notaQuestao`, `feedback`, `corrigida`.

## FE-202 · Banco de questões

Escopo: questões das listas do professor.

- `GET /banco-questoes?q=&assunto=&dificuldade=&tag=&disciplinaId=&tipo=&page=&size=` →
  `{ items[], page, size, totalElements, totalPages }`. `q` busca (sem acento, sem maiúsculas) em enunciado, cabeçalho,
  assunto e tags. `size` máx. 50.
- `GET /banco-questoes/filtros` → `{ assuntos[], tags[], disciplinas[] }`.
- `GET /banco-questoes/{id}` — pré-visualização completa (com imagens).
- `PATCH /banco-questoes/{id}` — corpo parcial `{ tags?, dificuldade?, assunto? }`. `dificuldade: null` limpa.
- `POST /banco-questoes/adicionar-a-lista` `{ listaId, questaoIds[] }` → `{ adicionadas, ignoradas, listaId }`.
  Cada questão pertence a uma única lista, então **copia** (inclusive imagens). Enunciado já presente na lista é ignorado.

## FE-203 · Ações no analytics

- `POST /listas/{id}/reabrir` `{ fechaEm, permitirNovaTentativa? }` → `{ lista, notificados }`. `fechaEm` no futuro.
  Com `permitirNovaTentativa` (padrão `true`) soma 1 em `maxTentativas`, para quem já entregou refazer. Notifica
  todos os alunos da lista (`PRAZO`).
- `POST /professor/avisar-alunos` `{ estudanteIds[], mensagem, titulo? }` → `{ enviados }`. Notificação `GERAL`.
  Só alunos das disciplinas do chamador (senão `403`). Mensagem 1–500 caracteres.
- `GET /disciplinas/{id}/assuntos-fracos?limite=5` → `[{ assunto, taxaAcerto (0–100), respostas, questoes }]`, do pior ao melhor.
- `POST /listas/reforco` `{ disciplinaId, titulo, assuntos[], estudanteIds[], quantidadePorAssunto?, publicar, fechaEm? }`
  → `{ lista, questoes, alunos }`. Copia até `quantidadePorAssunto` (padrão 3, máx. 10) questões do banco do professor por
  assunto. `estudanteIds` vazio = toda a disciplina. `publicar=false` cria rascunho. `400` se não houver questões.

## FE-204 · Alunos em risco

`GET /professor/alunos-em-risco?disciplinaId=&todos=false&mediaMinima=&diasSemAcesso=&listasAtrasadas=`

```json
{ "criterios": { "mediaMinima": 6.0, "diasSemAcesso": 14, "listasAtrasadas": 1, "regra": "Em risco quando: …" },
  "items": [{ "estudanteId": "…", "nome": "…", "email": "…", "media": 4.5, "ultimoAcesso": "…",
              "diasSemAcesso": 20, "listasAtrasadas": 2, "listasPendentes": 3,
              "motivos": ["MEDIA_BAIXA", "SEM_ACESSO", "LISTAS_ATRASADAS"], "nivel": "ALTO" }],
  "totalAlunos": 30, "disciplinas": [{ "id": "…", "nome": "…" }] }
```

**Critérios (valores padrão, a definir com o produto; os parâmetros da query só servem para testar):**
média das listas entregues < 6,0; sem acesso há ≥ 14 dias (ou nunca); ≥ 1 lista com prazo vencido sem entrega.
Dois ou mais motivos = `ALTO`; um = `MEDIO`. `todos=true` inclui quem não está em risco.

- **Último acesso:** o back registra um acesso do aluno a cada 30 minutos de uso (qualquer requisição autenticada de ALUNO).
  Sem acesso registrado = "nunca acessou".
- **Prazo da lista:** `fechaEm`; se vazio, a menor data das atividades (`Evento`) ligadas à lista.
- Ações em lote reutilizam `POST /professor/avisar-alunos` e `POST /listas/reforco`.

## FE-205 · Configuração avançada da lista

- `GET /listas/{id}/configuracao` → `ListaResponseDTO`.
- `PUT /listas/{id}/configuracao` `{ abreEm?, fechaEm?, maxTentativas?, regraNota?, tempoLimiteMinutos?,
  embaralharQuestoes?, embaralharAlternativas? }`. `fechaEm > abreEm`; tentativas 1–20; `regraNota` `MAIOR` (padrão) ou
  `ULTIMA`; tempo 1–600 min. Campo ausente/nulo = sem restrição.
- **Aplicação (back-end):** fora da janela, em rascunho, após o tempo limite ou com a lista já finalizada, as rotas de
  resposta devolvem `400` com a mensagem. O tempo limite conta da **primeira resposta**; ao esgotar, o aluno pode finalizar
  mesmo incompleto. `maxTentativas` nulo = **1 tentativa** (comportamento anterior).
- `POST /listas/{id}/estudantes/{eid}/nova-tentativa` — apaga as respostas e reabre a lista (aluno, se ainda tiver
  tentativa e prazo). Regra `MAIOR`: a nota exibida segue sendo a melhor; `ULTIMA`: vale a última.
- `GET /listas/{id}/estudantes/{eid}/visao` e `POST …/finalizar` devolvem `config`:
  `{ aberta, abreEm, fechaEm, tempoLimiteMinutos, prazoFinal (epoch ms), maxTentativas, tentativasUsadas, regraNota,
  podeNovaTentativa, pendenteCorrecao }`. O front usa `prazoFinal` no contador regressivo.
- **Embaralhar:** para o aluno, `GET /listas/{id}/questoes` e a visão devolvem questões/alternativas em ordem estável por
  aluno+lista. Cada alternativa mantém a `ordem` original, que é o índice que o gabarito e `alternativa` usam.

## FE-206 · Duplicar lista

- `POST /listas/{id}/duplicar` `{ disciplinaId, titulo?, abreEm?, fechaEm? }` → lista nova com `status: "RASCUNHO"`.
  A disciplina de destino precisa ser do professor. Copia questões (e imagens) e as regras; **não** copia alunos nem notas.
- `POST /listas/{id}/publicar` — `PUBLICADA`; atribui os alunos da disciplina e envia `LISTA_NOVA`. Exige ≥ 1 questão.
- Rascunho não aparece em `GET /listas/estudante/{id}` e não aceita respostas.

## FE-207 · Perfil do aluno

`GET /professor/alunos/{estudanteId}/perfil` (`403` se o aluno não está em disciplina do chamador)

```json
{ "id": "…", "nome": "…", "email": "…", "instituicao": "…",
  "disciplinas": [{ "id": "…", "nome": "…" }],
  "resumo": { "media": 7.2, "entregues": 4, "atrasadas": 1, "naoFeitas": 2 },
  "historico": [{ "listaId": "…", "titulo": "…", "disciplinaId": "…", "disciplinaNome": "…", "nota": 8.0,
                  "status": "ENTREGUE", "prazo": "…", "entregueEm": "…", "tentativas": 1 }],
  "evolucao": { "disciplinas": [], "notas": [], "assuntos": [] },
  "acessos": ["…"] }
```

`status`: `ENTREGUE`; `ATRASADA` = prazo vencido sem entrega; `NAO_FEITA` = não entregue e ainda dentro do prazo (ou sem prazo).
`evolucao` tem exatamente o formato de `GET /estudante/{id}/evolucao` ([evolution-api.md](./evolution-api.md)), então a tela
reaproveita os gráficos da FE-105 (`EvolucaoConteudo`). `acessos`: últimos 10.

## FE-208 · Exportar notas

- `GET /exportacoes/colunas` → `[{ chave, titulo }]` (`aluno, email, disciplina, lista, nota, porcentagem, acertos,
  totalQuestoes, status, entregueEm, tentativas`).
- `POST /exportacoes` `{ escopo: "LISTA"|"DISCIPLINA", alvoId, formato: "CSV"|"PDF", colunas[] }` → `202` com a exportação
  (`status: "PROCESSANDO"`). O arquivo é gerado em segundo plano.
- `GET /exportacoes` (últimas 20) · `GET /exportacoes/{id}` → `{ id, escopo, alvoNome, formato, status, nomeArquivo, erro,
  criadaEm, concluidaEm }` com `status` `PROCESSANDO` | `PRONTA` | `ERRO`. O front consulta a cada 3 s enquanto houver
  arquivo em andamento.
- `GET /exportacoes/{id}/arquivo` — download (`409` se ainda não está pronto). Ao terminar, o professor recebe uma
  notificação `GERAL` (link `/exportar-notas`).
- CSV: UTF-8 com BOM, separador `;`, números com vírgula; células que começam com `= + - @` são neutralizadas contra
  injeção de fórmula. PDF: paisagem, paginado.

## FE-209 · Mural de avisos

- `GET /disciplinas/{id}/avisos` — professor dono, instituição ou aluno matriculado. Fixados primeiro, depois mais novos.
- `POST /disciplinas/{id}/avisos` — `multipart/form-data`: `titulo` (≤ 150), `texto` (≤ 5 000), `fixado`, `anexo?`
  (PDF, PNG, JPG ou TXT, ≤ 5 MB). `201`. Notifica os alunos (`GERAL`, link `/disciplinas/{id}`).
- `PATCH /avisos/{id}/fixar` `{ fixado }` · `DELETE /avisos/{id}` (`204`) · `GET /avisos/{id}/anexo` (download autenticado).
- `texto` é **markdown simples** (`**negrito**`, `_itálico_`, linhas com `- `, `[texto](https://…)`). O front renderiza como
  elementos React, nunca como HTML, e só aceita links `http(s)`.

## Notificações

Nenhum tipo novo: reaproveita `NOTA_LANCADA`, `PRAZO`, `LISTA_NOVA` e `GERAL` (ver [notifications-api.md](./notifications-api.md)),
então as preferências em `/perfil` continuam valendo.

## Telas

| Rota | Papel | Tela |
|---|---|---|
| `/correcao` | PROFESSOR | Fila de correção (FE-201) |
| `/banco-questoes` | PROFESSOR | Banco de questões (FE-202) |
| `/alunos-em-risco` | PROFESSOR, INSTITUICAO | Alunos em risco (FE-204) |
| `/alunos/:estudanteId` | PROFESSOR, INSTITUICAO | Perfil do aluno (FE-207) |
| `/exportar-notas` | PROFESSOR, INSTITUICAO | Exportar notas (FE-208) |
| `/disciplinas/:id` | todos | Analytics com ações (FE-203) e mural (FE-209) |
| `/listas` | PROFESSOR | Regras (FE-205) e duplicar (FE-206) em cada lista |
