import { Route, Routes } from 'react-router-dom'; // Removido Router e Link
import ValidateTokenPage from './token/views/pages/ValidateTokenPage';
import ResetPasswordPage from './token/views/pages/ResetPasswordPage';
// import MinhasQuestoesPage from './listaQuestoes/views/pages/MinhasQuestoesPage';
import DisciplinasPage from "./disciplinas/presentation/views/DisciplinasPage";
import LandingPage from './landingPage/view/pages/LandingPage';
import QuestionListPage from './listaQuestoes/view/pages/QuestionListPage';
import QuestionPage from './question/view/pages/QuestionPage';

import ActivityPage from './Atividade/view/pages/ActivityPage';
import ActivityDetailPage from './Atividade/view/pages/ActivityDetailPage';
import QuestoesPage from './questoes/view/pages/QuestoesPage';
import LoginPage from './login/views/pages/LoginPage';
import RedefinirSenha from './senha/RedefinirSenhaComponent';



const RouterConfig = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/atividades" element={<ActivityPage />} />
  <Route path="/atividades/:id" element={<ActivityDetailPage />} />
  {/* Sample route with fictitious id for design preview */}
  <Route path="/atividades/exemplo-123" element={<ActivityDetailPage />} />
      <Route path="/questoes" element={<QuestoesPage />} />
      {/* <Route path="/minhasQuestoes" element={<MinhasQuestoesComponent />} /> */}
      {/* <Route path="/formaluno" element={<CadastroAlunoComponent />} /> */}
      {/* <Route path="/formprofessor" element={<CadastroProfessorComponent />} /> */}
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/redefinir-senha" element={<RedefinirSenha/>} />
      {/* <Route path="/minhas-questoes" element={<MinhasQuestoesPage />} /> */}
      <Route path="/validar-token" element={<ValidateTokenPage />} />
      <Route path="/disciplinas" element={<DisciplinasPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/listas" element={<QuestionListPage />} />
      <Route path="/listas/:listaId/questoes" element={<QuestionPage />} />
    </Routes>
  );
};

export default RouterConfig;
