import { notFound } from "next/navigation";

import { SkillMatrixPageView } from "@/components/scoring/scoring-pages";
import { getUserScorecard, listSkills } from "@/lib/scoring";

export default async function UserSkillsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scorecard = getUserScorecard(id);
  if (!scorecard) notFound();
  return <SkillMatrixPageView scorecard={scorecard} skills={listSkills()} />;
}
