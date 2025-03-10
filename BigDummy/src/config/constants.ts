export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: '/auth/google',
    CALLBACK: '/oauth2callback',
  },
  SCHEMA: '/api/schema',
  QUERY: {
    ESTIMATE: '/api/estimate',
    EXECUTE: '/api/query',
    NLP_TO_SQL: '/api/nlp-to-sql',
  },
} as const;