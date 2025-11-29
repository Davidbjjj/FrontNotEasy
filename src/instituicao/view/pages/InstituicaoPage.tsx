import React, { useState } from 'react';
import { instituicaoService } from '../../services/api/instituicao.service';
import { disciplinaService } from '../../../disciplinas/services/api/disciplina.service';
import materiaService, { Materia } from '../../services/api/materia.service';
import './InstituicaoPage.css';

const InstituicaoPage: React.FC = () => {
  const instituicaoId = localStorage.getItem('userId') || '';

  const [email, setEmail] = useState('');
  const [emailResult, setEmailResult] = useState<any>(null);
  const [permittedEmails, setPermittedEmails] = useState<string[]>([]);
  const [professor, setProfessor] = useState({ nome: '', email: '', senha: '', dataNascimento: '', materia1Id: '', materia2Id: '' });
  const [disciplina, setDisciplina] = useState({ nome: '', professorId: '' });
  const [estudante, setEstudante] = useState({ nome: '', email: '', senha: '', dataNascimento: '' });
  const [disciplinasList, setDisciplinasList] = useState<any[]>([]);
  const [materiasList, setMateriasList] = useState<Materia[]>([]);

  // derive professor options from disciplinas (backend may return professor id or name)
  const professorOptions = React.useMemo(() => {
    const map = new Map<string, { id: string; nome: string }>();
    disciplinasList.forEach((d) => {
      const id = d.professorId || d.professor?.id || d.professorId || d.professorId === 0 ? String(d.professorId) : (d.professor?.id || '');
      const nome = d.nomeProfessor || (d.professor && d.professor.nome) || d.professorNome || '';
      if (id || nome) {
        const key = id || nome;
        if (!map.has(key)) map.set(key, { id: key, nome: nome || key });
      }
    });
    return Array.from(map.values());
  }, [disciplinasList]);
  const [message, setMessage] = useState<string | null>(null);

  // loading states for each form to disable submit and show progress
  const [loadingAddEmail, setLoadingAddEmail] = useState(false);
  const [loadingCreateProfessor, setLoadingCreateProfessor] = useState(false);
  const [loadingCreateDisciplina, setLoadingCreateDisciplina] = useState(false);
  const [loadingCreateEstudante, setLoadingCreateEstudante] = useState(false);
  const [loadingAddEst, setLoadingAddEst] = useState(false);
  const [loadingAssociateProf, setLoadingAssociateProf] = useState(false);

  // Helpers: basic validators
  const isEmailValid = (em: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  const isDateValid = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!instituicaoId) return;
        const list = await instituicaoService.listPermittedEmails(instituicaoId);
        if (mounted) setPermittedEmails(list || []);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [instituicaoId]);

  // load disciplinas for selects (institution role)
  React.useEffect(() => {
    let mounted = true;
    async function loadDisciplinas() {
      try {
        if (!instituicaoId) return;
        const list = await disciplinaService.getDisciplinas(instituicaoId, 'INSTITUICAO');
        if (mounted) setDisciplinasList(list || []);
      } catch (e) {
        // ignore
      }
    }
    loadDisciplinas();
    return () => { mounted = false; };
  }, [instituicaoId]);

  // load materias for professor form
  React.useEffect(() => {
    let mounted = true;
    async function loadMaterias() {
      try {
        if (!instituicaoId) return;
        const list = await materiaService.getMaterias(instituicaoId);
        if (mounted) setMateriasList(list || []);
      } catch (e) {
        console.error('Erro ao carregar matérias:', e);
      }
    }
    loadMaterias();
    return () => { mounted = false; };
  }, [instituicaoId]);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email) return setMessage('Informe um email');
    if (!isEmailValid(email)) return setMessage('Email inválido');
    setLoadingAddEmail(true);
    try {
      const result = await instituicaoService.addPermittedEmails(instituicaoId, [email]);
      setEmailResult(result);
      setMessage('Email(s) permitidos adicionados com sucesso');
      setEmail('');
      // refresh list
      try {
        const list = await instituicaoService.listPermittedEmails(instituicaoId);
        setPermittedEmails(list || []);
      } catch (_) {
        // ignore
      }
    } catch (err: any) {
      setMessage(err?.response?.data || String(err));
    } finally {
      setLoadingAddEmail(false);
    }
  };

  const handleCreateProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    // basic validation
    if (!professor.nome) return setMessage('Informe o nome do professor');
    if (!professor.email) return setMessage('Informe o email do professor');
    if (!isEmailValid(professor.email)) return setMessage('Email do professor inválido');
    if (!professor.senha || professor.senha.length < 6) return setMessage('Senha deve ter ao menos 6 caracteres');
    if (!professor.materia1Id) return setMessage('Informe a matéria principal');
    if (professor.dataNascimento && !isDateValid(professor.dataNascimento)) return setMessage('Formato de data inválido (YYYY-MM-DD)');

    setLoadingCreateProfessor(true);
    try {
      const payload = {
        nome: professor.nome,
        dataNascimento: professor.dataNascimento || '',
        email: professor.email,
        senha: professor.senha,
        materia1Id: professor.materia1Id || '',
        materia2Id: professor.materia2Id || '',
        instituicaoId,
      };
      await instituicaoService.registerProfessor(payload);
      setMessage('Professor criado com sucesso');
      setProfessor({ nome: '', email: '', senha: '', dataNascimento: '', materia1Id: '', materia2Id: '' } as any);
    } catch (err: any) {
      const msg = err?.response?.data || String(err);
      // If backend says email not authorized, offer to add
      if (err?.response?.status === 400 && String(msg).toLowerCase().includes('email não autorizado')) {
        const confirmAdd = window.confirm('Email não autorizado. Deseja adicionar este e-mail à lista de permitidos?');
        if (confirmAdd) {
            try {
            await instituicaoService.addPermittedEmails(instituicaoId, [professor.email]);
            setMessage('Email adicionado. Tente criar o professor novamente.');
            try {
              const list = await instituicaoService.listPermittedEmails(instituicaoId);
              setPermittedEmails(list || []);
            } catch (_) {
              // ignore
            }
          } catch (addErr: any) {
            setMessage(addErr?.response?.data || String(addErr));
          }
        } else {
          setMessage(msg);
        }
      } else {
        setMessage(msg);
      }
    } finally {
      setLoadingCreateProfessor(false);
    }
  };

  const handleCreateDisciplina = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!disciplina.nome) return setMessage('Informe o nome da disciplina');
    if (!disciplina.professorId) return setMessage('Informe o professor responsável (ID)');
    setLoadingCreateDisciplina(true);
    try {
      const payload = { nome: disciplina.nome, instituicaoId, professorId: disciplina.professorId };
      await instituicaoService.createDisciplina(payload);
      setMessage('Disciplina criada com sucesso');
      setDisciplina({ nome: '', professorId: '' } as any);
    } catch (err: any) {
      setMessage(err?.response?.data || String(err));
    } finally {
      setLoadingCreateDisciplina(false);
    }
  };

  const handleCreateEstudante = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!estudante.nome) return setMessage('Informe o nome do estudante');
    if (!estudante.email) return setMessage('Informe o email do estudante');
    if (!isEmailValid(estudante.email)) return setMessage('Email do estudante inválido');
    if (!estudante.senha || estudante.senha.length < 6) return setMessage('Senha deve ter ao menos 6 caracteres');
    if (!estudante.dataNascimento) return setMessage('Informe a data de nascimento');
    if (!isDateValid(estudante.dataNascimento)) return setMessage('Formato de data inválido (YYYY-MM-DD)');
    setLoadingCreateEstudante(true);
    try {
      const payload = { nome: estudante.nome, dataNascimento: estudante.dataNascimento || '', email: estudante.email, senha: estudante.senha, instituicaoId };
      await instituicaoService.registerEstudante(payload);
      setMessage('Estudante criado com sucesso');
      setEstudante({ nome: '', email: '', senha: '', dataNascimento: '' } as any);
    } catch (err: any) {
      setMessage(err?.response?.data || String(err));
    } finally {
      setLoadingCreateEstudante(false);
    }
  };

  const [addEstPayload, setAddEstPayload] = useState({ disciplinaId: '', estudanteId: '' });
  const handleAddEstudanteToDisciplina = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!addEstPayload.disciplinaId) return setMessage('Informe disciplinaId');
    if (!addEstPayload.estudanteId) return setMessage('Informe estudanteId');
    setLoadingAddEst(true);
    try {
      const payload = { estudanteId: addEstPayload.estudanteId, disciplinaId: addEstPayload.disciplinaId };
      await instituicaoService.addEstudanteToDisciplina(payload);
      setMessage('Estudante matriculado com sucesso');
      setAddEstPayload({ disciplinaId: '', estudanteId: '' });
    } catch (err: any) {
      setMessage(err?.response?.data || String(err));
    } finally {
      setLoadingAddEst(false);
    }
  };

  const [assocProfPayload, setAssocProfPayload] = useState({ disciplinaId: '', professorId: '' });
  const handleAssociateProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!assocProfPayload.disciplinaId) return setMessage('Informe disciplinaId');
    if (!assocProfPayload.professorId) return setMessage('Informe professorId');
    setLoadingAssociateProf(true);
    try {
      await instituicaoService.associateProfessorToDisciplina(assocProfPayload.disciplinaId, assocProfPayload.professorId);
      setMessage('Professor associado com sucesso');
      setAssocProfPayload({ disciplinaId: '', professorId: '' });
    } catch (err: any) {
      setMessage(err?.response?.data?.message || String(err));
    } finally {
      setLoadingAssociateProf(false);
    }
  };

  const handleRemovePermittedEmail = async (emailToRemove: string) => {
    setMessage(null);
    try {
      await instituicaoService.removePermittedEmail(instituicaoId, emailToRemove);
      setMessage('Email removido com sucesso');
      try {
        const list = await instituicaoService.listPermittedEmails(instituicaoId);
        setPermittedEmails(list || []);
      } catch (_) {
        // ignore
      }
    } catch (err: any) {
      setMessage(err?.response?.data || String(err));
    }
  };

  return (
    <div className="instituicao-page">
      <h1>Área da Instituição</h1>
      {message && <div className="instituicao-message">{message}</div>}

      <section className="instituicao-section">
        <h2>1) Permitir Email de Professor</h2>
        <form onSubmit={handleAddEmail}>
          <input placeholder="email@dominio.edu.br" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={loadingAddEmail}>{loadingAddEmail ? 'Adicionando...' : 'Adicionar email permitido'}</button>
        </form>
        {emailResult && <pre className="instituicao-result">{JSON.stringify(emailResult, null, 2)}</pre>}
        <div style={{ marginTop: 8 }}>
          <strong>Emails permitidos:</strong>
          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexDirection: 'column' }}>
            {permittedEmails.length === 0 ? (
              <div style={{ color: '#6b7280' }}>Nenhum email cadastrado</div>
            ) : (
              permittedEmails.map((em) => (
                <div key={em} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>{em}</div>
                  <div>
                    <button type="button" onClick={() => handleRemovePermittedEmail(em)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 6 }}>Remover</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="instituicao-section">
        <h2>2) Criar Professor</h2>
        <form onSubmit={handleCreateProfessor}>
          <input placeholder="Nome" value={professor.nome} onChange={(e) => setProfessor({ ...professor, nome: e.target.value })} />
          <input placeholder="Email" value={professor.email} onChange={(e) => setProfessor({ ...professor, email: e.target.value })} />
          <input placeholder="Senha" value={professor.senha} onChange={(e) => setProfessor({ ...professor, senha: e.target.value })} />
          <input type="date" placeholder="Data nascimento (YYYY-MM-DD)" value={professor.dataNascimento} onChange={(e) => setProfessor({ ...professor, dataNascimento: e.target.value })} />
          <select value={professor.materia1Id} onChange={(e) => setProfessor({ ...professor, materia1Id: e.target.value })} required>
            <option value="">-- Selecionar matéria principal --</option>
            {materiasList.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
          <select value={professor.materia2Id} onChange={(e) => setProfessor({ ...professor, materia2Id: e.target.value })}>
            <option value="">-- Selecionar matéria secundária (opcional) --</option>
            {materiasList.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
          <button type="submit" disabled={loadingCreateProfessor}>{loadingCreateProfessor ? 'Criando...' : 'Criar professor'}</button>
        </form>
      </section>

      <section className="instituicao-section">
        <h2>3) Criar Disciplina</h2>
        <form onSubmit={handleCreateDisciplina}>
          <input placeholder="Nome" value={disciplina.nome} onChange={(e) => setDisciplina({ ...disciplina, nome: e.target.value })} />
          <select value={disciplina.professorId} onChange={(e) => setDisciplina({ ...disciplina, professorId: e.target.value })}>
            <option value="">-- Selecionar professor (opcional) --</option>
            {professorOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          <button type="submit" disabled={loadingCreateDisciplina}>{loadingCreateDisciplina ? 'Criando...' : 'Criar disciplina'}</button>
        </form>
      </section>

      <section className="instituicao-section">
        <h2>4) Criar Estudante</h2>
        <form onSubmit={handleCreateEstudante}>
          <input placeholder="Nome" value={estudante.nome} onChange={(e) => setEstudante({ ...estudante, nome: e.target.value })} />
          <input placeholder="Email" value={estudante.email} onChange={(e) => setEstudante({ ...estudante, email: e.target.value })} />
          <input placeholder="Senha" value={estudante.senha} onChange={(e) => setEstudante({ ...estudante, senha: e.target.value })} />
          <input type="date" placeholder="Data nascimento (YYYY-MM-DD)" value={estudante.dataNascimento} onChange={(e) => setEstudante({ ...estudante, dataNascimento: e.target.value })} />
          <button type="submit" disabled={loadingCreateEstudante}>{loadingCreateEstudante ? 'Criando...' : 'Criar estudante'}</button>
        </form>
      </section>

      <section className="instituicao-section">
        <h2>5) Adicionar Estudante a Disciplina</h2>
        <form onSubmit={handleAddEstudanteToDisciplina}>
          <select value={addEstPayload.disciplinaId} onChange={(e) => setAddEstPayload({ ...addEstPayload, disciplinaId: e.target.value })}>
            <option value="">-- Selecionar disciplina --</option>
            {disciplinasList.map((d) => (
              <option key={d.id} value={d.id}>{d.nome}{d.nomeProfessor ? ` — ${d.nomeProfessor}` : ''}</option>
            ))}
          </select>
          <input placeholder="EstudanteId" value={addEstPayload.estudanteId} onChange={(e) => setAddEstPayload({ ...addEstPayload, estudanteId: e.target.value })} />
          <button type="submit" disabled={loadingAddEst}>{loadingAddEst ? 'Processando...' : 'Adicionar estudante'}</button>
        </form>
      </section>

      <section className="instituicao-section">
        <h2>6) Associar Professor a Disciplina</h2>
        <form onSubmit={handleAssociateProfessor}>
          <select value={assocProfPayload.disciplinaId} onChange={(e) => setAssocProfPayload({ ...assocProfPayload, disciplinaId: e.target.value })}>
            <option value="">-- Selecionar disciplina --</option>
            {disciplinasList.map((d) => (
              <option key={d.id} value={d.id}>{d.nome}</option>
            ))}
          </select>
          <select value={assocProfPayload.professorId} onChange={(e) => setAssocProfPayload({ ...assocProfPayload, professorId: e.target.value })}>
            <option value="">-- Selecionar professor --</option>
            {professorOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          <button type="submit" disabled={loadingAssociateProf}>{loadingAssociateProf ? 'Processando...' : 'Associar professor'}</button>
        </form>
      </section>
    </div>
  );
};

export default InstituicaoPage;
