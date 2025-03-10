import create from 'zustand';
import { Schema, QueryConfig, AuthState, SchemaState } from '../types';

interface Store {
  auth: AuthState;
  setAuth: (auth: Partial<AuthState>) => void;
  schema: SchemaState;
  setSchema: (schema: Partial<SchemaState>) => void;
  queryConfig: QueryConfig;
  setQueryConfig: (config: QueryConfig) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

export const useStore = create<Store>((set) => ({
  auth: {
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  setAuth: (auth) => set((state) => ({ auth: { ...state.auth, ...auth } })),
  schema: {
    data: {},
    isLoading: false,
    error: null,
  },
  setSchema: (schema) => set((state) => ({ schema: { ...state.schema, ...schema } })),
  queryConfig: {
    measures: [],
    dimensions: [],
    filters: [],
  },
  setQueryConfig: (config) => set({ queryConfig: config }),
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
}));