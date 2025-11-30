import React, { useState, useEffect } from 'react';
import { Layout, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
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
  const [professoresList, setProfessoresList] = useState<any[]>([]);

  // Derived state
  const professorOptions = React.useMemo(() => {
    return professoresList.map(p => ({
      id: p.id,
      nome: p.nome
    }));
  }, [professoresList]);

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

  const loadProfessores = async () => {
    try {
      if (!instituicaoId) return;
      const list = await instituicaoService.listProfessores(instituicaoId);
      setProfessoresList(list || []);
    } catch (e) {
      console.error('Erro ao carregar professores', e);
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
      // Em mobile, sempre começa colapsado (escondido)
      setCollapsed(mobile);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (instituicaoId) {
      loadDisciplinas();
      loadMaterias();
      loadProfessores();
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
      {/* Overlay escuro quando menu está aberto em mobile */}
      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 999,
          }}
        />
      )}
      
      <Sider
        width={250}
        theme="light"
        collapsible={false}
        collapsed={false}
        breakpoint="md"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: isMobile ? 'fixed' : 'relative',
          left: isMobile && collapsed ? '-250px' : 0,
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 1000 : 1,
          transition: 'left 0.3s ease',
          display: isMobile && collapsed ? 'none' : 'block',
        }}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Instituição</h2>
        </div>
        <Sidebar activeView={activeView} onNavigate={(view) => {
          setActiveView(view);
          if (isMobile) setCollapsed(true);
        }} />
      </Sider>
      <Layout style={{ marginLeft: 0 }}>
        <Content style={{ margin: isMobile ? '0 8px' : '0 16px', overflow: 'initial' }}>
          <div style={{ padding: isMobile ? 16 : 24, background: '#fff', minHeight: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>
                {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
              </h1>
              {isMobile && (
                <Button
                  type="text"
                  icon={<MenuOutlined style={{ fontSize: '20px' }} />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ padding: '4px 8px' }}
                />
              )}
            </div>
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default InstituicaoPage;

