import api from './axios';
import type { JobApplication } from '../types';

export interface CreateJobApplicationRequest {
  company: string;
  role: string;
  status: 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  dateApplied: string;
  notes: string;
  jobLink: string;
}

export const jobApplicationsApi = {
  getAll: () => api.get<JobApplication[]>('/applications'),
  create: (data: CreateJobApplicationRequest) => api.post<JobApplication>('/applications', data),
  update: (id: number, data: CreateJobApplicationRequest) => api.put<JobApplication>(`/applications/${id}`, data),
  delete: (id: number) => api.delete(`/applications/${id}`),
};
