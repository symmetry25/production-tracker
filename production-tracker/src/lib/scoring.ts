import { getPrisma } from "@/lib/prisma";

export type ScoreDimensionItem = {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  minScore: number;
  category: string;
  projectId: string | null;
};

export type UserScoreItem = {
  id: string;
  userId: string;
  dimensionId: string;
  score: number;
  comment: string | null;
  scoredById: string;
  scoredAt: string;
  period: string;
};

type UserScorecard = NonNullable<ReturnType<typeof getUserScorecard>>;

export type GradeLevelItem = {
  id: string;
  name: string;
  code: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  department: string | null;
  minScore: number;
  maxScore: number;
  salaryMin: number | null;
  salaryMax: number | null;
  color: string;
  benefits: string[];
};

export type SkillItem = {
  id: string;
  name: string;
  category: string;
};

export type UserSkillItem = {
  id: string;
  userId: string;
  skillId: string;
  level: number;
  verifiedBy: string | null;
  verifiedAt: string | null;
  updatedAt: string;
};

export type ScoreUser = {
  id: string;
  name: string;
  department: string;
  role: string;
};

type ScoringState = {
  users: ScoreUser[];
  dimensions: ScoreDimensionItem[];
  scores: UserScoreItem[];
  grades: GradeLevelItem[];
  skills: SkillItem[];
  userSkills: UserSkillItem[];
  sequence: number;
};

const periodDefault = "2026-Q2";
const globalForScoring = globalThis as typeof globalThis & {
  __productionTrackerScoringState?: ScoringState;
};

export function calculateCompositeScore(scores: { score: number; weight: number; maxScore: number }[]) {
  if (!scores.length) return 0;
  const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return 0;
  const weighted = scores.reduce((sum, item) => sum + (item.score / Math.max(1, item.maxScore)) * 100 * item.weight, 0);
  return Math.round(weighted / totalWeight);
}

export function listScoreDimensions() {
  return clone(getState().dimensions);
}

export function createScoreDimension(input: Pick<ScoreDimensionItem, "name" | "description" | "weight" | "maxScore" | "minScore" | "category"> & Partial<Pick<ScoreDimensionItem, "projectId">>) {
  const dimension: ScoreDimensionItem = { ...input, id: `dimension-${nextSequence()}`, projectId: input.projectId ?? null };
  getState().dimensions.push(dimension);
  return clone(dimension);
}

export function updateScoreDimension(id: string, input: Partial<ScoreDimensionItem>) {
  const state = getState();
  const dimension = state.dimensions.find((item) => item.id === id);
  if (!dimension) return null;
  Object.assign(dimension, input, { id: dimension.id });
  return clone(dimension);
}

export function getUserScorecard(userId: string, period = periodDefault) {
  const state = getState();
  const user = state.users.find((item) => item.id === userId);
  if (!user) return null;

  const rows = state.dimensions.map((dimension) => {
    const current = state.scores.find((score) => score.userId === userId && score.dimensionId === dimension.id && score.period === period);
    const previous = state.scores.find((score) => score.userId === userId && score.dimensionId === dimension.id && score.period !== period);
    return {
      dimension,
      score: current?.score ?? 0,
      previousScore: previous?.score ?? null,
      change: previous ? (current?.score ?? 0) - previous.score : null,
      comment: current?.comment ?? null,
      scoredById: current?.scoredById ?? null,
      scoredAt: current?.scoredAt ?? null,
    };
  });
  const compositeScore = calculateCompositeScore(rows.map((row) => ({ score: row.score, weight: row.dimension.weight, maxScore: row.dimension.maxScore })));
  const grade = determineGrade(compositeScore, user.department);
  const skills = getUserSkills(userId);

  return clone({ user, period, compositeScore, grade, rows, skills, history: getUserScoreHistory(userId) });
}

export function upsertUserScore(userId: string, input: { dimensionId: string; score: number; comment?: string | null; period?: string; scoredById?: string }) {
  const state = getState();
  const period = input.period ?? periodDefault;
  const existing = state.scores.find((score) => score.userId === userId && score.dimensionId === input.dimensionId && score.period === period);
  if (existing) {
    existing.score = input.score;
    existing.comment = input.comment ?? null;
    existing.scoredById = input.scoredById ?? "demo-admin";
    existing.scoredAt = new Date().toISOString();
    return clone(existing);
  }

  const score: UserScoreItem = {
    id: `score-${nextSequence()}`,
    userId,
    dimensionId: input.dimensionId,
    score: input.score,
    comment: input.comment ?? null,
    scoredById: input.scoredById ?? "demo-admin",
    scoredAt: new Date().toISOString(),
    period,
  };
  state.scores.push(score);
  return clone(score);
}

export async function upsertUserScoreAsync(userId: string, input: { dimensionId: string; score: number; comment?: string | null; period?: string; scoredById?: string }) {
  if (!shouldUsePersistentStore()) return upsertUserScore(userId, input);

  const period = input.period ?? periodDefault;
  const score = await getPrisma().userScore.upsert({
    where: {
      userId_dimensionId_period: {
        userId,
        dimensionId: input.dimensionId,
        period,
      },
    },
    update: {
      score: input.score,
      comment: input.comment ?? null,
      scoredById: input.scoredById ?? "demo-admin",
      scoredAt: new Date(),
    },
    create: {
      userId,
      dimensionId: input.dimensionId,
      period,
      score: input.score,
      comment: input.comment ?? null,
      scoredById: input.scoredById ?? "demo-admin",
    },
  });
  return scoreFromDb(score);
}

export function getUserScoreHistory(userId: string) {
  const state = getState();
  const periods = Array.from(new Set(state.scores.filter((score) => score.userId === userId).map((score) => score.period))).sort();
  return periods.map((period) => {
    const rows = state.dimensions.map((dimension) => {
      const score = state.scores.find((item) => item.userId === userId && item.dimensionId === dimension.id && item.period === period);
      return { score: score?.score ?? 0, weight: dimension.weight, maxScore: dimension.maxScore };
    });
    return { period, compositeScore: calculateCompositeScore(rows) };
  });
}

export function getScoreSummary(filters: { department?: string | null; period?: string | null } = {}) {
  const period = filters.period ?? periodDefault;
  return getState().users
    .filter((user) => !filters.department || user.department === filters.department)
    .map((user) => getUserScorecard(user.id, period))
    .filter((scorecard): scorecard is UserScorecard => Boolean(scorecard))
    .map((scorecard) => ({
      user: scorecard.user,
      period,
      compositeScore: scorecard.compositeScore,
      grade: scorecard.grade,
      skillCount: scorecard.skills.length,
    }))
    .sort((a, b) => b.compositeScore - a.compositeScore);
}

export function getScoreLeaderboard(filters: { department?: string | null; period?: string | null } = {}) {
  return getScoreSummary(filters).map((row, index) => ({ rank: index + 1, ...row }));
}

export function listGrades() {
  return clone(getState().grades);
}

export function createGrade(input: Omit<GradeLevelItem, "id">) {
  const grade: GradeLevelItem = { ...input, id: `grade-${nextSequence()}` };
  getState().grades.push(grade);
  return clone(grade);
}

export function updateGrade(id: string, input: Partial<GradeLevelItem>) {
  const grade = getState().grades.find((item) => item.id === id);
  if (!grade) return null;
  Object.assign(grade, input, { id: grade.id });
  return clone(grade);
}

export function setUserGrade(userId: string, gradeId: string) {
  const grade = getState().grades.find((item) => item.id === gradeId);
  const scorecard = getUserScorecard(userId);
  if (!grade || !scorecard) return null;
  return clone({ user: scorecard.user, grade, effectiveDate: new Date().toISOString(), setById: "demo-admin" });
}

export function listSkills() {
  return clone(getState().skills);
}

export function createSkill(input: Pick<SkillItem, "name" | "category">) {
  const skill: SkillItem = { ...input, id: `skill-${nextSequence()}` };
  getState().skills.push(skill);
  return clone(skill);
}

export function getUserSkills(userId: string) {
  const state = getState();
  return state.userSkills
    .filter((item) => item.userId === userId)
    .map((item) => ({ ...item, skill: state.skills.find((skill) => skill.id === item.skillId) ?? null }))
    .sort((a, b) => String(a.skill?.category).localeCompare(String(b.skill?.category)) || String(a.skill?.name).localeCompare(String(b.skill?.name)));
}

export function updateUserSkills(userId: string, updates: { skillId: string; level: number; verifiedBy?: string | null }[]) {
  const state = getState();
  const now = new Date().toISOString();
  const updated = updates.map((update) => {
    const existing = state.userSkills.find((item) => item.userId === userId && item.skillId === update.skillId);
    if (existing) {
      existing.level = update.level;
      existing.verifiedBy = update.verifiedBy ?? existing.verifiedBy;
      existing.verifiedAt = update.verifiedBy ? now : existing.verifiedAt;
      existing.updatedAt = now;
      return existing;
    }

    const item: UserSkillItem = {
      id: `user-skill-${nextSequence()}`,
      userId,
      skillId: update.skillId,
      level: update.level,
      verifiedBy: update.verifiedBy ?? null,
      verifiedAt: update.verifiedBy ? now : null,
      updatedAt: now,
    };
    state.userSkills.push(item);
    return item;
  });
  return clone(updated);
}

export async function updateUserSkillsAsync(userId: string, updates: { skillId: string; level: number; verifiedBy?: string | null }[]) {
  if (!shouldUsePersistentStore()) return updateUserSkills(userId, updates);

  const now = new Date();
  const updated = await Promise.all(updates.map(async (update) => {
    const row = await getPrisma().userSkill.upsert({
      where: {
        userId_skillId: {
          userId,
          skillId: update.skillId,
        },
      },
      update: {
        level: update.level,
        ...(update.verifiedBy !== undefined ? { verifiedBy: update.verifiedBy, verifiedAt: update.verifiedBy ? now : null } : {}),
      },
      create: {
        userId,
        skillId: update.skillId,
        level: update.level,
        verifiedBy: update.verifiedBy ?? null,
        verifiedAt: update.verifiedBy ? now : null,
      },
    });
    return userSkillFromDb(row);
  }));
  return updated;
}

export function resetScoringForTests() {
  globalForScoring.__productionTrackerScoringState = createState();
}

function determineGrade(compositeScore: number, department: string) {
  return (
    getState().grades
      .filter((grade) => (grade.department === null || grade.department === department) && grade.minScore <= compositeScore && grade.maxScore >= compositeScore)
      .sort((a, b) => b.minScore - a.minScore)[0] ?? null
  );
}

function shouldUsePersistentStore() {
  return Boolean(process.env.DATABASE_URL);
}

function scoreFromDb(score: {
  id: string;
  userId: string;
  dimensionId: string;
  score: number;
  comment: string | null;
  scoredById: string;
  scoredAt: Date | string;
  period: string;
}): UserScoreItem {
  return {
    id: score.id,
    userId: score.userId,
    dimensionId: score.dimensionId,
    score: score.score,
    comment: score.comment,
    scoredById: score.scoredById,
    scoredAt: score.scoredAt instanceof Date ? score.scoredAt.toISOString() : score.scoredAt,
    period: score.period,
  };
}

function userSkillFromDb(skill: {
  id: string;
  userId: string;
  skillId: string;
  level: number;
  verifiedBy: string | null;
  verifiedAt: Date | string | null;
  updatedAt: Date | string;
}): UserSkillItem {
  return {
    id: skill.id,
    userId: skill.userId,
    skillId: skill.skillId,
    level: skill.level,
    verifiedBy: skill.verifiedBy,
    verifiedAt: skill.verifiedAt ? toIsoString(skill.verifiedAt) : null,
    updatedAt: toIsoString(skill.updatedAt),
  };
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function getState() {
  globalForScoring.__productionTrackerScoringState ??= createState();
  return globalForScoring.__productionTrackerScoringState;
}

function createState(): ScoringState {
  const users: ScoreUser[] = [
    { id: "demo-user-producer", name: "林一凡", department: "制片组", role: "PRODUCER" },
    { id: "demo-user-dp", name: "Marcus Chen", department: "摄影组", role: "SUPERVISOR" },
    { id: "demo-user-vfx", name: "Nora Li", department: "调色/VFX组", role: "REVIEWER" },
    { id: "demo-user-post", name: "Milo Grant", department: "后期统筹组", role: "SUPERVISOR" },
    { id: "demo-user-dit", name: "Ava Wong", department: "DIT组", role: "ARTIST" },
  ];
  const dimensions: ScoreDimensionItem[] = [
    { id: "dim-tech", name: "技术能力", description: "专业技术、工具掌握和问题解决。", weight: 1.3, maxScore: 100, minScore: 0, category: "技术", projectId: null },
    { id: "dim-collab", name: "沟通协作", description: "跨部门沟通、反馈质量和现场配合。", weight: 1, maxScore: 100, minScore: 0, category: "软技能", projectId: null },
    { id: "dim-delivery", name: "交付效率", description: "按时完成、返工控制和产出稳定性。", weight: 1.2, maxScore: 100, minScore: 0, category: "KPI", projectId: null },
    { id: "dim-learning", name: "学习能力", description: "新流程、新工具和复盘吸收能力。", weight: 0.8, maxScore: 100, minScore: 0, category: "成长", projectId: null },
    { id: "dim-leadership", name: "领导力", description: "带队、审查、风险判断和资源协调。", weight: 0.9, maxScore: 100, minScore: 0, category: "管理", projectId: null },
  ];
  const gradeRanges: Omit<GradeLevelItem, "id">[] = [
    { code: "A", name: "A 核心专家", department: null, minScore: 90, maxScore: 100, salaryMin: 6000, salaryMax: 9000, color: "#1d9e75", benefits: ["可作为关键岗位负责人", "优先推荐给监制"] },
    { code: "B", name: "B 高级可靠", department: null, minScore: 80, maxScore: 89, salaryMin: 4200, salaryMax: 6500, color: "#4a9eff", benefits: ["适合独立负责模块", "可进入供应商白名单"] },
    { code: "C", name: "C 稳定执行", department: null, minScore: 70, maxScore: 79, salaryMin: 2800, salaryMax: 4800, color: "#d8b46a", benefits: ["适合常规岗位", "需要明确交付检查点"] },
    { code: "D", name: "D 观察培养", department: null, minScore: 60, maxScore: 69, salaryMin: 1800, salaryMax: 3200, color: "#ef9f27", benefits: ["需搭配主管复核", "不建议承担关键节点"] },
    { code: "E", name: "E 风险较高", department: null, minScore: 50, maxScore: 59, salaryMin: 1200, salaryMax: 2200, color: "#e24b4a", benefits: ["限制预算权限", "需要试用期"] },
    { code: "F", name: "F 暂不推荐", department: null, minScore: 30, maxScore: 49, salaryMin: null, salaryMax: null, color: "#9a4d3c", benefits: ["仅可做辅助岗位"] },
    { code: "G", name: "G 黑名单/停用", department: null, minScore: 0, maxScore: 29, salaryMin: null, salaryMax: null, color: "#6e6e69", benefits: ["不建议进入项目"] },
  ];
  const grades = gradeRanges.map((grade, index) => ({ ...grade, id: `grade-${grade.code.toLowerCase()}-${index}` }));
  const skills: SkillItem[] = [
    { id: "skill-budget", name: "预算拆分", category: "制片" },
    { id: "skill-schedule", name: "排期协调", category: "制片" },
    { id: "skill-camera", name: "摄影机系统", category: "摄影" },
    { id: "skill-dit", name: "DIT 数据流程", category: "DIT" },
    { id: "skill-nuke", name: "Nuke", category: "VFX" },
    { id: "skill-review", name: "版本审查", category: "后期" },
  ];
  const scores = users.flatMap((user, userIndex) =>
    dimensions.flatMap((dimension, dimensionIndex) => [
      scoreFor(user.id, dimension.id, "2026-Q1", 72 + ((userIndex * 7 + dimensionIndex * 5) % 20)),
      scoreFor(user.id, dimension.id, periodDefault, 76 + ((userIndex * 8 + dimensionIndex * 6) % 19)),
    ]),
  );
  const userSkills = users.flatMap((user, userIndex) =>
    skills.slice(0, 4 + (userIndex % 3)).map((skill, skillIndex) => ({
      id: `user-skill-${user.id}-${skill.id}`,
      userId: user.id,
      skillId: skill.id,
      level: Math.min(5, 2 + ((userIndex + skillIndex) % 4)),
      verifiedBy: "demo-user-producer",
      verifiedAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
    })),
  );

  return { users, dimensions, scores, grades, skills, userSkills, sequence: 300 };
}

function scoreFor(userId: string, dimensionId: string, period: string, score: number): UserScoreItem {
  return {
    id: `score-${userId}-${dimensionId}-${period}`,
    userId,
    dimensionId,
    period,
    score: Math.min(98, score),
    comment: null,
    scoredById: "demo-user-producer",
    scoredAt: "2026-06-18T00:00:00.000Z",
  };
}

function nextSequence() {
  const state = getState();
  state.sequence += 1;
  return state.sequence;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
