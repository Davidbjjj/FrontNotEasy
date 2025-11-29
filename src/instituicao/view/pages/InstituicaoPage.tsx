import React, { useState, useEffect } from 'react';
import { instituicaoService } from '../../services/api/instituicao.service';
import { disciplinaService } from '../../../disciplinas/services/api/disciplina.service';
import materiaService, { Materia } from '../../services/api/materia.service';
import './InstituicaoPage.css';
import Sidebar from '../components/Sidebar';
import ProfessorManager from '../components/ProfessorManager';
import DisciplinaManager from '../components/DisciplinaManager';
import EstudanteManager from '../components/EstudanteManager';
import AssociacaoManager from '../components/AssociacaoManager';
import ConfiguracaoManager from '../components/ConfiguracaoManager';

const InstituicaoPage: React.FC = () => {
  const instituicaoId = localStorage.getItem('userId') || '';
  const [activeView, setActiveView] = useState('professores');

  // Shared state
  const [disciplinasList, setDisciplinasList] = useState<any[]>([]);
  const [materiasList, setMateriasList] = useState<Materia[]>([]);
  const [permittedEmails, setPermittedEmails] = useState<string[]>([]);

  // Derived state
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

  // Data fetching
  const loadDisciplinas = async () => {
    try {
      if (!instituicaoId) return;
      const list = await disciplinaService.getDisciplinas(instituicaoId, 'INSTITUICAO');
      setDisciplinasList(list || []);
    } catch (e) {
      console.error('Erro ao carregar disciplinas', e);
    }
  };

  const loadMaterias = async () => {
    try {
      if (!instituicaoId) return;
      const list = await materiaService.getMaterias(instituicaoId);
      setMateriasList(list || []);
    } catch (e) {
      console.error('Erro ao carregar matérias', e);
    }
  };

  const loadPermittedEmails = async () => {
    try {
      if (!instituicaoId) return;
      const list = await instituicaoService.listPermittedEmails(instituicaoId);
      setPermittedEmails(list || []);
    } catch (err) {
      console.error('Erro ao carregar emails permitidos', err);
    }
  };

  useEffect(() => {
    if (instituicaoId) {
      loadDisciplinas();
      loadMaterias();
      loadPermittedEmails();
    }
  }, [instituicaoId]);

  const renderContent = () => {
    switch (activeView) {
      case 'professores':
        return (
          <ProfessorManager
            instituicaoId={instituicaoId}
            materiasList={materiasList}
            onSuccess={() => { /* maybe refresh something? */ }}
          />
        );
      case 'disciplinas':
        return (
          <DisciplinaManager
            instituicaoId={instituicaoId}
            professorOptions={professorOptions}
            disciplinasList={disciplinasList}
            onSuccess={loadDisciplinas}
          />
        );
      case 'estudantes':
        return <EstudanteManager instituicaoId={instituicaoId} />;
      case 'associacoes':
        return (
          <AssociacaoManager
            disciplinasList={disciplinasList}
            professorOptions={professorOptions}
          />
        );
      case 'configuracoes':
        return (
          <ConfiguracaoManager
            instituicaoId={instituicaoId}
            permittedEmails={permittedEmails}
            onUpdate={loadPermittedEmails}
          />
        );
      default:
        return <div>Selecione uma opção no menu.</div>;
    }
  };

  return (
    <div className="instituicao-page-container" style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <div className="instituicao-content" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <h1 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
        </h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default InstituicaoPage;

