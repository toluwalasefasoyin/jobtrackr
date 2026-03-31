export interface UserProfile {
  id: number;
  username: string;
  email: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface JobApplication {
  id: number;
  company: string;
  role: string;
  status: 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  dateApplied: string;
  notes: string;
  jobLink: string;
  user: {
    id: number;
    username: string;
  };
}

export interface AuthResponse {
  token: string;
}