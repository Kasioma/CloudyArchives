"use client";

import React from "react";
import Upload from "./upload";
import { useRouter } from "next/navigation";

export default function FileUpload() {
  const router = useRouter();
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    if (file)
      await fetch("/api/file", {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": file.type,
          "Content-Disposition": file.name,
        },
      });
    router.refresh();
  }

  return (
    <div className="text-text-100">
      <label>
        <input type="file" hidden onChange={handleFileUpload} />
        <div className="mx-auto flex h-1/5 w-3/4 flex-col items-center justify-center gap-3 rounded border-4 border-dashed border-primary-500 p-4 text-2xl text-primary-500">
          <div className="flex flex-col items-center justify-center">
            <h2>Click to select file</h2>
            <Upload />
          </div>
        </div>
      </label>
    </div>
  );
}
