import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Schema } from '../types';
import { FolderKanban, Database, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { useStore } from '../store/useStore';

interface Props {
  schema: Schema;
}

const SchemaField: React.FC<{
  name: string;
  type: string;
}> = ({ name, type }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: name,
    data: {
      type: 'field',
      name,
      fieldType: type,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex items-center p-2 hover:bg-gray-100 cursor-move rounded"
    >
      <Database className="w-4 h-4 mr-2" />
      <span className="text-sm">{name}</span>
      <span className="text-xs text-gray-500 ml-2">({type})</span>
    </div>
  );
};

export const SchemaExplorer: React.FC<Props> = ({ schema }) => {
  const { schema: schemaState, setSchema } = useStore();

  const handleRefresh = async () => {
    try {
      setSchema({ isLoading: true, error: null });
      // Add schema refresh logic here
    } catch (error) {
      setSchema({
        isLoading: false,
        error: 'Failed to refresh schema. Please try again.',
      });
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Schema Explorer</h2>
        <button
          onClick={handleRefresh}
          disabled={schemaState.isLoading}
          className="p-1 hover:bg-gray-100 rounded-full"
          title="Refresh schema"
        >
          {schemaState.isLoading ? (
            <LoadingSpinner className="w-5 h-5" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
        </button>
      </div>

      {schemaState.error && (
        <ErrorMessage message={schemaState.error} className="mb-4" />
      )}

      {schemaState.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner className="w-6 h-6" />
        </div>
      ) : Object.entries(schema).length === 0 ? (
        <div className="text-sm text-gray-600 py-4">
          <p className="mb-4">No schema data available yet.</p>
          
          <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4">
            <h4 className="font-medium mb-1 text-blue-800">How to use:</h4>
            <p className="mb-2">Drag fields from here to build your query in the Query Builder.</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Drag <strong>dimensions</strong> (user attributes, page paths) to group data</li>
              <li>Drag <strong>metrics</strong> (event counts, revenue) to measure performance</li>
              <li>Add <strong>filters</strong> to narrow your analysis</li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
            <h4 className="font-medium mb-1 text-yellow-800">Pro tip:</h4>
            <p>Try using the natural language query at the top to get started quickly!</p>
          </div>
        </div>
      ) : (
        Object.entries(schema).map(([tableName, fields]) => (
          <div key={tableName} className="mb-4">
            <div className="flex items-center mb-2">
              <FolderKanban className="w-5 h-5 mr-2" />
              <h3 className="font-medium">{tableName}</h3>
            </div>
            <div className="pl-4">
              {fields.map((field) => (
                <SchemaField
                  key={field.name}
                  name={field.name}
                  type={field.type}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};