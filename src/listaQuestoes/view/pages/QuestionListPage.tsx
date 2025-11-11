import React from 'react';
import QuestionList from '../../presentation/components/QuestionList';
import MainLayout from '../../../listMain/presentation/components/MainLayout';


const QuestionListPage: React.FC = () => {
  const handleListClick = (list: any) => {
    console.log('Lista clicada:', list);
    // Navegar para a página da lista ou abrir modal
  };

  return (
    
<MainLayout>
      <QuestionList onListClick={handleListClick} />
</MainLayout>
  );
};

export default QuestionListPage;