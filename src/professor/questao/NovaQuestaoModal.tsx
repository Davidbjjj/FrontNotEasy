import React, { useEffect, useState } from 'react';
import { Button, Modal, useToast } from '../../ui';
import { mensagemErro, professorService } from '../professorService';
import { DIFICULDADES, parseTags } from '../professorLogic';
import styles from '../Professor.module.css';

/**
 * Cria uma questão na lista: objetiva (alternativas + gabarito) ou aberta (rubrica de correção, FE-201),
 * já com assunto, dificuldade e tags para o banco de questões (FE-202).
 */
export const NovaQuestaoModal: React.FC<{
  open: boolean; listaId: string; onClose: () => void; onCreated: () => void;
}> = ({ open, listaId, onClose, onCreated }) => {
  const toast = useToast();
  const [tipo, setTipo] = useState<'OBJETIVA' | 'ABERTA'>('OBJETIVA');
  const [cabecalho, setCabecalho] = useState('');
  const [enunciado, setEnunciado] = useState('');
  const [alternativas, setAlternativas] = useState<string[]>(['', '', '', '']);
  const [gabarito, setGabarito] = useState(0);
  const [rubrica, setRubrica] = useState('');
  const [assunto, setAssunto] = useState('');
  const [dificuldade, setDificuldade] = useState('');
  const [tags, setTags] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTipo('OBJETIVA'); setCabecalho(''); setEnunciado(''); setAlternativas(['', '', '', '']); setGabarito(0);
    setRubrica(''); setAssunto(''); setDificuldade(''); setTags(''); setErro(null);
  }, [open]);

  const setAlt = (i: number, v: string) => setAlternativas((a) => a.map((x, k) => (k === i ? v : x)));
  const removerAlt = (i: number) => {
    setAlternativas((a) => a.filter((_, k) => k !== i));
    setGabarito((g) => (g === i ? 0 : g > i ? g - 1 : g));
  };

  const salvar = async () => {
    if (!enunciado.trim()) { setErro('Escreva o enunciado.'); return; }
    if (tipo === 'OBJETIVA') {
      const preenchidas = alternativas.map((a) => a.trim());
      if (preenchidas.length < 2 || preenchidas.some((a) => !a)) { setErro('Preencha todas as alternativas (mínimo de 2).'); return; }
    }
    setErro(null);
    setSalvando(true);
    try {
      await professorService.criarQuestao(listaId, {
        tipo,
        cabecalho: cabecalho.trim() || undefined,
        enunciado: enunciado.trim(),
        alternativas: tipo === 'OBJETIVA' ? alternativas.map((a) => a.trim()) : undefined,
        gabarito: tipo === 'OBJETIVA' ? gabarito : undefined,
        rubrica: tipo === 'ABERTA' ? rubrica.trim() || undefined : undefined,
        assunto: assunto.trim() || undefined,
        dificuldade: dificuldade || undefined,
        tags: parseTags(tags),
      });
      toast.show({ variant: 'success', message: 'Questão criada.' });
      onCreated();
      onClose();
    } catch (e: any) {
      setErro(mensagemErro(e, 'Não foi possível criar a questão.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      open={open} title="Nova questão" size="lg" onClose={() => !salvando && onClose()}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={salvando}>Cancelar</Button>
          <Button onClick={() => void salvar()} loading={salvando}>Criar questão</Button>
        </>
      )}
    >
      <div className={styles.stack}>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className={styles.label}>Tipo</legend>
          <div className={styles.row}>
            <label className={styles.check}><input type="radio" name="nq-tipo" checked={tipo === 'OBJETIVA'} onChange={() => setTipo('OBJETIVA')} /> Objetiva</label>
            <label className={styles.check}><input type="radio" name="nq-tipo" checked={tipo === 'ABERTA'} onChange={() => setTipo('ABERTA')} /> Aberta (corrigida por você)</label>
          </div>
        </fieldset>

        <div className={styles.field}>
          <label htmlFor="nq-cab" className={styles.label}>Cabeçalho (opcional)</label>
          <input id="nq-cab" className={styles.input} value={cabecalho} onChange={(e) => setCabecalho(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor="nq-enun" className={styles.label}>Enunciado</label>
          <textarea id="nq-enun" className={styles.textarea} value={enunciado} onChange={(e) => setEnunciado(e.target.value)} />
        </div>

        {tipo === 'OBJETIVA' ? (
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className={styles.label}>Alternativas (marque a correta)</legend>
            <div className={styles.stack}>
              {alternativas.map((a, i) => (
                <div key={i} className={styles.row}>
                  <input type="radio" name="nq-gab" checked={gabarito === i} onChange={() => setGabarito(i)} aria-label={`Alternativa ${String.fromCharCode(65 + i)} é a correta`} />
                  <strong aria-hidden="true">{String.fromCharCode(65 + i)}</strong>
                  <input className={styles.input} style={{ flex: 1 }} value={a} onChange={(e) => setAlt(i, e.target.value)} aria-label={`Texto da alternativa ${String.fromCharCode(65 + i)}`} />
                  {alternativas.length > 2 && <Button variant="ghost" onClick={() => removerAlt(i)} aria-label={`Remover alternativa ${String.fromCharCode(65 + i)}`}>Remover</Button>}
                </div>
              ))}
              {alternativas.length < 6 && <div><Button variant="secondary" onClick={() => setAlternativas((a) => [...a, ''])}>Adicionar alternativa</Button></div>}
            </div>
          </fieldset>
        ) : (
          <div className={styles.field}>
            <label htmlFor="nq-rub" className={styles.label}>Rubrica de correção</label>
            <textarea id="nq-rub" className={styles.textarea} value={rubrica} onChange={(e) => setRubrica(e.target.value)} />
            <span className={styles.hint}>O que uma boa resposta precisa ter. Aparece ao lado da resposta do aluno na hora de corrigir; o aluno não vê.</span>
          </div>
        )}

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="nq-assunto" className={styles.label}>Assunto</label>
            <input id="nq-assunto" className={styles.input} value={assunto} onChange={(e) => setAssunto(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="nq-dif" className={styles.label}>Dificuldade</label>
            <select id="nq-dif" className={styles.select} value={dificuldade} onChange={(e) => setDificuldade(e.target.value)}>
              <option value="">Sem classificação</option>
              {DIFICULDADES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="nq-tags" className={styles.label}>Tags</label>
          <input id="nq-tags" className={styles.input} value={tags} onChange={(e) => setTags(e.target.value)} />
          <span className={styles.hint}>Separe por vírgula. Ajudam a achar a questão no banco.</span>
        </div>
        {erro && <p role="alert" className={styles.errorText}>{erro}</p>}
      </div>
    </Modal>
  );
};

export default NovaQuestaoModal;
