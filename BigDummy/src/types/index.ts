export interface SchemaField {
  name: string;
  type: string;
  isNested?: boolean;
  fields?: SchemaField[];
}

export interface Schema {
  [tableName: string]: SchemaField[];
}

export interface QueryResult {
  [key: string]: any;
}

export interface DragItem {
  id: string;
  type: 'field' | 'measure' | 'filter';
  name: string;
  fieldType: string;
  isNested?: boolean;
  nestedKey?: string;
  nestedValue?: string;
}

export interface QueryConfig {
  measures: DragItem[];
  dimensions: DragItem[];
  filters: DragItem[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SchemaState {
  data: Schema;
  isLoading: boolean;
  error: string | null;
}

export interface SavedQuery {
  id: string;
  name: string;
  config: QueryConfig;
  createdAt: string;
}

export interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  config: QueryConfig;
  category: 'funnel' | 'retention' | 'engagement' | 'conversion';
}

export interface QueryError {
  message: string;
  sql?: string;
  suggestion?: string;
}