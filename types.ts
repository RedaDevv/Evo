
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum EisenhowerQuadrant {
  DO_FIRST = 'do_first',      // Urgent & Important
  SCHEDULE = 'schedule',      // Not Urgent & Important
  DELEGATE = 'delegate',      // Urgent & Not Important
  ELIMINATE = 'eliminate'     // Not Urgent & Not Important
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Unavailability {
  id: string;
  day: string; // 'Lundi', 'Mardi', etc.
  startTime: string;
  endTime: string;
  reason: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  quadrant: EisenhowerQuadrant;
  dueDate?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  createdAt: number;
  completedAt?: number;
}

export type ThemeType = 
  | 'cyberpunk' 
  | 'emerald' 
  | 'ocean' 
  | 'dracula' 
  | 'nord' 
  | 'volcano' 
  | 'sunset' 
  | 'midnight' 
  | 'forest' 
  | 'slate' 
  | 'rose' 
  | 'neon';

export interface UserData {
  tasks: Task[];
  unavailabilities: Unavailability[];
  theme: ThemeType;
}

export interface AppState {
  user: User | null;
  data: UserData;
}
