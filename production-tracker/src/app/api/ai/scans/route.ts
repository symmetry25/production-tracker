import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { listAiScansAsync } from "@/lib/ai-recognition";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  return ok(await listAiScansAsync({ recordId: searchParams.get("recordId"), entityTypeId: searchParams.get("entityTypeId") }));
}
