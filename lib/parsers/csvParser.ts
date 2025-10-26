import Papa from 'papaparse';
import type { ParsedData } from './excelParser';

export async function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          const data = results.data as any[][];
          
          if (data.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          // Filter out completely empty rows
          const filteredData = data.filter(row => 
            row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
          );

          if (filteredData.length === 0) {
            reject(new Error('CSV file contains no valid data'));
            return;
          }

          // First row is headers
          const headers = filteredData[0].map(h => String(h || '').trim());
          const rows = filteredData.slice(1);

          resolve({
            data: filteredData,
            headers,
            rowCount: rows.length,
          });
        } catch (error) {
          reject(new Error(`Failed to parse CSV file: ${error}`));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parse error: ${error.message}`));
      },
      skipEmptyLines: true,
      delimiter: '', // Auto-detect delimiter
    });
  });
}

