export interface AddQuestionsButtonProps {
  listaId: string;
  className?: string;
  onQuestionsAdded?: () => void;
}

export interface ProcessarPDFRequest {
  file: string; // Base64 string
}

export interface ProcessarPDFResponse {
  message: string;
  questoesAdicionadas: number;
}