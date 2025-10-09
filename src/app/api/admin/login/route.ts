import { NextRequest, NextResponse } from 'next/server';

// Simple JWT-like token generation (in production, use a proper JWT library)
function generateToken(username: string): string {
  const timestamp = Date.now();
  const secret = process.env.ADMIN_SECRET || 'default-secret';
  const payload = `${username}:${timestamp}`;
  
  // Simple encoding (in production, use crypto.createHmac)
  const token = Buffer.from(`${payload}:${secret}`).toString('base64');
  return token;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === validUsername && password === validPassword) {
      const token = generateToken(username);
      
      return NextResponse.json({ 
        success: true, 
        token,
        message: 'Login successful' 
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

