import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE });

export const getExams = () => api.get('/exams');
export const getExamOptions = (examId) => api.get(`/exams/${examId}/options`);
export const checkCutoff = (data) => api.post('/check-cutoff', data);
export const getRecommendations = (data) => api.post('/recommend', data);
export const getCutoffs = (params) => api.get('/cutoffs', { params });
