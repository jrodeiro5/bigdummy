import { QueryConfig } from '../types';

const PII_COLUMNS = ['user_id', 'client_id', 'user_pseudo_id'];

export const addDateRangeToQuery = (sql: string): string => {
  if (!sql.toLowerCase().includes('_table_suffix')) {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const startDate = threeMonthsAgo.toISOString().slice(0, 10).replace(/-/g, '');
    const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');

    sql = sql.replace(
      /FROM\s+`([^`]+)`/i,
      `FROM \`$1\` WHERE _TABLE_SUFFIX BETWEEN '${startDate}' AND '${endDate}'`
    );
  }
  return sql;
};

export const maskPIIColumns = (results: any[]): any[] => {
  return results.map(row => {
    const maskedRow = { ...row };
    PII_COLUMNS.forEach(column => {
      if (column in maskedRow) {
        maskedRow[column] = '****';
      }
    });
    return maskedRow;
  });
};

export const buildNestedFieldQuery = (field: string, key: string, value: string): string => {
  return `(SELECT value.${value} FROM UNNEST(${field}) WHERE key = '${key}')`;
};

export const validateQuery = (sql: string): string[] => {
  const errors: string[] = [];
  
  // Check for common GA4 query issues
  if (sql.includes('event_params') && !sql.includes('UNNEST')) {
    errors.push('Missing UNNEST for event_params access');
  }
  
  // Check for PII columns
  PII_COLUMNS.forEach(column => {
    if (sql.includes(column)) {
      errors.push(`Query contains PII column: ${column}`);
    }
  });

  return errors;
};

export const downsampleResults = (results: any[], limit: number = 1000): any[] => {
  if (results.length <= limit) return results;
  
  const ratio = Math.floor(results.length / limit);
  return results.filter((_, index) => index % ratio === 0).slice(0, limit);
};