export interface InstituicaoRegisterData {
  nome: string;
  email: string;
  senha: string;
  endereco: string;
}

export interface InstituicaoRegisterResponse {
  id: string;
  nome: string;
  email: string;
  endereco: string;
}
