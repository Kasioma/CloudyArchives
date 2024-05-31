import { generateId } from "lucia";
import * as fs from "fs";
import path from "path";
import { validateRequest } from "@/server/auth";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { postTable } from "@/server/db/schema";
import { revalidatePath } from "next/cache";

export async function POST(request: Request): Promise<Response> {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json(null, { status: 401 });
  const blob = await request.blob();

  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const contentType = blob.type;
  const extension = contentType.split("/")[1]!;

  const id = generateId(15);
  const filename = `${id}.${extension}`;

  const contentDisposition = request.headers
    .get("Content-Disposition")
    ?.split(".");

  const originalName = contentDisposition![0]!;

  const uploadDir = path.join(process.cwd(), "public/uploads", user.id);
  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  fs.writeFileSync(filePath, buffer);

  const post = {
    postId: id,
    userId: user.id,
    title: originalName,
    extension: extension,
  };
  await db.insert(postTable).values(post);

  revalidatePath("/");
  return new Response();
}
