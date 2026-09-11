import { User } from '../types/auth';
import { api } from './api';

const STORAGE_KEY = 'lld_mentor_user';

export const DEFAULT_USER: User = {
  id: 'user-alex-rivera',
  name: 'Alex Rivera',
  email: 'iamhereformenotworld@gmail.com',
  role: 'Staff Engineer Candidate',
  track: 'L6 Prep',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD_XYErBzq-6SqYSbftSHr7i32NHmbjVR_VIxaSN1-ZFZbaPuxVBe-a-m7WFdpxdohfnK5nidrfi2p5DiQyG1k4wAgfuOqGacZyN2bTdPyDOHV3hKbFvv0WPR7F-RISrHMWMi2Tc6vkWkTMCbff5RuZ9_T0LSXJlhvYrnDGPPQCaOupmwiPzFOxOhG-IgUR5wSLasYdjcXi-OK57-ViS7o14K9aBAHLIKjH4eHadw4SS_U4ykzbpFA',
  streakDays: 9
};

export const authService = {
  getCurrentUser(): User | null {
    if (!localStorage.getItem('lld_mentor_token')) return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    // Default logged in user matching Stitch designs
    return DEFAULT_USER;
  },

  async login(email: string, name: string = 'Alex Rivera', password = 'development-password'): Promise<User> {
    let response: any;
    try { response = await api.post<any>('/users/login', { email, password }); }
    catch { await api.post('/users', { name: name || 'Alex Rivera', email, password }); response = await api.post<any>('/users/login', { email, password }); }
    localStorage.setItem('lld_mentor_token', response.access_token);
    const user: User = { ...DEFAULT_USER, id: response.user.id, name: response.user.name, email: response.user.email };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
    return user;
  },

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('lld_mentor_token');
    } catch {
      // ignore
    }
  },

  updateTrack(track: string): User {
    const current = this.getCurrentUser() || DEFAULT_USER;
    const updated = { ...current, track };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }
};
