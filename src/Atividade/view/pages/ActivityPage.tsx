// App.tsx
import React, { useEffect } from 'react';
import { ActivityList } from '../../presentation/components/ActivityList';
import { useActivityViewModel } from '../../viewmodels/useActivityViewModel';
import { listaService, EventoDTO } from '../../../listaQuestoes/services/api/listaService';
import { Activity } from '../../model/Activity';

const App: React.FC = () => {
  const { activities, toggleActivity, addActivity, loadActivities } = useActivityViewModel([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const eventos: EventoDTO[] = await listaService.getEventos();
        if (!mounted) return;

        const mapped: Activity[] = eventos.map(ev => ({
          id: ev.id,
          title: ev.title,
          subject: ev.disciplina || '',
          class: '',
          completed: false,
          // keep raw deadline string for now; formatting can be done in the component
          deadline: ev.deadline ?? ''
        }));

        loadActivities(mapped);
      } catch (err) {
        // keep mocks if fetch fails; optional: show toast
        console.error('Erro ao carregar eventos:', err);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="App">
      <ActivityList 
        activities={activities} 
        onToggleActivity={toggleActivity}
        onCreateActivity={addActivity}
      />
    </div>
  );
};

export default App;