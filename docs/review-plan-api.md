# Contrato da API do plano de revisão (FE-106)

Proposta do front-end. Enquanto o back-end não implementa, o front usa um **mock**
(`src/estudante/plano/planoService.ts`). Para a API real: `REACT_APP_REVIEW_PLAN_MOCK=false`.

Tela (papel ALUNO): `/plano-revisao`. Links de entrada: painel inicial e página de evolução.

> O repositório só tem a análise com IA do lado do professor (`Sugestões IA` em
> `DisciplinaAnalyticsPage`). Não há endpoint de IA para o aluno, então este contrato é novo:
> o back-end deve reaproveitar o mesmo motor, alimentado pelos erros do aluno.

## `GET /estudante/{estudanteId}/plano-revisao`

Só o próprio aluno.

```json
{
  "geradoEm": "2026-11-08T12:00:00Z",
  "assuntos": [
    { "assuntoId": "a2", "nome": "Função quadrática", "disciplina": "Matemática",
      "motivo": "5 erros nas últimas 2 listas. Você confundiu soma e produto das raízes.",
      "erros": 5, "listas": 2, "revisado": false, "revisadoEm": null }
  ]
}
```

- `assuntos` já vem **ordenado por prioridade**; o front só move os revisados para o fim.
- `motivo` é texto da IA; o front o exibe como texto puro (nunca HTML).
- `erros`/`listas`: números exatos (não gerados pela IA) que sustentam a recomendação.
  Em branco conta como errada (mesma regra de FE-102/FE-105).
- `assuntoId` é o mesmo de FE-105: o link "Ver questões erradas" leva a `/evolucao/assuntos/{assuntoId}`.
- **Segurança:** só entram assuntos/erros de listas com gabarito liberado (regra do FE-102),
  senão o plano revelaria o resultado antes da hora.

## `PUT /estudante/{estudanteId}/plano-revisao/assuntos/{assuntoId}/revisado`

```json
{ "revisado": true }
```

Resposta: `{ "revisadoEm": "2026-11-08T12:05:00Z" }` (`null` quando `revisado = false`).

Ponto a decidir com o produto: quando o aluno **volta a errar** um assunto já revisado, o back-end
deve reabrir a recomendação (`revisado = false`)? O front apenas obedece o que vier no GET.

## Aviso de IA

A tela sempre mostra o aviso "Recomendação gerada por inteligência artificial" (com a data de
`geradoEm`), mesmo no estado vazio.
