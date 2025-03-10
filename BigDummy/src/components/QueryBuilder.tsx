import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DragItem } from '../types';
import { Search, X, Loader } from 'lucide-react';
import { QueryExecutor } from './QueryExecutor';
import api from '../utils/api';
import { API_ENDPOINTS } from '../config/constants';

interface DropZoneProps {
  title: string;
  items: DragItem[];
  onRemove: (id: string) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ title, items, onRemove }) => {
  const { setNodeRef } = useDroppable({
    id: title.toLowerCase(),
  });

  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">{title}</h3>
      <div
        ref={setNodeRef}
        className="min-h-[100px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white p-2 rounded shadow-sm mb-2"
          >
            <span>{item.name}</span>
            <button
              onClick={() => onRemove(item.id)}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const QueryBuilder: React.FC = () => {
  const [measures, setMeasures] = useState<DragItem[]>([]);
  const [dimensions, setDimensions] = useState<DragItem[]>([]);
  const [filters, setFilters] = useState<DragItem[]>([]);
  const [nlQuery, setNlQuery] = useState<string>('');
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = (section: string, id: string) => {
    switch (section) {
      case 'measures':
        setMeasures(measures.filter(item => item.id !== id));
        break;
      case 'dimensions':
        setDimensions(dimensions.filter(item => item.id !== id));
        break;
      case 'filters':
        setFilters(filters.filter(item => item.id !== id));
        break;
    }
  };

  const handleNlQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setSqlQuery('');

    try {
      const response = await api.post(API_ENDPOINTS.QUERY.NLP_TO_SQL, {
        query: nlQuery
      });

      setSqlQuery(response.data.sql_query);
    } catch (err) {
      console.error('Error converting natural language to SQL:', err);
      setError('Failed to convert your query to SQL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6">
      <h2 className="text-xl font-semibold mb-6">Query Builder</h2>
      
      {/* Natural Language Query Input */}
      <div className="mb-8">
        <h3 className="font-medium mb-2">Ask in Plain English</h3>
        <form onSubmit={handleNlQuerySubmit} className="flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="e.g., What was the revenue by country last month?"
              className="w-full p-3 pr-10 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-3">
                <Loader className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !nlQuery.trim()}
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-1">Example Queries:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>
                <button 
                  onClick={() => setNlQuery("Show me revenue by country last month")} 
                  className="text-blue-600 hover:underline text-left"
                >
                  Show me revenue by country last month
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setNlQuery("How many users by device type?")} 
                  className="text-blue-600 hover:underline text-left"
                >
                  How many users by device type?
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setNlQuery("Top 10 pageviews")} 
                  className="text-blue-600 hover:underline text-left"
                >
                  Top 10 pageviews
                </button>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-1">Tips:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>Be specific about time periods ("last month", "yesterday")</li>
              <li>Mention metrics clearly ("revenue", "users", "pageviews")</li>
              <li>Specify how to group data ("by country", "by device")</li>
              <li>Use natural language, not SQL syntax</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* SQL Result */}
      {sqlQuery && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-2">Generated SQL</h3>
          <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
            {sqlQuery}
          </pre>
          
          {/* Query Executor */}
          <QueryExecutor sql={sqlQuery} />
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-6">
        <DropZone
          title="Measures"
          items={measures}
          onRemove={(id) => handleRemove('measures', id)}
        />
        <DropZone
          title="Dimensions"
          items={dimensions}
          onRemove={(id) => handleRemove('dimensions', id)}
        />
        <DropZone
          title="Filters"
          items={filters}
          onRemove={(id) => handleRemove('filters', id)}
        />
      </div>
    </div>
  );
};