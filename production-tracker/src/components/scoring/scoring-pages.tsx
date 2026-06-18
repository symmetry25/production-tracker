"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

import { PageHeader, Metric } from "@/components/extensions/entity-type-pages";
import type { getScoreLeaderboard, getUserScorecard, listSkills } from "@/lib/scoring";

type Scorecard = NonNullable<ReturnType<typeof getUserScorecard>>;
type Leaderboard = ReturnType<typeof getScoreLeaderboard>;
type Skills = ReturnType<typeof listSkills>;

export function ScorecardPageView({ scorecard, leaderboard }: { scorecard: Scorecard; leaderboard: Leaderboard }) {
  const radarData = scorecard.rows.map((row) => ({ subject: row.dimension.name, score: row.score, fullMark: row.dimension.maxScore }));

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="People scoring" title={`${scorecard.user.name} 评分卡`} description="人员等级、信任评分、维度雷达图、历史趋势和技能矩阵，用于监制/制片判断岗位预算是否合理。" />
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Composite" value={scorecard.compositeScore} />
        <Metric label="Grade" value={scorecard.grade?.code ?? "--"} />
        <Metric label="Department" value={scorecard.user.department} />
        <Metric label="Skills" value={scorecard.skills.length} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <section className="border border-[#34322b] bg-[#181713] p-4">
          <p className="text-sm font-semibold">维度雷达图</p>
          <ResponsiveContainer width="100%" height={320} minWidth={1} minHeight={1}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#34322b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#aaa599", fontSize: 11 }} />
              <Radar dataKey="score" stroke="#d8b46a" fill="#d8b46a" fillOpacity={0.32} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </section>
        <section className="border border-[#34322b] bg-[#181713]">
          <div className="grid grid-cols-[1fr_100px_100px_100px] border-b border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#6e6e69]">
            <span>维度</span>
            <span>当前</span>
            <span>上期</span>
            <span>变化</span>
          </div>
          {scorecard.rows.map((row) => (
            <div key={row.dimension.id} className="grid grid-cols-[1fr_100px_100px_100px] border-b border-[#2a2a28] px-4 py-3 text-sm">
              <span>
                <span className="font-semibold text-[#f4f1e8]">{row.dimension.name}</span>
                <span className="ml-2 text-xs text-[#8f8a7e]">x{row.dimension.weight}</span>
              </span>
              <span className="font-mono text-[#e8c678]">{row.score}</span>
              <span className="font-mono text-[#8f8a7e]">{row.previousScore ?? "--"}</span>
              <span className={(row.change ?? 0) >= 0 ? "font-mono text-[#83d6ae]" : "font-mono text-[#ff9c8c]"}>{row.change === null ? "--" : row.change}</span>
            </div>
          ))}
        </section>
      </div>
      <section className="border border-[#34322b] bg-[#181713]">
        <div className="border-b border-[#2a2a28] px-4 py-3">
          <p className="text-sm font-semibold">团队排行榜</p>
        </div>
        {leaderboard.map((row) => (
          <div key={row.user.id} className="grid grid-cols-[80px_1fr_120px_100px] border-b border-[#2a2a28] px-4 py-3 text-sm">
            <span className="font-mono text-[#8f8a7e]">#{row.rank}</span>
            <span className="font-semibold text-[#f4f1e8]">{row.user.name}</span>
            <span className="text-[#c9c3b5]">{row.grade?.name ?? "--"}</span>
            <span className="font-mono text-[#e8c678]">{row.compositeScore}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

export function SkillMatrixPageView({ scorecard, skills }: { scorecard: Scorecard; skills: Skills }) {
  const userSkillMap = new Map(scorecard.skills.map((item) => [item.skillId, item.level]));
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Skill matrix" title={`${scorecard.user.name} 技能矩阵`} description="技能热力格用于判断人力预算和实际能力是否匹配。API 支持批量更新技能等级。" />
      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        {skills.map((skill) => {
          const level = userSkillMap.get(skill.id) ?? 0;
          return (
            <div key={skill.id} className="border border-[#34322b] bg-[#181713] p-4">
              <p className="text-xs text-[#8f8a7e]">{skill.category}</p>
              <p className="mt-2 text-sm font-semibold text-[#f4f1e8]">{skill.name}</p>
              <div className="mt-4 grid grid-cols-5 gap-1">
                {Array.from({ length: 5 }, (_, index) => <span key={index} className="h-2" style={{ backgroundColor: index < level ? "#d8b46a" : "#2a2a28" }} />)}
              </div>
              <p className="mt-2 font-mono text-xs text-[#8f8a7e]">Level {level || "--"}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}

const tooltipStyle = {
  background: "#181713",
  border: "1px solid #34322b",
  color: "#f4f1e8",
  fontSize: 12,
};
