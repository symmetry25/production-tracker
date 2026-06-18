import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { listTemplates } from "@/lib/custom-data-store";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  return ok(listTemplates(searchParams.get("industry")));
}
