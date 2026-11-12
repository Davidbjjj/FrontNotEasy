import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, EmptyState, useToast } from '../../ui';
import { mensagemErro, professorService } from '../professorService';
import { formatDataHora } from '../professorLogic';
import type { ColunaExportacao, DisciplinaProfessor, Exportacao, ListaConfig } from '../types';
import styles from '../Professor.module.css';

const ROTULO_STATUS: Record<Exportacao['status'], string> = {
  PROCESSANDO: 'Gerando…', PRONTA: 'Pronta', ERRO: 'Falhou',
};
const CLASSE_STATUS: Record<Exportacao['status'], string> = {
  PROCESSANDO: styles.badgeInfo, PRONTA: styles.badgeOk, ERRO: styles.badgeDanger,
};

/**
 * FE-208 · Exportar notas por lista ou disciplina, em CSV ou PDF, escolhendo as colunas. O arquivo é gerado em
 * segundo plano: a tela acompanha o andamento e avisa quando está pronto.
 */
const ExportarNotasPage: React.FC = () => {
  const toast = useToast();
  const professorId = localStorage.getItem('userId') || '';
  const [escopo, setEscopo] = useState<'LISTA' | 'DISCIPLINA'>('LISTA');
  const [alvoId, setAlvoId] = useState('');
  const [formato, setFormato] = useState<'CSV' | 'PDF'>('CSV');
  const [colunas, setColunas] = useState<ColunaExportacao[]>([]);
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [listas, setListas] = useState<ListaConfig[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaProfessor[]>([]);
  const [historico, setHistorico] = useState<Exportacao[]>([]);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [baixando, setBaixando] = useState<string | null>(null);
  const conhecidos = useRef<Map<string, Exportacao['status']>>(new Map());

  const baixar = useCallback(async (e: Pick<Exportacao, 'id' | 'nomeArquivo'>) => {
    setBaixando(e.id);
    try {
      await professorService.baixarExportacao(e);
    } catch (err: any) {
      toast.show({ variant: 'error', message: mensagemErro(err, 'Não foi possível baixar o arquivo.') });
    } finally {
      setBaixando(null);
    }
  }, [toast]);

  const atualizarHistorico = useCallback(async (avisar: boolean) => {
    try {
      const h = await professorService.exportacoes();
      if (avisar) {
        h.forEach((e) => {
          const antes = conhecidos.current.get(e.id);
          if (antes === 'PROCESSANDO' && e.status === 'PRONTA') {
            toast.show({
              variant: 'success', message: `Arquivo de notas de "${e.alvoNome}" pronto.`,
              actionLabel: 'Baixar', onAction: () => void baixar(e), duration: 10000,
            });
          } else if (antes === 'PROCESSANDO' && e.status === 'ERRO') {
            toast.show({ variant: 'error', message: `Não foi possível gerar o arquivo de "${e.alvoNome}".` });
          }
        });
      }
      h.forEach((e) => conhecidos.current.set(e.id, e.status));
      setHistorico(h);
    } catch {
      /* mantém o histórico anterior; a próxima rodada tenta de novo */
    }
  }, [toast, baixar]);

  useEffect(() => {
    const c = new AbortController();
    Promise.all([
      professorService.colunasExportacao(c.signal),
      professorService.listasDoProfessor(professorId, c.signal),
      professorService.disciplinasDoProfessor(professorId, c.signal),
    ])
      .then(([cols, ls, ds]) => {
        setColunas(cols);
        setMarcadas(new Set(cols.map((x) => x.chave)));
        setListas(ls.filter((l) => l.status !== 'RASCUNHO'));
        setDisciplinas(ds);
      })
      .catch((e) => { if (!c.signal.aborted) setErroCarga(mensagemErro(e, 'Não foi possível carregar suas listas e disciplinas.')); });
    void atualizarHistorico(false);
    return () => c.abort();
  }, [professorId, atualizarHistorico]);

  // Enquanto houver arquivo sendo gerado, consulta a cada 3 s.
  const gerandoAlgum = historico.some((e) => e.status === 'PROCESSANDO');
  useEffect(() => {
    if (!gerandoAlgum) return undefined;
    const t = window.setInterval(() => void atualizarHistorico(true), 3000);
    return () => window.clearInterval(t);
  }, [gerandoAlgum, atualizarHistorico]);

  useEffect(() => { setAlvoId(''); }, [escopo]);

  const alvos = escopo === 'LISTA'
    ? listas.map((l) => ({ id: l.id, nome: l.titulo + (l.disciplinaNome ? ` — ${l.disciplinaNome}` : '') }))
    : disciplinas.map((d) => ({ id: d.id, nome: d.nome }));

  const alternarColuna = (k: string) => setMarcadas((s) => {
    const n = new Set(s);
    if (n.has(k)) n.delete(k); else n.add(k);
    return n;
  });

  const gerar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alvoId) { setErroForm(escopo === 'LISTA' ? 'Escolha a lista.' : 'Escolha a disciplina.'); return; }
    if (marcadas.size === 0) { setErroForm('Escolha ao menos uma coluna.'); return; }
    setErroForm(null);
    setGerando(true);
    try {
      const nova = await professorService.exportar({
        escopo, alvoId, formato, colunas: colunas.map((c) => c.chave).filter((k) => marcadas.has(k)),
      });
      conhecidos.current.set(nova.id, nova.status);
      setHistorico((h) => [nova, ...h]);
      toast.show({ variant: 'info', message: 'Gerando o arquivo em segundo plano. Avisamos quando estiver pronto.' });
    } catch (err: any) {
      setErroForm(mensagemErro(err, 'Não foi possível iniciar a exportação.'));
    } finally {
      setGerando(false);
    }
  };

  return (
    <main className={styles.page} aria-labelledby="export-titulo">
      <h1 id="export-titulo" className={styles.title}>Exportar notas</h1>
      <p className={styles.subtitle}>Leve as notas para o diário ou para uma planilha.</p>

      {erroCarga && <div role="alert" className={styles.error}><p>{erroCarga}</p></div>}

      <form className={`${styles.card} ${styles.stack}`} onSubmit={gerar} noValidate>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className={styles.label}>O que exportar</legend>
          <div className={styles.row}>
            <label className={styles.check}>
              <input type="radio" name="escopo" checked={escopo === 'LISTA'} onChange={() => setEscopo('LISTA')} /> Uma lista
            </label>
            <label className={styles.check}>
              <input type="radio" name="escopo" checked={escopo === 'DISCIPLINA'} onChange={() => setEscopo('DISCIPLINA')} /> Uma disciplina inteira
            </label>
          </div>
        </fieldset>

        <div className={styles.field}>
          <label htmlFor="export-alvo" className={styles.label}>{escopo === 'LISTA' ? 'Lista' : 'Disciplina'}</label>
          <select id="export-alvo" className={styles.select} value={alvoId} onChange={(e) => setAlvoId(e.target.value)}>
            <option value="">Escolha…</option>
            {alvos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </div>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className={styles.label}>Formato</legend>
          <div className={styles.row}>
            <label className={styles.check}><input type="radio" name="formato" checked={formato === 'CSV'} onChange={() => setFormato('CSV')} /> CSV (planilhas)</label>
            <label className={styles.check}><input type="radio" name="formato" checked={formato === 'PDF'} onChange={() => setFormato('PDF')} /> PDF (impressão)</label>
          </div>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className={styles.label}>Colunas</legend>
          <div className={styles.row}>
            {colunas.map((c) => (
              <label key={c.chave} className={styles.check} style={{ minWidth: 150 }}>
                <input type="checkbox" checked={marcadas.has(c.chave)} onChange={() => alternarColuna(c.chave)} /> {c.titulo}
              </label>
            ))}
          </div>
        </fieldset>

        {erroForm && <p role="alert" className={styles.errorText}>{erroForm}</p>}
        <div><Button type="submit" loading={gerando}>Gerar arquivo</Button></div>
      </form>

      <section aria-labelledby="export-hist" style={{ marginTop: 24 }}>
        <h2 id="export-hist" className={styles.h2}>Arquivos gerados</h2>
        {historico.length === 0 ? (
          <EmptyState compact title="Nenhuma exportação ainda" description="Os arquivos que você gerar ficam disponíveis aqui." />
        ) : (
          <div className={styles.tableWrap} tabIndex={0}>
            <table className={styles.table}>
              <caption className="sr-only">Exportações de notas</caption>
              <thead>
                <tr><th scope="col">Conteúdo</th><th scope="col">Formato</th><th scope="col">Criado em</th><th scope="col">Situação</th><th scope="col"><span className="sr-only">Ação</span></th></tr>
              </thead>
              <tbody>
                {historico.map((e) => (
                  <tr key={e.id}>
                    <td>{e.alvoNome} <span className={styles.muted}>({e.escopo === 'LISTA' ? 'lista' : 'disciplina'})</span></td>
                    <td>{e.formato}</td>
                    <td>{formatDataHora(e.criadaEm)}</td>
                    <td>
                      <span className={`${styles.badge} ${CLASSE_STATUS[e.status]}`} role="status">{ROTULO_STATUS[e.status]}</span>
                      {e.erro && <div className={styles.errorText}>{e.erro}</div>}
                    </td>
                    <td>
                      {e.status === 'PRONTA' && (
                        <Button variant="secondary" loading={baixando === e.id} onClick={() => void baixar(e)}>Baixar</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default ExportarNotasPage;
