import { z } from "zod";

import { auth } from "@/auth";
import { fail } from "@/lib/api-response";
import { recognizeDocument } from "@/lib/ai-recognition";

const batchSchema = z.object({
  files: z.array(z.object({ imageBase64: z.string().optional(), imageType: z.string().optional(), name: z.string().optional() })).default([]),
  mode: z.enum(["invoice", "table", "document", "card", "custom"]).default("document"),
  entityTypeId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const parsed = batchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid batch recognition payload.", 422);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const files = parsed.data.files.length ? parsed.data.files : [{ name: "mock-document" }];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const result = await recognizeDocument({ imageBase64: file.imageBase64, imageType: file.imageType, mode: parsed.data.mode, entityTypeId: parsed.data.entityTypeId });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ current: index + 1, total: files.length, name: file.name ?? `file-${index + 1}`, result })}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
