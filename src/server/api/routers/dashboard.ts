import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { postTable, requestTable } from "@/server/db/schema";
import { db } from "@/server/db";
import { desc, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { validateRequest } from "@/server/auth";
import { visibilityEnum } from "@/lib/utils";
import { z } from "zod";
import { getInput } from "node_modules/@trpc/client/dist/links/internals/httpUtils";
import { generateId } from "lucia";

export const dashboardRouter = createTRPCRouter({
  display: publicProcedure.query(async () => {
    try {
      const posts = await db
        .select()
        .from(postTable)
        .where(eq(postTable.visibility, "public"))
        .orderBy(desc(sql`${postTable.upvotes} - ${postTable.downvotes}`))
        .limit(7);
      return posts;
    } catch {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "FETCH COULDNT BE PERFORMED",
      });
    }
  }),
  getPostedFiles: publicProcedure.query(async () => {
    const { user } = await validateRequest();
    if (user)
      try {
        const posts = await db
          .select()
          .from(postTable)
          .where(eq(postTable.userId, user.id));
        return posts;
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "FETCH COULDNT BE PERFORMED",
        });
      }
  }),
  updateFile: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        currentTitle: z.string().max(20),
        currentVisibility: z.enum([
          visibilityEnum.public,
          visibilityEnum.private,
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = await validateRequest();
      if (user)
        try {
          const status = await ctx.db
            .select()
            .from(postTable)
            .where(eq(postTable.postId, input.postId));

          if (
            status[0]?.status === true &&
            input.currentVisibility === "public"
          ) {
            const values = {
              title: input.currentTitle,
              visibility: input.currentVisibility,
            };
            await ctx.db
              .update(postTable)
              .set(values)
              .where(eq(postTable.postId, input.postId));
          } else {
            await ctx.db
              .update(postTable)
              .set({ title: input.currentTitle })
              .where(eq(postTable.postId, input.postId));
            if (input.currentVisibility === "public") {
              const request = await ctx.db
                .select()
                .from(requestTable)
                .where(eq(requestTable.postId, input.postId));
              if (request.length === 0) {
                const id = generateId(15);
                await ctx.db
                  .insert(requestTable)
                  .values({ requestId: id, postId: input.postId });
              }
            }
          }
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "MUTTION WENT WRONG",
          });
        }
    }),
});
