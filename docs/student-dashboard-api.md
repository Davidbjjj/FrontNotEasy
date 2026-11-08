# API do dashboard do aluno (FE-101)

Implementada no back-end; o front consome a API real
(`src/estudante/dashboard/dashboardService.ts`), sem mock.

## `GET /estudantes/{estudanteId}/dashboard`

Só o próprio aluno logado pode consultar (senão 403). Instantes em ISO 8601 com
offset, no fuso do aluno. Fuso: header `X-Timezone` (IANA) > `Estudante.fusoHorario`
> `America/Sao_Paulo`.

```json
{
  "estudanteId": "uuid",
  "nome": "Ana",
  "fusoHorario": "America/Sao_Paulo",
  "totalDisciplinas": 3,
  "sequencia": { "diasConsecutivos": 4, "ultimaAtividadeEm": "2026-11-08T21:30:00-03:00" },
  "emAndamento": [
    { "listaId": "uuid", "titulo": "Lista 1", "disciplinaId": "uuid", "disciplinaNome": "Matemática",
      "questoesRespondidas": 4, "totalQuestoes": 8, "ultimaAtividadeEm": "2026-11-08T21:30:00-03:00" }
  ],
  "proximasEntregas": [
    { "eventoId": "uuid", "titulo": "Atividade 1", "disciplinaId": "uuid",
      "disciplinaNome": "Física", "prazo": "2026-11-12T23:59:00-03:00" }
  ],
  "ultimasNotas": [
    { "listaId": "uuid", "titulo": "Lista 0", "disciplinaId": "uuid", "disciplinaNome": "Matemática",
      "nota": 8.5, "notaMaxima": 10, "corrigidaEm": "2026-11-08T21:30:00-03:00" }
  ]
}
```

- `emAndamento`: listas com respostas parciais, mais recente primeiro, até 10.
  A primeira vira o cartão "Continuar de onde parou".
- `proximasEntregas`: atividades (eventos) pendentes, até 5. Abrem em `/atividades/{eventoId}`.
  O calendário (FE-107) usa esta mesma lista, então mostra no máximo 5 entregas.
- `ultimasNotas`: listas **finalizadas** com nota (escala 0 a 10), mais recentes primeiro, até 5;
  `corrigidaEm` é a última resposta da lista. Cada uma tem link "Revisar" para
  `/listas/{listaId}/revisao` (FE-102, `docs/review-api.md`).
- `sequencia.diasConsecutivos`: dias seguidos com resposta, contando até hoje ou até
  ontem. O front calcula "ativo hoje" comparando `ultimaAtividadeEm` com a data de hoje
  em `fusoHorario`.
- `totalDisciplinas = 0` faz o front mostrar o estado vazio.

## Não existe no endpoint

Recorde de sequência: a linha "Recorde" foi removida do painel. Se for necessária,
o back precisa expor esse campo.
