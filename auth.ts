import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getAccountByUserId } from "./data/account";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  update,
} = NextAuth({
  pages: {
    //redirects in case of sign-in error and general error
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      //on creation of OAuth accout add emailVerified
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      //console.log("user, account from signIn calback: ", user, account);
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );

        if (!twoFactorConfirmation) return false;

        // if twoFactorConfirmation exist allow logging in but delete it
        //so the next time without confirmation signing in is impossible
        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },

    async jwt({ token }) {
      if (!token.sub) return token; //if logged out
      //console.log("token from jwt calback: ", { token });
      const existingUser = await getUserById(token.sub); //sub is id in DB

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);
      // console.log("existingAccount from jwt calback: ", existingAccount);

      token.isOAuth = !!existingAccount; //only OAuth user have accounts in DB
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    },

    //session is executed after JWT
    async session({ token, session }) {
      //console.log({ sessionToken: token, session });
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.isOAuth = token.isOAuth as boolean;
      }

      return session;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  //in prisma we cannnot use DB session, because of edge functions, so addition of prisma is done separetely
  ...authConfig,
});

//from new4/next_user_auth-main add google user to DB
/* async signIn({ user, account }: { user: any; account: any }) {
  if (account.provider === "google") {
    try {
      console.log("user in signIn callback: ", user);
      const { name, email, image } = user;
      await connect();
      const ifUserExists = await User.findOne({ email });
      if (ifUserExists) {
        return user;
      } //ADD HERE and in the User model IMAGE
      const newUser = new User({
        name: name,
        email: email,
      });
      const res = await newUser.save();
      if (res.status === 200 || res.status === 201) {
        console.log(res);
        return user;
      }
    } catch (err) {
      console.log(err);
    }
  }
  return user;
}, */
