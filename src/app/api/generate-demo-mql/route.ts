import { NextRequest, NextResponse } from 'next/server';
import { enhanceQuery, generateMQL } from '@/lib/gemini';
import { executeQuery, getSampleData } from '@/lib/mongodb';
import { schemaTemplates } from '@/lib/schema-templates';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get the candidate schema from templates
    const candidateTemplate = schemaTemplates.find(t => t.name === "Candidate/Resume Database");
    
    if (!candidateTemplate) {
      return NextResponse.json(
        { success: false, error: 'Candidate schema template not found' },
        { status: 500 }
      );
    }

    // Step 1: Enhance the query using Gemini Pro
    console.log('Enhancing query...');
    const enhancedQuery = await enhanceQuery(query, candidateTemplate.schema);
    console.log('Enhanced Query:', enhancedQuery);

    // Step 2: Generate MQL using Gemini Flash
    console.log('Generating MQL...');
    const mqlQuery = await generateMQL(enhancedQuery, candidateTemplate.schema);

    let results = null;

    // Execute query on MongoDB (for demo tab only)
    try {
      const parsedQuery = JSON.parse(mqlQuery);
      results = await executeQuery(parsedQuery);
    } catch (parseError) {
      console.error('Query execution error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Failed to execute query on database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enhancedQuery,
      mqlQuery,
      results,
      schema: candidateTemplate.schema
    });

  } catch (error) {
    console.error('Demo MQL Generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch sample data
export async function GET() {
  try {
    const sampleData = await getSampleData(5);
    return NextResponse.json({
      success: true,
      data: sampleData
    });
  } catch (error) {
    console.error('Sample data fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sample data' },
      { status: 500 }
    );
  }
}