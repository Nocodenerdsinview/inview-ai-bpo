/**
 * Clipboard Parser Utility
 * Parses tab-delimited (Excel) or CSV data from clipboard
 */

export interface ParsedRow {
  agentName: string;
  date: string;
  quality: string;
  aht: string;
  srr: string;
  voc: string;
}

export interface ParseResult {
  success: boolean;
  rows: ParsedRow[];
  errors: string[];
  warnings: string[];
}

/**
 * Parse clipboard text data (tab-delimited or comma-separated)
 */
export function parseClipboardData(text: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rows: ParsedRow[] = [];

  if (!text || text.trim().length === 0) {
    errors.push("Clipboard is empty");
    return { success: false, rows: [], errors, warnings };
  }

  // Split into lines
  const lines = text.trim().split(/\r?\n/);

  if (lines.length === 0) {
    errors.push("No data found in clipboard");
    return { success: false, rows: [], errors, warnings };
  }

  // Detect delimiter (tab or comma)
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  // Check if first line looks like headers
  const hasHeaders = detectHeaders(firstLine, delimiter);
  const startIndex = hasHeaders ? 1 : 0;

  if (hasHeaders) {
    warnings.push("Detected header row - skipping first line");
  }

  // Parse each line
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      continue; // Skip empty lines
    }

    try {
      const parsed = parseLine(line, delimiter, i + 1);
      if (parsed) {
        rows.push(parsed);
      }
    } catch (error) {
      errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }

  if (rows.length === 0) {
    errors.push("No valid data rows found");
    return { success: false, rows: [], errors, warnings };
  }

  return {
    success: true,
    rows,
    errors,
    warnings,
  };
}

/**
 * Detect if first line contains headers
 */
function detectHeaders(line: string, delimiter: string): boolean {
  const lowerLine = line.toLowerCase();
  const headerKeywords = ['agent', 'name', 'date', 'quality', 'aht', 'srr', 'voc'];
  
  return headerKeywords.some(keyword => lowerLine.includes(keyword));
}

/**
 * Parse a single line into a row object
 */
function parseLine(line: string, delimiter: string, lineNumber: number): ParsedRow | null {
  // Handle CSV with quoted values
  let columns: string[];
  
  if (delimiter === ',') {
    columns = parseCSVLine(line);
  } else {
    columns = line.split(delimiter);
  }

  // Clean up columns
  columns = columns.map(col => col.trim());

  if (columns.length < 2) {
    throw new Error("Insufficient columns (need at least agent name and date)");
  }

  // Map columns based on count
  // Expected formats:
  // 1. Agent, Date, Quality, AHT, SRR, VOC (6 columns)
  // 2. Agent, Date, Quality, AHT, SRR (5 columns)
  // 3. Agent, Date, Quality, AHT (4 columns)
  // 4. Agent, Date, Quality (3 columns)
  // 5. Agent, Date (2 columns - minimal)

  const result: ParsedRow = {
    agentName: columns[0] || '',
    date: columns[1] || '',
    quality: columns[2] || '',
    aht: columns[3] || '',
    srr: columns[4] || '',
    voc: columns[5] || '',
  };

  // Validate agent name
  if (!result.agentName) {
    throw new Error("Agent name is required");
  }

  // Validate and format date
  if (result.date) {
    result.date = normalizeDate(result.date);
  }

  return result;
}

/**
 * Parse CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

/**
 * Normalize date to YYYY-MM-DD format
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';

  // Try to parse common date formats
  const formats = [
    // YYYY-MM-DD
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    // MM/DD/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // DD/MM/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // MM-DD-YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
  ];

  // Already in correct format
  if (formats[0].test(dateStr)) {
    return dateStr;
  }

  // Try MM/DD/YYYY or MM-DD-YYYY
  const mmddyyyyMatch = dateStr.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (mmddyyyyMatch) {
    const month = mmddyyyyMatch[1].padStart(2, '0');
    const day = mmddyyyyMatch[2].padStart(2, '0');
    const year = mmddyyyyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Try to parse as Date object
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // Ignore parsing errors
  }

  // Return as-is if can't parse
  return dateStr;
}

/**
 * Read text from clipboard
 */
export async function readClipboard(): Promise<string | null> {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      return text;
    }
  } catch (error) {
    console.error("Failed to read clipboard:", error);
  }
  return null;
}

/**
 * Example usage helper
 */
export function getClipboardInstructions(): string {
  return `
Paste Format Instructions:

1. Copy data from Excel/Google Sheets
2. Expected columns (in order):
   - Agent Name (required)
   - Date (required, YYYY-MM-DD or MM/DD/YYYY)
   - Quality (0-100)
   - AHT (seconds)
   - SRR (0-100)
   - VOC (0-100)

3. First row can be headers (will be auto-detected)
4. Empty cells are allowed
5. Tab-delimited or comma-separated

Example:
Agent Name    Date         Quality  AHT  SRR   VOC
Sarah Johnson 2025-01-15   92.5     540  75.0  88.0
John Smith    2025-01-15   88.0     620  70.0  85.0
  `.trim();
}

