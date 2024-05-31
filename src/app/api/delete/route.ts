import * as fs from "fs";
import path from "path";
import { validateRequest } from "@/server/auth";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { postTable, requestTable } from "@/server/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function DELETE(request: Request): Promise<Response> {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json(null, { status: 401 });

  const userId = request.headers.get("userId")!;
  const postId = request.headers.get("postId")!;
  const extension = request.headers.get("extension");

  const filename = `${postId}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public/uploads", userId);
  const filePath = path.join(uploadDir, filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      await db.delete(requestTable).where(eq(requestTable.postId, postId));
      await db.delete(postTable).where(eq(postTable.postId, postId));
      revalidatePath("/");
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
