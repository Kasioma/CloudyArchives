import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { postTable, requestTable, userTable } from "@/server/db/schema";
import { lucia, validateRequest } from "@/server/auth";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { changeCredentials } from "@/lib/utils";

export const moderatorRouter = createTRPCRouter({
  display: publicProcedure.query(async () => {
    const { user } = await validateRequest();
    if (user?.role !== "moderator") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "FETCH COULDNT BE PERFORMED",
      });
    }
    if (user)
      try {
        const request = await db
          .select({
            requestId: requestTable.requestId,
            userId: userTable.id,
            postId: requestTable.postId,
            extension: postTable.extension,
            username: userTable.username,
            title: postTable.title,
          })
          .from(requestTable)
          .innerJoin(postTable, eq(requestTable.postId, postTable.postId))
          .innerJoin(userTable, eq(postTable.userId, userTable.id));
        return request;
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "FETCH COULDNT BE PERFORMED",
        });
      }
  }),
  handleRequest: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        status: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = await validateRequest();
      if (user?.role !== "moderator") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "NOT ALLOWED",
        });
      }
      if (user)
        try {
          await ctx.db
            .update(postTable)
            .set({
              status: input.status,
            })
            .where(eq(postTable.postId, input.postId));
          await ctx.db
            .delete(requestTable)
            .where(eq(requestTable.postId, input.postId));
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "MUTATION BAD",
          });
        }
    }),
  fetchUsers: publicProcedure.query(async () => {
    const { user } = await validateRequest();
    if (user?.role !== "moderator") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "BAD ROLE",
      });
    }
    try {
      return await db.select().from(userTable);
    } catch {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "FETCH COULDNT BE PERFORMED",
      });
    }
  }),
  modify: publicProcedure
    .input(changeCredentials.extend({ currentUsername: z.string().max(20) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = await validateRequest();
      if (user?.role !== "moderator") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "BAD ROLE",
        });
      }
      try {
        const user = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.username, input.currentUsername));

        if (!user || user.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No such account exists",
          });
        }
        const values = {
          username: input.username,
          role: input.role,
        };

        await ctx.db
          .update(userTable)
          .set(values)
          .where(eq(userTable.username, input.currentUsername));
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "WRONG MUTATION",
        });
      }
    }),
});
