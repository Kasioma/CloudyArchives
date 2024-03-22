"use server";
import { db } from "@/server/db";
import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { lucia, validateRequest } from "@/server/auth";
import { redirect } from "next/navigation";
import { generateId } from "lucia";
import {
  NullablePartial,
  UserRegisterSchema,
  userLoginSchema,
  userRegisterSchema,
} from "@/lib/utils";
import { passwordTable, userTable } from "../db/schema";

type ActionResult = {
  error: string;
};

export async function signup(formData: FormData): Promise<ActionResult> {
  const rawFormData = {
    username: formData.get("username")?.valueOf(),
    password: formData.get("password")?.valueOf(),
    confirmPassword: formData.get("confirmPassword")?.valueOf(),
  };

  const data = userRegisterSchema.safeParse(rawFormData);
  if (!data.success) {
    console.log(data.error);
    return { error: "Invalid register credentials" };
  }
  const hashedPassword = await new Argon2id().hash(data.data.password);
  const userId = generateId(15);

  try {
    await db.insert(userTable).values({
      id: userId,
      username: data.data.username,
    });
  } catch {
    return { error: "User already exists" };
  }

  await db.insert(passwordTable).values({
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
  return redirect("/");
}

export async function logout(): Promise<ActionResult> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/login");
}
