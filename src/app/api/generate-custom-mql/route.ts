import { NextRequest, NextResponse } from 'next/server';
import { enhanceQuery, generateMQL } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { query, schema } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!schema) {
      return NextResponse.json(
        { success: false, error: 'Schema is required for custom queries' },
        { status: 400 }
      );
    }

    // Step 1: Enhance the query using Gemini Pro
    console.log('Enhancing custom query...');
    const enhancedQuery = await enhanceQuery(query, schema);
    console.log('Enhanced Query:', enhancedQuery);

    // Step 2: Generate MQL using Gemini Flash
    console.log('Generating custom MQL...');
    const mqlQuery = await generateMQL(enhancedQuery, schema);

    // For custom schema, we only return the MQL without executing it
    return NextResponse.json({
      success: true,
      enhancedQuery,
      mqlQuery,
      results: null, // No execution for custom schema
      schema
    });

  } catch (error) {
    console.error('Custom MQL Generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}