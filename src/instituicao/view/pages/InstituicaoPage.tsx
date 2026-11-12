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
import { useLocation, useNavigate } from 'react-router-dom';
import { menuVisivel } from '../../gestao/gestaoLogic';
import { usePermissoes } from '../../gestao/permissoesStore';
import ImportacaoView from '../../gestao/ImportacaoView';
import ConvitesView from '../../gestao/ConvitesView';
import { DashboardView, DetalheKpiView } from '../../gestao/DashboardView';
import PeriodosTurmasView from '../../gestao/PeriodosTurmasView';
import ComparativosView from '../../gestao/ComparativosView';
import BoletinsView from '../../gestao/BoletinsView';
import PapeisView from '../../gestao/PapeisView';
import AuditoriaView from '../../gestao/AuditoriaView';
import PersonalizacaoView from '../../gestao/PersonalizacaoView';

const { Content, Sider } = Layout;

const InstituicaoPage: React.FC = () => {
  const instituicaoId = localStorage.getItem('userId') || '';
  // FE-306: a área é guiada pela URL (/instituicao/:tela/:sub) e pelas permissões do papel; o que não tem permissão nem aparece
  const location = useLocation();
  const navigate = useNavigate();
  const { dados: permissoes, pronto: permissoesProntas } = usePermissoes();
  const menu = React.useMemo(() => menuVisivel(permissoes?.papel ?? null, permissoes?.permissoes ?? []), [permissoes]);
  const partes = location.pathname.split('/').filter(Boolean);
  const activeView = partes[1] || menu[0]?.chave || '';
  const subView = partes[2] || '';
  const setActiveView = (v: string) => navigate(`/instituicao/${v}`);
  const isAdmin = permissoes?.papel === 'ADMIN';
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
    if (instituicaoId && isAdmin) {
      loadDisciplinas();
      loadMaterias();
      loadProfessores();
      loadPermittedEmails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instituicaoId, isAdmin]);

  const renderContent = () => {
    if (!permissoesProntas) return <p role="status">Carregando…</p>;
    if (menu.length === 0) {
      return <p role="status">Você não tem permissão para nenhuma área de gestão. Fale com o administrador da instituição.</p>;
    }
    if (!menu.some((m) => m.chave === activeView)) {
      return <p role="alert">Você não tem acesso a esta área.</p>;
    }
    switch (activeView) {
      case 'dashboard':
        return subView ? <DetalheKpiView kpi={subView} /> : <DashboardView />;
      case 'importacao':
        return <ImportacaoView />;
      case 'convites':
        return <ConvitesView />;
      case 'periodos':
        return <PeriodosTurmasView />;
      case 'comparativos':
        return <ComparativosView />;
      case 'boletins':
        return <BoletinsView />;
      case 'papeis':
        return <PapeisView />;
      case 'auditoria':
        return <AuditoriaView />;
      case 'personalizacao':
        return <PersonalizacaoView />;
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
        <Sidebar activeView={activeView} items={menu} onNavigate={(view) => {
          setActiveView(view);
          if (isMobile) setCollapsed(true);
        }} />
      </Sider>
      <Layout style={{ marginLeft: 0 }}>
        <Content style={{ margin: isMobile ? '0 8px' : '0 16px', overflow: 'initial' }}>
          <div style={{ padding: isMobile ? 16 : 24, background: '#fff', minHeight: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>
                {menu.find((m) => m.chave === activeView)?.rotulo ?? 'Instituição'}
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

