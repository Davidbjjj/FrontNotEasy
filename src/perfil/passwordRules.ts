export interface PasswordCheck {
  ok: boolean;
  message: string;
}

/** Regras mínimas da nova senha; a validação final é do back-end. */
export function validateNewPassword(current: string, next: string, confirm: string): PasswordCheck {
  if (next.length < 8) return { ok: false, message: 'A nova senha deve ter pelo menos 8 caracteres.' };
  if (!/[A-Za-z]/.test(next) || !/\d/.test(next)) {
    return { ok: false, message: 'Use letras e números na nova senha.' };
  }
  if (next === current) return { ok: false, message: 'A nova senha deve ser diferente da atual.' };
  if (next !== confirm) return { ok: false, message: 'A confirmação não confere com a nova senha.' };
  return { ok: true, message: '' };
}
