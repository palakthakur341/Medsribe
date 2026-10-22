import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get user from Convex
          const user = await convex.query(api.users.getUserByEmail, {
            email: credentials.email,
          });

          if (!user) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          // Update last login time
          await convex.mutation(api.users.updateUser, {
            userId: user._id,
            lastLoginAt: Date.now(),
          });

          // Send login notification email directly (async, don't wait for it)
          try {
            fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-login-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                firstName: user.name || user.email.split('@')[0],
                loginDetails: {
                  timestamp: new Date().toLocaleString(),
                  // Note: IP and user agent are not available in this context
                  // They would need to be passed from the client or middleware
                },
              }),
            }).catch(error => {
              console.error('Failed to send login notification:', error);
            });
          } catch (error) {
            console.error('Error sending login notification:', error);
          }

          return {
            id: user._id,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await convex.query(api.users.getUserByEmail, {
            email: user.email!,
          });

          if (existingUser) {
            // Update existing user with OAuth info if needed
            if (!existingUser.provider || existingUser.provider !== "google") {
              await convex.mutation(api.users.updateUser, {
                userId: existingUser._id,
                provider: "google",
                providerId: account.providerAccountId,
                name: user.name,
                image: user.image,
                emailVerifiedAt: Date.now(),
                lastLoginAt: Date.now(),
              });
            } else {
              // Just update last login
              await convex.mutation(api.users.updateUser, {
                userId: existingUser._id,
                lastLoginAt: Date.now(),
              });
            }

            // Send login notification email for OAuth users (async, don't wait for it)
            try {
              fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-login-notification`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: existingUser.email,
                  firstName: existingUser.name || user.name || existingUser.email.split('@')[0],
                  loginDetails: {
                    timestamp: new Date().toLocaleString(),
                    // Note: IP and user agent are not available in this context
                  },
                }),
              }).catch(error => {
                console.error('Failed to send OAuth login notification:', error);
              });
            } catch (error) {
              console.error('Error sending OAuth login notification:', error);
            }

            // Set user info for JWT
            user.id = existingUser._id;
            user.role = existingUser.role;
            return true;
          } else {
            // For new OAuth users, redirect to registration
            return false; // This will prevent sign-in and redirect to registration
          }
        } catch (error) {
          console.error("OAuth sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }

      // For OAuth users, store user info but don't query database here to avoid hanging
      if (account?.provider === "google") {
        if (profile) {
          token.name = profile.name;
          token.picture = profile.picture;
          token.provider = "google";
          token.providerId = account.providerAccountId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string || token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle registration redirect
      if (url.includes("/auth/register")) {
        return url;
      }

      // Handle role-based redirects
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module "next-auth" {
  interface User {
    role: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}
