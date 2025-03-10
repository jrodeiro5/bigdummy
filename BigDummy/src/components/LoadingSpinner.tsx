import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Loader2 className={`animate-spin ${className}`} />
);