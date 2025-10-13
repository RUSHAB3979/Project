import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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
        const existingUser = await prisma.user.findUnique({
          where: { google_id: profile.id },
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Check if email is already registered
        const userWithEmail = await prisma.user.findUnique({
          where: { email: profile.emails![0].value },
        });

        if (userWithEmail) {
          // Link Google account to existing user
          const updatedUser = await prisma.user.update({
            where: { id: userWithEmail.id },
            data: { google_id: profile.id, email_verified: true },
          });
          return done(null, updatedUser);
        }

        // Create new user
        const newUser = await prisma.user.create({
          data: {
            email: profile.emails![0].value,
            name: profile.displayName,
            google_id: profile.id,
            profile_img: profile.photos?.[0]?.value,
            email_verified: true,
          },
        });

        return done(null, newUser);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;