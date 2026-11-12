import React, { useEffect, useState } from 'react';
import { useToast } from '../../ui';
import ModalAcao from '../acoes/ModalAcao';
import { mensagemErro, professorService } from '../professorService';
import { formatDataHora, fromLocalInput } from '../professorLogic';
import type { DisciplinaProfessor, ListaConfig } from '../types';
import styles from '../Professor.module.css';

/**
 * FE-206 · Duplicar lista para outra turma/semestre: escolhe o destino, ajusta as datas no mesmo fluxo e cria
 * a cópia como rascunho (nunca publicada direto).
 */
export const DuplicarListaModal: React.FC<{
  open: boolean;
  lista: { id: string; titulo: string; disciplinaId?: string | null } | null;
  onClose: () => void;
  /** Chamado com o rascunho criado; quem chama pode abrir as regras/publicação. */
  onCreated?: (copia: ListaConfig) => void;
}> = ({ open, lista, onClose, onCreated }) => {
  const toast = useToast();
  const professorId = localStorage.getItem('userId') || '';
  const [disciplinas, setDisciplinas] = useState<DisciplinaProfessor[]>([]);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [destino, setDestino] = useState('');
  const [titulo, setTitulo] = useState('');
  const [abre, setAbre] = useState('');
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    if (!open || !lista) return undefined;
    const c = new AbortController();
    setTitulo(`${lista.titulo} (cópia)`);
    setAbre('');
    setFecha('');
    setErroCarga(null);
    professorService.disciplinasDoProfessor(professorId, c.signal)
      .then((d) => {
        setDisciplinas(d);
        setDestino(d.find((x) => x.id === lista.disciplinaId)?.id ?? d[0]?.id ?? '');
      })
      .catch((e) => { if (!c.signal.aborted) setErroCarga(mensagemErro(e, 'Não foi possível carregar suas disciplinas.')); });
    return () => c.abort();
  }, [open, lista, professorId]);

  const abreIso = fromLocalInput(abre);
  const fechaIso = fromLocalInput(fecha);
  const bloqueio = erroCarga
    ?? (!destino ? 'Escolha a turma ou disciplina de destino.' : null)
    ?? (titulo.trim() === '' ? 'Informe o título da cópia.' : null)
    ?? (abreIso && fechaIso && new Date(fechaIso) <= new Date(abreIso) ? 'O fechamento precisa ser depois da abertura.' : null);
  const nomeDestino = disciplinas.find((d) => d.id === destino)?.nome ?? '';

  if (!lista) return null;
  return (
    <ModalAcao
      open={open} title="Duplicar lista" onClose={onClose} bloqueio={bloqueio} confirmarLabel="Criar cópia"
      resumo={(
        <>
          <p style={{ margin: '0 0 8px' }}>
            Criar <strong>{titulo.trim()}</strong> em <strong>{nomeDestino}</strong>, com todas as questões de{' '}
            <strong>{lista.titulo}</strong>.
          </p>
          <ul className={styles.summary}>
            <li>Abertura: {abreIso ? formatDataHora(abreIso) : 'ao publicar'}</li>
            <li>Fechamento: {fechaIso ? formatDataHora(fechaIso) : 'sem prazo'}</li>
            <li>A cópia nasce como <strong>rascunho</strong>: os alunos só veem depois que você publicar.</li>
          </ul>
        </>
      )}
      onConfirm={async () => {
        try {
          const copia = await professorService.duplicar(lista.id, {
            disciplinaId: destino, titulo: titulo.trim(), abreEm: abreIso, fechaEm: fechaIso,
          });
          toast.show({
            variant: 'success',
            message: `Cópia criada como rascunho em ${nomeDestino}.`,
            actionLabel: onCreated ? 'Revisar e publicar' : undefined,
            onAction: onCreated ? () => onCreated(copia) : undefined,
            duration: 8000,
          });
          onCreated?.(copia);
          onClose();
        } catch (e: any) {
          throw new Error(mensagemErro(e, 'Não foi possível duplicar a lista.'));
        }
      }}
    >
      <p className={styles.muted}>Reaproveite <strong>{lista.titulo}</strong> em outra turma ou semestre.</p>
      <div className={styles.field}>
        <label htmlFor="dup-destino" className={styles.label}>Turma / disciplina de destino</label>
        <select id="dup-destino" className={styles.select} value={destino} onChange={(e) => setDestino(e.target.value)}>
          {disciplinas.length === 0 && <option value="">Carregando…</option>}
          {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="dup-titulo" className={styles.label}>Título da cópia</label>
        <input id="dup-titulo" className={styles.input} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </div>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="dup-abre" className={styles.label}>Nova abertura</label>
          <input id="dup-abre" type="datetime-local" className={styles.input} value={abre} onChange={(e) => setAbre(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor="dup-fecha" className={styles.label}>Novo fechamento</label>
          <input id="dup-fecha" type="datetime-local" className={styles.input} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </div>
    </ModalAcao>
  );
};

export default DuplicarListaModal;
