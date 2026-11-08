# Contrato da API de notificações (FE-003)

Proposta do front-end para alinhar com o back-end. Enquanto o back-end não
implementa, o front usa um **mock** (`src/notifications/notificationService.ts`).
Para apontar para a API real: `REACT_APP_NOTIFICATIONS_MOCK=false`.

Todos os endpoints exigem `Authorization: Bearer <token>`; as notificações
são sempre as do usuário autenticado (aluno, professor ou instituição).

## Modelo

```json
{
  "id": "1001",
  "type": "LISTA_NOVA",
  "title": "Nova lista publicada",
  "message": "Matemática: Lista 3 está disponível.",
  "read": false,
  "createdAt": "2026-11-04T14:30:00Z",
  "link": "/listas/12/questoes"
}
```

| Campo       | Tipo            | Observação                                                                 |
|-------------|-----------------|----------------------------------------------------------------------------|
| `id`        | string          | Identificador estável                                                      |
| `type`      | enum            | `LISTA_NOVA`, `PRAZO`, `NOTA_LANCADA`, `GERAL`                             |
| `title`     | string          | Curto (até ~60 caracteres)                                                 |
| `message`   | string          | Texto da notificação                                                       |
| `read`      | boolean         |                                                                            |
| `createdAt` | ISO-8601 (UTC)  |                                                                            |
| `link`      | string \| null  | **Rota do front** do item relacionado (começa com `/`); `null` = só informa |

## Endpoints

### `GET /notificacoes?page=0&size=10&sort=createdAt,desc`
Lista paginada, **da mais recente para a mais antiga** (`page` base 0).

```json
{
  "items": [ /* Notificacao[] */ ],
  "page": 0,
  "size": 10,
  "totalElements": 23,
  "totalPages": 3
}
```

### `GET /notificacoes/nao-lidas/contagem`
```json
{ "count": 6 }
```
Chamado ao montar o sino e a cada 60 s (aba visível).

### `PATCH /notificacoes/{id}/lida`
Marca uma como lida. `204 No Content`. Idempotente. `404` se não for do usuário.

### `PATCH /notificacoes/lidas`
Marca todas as do usuário como lidas. `204 No Content`.

## Geração (responsabilidade do back-end)

| Evento                          | `type`         | `link` sugerido                  |
|---------------------------------|----------------|----------------------------------|
| Professor publica lista         | `LISTA_NOVA`   | `/listas/{listaId}/questoes`     |
| Prazo de atividade se aproxima  | `PRAZO`        | `/atividades/{eventoId}`         |
| Nota lançada                    | `NOTA_LANCADA` | `/atividades/{eventoId}`         |

## Pontos em aberto
- Tempo real (SSE/WebSocket) em vez de polling de 60 s.
- Retenção: por quanto tempo o back-end guarda notificações lidas.
