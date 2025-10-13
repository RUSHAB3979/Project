import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

const createCandidateUsername = (email: string, displayName: string) => {
  const localPart = email?.split('@')[0] ?? '';
  const sanitized = (localPart || displayName || 'user')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  return sanitized || 'user';
};

const ensureUniqueUsername = async (base: string) => {
  let candidate = base;
  let suffix = 0;
  while (suffix < 1000) {
    const existing = await prisma.user.findFirst({ where: { username: candidate } as any });
    if (!existing) {
      return candidate;
    }
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return `${base}${crypto.randomUUID().slice(0, 6)}`;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3001/api/auth/google/callback',
      scope: ['profile', 'email'],
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
          where: { googleId: profile.id } as any,
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Check if email is already registered
        const primaryEmail = profile.emails?.[0]?.value;

        if (!primaryEmail) {
          return done(new Error('Google profile did not provide an email address'));
        }

        const userWithEmail = await prisma.user.findUnique({
          where: { email: primaryEmail },
        });

        if (userWithEmail) {
          // Link Google account to existing user
          const updatedUser = await prisma.user.update({
            where: { id: userWithEmail.id },
            data: { googleId: profile.id, emailVerified: true } as any,
          });
          return done(null, updatedUser);
        }

        // Create new user
  const baseUsername = createCandidateUsername(primaryEmail, profile.displayName);
        const username = await ensureUniqueUsername(baseUsername);

        const newUser = await prisma.user.create({
          data: {
            email: primaryEmail,
            name: profile.displayName,
            username,
            googleId: profile.id,
            profileImg: profile.photos?.[0]?.value,
            emailVerified: true,
          } as any,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;