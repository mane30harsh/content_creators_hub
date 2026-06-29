import fs from "fs/promises";
import path from "path";

// Abstraction layer for file storage.
// Currently saves to public/uploads/ (Next.js serves it at /uploads/).
// Swap to S3 / Cloudflare R2 / any provider by replacing the
// implementation of uploadFile / deleteFile below.

export interface StorageResult {
  url: string;
  fileName: string;
}

export async function uploadFile(file: File): Promise<StorageResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop() || "bin";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), buffer);

  return { url: `/uploads/${fileName}`, fileName };
}

export async function deleteFile(url: string): Promise<void> {
  const filePath = path.join(process.cwd(), "public", url);
  try {
    await fs.unlink(filePath);
  } catch {
    // file may not exist — ignore
  }
}
