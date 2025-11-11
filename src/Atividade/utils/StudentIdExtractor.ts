/**
 * Utilidade para extrair IDs de estudantes de diferentes estruturas de dados
 * Centraliza a lógica de normalização que era repetida 3x no código original
 */

import { Student, Activity } from '../model/Activity';

/**
 * Extrai o ID do estudante a partir de diferentes estruturas possíveis
 * @param student - Objeto do estudante
 * @returns ID do estudante ou null
 */
export const extractStudentId = (student: Student): string | null => {
  return (
    student.estudanteId ||
    student.alunoId ||
    student.aluno?.id ||
    student.id ||
    null
  );
};

/**
 * Extrai o ID do estudante a partir do nome em um evento
 * @param studentName - Nome do estudante para buscar
 * @param evento - Objeto do evento contendo notas
 * @returns ID do estudante ou null
 */
export const extractStudentIdFromEvent = (
  studentName: string,
  evento: Activity | null | undefined
): string | null => {
  if (!evento || !Array.isArray(evento.notas)) {
    return null;
  }

  const found = evento.notas.find((n) => {
    const nome =
      n.nomeAluno || n.nomeEstudante || n.nome || n.aluno?.nome || '';
    return String(nome).trim() === String(studentName).trim();
  });

  if (!found) {
    return null;
  }

  return extractStudentId(found);
};

/**
 * Detecta se uma string é um ID (formato UUID/GUID) ou um nome
 * @param identifier - String a ser analisada
 * @returns true se for um ID, false se for um nome
 */
export const isStudentId = (identifier: string): boolean => {
  const trimmed = identifier.trim();
  // Padrão UUID: xxxxx-xxxx-xxxx-xxxx-xxxxxxxx (ou similar)
  return trimmed.includes('-') && trimmed.length > 10;
};

/**
 * Normaliza um identificador de estudante (ID ou nome) para um ID válido
 * @param studentIdentifier - ID ou nome do estudante
 * @param evento - Evento contendo dados dos alunos
 * @returns ID normalizado ou null
 */
export const normalizeStudentIdentifier = (
  studentIdentifier: string | null | undefined,
  evento: Activity | null | undefined
): string | null => {
  if (!studentIdentifier || typeof studentIdentifier !== 'string') {
    return null;
  }

  const trimmed = studentIdentifier.trim();

  // Se já é um ID, retorna diretamente
  if (isStudentId(trimmed)) {
    return trimmed;
  }

  // Tenta extrair a partir do nome
  return extractStudentIdFromEvent(trimmed, evento);
};
