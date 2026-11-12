import React, { useState } from 'react';
import { Button, EmptyState, useToast } from '../../ui';
import { mensagemErro } from '../../professor/professorService';
import { ROTULO_PAPEL } from './gestaoLogic';
import { gestaoService } from './gestaoService';
import type { UsuarioPapel } from './gestaoService';
import { useCarga } from './useCarga';
import styles from '../../professor/Professor.module.css';

const EDITAVEIS = ['COORDENADOR', 'PROFESSOR'];

/** FE-306 · Matriz de papéis × permissões (editável pelo admin) e atribuição de papel a partir da listagem. */
const PapeisView: React.FC = () => {
  const toast = useToast();
  const matriz = useCarga((s) => gestaoService.matriz(s), [], 'Não foi possível carregar a matriz de permissões.');
  const usuarios = useCarga((s) => gestaoService.usuarios(s), [], 'Não foi possível carregar os usuários.');
  // Só guarda as edições; sem edição, vale o que veio do servidor (assim não há corrida com o carregamento).
  const [edicoes, setEdicoes] = useState<Record<string, Set<string>>>({});
  const [salvando, setSalvando] = useState<string | null>(null);
  const [mudando, setMudando] = useState<string | null>(null);

  const atual = (papel: string): Set<string> => edicoes[papel] ?? new Set(matriz.dados?.matriz[papel] ?? []);

  const alterado = (papel: string) => {
    const base = new Set(matriz.dados?.matriz[papel] ?? []);
    const a = atual(papel);
    return base.size !== a.size || Array.from(base).some((c) => !a.has(c));
  };

  const alternar = (papel: string, chave: string) => {
    const n = new Set(atual(papel));
    if (n.has(chave)) n.delete(chave); else n.add(chave);
    setEdicoes((e) => ({ ...e, [papel]: n }));
  };

  const salvar = async (papel: string) => {
    setSalvando(papel);
    try {
      const m = await gestaoService.salvarPapel(papel, Array.from(atual(papel)));
      matriz.setDados(m);
      setEdicoes((e) => { const n = { ...e }; delete n[papel]; return n; });
      toast.show({ variant: 'success', message: `Permissões de ${ROTULO_PAPEL[papel].toLowerCase()} salvas. Os menus mudam no próximo acesso de quem tem esse papel.` });
    } catch (e: any) {
      toast.show({ variant: 'error', message: mensagemErro(e, 'Não foi possível salvar.') });
    } finally { setSalvando(null); }
  };

  const mudarPapel = async (u: UsuarioPapel, papel: UsuarioPapel['papel']) => {
    setMudando(u.id);
    try {
      const novo = await gestaoService.definirPapel(u.id, papel);
      usuarios.setDados((l) => (l ? l.map((x) => (x.id === u.id ? novo : x)) : l));
      toast.show({ variant: 'success', message: `${u.nome} agora é ${ROTULO_PAPEL[papel].toLowerCase()}.` });
    } catch (e: any) {
      toast.show({ variant: 'error', message: mensagemErro(e, 'Não foi possível alterar o papel.') });
    } finally { setMudando(null); }
  };

  return (
    <section className={styles.stack} aria-labelledby="pap-titulo">
      <h2 id="pap-titulo" className={styles.h2}>Papéis e permissões</h2>

      {matriz.erro && <div role="alert" className={styles.error}><p>{matriz.erro}</p><Button variant="secondary" onClick={matriz.recarregar}>Tentar novamente</Button></div>}
      {matriz.carregando && !matriz.dados && <p role="status" className={styles.muted}>Carregando…</p>}

      {matriz.dados && (
        <div className={`${styles.card} ${styles.stack}`}>
          <p className={styles.muted}>O administrador tem todas as permissões e não pode ser editado. Permissões marcadas como "só admin" não podem ser delegadas. Quem não tem uma permissão deixa de ver o item no menu.</p>
          <div className={styles.tableWrap} tabIndex={0}>
            <table className={styles.table}>
              <caption className="sr-only">Matriz de papéis por permissão</caption>
              <thead>
                <tr>
                  <th scope="col">Permissão</th>
                  {matriz.dados.papeis.map((p) => <th key={p} scope="col">{ROTULO_PAPEL[p] ?? p}</th>)}
                </tr>
              </thead>
              <tbody>
                {matriz.dados.permissoes.map((perm) => (
                  <tr key={perm.chave}>
                    <th scope="row" style={{ fontWeight: 'normal' }}>
                      {perm.titulo}{perm.somenteAdmin && <span className={styles.badge} style={{ marginLeft: 8 }}>só admin</span>}
                    </th>
                    {matriz.dados!.papeis.map((p) => {
                      const trava = p === 'ADMIN' || perm.somenteAdmin;
                      const marcado = p === 'ADMIN' ? true : atual(p).has(perm.chave);
                      return (
                        <td key={p}>
                          <input
                            type="checkbox" checked={trava ? p === 'ADMIN' : marcado} disabled={trava}
                            onChange={() => alternar(p, perm.chave)}
                            aria-label={`${perm.titulo} para ${ROTULO_PAPEL[p] ?? p}${trava ? ' (fixo)' : ''}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.row}>
            {EDITAVEIS.map((p) => (
              <Button key={p} onClick={() => void salvar(p)} loading={salvando === p} disabled={!alterado(p)}>
                Salvar {ROTULO_PAPEL[p].toLowerCase()}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className={`${styles.card} ${styles.stack}`}>
        <h3 className={styles.h2}>Usuários</h3>
        {usuarios.erro && <div role="alert" className={styles.error}><p>{usuarios.erro}</p><Button variant="secondary" onClick={usuarios.recarregar}>Tentar novamente</Button></div>}
        {usuarios.dados && usuarios.dados.length === 0 && <EmptyState compact title="Nenhum professor cadastrado" description="Convide ou importe professores para atribuir papéis." />}
        {usuarios.dados && usuarios.dados.length > 0 && (
          <div className={styles.tableWrap} tabIndex={0}>
            <table className={styles.table}>
              <caption className="sr-only">Professores e coordenadores da instituição</caption>
              <thead><tr><th scope="col">Nome</th><th scope="col">E-mail</th><th scope="col">Papel</th></tr></thead>
              <tbody>
                {usuarios.dados.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className={styles.select} style={{ maxWidth: 200 }} value={u.papel} disabled={mudando === u.id}
                        aria-label={`Papel de ${u.nome}`}
                        onChange={(e) => void mudarPapel(u, e.target.value as UsuarioPapel['papel'])}
                      >
                        <option value="PROFESSOR">Professor</option>
                        <option value="COORDENADOR">Coordenador</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default PapeisView;
