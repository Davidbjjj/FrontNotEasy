import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function Progress({ percentage }) {
  const data = [
    { name: 'Acertos', value: percentage },
    { name: 'Erros', value: 100 - percentage },
  ];

  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <div style={{ textAlign: 'center' }}>
      <PieChart width={150} height={150}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={60}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
      <p>{percentage}% de acertos</p>
    </div>
  );
}
