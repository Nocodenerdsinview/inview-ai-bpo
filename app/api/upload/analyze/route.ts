import { NextRequest, NextResponse } from "next/server";
import { parseExcel } from "@/lib/parsers/excelParser";
import { parseCSV } from "@/lib/parsers/csvParser";
import { analyzeFileWithAI } from "@/lib/fileAnalysis";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get file extension
    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase();

    let parsedData;
    
    // Parse based on file type
    try {
      if (extension === 'xlsx' || extension === 'xls') {
        parsedData = await parseExcel(file);
      } else if (extension === 'csv') {
        parsedData = await parseCSV(file);
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload Excel (.xlsx, .xls) or CSV files." },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error("File parsing error:", parseError);
      return NextResponse.json(
        { error: `Failed to parse file: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    // Analyze the file with AI
    try {
      const analysis = await analyzeFileWithAI(
        fileName,
        parsedData.headers,
        parsedData.data
      );

      return NextResponse.json({
        fileName,
        analysis,
        rowCount: parsedData.rowCount,
      });
    } catch (aiError) {
      console.error("AI analysis error:", aiError);
      
      // Return basic analysis without AI
      return NextResponse.json({
        fileName,
        analysis: {
          reportType: 'unknown',
          confidence: 0,
          dateRange: { start: '', end: '' },
          agentsFound: [],
          columnsDetected: parsedData.headers.map(h => ({
            name: h,
            type: 'unknown',
            format: 'text',
          })),
          issues: ['AI analysis failed. Please verify data manually.'],
          preview: parsedData.data.slice(0, 10),
        },
        rowCount: parsedData.rowCount,
      });
    }
  } catch (error) {
    console.error("Upload analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze file" },
      { status: 500 }
    );
  }
}

