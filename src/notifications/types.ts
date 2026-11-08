export type NotificationType = 'LISTA_NOVA' | 'PRAZO' | 'NOTA_LANCADA' | 'DUVIDA_RESPONDIDA' | 'GERAL';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  /** ISO-8601, ex.: 2026-11-04T14:30:00Z */
  createdAt: string;
  /** Rota interna do item relacionado, ex.: /listas/12/questoes. Opcional. */
  link?: string | null;
}

export interface NotificationPage {
  items: AppNotification[];
  /** Página atual, base 0 */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
