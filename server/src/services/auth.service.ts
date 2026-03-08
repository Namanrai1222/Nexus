import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';

const BCRYPT_ROUNDS = 12;

interface RegisterInput {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const generateTokens = (userId: string, role: string): TokenPair => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

export const authService = {
  async register(input: RegisterInput) {
    const { username, email, password, displayName } = input;

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new ApiError(409, 'Username or email already taken');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: { username, email, passwordHash, displayName },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        impactScore: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const tokens = generateTokens(user.id, user.role);

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, ...tokens };
  },

  async login(input: LoginInput) {
    const { email, password } = input;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const tokens = generateTokens(user.id, user.role);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  },

  async refreshAccessToken(token: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    // Token rotation: delete old, create new
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const tokens = generateTokens(stored.user.id, stored.user.role);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: stored.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  },

  async logout(token: string) {
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
  },

  async logoutAll(userId: string) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  },
};
