import React, { useState } from 'react';
import { Button, Modal } from '../../ui';
import { MAX_TEXTO, TIPO_LABEL, validarDuvida } from './duvidaLogic';
import type { TipoDuvida } from './types';
import styles from './Duvida.module.css';

interface Props {
  open: boolean;
  tipo: TipoDuvida;
  numeroQuestao: number;
  onClose: () => void;
  onSubmit: (texto: string, anexo: File | null) => Promise<void>;
}

export const DuvidaForm: React.FC<Props> = ({ open, tipo, numeroQuestao, onClose, onSubmit }) => {
  const [texto, setTexto] = useState('');
  const [anexo, setAnexo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validarDuvida(texto, anexo);
    if (msg) { setErro(msg); return; }
    setEnviando(true);
    setErro(null);
    try {
      await onSubmit(texto.trim(), anexo);
      setTexto('');
      setAnexo(null);
      onClose();
    } catch (err: any) {
      setErro(err?.response?.data?.message || 'Não foi possível enviar. Tente novamente.');
      setEnviando(false);
    }
  };

  const titulo = tipo === 'DUVIDA'
    ? `Tenho uma dúvida · Questão ${numeroQuestao}`
    : `Contestar correção · Questão ${numeroQuestao}`;

  return (
    <Modal
      open={open}
      title={titulo}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={enviando}>Cancelar</Button>
          <Button type="submit" form="duvida-form" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar'}</Button>
        </>
      }
    >
      <form id="duvida-form" onSubmit={submit} className={styles.form} noValidate>
        <label htmlFor="duvida-texto">{TIPO_LABEL[tipo]}</label>
        <textarea
          id="duvida-texto"
          rows={5}
          maxLength={MAX_TEXTO}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-invalid={!!erro || undefined}
          aria-describedby={erro ? 'duvida-erro' : undefined}
          placeholder={tipo === 'DUVIDA' ? 'Qual parte você não entendeu?' : 'Explique por que a correção está errada.'}
        />
        <label htmlFor="duvida-anexo">Anexo (opcional — PNG, JPG ou PDF, até 5 MB)</label>
        <input
          id="duvida-anexo"
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          onChange={(e) => setAnexo(e.target.files?.[0] ?? null)}
        />
        {erro && <p id="duvida-erro" role="alert" className={styles.erro}>{erro}</p>}
      </form>
    </Modal>
  );
};
