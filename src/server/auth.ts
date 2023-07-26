import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";


const loginUserSchema = z.object({
  name: z.string().min(2, "Неверное имя, минимум 2 буквы!"),
})

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // ...add more providers here
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: {
          label: "Имя",
          type: "text",
          placeholder: "Введите имя",
        },
      },
      async authorize(credentials, _req) {
        const { name } = loginUserSchema.parse(credentials)

        const user = await prisma.user.findUnique({
          where: {
              name
          }
        });

        if (!user) {
          const newUser = await prisma.user.create({
            data: {
              name,
            },
          });

          return newUser;
        }

        return user;
      },
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    session({
      session,
      token
    }) {
      session.user.id = token.id;
      session.user.email = token.email
      session.user.name = token.name
      return session;
    },
    jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
        token.image = user.image
        token.email = user.email
        token.name = user.name
        token.id = user.id
      }
      return token;
    }
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
