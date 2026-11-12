import React, { useEffect, useState } from 'react';
import { useToast } from '../../ui';
import ModalAcao from '../acoes/ModalAcao';
import { mensagemErro, professorService } from '../professorService';
import {
  CONFIG_PADRAO, fromLocalInput, resumoRegras, toLocalInput, validarConfig,
} from '../professorLogic';
import type { ConfigListaInput, ListaConfig, RegraNota } from '../types';
import styles from '../Professor.module.css';

interface Form {
  abreEm: string;
  fechaEm: string;
  maxTentativas: string;
  regraNota: RegraNota;
  tempoLimiteMinutos: string;
  embaralharQuestoes: boolean;
  embaralharAlternativas: boolean;
}

const paraForm = (l: ListaConfig): Form => ({
  abreEm: toLocalInput(l.abreEm),
  fechaEm: toLocalInput(l.fechaEm),
  maxTentativas: l.maxTentativas == null ? '' : String(l.maxTentativas),
  regraNota: l.regraNota ?? 'MAIOR',
  tempoLimiteMinutos: l.tempoLimiteMinutos == null ? '' : String(l.tempoLimiteMinutos),
  embaralharQuestoes: l.embaralharQuestoes,
  embaralharAlternativas: l.embaralharAlternativas,
});

const inteiroOuNull = (s: string): number | null => (s.trim() === '' ? null : Number(s));

const paraInput = (f: Form): ConfigListaInput => ({
  abreEm: fromLocalInput(f.abreEm),
  fechaEm: fromLocalInput(f.fechaEm),
  maxTentativas: inteiroOuNull(f.maxTentativas),
  regraNota: f.regraNota,
  tempoLimiteMinutos: inteiroOuNull(f.tempoLimiteMinutos),
  embaralharQuestoes: f.embaralharQuestoes,
  embaralharAlternativas: f.embaralharAlternativas,
});

/**
 * FE-205 · Regras de aplicação da lista (janela, tentativas, tempo, embaralhamento) com resumo antes de salvar.
 * Para rascunhos (FE-206) o mesmo fluxo termina publicando a lista.
 */
export const ConfigListaModal: React.FC<{
  open: boolean; listaId: string | null; onClose: () => void; onSaved?: (l: ListaConfig) => void;
}> = ({ open, listaId, onClose, onSaved }) => {
  const toast = useToast();
  const [lista, setLista] = useState<ListaConfig | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !listaId) return undefined;
    const c = new AbortController();
    setLista(null);
    setForm(null);
    setErroCarga(null);
    professorService.configuracao(listaId, c.signal)
      .then((l) => { setLista(l); setForm(paraForm(l)); })
      .catch((e) => { if (!c.signal.aborted) setErroCarga(mensagemErro(e, 'Não foi possível carregar as regras da lista.')); });
    return () => c.abort();
  }, [open, listaId]);

  const input = form ? paraInput(form) : CONFIG_PADRAO;
  const erros = form ? validarConfig(input) : [];
  const rascunho = lista?.status === 'RASCUNHO';
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const tentativas = input.maxTentativas ?? 1;

  return (
    <ModalAcao
      open={open && !!listaId}
      title={rascunho ? 'Regras e publicação' : 'Regras da lista'}
      onClose={onClose}
      size="lg"
      bloqueio={erroCarga ?? (erros[0] ?? null)}
      continuarLabel="Revisar regras"
      confirmarLabel={rascunho ? 'Salvar e publicar' : 'Salvar regras'}
      resumo={(
        <>
          <p style={{ margin: '0 0 8px' }}>
            Resumo das regras de <strong>{lista?.titulo}</strong>
            {rascunho ? ' — ao confirmar, a lista é publicada e os alunos da disciplina são avisados:' : ':'}
          </p>
          <ul className={styles.summary}>{resumoRegras(input).map((l) => <li key={l}>{l}</li>)}</ul>
        </>
      )}
      onConfirm={async () => {
        if (!listaId) return;
        try {
          let salva = await professorService.salvarConfiguracao(listaId, input);
          if (rascunho) salva = await professorService.publicar(listaId);
          toast.show({ variant: 'success', message: rascunho ? 'Lista publicada.' : 'Regras da lista salvas.' });
          onSaved?.(salva);
          onClose();
        } catch (e: any) {
          throw new Error(mensagemErro(e, 'Não foi possível salvar as regras.'));
        }
      }}
    >
      {!form && !erroCarga && <p role="status" className={styles.muted}>Carregando regras…</p>}
      {form && lista && (
        <>
          {rascunho && (
            <p className={`${styles.badge} ${styles.badgeWarn}`} role="status">
              Rascunho: os alunos só veem a lista depois de publicar
            </p>
          )}
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label htmlFor="cfg-abre" className={styles.label}>Abertura (data e hora)</label>
              <input id="cfg-abre" type="datetime-local" className={styles.input} value={form.abreEm} onChange={(e) => set('abreEm', e.target.value)} />
              <span className={styles.hint}>Vazio: abre assim que for publicada.</span>
            </div>
            <div className={styles.field}>
              <label htmlFor="cfg-fecha" className={styles.label}>Fechamento (data e hora)</label>
              <input id="cfg-fecha" type="datetime-local" className={styles.input} value={form.fechaEm} onChange={(e) => set('fechaEm', e.target.value)} />
              <span className={styles.hint}>Vazio: sem prazo de fechamento.</span>
            </div>
            <div className={styles.field}>
              <label htmlFor="cfg-tent" className={styles.label}>Máximo de tentativas</label>
              <input id="cfg-tent" type="number" min={1} max={20} className={styles.input} value={form.maxTentativas} onChange={(e) => set('maxTentativas', e.target.value)} />
              <span className={styles.hint}>Vazio: 1 tentativa por aluno.</span>
            </div>
            <div className={styles.field}>
              <label htmlFor="cfg-regra" className={styles.label}>Nota com várias tentativas</label>
              <select id="cfg-regra" className={styles.select} value={form.regraNota} disabled={tentativas < 2}
                onChange={(e) => set('regraNota', e.target.value as RegraNota)}>
                <option value="MAIOR">Vale a maior nota</option>
                <option value="ULTIMA">Vale a última tentativa</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="cfg-tempo" className={styles.label}>Tempo limite (minutos)</label>
              <input id="cfg-tempo" type="number" min={1} max={600} className={styles.input} value={form.tempoLimiteMinutos} onChange={(e) => set('tempoLimiteMinutos', e.target.value)} />
              <span className={styles.hint}>Opcional. Conta a partir da primeira resposta do aluno.</span>
            </div>
          </div>
          <label className={styles.check}>
            <input type="checkbox" checked={form.embaralharQuestoes} onChange={(e) => set('embaralharQuestoes', e.target.checked)} />
            Embaralhar a ordem das questões para cada aluno
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={form.embaralharAlternativas} onChange={(e) => set('embaralharAlternativas', e.target.checked)} />
            Embaralhar as alternativas das questões objetivas
          </label>
          {erros.length > 1 && <ul className={styles.summary}>{erros.slice(1).map((e) => <li key={e} className={styles.errorText}>{e}</li>)}</ul>}
        </>
      )}
    </ModalAcao>
  );
};

export default ConfigListaModal;
