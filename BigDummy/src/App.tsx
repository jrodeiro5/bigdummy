import React, { useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SchemaExplorer } from './components/SchemaExplorer';
import { QueryBuilder } from './components/QueryBuilder';
import { useStore } from './store/useStore';
import { LogIn } from 'lucide-react';
import api from './utils/api';
import { API_ENDPOINTS } from './config/constants';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';

function App() {
  const { auth, setAuth, schema, setSchema, setAccessToken } = useStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (code) {
        try {
          setAuth({ isLoading: true, error: null });
          const response = await api.get(`${API_ENDPOINTS.AUTH.CALLBACK}${window.location.search}`);
          const { token } = response.data;
          
          if (token) {
            localStorage.setItem('accessToken', token);
            setAccessToken(token);
            setAuth({ isAuthenticated: true, isLoading: false });
            
            // Clear URL parameters
            window.history.replaceState({}, '', window.location.pathname);
          }
        } catch (error) {
          console.error('Authentication error:', error);
          setAuth({
            isLoading: false,
            error: 'Failed to complete authentication. Please try again.',
          });
        }
      } else if (error) {
        setAuth({
          isLoading: false,
          error: 'Authentication was denied or canceled.',
        });
      }
    };

    handleAuthCallback();
  }, [setAuth, setAccessToken]);

  const handleLogin = async () => {
    try {
      setAuth({ isLoading: true, error: null });
      const response = await api.get(API_ENDPOINTS.AUTH.GOOGLE);
      
      if (response.data.auth_url) {
        window.location.href = response.data.auth_url;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setAuth({
        isLoading: false,
        error: 'Failed to initialize login. Please ensure the backend server is running.',
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    console.log(`Dropped ${active.id} over ${over.id}`);
    // Handle the drop logic here
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg w-full">
          <h1 className="text-2xl font-bold mb-4">🐘 BigDummy</h1>
          <h2 className="text-lg text-gray-600 mb-6">Smart, Privacy-First GA4 Data Exploration</h2>
          
          {auth.error && (
            <ErrorMessage message={auth.error} className="mb-4" />
          )}
          
          <div className="mb-6 text-left">
            <h3 className="font-medium mb-2 text-gray-800">Analyze your GA4 data with:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">🔍</span>
                <span className="text-gray-700">Natural language queries - just ask in plain English</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">🖱️</span>
                <span className="text-gray-700">Drag-and-drop interface for building custom queries</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">🚦</span>
                <span className="text-gray-700">Cost warnings before running expensive queries</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">🎭</span>
                <span className="text-gray-700">Automatic PII masking for privacy compliance</span>
              </li>
            </ul>
          </div>
          
          <button
            onClick={handleLogin}
            disabled={auth.isLoading}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {auth.isLoading ? (
              <LoadingSpinner className="w-5 h-5 mr-2" />
            ) : (
              <LogIn className="w-5 h-5 mr-2" />
            )}
            {auth.isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          
          <p className="mt-4 text-sm text-gray-600">
            Securely access and analyze your GA4 data with BigQuery integration
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50 flex">
        <SchemaExplorer schema={schema.data} />
        <QueryBuilder />
      </div>
    </DndContext>
  );
}

export default App;