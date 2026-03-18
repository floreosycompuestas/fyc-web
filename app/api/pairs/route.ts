import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get cookies
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { detail: 'Authentication required' },
        { status: 401 }
      );
    }

    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/pairs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating pair:', error);
    return NextResponse.json(
      { detail: 'Failed to create pair' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get cookies
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { detail: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');
    const birdId = searchParams.get('bird_id');

    let url = `${API_BASE_URL}/pairs/`;

    if (season) {
      url = `${API_BASE_URL}/pairs/season/${season}`;
    } else if (birdId) {
      url = `${API_BASE_URL}/pairs/bird/${birdId}`;
    }

    // Forward request to backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching pairs:', error);
    return NextResponse.json(
      { detail: 'Failed to fetch pairs' },
      { status: 500 }
    );
  }
}

