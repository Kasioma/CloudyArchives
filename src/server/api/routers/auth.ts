import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { userRegisterSchema } from "@/lib/utils";
import { Argon2id } from "oslo/password";
import { generateId } from "lucia";
import { passwordTable, userTable } from "@/server/db/schema";
import { lucia } from "@/server/auth";
import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(userRegisterSchema)
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await new Argon2id().hash(input.password);
      const userId = generateId(15);

      try {
        await ctx.db.insert(userTable).values({
          id: userId,
          username: input.username,
        });
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already in use.",
        });
      }

      await ctx.db.insert(passwordTable).values({
        userId: userId,
        password: hashedPassword,
      });

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }),
});
