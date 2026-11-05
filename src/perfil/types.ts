import type { NotificationType } from '../notifications/types';

export interface Profile {
  nome: string;
  email: string;
  /** URL da foto atual; null = sem foto (mostra iniciais) */
  fotoUrl: string | null;
  /** Presente quando há pedido de exclusão pendente (ISO-8601) */
  exclusaoAgendadaPara?: string | null;
}

/** Preferência por tipo de aviso: ligado = o usuário recebe esse tipo */
export type NotificationPreferences = Record<NotificationType, boolean>;

export interface ChangePasswordInput {
  senhaAtual: string;
  novaSenha: string;
}
