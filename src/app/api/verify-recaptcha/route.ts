import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ success: false, error: ['No token provided'] }, { status: 400 });
  }

  const secretKey = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ success: false, error: ['Missing secret key'] }, { status: 500 });
  }

  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  const response = await fetch(verificationUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();

  if (!data.success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, error: data['error-codes'] }, { status: 400 });
  }
}
