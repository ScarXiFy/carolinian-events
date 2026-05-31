import { auth } from "@/auth";
import {
  createEventImageUploadForFile,
  validateEventImageUploadMetadata,
} from "@/lib/event-image-upload.mjs";
import { canCreateEvents } from "@/lib/permissions.mjs";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "You must be logged in to upload images." }, { status: 401 });
  }

  if (!session.user.isEmailVerified) {
    return Response.json({ error: "Please verify your email before uploading images." }, { status: 403 });
  }

  if (!canCreateEvents(session.user.role)) {
    return Response.json({ error: "You do not have permission to upload event images." }, { status: 403 });
  }

  const body = await request.json();
  const file = {
    name: String(body.name ?? ""),
    type: String(body.type ?? ""),
    size: Number(body.size ?? 0),
  };

  try {
    validateEventImageUploadMetadata(file);
    const upload = await createEventImageUploadForFile(file);
    return Response.json(upload);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to prepare upload." },
      { status: 400 },
    );
  }
}
