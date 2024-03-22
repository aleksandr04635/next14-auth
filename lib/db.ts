import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
//to prevent next from creating to many connections in development we add the commection to global this
//global is not effected by hot reload - when files are updated in develepment
//The globalThis global property allows one to access the global object regardless of the current environment.
