// models/Activity.ts
export interface Activity {
  id: string;
  title: string;
  subject: string;
  class: string;
  completed: boolean;
  deadline: string;
}

export interface ActivityListProps {
  activities: Activity[];
  onToggleActivity?: (id: string, completed: boolean) => void;
}