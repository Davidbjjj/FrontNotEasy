# Contrato da API de evolução e desempenho (FE-105)

Proposta do front-end. Enquanto o back-end não implementa, o front usa um **mock**
(`src/estudante/evolucao/evolucaoService.ts`). Para a API real: `REACT_APP_EVOLUTION_MOCK=false`.

Telas (papel ALUNO): `/evolucao` (menu "Evolução") e `/evolucao/assuntos/{assuntoId}`.
O assunto exibido na revisão da lista (FE-102) também leva à segunda tela.

## `GET /estudante/{estudanteId}/evolucao`

Só o próprio aluno. O filtro por disciplina é feito no front sobre esta resposta.

```json
{
  "disciplinas": [{ "id": "d1", "nome": "Matemática" }],
  "notas": [
    { "listaId": "l1", "titulo": "Lista 1 — Funções", "disciplinaId": "d1",
      "data": "2026-01-10T15:00:00Z", "nota": 6.5, "notaMaxima": 10 }
  ],
  "assuntos": [
    { "id": "a2", "nome": "Função quadrática", "disciplinaId": "d1", "acertos": 3, "total": 8 }
  ]
}
```

- `notas`: uma por lista **com nota lançada**. O front normaliza para 0–10 (`nota / notaMaxima`),
  então listas com máximos diferentes ficam comparáveis. `data` = quando a nota foi lançada.
- `assuntos`: só questões **objetivas** (aberta não tem certo/errado binário). `total` conta
  as respondidas, **em branco conta como errada** (mesma regra da revisão). Assuntos com
  `total = 0` são ignorados.
- `disciplinas`: as do aluno; alimenta o filtro.

## `GET /estudante/{estudanteId}/assuntos/{assuntoId}/erradas`

```json
{
  "assunto": { "id": "a2", "nome": "Função quadrática" },
  "disciplina": "Matemática",
  "questoes": [
    { "questaoId": "q2", "listaId": "l1", "listaTitulo": "Lista 1 — Funções", "numero": 2,
      "enunciado": "...", "alternativas": ["1 e 6", "2 e 3"], "minhaResposta": 0,
      "respostaCerta": 1, "explicacao": "..." }
  ]
}
```

- `minhaResposta`: índice (0 = A); `null` = em branco.
- **Segurança:** o back-end só deve incluir questões de listas cujo gabarito já foi liberado
  (regra do FE-102, `gabaritoLiberado`); senão `respostaCerta`/`explicacao` vazariam para o navegador.
  Questões de listas ainda bloqueadas devem ser omitidas desta resposta (e, idealmente, não
  entrar no `acertos/total` até a liberação, para não revelar o resultado).

## Acessibilidade

Cada gráfico tem resumo textual (`aria-label`) e uma tabela alternativa ("Ver como tabela").
A tabela de assuntos tem um link por assunto, então a navegação por teclado/leitor de tela
não depende do clique na barra. As faixas de cor das barras (<50% / <70% / ≥70%) também
aparecem em texto na tabela ("Precisa melhorar", "Regular", "Bom").
