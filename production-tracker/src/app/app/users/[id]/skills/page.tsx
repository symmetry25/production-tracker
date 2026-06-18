import { notFound } from "next/navigation";

import { SkillMatrixPageView } from "@/components/scoring/scoring-pages";
import { getUserScorecardAsync, listSkillsAsync } from "@/lib/scoring";

export default async function UserSkillsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scorecard = await getUserScorecardAsync(id);
  if (!scorecard) notFound();
  return <SkillMatrixPageView scorecard={scorecard} skills={await listSkillsAsync()} />;
}
