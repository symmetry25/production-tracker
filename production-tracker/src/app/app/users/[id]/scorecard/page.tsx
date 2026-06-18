import { notFound } from "next/navigation";

import { ScorecardPageView } from "@/components/scoring/scoring-pages";
import { getScoreLeaderboardAsync, getUserScorecardAsync } from "@/lib/scoring";

export default async function UserScorecardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scorecard = await getUserScorecardAsync(id);
  if (!scorecard) notFound();
  return <ScorecardPageView scorecard={scorecard} leaderboard={await getScoreLeaderboardAsync()} />;
}
