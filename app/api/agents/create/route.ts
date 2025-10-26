import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Agent name is required' 
      }, { status: 400 });
    }
    
    // Create new agent
    const newAgent = await db
      .insert(schema.agents)
      .values({
        name: body.name.trim(),
        email: body.email?.trim() || null,
        team: body.team || 'Team 1',
        role: body.role || 'Insurance Agent',
        hireDate: body.hireDate || new Date().toISOString().split('T')[0],
        status: 'active',
        notes: body.notes || null
      })
      .returning();
    
    console.log('✅ New agent created:', newAgent[0].name);
    
    return NextResponse.json({ 
      success: true, 
      agent: newAgent[0],
      message: `Agent ${newAgent[0].name} added successfully to ${newAgent[0].team}` 
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create agent',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

