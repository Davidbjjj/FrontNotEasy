import React, { useRef, useState } from 'react';
import { Button, EmptyState, useToast } from '../../ui';
import { mensagemErro } from '../../professor/professorService';
import { baixarTexto, modeloCsv, relatorioErrosCsv, ROTULO_STATUS_LINHA } from './gestaoLogic';
import { gestaoService } from './gestaoService';
import type { PreviaImportacao, ResultadoImportacao, TipoImportacao } from './gestaoService';
import styles from '../../professor/Professor.module.css';

const classeStatus = (s: string) =>
  s === 'ERRO' ? styles.badgeDanger : s === 'NOVO' ? styles.badgeOk : s === 'ATUALIZAR' ? styles.badgeInfo : '';

/** FE-301 · Importação em massa de alunos e professores por CSV: modelo, prévia, validação por linha e relatório. */
const ImportacaoView: React.FC = () => {
  const toast = useToast();
  const [tipo, setTipo] = useState<TipoImportacao>('ALUNOS');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previa, setPrevia] = useState<PreviaImportacao | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reiniciar = () => {
    setArquivo(null); setPrevia(null); setResultado(null); setErro(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const escolher = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setResultado(null);
    setPrevia(null);
    setErro(null);
    setArquivo(f);
    if (!f) return;
    if (!/\.csv$/i.test(f.name) && !f.type.includes('csv') && f.type !== 'text/plain') {
      setErro('Escolha um arquivo .csv.');
      return;
    }
    setOcupado(true);
    try {
      setPrevia(await gestaoService.previaImportacao(tipo, f));
    } catch (err: any) {
      setErro(mensagemErro(err, 'Não foi possível ler o arquivo.'));
    } finally {
      setOcupado(false);
    }
  };

  const mudarTipo = (t: TipoImportacao) => { setTipo(t); reiniciar(); };

  const confirmar = async () => {
    if (!arquivo || !previa) return;
    setOcupado(true);
    setErro(null);
    try {
      const r = await gestaoService.confirmarImportacao(tipo, arquivo);
      setResultado(r);
      setPrevia(null);
      toast.show({
        variant: 'success',
        message: `Importação concluída: ${r.resumo.novos} criados, ${r.resumo.atualizados} atualizados, ${r.resumo.ignorados} ignorados.`,
      });
    } catch (err: any) {
      setErro(mensagemErro(err, 'Não foi possível concluir a importação.'));
    } finally {
      setOcupado(false);
    }
  };

  const baixarErros = (linhas: PreviaImportacao['linhas'], colunas: string[]) =>
    baixarTexto(relatorioErrosCsv(linhas, colunas), `erros-importacao-${tipo.toLowerCase()}.csv`);

  const aplicaveis = previa ? previa.resumo.novos + previa.resumo.atualizados : 0;

  return (
    <section className={styles.stack} aria-labelledby="imp-titulo">
      <h2 id="imp-titulo" className={styles.h2}>Importar alunos e professores</h2>
      <p className={styles.muted}>Envie um CSV em vez de cadastrar um a um. Cada pessoa nova recebe um convite para criar a senha.</p>

      <div className={`${styles.card} ${styles.stack}`}>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className={styles.label}>Quem você vai importar</legend>
          <div className={styles.row}>
            <label className={styles.check}><input type="radio" name="imp-tipo" checked={tipo === 'ALUNOS'} onChange={() => mudarTipo('ALUNOS')} /> Alunos</label>
            <label className={styles.check}><input type="radio" name="imp-tipo" checked={tipo === 'PROFESSORES'} onChange={() => mudarTipo('PROFESSORES')} /> Professores</label>
          </div>
        </fieldset>

        <div className={styles.row}>
          <Button variant="secondary" onClick={() => baixarTexto(modeloCsv(tipo), `modelo-${tipo.toLowerCase()}.csv`)}>
            Baixar modelo de CSV
          </Button>
          <span className={styles.hint}>
            {tipo === 'ALUNOS'
              ? 'Colunas: nome, email, data_nascimento (AAAA-MM-DD ou DD/MM/AAAA) e disciplinas (nomes separados por |, opcional).'
              : 'Colunas: nome, email e disciplinas (nomes separados por |, opcional). Quem é listado vira o professor da disciplina.'}
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor="imp-arquivo" className={styles.label}>Arquivo CSV (até 2 MB e 2000 linhas)</label>
          <input id="imp-arquivo" ref={inputRef} type="file" accept=".csv,text/csv" onChange={escolher} disabled={ocupado} />
        </div>
        {ocupado && <p role="status" className={styles.muted}>Processando…</p>}
        {erro && <p role="alert" className={styles.errorText}>{erro}</p>}
      </div>

      {previa && (
        <div className={`${styles.card} ${styles.stack}`} aria-label="Prévia da importação">
          <h3 className={styles.h2}>Prévia: {previa.resumo.total} {previa.resumo.total === 1 ? 'linha' : 'linhas'}</h3>
          <p role="status" className={styles.row}>
            <span className={`${styles.badge} ${styles.badgeOk}`}>{previa.resumo.novos} novos</span>
            <span className={`${styles.badge} ${styles.badgeInfo}`}>{previa.resumo.atualizados} a atualizar</span>
            <span className={styles.badge}>{previa.resumo.ignorados} sem mudança</span>
            <span className={`${styles.badge} ${previa.resumo.erros ? styles.badgeDanger : ''}`}>{previa.resumo.erros} com erro</span>
          </p>
          <div className={styles.tableWrap} tabIndex={0} style={{ maxHeight: 420, overflow: 'auto' }}>
            <table className={styles.table}>
              <caption className="sr-only">Linhas do arquivo, com a situação e os erros de cada uma</caption>
              <thead>
                <tr>
                  <th scope="col">Linha</th>
                  {previa.colunas.map((c) => <th key={c} scope="col">{c}</th>)}
                  <th scope="col">Situação</th>
                </tr>
              </thead>
              <tbody>
                {previa.linhas.map((l) => (
                  <tr key={l.numero}>
                    <td>{l.numero}</td>
                    {previa.colunas.map((c) => <td key={c}>{l.dados[c] || '—'}</td>)}
                    <td>
                      <span className={`${styles.badge} ${classeStatus(l.status)}`}>{ROTULO_STATUS_LINHA[l.status]}</span>
                      {l.erros.map((e) => <div key={e} className={styles.errorText}>{e}</div>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.row}>
            <Button onClick={() => void confirmar()} loading={ocupado} disabled={aplicaveis === 0}>
              Confirmar importação ({aplicaveis} {aplicaveis === 1 ? 'linha' : 'linhas'})
            </Button>
            {previa.resumo.erros > 0 && (
              <Button variant="secondary" onClick={() => baixarErros(previa.linhas, previa.colunas)}>Baixar relatório de erros</Button>
            )}
            <Button variant="ghost" onClick={reiniciar}>Escolher outro arquivo</Button>
          </div>
          {previa.resumo.erros > 0 && (
            <p className={styles.hint}>As linhas com erro não serão importadas. Corrija-as no relatório e envie de novo: quem já foi criado fica como "sem mudança".</p>
          )}
        </div>
      )}

      {resultado && (
        <div className={`${styles.card} ${styles.stack}`} role="region" aria-label="Resumo da importação">
          <h3 className={styles.h2}>Importação concluída</h3>
          <ul className={styles.summary}>
            <li><strong>{resultado.resumo.novos}</strong> criados ({resultado.convitesGerados} convites gerados para definir a senha)</li>
            <li><strong>{resultado.resumo.atualizados}</strong> atualizados</li>
            <li><strong>{resultado.resumo.ignorados}</strong> ignorados (sem mudança)</li>
            <li><strong>{resultado.resumo.erros}</strong> com erro e não importados</li>
          </ul>
          <div className={styles.row}>
            {resultado.comErro.length > 0 && (
              <Button variant="secondary" onClick={() => baixarErros(resultado.comErro, Object.keys(resultado.comErro[0].dados))}>
                Baixar relatório de erros
              </Button>
            )}
            <Button variant="ghost" onClick={reiniciar}>Nova importação</Button>
          </div>
        </div>
      )}

      {!previa && !resultado && !erro && !ocupado && (
        <EmptyState compact icon={<span aria-hidden="true">📥</span>} title="Nenhum arquivo escolhido"
          description="Baixe o modelo, preencha e escolha o arquivo para ver a prévia antes de confirmar." />
      )}
    </section>
  );
};

export default ImportacaoView;
