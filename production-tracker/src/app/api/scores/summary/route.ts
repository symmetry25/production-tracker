import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";
import { getScoreSummaryAsync } from "@/lib/scoring";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return fail("Unauthorized", 401);
  const { searchParams } = new URL(request.url);
  return ok(await getScoreSummaryAsync({ department: searchParams.get("dept"), period: searchParams.get("period") }));
}
