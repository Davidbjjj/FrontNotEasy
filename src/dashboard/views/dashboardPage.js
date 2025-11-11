import React, { useEffect, useState } from 'react';
import api from '../../services/apiClient';
import Card from '../../components/card/Card'
import Progress from '../../components/progress/Progress'
import './dashboardPage.css'

export default function DashboardPage() {
  const [dados, setDados] = useState(null);
  const listId = "6ec734e9-cd9a-42f1-802c-a7ec0e218538";
  // Usar userId salvo no localStorage em vez de id mocado
  const estudanteId = localStorage.getItem('userId') || '';

  useEffect(() => {
    api
      .get(`/listas/${listId}/estudantes/${estudanteId}/respostas-com-nota`)
      .then((response) => setDados(response.data))
      .catch((err) => console.error('Erro ao carregar dados:', err));
  }, []);

  if (!dados) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando dados...</p>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard do Estudante</h1>

      <div className="card-container">
        <Card title="Nota Final" value={dados.notaLista} />
        <Card title="Total de Questões" value={dados.totalQuestoes} />
        <Card title="Respondidas" value={dados.questõesRespondidas} />
        <Card title="Corretas" value={dados.questõesCorretas} />
      </div>

      <div className="progress-section">
        <Progress percentage={dados.porcentagemAcertos} />
      </div>

      <h2>Respostas</h2>
      <table className="respostas-table">
        <thead>
          <tr>
            <th>Questão ID</th>
            <th>Estudante</th>
            <th>Alternativa</th>
            <th>Correta</th>
          </tr>
        </thead>
        <tbody>
          {dados.respostas.map((r, i) => (
            <tr key={i}>
              <td>{r.questaoId}</td>
              <td>{r.nomeEstudante}</td>
              <td>{r.alternativa}</td>
              <td style={{ color: r.correta ? 'green' : 'red' }}>
                {r.correta ? '✔️' : '❌'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
