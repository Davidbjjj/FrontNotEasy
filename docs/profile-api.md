# Contrato da API de perfil e configurações (FE-004)

Proposta do front-end para alinhar com o back-end. Enquanto o back-end não
implementa, o front usa um **mock** (`src/perfil/perfilService.ts`; senha do
mock: `Senha1234`). Para apontar para a API real: `REACT_APP_PROFILE_MOCK=false`.

Todos os endpoints exigem `Authorization: Bearer <token>` e atuam sempre sobre
o usuário autenticado. Erros de regra retornam `400` com `{ "message": "..." }`
(o front exibe essa mensagem).

| Método e rota | Corpo | Resposta |
|---|---|---|
| `GET /usuarios/me` | — | `Profile` |
| `PATCH /usuarios/me` | `{ "nome": "string" }` (3+ caracteres) | `Profile` |
| `PUT /usuarios/me/foto` | `multipart/form-data`, campo `foto` (JPEG 256×256 já recortado, até 5 MB) | `Profile` |
| `DELETE /usuarios/me/foto` | — | `Profile` |
| `PUT /usuarios/me/senha` | `{ "senhaAtual", "novaSenha" }` | `204`; `400` se a senha atual estiver errada |
| `GET /usuarios/me/preferencias-notificacao` | — | `NotificationPreferences` |
| `PUT /usuarios/me/preferencias-notificacao` | `NotificationPreferences` | `NotificationPreferences` |
| `POST /usuarios/me/exclusao` | `{ "senha": "string" }` | `{ "exclusaoAgendadaPara": ISO-8601 }`; `400` se a senha estiver errada |
| `DELETE /usuarios/me/exclusao` | — | `204` (cancela o pedido pendente) |

## Modelos

```json
// Profile
{ "nome": "Maria Souza", "email": "maria@escola.br", "fotoUrl": "https://.../foto.jpg",
  "exclusaoAgendadaPara": null }

// NotificationPreferences — chaves = NotificationType de docs/notifications-api.md
{ "LISTA_NOVA": true, "PRAZO": true, "NOTA_LANCADA": false, "GERAL": true }
```

## Observações para o back-end

- `fotoUrl` deve ser acessível pelo `<img>`; se exigir Authorization, o front
  precisará usar `ImageWithAuth`.
- Exclusão (LGPD): o pedido agenda a remoção com prazo de arrependimento
  (o mock usa 30 dias) e o usuário continua logado até lá. Definir se o
  login bloqueia ou não durante o prazo.
- Notificações de um tipo desligado **não devem ser geradas/entregues** ao
  usuário (o front só guarda a preferência).
