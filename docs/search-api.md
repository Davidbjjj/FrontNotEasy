# Contrato da API de busca global (FE-007)

Proposta do front-end. Enquanto o back-end não implementa, o front usa um
**mock** (`src/busca/searchService.ts`). Para a API real: `REACT_APP_SEARCH_MOCK=false`.

## `GET /busca?q=<texto>&tipos=LISTA,QUESTAO,DISCIPLINA,ALUNO&limite=5`

- `q`: mínimo 2 caracteres; busca sem diferenciar maiúsculas/acentos.
- `tipos`: tipos desejados (opcional). **O back-end deve interseccionar com o que
  o papel do token pode ver**, independente do que o cliente pedir.
- `limite`: itens por grupo (a tela "ver todos" pede até 100).

```json
{
  "groups": [
    {
      "type": "LISTA",
      "total": 7,
      "items": [
        { "id": "3", "type": "LISTA", "title": "Lista 3 — Cinemática", "subtitle": "Física", "link": "/listas" }
      ]
    }
  ]
}
```

Grupos sem resultado podem ser omitidos. `link` é uma rota do front.

## Visibilidade por papel

| Papel       | Listas | Questões | Disciplinas | Alunos |
|-------------|:------:|:--------:|:-----------:|:------:|
| ALUNO       | sim (só as suas) | não | sim (só as suas) | não |
| PROFESSOR   | sim (as suas)    | sim | sim (as suas)    | sim (das suas disciplinas) |
| INSTITUICAO | não    | não      | sim (da instituição) | sim (da instituição) |

O front aplica a mesma tabela em `src/busca/searchScope.ts` e descarta grupos
fora do escopo, mas a garantia de segurança é do back-end.

## Front

- Campo no header (`GlobalSearch`), atalho **Ctrl/⌘ + K** ou **/**.
- Setas ↑/↓ navegam, Enter abre, Esc fecha; sem seleção, Enter abre `/busca?q=…`.
- "Ver todos" leva a `/busca?q=…&tipo=<TIPO>` (`SearchPage`).
