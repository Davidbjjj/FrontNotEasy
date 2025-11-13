export interface Activity {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: 'pendente' | 'concluído';
  nota?: number;
  anexos?: string;
}

export interface ActivityCardProps {
  activities: Activity[];
}
