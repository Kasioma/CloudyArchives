import { discord, lucia } from "@/server/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { db } from "@/server/db";
import { userTable, providersTable } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("discord_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await discord.validateAuthorizationCode(code);
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const discordUser = (await response.json()) as DiscordUser;

    const existingUser = await db.query.providersTable.findFirst({
      where: and(
        eq(providersTable.providerUserId, discordUser.id),
        eq(providersTable.providerType, "discord"),
      ),
    });

    if (existingUser) {
      const session = await lucia.createSession(
        existingUser.userId,
        {},
      );
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    const user = await db.query.userTable.findFirst({
      where: eq(userTable.username, discordUser.username),
    });

    if (user) discordUser.username += "-" + generateId(4);

    const userId = generateId(15);

    await db.insert(userTable).values({
      id: userId,
      username: discordUser.username,
    });

    await db.insert(providersTable).values({
      providerType: "discord",
      providerUserId: discordUser.id,
      userId: userId,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    console.log(e);
    if (e instanceof OAuth2RequestError) {
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}

interface DiscordUser {
  id: string;
  username: string;
}
