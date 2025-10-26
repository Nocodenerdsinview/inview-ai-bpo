import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agentId = parseInt(id);
    
    if (isNaN(agentId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid agent ID' 
      }, { status: 400 });
    }
    
    // Get agent details first
    const agent = await db
      .select()
      .from(schema.agents)
      .where(eq(schema.agents.id, agentId))
      .limit(1);
    
    if (agent.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Agent not found' 
      }, { status: 404 });
    }
    
    // Archive agent (soft delete)
    await db
      .update(schema.agents)
      .set({ 
        status: 'archived',
        deletedAt: new Date().toISOString()
      })
      .where(eq(schema.agents.id, agentId));
    
    console.log(`📦 Agent archived: ${agent[0].name} (ID: ${agentId}). Historical data preserved.`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Agent ${agent[0].name} archived successfully. All historical data preserved for AI analysis.` 
    });
  } catch (error) {
    console.error('Error archiving agent:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to archive agent',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

