# Contrato da API da instituição (FE-301 a FE-309)

Implementado no back-end (`BackNotEasy`) e consumido por `src/instituicao/gestao/gestaoService.ts`.
Todas as rotas `/instituicao/**` valem para **a instituição de quem está logado** (nunca há id de instituição na URL) e
exigem uma permissão da matriz (FE-306). A conta **INSTITUICAO é o ADMIN** e tem todas as permissões. Um professor
com papel **COORDENADOR** usa o mesmo login de professor; o que ele pode fazer vem da matriz.
Sem token: `401`. Sem permissão: `403`. Regra de negócio violada: `400` com a mensagem em texto puro.

## Papéis e permissões (FE-306)

Papéis: `ADMIN` (fixo, tudo), `COORDENADOR` e `PROFESSOR` (editáveis). Permissões:

| Chave | O que libera | Padrão COORDENADOR | Padrão PROFESSOR |
|---|---|---|---|
| `VER_DASHBOARD` | dashboard executivo | sim | – |
| `VER_RELATORIOS` | comparativos | sim | – |
| `IMPORTAR_USUARIOS` | importação CSV | – | – |
| `GERIR_CONVITES` | convites | sim | – |
| `GERIR_PERIODOS` | períodos, turmas, arquivamento | sim | – |
| `EMITIR_BOLETINS` | boletins e relatório de risco/evasão | sim | – |
| `EDITAR_CONFIGURACOES` | identidade e regras padrão | – | – |
| `CORRIGIR` | fila de correção (FE-201) | sim | sim |
| `BANCO_QUESTOES` | banco de questões (FE-202) | sim | sim |
| `VER_ALUNOS_RISCO` | alunos em risco e perfil (FE-204/207) | sim | sim |
| `EXPORTAR_NOTAS` | exportar notas (FE-208) | sim | sim |
| `GERIR_PAPEIS` | esta matriz e atribuir papéis | **só admin** | **só admin** |
| `VER_AUDITORIA` | log de auditoria | **só admin** | **só admin** |

As rotas do professor (`/correcao`, `/banco-questoes`, risco, perfil do aluno e exportações) agora também checam a matriz.

- `GET /instituicao/minhas-permissoes` (qualquer professor/instituição) → `{ papel, instituicaoId, permissoes[] }`.
  O front esconde do menu o que não tem permissão (menu principal e área da instituição); o back continua negando com `403`.
- `GET /instituicao/permissoes` → `{ papeis[], permissoes[{chave,titulo,somenteAdmin}], matriz{papel:[chaves]} }`.
- `PUT /instituicao/permissoes` `{ papel, permissoes[] }` — só `COORDENADOR`/`PROFESSOR`; `400` para chave desconhecida ou reservada ao admin.
- `GET /instituicao/usuarios` → professores com `papel` (`COORDENADOR` | `PROFESSOR`).
- `PUT /instituicao/usuarios/{professorId}/papel` `{ papel }`.

## FE-301 · Importação em massa

CSV com separador `;` ou `,`, UTF-8 (BOM aceito), até 2 MB e 2000 linhas. Colunas (nomes sem acento/maiúscula):

- **Alunos:** `nome`, `email`, `data_nascimento` (AAAA-MM-DD ou DD/MM/AAAA, obrigatória), `disciplinas` (nomes separados por `|`, opcional).
- **Professores:** `nome`, `email`, `disciplinas` (opcional). Quem é listado vira o professor da disciplina.

- `POST /instituicao/importacao/previa` — `multipart` `tipo` (`ALUNOS`|`PROFESSORES`) + `arquivo` → `{ tipo, colunas[], linhas[], resumo }`.
  Cada linha: `{ numero (linha do arquivo, 1 = cabeçalho), dados, status, erros[] }`, `status` = `NOVO` | `ATUALIZAR` | `IGNORAR` (existe e não mudou) | `ERRO`.
  Validações: nome e e-mail obrigatórios, e-mail inválido, e-mail repetido no arquivo, data inválida/futura, disciplina inexistente ou
  arquivada, e-mail que já pertence a outra instituição ou a outro papel. **Não grava nada.**
- `POST /instituicao/importacao/confirmar` — mesmo corpo; reanalisa e aplica as linhas `NOVO`/`ATUALIZAR`. → `{ resumo{total,novos,atualizados,ignorados,erros}, comErro[], convitesGerados }`.
  Cada pessoa nova é criada com senha aleatória inutilizável e recebe um **convite** para definir a senha (FE-302).
- O modelo de CSV e o relatório de erros (linha, campos, erros) são gerados no front.

## FE-302 · Convites

- `POST /instituicao/convites` `{ email, nome?, papel (PROFESSOR|COORDENADOR|ALUNO), disciplinaIds[] }` → `201` com `{ id, email, nome, papel, disciplinas[], status, criadoEm, expiraEm, aceitoEm, link }`.
  `link` (`{FRONT}/convite/{token}`) só vem **ao criar e ao reenviar**; o token nunca é guardado (só o hash SHA-256). Vale 7 dias. O e-mail é enviado
  se o SMTP estiver configurado; o front mostra o link para copiar. `409` se o e-mail já tem conta. Um convite pendente anterior do mesmo e-mail é cancelado.
- `GET /instituicao/convites` — `status`: `PENDENTE` | `ACEITO` | `EXPIRADO` (pendente vencido) | `CANCELADO`.
- `POST /instituicao/convites/{id}/reenviar` — gera link novo (o antigo deixa de valer) e renova a validade. `409` se já aceito.
- `DELETE /instituicao/convites/{id}` — cancela. `409` se já aceito.
- **Público** `GET /convites/{token}` → `{ instituicao, email, nome, papel, disciplinas[], status, contaPreCriada }` (`404` se o token não existe).
- **Público** `POST /convites/{token}/aceitar` `{ nome?, senha, dataNascimento? }` → `{ email, papel }`. Senha: 8+ caracteres, maiúscula, minúscula e número.
  Aluno exige `dataNascimento`. Vincula às disciplinas (professor passa a ser o dono; aluno é matriculado). `410` se cancelado, aceito ou expirado.
  O gestor recebe uma notificação `GERAL` ("Convite aceito").
- Tela do convidado: `/convite/:token` (sem menu).

## FE-303 · Dashboard executivo

`GET /instituicao/dashboard?inicio=&fim=&disciplinaId=` (datas `AAAA-MM-DD`; padrão últimos 30 dias)
→ `{ periodo{inicio,fim,inicioAnterior,fimAnterior}, disciplinaId, kpis[], disciplinas[] }`. O período anterior tem a mesma duração, logo antes.

| `chave` | Definição |
|---|---|
| `ALUNOS_ATIVOS` | alunos das disciplinas com ao menos um acesso ao app no período |
| `MEDIA_GERAL` | média (0–10) das notas das listas **finalizadas** no período |
| `ENTREGAS_NO_PRAZO` | % das finalizações do período feitas até o prazo (`fechaEm`, ou a data da atividade; sem prazo conta como no prazo) |

Cada KPI: `{ chave, titulo, unidade, valor, anterior, variacaoPct }`; `variacaoPct` é relativa e `null` quando o anterior é 0/ausente.
- `GET /instituicao/dashboard/detalhe?kpi=&inicio=&fim=&disciplinaId=` → `{ kpi, titulo, periodo, linhas[] }` com uma linha por disciplina
  (`alunos, alunosAtivos, mediaGeral, entregas, pctNoPrazo`). O card do KPI leva a `/instituicao/dashboard/{KPI}?...` com o mesmo recorte.

## FE-304 · Períodos, turmas, rematrícula e arquivamento

- `GET/POST /instituicao/periodos`, `PUT /instituicao/periodos/{id}` — `{ nome, inicio, fim }` (`fim >= inicio`). Resposta inclui `turmas` e `vigente`.
- `GET /instituicao/turmas?periodoId=`, `POST /instituicao/turmas`, `PUT /instituicao/turmas/{id}` — `{ nome, periodoId, alunoIds[], disciplinaIds[] }`.
  Salvar **matricula** todos os alunos da turma em todas as disciplinas dela. Disciplina arquivada não pode entrar numa turma.
- `POST /instituicao/turmas/rematricula` `{ turmaIds[], periodoDestinoId, sufixoNome?, excluirAlunoIds?, disciplinaIds? }` →
  `{ criadas[], ignoradas[], alunosMatriculados }`. Copia cada turma para o período de destino (mesmos alunos e disciplinas, salvo override).
  Turma de mesmo nome no destino é ignorada; destino igual à origem é `400`. A turma de origem não muda (histórico).
- `GET /instituicao/disciplinas-gestao` e `PATCH /instituicao/disciplinas/{id}/arquivar` `{ arquivada }`.
  **Arquivada = somente leitura:** continua visível com todo o histórico, mas o back recusa (`400`) respostas de alunos, correção, regras/publicação/reabertura
  de lista, duplicar ou criar reforço nela e novos avisos no mural. Reativar desfaz.
- `GET /instituicao/alunos` — alunos da instituição (para montar turmas).

## FE-305 · Relatórios comparativos

- `GET /instituicao/relatorios/comparativo?por=TURMA|DISCIPLINA|PROFESSOR&ids=&inicio=&fim=` (padrão 30 dias) →
  `{ por, periodo, linhas[{ id, nome, professor, alunos, alunosAtivos, mediaGeral, entregas, pctNoPrazo }] }`.
  Turma: só os alunos da turma nas disciplinas dela. Professor: todas as disciplinas dele.
- `GET /instituicao/relatorios/comparativo/exportar?...&formato=csv|pdf` — mesmos dados. O gráfico usa uma escala 0–100 (média × 10, % no prazo, % ativos)
  e a tabela traz os valores brutos.

## FE-306 · ver "Papéis e permissões" acima.

## FE-307 · Log de auditoria (só admin)

`GET /instituicao/auditoria?usuarioId=&acao=&inicio=&fim=&page=` → `{ items[], page, size, totalElements, totalPages, acoes[], usuarios[] }`,
`items[]`: `{ id, criadoEm, usuarioId, usuarioNome, acao, entidade, entidadeId, descricao, valorAnterior, valorNovo }`.

Registrado hoje: `NOTA_LANCADA`/`NOTA_ALTERADA` (questão aberta e nota de atividade — ex.: `6.00` → `7.50`), `CONFIG_LISTA`, convites
(`CONVITE_CRIADO/REENVIADO/CANCELADO/ACEITO`), `IMPORTACAO_ALUNOS/PROFESSORES`, `PAPEL_ALTERADO`, `PERMISSOES_ALTERADAS`, períodos, turmas,
`REMATRICULA_EM_LOTE`, `DISCIPLINA_ARQUIVADA/DESARQUIVADA`, `CONFIG_INSTITUICAO`, logo, boletins e relatórios emitidos.
Registrar nunca derruba a operação principal. O log não é editável nem apagável pela API.

## FE-308 · Boletim e relatórios externos (`EMITIR_BOLETINS`)

- `GET /instituicao/boletim/turma/{turmaId}` — PDF com **uma página por aluno** (geração em lote).
- `GET /instituicao/boletim/aluno/{estudanteId}?periodoId=` — PDF de um aluno (usa a turma dele no período).
- `GET /instituicao/relatorios/risco-evasao?turmaId=&formato=pdf|csv` — risco e evasão da turma (mesmos critérios do FE-204).
- Cabeçalho com o logo da instituição (FE-309) e o período. O boletim traz, por disciplina: média das listas **entregues dentro do período**,
  entregues/total e atrasadas.

## FE-309 · Configurações

- `GET/PUT /instituicao/configuracoes` — `{ corPrincipal (#RRGGBB|null), tentativasPadrao, tempoLimitePadraoMinutos, gabaritoLiberadoPadrao }`
  e, na resposta, `temLogo`, `logoUrl`, `integracoes[]`. A cor é recusada (`400`) se o texto branco sobre ela tiver contraste < 4,5:1 (WCAG AA).
- `POST /instituicao/configuracoes/logo` (`multipart`, campo `logo`, PNG/JPG real, até 1 MB) · `DELETE /instituicao/configuracoes/logo`.
- `GET /branding/minha` (autenticado) → `{ corPrincipal, logoUrl }` da instituição de quem está logado (instituição, professor ou aluno).
  O front aplica `--primary-blue`, `--primary-dark` e `--color-focus` (tokens do FE-001) e mostra o logo no topo.
- `GET /branding/{instituicaoId}/logo` — imagem pública (sem dado pessoal), cacheável.
- **Regras padrão** valem só para listas criadas depois, na criação (`POST /listas/disciplina/{id}`): tentativas, tempo limite e gabarito liberado.
- **Integrações:** `[{ chave: SSO|DIARIO|LMS, nome, situacao: "EM_BREVE" }]`. Nenhuma ativa; a área só existe para as próximas conexões.

## Telas

Tudo em `/instituicao/{tela}` (menu lateral só com o que o papel pode usar): `dashboard` (e `dashboard/{KPI}`), `importacao`, `convites`,
`periodos`, `comparativos`, `boletins`, `papeis`, `auditoria`, `personalizacao`; as telas antigas de cadastro um a um (`professores`, `disciplinas`,
`estudantes`, `associacoes`, `configuracoes`) ficam só para o admin. Público: `/convite/:token`. Coordenador ganha "Instituição" no menu principal.
