import NextAuth from "next-auth";

import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);
//it's necessary because middleware works with edge functions and those don't work with prisma, so addition of prisma is doe separetely

export default auth((req) => {
  //console.log("req.nextUrl.pathname: ", req.nextUrl.pathname);
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  //console.log("isLoggedIn: ", isLoggedIn);

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname); //if logged in - redirect

  if (isApiAuthRoute) {
    return null; //do nothing
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  //if not allowed to enter a route
  if (!isLoggedIn && !isPublicRoute) {
    //we form a URL for redirection of user after logging in
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
      //after logging in user will be redirected to this URL
    );
  }

  return null; //all the rest routes are not affected
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
