import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { parseExcel } from "@/lib/parsers/excelParser";
import { parseCSV } from "@/lib/parsers/csvParser";
import { matchAgentName, batchMatchAgentNames } from "@/lib/parsers/nameMatching";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const reportType = formData.get("reportType") as string;
    const dateStart = formData.get("dateStart") as string;
    const dateEnd = formData.get("dateEnd") as string;

    if (!file || !reportType) {
      return NextResponse.json(
        { error: "File and report type are required" },
        { status: 400 }
      );
    }

    // Get file extension
    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase();

    let parsedData;
    
    // Parse based on file type
    if (extension === 'xlsx' || extension === 'xls') {
      parsedData = await parseExcel(file);
    } else if (extension === 'csv') {
      parsedData = await parseCSV(file);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // Get all agents for name matching
    const agents = await db.select().from(schema.agents);

    // Find agent name column
    const agentColumnIndex = parsedData.headers.findIndex(h =>
      h.toLowerCase().includes('agent') || 
      h.toLowerCase().includes('name') || 
      h.toLowerCase().includes('employee')
    );

    if (agentColumnIndex === -1) {
      return NextResponse.json(
        { error: "Could not find agent name column" },
        { status: 400 }
      );
    }

    // Find date column
    const dateColumnIndex = parsedData.headers.findIndex(h =>
      h.toLowerCase().includes('date')
    );

    let recordsProcessed = 0;
    let errors: string[] = [];
    const rows = parsedData.data.slice(1); // Skip header row

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        // Match agent name
        const agentName = String(row[agentColumnIndex] || '').trim();
        if (!agentName) continue;

        const matchResult = matchAgentName(agentName, agents);
        
        if (!matchResult.matched || !matchResult.agentId) {
          errors.push(`Row ${i + 2}: Could not match agent "${agentName}"`);
          continue;
        }

        // Get date
        let recordDate = dateStart;
        if (dateColumnIndex >= 0 && row[dateColumnIndex]) {
          recordDate = String(row[dateColumnIndex]);
        }

        // Process based on report type
        switch (reportType) {
          case 'quality': {
            const qualityColumnIndex = parsedData.headers.findIndex(h =>
              h.toLowerCase().includes('quality') || h.toLowerCase().includes('score')
            );
            
            if (qualityColumnIndex >= 0) {
              const quality = parseFloat(String(row[qualityColumnIndex] || '0'));
              
              // Insert or update KPI record
              await db.insert(schema.kpis).values({
                agentId: matchResult.agentId,
                date: recordDate,
                quality,
              }).onConflictDoUpdate({
                target: [schema.kpis.agentId, schema.kpis.date],
                set: { quality },
              });
              
              recordsProcessed++;
            }
            break;
          }

          case 'aht': {
            const ahtColumnIndex = parsedData.headers.findIndex(h =>
              h.toLowerCase().includes('aht') || h.toLowerCase().includes('handling')
            );
            
            if (ahtColumnIndex >= 0) {
              const aht = parseFloat(String(row[ahtColumnIndex] || '0'));
              
              await db.insert(schema.kpis).values({
                agentId: matchResult.agentId,
                date: recordDate,
                aht,
              }).onConflictDoUpdate({
                target: [schema.kpis.agentId, schema.kpis.date],
                set: { aht },
              });
              
              recordsProcessed++;
            }
            break;
          }

          case 'srr': {
            const srrColumnIndex = parsedData.headers.findIndex(h =>
              h.toLowerCase().includes('srr') || 
              h.toLowerCase().includes('save') ||
              h.toLowerCase().includes('retention')
            );
            
            if (srrColumnIndex >= 0) {
              const srr = parseFloat(String(row[srrColumnIndex] || '0'));
              
              await db.insert(schema.kpis).values({
                agentId: matchResult.agentId,
                date: recordDate,
                srr,
              }).onConflictDoUpdate({
                target: [schema.kpis.agentId, schema.kpis.date],
                set: { srr },
              });
              
              recordsProcessed++;
            }
            break;
          }

          case 'voc': {
            const vocColumnIndex = parsedData.headers.findIndex(h =>
              h.toLowerCase().includes('voc') || 
              h.toLowerCase().includes('voice') ||
              h.toLowerCase().includes('customer')
            );
            
            if (vocColumnIndex >= 0) {
              const voc = parseFloat(String(row[vocColumnIndex] || '0'));
              
              await db.insert(schema.kpis).values({
                agentId: matchResult.agentId,
                date: recordDate,
                voc,
              }).onConflictDoUpdate({
                target: [schema.kpis.agentId, schema.kpis.date],
                set: { voc },
              });
              
              recordsProcessed++;
            }
            break;
          }
        }
      } catch (rowError) {
        errors.push(`Row ${i + 2}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`);
      }
    }

    // Record upload in database
    await db.insert(schema.uploads).values({
      filename: fileName,
      fileType: extension || 'unknown',
      reportType,
      status: errors.length > 0 ? 'completed_with_errors' : 'completed',
      recordsProcessed,
      errors: errors.length > 0 ? errors.join('; ') : null,
    });

    return NextResponse.json({
      success: true,
      recordsProcessed,
      errors,
      message: `Successfully processed ${recordsProcessed} records${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
    });
  } catch (error) {
    console.error("Upload process error:", error);
    
    // Try to record failed upload
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      
      if (file) {
        await db.insert(schema.uploads).values({
          filename: file.name,
          fileType: file.name.split('.').pop() || 'unknown',
          reportType: formData.get("reportType") as string || 'unknown',
          status: 'failed',
          recordsProcessed: 0,
          errors: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}

