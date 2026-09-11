export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  track: string;
  avatarUrl?: string;
  streakDays: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string, password?: string) => Promise<void>;
  logout: () => void;
  updateTrack: (track: string) => void;
}
