import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
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

const { Content, Sider } = Layout;

const InstituicaoPage: React.FC = () => {
  const instituicaoId = localStorage.getItem('userId') || '';
  const [activeView, setActiveView] = useState('professores');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={250}
        theme="light"
        collapsible={isMobile}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: isMobile ? 'fixed' : 'relative',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 1000 : 1,
        }}
      >
        <Sidebar activeView={activeView} onNavigate={(view) => {
          setActiveView(view);
          if (isMobile) setCollapsed(true);
        }} />
      </Sider>
      <Layout style={{ marginLeft: isMobile && !collapsed ? 250 : 0 }}>
        <Content style={{ margin: isMobile ? '0 8px' : '0 16px', overflow: 'initial' }}>
          <div style={{ padding: isMobile ? 16 : 24, background: '#fff', minHeight: 360 }}>
            <h1 style={{ marginTop: 0, marginBottom: '24px', fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </h1>
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default InstituicaoPage;

