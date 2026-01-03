
import { User, UserData, TaskStatus, TaskPriority, EisenhowerQuadrant, ThemeType } from '../types';

const USERS_DB_KEY = 'evo_sql_users';
const DATA_DB_PREFIX = 'evo_sql_data_';

// Simulation d'une latence réseau
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockAuthService = {
  async signup(email: string, name: string, password: string): Promise<User> {
    await delay(800);
    const users: any[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    
    if (users.find(u => u.email === email)) {
      throw new Error("Cet email est déjà utilisé.");
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
    };

    // "INSERT INTO users..."
    users.push({ ...newUser, password }); 
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

    // Initialiser les données par défaut pour ce nouvel utilisateur
    const defaultData: UserData = {
      tasks: [],
      unavailabilities: [],
      theme: 'lime'
    };
    localStorage.setItem(`${DATA_DB_PREFIX}${newUser.id}`, JSON.stringify(defaultData));

    return newUser;
  },

  async login(email: string, password: string): Promise<User> {
    await delay(600);
    const users: any[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error("Email ou mot de passe incorrect.");
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },

  async getUserData(userId: string): Promise<UserData> {
    await delay(300);
    const data = localStorage.getItem(`${DATA_DB_PREFIX}${userId}`);
    return data ? JSON.parse(data) : { tasks: [], unavailabilities: [], theme: 'lime' };
  },

  async saveUserData(userId: string, data: UserData): Promise<void> {
    localStorage.setItem(`${DATA_DB_PREFIX}${userId}`, JSON.stringify(data));
  }
};
