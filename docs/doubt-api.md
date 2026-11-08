# Contrato da API de dúvida e contestação (FE-108)

Proposta do front-end. Enquanto o back-end não implementa, o front usa um **mock**
(`src/estudante/duvida/duvidaService.ts`), que simula a resposta do professor após ~8 s e
gera a notificação. API real: `REACT_APP_DOUBT_MOCK=false`.

Tela: `/listas/{listaId}/revisao` — cada questão tem "Tenho uma dúvida" e "Contestar correção".

## Modelo

```json
{
  "id": "d1", "listaId": "l1", "questaoId": "q2",
  "tipo": "DUVIDA",
  "texto": "Não entendi como achei a soma das raízes.",
  "anexoNome": "caderno.png",
  "status": "ENVIADA",
  "criadaEm": "2026-11-08T12:00:00Z",
  "resposta": null, "respondidaEm": null
}
```

- `tipo`: `DUVIDA` | `CONTESTACAO`.
- `status`: `ENVIADA` (aguardando), `RESPONDIDA` (dúvida respondida), `ACEITA` / `RECUSADA` (decisão
  sobre contestação).

## Endpoints (papel ALUNO)

- `GET /listas/{listaId}/duvidas` → `Duvida[]` do aluno autenticado. O front atualiza a cada 30 s.
- `POST /listas/{listaId}/duvidas` — `multipart/form-data` com `questaoId`, `tipo`, `texto`
  (5–1000 caracteres) e `anexo` opcional (PNG, JPG ou PDF, até 5 MB). Retorna `201` com a `Duvida`.
  Só vale para lista finalizada pelo aluno com gabarito liberado (`403` caso contrário).

## Notificação (responsabilidade do back-end)

Quando o professor responde/decide, gerar notificação (ver `docs/notifications-api.md`):

| `type` | `link` |
|---|---|
| `DUVIDA_RESPONDIDA` (novo) | `/listas/{listaId}/revisao` |

O back-end precisa aceitar `DUVIDA_RESPONDIDA` também em `/perfil` (preferências de notificação).

## Fora do escopo (professor)
A tela do professor para responder/aceitar/recusar não faz parte do FE-108.
