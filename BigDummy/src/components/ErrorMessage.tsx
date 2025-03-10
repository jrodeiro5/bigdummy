import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '' }) => (
  <div className={`flex items-center text-red-600 ${className}`}>
    <AlertCircle className="w-5 h-5 mr-2" />
    <span>{message}</span>
  </div>
);