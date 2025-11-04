// App.tsx
import React from 'react';
import { ActivityList } from '../../presentation/components/ActivityList';
import { useActivityViewModel, mockActivities } from '../../viewmodels/useActivityViewModel';
import MainLayout from '../../../listMain/presentation/components/MainLayout';

const App: React.FC = () => {
  const { activities, toggleActivity } = useActivityViewModel(mockActivities);

  return (
    <MainLayout >
    <div className="App">
      <ActivityList 
        activities={activities} 
        onToggleActivity={toggleActivity}
      />
    </div>
    </MainLayout>
  );
};

export default App;