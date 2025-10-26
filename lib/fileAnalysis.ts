import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface FileAnalysisResult {
  reportType: 'quality' | 'aht' | 'srr' | 'voc' | 'hold' | 'audit' | 'unknown';
  confidence: number;
  dateRange: { start: string; end: string };
  agentsFound: string[];
  columnsDetected: Array<{
    name: string;
    type: string;
    format: string;
  }>;
  issues: string[];
  preview: any[][];
}

function generateFileAnalysisPrompt(
  fileName: string,
  headers: string[],
  preview: any[][]
): string {
  return `You are analyzing an uploaded file to determine what type of call center report it is.

FILE NAME: ${fileName}

HEADERS:
${headers.join(' | ')}

FIRST 5 ROWS OF DATA:
${preview.slice(0, 5).map((row, i) => `Row ${i + 1}: ${row.join(' | ')}`).join('\n')}

DETERMINE:
1. Report Type: Is this a Quality, AHT, SRR, Hold Time, VOC, or other report?
2. Date Range: What date or date range does this report cover?
3. Agents: How many agents are in this report? List their names as they appear.
4. Columns: What columns are present and what do they represent?
5. Data Quality: Are there any issues (missing data, formatting problems, etc.)?

RESPOND IN JSON FORMAT:
{
  "reportType": "quality | aht | srr | hold | voc | audit | unknown",
  "confidence": 0-100,
  "dateRange": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "agentsFound": ["Agent Name 1", "Agent Name 2"],
  "columns": [
    {
      "name": "Column header as it appears",
      "type": "agent_name | date | quality_score | aht_seconds | srr_percentage | voc_score | hold_time | etc",
      "format": "Description of the data format"
    }
  ],
  "issues": ["Any data quality issues found"],
  "recommendation": "What the user should do next"
}

RULES:
- If you cannot determine the report type with confidence >70%, set reportType to "unknown"
- Look for keywords in column headers like "quality", "AHT", "save rate", "VOC", etc.
- Agent names are usually in a column called "Agent", "Name", "Employee", or similar
- Dates might be in the file name or in a date column
- List ALL issues you find (empty cells, inconsistent formatting, etc.)

Return ONLY the JSON, no explanation.`;
}

export async function analyzeFileWithAI(
  fileName: string,
  headers: string[],
  preview: any[][]
): Promise<FileAnalysisResult> {
  try {
    const prompt = generateFileAnalysisPrompt(fileName, headers, preview);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a data analyst specializing in call center reports with 8 years of experience analyzing UK insurance operations data. You've processed 10,000+ files and can instantly identify report types, spot data quality issues, and provide clear guidance. Analyze uploaded files to determine report type and data quality. Always return structured JSON responses with no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.2, // Lower temperature for more consistent JSON
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || "";
    
    // Parse the JSON response
    const parsed = JSON.parse(response);

    return {
      reportType: parsed.reportType || 'unknown',
      confidence: parsed.confidence || 0,
      dateRange: parsed.dateRange || { start: '', end: '' },
      agentsFound: parsed.agentsFound || [],
      columnsDetected: parsed.columns || [],
      issues: parsed.issues || [],
      preview,
    };
  } catch (error) {
    console.error("AI file analysis error:", error);
    
    // Fallback to basic heuristic analysis
    return fallbackAnalysis(fileName, headers, preview);
  }
}

// Fallback heuristic analysis if AI fails
function fallbackAnalysis(
  fileName: string,
  headers: string[],
  preview: any[][]
): FileAnalysisResult {
  const lowerFileName = fileName.toLowerCase();
  const lowerHeaders = headers.map(h => h.toLowerCase());

  let reportType: FileAnalysisResult['reportType'] = 'unknown';
  let confidence = 50;

  // Simple keyword matching
  if (lowerFileName.includes('quality') || lowerHeaders.some(h => h.includes('quality'))) {
    reportType = 'quality';
    confidence = 70;
  } else if (lowerFileName.includes('aht') || lowerHeaders.some(h => h.includes('aht') || h.includes('handling time'))) {
    reportType = 'aht';
    confidence = 70;
  } else if (lowerFileName.includes('srr') || lowerHeaders.some(h => h.includes('srr') || h.includes('save'))) {
    reportType = 'srr';
    confidence = 70;
  } else if (lowerFileName.includes('voc') || lowerHeaders.some(h => h.includes('voc') || h.includes('voice'))) {
    reportType = 'voc';
    confidence = 70;
  } else if (lowerFileName.includes('hold') || lowerHeaders.some(h => h.includes('hold'))) {
    reportType = 'hold';
    confidence = 70;
  } else if (lowerFileName.includes('audit') || lowerHeaders.some(h => h.includes('audit'))) {
    reportType = 'audit';
    confidence = 70;
  }

  // Try to find agent names
  const agentColumnIndex = lowerHeaders.findIndex(h => 
    h.includes('agent') || h.includes('name') || h.includes('employee')
  );
  
  const agentsFound: string[] = [];
  if (agentColumnIndex >= 0) {
    preview.slice(1).forEach(row => {
      if (row[agentColumnIndex]) {
        const name = String(row[agentColumnIndex]).trim();
        if (name && !agentsFound.includes(name)) {
          agentsFound.push(name);
        }
      }
    });
  }

  // Try to find date
  const dateColumnIndex = lowerHeaders.findIndex(h => h.includes('date'));
  let dateRange = { start: '', end: '' };
  
  if (dateColumnIndex >= 0) {
    const dates = preview.slice(1)
      .map(row => row[dateColumnIndex])
      .filter(Boolean)
      .map(d => String(d));
    
    if (dates.length > 0) {
      dateRange = {
        start: dates[0],
        end: dates[dates.length - 1],
      };
    }
  }

  return {
    reportType,
    confidence,
    dateRange,
    agentsFound,
    columnsDetected: headers.map(h => ({
      name: h,
      type: 'unknown',
      format: 'Text',
    })),
    issues: ['AI analysis failed. Using basic heuristics. Please verify the data manually.'],
    preview,
  };
}

