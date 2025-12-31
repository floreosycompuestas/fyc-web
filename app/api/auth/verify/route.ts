import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the cookies from the request
    const accessToken = request.cookies.get('access_token');
    const refreshToken = request.cookies.get('refresh_token');

    console.log("Checking auth - has access_token:", !!accessToken);
    console.log("Checking auth - has refresh_token:", !!refreshToken);

    // If neither token exists, user is not authenticated
    if (!accessToken && !refreshToken) {
      console.log("No tokens found - user not authenticated");
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // If we have tokens, user is authenticated
    console.log("Tokens found - user is authenticated");
    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}

