import React from "react";
import { useDesempenhoViewModel } from "../viewmodels/dashboardViewModel";
import  Card  from "../../components/Card"
import  Progress  from "../../components/Progress"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";


const COLORS = ["#22c55e", "#ef4444"]; // verde e vermelho

export const DashboardPage = () => {
  const listId = 1; // 🔹 depois será dinâmico
  const estudanteId = 1; // 🔹 depois será dinâmico
  const { desempenho, loading } = useDesempenhoViewModel(listId, estudanteId);

  if (loading) return <p>Carregando dados...</p>;
  if (!desempenho) return <p>Nenhum dado encontrado.</p>;

  const pieData = [
    { name: "Acertos", value: desempenho.percentualAcertos },
    { name: "Erros", value: 100 - desempenho.percentualAcertos },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <h2 className="text-sm text-gray-600">Nota da Lista</h2>
          <p className="text-2xl font-semibold text-blue-600">
            {desempenho.notaLista.toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <h2 className="text-sm text-gray-600">% de acertos</h2>
          <p className="text-2xl font-semibold text-green-600">
            {desempenho.percentualAcertos.toFixed(2)}%
          </p>
        </Card>

        <Card className="p-4 text-center">
          <h2 className="text-sm text-gray-600">Total de Questões</h2>
          <p className="text-2xl font-semibold">{desempenho.totalQuestoes}</p>
        </Card>

        <Card className="p-4 text-center">
          <h2 className="text-sm text-gray-600">Questões Respondidas</h2>
          <p className="text-2xl font-semibold">{desempenho.questoesRespondidas}</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Desempenho</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-xl font-semibold text-gray-700">
            {desempenho.percentualAcertos.toFixed(2)}%
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Questões</h3>
          {desempenho.questoes.map((q) => (
            <div key={q.id} className="mb-3">
              <p className="text-sm text-gray-700 mb-1">{q.titulo}</p>
              <Progress value={q.percentualAcertos} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};
