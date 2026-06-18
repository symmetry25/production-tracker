import { notFound } from "next/navigation";

import { ScorecardPageView } from "@/components/scoring/scoring-pages";
import { getScoreLeaderboard, getUserScorecard } from "@/lib/scoring";

export default async function UserScorecardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scorecard = getUserScorecard(id);
  if (!scorecard) notFound();
  return <ScorecardPageView scorecard={scorecard} leaderboard={getScoreLeaderboard()} />;
}
