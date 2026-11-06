# Contrato da API do dashboard do aluno (FE-101)

Proposta do front-end. Enquanto o back-end não implementa, o front usa um
**mock** (`src/estudante/dashboard/dashboardService.ts`). Para a API real:
`REACT_APP_STUDENT_DASHBOARD_MOCK=false`.

## `GET /estudante/{estudanteId}/dashboard`

Só o próprio aluno (ou papéis autorizados) pode consultar. Datas em ISO 8601.

```json
{
  "totalDisciplinas": 3,
  "proximasListas": [
    { "id": "l1", "titulo": "Lista 1 — Funções", "disciplina": "Matemática",
      "prazo": "2026-01-12T20:00:00Z", "respondidas": 4, "total": 8 }
  ],
  "ultimasNotas": [
    { "listaId": "l0", "titulo": "Lista 0 — Revisão", "disciplina": "Matemática",
      "nota": 8.5, "notaMaxima": 10, "corrigidaEm": "2026-01-09T14:00:00Z" }
  ],
  "sequencia": { "atual": 4, "recorde": 12, "ativoHoje": false },
  "emAndamento": { "listaId": "l1", "titulo": "Lista 1 — Funções", "disciplina": "Matemática",
                   "respondidas": 4, "total": 8 }
}
```

- `proximasListas`: listas **pendentes** (não finalizadas). O front reordena por
  `prazo` (sem prazo por último) e destaca as que vencem em até 48 h; vencidas
  aparecem como "Atrasada". Sugestão: limitar a ~10 itens.
- `ultimasNotas`: mais recentes primeiro; sugestão de limite 5.
- `sequencia.atual`: dias consecutivos com atividade, **no fuso do aluno**,
  contando até hoje — ou até ontem se `ativoHoje` for `false` (sequência "em risco").
  Definição de "atividade" (ex.: ao menos uma resposta enviada) fica a cargo do back-end.
- `emAndamento`: lista com respostas parciais mais recente; `null` se não houver.
- `totalDisciplinas = 0` faz o front mostrar o estado vazio.

## Origem do prazo

No front atual o prazo pertence à **atividade** (evento, campo `prazo`,
`YYYY-MM-DD`), que agrupa listas; a lista em si não tem prazo. Por isso
`proximasListas[].prazo` deve ser o prazo da atividade que contém a lista.
Lista fora de qualquer atividade vem com `prazo: null` (aparece no fim, "Sem prazo").
Se estiver em mais de uma atividade, usar o prazo mais próximo ainda não vencido.
Como o `prazo` da atividade pode vir só com a data, o back-end deve devolver o
fim do dia no fuso do aluno (ISO 8601 com offset), para o corte de 48 h ser correto.

## Revisão da lista

Ainda não há tela de revisão questão a questão. Os links "Revisar" abrem
`/listas/{listaId}/questoes`, que para lista já finalizada mostra nota, acertos e
progresso. Quando a revisão existir, trocar `revisaoPath` em
`StudentDashboardPage.tsx`.

## Back-end

Endpoint **ainda não implementado**; até lá o front usa o mock. Ao implementar,
ligar com `REACT_APP_STUDENT_DASHBOARD_MOCK=false` e validar com um aluno real.
