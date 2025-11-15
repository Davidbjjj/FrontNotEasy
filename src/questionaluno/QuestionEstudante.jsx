import React from 'react';

export default function QuestionEstudante({ questao }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
      <h2 className="font-semibold text-lg text-gray-800 mb-2">{questao.cabecalho}</h2>
      <p className="text-gray-700 mb-4">{questao.enunciado}</p>
      <ul className="space-y-2">
        {questao.alternativas?.map((alt, i) => (
          <li key={i} className="border rounded-lg p-2 hover:bg-gray-100 transition">{alt}</li>
        ))}
      </ul>
    </div>
  );
}
