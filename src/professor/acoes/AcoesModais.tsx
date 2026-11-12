import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../ui';
import { mensagemErro, professorService } from '../professorService';
import {
  formatDataHora, fromLocalInput, mensagemAvisoPadrao, toLocalInput, tituloReforcoPadrao,
} from '../professorLogic';
import type { AssuntoFraco } from '../types';
import ModalAcao from './ModalAcao';
import styles from '../Professor.module.css';

const emDias = (dias: number) => toLocalInput(new Date(Date.now() + dias * 86400000).toISOString());

// ---------------------------------------------------------------- reabrir lista

export const ReabrirListaModal: React.FC<{
  open: boolean; lista: { id: string; titulo: string } | null; onClose: () => void; onDone?: () => void;
}> = ({ open, lista, onClose, onDone }) => {
  const toast = useToast();
  const [prazo, setPrazo] = useState(emDias(7));
  const [novaTentativa, setNovaTentativa] = useState(true);

  useEffect(() => { if (open) { setPrazo(emDias(7)); setNovaTentativa(true); } }, [open]);

  const iso = fromLocalInput(prazo);
  const bloqueio = !iso ? 'Informe o novo prazo.' : new Date(iso) <= new Date() ? 'O novo prazo precisa estar no futuro.' : null;

  if (!lista) return null;
  return (
    <ModalAcao
      open={open} title="Reabrir lista" onClose={onClose} bloqueio={bloqueio}
      confirmarLabel="Reabrir lista"
      resumo={(
        <p style={{ margin: 0 }}>
          A lista <strong>{lista.titulo}</strong> será reaberta até <strong>{formatDataHora(iso)}</strong>.
          {novaTentativa ? ' Quem já entregou ganha mais uma tentativa para refazer.' : ''}
          {' '}Todos os alunos da lista recebem um aviso com o novo prazo.
        </p>
      )}
      onConfirm={async () => {
        try {
          const r = await professorService.reabrir(lista.id, iso as string, novaTentativa);
          toast.show({ variant: 'success', message: `Lista reaberta. ${r.notificados} ${r.notificados === 1 ? 'aluno avisado' : 'alunos avisados'}.` });
          onDone?.();
          onClose();
        } catch (e: any) {
          throw new Error(mensagemErro(e, 'Não foi possível reabrir a lista.'));
        }
      }}
    >
      <p className={styles.muted}>Defina até quando os alunos podem responder <strong>{lista.titulo}</strong>.</p>
      <div className={styles.field}>
        <label htmlFor="reabrir-prazo" className={styles.label}>Novo prazo</label>
        <input id="reabrir-prazo" type="datetime-local" className={styles.input} value={prazo} onChange={(e) => setPrazo(e.target.value)} />
      </div>
      <label className={styles.check}>
        <input type="checkbox" checked={novaTentativa} onChange={(e) => setNovaTentativa(e.target.checked)} />
        Permitir que quem já entregou refaça (mais uma tentativa)
      </label>
    </ModalAcao>
  );
};

// ---------------------------------------------------------------- avisar aluno(s)

export const AvisarAlunosModal: React.FC<{
  open: boolean; alunos: { id: string; nome: string }[]; onClose: () => void; onDone?: () => void;
}> = ({ open, alunos, onClose, onDone }) => {
  const toast = useToast();
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (open) setMensagem(alunos.length === 1 ? mensagemAvisoPadrao(alunos[0].nome) : 'Olá! Notei algumas pendências na disciplina. Posso ajudar? Fale comigo se precisar.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const bloqueio = mensagem.trim() === '' ? 'Escreva a mensagem.' : mensagem.length > 500 ? 'A mensagem pode ter até 500 caracteres.' : null;
  const quem = alunos.length === 1 ? alunos[0].nome : `${alunos.length} alunos`;

  return (
    <ModalAcao
      open={open} title={alunos.length === 1 ? 'Avisar aluno' : 'Avisar alunos'} onClose={onClose} bloqueio={bloqueio}
      confirmarLabel="Enviar aviso"
      resumo={(
        <>
          <p style={{ margin: '0 0 8px' }}>Enviar este aviso para <strong>{quem}</strong>:</p>
          <p className={styles.pre}>{mensagem.trim()}</p>
        </>
      )}
      onConfirm={async () => {
        try {
          const n = await professorService.avisarAlunos(alunos.map((a) => a.id), mensagem.trim());
          toast.show({ variant: 'success', message: `Aviso enviado para ${n} ${n === 1 ? 'aluno' : 'alunos'}.` });
          onDone?.();
          onClose();
        } catch (e: any) {
          throw new Error(mensagemErro(e, 'Não foi possível enviar o aviso.'));
        }
      }}
    >
      <p className={styles.muted}>Para: {alunos.map((a) => a.nome).join(', ') || '—'}</p>
      <div className={styles.field}>
        <label htmlFor="avisar-msg" className={styles.label}>Mensagem</label>
        <textarea id="avisar-msg" className={styles.textarea} maxLength={500} value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
        <span className={styles.hint}>{mensagem.length}/500 · o aluno recebe uma notificação no app.</span>
      </div>
    </ModalAcao>
  );
};

// ---------------------------------------------------------------- lista de reforço

export const ReforcoModal: React.FC<{
  open: boolean;
  disciplinaId: string;
  disciplinaNome?: string;
  /** Alunos escolhidos; vazio = toda a turma. */
  alunos: { id: string; nome: string }[];
  onClose: () => void;
  onDone?: () => void;
}> = ({ open, disciplinaId, disciplinaNome, alunos, onClose, onDone }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [fracos, setFracos] = useState<AssuntoFraco[] | null>(null);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [titulo, setTitulo] = useState('');
  const [quantidade, setQuantidade] = useState(3);
  const [publicar, setPublicar] = useState(true);

  useEffect(() => {
    if (!open) return undefined;
    const c = new AbortController();
    setFracos(null);
    setErroCarga(null);
    professorService.assuntosFracos(disciplinaId, 5, c.signal)
      .then((lista) => {
        setFracos(lista);
        const sel = new Set(lista.slice(0, 3).map((a) => a.assunto));
        setMarcados(sel);
        setTitulo(tituloReforcoPadrao(Array.from(sel)));
      })
      .catch((e) => { if (!c.signal.aborted) setErroCarga(mensagemErro(e, 'Não foi possível carregar os assuntos de pior desempenho.')); });
    return () => c.abort();
  }, [open, disciplinaId]);

  const assuntos = useMemo(() => (fracos ?? []).filter((a) => marcados.has(a.assunto)).map((a) => a.assunto), [fracos, marcados]);
  const bloqueio = erroCarga
    ?? (fracos && fracos.length === 0 ? 'Ainda não há respostas com assunto cadastrado para sugerir um reforço.' : null)
    ?? (assuntos.length === 0 ? 'Escolha ao menos um assunto.' : null)
    ?? (titulo.trim() === '' ? 'Informe o título da lista.' : null);
  const quem = alunos.length === 0 ? 'toda a turma' : alunos.length === 1 ? alunos[0].nome : `${alunos.length} alunos`;

  return (
    <ModalAcao
      open={open} title="Criar lista de reforço" onClose={onClose} size="lg" bloqueio={bloqueio}
      confirmarLabel={publicar ? 'Criar e publicar' : 'Criar rascunho'}
      resumo={(
        <>
          <p style={{ margin: '0 0 8px' }}>
            Criar a lista <strong>{titulo.trim()}</strong>{disciplinaNome ? ` em ${disciplinaNome}` : ''} com até {quantidade}{' '}
            {quantidade === 1 ? 'questão' : 'questões'} de cada assunto: <strong>{assuntos.join(', ')}</strong>.
          </p>
          <p style={{ margin: 0 }}>
            {publicar
              ? `Será publicada agora para ${quem}, e eles recebem um aviso.`
              : 'Ficará como rascunho: ninguém vê até você publicar.'}
          </p>
        </>
      )}
      onConfirm={async () => {
        try {
          const r = await professorService.criarReforco({
            disciplinaId, titulo: titulo.trim(), assuntos, estudanteIds: alunos.map((a) => a.id),
            quantidadePorAssunto: quantidade, publicar,
          });
          toast.show({
            variant: 'success',
            message: `Lista criada com ${r.questoes} ${r.questoes === 1 ? 'questão' : 'questões'}`
              + (publicar ? ` e publicada para ${r.alunos} ${r.alunos === 1 ? 'aluno' : 'alunos'}.` : ' (rascunho).'),
            actionLabel: 'Ver listas',
            onAction: () => navigate('/listas'),
          });
          onDone?.();
          onClose();
        } catch (e: any) {
          throw new Error(mensagemErro(e, 'Não foi possível criar a lista de reforço.'));
        }
      }}
    >
      {fracos === null && !erroCarga && <p role="status" className={styles.muted}>Buscando os assuntos com pior desempenho…</p>}
      {fracos && fracos.length > 0 && (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className={styles.label}>Assuntos de pior desempenho</legend>
          {fracos.map((a) => (
            <label key={a.assunto} className={styles.check}>
              <input
                type="checkbox"
                checked={marcados.has(a.assunto)}
                onChange={() => {
                  const n = new Set(marcados);
                  if (n.has(a.assunto)) n.delete(a.assunto); else n.add(a.assunto);
                  setMarcados(n);
                  setTitulo(tituloReforcoPadrao(fracos.filter((x) => n.has(x.assunto)).map((x) => x.assunto)));
                }}
              />
              <span>
                {a.assunto} — <strong>{Math.round(a.taxaAcerto)}%</strong> de acerto
                <span className={styles.muted}> ({a.respostas} respostas)</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="reforco-titulo" className={styles.label}>Título da lista</label>
          <input id="reforco-titulo" className={styles.input} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor="reforco-qtd" className={styles.label}>Questões por assunto</label>
          <input id="reforco-qtd" type="number" min={1} max={10} className={styles.input} value={quantidade}
            onChange={(e) => setQuantidade(Math.min(10, Math.max(1, Number(e.target.value) || 1)))} />
        </div>
      </div>
      <p className={styles.muted}>Alunos: <strong>{quem}</strong>{alunos.length > 0 && ` (${alunos.map((a) => a.nome).join(', ')})`}</p>
      <label className={styles.check}>
        <input type="checkbox" checked={publicar} onChange={(e) => setPublicar(e.target.checked)} />
        Publicar agora para os alunos (desmarque para salvar como rascunho)
      </label>
    </ModalAcao>
  );
};
