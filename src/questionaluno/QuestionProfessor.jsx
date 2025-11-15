import React from 'react';

export default function QuestionProfessor({ questao, onEdit, onDelete }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition flex justify-between items-start">
      <div className="flex-1">
        <h2 className="font-semibold text-lg text-gray-800 mb-2">{questao.cabecalho}</h2>
        <p className="text-gray-700 mb-4">{questao.enunciado}</p>
        <ul className="space-y-2">
          {questao.alternativas?.map((alt, i) => (
            <li key={i} className="border rounded-lg p-2 hover:bg-gray-100 transition">{alt}</li>
          ))}
        </ul>
      </div>

      <div className="ml-4 flex flex-col gap-2">
        <button onClick={() => onEdit(questao.id)} className="bg-yellow-400 text-black px-3 py-1 rounded-md hover:brightness-95 transition">Editar</button>
        <button onClick={() => onDelete(questao.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition">Excluir</button>
      </div>
    </div>
  );
}
