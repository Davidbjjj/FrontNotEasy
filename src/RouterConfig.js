import { Route, Routes } from 'react-router-dom'; // Removido Router e Link
import ValidateTokenPage from './token/views/pages/ValidateTokenPage';
import ResetPasswordPage from './token/views/pages/ResetPasswordPage';
// import MinhasQuestoesPage from './listaQuestoes/views/pages/MinhasQuestoesPage';
import DisciplinasPage from "./disciplinas/presentation/views/DisciplinasPage";
import DisciplinaDetailRouter from './disciplinas/presentation/views/DisciplinaDetailRouter';
import LandingPage from './landingPage/view/pages/LandingPage';
import QuestionListPage from './listaQuestoes/view/pages/QuestionListPage';
import QuestionPageProfessor from './listaQuestoes/view/pages/QuestionPageProfessor';
import QuestionPageEstudante from './question/view/pages/QuestionPageEstudante';
import RoleProtectedRoute from './auth/RoleProtectedRoute';

import ActivityPage from './Atividade/view/pages/ActivityPage';
import ActivityDetailPage from './Atividade/view/pages/ActivityDetailPage';
import QuestoesPage from './questoes/view/pages/QuestoesPage';
import LoginPage from './login/views/pages/LoginPage';
import RedefinirSenha from './senha/RedefinirSenhaComponent';
import AccessDenied from './auth/AccessDenied';
import ProtectedRoute from './auth/ProtectedRoute';



const RouterConfig = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/redefinir-senha" element={<RedefinirSenha/>} />
      <Route path="/validar-token" element={<ValidateTokenPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Protected routes - require authentication */}
      <Route path="/atividades" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
      <Route path="/atividades/:id" element={<ProtectedRoute><ActivityDetailPage /></ProtectedRoute>} />
      {/* Sample route with fictitious id for design preview */}
      <Route path="/atividades/exemplo-123" element={<ProtectedRoute><ActivityDetailPage /></ProtectedRoute>} />
      <Route path="/questoes" element={<ProtectedRoute><QuestoesPage /></ProtectedRoute>} />
      {/* <Route path="/minhasQuestoes" element={<MinhasQuestoesComponent />} /> */}
      {/* <Route path="/formaluno" element={<CadastroAlunoComponent />} /> */}
      {/* <Route path="/formprofessor" element={<CadastroProfessorComponent />} /> */}
      {/* <Route path="/minhas-questoes" element={<MinhasQuestoesPage />} /> */}
      <Route path="/disciplinas" element={<ProtectedRoute><DisciplinasPage /></ProtectedRoute>} />
      <Route path="/disciplinas/:disciplinaId" element={<ProtectedRoute><DisciplinaDetailRouter /></ProtectedRoute>} />
      <Route path="/listas" element={<ProtectedRoute><QuestionListPage /></ProtectedRoute>} />
      <Route path="/listas/:listaId/questoes/professor" element={<RoleProtectedRoute allowedRoles={["PROFESSOR"]}><QuestionPageProfessor /></RoleProtectedRoute>} />
      <Route path="/listas/:listaId/questoes" element={<RoleProtectedRoute allowedRoles={["ALUNO"]}><QuestionPageEstudante /></RoleProtectedRoute>} />
    </Routes>
  );
};

export default RouterConfig;
