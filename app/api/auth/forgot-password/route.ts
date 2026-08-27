import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signResetToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = await signResetToken({ id: user.id });
      const expiry = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: expiry },
      });
      console.log(`[RESET TOKEN] ${email}: ${token}`);
    }

    return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
