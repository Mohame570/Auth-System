import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const token = auth.replace('Bearer ', '');
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
