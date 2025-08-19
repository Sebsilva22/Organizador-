export type View = 'tasks' | 'meetings' | 'links' | 'projects';

export enum AssignedTo {
  General = 'General',
  Seba = 'Seba',
  Mika = 'Mika',
  Fabu = 'Fabu',
  Pablito = 'Pablito',
  Kiki = 'Kiki',
  Luru = 'Luru',
  Luz = 'Luz',
  Kev = 'Kev',
  Lu = 'Lu',
  Meli = 'Meli',
}

export enum Priority {
  Low = 'Baja',
  Medium = 'Media',
  High = 'Alta',
}

export enum Status {
  Pending = 'Pendiente',
  InProgress = 'En Progreso',
  Completed = 'Completado',
  Cancelled = 'Cancelado',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  assignedTo: AssignedTo[];
  projectId?: string;
}

export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  date: string;
  time: string;
  attendees: string[];
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  assignedTo: AssignedTo[];
}