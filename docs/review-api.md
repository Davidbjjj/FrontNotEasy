# Contrato da API de revisão da lista (FE-102)

**Implementado no back** (sem mock no front). O `revisaoService.ts` converte o
`RevisaoListaDTO` real (`respostaAluno`, `gabarito`, `alternativas[{ordem,texto}]`,
`assunto` como texto) para o modelo da tela. O JSON abaixo é a proposta original.

**Real:** `GET /listas/{id}/estudantes/{eid}/revisao` devolve **403** se a lista não foi
finalizada ou se o professor não liberou o gabarito; o front mostra o aviso de bloqueio.
O professor libera com `PUT /listas/{id}/gabarito-liberado` (`{ "liberado": true }`).
Ainda sem: questões abertas, disciplina, `liberadoEm` e `id` do assunto.

Tela: `/listas/{listaId}/revisao` (papel ALUNO). Links: "Revisar" no painel inicial e
"Ver gabarito e explicações" na página da lista finalizada.

## `GET /listas/{listaId}/estudantes/{estudanteId}/revisao`

Só o próprio aluno. Retorna 403 se a lista não foi finalizada por ele.

```json
{
  "listaId": "l1", "titulo": "Lista 1 — Funções", "disciplina": "Matemática",
  "regraGabarito": "APOS_ENTREGA",
  "gabaritoLiberado": true,
  "liberadoEm": null,
  "nota": 6.5, "notaMaxima": 10,
  "questoes": [
    { "tipo": "OBJETIVA", "questaoId": "q2", "numero": 2,
      "enunciado": "Quais são as raízes de x² − 5x + 6 = 0?",
      "assunto": { "id": "a2", "nome": "Função quadrática" },
      "alternativas": ["1 e 6", "2 e 3", "−2 e −3", "5 e 6"],
      "minhaResposta": 0, "respostaCerta": 1,
      "explicacao": "Soma = 5 e produto = 6, logo as raízes são 2 e 3." },
    { "tipo": "ABERTA", "questaoId": "q4", "numero": 4,
      "enunciado": "...", "assunto": { "id": "a1", "nome": "Função afim" },
      "minhaResposta": "texto do aluno", "nota": 1.5, "notaMaxima": 2,
      "feedback": "Boa definição!" }
  ]
}
```

- `minhaResposta` (objetiva) é o índice da alternativa (0 = A); `null` = em branco
  (conta como errada).
- Aberta sem correção: `nota: null`, `feedback: null` → a tela mostra "Aguardando correção".
- `assunto` pode ser `null`; é a chave para a evolução por assunto (FE-105). Enquanto
  a rota do FE-105 não existe, o assunto é exibido sem link (`evolucaoPath` em `revisaoLogic.ts`).
- `explicacao` pode ser `null` (a tela avisa que o professor não cadastrou).

## Regra de visibilidade do gabarito — PENDENTE com o produto

O front não decide a regra; obedece `gabaritoLiberado`. Proposta:

| `regraGabarito` | Quando libera |
|---|---|
| `APOS_ENTREGA` | assim que o aluno finaliza a lista |
| `APOS_PRAZO` | depois do prazo da atividade (`liberadoEm`) |

**Segurança:** quando `gabaritoLiberado = false`, o back-end **não deve enviar**
`respostaCerta`/`explicacao` (nem `questoes` com gabarito) — esconder só no front
exporia o gabarito no navegador. Nesse caso a tela mostra o aviso com a data
(`liberadoEm`) quando houver.

Pontos a decidir com o produto: a regra é global, por disciplina ou por atividade?
O professor pode escolher? Questão aberta já corrigida libera feedback antes do gabarito?
