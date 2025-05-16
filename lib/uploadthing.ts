import { createUploadthing, type FileRouter } from "uploadthing/next";
import { currentUser } from "@clerk/nextjs/server";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const user = await currentUser();
      if (!user?.id) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file);

      const { connectToDatabase } = await import('@/lib/database/connect');
      const { default: Upload } = await import('@/lib/database/models/upload.model');

      await connectToDatabase();

      await Upload.create({
        key: file.key,
        name: file.name,
        url: file.url,
        size: file.size,
        uploaderId: metadata.userId,
      });
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
