import React from 'react';
import { Route, Routes } from 'react-router-dom'; // Removido Router e Link
import HomeComponent from './components/inity/HomeComponent';
import SobreComponent from './components/sobre/SobreComponent';
import SimuladosComponent from './components/simulados/SimuladosComponent';
import QuestionsComponent from './components/questions/QuestionsComponent';
import ConfigComponent from './components/configuracao/ConfigComponent';
import MinhasQuestoesComponent from './components/minhasQuestoes/MinhasQuestoesComponent';
import CadastrosComponent from './components/ocupacao/OcupacaoComponent';
import CadastroAlunoComponent from './components/cadastros/aluno/CadastroAlunoComponent';
import CadastroProfessorComponent from './components/cadastros/professor/CadastroProfessorComponent';
import LoginComponent from './components/login/LoginComponent';
import RedefenirSenhaComponent from './components/redefenirsenha/RedefenirSenhaComponent';


const RouterConfig = () => {
  return (
    <Routes>
      <Route path="/home" element={<HomeComponent />} />
      <Route path="/sobre" element={<SobreComponent />} />
      <Route path="/simulados" element={<SimuladosComponent />} />
      <Route path="/questoes" element={<QuestionsComponent />} />
      <Route path="/minhasQuestoes" element={<MinhasQuestoesComponent />} />
      <Route path="/config" element={<ConfigComponent />} />
      <Route path="/cadastros" element={<CadastrosComponent />} />
      <Route path="/formaluno" element={<CadastroAlunoComponent />} />
      <Route path="/formprofessor" element={<CadastroProfessorComponent />} />
      <Route path="/login" element={<LoginComponent/>} />
      <Route path="/redefenir" element={<RedefenirSenhaComponent/>} />
      
    </Routes>
  );
};

export default RouterConfig;
