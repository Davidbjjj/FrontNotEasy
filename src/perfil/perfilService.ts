import api from '../services/apiClient';
import { decodeJwt } from '../auth/jwt';
import { ChangePasswordInput, NotificationPreferences, Profile } from './types';

/**
 * Contrato com o back-end: ver docs/profile-api.md.
 * Enquanto os endpoints não existem, o mock abaixo responde no lugar deles.
 * Para usar a API real: REACT_APP_PROFILE_MOCK=false
 */
const USE_MOCK = process.env.REACT_APP_PROFILE_MOCK !== 'false';

/** Disparado após salvar nome/foto, para a TopBar atualizar sem recarregar. */
export const PROFILE_UPDATED_EVENT = 'profile-updated';

export interface PerfilService {
  get(): Promise<Profile>;
  updateName(nome: string): Promise<Profile>;
  uploadPhoto(photo: Blob): Promise<Profile>;
  removePhoto(): Promise<Profile>;
  changePassword(input: ChangePasswordInput): Promise<void>;
  getNotificationPreferences(): Promise<NotificationPreferences>;
  saveNotificationPreferences(prefs: NotificationPreferences): Promise<NotificationPreferences>;
  requestAccountDeletion(senha: string): Promise<{ exclusaoAgendadaPara: string }>;
  cancelAccountDeletion(): Promise<void>;
}

// ---------- API real ----------
const httpService: PerfilService = {
  async get() {
    return (await api.get<Profile>('/usuarios/me')).data;
  },
  async updateName(nome) {
    return (await api.patch<Profile>('/usuarios/me', { nome })).data;
  },
  async uploadPhoto(photo) {
    const form = new FormData();
    form.append('foto', photo, 'foto.jpg');
    return (await api.put<Profile>('/usuarios/me/foto', form)).data;
  },
  async removePhoto() {
    return (await api.delete<Profile>('/usuarios/me/foto')).data;
  },
  async changePassword(input) {
    await api.put('/usuarios/me/senha', input);
  },
  async getNotificationPreferences() {
    return (await api.get<NotificationPreferences>('/usuarios/me/preferencias-notificacao')).data;
  },
  async saveNotificationPreferences(prefs) {
    return (await api.put<NotificationPreferences>('/usuarios/me/preferencias-notificacao', prefs)).data;
  },
  async requestAccountDeletion(senha) {
    return (await api.post<{ exclusaoAgendadaPara: string }>('/usuarios/me/exclusao', { senha })).data;
  },
  async cancelAccountDeletion() {
    await api.delete('/usuarios/me/exclusao');
  },
};

// ---------- Mock ----------
const delay = <T,>(value: T) => new Promise<T>((r) => setTimeout(() => r(value), 250));
const MOCK_PASSWORD = 'Senha1234';
const GRACE_DAYS = 30;

function tokenName(): string {
  try {
    return decodeJwt(localStorage.getItem('token'))?.nome || 'Usuário';
  } catch (e) {
    return 'Usuário';
  }
}

let mockProfile: Profile = { nome: '', email: 'usuario@exemplo.com', fotoUrl: null, exclusaoAgendadaPara: null };
let mockPrefs: NotificationPreferences = { LISTA_NOVA: true, PRAZO: true, NOTA_LANCADA: true, DUVIDA_RESPONDIDA: true, GERAL: true };
let mockPhotoUrl: string | null = null;

const wrongPassword = (message: string) =>
  Promise.reject({ response: { status: 400, data: { message } } });

const mockService: PerfilService = {
  async get() {
    if (!mockProfile.nome) mockProfile = { ...mockProfile, nome: tokenName() };
    return delay({ ...mockProfile });
  },
  async updateName(nome) {
    mockProfile = { ...mockProfile, nome };
    return delay({ ...mockProfile });
  },
  async uploadPhoto(photo) {
    if (mockPhotoUrl) URL.revokeObjectURL(mockPhotoUrl);
    mockPhotoUrl = URL.createObjectURL(photo);
    mockProfile = { ...mockProfile, fotoUrl: mockPhotoUrl };
    return delay({ ...mockProfile });
  },
  async removePhoto() {
    mockProfile = { ...mockProfile, fotoUrl: null };
    return delay({ ...mockProfile });
  },
  async changePassword({ senhaAtual }) {
    if (senhaAtual !== MOCK_PASSWORD) return wrongPassword('A senha atual está incorreta.');
    return delay(undefined);
  },
  async getNotificationPreferences() {
    return delay({ ...mockPrefs });
  },
  async saveNotificationPreferences(prefs) {
    mockPrefs = { ...prefs };
    return delay({ ...mockPrefs });
  },
  async requestAccountDeletion(senha) {
    if (senha !== MOCK_PASSWORD) return wrongPassword('A senha está incorreta.');
    const when = new Date(Date.now() + GRACE_DAYS * 86_400_000).toISOString();
    mockProfile = { ...mockProfile, exclusaoAgendadaPara: when };
    return delay({ exclusaoAgendadaPara: when });
  },
  async cancelAccountDeletion() {
    mockProfile = { ...mockProfile, exclusaoAgendadaPara: null };
    return delay(undefined);
  },
};

export const perfilService: PerfilService = USE_MOCK ? mockService : httpService;

/** Extrai a mensagem do back-end, com um texto padrão. */
export function apiMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message || fallback;
}
