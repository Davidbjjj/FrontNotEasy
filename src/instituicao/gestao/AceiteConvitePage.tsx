import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../ui';
import { mensagemErro } from '../../professor/professorService';
import { ROTULO_PAPEL, senhaForte } from './gestaoLogic';
import { gestaoService } from './gestaoService';
import type { InfoConvite } from './gestaoService';
import styles from '../../professor/Professor.module.css';

const MENSAGEM_STATUS: Record<string, string> = {
  ACEITO: 'Este convite já foi aceito. Entre com o seu e-mail e a senha que você criou.',
  CANCELADO: 'Este convite foi cancelado pela instituição.',
  EXPIRADO: 'Este convite expirou. Peça um novo convite à instituição.',
};

/** FE-302 · Tela pública de aceite: o convidado confere os dados, cria a senha e já pode entrar. */
const AceiteConvitePage: React.FC = () => {
  const { token = '' } = useParams();
  const [info, setInfo] = useState<InfoConvite | null>(null);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const c = new AbortController();
    gestaoService.infoConvite(token, c.signal)
      .then((i) => { if (!c.signal.aborted) { setInfo(i); setNome(i.nome ?? ''); } })
      .catch((e) => {
        if (c.signal.aborted) return;
        setErroCarga(e?.response?.status === 404 ? 'Convite não encontrado. Confira o link que você recebeu.'
          : mensagemErro(e, 'Não foi possível abrir o convite.'));
      });
    return () => c.abort();
  }, [token]);

  const precisaNome = info && !info.contaPreCriada && !info.nome;
  const precisaNascimento = info && !info.contaPreCriada && info.papel === 'ALUNO';

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (precisaNome && !nome.trim()) { setErro('Informe seu nome.'); return; }
    if (precisaNascimento && !nascimento) { setErro('Informe sua data de nascimento.'); return; }
    if (!senhaForte(senha)) { setErro('A senha precisa ter 8 ou mais caracteres, com letra maiúscula, minúscula e número.'); return; }
    if (senha !== confirma) { setErro('As senhas não conferem.'); return; }
    setErro(null);
    setEnviando(true);
    try {
      await gestaoService.aceitarConvite(token, {
        nome: precisaNome ? nome.trim() : undefined, senha, dataNascimento: precisaNascimento ? nascimento : undefined,
      });
      setPronto(true);
    } catch (err: any) {
      setErro(mensagemErro(err, 'Não foi possível aceitar o convite.'));
    } finally { setEnviando(false); }
  };

  return (
    <main className={styles.page} style={{ maxWidth: 520 }} aria-labelledby="aceite-titulo">
      <h1 id="aceite-titulo" className={styles.title}>Convite</h1>

      {erroCarga && <div role="alert" className={styles.error}><p>{erroCarga}</p><Link to="/login" className={styles.link}>Ir para o login</Link></div>}
      {!info && !erroCarga && <p role="status" className={styles.muted}>Abrindo convite…</p>}

      {info && info.status !== 'PENDENTE' && !pronto && (
        <div role="alert" className={styles.error}><p>{MENSAGEM_STATUS[info.status] ?? 'Este convite não pode mais ser usado.'}</p><Link to="/login" className={styles.link}>Ir para o login</Link></div>
      )}

      {info && info.status === 'PENDENTE' && !pronto && (
        <form className={`${styles.card} ${styles.stack}`} onSubmit={enviar} noValidate>
          <p style={{ margin: 0 }}>
            <strong>{info.instituicao}</strong> convidou <strong>{info.email}</strong> para entrar como <strong>{(ROTULO_PAPEL[info.papel] ?? info.papel).toLowerCase()}</strong>.
          </p>
          {info.disciplinas.length > 0 && <p className={styles.muted} style={{ margin: 0 }}>Disciplinas: {info.disciplinas.join(', ')}.</p>}
          {precisaNome && (
            <div className={styles.field}>
              <label htmlFor="ac-nome" className={styles.label}>Seu nome</label>
              <input id="ac-nome" className={styles.input} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
            </div>
          )}
          {precisaNascimento && (
            <div className={styles.field}>
              <label htmlFor="ac-nasc" className={styles.label}>Data de nascimento</label>
              <input id="ac-nasc" type="date" className={styles.input} value={nascimento} onChange={(e) => setNascimento(e.target.value)} />
            </div>
          )}
          <div className={styles.field}>
            <label htmlFor="ac-senha" className={styles.label}>Crie uma senha</label>
            <input id="ac-senha" type="password" className={styles.input} value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" aria-describedby="ac-senha-dica" />
            <span id="ac-senha-dica" className={styles.hint}>Mínimo de 8 caracteres, com maiúscula, minúscula e número.</span>
          </div>
          <div className={styles.field}>
            <label htmlFor="ac-conf" className={styles.label}>Repita a senha</label>
            <input id="ac-conf" type="password" className={styles.input} value={confirma} onChange={(e) => setConfirma(e.target.value)} autoComplete="new-password" />
          </div>
          {erro && <p role="alert" className={styles.errorText}>{erro}</p>}
          <div><Button type="submit" loading={enviando}>Aceitar convite e criar senha</Button></div>
        </form>
      )}

      {pronto && (
        <div className={`${styles.card} ${styles.stack}`} role="status">
          <h2 className={styles.h2}>Tudo certo!</h2>
          <p style={{ margin: 0 }}>Sua senha foi criada. Entre com <strong>{info?.email}</strong>.</p>
          <div><Link to="/login" className={styles.link}>Ir para o login →</Link></div>
        </div>
      )}
    </main>
  );
};

export default AceiteConvitePage;
