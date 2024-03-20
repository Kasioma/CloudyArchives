import { github, lucia } from "@/server/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { db } from "@/server/db";
import { userTable, providersTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("github_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const githubUser = (await githubUserResponse.json()) as GitHubUser;

    const existingUser = await db.query.providersTable.findFirst({
      where: eq(providersTable.providerUserId, String(githubUser.id)),
    });

    if (existingUser) {
      const session = await lucia.createSession(
        existingUser.providerUserId,
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

    const userId = generateId(15);

    await db.insert(userTable).values({
      id: userId,
      username: githubUser.login,
    });

    await db.insert(providersTable).values({
      providerType: "github",
      providerUserId: String(githubUser.id),
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

interface GitHubUser {
  id: number;
  login: string;
}
