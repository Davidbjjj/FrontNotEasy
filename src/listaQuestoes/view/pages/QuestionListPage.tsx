import React from 'react';
import QuestionList from '../../presentation/components/QuestionList';

const QuestionListPage: React.FC = () => {
  const handleListClick = (list: any) => {
    console.log('Lista clicada:', list);
    // Navegar para a página da lista ou abrir modal
  };

  return (
    <QuestionList onListClick={handleListClick} />
  );
};

export default QuestionListPage;