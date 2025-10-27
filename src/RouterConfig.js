import React from 'react';
import { Route, Routes } from 'react-router-dom'; // Removido Router e Link
import HomeComponent from './components/inity/HomeComponent';
import SobreComponent from './components/sobre/SobreComponent';
import SimuladosComponent from './components/simulados/SimuladosComponent';
import QuestionsComponent from './components/questions/QuestionsComponent';
import ConfigComponent from './components/configuracao/ConfigComponent';
import MinhasQuestoesComponent from './components/minhasQuestoes/MinhasQuestoesComponent';
import CadastrosComponent from './components/ocupacao/OcupacaoComponent';
import ValidateTokenPage from './token/views/pages/ValidateTokenPage';
import ResetPasswordPage from './token/views/pages/ResetPasswordPage';
import LoginComponent from './components/login/LoginComponent';
import RedefenirSenhaComponent from './components/redefenirsenha/RedefenirSenhaComponent';
import RegistrationComponent from './alunos/presentation/components/RegistrationComponent';
import TeacherRegistrationComponent from './professores/presentation/components/TeacherRegistrationComponent';
import MinhasQuestoesPage from './listMain/view/pages/ListMain';
import LandingPage from './landingPage/view/pages/LandingPage';
import QuestionListPage from './listaQuestoes/view/pages/QuestionListPage';
import QuestionPage from './question/view/pages/QuestionPage';



const RouterConfig = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sobre" element={<SobreComponent />} />
      <Route path="/simulados" element={<SimuladosComponent />} />
      <Route path="/questoes" element={<QuestionsComponent />} />
      {/* <Route path="/minhasQuestoes" element={<MinhasQuestoesComponent />} /> */}
      <Route path="/config" element={<ConfigComponent />} />
      <Route path="/cadastros" element={<CadastrosComponent />} />
      {/* <Route path="/formaluno" element={<CadastroAlunoComponent />} /> */}
      {/* <Route path="/formprofessor" element={<CadastroProfessorComponent />} /> */}
      <Route path="/login" element={<LoginComponent/>} />
      <Route path="/redefinir-senha" element={<RedefenirSenhaComponent/>} />
      <Route path="/cadastro-aluno" element={<RegistrationComponent />} />
      <Route path="/cadastro-professor" element={<TeacherRegistrationComponent />} />
      <Route path="/minhas-questoes" element={<MinhasQuestoesPage />} />
      <Route path="/validar-token" element={<ValidateTokenPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/listas" element={<QuestionListPage />} />
      <Route path="/listas/:listaId/questoes" element={<QuestionPage />} />
    </Routes>
  );
};

export default RouterConfig;
