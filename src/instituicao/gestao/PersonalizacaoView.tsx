import React, { useEffect, useRef, useState } from 'react';
import { Button, useToast } from '../../ui';
import { API_BASE } from '../../services/apiClient';
import { mensagemErro } from '../../professor/professorService';
import { aplicarCorPrincipal, contrasteComBranco, corValida } from './gestaoLogic';
import { notificarBranding } from '../../branding/brandingStore';
import { gestaoService } from './gestaoService';
import { useCarga } from './useCarga';
import styles from '../../professor/Professor.module.css';

const COR_PADRAO = '#2563eb';

/** FE-309 · Logo, cor principal (via tokens do FE-001), regras padrão de novas listas e área de integrações. */
const PersonalizacaoView: React.FC = () => {
  const toast = useToast();
  const cfg = useCarga((s) => gestaoService.config(s), [], 'Não foi possível carregar as configurações.');
  const [cor, setCor] = useState('');
  const [tentativas, setTentativas] = useState('');
  const [tempo, setTempo] = useState('');
  const [gabarito, setGabarito] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const arquivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const c = cfg.dados;
    if (!c) return;
    setCor(c.corPrincipal ?? '');
    setTentativas(c.tentativasPadrao == null ? '' : String(c.tentativasPadrao));
    setTempo(c.tempoLimitePadraoMinutos == null ? '' : String(c.tempoLimitePadraoMinutos));
    setGabarito(c.gabaritoLiberadoPadrao);
  }, [cfg.dados]);

  const contraste = corValida(cor) ? contrasteComBranco(cor) : null;
  const corProblema = cor && !corValida(cor) ? 'Use o formato #RRGGBB.' : contraste !== null && contraste < 4.5
    ? `Essa cor é clara demais: o texto branco sobre ela teria contraste ${contraste.toFixed(1).replace('.', ',')}:1 (mínimo 4,5:1).` : null;

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = tentativas.trim() === '' ? null : Number(tentativas);
    const m = tempo.trim() === '' ? null : Number(tempo);
    if (corProblema) { setErro(corProblema); return; }
    if (t != null && (!Number.isInteger(t) || t < 1 || t > 20)) { setErro('As tentativas padrão devem ficar entre 1 e 20.'); return; }
    if (m != null && (!Number.isInteger(m) || m < 1 || m > 600)) { setErro('O tempo limite padrão deve ficar entre 1 e 600 minutos.'); return; }
    setErro(null);
    setSalvando(true);
    try {
      const nova = await gestaoService.salvarConfig({
        corPrincipal: cor || null, tentativasPadrao: t, tempoLimitePadraoMinutos: m, gabaritoLiberadoPadrao: gabarito,
      });
      cfg.setDados(nova);
      notificarBranding({ corPrincipal: nova.corPrincipal, logoUrl: nova.logoUrl });
      toast.show({ variant: 'success', message: 'Configurações salvas. A nova cor vale para todos os usuários da instituição.' });
    } catch (err: any) {
      setErro(mensagemErro(err, 'Não foi possível salvar as configurações.'));
    } finally { setSalvando(false); }
  };

  const previaCor = () => aplicarCorPrincipal(corValida(cor) && !corProblema ? cor : null);

  const enviarLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/png', 'image/jpeg'].includes(f.type)) { setErro('Use um logo PNG ou JPG.'); e.target.value = ''; return; }
    if (f.size > 1024 * 1024) { setErro('O logo pode ter no máximo 1 MB.'); e.target.value = ''; return; }
    setErro(null);
    setEnviandoLogo(true);
    try {
      const nova = await gestaoService.enviarLogo(f);
      cfg.setDados(nova);
      notificarBranding({ corPrincipal: nova.corPrincipal, logoUrl: nova.logoUrl });
      toast.show({ variant: 'success', message: 'Logo atualizado.' });
    } catch (err: any) {
      setErro(mensagemErro(err, 'Não foi possível enviar o logo.'));
    } finally {
      setEnviandoLogo(false);
      if (arquivoRef.current) arquivoRef.current.value = '';
    }
  };

  const removerLogo = async () => {
    setEnviandoLogo(true);
    try {
      const nova = await gestaoService.removerLogo();
      cfg.setDados(nova);
      notificarBranding({ corPrincipal: nova.corPrincipal, logoUrl: null });
      toast.show({ variant: 'success', message: 'Logo removido.' });
    } catch (err: any) {
      setErro(mensagemErro(err, 'Não foi possível remover o logo.'));
    } finally { setEnviandoLogo(false); }
  };

  return (
    <section className={styles.stack} aria-labelledby="pers-titulo">
      <h2 id="pers-titulo" className={styles.h2}>Identidade e regras padrão</h2>

      {cfg.erro && <div role="alert" className={styles.error}><p>{cfg.erro}</p><Button variant="secondary" onClick={cfg.recarregar}>Tentar novamente</Button></div>}
      {cfg.carregando && !cfg.dados && <p role="status" className={styles.muted}>Carregando…</p>}

      {cfg.dados && (
        <>
          <div className={`${styles.card} ${styles.stack}`}>
            <h3 className={styles.h2}>Logo</h3>
            <div className={styles.row}>
              {cfg.dados.logoUrl
                ? <img src={`${API_BASE}${cfg.dados.logoUrl}`} alt="Logo atual da instituição" style={{ maxHeight: 64, maxWidth: 220, border: '1px solid var(--border)', borderRadius: 8, padding: 4 }} />
                : <span className={styles.muted}>Nenhum logo enviado.</span>}
            </div>
            <div className={styles.field}>
              <label htmlFor="pers-logo" className={styles.label}>Enviar logo (PNG ou JPG, até 1 MB)</label>
              <input id="pers-logo" ref={arquivoRef} type="file" accept="image/png,image/jpeg" onChange={enviarLogo} disabled={enviandoLogo} />
              <span className={styles.hint}>Aparece no topo do app e no cabeçalho de boletins e relatórios em PDF.</span>
            </div>
            {cfg.dados.temLogo && <div><Button variant="secondary" onClick={() => void removerLogo()} loading={enviandoLogo}>Remover logo</Button></div>}
          </div>

          <form className={`${styles.card} ${styles.stack}`} onSubmit={salvar} noValidate aria-label="Cor e regras padrão">
            <h3 className={styles.h2}>Cor principal</h3>
            <div className={styles.row} style={{ alignItems: 'flex-end' }}>
              <div className={styles.field}>
                <label htmlFor="pers-cor-seletor" className={styles.label}>Escolher cor</label>
                <input id="pers-cor-seletor" type="color" value={corValida(cor) ? cor : COR_PADRAO} onChange={(e) => setCor(e.target.value)}
                  style={{ width: 64, height: 44, padding: 2, border: '1px solid var(--border)', borderRadius: 8 }} />
              </div>
              <div className={styles.field}>
                <label htmlFor="pers-cor" className={styles.label}>Código da cor</label>
                <input id="pers-cor" className={styles.input} value={cor} placeholder={COR_PADRAO} maxLength={7} onChange={(e) => setCor(e.target.value)}
                  aria-invalid={corProblema ? true : undefined} aria-describedby="pers-cor-info" />
              </div>
              <Button variant="secondary" onClick={previaCor}>Ver prévia agora</Button>
              <Button variant="ghost" onClick={() => { setCor(''); aplicarCorPrincipal(null); }}>Voltar ao padrão</Button>
            </div>
            <p id="pers-cor-info" className={corProblema ? styles.errorText : styles.hint}>
              {corProblema ?? (contraste ? `Contraste do texto branco: ${contraste.toFixed(1).replace('.', ',')}:1. Tudo certo.` : 'Vazio usa o azul padrão do app. A cor vira o botão principal e o foco dos campos.')}
            </p>

            <h3 className={styles.h2} style={{ marginTop: 16 }}>Regras padrão para novas listas</h3>
            <p className={styles.muted}>Valem só para listas criadas daqui em diante; cada professor ainda pode ajustar a sua.</p>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="pers-tent" className={styles.label}>Tentativas</label>
                <input id="pers-tent" type="number" min={1} max={20} className={styles.input} value={tentativas} onChange={(e) => setTentativas(e.target.value)} />
                <span className={styles.hint}>Vazio: 1 tentativa.</span>
              </div>
              <div className={styles.field}>
                <label htmlFor="pers-tempo" className={styles.label}>Tempo limite (minutos)</label>
                <input id="pers-tempo" type="number" min={1} max={600} className={styles.input} value={tempo} onChange={(e) => setTempo(e.target.value)} />
                <span className={styles.hint}>Vazio: sem tempo limite.</span>
              </div>
            </div>
            <label className={styles.check}>
              <input type="checkbox" checked={gabarito} onChange={(e) => setGabarito(e.target.checked)} />
              Gabarito já liberado para revisão nas novas listas (desmarcado: o professor libera depois)
            </label>
            {erro && <p role="alert" className={styles.errorText}>{erro}</p>}
            <div><Button type="submit" loading={salvando}>Salvar configurações</Button></div>
          </form>

          <div className={`${styles.card} ${styles.stack}`}>
            <h3 className={styles.h2}>Integrações</h3>
            <p className={styles.muted}>Esta área está pronta para as próximas conexões. Ainda não há nenhuma integração ativa.</p>
            <ul className={styles.stack} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {cfg.dados.integracoes.map((i) => (
                <li key={i.chave} className={`${styles.cardAlt} ${styles.rowBetween}`}>
                  <span>{i.nome}</span>
                  <span className={styles.badge}>Em breve</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
};

export default PersonalizacaoView;
