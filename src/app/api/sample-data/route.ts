import { NextResponse } from 'next/server';
import { getSampleData } from '@/lib/mongodb';

export async function GET() {
  try {
    const sampleData = await getSampleData(5);
    return NextResponse.json({ success: true, data: sampleData });
  } catch (error) {
    console.error('Sample data fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sample data' },
      { status: 500 }
    );
  }
}
