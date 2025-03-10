import React, { useState } from 'react';
import { Play, AlertCircle, Download } from 'lucide-react';
import api from '../utils/api';
import { API_ENDPOINTS } from '../config/constants';

interface QueryExecutorProps {
  sql: string;
}

interface CostEstimate {
  bytes_processed: number;
  estimated_cost: number;
}

interface QueryError {
  message: string;
}

export const QueryExecutor: React.FC<QueryExecutorProps> = ({ sql }) => {
  const [results, setResults] = useState<any[]>([]);
  const [isEstimating, setIsEstimating] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleEstimate = async () => {
    if (!sql.trim()) return;

    setIsEstimating(true);
    setError(null);

    try {
      const response = await api.post(API_ENDPOINTS.QUERY.ESTIMATE, { query: sql });
      setCostEstimate(response.data);
    } catch (err) {
      const error = err as any;
      console.error('Error estimating query cost:', error);
      setError(error.response?.data?.error || 'Failed to estimate query cost');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleExecute = async () => {
    if (!sql.trim()) return;

    setIsExecuting(true);
    setError(null);
    setResults([]);

    try {
      const response = await api.post(API_ENDPOINTS.QUERY.EXECUTE, { query: sql });
      setResults(response.data);
      setShowResults(true);
    } catch (err) {
      const error = err as any;
      console.error('Error executing query:', error);
      setError(error.response?.data?.error || 'Failed to execute query');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDownload = () => {
    if (!results.length) return;

    const csv = [
      Object.keys(results[0]).join(','),
      ...results.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query-results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6">
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleEstimate}
          disabled={isEstimating || isExecuting || !sql.trim()}
          className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEstimating ? 'Estimating...' : 'Estimate Cost'}
        </button>
        <button
          onClick={handleExecute}
          disabled={isExecuting || !sql.trim()}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 mr-2" />
          {isExecuting ? 'Running...' : 'Run Query'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {costEstimate && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-4">
          <p className="font-medium">Query Cost Estimate</p>
          <p className="text-sm">This query will process approximately {formatBytes(costEstimate.bytes_processed)} of data.</p>
          <p className="text-sm">Estimated cost: ${costEstimate.estimated_cost.toFixed(6)}</p>
        </div>
      )}

      {showResults && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Query Results ({results.length} rows)</h3>
            {results.length > 0 && (
              <button
                onClick={handleDownload}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Download className="w-4 h-4 mr-1" />
                <span className="text-sm">Download CSV</span>
              </button>
            )}
          </div>

          {results.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, valueIndex) => (
                        <td
                          key={valueIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {value === null || value === undefined ? '-' : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No results returned.</p>
          )}
        </div>
      )}
    </div>
  );
};