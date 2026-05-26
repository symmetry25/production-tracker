const urlParams = new URLSearchParams(window.location.search);
const blankMode = ["1", "true", "yes"].includes((urlParams.get("blank") || "").toLowerCase());
const STORAGE_KEY = blankMode ? "crewProductionDashboardBlankDataV1" : "crewProductionDashboardDataV1";
const PROJECT_LIBRARY_KEY = blankMode ? "crewProductionDashboardBlankProjectsV1" : "crewProductionDashboardProjectsV1";
const DISPLAY_SETTINGS_KEY = "crewProductionDisplaySettingsV1";

const defaultProject = {
  title: "《临夏》短剧拍摄",
  budget: 2220000,
  currentDay: 8,
  plannedDays: 18,
  totalScenes: 64,
  totalPages: 118,
};

const blankProject = {
  title: "新项目",
  budget: 0,
  currentDay: 1,
  plannedDays: 1,
  totalScenes: 1,
  totalPages: 1,
};

const defaultProjectId = blankMode ? "blank-current" : "sample-current";

const defaultDepartments = [
  { id: "production", name: "制片组", budget: 226000, color: "#157a6e" },
  { id: "writing_creative", name: "编剧创意组", budget: 56000, color: "#7d6f55" },
  { id: "directing", name: "导演组", budget: 156000, color: "#2867b2" },
  { id: "cast", name: "演员选角组", budget: 140000, color: "#b25f7c" },
  { id: "camera", name: "摄影组", budget: 238000, color: "#c84c39" },
  { id: "dit", name: "DIT组", budget: 72000, color: "#4f7f9b" },
  { id: "grip", name: "器械轨道组", budget: 84000, color: "#6f6b63" },
  { id: "lighting", name: "灯光电工组", budget: 164000, color: "#c98a1c" },
  { id: "art", name: "美术组", budget: 160000, color: "#6b5aa6" },
  { id: "props", name: "道具组", budget: 68000, color: "#945f35" },
  { id: "costume", name: "服装组", budget: 88000, color: "#477a38" },
  { id: "makeup_hair", name: "化妆发型组", budget: 72000, color: "#b87949" },
  { id: "sound", name: "现场录音组", budget: 84000, color: "#173f52" },
  { id: "stunts_safety", name: "特技安全组", budget: 90000, color: "#9b3f35" },
  { id: "location_transport", name: "场地运输组", budget: 108000, color: "#567d3f" },
  { id: "post", name: "后期统筹组", budget: 62000, color: "#7b658c" },
  { id: "post_edit", name: "剪辑组", budget: 98000, color: "#3f6f7d" },
  { id: "post_sound", name: "后期声音组", budget: 68000, color: "#5a6e91" },
  { id: "vfx_color", name: "调色/VFX组", budget: 98000, color: "#7d4b72" },
  { id: "music", name: "音乐组", budget: 52000, color: "#8a743f" },
  { id: "publicity", name: "宣发组", budget: 36000, color: "#3f7d71" },
];

const departmentProfiles = {
  production: {
    summary: "制片、预算、合同、片场基层运转",
    roles: ["Producer 制片人", "Line Producer 执行制片人", "Production Manager 制片主任", "Assistant Production Manager 制片副主任", "Production Coordinator 制作协管", "Production Accountant 制作会计", "Production Assistant / PA 制片助理", "Craft Service 后勤"],
  },
  writing_creative: {
    summary: "故事、剧本、分镜和创意顾问",
    roles: ["Screenwriter 编剧", "Writer 作者", "Creator 原创", "Creative Consultant 创意顾问", "Storyboard Artist 故事版绘制师", "Layout Artist 布局师"],
  },
  directing: {
    summary: "导演执行、现场调度、通告单和拍摄秩序",
    roles: ["Director 导演", "1st Assistant Director 第一副导演", "2nd Assistant Director 第二副导演", "Second Second AD 副导演助理", "Second Unit Director 第二组导演", "Choreographer 舞蹈指导", "Script Supervisor 剧本监制 / 场记"],
  },
  cast: {
    summary: "演员、选角、群众、替身和文替管理",
    roles: ["Casting Director 选角导演", "Talent 演员", "Extra 群众演员", "Stand-In 文替", "Body Double 身替", "Double 替身"],
  },
  camera: {
    summary: "摄影指导、摄影机操作和摄影助理体系",
    roles: ["Director of Photography 摄影指导", "Cinematographer 电影摄影师", "Camera Operator 摄影机操作员", "Additional Camera 副机摄影师", "1st AC 第一摄影助理", "2nd AC 第二摄影助理", "Focus Puller 跟焦员", "Steadicam Operator 斯坦尼康", "Still Photographer 剧照"],
  },
  dit: {
    summary: "数字摄影机参数、素材管理和储存媒介",
    roles: ["Digital Imaging Technician / DIT 数字影像技师", "Camera Loader 胶片安装员", "Clapper-Loader 场记板操作员"],
  },
  grip: {
    summary: "轨道、器械、承托、搭建和片场体力支持",
    roles: ["Key Grip 器械师", "Best Boy Grip 副器械师", "Grip 器械工", "Dolly Grip 轨道操作员", "Rigger 搭建工", "Swing Gang 场工"],
  },
  lighting: {
    summary: "灯光设计、灯具执行和电力安全",
    roles: ["Gaffer 灯光师", "Best Boy Electric 副灯光师", "Lighting Technician 灯光工", "Electrician 电工", "Generator Wrangler 发电机整备员"],
  },
  art: {
    summary: "整体视觉、美术设计、场景搭建和置景",
    roles: ["Production Designer 美术指导", "Art Director 艺术总监", "Construction Coordinator 建筑总监", "Set Designer 置景设计", "Set Decorator 置景师", "Set Dresser 置景工"],
  },
  props: {
    summary: "道具采购、维护、摆放和特殊道具安全",
    roles: ["Property Master 道具师", "Property Assistant 道具助理", "Armorer 枪械师", "Wrangler 整备员"],
  },
  costume: {
    summary: "服饰设计、戏服管理、穿戴和现场维护",
    roles: ["Costume Designer 服饰设计师", "Costume Supervisor 服饰总监", "Costumer / Wardrobe 服饰师", "Wardrobe Supervisor 服饰总管", "Dresser 服装"],
  },
  makeup_hair: {
    summary: "化妆、发型和特殊化妆效果",
    roles: ["Makeup 化妆", "Hairstylist 发型师", "Special Makeup Artist 特效化妆师"],
  },
  sound: {
    summary: "现场收音、混音和话筒操作",
    roles: ["Sound Mixer 混音师", "Boom Operator 收音器操作员"],
  },
  stunts_safety: {
    summary: "动作、特技、医务和技术安全顾问",
    roles: ["Stunt Coordinator 特技指导", "Stunt Performer 特技演员", "Stunt Double 特技替身", "Stunt Driver 特技司机", "Set Medic 医务", "Technical Advisor 技术顾问"],
  },
  location_transport: {
    summary: "场地寻找、场地管理、车辆与运输调度",
    roles: ["Location Manager 场景管理", "Assistant Location Manager 执行场景管理", "Transportation Captain 运输总管", "Transportation Coordinator 运输协管", "Driver 司机"],
  },
  post: {
    summary: "后期流程、交付排期和部门协调",
    roles: ["Post-Production Supervisor 后期制作总监", "Post-Production Coordinator 后期制作协调", "Maintenance Engineer 维护工程师"],
  },
  post_edit: {
    summary: "素材整理、粗剪、精剪和剪辑管理",
    roles: ["Editor 剪辑", "Assistant Editor 助理剪辑"],
  },
  post_sound: {
    summary: "对白、音效、拟音和最终混录",
    roles: ["Dialogue Editor 对白编辑", "Sound Editor 音响剪辑", "Sound Effects Editor 音效剪辑", "Foley Artist 拟音师", "Re-recording Mixer 整合混音师", "Sound Designer 音响设计"],
  },
  vfx_color: {
    summary: "调色、合成、视觉特效和预视觉化",
    roles: ["Colorist 调色师", "Compositor 合成师", "Digital Compositor 数字合成师", "Visual Effects Supervisor 视觉特效总监", "Special Effects Supervisor 特效总监", "Previsualization Artist 预视觉化技术师"],
  },
  music: {
    summary: "音乐创作、指挥和配乐执行",
    roles: ["Composer 作曲", "Conductor 指挥", "Music 音乐"],
  },
  publicity: {
    summary: "宣传、市场物料和发行前沟通",
    roles: ["Publicity Director 宣传总监"],
  },
};

const defaultOnSetDepartmentIds = new Set([
  "production",
  "directing",
  "cast",
  "camera",
  "dit",
  "grip",
  "lighting",
  "sound",
  "art",
  "props",
  "costume",
  "makeup_hair",
  "location_transport",
]);

const legacyDepartmentNames = {
  art: ["美术道具"],
  costume: ["服化组"],
  post: ["后期预留"],
  lighting: ["灯光组"],
  sound: ["录音组"],
};

const legacyDepartmentBudgets = {
  art: [188000],
  costume: [120000],
  post: [104000],
};

const defaultPeople = [
  { name: "周闻", role: "执行制片", dept: "production", dayRate: 2200, days: 18, allowance: 5200 },
  { name: "许牧", role: "编剧顾问", dept: "writing_creative", dayRate: 1600, days: 8, allowance: 0 },
  { name: "林夏", role: "导演", dept: "directing", dayRate: 6200, days: 18, allowance: 0 },
  { name: "阿靖", role: "副导演", dept: "directing", dayRate: 1800, days: 18, allowance: 1800 },
  { name: "程婉", role: "选角导演", dept: "cast", dayRate: 1800, days: 6, allowance: 1000 },
  { name: "陈柏", role: "摄影指导", dept: "camera", dayRate: 5200, days: 18, allowance: 3600 },
  { name: "赵宁", role: "跟焦员", dept: "camera", dayRate: 1500, days: 18, allowance: 1800 },
  { name: "秦屿", role: "DIT / 数字影像技师", dept: "dit", dayRate: 1800, days: 18, allowance: 2200 },
  { name: "梁立", role: "Key Grip / 器械师", dept: "grip", dayRate: 2200, days: 18, allowance: 1800 },
  { name: "孟岩", role: "灯光师", dept: "lighting", dayRate: 3600, days: 18, allowance: 2800 },
  { name: "郭一", role: "美术指导", dept: "art", dayRate: 3100, days: 16, allowance: 2600 },
  { name: "陆升", role: "道具师", dept: "props", dayRate: 1600, days: 16, allowance: 1800 },
  { name: "唐棠", role: "造型指导", dept: "costume", dayRate: 2600, days: 16, allowance: 1600 },
  { name: "苏曼", role: "化妆发型师", dept: "makeup_hair", dayRate: 1800, days: 16, allowance: 1600 },
  { name: "孙哲", role: "录音师", dept: "sound", dayRate: 2400, days: 18, allowance: 1800 },
  { name: "罗胜", role: "特技指导", dept: "stunts_safety", dayRate: 2600, days: 4, allowance: 2000 },
  { name: "何启", role: "场地 / 运输协调", dept: "location_transport", dayRate: 1600, days: 18, allowance: 2400 },
  { name: "韩越", role: "后期制作统筹", dept: "post", dayRate: 1800, days: 10, allowance: 0 },
  { name: "简宁", role: "剪辑师", dept: "post_edit", dayRate: 2600, days: 12, allowance: 0 },
  { name: "方舟", role: "后期声音编辑", dept: "post_sound", dayRate: 1800, days: 8, allowance: 0 },
  { name: "邵青", role: "调色 / VFX 总监", dept: "vfx_color", dayRate: 2400, days: 8, allowance: 0 },
  { name: "岑白", role: "作曲", dept: "music", dayRate: 2200, days: 5, allowance: 0 },
  { name: "蒋禾", role: "宣传统筹", dept: "publicity", dayRate: 1500, days: 5, allowance: 0 },
];

const defaultEquipment = [
  { name: "A 机摄影套组", dept: "camera", daily: 6800, days: 18, deposit: 12000 },
  { name: "B 机轻量套组", dept: "camera", daily: 4200, days: 12, deposit: 8000 },
  { name: "无线图传与监视器", dept: "camera", daily: 1600, days: 18, deposit: 3000 },
  { name: "DIT 工作站与校色监看", dept: "dit", daily: 900, days: 18, deposit: 6000 },
  { name: "素材备份硬盘组", dept: "dit", daily: 0, days: 1, deposit: 18000 },
  { name: "轨道车与旗板器械", dept: "grip", daily: 1800, days: 12, deposit: 4000 },
  { name: "LED 灯光车", dept: "lighting", daily: 5200, days: 15, deposit: 8000 },
  { name: "发电车", dept: "lighting", daily: 2800, days: 10, deposit: 5000 },
  { name: "同期录音套装", dept: "sound", daily: 1600, days: 18, deposit: 3000 },
  { name: "主场景置景", dept: "art", daily: 0, days: 1, deposit: 46000 },
  { name: "道具消耗与仿真武器", dept: "props", daily: 600, days: 8, deposit: 6000 },
  { name: "服装采购与清洗", dept: "costume", daily: 0, days: 1, deposit: 38000 },
  { name: "化妆发型耗材", dept: "makeup_hair", daily: 500, days: 16, deposit: 5000 },
  { name: "车辆调度包", dept: "location_transport", daily: 3200, days: 18, deposit: 5000 },
  { name: "剪辑工作站", dept: "post_edit", daily: 1200, days: 12, deposit: 6000 },
  { name: "后期声音套件", dept: "post_sound", daily: 900, days: 8, deposit: 5000 },
  { name: "调色 / VFX 工作站", dept: "vfx_color", daily: 1200, days: 8, deposit: 8000 },
];

const defaultScenes = [
  { code: "01-03", title: "清晨车站重逢", location: "西站外景", pages: 8, status: "done", risk: "ok" },
  { code: "04-08", title: "旧宅争执", location: "老宅内景", pages: 12, status: "done", risk: "ok" },
  { code: "09-12", title: "医院夜谈", location: "医院走廊", pages: 9, status: "done", risk: "note" },
  { code: "13-18", title: "工厂追逐", location: "废旧厂区", pages: 15, status: "done", risk: "warning" },
  { code: "19-24", title: "雨夜告别", location: "河堤外景", pages: 11, status: "scheduled", risk: "warning" },
  { code: "25-31", title: "家族饭局", location: "餐厅内景", pages: 14, status: "scheduled", risk: "ok" },
  { code: "32-42", title: "派出所调查", location: "派出所内景", pages: 21, status: "scheduled", risk: "note" },
  { code: "43-54", title: "婚礼与冲突", location: "酒店宴会厅", pages: 19, status: "scheduled", risk: "warning" },
  { code: "55-64", title: "天台结尾", location: "天台外景", pages: 9, status: "scheduled", risk: "ok" },
];

const defaultCallSheets = [
  {
    day: 1,
    code: "CS-001",
    date: "2026-05-10",
    title: "开机与车站外景",
    location: "西站 / 周边街区",
    weather: "晴 24-31°C",
    callTime: "06:30",
    wrapTime: "18:30",
    scenes: ["01-03"],
    cast: "男女主、司机、群众 18 人",
    departments: ["production", "directing", "camera", "dit", "lighting", "sound", "costume"],
    extra: { meals: 88, vehicles: 7, rooms: 0, locationFee: 12000, misc: 5400 },
  },
  {
    day: 2,
    code: "CS-002",
    date: "2026-05-11",
    title: "车站补拍与街道",
    location: "西站 / 天桥",
    weather: "多云 22-29°C",
    callTime: "07:00",
    wrapTime: "19:00",
    scenes: ["01-03"],
    cast: "男女主、群众 12 人",
    departments: ["production", "directing", "camera", "dit", "lighting", "sound", "costume"],
    extra: { meals: 76, vehicles: 6, rooms: 0, locationFee: 8000, misc: 4200 },
  },
  {
    day: 3,
    code: "CS-003",
    date: "2026-05-12",
    title: "老宅内景",
    location: "主场景老宅",
    weather: "阴 21-27°C",
    callTime: "08:00",
    wrapTime: "20:30",
    scenes: ["04-08"],
    cast: "男女主、母亲、邻居",
    departments: ["production", "directing", "camera", "dit", "lighting", "sound", "art", "costume"],
    extra: { meals: 92, vehicles: 5, rooms: 4, locationFee: 6000, misc: 8800 },
  },
  {
    day: 4,
    code: "CS-004",
    date: "2026-05-13",
    title: "旧宅争执",
    location: "主场景老宅",
    weather: "阴 20-26°C",
    callTime: "08:00",
    wrapTime: "21:00",
    scenes: ["04-08"],
    cast: "男女主、父亲、母亲",
    departments: ["production", "directing", "camera", "dit", "lighting", "sound", "art", "costume"],
    extra: { meals: 94, vehicles: 5, rooms: 4, locationFee: 6000, misc: 7600 },
  },
  {
    day: 5,
    code: "CS-005",
    date: "2026-05-14",
    title: "医院夜谈",
    location: "医院走廊",
    weather: "小雨 19-24°C",
    callTime: "14:00",
    wrapTime: "02:00",
    scenes: ["09-12"],
    cast: "男女主、医生、护士 4 人",
    departments: ["production", "directing", "camera", "dit", "lighting", "sound", "art", "costume"],
    extra: { meals: 96, vehicles: 6, rooms: 6, locationFee: 18000, misc: 9200 },
  },
  {
    day: 6,
    code: "CS-006",
    date: "2026-05-15",
    title: "医院补拍与转场",
    location: "医院 / 厂区",
    weather: "多云 21-27°C",
    callTime: "10:00",
    wrapTime: "22:00",
    scenes: ["09-12", "13-18"],
    cast: "男女主、男二、医生",
    departments: ["production", "directing", "camera", "dit", "lighting", "sound", "art", "costume"],
    extra: { meals: 101, vehicles: 8, rooms: 6, locationFee: 15000, misc: 10800 },
  },
  {
    day: 7,
    code: "CS-007",
    date: "2026-05-16",
    title: "工厂追逐",
    location: "废旧厂区",
    weather: "晴 23-30°C",
    callTime: "07:30",
    wrapTime: "21:30",
    scenes: ["13-18"],
    cast: "男女主、反派、动作演员 6 人",
    departments: ["production", "directing", "camera", "dit", "lighting", "sound", "art", "costume"],
    extra: { meals: 118, vehicles: 10, rooms: 8, locationFee: 22000, misc: 16800 },
  },
  {
    day: 8,
    code: "CS-008",
    date: "2026-05-17",
    title: "工厂爆点与夜戏",
    location: "废旧厂区",
    weather: "阵雨 22-27°C",
    callTime: "13:30",
    wrapTime: "03:00",
    scenes: ["13-18", "19-24"],
    cast: "男女主、反派、特技组",
    departments: ["production", "directing", "camera", "dit", "lighting", "sound", "art", "costume"],
    extra: { meals: 126, vehicles: 11, rooms: 10, locationFee: 24000, misc: 23600 },
  },
  {
    day: 9,
    code: "CS-009",
    date: "2026-05-18",
    title: "河堤雨夜",
    location: "河堤外景",
    weather: "雨 20-25°C",
    callTime: "16:00",
    wrapTime: "04:00",
    scenes: ["19-24"],
    cast: "男女主、警察 2 人",
    departments: ["production", "directing", "camera", "dit", "lighting", "sound", "art", "costume"],
    extra: { meals: 108, vehicles: 9, rooms: 8, locationFee: 16000, misc: 15800 },
  },
  {
    day: 10,
    code: "CS-010",
    date: "2026-05-19",
    title: "餐厅饭局",
    location: "餐厅内景",
    weather: "晴 22-30°C",
    callTime: "09:00",
    wrapTime: "21:00",
    scenes: ["25-31"],
    cast: "主演 6 人、服务员 3 人",
    departments: ["production", "directing", "camera", "dit", "lighting", "sound", "art", "costume"],
    extra: { meals: 112, vehicles: 7, rooms: 6, locationFee: 14000, misc: 13200 },
  },
];

const fullDemoProject = {
  title: "《临夏》完整版测试剧组",
  demoPreset: "full",
  budget: 2220000,
  currentDay: 8,
  plannedDays: 18,
  totalScenes: 64,
  totalPages: 118,
};

const fullDemoPeople = [
  { name: "周闻", role: "Producer 制片人", dept: "production", vendor: "青禾影业制片中心", grade: "B", companyGrade: "B", dayRate: 2600, days: 18, allowance: 6800, trust: 88 },
  { name: "李岚", role: "Line Producer 执行制片人", dept: "production", vendor: "青禾影业制片中心", grade: "B", companyGrade: "B", dayRate: 3200, days: 18, allowance: 5200, trust: 86 },
  { name: "马晓", role: "Production Accountant 制作会计", dept: "production", vendor: "方圆财务外包", grade: "D", companyGrade: "C", dayRate: 1200, days: 18, allowance: 1200, trust: 81 },
  { name: "许牧", role: "Screenwriter 编剧", dept: "writing_creative", vendor: "浮光故事工作室", grade: "C", companyGrade: "C", dayRate: 1800, days: 10, allowance: 0, trust: 84 },
  { name: "林夏", role: "Director 导演", dept: "directing", vendor: "林夏导演工作室", grade: "A", companyGrade: "B", dayRate: 6200, days: 18, allowance: 0, trust: 91 },
  { name: "阿靖", role: "1st AD 第一副导演", dept: "directing", vendor: "个人 / 自由职业", grade: "C", companyGrade: "none", dayRate: 2200, days: 18, allowance: 2200, trust: 80 },
  { name: "赵荔", role: "2nd AD 第二副导演", dept: "directing", vendor: "个人 / 自由职业", grade: "D", companyGrade: "none", dayRate: 1300, days: 18, allowance: 1400, trust: 77 },
  { type: "actor", name: "沈知意", role: "主演", dept: "cast", characterName: "林晓雨", actorKind: "主演", vendor: "星河艺人经纪", grade: "A", companyGrade: "A", dayRate: 8800, days: 12, allowance: 18000, trust: 89 },
  { type: "actor", name: "顾南", role: "主演", dept: "cast", characterName: "陈砚", actorKind: "主演", vendor: "星河艺人经纪", grade: "A", companyGrade: "A", dayRate: 8200, days: 12, allowance: 16000, trust: 87 },
  { type: "actor", name: "唐棣", role: "配角", dept: "cast", characterName: "反派", actorKind: "配角", vendor: "北岸演员统筹", grade: "C", companyGrade: "C", dayRate: 2600, days: 8, allowance: 3200, trust: 79 },
  { type: "actor", name: "群众演员包", role: "群众演员", dept: "cast", characterName: "车站/餐厅/医院群演", actorKind: "群众演员", vendor: "北岸演员统筹", grade: "F", companyGrade: "C", dayRate: 650, days: 10, allowance: 5000, trust: 74 },
  { name: "陈柏", role: "Director of Photography 摄影指导", dept: "camera", vendor: "柏影摄影工作室", grade: "A", companyGrade: "B", dayRate: 5200, days: 18, allowance: 3600, trust: 90 },
  { name: "邹凡", role: "Camera Operator 摄影机操作员", dept: "camera", vendor: "柏影摄影工作室", grade: "C", companyGrade: "B", dayRate: 2100, days: 18, allowance: 1800, trust: 82 },
  { name: "赵宁", role: "1st AC 第一摄影助理 / 跟焦员", dept: "camera", vendor: "个人 / 自由职业", grade: "D", companyGrade: "none", dayRate: 1500, days: 18, allowance: 1800, trust: 78 },
  { name: "秦屿", role: "Digital Imaging Technician / DIT 数字影像技师", dept: "dit", vendor: "像素河 DIT 服务", grade: "C", companyGrade: "C", dayRate: 1900, days: 18, allowance: 2400, trust: 85 },
  { name: "梁立", role: "Key Grip 器械师", dept: "grip", vendor: "力点器械队", grade: "C", companyGrade: "C", dayRate: 2300, days: 18, allowance: 2200, trust: 82 },
  { name: "孟岩", role: "Gaffer 灯光师", dept: "lighting", vendor: "北斗灯光工程", grade: "B", companyGrade: "B", dayRate: 3600, days: 18, allowance: 2800, trust: 88 },
  { name: "魏强", role: "Best Boy Electric 副灯光师", dept: "lighting", vendor: "北斗灯光工程", grade: "D", companyGrade: "B", dayRate: 1500, days: 18, allowance: 1200, trust: 80 },
  { name: "郭一", role: "Production Designer 美术指导", dept: "art", vendor: "一间美术制作", grade: "B", companyGrade: "B", dayRate: 3300, days: 16, allowance: 3600, trust: 83 },
  { name: "陶林", role: "Art Director 艺术总监", dept: "art", vendor: "一间美术制作", grade: "C", companyGrade: "B", dayRate: 2200, days: 16, allowance: 2400, trust: 80 },
  { name: "陆升", role: "Property Master 道具师", dept: "props", vendor: "东仓道具库", grade: "D", companyGrade: "C", dayRate: 1600, days: 16, allowance: 1800, trust: 76 },
  { name: "唐棠", role: "Costume Designer 服饰设计师", dept: "costume", vendor: "白鲸服化工作室", grade: "C", companyGrade: "C", dayRate: 2600, days: 16, allowance: 1800, trust: 84 },
  { name: "苏曼", role: "Makeup / Hairstylist 化妆发型师", dept: "makeup_hair", vendor: "白鲸服化工作室", grade: "D", companyGrade: "C", dayRate: 1800, days: 16, allowance: 1600, trust: 82 },
  { name: "孙哲", role: "Sound Mixer 混音师", dept: "sound", vendor: "声场同期录音", grade: "C", companyGrade: "C", dayRate: 2400, days: 18, allowance: 1800, trust: 85 },
  { name: "罗胜", role: "Stunt Coordinator 特技指导", dept: "stunts_safety", vendor: "凌跃动作安全", grade: "C", companyGrade: "C", dayRate: 2800, days: 5, allowance: 3000, trust: 78 },
  { name: "何启", role: "Location Manager 场景管理", dept: "location_transport", vendor: "城景场地服务", grade: "D", companyGrade: "C", dayRate: 1600, days: 18, allowance: 2600, trust: 81 },
  { name: "韩越", role: "Post-Production Supervisor 后期制作总监", dept: "post", vendor: "云桥后期统筹", grade: "C", companyGrade: "C", dayRate: 2200, days: 10, allowance: 0, trust: 83 },
  { name: "简宁", role: "Editor 剪辑", dept: "post_edit", vendor: "云桥后期统筹", grade: "C", companyGrade: "C", dayRate: 2600, days: 12, allowance: 0, trust: 84 },
  { name: "方舟", role: "Sound Designer 音响设计", dept: "post_sound", vendor: "回声后期声音", grade: "D", companyGrade: "C", dayRate: 1900, days: 8, allowance: 0, trust: 80 },
  { name: "邵青", role: "Colorist 调色师 / VFX 总监", dept: "vfx_color", vendor: "蓝线调色棚", grade: "C", companyGrade: "B", dayRate: 2600, days: 8, allowance: 0, trust: 86 },
  { name: "岑白", role: "Composer 作曲", dept: "music", vendor: "白昼音乐制作", grade: "C", companyGrade: "C", dayRate: 2400, days: 5, allowance: 0, trust: 82 },
  { name: "蒋禾", role: "Publicity Director 宣传总监", dept: "publicity", vendor: "晴岛宣发", grade: "D", companyGrade: "C", dayRate: 1500, days: 5, allowance: 0, trust: 75 },
];

const fullDemoEquipment = [
  { name: "ARRI Alexa Mini LF A机套组", dept: "camera", vendor: "赤兔摄影器材", companyGrade: "A", daily: 7800, days: 18, deposit: 16000, trust: 90 },
  { name: "Sony Venice B机轻量套组", dept: "camera", vendor: "赤兔摄影器材", companyGrade: "A", daily: 4600, days: 12, deposit: 9000, trust: 90 },
  { name: "Cooke S4/i 镜头组", dept: "camera", vendor: "赤兔摄影器材", companyGrade: "A", daily: 5200, days: 16, deposit: 18000, trust: 89 },
  { name: "无线图传与导演监视器", dept: "camera", vendor: "云台影像租赁", companyGrade: "B", daily: 1800, days: 18, deposit: 4000, trust: 84 },
  { name: "DIT 工作站与校色监看", dept: "dit", vendor: "像素河 DIT 服务", companyGrade: "C", daily: 1200, days: 18, deposit: 7000, trust: 85 },
  { name: "素材备份硬盘组", dept: "dit", vendor: "像素河 DIT 服务", companyGrade: "C", daily: 0, days: 1, deposit: 22000, trust: 85 },
  { name: "轨道车 / Scorpio 小摇臂", dept: "grip", vendor: "力点器械队", companyGrade: "C", daily: 2600, days: 12, deposit: 6000, trust: 82 },
  { name: "旗板器械与苹果箱", dept: "grip", vendor: "力点器械队", companyGrade: "C", daily: 900, days: 18, deposit: 3000, trust: 82 },
  { name: "LED 灯光车", dept: "lighting", vendor: "北斗灯光工程", companyGrade: "B", daily: 5600, days: 15, deposit: 9000, trust: 88 },
  { name: "发电车", dept: "lighting", vendor: "星火电力保障", companyGrade: "C", daily: 3000, days: 10, deposit: 5000, trust: 76 },
  { name: "同期录音套装", dept: "sound", vendor: "声场同期录音", companyGrade: "C", daily: 1800, days: 18, deposit: 3500, trust: 85 },
  { name: "老宅主场景搭建", dept: "art", vendor: "一间美术制作", companyGrade: "B", daily: 0, days: 1, deposit: 56000, trust: 83 },
  { name: "医院 / 派出所置景包", dept: "art", vendor: "一间美术制作", companyGrade: "B", daily: 0, days: 1, deposit: 38000, trust: 83 },
  { name: "仿真武器与特殊道具", dept: "props", vendor: "东仓道具库", companyGrade: "C", daily: 800, days: 8, deposit: 9000, trust: 76 },
  { name: "服装采购与清洗", dept: "costume", vendor: "白鲸服化工作室", companyGrade: "C", daily: 0, days: 1, deposit: 42000, trust: 84 },
  { name: "化妆发型耗材", dept: "makeup_hair", vendor: "白鲸服化工作室", companyGrade: "C", daily: 600, days: 16, deposit: 6000, trust: 82 },
  { name: "主创商务车与制片车包", dept: "location_transport", vendor: "快马影视车辆", companyGrade: "C", daily: 3600, days: 18, deposit: 6000, trust: 80 },
  { name: "剪辑工作站", dept: "post_edit", vendor: "云桥后期统筹", companyGrade: "C", daily: 1200, days: 12, deposit: 7000, trust: 84 },
  { name: "后期声音套件", dept: "post_sound", vendor: "回声后期声音", companyGrade: "C", daily: 900, days: 8, deposit: 5000, trust: 80 },
  { name: "调色 / VFX 工作站", dept: "vfx_color", vendor: "蓝线调色棚", companyGrade: "B", daily: 1400, days: 8, deposit: 9000, trust: 86 },
];

const fullDemoProductionVendors = {
  meals: [
    { label: "青麦片场餐饮", weight: 0.7 },
    { label: "夜戏热餐补给", weight: 0.3 },
  ],
  vehicles: [
    { label: "快马影视车辆", weight: 0.58 },
    { label: "同城货运调度", weight: 0.25 },
    { label: "临时司机 / 个人", weight: 0.17 },
  ],
  rooms: [
    { label: "云庭酒店", weight: 0.64 },
    { label: "安途商务酒店", weight: 0.36 },
  ],
  locationFee: [
    { label: "城景场地服务", weight: 0.5 },
    { label: "西站外联办", weight: 0.18 },
    { label: "仁和医院管理处", weight: 0.14 },
    { label: "旧厂区物业", weight: 0.18 },
  ],
  misc: [
    { label: "片场耗材采购", weight: 0.34 },
    { label: "临时搬运 / 个人", weight: 0.24 },
    { label: "安保与保洁服务", weight: 0.22 },
    { label: "行政审批杂费", weight: 0.2 },
  ],
};

function productionVendorPool(category, sheet = {}) {
  const location = `${sheet.location || ""} ${sheet.title || ""}`;
  if (category === "locationFee") {
    if (/西站|天桥/.test(location)) return [{ label: "西站外联办", weight: 0.72 }, { label: "城景场地服务", weight: 0.28 }];
    if (/老宅/.test(location)) return [{ label: "主场景老宅业主", weight: 0.76 }, { label: "城景场地服务", weight: 0.24 }];
    if (/医院/.test(location)) return [{ label: "仁和医院管理处", weight: 0.72 }, { label: "城景场地服务", weight: 0.28 }];
    if (/厂区|工厂/.test(location)) return [{ label: "旧厂区物业", weight: 0.64 }, { label: "安保与保洁服务", weight: 0.36 }];
    if (/河堤/.test(location)) return [{ label: "河堤公园管理处", weight: 0.66 }, { label: "城景场地服务", weight: 0.34 }];
    if (/餐厅/.test(location)) return [{ label: "南巷餐厅场地", weight: 0.78 }, { label: "城景场地服务", weight: 0.22 }];
  }
  return fullDemoProductionVendors[category] || [{ label: productionDetailTypeLabel(category), weight: 1 }];
}

function splitProductionAmount(amount, category, sheet) {
  const total = Math.max(0, Math.round(Number(amount) || 0));
  if (total <= 0) return [];
  const pool = productionVendorPool(category, sheet);
  const weightTotal = pool.reduce((sum, item) => sum + (Number(item.weight) || 0), 0) || 1;
  let remaining = total;
  return pool
    .map((item, index) => {
      const value = index === pool.length - 1 ? remaining : Math.round((total * (Number(item.weight) || 0)) / weightTotal);
      remaining -= value;
      return {
        key: `production:${category}:${item.label}`,
        label: item.label,
        vendor: item.label,
        type: productionDetailTypeLabel(category),
        value,
        meta: sheet.title,
      };
    })
    .filter((detail) => detail.value > 0);
}

function buildProductionDetailsFromExtra(sheet) {
  const parts = productionCostPartsFromExtra(sheet);
  return Object.entries(parts).flatMap(([category, value]) => splitProductionAmount(value, category, sheet));
}

function buildFullDemoCallSheets() {
  return clone(defaultCallSheets).map((sheet) => ({
    ...sheet,
    productionDetails: buildProductionDetailsFromExtra(sheet),
  }));
}

function applyFullDemoData(options = {}) {
  const keepProjectId = Boolean(options.keepProjectId);
  const previousProjectId = currentProjectId;
  displaySettings.inputMode = "template";
  displaySettings.ratingEnabled = true;
  project = clone(fullDemoProject);
  departments = clone(defaultDepartments);
  people = clone(fullDemoPeople);
  equipment = clone(fullDemoEquipment);
  scenes = clone(defaultScenes);
  callSheets = buildFullDemoCallSheets();
  customProgressItems = [
    { id: "full-demo-progress-contracts", name: "合同归档", done: 18, target: 24, unit: "份" },
    { id: "full-demo-progress-invoices", name: "发票回收", done: 9, target: 18, unit: "张" },
    { id: "full-demo-progress-location", name: "场地审批", done: 7, target: 9, unit: "处" },
  ];
  currentProjectId = keepProjectId ? previousProjectId : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  lastSavedPersonId = "";
  lastPersonFeedback = null;
  professionalReportState.source = "local";
  professionalReportState.report = null;
  professionalReportState.updatedAt = "";
  professionalReportState.text = "";
  normalizeRatings();
}

let project = clone(blankMode ? blankProject : defaultProject);
let departments = blankMode ? blankDepartments() : clone(defaultDepartments);
let people = blankMode ? [] : clone(defaultPeople);
let equipment = blankMode ? [] : clone(defaultEquipment);
let scenes = blankMode ? [] : clone(defaultScenes);
let callSheets = blankMode ? [] : clone(defaultCallSheets);
let customProgressItems = [];
let currentProjectId = defaultProjectId;
let projectLibrary = [];

let displaySettings = {
  darkMode: false,
  colorBlindMode: false,
  language: "zh",
  ratingEnabled: true,
  inputMode: "template",
  customRoles: {},
  customDepartments: [],
};

const money = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("zh-CN");

const baseCategoryColors = {
  labor: "#2867b2",
  equipment: "#c84c39",
  production: "#157a6e",
};

const colorBlindCategoryColors = {
  labor: "#0072b2",
  equipment: "#d55e00",
  production: "#009e73",
};

const categoryNames = {
  labor: "人员",
  equipment: "器材",
  production: "生产",
};

const gradeOptions = ["none", "A", "B", "C", "D", "E", "F", "G"];
const ratedGradeOptions = gradeOptions.filter((grade) => grade !== "none");

const i18nText = {
  zh: {
    "app.title": "制片管理看板",
    "project.current": "当前项目",
    "project.new": "新建",
    "project.save": "保存",
    "project.rename": "命名",
    "project.delete": "删除",
    "project.refresh": "刷新",
    "action.export": "导出",
    "action.todayCallsheet": "今日通告",
    "nav.overview": "总览",
    "nav.analysis": "分析",
    "nav.personnel": "人员",
    "nav.equipment": "器材",
    "nav.callsheet": "通告单",
    "nav.budget": "预算",
    "nav.fundflow": "资金流",
    "nav.audit": "审查",
    "nav.progress": "进度",
    "nav.visuals": "图表",
    "nav.input": "录入",
    "input.title": "录入端",
    "preferences.title": "录入偏好",
    "preferences.subtitle": "电影模板或完全自定义录入",
    "preferences.language": "界面语言",
    "preferences.rating": "等级评分",
    "preferences.inputMode": "录入模式",
    "preferences.templateMode": "电影模板",
    "preferences.customMode": "完全自定义",
    "preferences.inputModeHintTemplate": "保留电影部门和岗位，也可追加自定义。",
    "preferences.inputModeHintCustom": "只显示你保存的自定义部门和岗位，电影默认项会从录入端隐藏。",
    "preferences.department": "自定义部门",
    "preferences.departmentName": "部门名称",
    "preferences.departmentBudget": "部门预算",
    "preferences.departmentPlaceholder": "例如：航拍组 / Drone Unit",
    "preferences.roleDepartment": "岗位所属部门",
    "preferences.roleName": "自定义岗位",
    "preferences.rolePlaceholder": "例如：航拍组长 / Drone Lead",
    "preferences.addDepartment": "保存部门",
    "preferences.addRole": "保存岗位",
    "preferences.emptyRoles": "还没有自定义部门或岗位，保存后会出现在录入端下拉里。",
    "preferences.deleteRole": "删除自定义岗位",
    "preferences.deleteDepartment": "删除自定义部门",
    "display.languageZh": "中文",
    "display.languageEn": "English",
    "display.colorBlind": "色盲",
    "display.standardColor": "标准色",
    "display.dark": "黑夜",
    "display.light": "白天",
    "import.title": "Excel / CSV 批量导入",
    "import.subtitle": "人员、器材、场次、通告单",
    "projectParams.title": "项目参数",
    "projectParams.subtitle": "实时重算",
    "projectParams.name": "项目名",
    "projectParams.budget": "总预算",
    "projectParams.currentDay": "当前天数",
    "projectParams.plannedDays": "计划天数",
    "projectParams.totalScenes": "总场次",
    "projectParams.totalPages": "总页数",
    "personnelInput.title": "人员开销",
    "personnelInput.subtitle": "人工成本",
    "personnelInput.name": "姓名",
    "personnelInput.department": "部门",
    "personnelInput.rolePreset": "分组岗位",
    "personnelInput.role": "职位",
    "personnelInput.vendor": "公司 / 供应商",
    "personnelInput.companyGrade": "公司等级",
    "personnelInput.personGrade": "人员等级",
    "personnelInput.dayRate": "日薪",
    "personnelInput.days": "工作天数",
    "personnelInput.allowance": "补贴",
    "personnelInput.trust": "信任评分",
    "personnelInput.addPerson": "加入人员",
    "personnelInput.export": "导出人员表",
  },
  en: {
    "app.title": "Production Budget Dashboard",
    "project.current": "Current Project",
    "project.new": "New",
    "project.save": "Save",
    "project.rename": "Rename",
    "project.delete": "Delete",
    "project.refresh": "Refresh",
    "action.export": "Export",
    "action.todayCallsheet": "Today Call Sheet",
    "nav.overview": "Overview",
    "nav.analysis": "Analysis",
    "nav.personnel": "Personnel",
    "nav.equipment": "Equipment",
    "nav.callsheet": "Call Sheet",
    "nav.budget": "Budget",
    "nav.fundflow": "Fund Flow",
    "nav.audit": "Audit",
    "nav.progress": "Progress",
    "nav.visuals": "Charts",
    "nav.input": "Input",
    "input.title": "Input",
    "preferences.title": "Input Preferences",
    "preferences.subtitle": "Film template or fully custom input",
    "preferences.language": "Language",
    "preferences.rating": "Grade Scoring",
    "preferences.inputMode": "Input Mode",
    "preferences.templateMode": "Film Template",
    "preferences.customMode": "Fully Custom",
    "preferences.inputModeHintTemplate": "Keep film departments and roles, with optional custom additions.",
    "preferences.inputModeHintCustom": "Only saved custom departments and roles appear in input controls.",
    "preferences.department": "Department",
    "preferences.departmentName": "Department Name",
    "preferences.departmentBudget": "Department Budget",
    "preferences.departmentPlaceholder": "Example: Drone Unit / Aerial Team",
    "preferences.roleDepartment": "Role Department",
    "preferences.roleName": "Custom Role",
    "preferences.rolePlaceholder": "Example: Drone Lead / Aerial Supervisor",
    "preferences.addDepartment": "Save Department",
    "preferences.addRole": "Save Role",
    "preferences.emptyRoles": "No custom departments or roles yet. Saved items will appear in input dropdowns.",
    "preferences.deleteRole": "Delete custom role",
    "preferences.deleteDepartment": "Delete custom department",
    "display.languageZh": "中文",
    "display.languageEn": "English",
    "display.colorBlind": "Colorblind",
    "display.standardColor": "Standard",
    "display.dark": "Dark",
    "display.light": "Light",
    "import.title": "Excel / CSV Import",
    "import.subtitle": "Personnel, equipment, scenes and call sheets",
    "projectParams.title": "Project Settings",
    "projectParams.subtitle": "Live recalculation",
    "projectParams.name": "Project Name",
    "projectParams.budget": "Total Budget",
    "projectParams.currentDay": "Current Day",
    "projectParams.plannedDays": "Planned Days",
    "projectParams.totalScenes": "Total Scenes",
    "projectParams.totalPages": "Total Pages",
    "personnelInput.title": "Personnel Cost",
    "personnelInput.subtitle": "Labor cost",
    "personnelInput.name": "Name",
    "personnelInput.department": "Department",
    "personnelInput.rolePreset": "Role Preset",
    "personnelInput.role": "Role",
    "personnelInput.vendor": "Company / Vendor",
    "personnelInput.companyGrade": "Company Grade",
    "personnelInput.personGrade": "Person Grade",
    "personnelInput.dayRate": "Day Rate",
    "personnelInput.days": "Work Days",
    "personnelInput.allowance": "Allowance",
    "personnelInput.trust": "Trust Score",
    "personnelInput.addPerson": "Add Person",
    "personnelInput.export": "Export Personnel",
  },
};

const gradeBenchmarks = {
  person: {
    A: { min: 5200, max: 9000 },
    B: { min: 3600, max: 5600 },
    C: { min: 2400, max: 3800 },
    D: { min: 1500, max: 2600 },
    E: { min: 900, max: 1700 },
    F: { min: 500, max: 1000 },
    G: { min: 0, max: 650 },
  },
  company: {
    A: { min: 7000, max: 12000 },
    B: { min: 5000, max: 8000 },
    C: { min: 3200, max: 5600 },
    D: { min: 1800, max: 3600 },
    E: { min: 900, max: 2000 },
    F: { min: 300, max: 1000 },
    G: { min: 0, max: 500 },
  },
};

const canvasRegistry = new Map();
const chartHitRegions = new WeakMap();
let chartTooltipElement = null;
const chartHeights = {
  budgetDonut: 270,
  dailyCostChart: 260,
  departmentChart: 270,
  categoryChart: 360,
  fundFlowChart: 500,
  fundFlowLargeChart: 760,
  progressChart: 260,
  editProgressChart: 360,
  visualExplorerChart: 430,
  analysisVisualChart: 430,
};

const chartMobileHeights = {
  fundFlowChart: 460,
  fundFlowLargeChart: 520,
};

const chartMinWidths = {
  fundFlowChart: { desktop: 860, compact: 260 },
  fundFlowLargeChart: { desktop: 1180, compact: 260 },
};

let visualState = {
  dataset: "daily",
  chart: "line",
};

let analysisVisualState = {
  dataset: "departments",
  chart: "horizontalBar",
};

let budgetShareState = {
  chart: "donut",
};

let auditState = {
  filter: "all",
};

let lastSavedPersonId = "";
let lastPersonFeedback = null;

const visualChartOptions = {
  daily: ["line", "area", "bar", "waterfall"],
  departments: ["bar", "horizontalBar", "donut", "pie", "rose", "treemap", "radar"],
  departmentBudget: ["donut", "pie", "rose", "bar", "horizontalBar", "treemap", "radar"],
  personnelShare: ["donut", "pie", "rose", "treemap", "bar", "horizontalBar", "radar"],
  categories: ["donut", "pie", "rose", "treemap", "bar", "sankey", "radar"],
  ratings: ["scatter", "bubble", "radar", "horizontalBar"],
  customProgress: ["bar", "horizontalBar", "radar", "donut", "pie", "rose"],
};

const visualChartLabels = {
  line: "折线图",
  area: "面积图",
  bar: "柱状图",
  horizontalBar: "条形图",
  donut: "环形图",
  pie: "饼图",
  rose: "玫瑰图",
  treemap: "矩形树图",
  waterfall: "瀑布图",
  scatter: "散点图",
  bubble: "气泡图",
  radar: "雷达图",
  sankey: "桑基图",
};

const chartTypeGuide = {
  line: { group: "趋势", use: "连续变化", detail: "适合看每日成本、进度或消耗率的走势。" },
  area: { group: "趋势", use: "累计感", detail: "在折线下填充面积，强调总量变化。" },
  waterfall: { group: "趋势", use: "增减过程", detail: "适合看从初始预算到最终成本的变化路径。" },
  bar: { group: "比较", use: "类别对比", detail: "适合比较部门、分类、人员或费用项的大小。" },
  horizontalBar: { group: "比较", use: "长名称", detail: "适合名称较长的部门、岗位、供应商。" },
  radar: { group: "比较", use: "多维评分", detail: "适合看多个对象在预算、进度、信任等维度的轮廓。" },
  scatter: { group: "分布", use: "相关性", detail: "适合看报价和信任评分之间的关系。" },
  bubble: { group: "分布", use: "多变量", detail: "用点的位置和大小同时表达金额、信任、等级。" },
  donut: { group: "构成", use: "占比", detail: "适合看预算或费用构成，保留中心信息位置。" },
  pie: { group: "构成", use: "少量分类", detail: "适合少量分类的占比展示。" },
  rose: { group: "构成", use: "突出差异", detail: "用半径强化各分类之间的大小差别。" },
  treemap: { group: "构成", use: "多分类占比", detail: "适合分类较多时看整体占比结构。" },
  sankey: { group: "关联", use: "资金流向", detail: "适合看预算、部门和用途之间的流动关系。" },
};

const chartGuideOrder = ["趋势", "比较", "分布", "构成", "关联"];

const aiProviderPresets = {
  openai: { baseUrl: "https://api.openai.com/v1/chat/completions", model: "gpt-5-mini" },
  deepseek: { baseUrl: "https://api.deepseek.com/chat/completions", model: "deepseek-v4-flash" },
  qwen: { baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", model: "qwen-plus" },
  doubao: { baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions", model: "doubao-seed-1-6-250615" },
  moonshot: { baseUrl: "https://api.moonshot.cn/v1/chat/completions", model: "kimi-k2.6" },
  zhipu: { baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions", model: "glm-5.1" },
  gemini: { baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", model: "gemini-3-flash-preview" },
  claude: { baseUrl: "https://api.anthropic.com/v1/messages", model: "claude-haiku-4-5" },
  custom: { baseUrl: "", model: "" },
};

const spreadsheetImportState = {
  workbook: null,
  sheetNames: [],
  rows: [],
  parsed: [],
  target: "auto",
  mapping: {},
};

let xlsxLoadPromise = null;

const professionalReportState = {
  source: "local",
  report: null,
  updatedAt: "",
  text: "",
};

const aiConfigState = {
  provider: "openai",
  baseUrl: aiProviderPresets.openai.baseUrl,
  model: aiProviderPresets.openai.model,
  apiKey: "",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function blankDepartments() {
  return clone(defaultDepartments).map((department) => ({ ...department, budget: 0 }));
}

function createProjectSnapshot(id = currentProjectId, name = project.title) {
  return {
    id,
    name: name || "未命名项目",
    updatedAt: new Date().toISOString(),
    data: {
      project: clone(project),
      departments: clone(departments),
      people: clone(people),
      equipment: clone(equipment),
      scenes: clone(scenes),
      callSheets: clone(callSheets),
      customProgressItems: clone(customProgressItems),
    },
  };
}

function normalizeProjectSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return null;
  const data = snapshot.data || snapshot;
  const projectData = data.project || {};
  const id = snapshot.id || `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    id,
    name: snapshot.name || projectData.title || "未命名项目",
    updatedAt: snapshot.updatedAt || new Date().toISOString(),
    data: {
      project: { ...(blankMode ? blankProject : defaultProject), ...projectData },
      departments: Array.isArray(data.departments) ? data.departments : blankMode ? blankDepartments() : clone(defaultDepartments),
      people: Array.isArray(data.people) ? data.people : [],
      equipment: Array.isArray(data.equipment) ? data.equipment : [],
      scenes: Array.isArray(data.scenes) ? data.scenes : [],
      callSheets: Array.isArray(data.callSheets) ? data.callSheets : [],
      customProgressItems: normalizeCustomProgressItems(data.customProgressItems),
    },
  };
}

function applyProjectSnapshot(snapshot) {
  const normalized = normalizeProjectSnapshot(snapshot);
  if (!normalized) return false;
  currentProjectId = normalized.id;
  project = clone(normalized.data.project);
  departments = clone(normalized.data.departments);
  people = clone(normalized.data.people);
  equipment = clone(normalized.data.equipment);
  scenes = clone(normalized.data.scenes);
  callSheets = clone(normalized.data.callSheets);
  customProgressItems = clone(normalized.data.customProgressItems);
  lastSavedPersonId = "";
  lastPersonFeedback = null;
  professionalReportState.source = "local";
  professionalReportState.report = null;
  professionalReportState.updatedAt = "";
  professionalReportState.text = "";
  ensureReferenceData();
  normalizeRatings();
  return true;
}

function removeCurrentProject() {
  if (projectLibrary.length <= 1) {
    applyNewProjectData();
    ensureReferenceData();
    normalizeRatings();
    projectLibrary = [];
    currentProjectId = `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    upsertCurrentProject();
    persistProjectLibrary();
    localStorage.removeItem(STORAGE_KEY);
    saveData();
    return "已删除并重建空白项目";
  }
  const nextIndex = Math.max(0, projectLibrary.findIndex((item) => item.id === currentProjectId) - 1);
  projectLibrary = projectLibrary.filter((item) => item.id !== currentProjectId);
  const nextSnapshot = projectLibrary[nextIndex] || projectLibrary[0];
  if (nextSnapshot) {
    applyProjectSnapshot(nextSnapshot);
  } else {
    applyNewProjectData();
    ensureReferenceData();
    normalizeRatings();
    upsertCurrentProject();
  }
  persistProjectLibrary();
  saveData();
  return `已删除项目：${project.title || "未命名项目"}`;
}

function reloadCurrentProject() {
  const snapshot = projectLibrary.find((item) => item.id === currentProjectId);
  if (!snapshot) {
    loadSavedData();
    return "当前项目不存在，已重新加载";
  }
  applyProjectSnapshot(snapshot);
  saveData();
  return `已刷新项目：${project.title || snapshot.name}`;
}

function loadProjectLibrary() {
  try {
    const raw = localStorage.getItem(PROJECT_LIBRARY_KEY);
    const saved = raw ? JSON.parse(raw) : [];
    projectLibrary = Array.isArray(saved) ? saved.map(normalizeProjectSnapshot).filter(Boolean) : [];
  } catch (error) {
    console.warn("项目库读取失败，已使用当前项目。", error);
    projectLibrary = [];
  }
}

function persistProjectLibrary() {
  try {
    localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(projectLibrary));
  } catch (error) {
    console.warn("项目库保存失败，当前数据仍会保存在当前浏览器。", error);
  }
}

function upsertCurrentProject() {
  const snapshot = createProjectSnapshot(currentProjectId, project.title);
  const index = projectLibrary.findIndex((item) => item.id === currentProjectId);
  if (index >= 0) {
    projectLibrary[index] = snapshot;
  } else {
    projectLibrary.push(snapshot);
  }
  persistProjectLibrary();
  setProjectLibraryStatus(`已保存 · ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`);
  return snapshot;
}

function renderProjectLibraryControls() {
  const select = document.querySelector("#projectLibrarySelect");
  if (!select) return;
  if (!projectLibrary.some((item) => item.id === currentProjectId)) {
    upsertCurrentProject();
  }
  select.innerHTML = projectLibrary
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name || item.data?.project?.title || "未命名项目")}</option>`)
    .join("");
  select.value = currentProjectId;
  if (!document.querySelector("#projectLibraryStatus")?.textContent.trim()) {
    setProjectLibraryStatus("本机保存");
  }
}

function loadDisplaySettings() {
  try {
    const raw = localStorage.getItem(DISPLAY_SETTINGS_KEY);
  if (raw) {
      displaySettings = { ...displaySettings, ...JSON.parse(raw) };
    }
  } catch (error) {
    displaySettings = { darkMode: false, colorBlindMode: false, language: "zh", ratingEnabled: true, inputMode: "template", customRoles: {}, customDepartments: [] };
  }
  normalizeDisplaySettings();
  applyDisplaySettings();
}

function saveDisplaySettings() {
  try {
    localStorage.setItem(DISPLAY_SETTINGS_KEY, JSON.stringify(displaySettings));
  } catch (error) {
    console.warn("显示模式保存失败，当前切换仍会立即生效。", error);
  }
}

function normalizeDisplaySettings() {
  displaySettings.language = displaySettings.language === "en" ? "en" : "zh";
  displaySettings.ratingEnabled = displaySettings.ratingEnabled !== false;
  displaySettings.inputMode = displaySettings.inputMode === "custom" ? "custom" : "template";
  const rawCustomDepartments = Array.isArray(displaySettings.customDepartments) ? displaySettings.customDepartments : [];
  displaySettings.customDepartments = rawCustomDepartments
    .map((department, index) => ({
      id: String(department?.id || "").trim(),
      name: String(department?.name || "").trim(),
      budget: Math.max(0, Number(department?.budget) || 0),
      color: department?.color || palette(defaultDepartments.length + index),
    }))
    .filter((department) => department.id && department.name);
  displaySettings.customRoles = displaySettings.customRoles && typeof displaySettings.customRoles === "object" && !Array.isArray(displaySettings.customRoles) ? displaySettings.customRoles : {};
  Object.keys(displaySettings.customRoles).forEach((departmentId) => {
    const knownDepartment = inputDepartments({ includeTemplate: true }).some((department) => department.id === departmentId);
    if (!knownDepartment) {
      delete displaySettings.customRoles[departmentId];
      return;
    }
    displaySettings.customRoles[departmentId] = Array.from(
      new Set((Array.isArray(displaySettings.customRoles[departmentId]) ? displaySettings.customRoles[departmentId] : []).map((role) => String(role || "").trim()).filter(Boolean)),
    );
    if (displaySettings.customRoles[departmentId].length === 0) {
      delete displaySettings.customRoles[departmentId];
    }
  });
}

function translate(key) {
  return i18nText[displaySettings.language]?.[key] || i18nText.zh[key] || key;
}

function renderLanguageText() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = translate(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", translate(node.dataset.i18nPlaceholder));
  });
  document.documentElement.lang = displaySettings.language === "en" ? "en" : "zh-CN";
}

function isRatingEnabled() {
  return displaySettings.ratingEnabled !== false;
}

function isCustomInputMode() {
  return displaySettings.inputMode === "custom";
}

function modeText(templateText, customText) {
  return isCustomInputMode() ? customText : templateText;
}

function budgetUnitLabel() {
  return modeText("部门", "分类");
}

function budgetBudgetLabel() {
  return `${budgetUnitLabel()}预算`;
}

function setText(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

function setSelectOptionText(selector, value, text) {
  const option = document.querySelector(`${selector} option[value="${value}"]`);
  if (option) option.textContent = text;
}

function setPlaceholder(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.setAttribute("placeholder", text);
}

function normalizeCustomProgressItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const target = Math.max(0, Number(item?.target) || 0);
      const done = Math.max(0, Number(item?.done) || 0);
      return {
        id: String(item?.id || `custom-progress-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`),
        name: String(item?.name || "").trim(),
        done,
        target,
        unit: String(item?.unit || "").trim() || "项",
      };
    })
    .filter((item) => item.name && item.target > 0);
}

function languageLabel() {
  return displaySettings.language === "en" ? translate("display.languageEn") : translate("display.languageZh");
}

function setLanguageMode(language) {
  displaySettings.language = language === "en" ? "en" : "zh";
  applyDisplaySettings();
  saveDisplaySettings();
  renderInputPreferences();
  setFormStatus(displaySettings.language === "en" ? "Language switched" : "语言已切换", "good");
}

function applyDisplaySettings() {
  document.documentElement.classList.toggle("dark-mode", Boolean(displaySettings.darkMode));
  document.documentElement.classList.toggle("colorblind-mode", Boolean(displaySettings.colorBlindMode));
  document.documentElement.classList.toggle("rating-disabled", !isRatingEnabled());
  document.documentElement.classList.toggle("custom-input-mode", isCustomInputMode());
  const darkButton = document.querySelector("#toggleDarkMode");
  const colorButton = document.querySelector("#toggleColorBlindMode");
  const languageButtons = document.querySelectorAll("[data-language-toggle]");
  const ratingButton = document.querySelector("#ratingEnabledButton");
  const ratingLabel = document.querySelector("#ratingEnabledLabel");
  const inputModeButtons = document.querySelectorAll("[data-input-mode]");
  const inputModeHint = document.querySelector("#inputModeHint");
  if (darkButton) {
    darkButton.setAttribute("aria-pressed", String(Boolean(displaySettings.darkMode)));
    const label = darkButton.querySelector("span");
    if (label) label.textContent = displaySettings.darkMode ? translate("display.light") : translate("display.dark");
  }
  if (colorButton) {
    colorButton.setAttribute("aria-pressed", String(Boolean(displaySettings.colorBlindMode)));
    const label = colorButton.querySelector("span");
    if (label) label.textContent = displaySettings.colorBlindMode ? translate("display.standardColor") : translate("display.colorBlind");
  }
  languageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(displaySettings.language === "en"));
    const label = button.querySelector("[data-language-label]");
    if (label) label.textContent = languageLabel();
  });
  if (ratingButton) {
    ratingButton.setAttribute("aria-pressed", String(isRatingEnabled()));
  }
  if (ratingLabel) {
    ratingLabel.textContent = isRatingEnabled() ? (displaySettings.language === "en" ? "On" : "已开启") : (displaySettings.language === "en" ? "Off" : "已关闭");
  }
  inputModeButtons.forEach((button) => {
    const active = button.dataset.inputMode === displaySettings.inputMode;
    button.setAttribute("aria-pressed", String(active));
  });
  if (inputModeHint) {
    inputModeHint.dataset.i18n = isCustomInputMode() ? "preferences.inputModeHintCustom" : "preferences.inputModeHintTemplate";
    inputModeHint.textContent = translate(inputModeHint.dataset.i18n);
  }
  renderLanguageText();
  renderModeSpecificUi();
}

function activeCategoryColor(key) {
  return (displaySettings.colorBlindMode ? colorBlindCategoryColors : baseCategoryColors)[key] || palette(0);
}

function activeDepartmentColor(department, index = 0) {
  if (!displaySettings.colorBlindMode) return department.color || palette(index);
  return palette(index);
}

function semanticColor(type) {
  const isDark = Boolean(displaySettings.darkMode);
  const standard = {
    teal: isDark ? "#35c2ad" : "#157a6e",
    blue: isDark ? "#7aa7ff" : "#2867b2",
    red: isDark ? "#ff7968" : "#c84c39",
    amber: isDark ? "#f6bd4f" : "#c98a1c",
    green: isDark ? "#8fce73" : "#477a38",
    violet: isDark ? "#b59cff" : "#6b5aa6",
    deep: isDark ? "#335f78" : "#173f52",
    ink: isDark ? "#f2f0e9" : "#232323",
    muted: isDark ? "#a7a398" : "#6f6b63",
    grid: isDark ? "#313a43" : "#e8e0d2",
    track: isDark ? "#2a323b" : "#e8e0d2",
    surface: isDark ? "#20262d" : "#fffdf8",
  };
  const accessible = {
    teal: isDark ? "#00d19a" : "#009e73",
    blue: isDark ? "#66bfff" : "#0072b2",
    red: isDark ? "#ff9b45" : "#d55e00",
    amber: isDark ? "#ffd166" : "#e69f00",
    green: isDark ? "#7ad7ff" : "#56b4e9",
    violet: isDark ? "#f0a6d9" : "#cc79a7",
    deep: isDark ? "#2f668a" : "#173f52",
    ink: isDark ? "#f2f0e9" : "#232323",
    muted: isDark ? "#a7a398" : "#6f6b63",
    grid: isDark ? "#313a43" : "#d6d0c5",
    track: isDark ? "#2a323b" : "#e8e0d2",
    surface: isDark ? "#20262d" : "#fffdf8",
  };
  return (displaySettings.colorBlindMode ? accessible : standard)[type] || standard[type] || type;
}

function alphaColor(type, alpha) {
  const color = semanticColor(type);
  const match = color.match(/^#([0-9a-f]{6})$/i);
  if (!match) return color;
  const value = match[1];
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function loadSavedData() {
  let changed = false;
  let loadedCurrentData = false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      loadedCurrentData = true;
      currentProjectId = saved.currentProjectId || currentProjectId;
      project = { ...project, ...(saved.project || {}) };
      departments = saved.departments || departments;
      people = saved.people || people;
      equipment = saved.equipment || equipment;
      scenes = saved.scenes || scenes;
      callSheets = saved.callSheets || callSheets;
      customProgressItems = normalizeCustomProgressItems(saved.customProgressItems);
    }
  } catch (error) {
    console.warn("本地数据读取失败，已使用样例数据。", error);
  }
  if (!loadedCurrentData && projectLibrary.length > 0) {
    applyProjectSnapshot(projectLibrary[0]);
    saveData();
    return;
  }
  changed = ensureReferenceData() || changed;
  normalizeRatings();
  if (changed) saveData();
  upsertCurrentProject();
}

function applyStarterData(options = {}) {
  const keepProjectId = Boolean(options.keepProjectId);
  const previousProjectId = currentProjectId;
  project = clone(blankMode ? blankProject : defaultProject);
  departments = blankMode ? blankDepartments() : clone(defaultDepartments);
  people = blankMode ? [] : clone(defaultPeople);
  equipment = blankMode ? [] : clone(defaultEquipment);
  scenes = blankMode ? [] : clone(defaultScenes);
  callSheets = blankMode ? [] : clone(defaultCallSheets);
  customProgressItems = [];
  currentProjectId = keepProjectId ? previousProjectId : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  lastSavedPersonId = "";
  lastPersonFeedback = null;
  professionalReportState.source = "local";
  professionalReportState.report = null;
  professionalReportState.updatedAt = "";
  professionalReportState.text = "";
}

function applyNewProjectData(title = "新项目") {
  project = clone(blankProject);
  project.title = title || "新项目";
  departments = blankDepartments();
  people = [];
  equipment = [];
  scenes = [];
  callSheets = [];
  customProgressItems = [];
  currentProjectId = `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  lastSavedPersonId = "";
  lastPersonFeedback = null;
  professionalReportState.source = "local";
  professionalReportState.report = null;
  professionalReportState.updatedAt = "";
  professionalReportState.text = "";
}

function insertAfter(values, anchor, nextValue) {
  const result = values.filter((value) => value !== nextValue);
  const anchorIndex = result.indexOf(anchor);
  if (anchorIndex >= 0) {
    result.splice(anchorIndex + 1, 0, nextValue);
    return result;
  }
  result.push(nextValue);
  return result;
}

function ensureReferenceData() {
  let changed = false;
  normalizeDisplaySettings();

  defaultDepartments.forEach((defaultDepartment, defaultIndex) => {
    if (!departments.some((department) => department.id === defaultDepartment.id)) {
      const previousDefault = defaultDepartments[defaultIndex - 1];
      const insertIndex = previousDefault ? departments.findIndex((department) => department.id === previousDefault.id) + 1 : departments.length;
      departments.splice(insertIndex > 0 ? insertIndex : departments.length, 0, clone(defaultDepartment));
      changed = true;
    }
  });

  departments = departments.map((department) => {
    const defaultDepartment = defaultDepartments.find((item) => item.id === department.id);
    if (!defaultDepartment) return department;
    const legacyNames = legacyDepartmentNames[department.id] || [];
    const legacyBudgets = legacyDepartmentBudgets[department.id] || [];
    const shouldRefreshName = !department.name || legacyNames.includes(department.name);
    const shouldRefreshBudget = !Number.isFinite(Number(department.budget)) || (!blankMode && legacyBudgets.includes(Number(department.budget)));
    const nextDepartment = {
      ...department,
      name: shouldRefreshName ? defaultDepartment.name : department.name,
      color: department.color || defaultDepartment.color,
      budget: shouldRefreshBudget ? (blankMode ? 0 : defaultDepartment.budget) : Number(department.budget),
    };
    if (nextDepartment.name !== department.name || nextDepartment.color !== department.color || nextDepartment.budget !== department.budget) {
      changed = true;
    }
    return nextDepartment;
  });

  displaySettings.customDepartments.forEach((customDepartment) => {
    const existing = departments.find((department) => department.id === customDepartment.id);
    if (existing) {
      if (!existing.name || existing.name !== customDepartment.name) {
        existing.name = customDepartment.name;
        changed = true;
      }
      if (Number(existing.budget) !== Number(customDepartment.budget)) {
        existing.budget = Number(customDepartment.budget) || 0;
        changed = true;
      }
      if (!existing.color) {
        existing.color = customDepartment.color;
        changed = true;
      }
      return;
    }
    departments.push({
      id: customDepartment.id,
      name: customDepartment.name,
      budget: customDepartment.budget,
      color: customDepartment.color,
    });
    changed = true;
  });

  if ([1280000, 1352000].includes(project.budget)) {
    project.budget = defaultProject.budget;
    changed = true;
  }

  if (!blankMode && currentProjectId === defaultProjectId && project.demoPreset !== "full") {
    defaultPeople.forEach((defaultPerson) => {
      const hasDepartmentPerson = people.some((person) => person.dept === defaultPerson.dept);
      const hasSamePerson = people.some((person) => person.name === defaultPerson.name && person.role === defaultPerson.role);
      if (!hasDepartmentPerson && !hasSamePerson) {
        people.push(clone(defaultPerson));
        changed = true;
      }
    });

    defaultEquipment.forEach((defaultItem) => {
      if (!equipment.some((item) => item.name === defaultItem.name)) {
        equipment.push(clone(defaultItem));
        changed = true;
      }
    });
  }

  callSheets = callSheets.map((sheet) => {
    const sheetDepartments = Array.isArray(sheet.departments) ? sheet.departments : [];
    const expandedDepartments = expandCallsheetDepartments(sheetDepartments, sheet);
    if (expandedDepartments.join("|") === sheetDepartments.join("|")) {
      return { ...sheet, departments: sheetDepartments };
    }
    changed = true;
    return {
      ...sheet,
      departments: expandedDepartments,
    };
  });

  return changed;
}

function expandCallsheetDepartments(departmentIds, sheet = {}) {
  let result = [...departmentIds];
  const addAfter = (anchor, deptId, condition = true) => {
    if (condition && result.includes(anchor)) {
      result = insertAfter(result, anchor, deptId);
    }
  };
  addAfter("production", "location_transport");
  addAfter("directing", "cast");
  addAfter("camera", "dit");
  addAfter(result.includes("dit") ? "dit" : "camera", "grip");
  addAfter("art", "props");
  addAfter("costume", "makeup_hair");
  const actionText = `${sheet.title || ""} ${sheet.cast || ""}`;
  addAfter("props", "stunts_safety", /动作|特技|追逐|爆点|枪|械|武器|反派|打斗/.test(actionText));
  return result.filter((deptId) => departments.some((department) => department.id === deptId));
}

normalizeRatings();

function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentProjectId,
        project,
        departments,
        people,
        equipment,
        scenes,
        callSheets,
        customProgressItems,
      }),
    );
  } catch (error) {
    console.warn("本地保存失败，当前数据仍会保留在页面内存中。", error);
  }
  upsertCurrentProject();
  renderProjectLibraryControls();
}

function normalizeRatings() {
  people = people.map((person) => {
    const actor = isActorPerson(person);
    return {
      ...person,
      type: person.type || (actor ? "actor" : "crew"),
      characterName: person.characterName || "",
      actorKind: person.actorKind || (actor ? inferActorKind(person.role || person.characterName) : ""),
      vendor: person.vendor || "个人 / 自由职业",
      grade: person.grade === "none" ? "none" : normalizeGrade(person.grade || inferPersonGrade(person.dayRate)),
      companyGrade: person.companyGrade === "none" ? "none" : normalizeGrade(person.companyGrade || inferCompanyGrade(person.dayRate)),
      trust: normalizeTrust(person.trust),
    };
  });
  equipment = equipment.map((item) => ({
    ...item,
    vendor: item.vendor || "未登记公司",
    companyGrade: item.companyGrade === "none" ? "none" : normalizeGrade(item.companyGrade || inferCompanyGrade(item.daily)),
    trust: normalizeTrust(item.trust),
  }));
}

function inferPersonGrade(rate) {
  if (rate >= 5200) return "A";
  if (rate >= 3600) return "B";
  if (rate >= 2400) return "C";
  if (rate >= 1500) return "D";
  if (rate >= 900) return "E";
  if (rate >= 500) return "F";
  return "G";
}

function inferCompanyGrade(rate) {
  if (rate >= 7000) return "A";
  if (rate >= 5000) return "B";
  if (rate >= 3200) return "C";
  if (rate >= 1800) return "D";
  if (rate >= 900) return "E";
  if (rate >= 300) return "F";
  return "G";
}

function getDept(id) {
  return departments.find((department) => department.id === id) || { id, name: id || "未分组", budget: 0, color: "#6f6b63" };
}

function inputDepartments(options = {}) {
  const includeTemplate = typeof options.includeTemplate === "boolean" ? options.includeTemplate : !isCustomInputMode();
  const base = includeTemplate ? departments : [];
  const merged = [...base];
  displaySettings.customDepartments.forEach((customDepartment) => {
    if (!merged.some((department) => department.id === customDepartment.id)) {
      merged.push(customDepartment);
    }
  });
  return merged;
}

function firstInputDepartmentId() {
  return inputDepartments()[0]?.id || "";
}

function personTotal(person) {
  return person.dayRate * person.days + person.allowance;
}

function actorRoleLabel(kind = "演员") {
  const text = String(kind || "演员").trim();
  if (/主演/.test(text)) return "Talent 演员 / 主演";
  if (/配角/.test(text)) return "Talent 演员 / 配角";
  if (/特约/.test(text)) return "Talent 演员 / 特约";
  if (/群|extra/i.test(text)) return "Extra 群众演员";
  if (/文替|stand/i.test(text)) return "Stand-In 文替";
  if (/身替|body/i.test(text)) return "Body Double 身替";
  if (/特技演员|stunt performer/i.test(text)) return "Stunt Performer 特技演员";
  if (/特技替身|stunt double/i.test(text)) return "Stunt Double 特技替身";
  if (/替身|double/i.test(text)) return "Double 替身";
  if (/演员|talent/i.test(text)) return "Talent 演员";
  return `${text} 演员`;
}

function inferActorKind(value = "") {
  const text = String(value || "");
  if (/主演/.test(text)) return "主演";
  if (/配角/.test(text)) return "配角";
  if (/特约/.test(text)) return "特约演员";
  if (/群|extra/i.test(text)) return "群众演员";
  if (/文替|stand/i.test(text)) return "文替";
  if (/身替|body/i.test(text)) return "身替";
  if (/特技演员|stunt performer/i.test(text)) return "特技演员";
  if (/特技替身|stunt double/i.test(text)) return "特技替身";
  if (/替身|double/i.test(text)) return "替身";
  if (/演员|talent|艺人/i.test(text)) return "演员";
  return "";
}

function isActorPerson(person) {
  if (!person) return false;
  if (person.type === "actor") return true;
  if (person.characterName) return true;
  return Boolean(inferActorKind(person.role || person.actorKind || ""));
}

function personRoleDisplay(person) {
  if (!isActorPerson(person)) return person.role || "未填职位";
  const role = person.role || actorRoleLabel(person.actorKind || "演员");
  return person.characterName ? `${role} · ${person.characterName}` : role;
}

function equipmentTotal(item) {
  return item.daily * item.days + item.deposit;
}

function normalizeGrade(value) {
  const text = String(value || "").trim();
  if (["none", "无", "不评级", "未评级", "no", "n/a", "na", "-"].includes(text.toLowerCase())) return "none";
  const upper = text.toUpperCase();
  return ratedGradeOptions.includes(upper) ? upper : "D";
}

function gradeLabel(value, prefix = "") {
  const grade = normalizeGrade(value);
  return grade === "none" ? "无" : `${prefix}${grade}`;
}

function normalizeTrust(value) {
  const trust = Number(value);
  if (Number.isNaN(trust)) return 75;
  return Math.max(0, Math.min(100, trust));
}

function normalizeDepartmentName(value) {
  const text = String(value || "").trim();
  if (!text) return "production";
  const exact = departments.find((department) => department.id === text || department.name === text);
  if (exact) return exact.id;
  const lower = text.toLowerCase();
  const profileMatch = Object.entries(departmentProfiles).find(([id, profile]) => {
    const department = getDept(id);
    return department.name.includes(text) || text.includes(department.name.replace("组", "")) || profile.roles.some((role) => role.toLowerCase().includes(lower) || lower.includes(role.toLowerCase().split(" ")[0]));
  });
  if (profileMatch) return profileMatch[0];
  return "production";
}

function gradeBand(type, grade) {
  const normalized = normalizeGrade(grade);
  return gradeBenchmarks[type][normalized === "none" ? "D" : normalized];
}

function budgetFit(type, grade, rate) {
  if (!isRatingEnabled()) {
    return { label: "评分关闭", className: "ok", hint: "当前未启用等级评分" };
  }
  if (normalizeGrade(grade) === "none") {
    return { label: "不评级", className: "ok", hint: "该项选择不参与 A-G 等级判断" };
  }
  const band = gradeBand(type, grade);
  if (rate > band.max * 1.15) {
    return { label: "超标", className: "over", hint: `高于 ${gradeLabel(grade)} 级参考价` };
  }
  if (rate > band.max) {
    return { label: "偏高", className: "tight", hint: `接近 ${gradeLabel(grade)} 级上限` };
  }
  if (rate < band.min * 0.75) {
    return { label: "偏低", className: "tight", hint: "需确认质量或交付范围" };
  }
  return { label: "合理", className: "ok", hint: `符合 ${gradeLabel(grade)} 级参考价` };
}

function trustClass(score) {
  if (score >= 85) return "ok";
  if (score >= 65) return "tight";
  return "over";
}

function gradeSelect(name, selected = "D") {
  return `
    <select name="${name}">
      ${gradeOptions.map((grade) => `<option value="${grade}" ${grade === selected ? "selected" : ""}>${grade === "none" ? "无" : `${grade} 级`}</option>`).join("")}
    </select>
  `;
}

function ratingAlerts() {
  if (!isRatingEnabled()) return [];
  const personAlerts = people
    .map((person) => ({
      label: `${person.vendor || "个人 / 自由职业"} · ${person.name} · ${personRoleDisplay(person)}`,
      fit: budgetFit("person", person.grade, person.dayRate),
      companyFit: budgetFit("company", person.companyGrade, person.dayRate),
      trust: normalizeTrust(person.trust),
    }))
    .filter((item) => item.fit.className === "over" || item.companyFit.className === "over" || item.trust < 65);
  const companyAlerts = equipment
    .map((item) => ({
      label: `${item.vendor || "未登记公司"} · ${item.name}`,
      fit: budgetFit("company", item.companyGrade, item.daily),
      trust: normalizeTrust(item.trust),
    }))
    .filter((item) => item.fit.className === "over" || item.trust < 65);
  return [...personAlerts, ...companyAlerts];
}

function dayLaborCost(sheet) {
  return people
    .filter((person) => sheet.departments.includes(person.dept))
    .reduce((sum, person) => sum + person.dayRate, 0);
}

function dayEquipmentCost(sheet) {
  return equipment
    .filter((item) => sheet.departments.includes(item.dept) && item.daily > 0)
    .reduce((sum, item) => sum + item.daily, 0);
}

function productionCostPartsFromExtra(sheet) {
  const extra = { meals: 0, vehicles: 0, rooms: 0, locationFee: 0, misc: 0, ...(sheet?.extra || {}) };
  return {
    meals: extra.meals * 45,
    vehicles: extra.vehicles * 680,
    rooms: extra.rooms * 420,
    locationFee: extra.locationFee,
    misc: extra.misc,
  };
}

function productionDetailCategoryKey(detail) {
  const text = `${detail?.type || ""} ${detail?.label || ""} ${detail?.vendor || ""}`.toLowerCase();
  if (/餐|meal|food|catering|热餐/.test(text)) return "meals";
  if (/车|vehicle|transport|司机|货运/.test(text)) return "vehicles";
  if (/住|房|酒店|hotel|room/.test(text)) return "rooms";
  if (/场地|场租|location|物业|外联|管理处/.test(text)) return "locationFee";
  return "misc";
}

function productionDetailTypeLabel(key) {
  return {
    meals: "餐食",
    vehicles: "车辆",
    rooms: "住宿/酒店",
    locationFee: "场地",
    misc: "杂费",
  }[key] || "生产";
}

function normalizeProductionDetailRows(sheet, options = {}) {
  const useFallback = options.fallback !== false;
  const rawDetails = Array.isArray(sheet?.productionDetails) ? sheet.productionDetails : [];
  const detailedRows = rawDetails
    .map((detail, index) => {
      const value = Number(detail?.value) || 0;
      const category = productionDetailCategoryKey(detail);
      const label = String(detail?.label || detail?.vendor || productionDetailTypeLabel(category)).trim();
      return {
        key: String(detail?.key || `production:${category}:${label}:${index}`),
        label,
        vendor: String(detail?.vendor || label).trim(),
        type: String(detail?.type || productionDetailTypeLabel(category)).trim(),
        category,
        value,
        meta: String(detail?.meta || sheet?.title || "").trim(),
      };
    })
    .filter((detail) => detail.value > 0 && detail.label);

  if (detailedRows.length > 0 || !useFallback) return detailedRows;

  const parts = productionCostPartsFromExtra(sheet);
  return Object.entries(parts)
    .map(([key, value]) => ({
      key: `production:${key}`,
      label: productionDetailTypeLabel(key),
      vendor: productionDetailTypeLabel(key),
      type: productionDetailTypeLabel(key),
      category: key,
      value,
      meta: sheet?.title || "",
    }))
    .filter((detail) => detail.value > 0);
}

function dayProductionCost(sheet) {
  const parts = productionCostParts(sheet);
  return parts.meals + parts.vehicles + parts.rooms + parts.locationFee + parts.misc;
}

function productionCostParts(sheet) {
  return normalizeProductionDetailRows(sheet).reduce(
    (result, detail) => {
      const key = productionDetailCategoryKey(detail);
      result[key] += detail.value;
      return result;
    },
    { meals: 0, vehicles: 0, rooms: 0, locationFee: 0, misc: 0 },
  );
}

function dayTotal(sheet) {
  return dayLaborCost(sheet) + dayEquipmentCost(sheet) + dayProductionCost(sheet);
}

function completedSheets() {
  return callSheets.filter((sheet) => sheet.day <= project.currentDay);
}

function spentByCategory() {
  const labor = people.reduce((sum, person) => {
    const activeDays = Math.min(Number(person.days) || 0, project.currentDay);
    return sum + (Number(person.dayRate) || 0) * activeDays + ((Number(person.allowance) || 0) * activeDays) / Math.max(Number(person.days) || 1, 1);
  }, 0);
  const equipmentCost = equipment.reduce((sum, item) => {
    const activeDays = Math.min(Number(item.days) || 0, project.currentDay);
    return sum + (Number(item.daily) || 0) * activeDays + (Number(item.deposit) || 0);
  }, 0);
  const production = completedSheets().reduce((sum, sheet) => sum + dayProductionCost(sheet), 0);
  return {
    labor,
    equipment: equipmentCost,
    production,
  };
}

function totalSpent() {
  const categories = spentByCategory();
  return categories.labor + categories.equipment + categories.production;
}

function departmentSpentMap() {
  const spent = Object.fromEntries(activeBudgetDepartments().map((department) => [department.id, 0]));
  const completed = completedSheets();

  people.forEach((person) => {
    const activeDays = Math.min(person.days, project.currentDay);
    if (!Object.prototype.hasOwnProperty.call(spent, person.dept)) {
      spent[person.dept] = 0;
    }
    spent[person.dept] += person.dayRate * activeDays + (person.allowance * activeDays) / Math.max(person.days, 1);
  });

  equipment.forEach((item) => {
    const activeDays = Math.min(item.days, project.currentDay);
    if (!Object.prototype.hasOwnProperty.call(spent, item.dept)) {
      spent[item.dept] = 0;
    }
    spent[item.dept] += item.daily * activeDays + item.deposit;
  });

  completed.forEach((sheet) => {
    if (sheet.departments.length === 0) return;
    const productionCost = dayProductionCost(sheet);
    const share = productionCost / sheet.departments.length;
    sheet.departments.forEach((deptId) => {
      if (!Object.prototype.hasOwnProperty.call(spent, deptId)) {
        spent[deptId] = 0;
      }
      spent[deptId] += share;
    });
  });

  return spent;
}

function activeBudgetDepartments() {
  if (!isCustomInputMode()) return departments;
  return displaySettings.customDepartments
    .map((customDepartment) => departments.find((department) => department.id === customDepartment.id) || customDepartment)
    .filter((department) => department && department.id);
}

function activeBudgetDepartmentIds() {
  return new Set(activeBudgetDepartments().map((department) => department.id));
}

function completedSceneStats() {
  const doneScenes = scenes.filter((scene) => scene.status === "done");
  const pages = doneScenes.reduce((sum, scene) => sum + scene.pages, 0);
  const count = doneScenes.reduce((sum, scene) => sum + sceneCount(scene.code), 0);
  return { count, pages };
}

function customProgressRows() {
  customProgressItems = normalizeCustomProgressItems(customProgressItems);
  return customProgressItems.map((item, index) => {
    const done = Math.max(0, Number(item.done) || 0);
    const target = Math.max(0, Number(item.target) || 0);
    const rate = target > 0 ? Math.min(done / target, 1) : 0;
    return {
      ...item,
      done,
      target,
      rate,
      value: done,
      budget: target,
      label: item.name,
      status: `${formatProgressNumber(done)}/${formatProgressNumber(target)} ${item.unit}`,
      color: rate >= 1 ? semanticColor("teal") : rate >= 0.65 ? semanticColor("blue") : rate >= 0.35 ? semanticColor("amber") : semanticColor("red"),
    };
  });
}

function formatProgressNumber(value) {
  const numberValue = Number(value) || 0;
  return Number.isInteger(numberValue) ? number.format(numberValue) : numberValue.toFixed(1).replace(/\.0$/u, "");
}

function customProgressStats() {
  const rows = customProgressRows();
  const total = rows.reduce((sum, row) => sum + row.target, 0);
  const done = rows.reduce((sum, row) => sum + Math.min(row.done, row.target), 0);
  const rate = total > 0 ? done / total : 0;
  const top = rows.reduce((best, row) => (row.rate > (best?.rate ?? -1) ? row : best), null);
  const low = rows.reduce((worst, row) => (row.rate < (worst?.rate ?? 2) ? row : worst), null);
  return {
    mode: "custom",
    label: "自定义进度",
    rate,
    count: done,
    total,
    unit: "指标",
    rows,
    detailText: rows.length > 0 ? `已完成 ${formatProgressNumber(done)}/${formatProgressNumber(total)} 进度量 · ${rows.length} 项指标` : "暂无自定义进度项",
    top,
    low,
  };
}

function sceneProgressStats() {
  const stats = completedSceneStats();
  const rate = project.totalScenes > 0 ? stats.count / project.totalScenes : 0;
  return {
    mode: "scene",
    label: "拍摄进度",
    rate,
    count: stats.count,
    total: project.totalScenes,
    pages: stats.pages,
    totalPages: project.totalPages,
    unit: "场",
    rows: [],
    detailText: `已完成 ${stats.count}/${project.totalScenes} 场 · ${stats.pages}/${project.totalPages} 页`,
    stats,
  };
}

function activeProgressStats() {
  const customStats = customProgressStats();
  if (isCustomInputMode()) return customStats;
  return sceneProgressStats();
}

function sceneCount(code) {
  const [start, end] = code.split("-").map((value) => Number.parseInt(value, 10));
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 1;
  }
  return end - start + 1;
}

function riskDelta() {
  const spentRate = project.budget > 0 ? totalSpent() / project.budget : 0;
  const progressRate = activeProgressStats().rate;
  return spentRate - progressRate;
}

function analysisMetrics() {
  const spent = totalSpent();
  const progress = activeProgressStats();
  const stats = progress.stats || completedSceneStats();
  const spentRate = project.budget > 0 ? spent / project.budget : 0;
  const progressRate = progress.rate;
  const completed = completedSheets();
  const averageDayCost = completed.length > 0 ? Math.round(completed.reduce((sum, sheet) => sum + dayTotal(sheet), 0) / completed.length) : 0;
  const remainingDays = Math.max(0, project.plannedDays - project.currentDay);
  const projectedFinal = spent + averageDayCost * remainingDays;
  const variance = projectedFinal - project.budget;
  const delta = spentRate - progressRate;
  let health = { label: "健康", className: "good", summary: "预算和进度基本同步，项目处于可控区间。" };
  if (variance > 0) {
    health = { label: "高风险", className: "warning", summary: "完片预测已高于总预算，需尽快复核高成本部门和后续通告单。" };
  } else if (delta > 0.06 || variance > -project.budget * 0.03) {
    health = { label: "需关注", className: "note", summary: "项目仍可控，但预算消耗快于进度，后续排期需要更谨慎。" };
  }
  return {
    spent,
    spentRate,
    progressRate,
    averageDayCost,
    remainingDays,
    projectedFinal,
    variance,
    delta,
    health,
    stats,
    progress,
  };
}

function departmentAnalysisRows() {
  const spent = departmentSpentMap();
  return activeBudgetDepartments()
    .map((department) => {
      const used = spent[department.id] || 0;
      const rate = department.budget > 0 ? used / department.budget : 0;
      const remaining = department.budget - used;
      const statusClass = rate > 1 ? "over" : rate > 0.82 ? "tight" : "ok";
      const statusText = rate > 1 ? "超支" : rate > 0.82 ? "需关注" : "健康";
      return { department, used, rate, remaining, statusClass, statusText };
    })
    .sort((a, b) => b.rate - a.rate);
}

function peopleByDepartmentRows() {
  const knownDepartments = inputDepartments({ includeTemplate: true });
  const departmentMap = new Map(knownDepartments.map((department) => [department.id, department]));
  people.forEach((person) => {
    if (person.dept && !departmentMap.has(person.dept)) {
      departmentMap.set(person.dept, getDept(person.dept));
    }
  });
  return Array.from(departmentMap.values())
    .map((department, index) => {
      const members = people.filter((person) => person.dept === department.id);
      const total = members.reduce((sum, person) => sum + personTotal(person), 0);
      const averageTrust = isRatingEnabled() && members.length > 0 ? Math.round(members.reduce((sum, person) => sum + normalizeTrust(person.trust), 0) / members.length) : 0;
      return { department, members, total, averageTrust, color: activeDepartmentColor(department, index) };
    })
    .filter((row) => row.members.length > 0)
    .sort((a, b) => b.total - a.total);
}

function personnelShareRows() {
  const modeDepartments = inputDepartments({ includeTemplate: !isCustomInputMode() });
  const modeDepartmentIds = new Set(modeDepartments.map((department) => department.id));
  const rows = peopleByDepartmentRows()
    .filter((row) => row.total > 0)
    .map((row, index) => ({
      department: row.department,
      label: row.department.name,
      value: row.total,
      status: `${row.members.length} 人${isRatingEnabled() ? ` · 平均信任 ${row.averageTrust}` : ""}`,
      peopleCount: row.members.length,
      trust: isRatingEnabled() ? row.averageTrust : undefined,
      color: row.color || activeDepartmentColor(row.department, index),
    }));
  const modeRows = rows.filter((row) => modeDepartmentIds.has(row.department?.id || ""));
  return isCustomInputMode() && modeRows.length > 0 ? modeRows : rows;
}

function personnelSharePeopleCount() {
  return personnelShareRows().reduce((sum, row) => sum + (row.peopleCount || 0), 0);
}

function personnelShareTotalCost() {
  return personnelShareRows().reduce((sum, row) => sum + row.value, 0);
}

function equipmentByDepartmentRows() {
  return departments
    .map((department) => {
      const items = equipment.filter((item) => item.dept === department.id);
      const total = items.reduce((sum, item) => sum + equipmentTotal(item), 0);
      const averageTrust = isRatingEnabled() && items.length > 0 ? Math.round(items.reduce((sum, item) => sum + normalizeTrust(item.trust), 0) / items.length) : 0;
      return { department, items, total, averageTrust };
    })
    .filter((row) => row.items.length > 0)
    .sort((a, b) => b.total - a.total);
}

function resizeCanvas(canvas) {
  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();
  const isCompactViewport = window.innerWidth <= 720;
  const minWidthSetting = chartMinWidths[canvas.id] || 260;
  const minWidth = typeof minWidthSetting === "object" ? (isCompactViewport ? minWidthSetting.compact : minWidthSetting.desktop) : minWidthSetting;
  const targetWidth = Math.max(minWidth, Math.floor(rect.width - 36));
  const ratio = window.devicePixelRatio || 1;
  const cssHeight = isCompactViewport && chartMobileHeights[canvas.id] ? chartMobileHeights[canvas.id] : chartHeights[canvas.id] || 260;
  canvas.style.width = `${targetWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(targetWidth * ratio);
  canvas.height = Math.round(cssHeight * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width: targetWidth, height: cssHeight };
}

function registerChart(id, draw) {
  canvasRegistry.set(id, draw);
  draw();
}

function resetChartHits(canvas) {
  if (!canvas) return;
  chartHitRegions.set(canvas, []);
}

function addChartHit(canvas, region) {
  if (!canvas || !region?.tooltip) return;
  const regions = chartHitRegions.get(canvas) || [];
  regions.push(region);
  chartHitRegions.set(canvas, regions);
}

function chartTooltipTitle(row, fallback = "") {
  return row?.label || row?.name || fallback || "数据项";
}

function chartTooltipLines(row, total = 0, extras = []) {
  const lines = [];
  if (row?.unit) {
    if (Number.isFinite(row?.done) && Number.isFinite(row?.target)) lines.push(`完成：${formatProgressNumber(row.done)}/${formatProgressNumber(row.target)} ${row.unit}`);
    else if (Number.isFinite(row?.value)) lines.push(`数量：${formatProgressNumber(row.value)} ${row.unit}`);
  } else if (Number.isFinite(row?.value)) {
    lines.push(`金额：${money.format(row.value)}`);
  }
  if (Number.isFinite(row?.budget) && row.budget > 0 && !row?.unit) lines.push(`预算：${money.format(row.budget)}`);
  if (Number.isFinite(row?.rate)) lines.push(`${row?.unit ? "完成率" : "预算占用"}：${percentText(row.rate)}`);
  if (Number.isFinite(row?.trust)) lines.push(`信任评分：${row.trust}`);
  if (row?.grade) lines.push(`等级：${row.grade}${row.companyGrade ? ` / 公司${row.companyGrade}` : ""}`);
  if (row?.status) lines.push(`状态：${row.status}`);
  if (Number.isFinite(total) && total > 0 && Number.isFinite(row?.value)) lines.push(`占比：${percentText(row.value / total)}`);
  extras.filter(Boolean).forEach((line) => lines.push(line));
  return lines;
}

function makeChartTooltip(title, lines = []) {
  return { title, lines: lines.filter(Boolean) };
}

function pointHit(x, y, radius, tooltip) {
  return { type: "circle", x, y, radius, tooltip };
}

function rectHit(x, y, width, height, tooltip) {
  return { type: "rect", x, y, width, height, tooltip };
}

function arcHit(cx, cy, innerRadius, outerRadius, start, end, tooltip) {
  return { type: "arc", cx, cy, innerRadius, outerRadius, start, end, tooltip };
}

function normalizeAngle(angle) {
  const twoPi = Math.PI * 2;
  return ((angle % twoPi) + twoPi) % twoPi;
}

function angleWithin(angle, start, end) {
  const normalizedAngle = normalizeAngle(angle);
  const normalizedStart = normalizeAngle(start);
  const normalizedEnd = normalizeAngle(end);
  if (normalizedStart <= normalizedEnd) return normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd;
  return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd;
}

function hitContains(region, x, y) {
  if (region.type === "rect") return x >= region.x && x <= region.x + region.width && y >= region.y && y <= region.y + region.height;
  if (region.type === "circle") {
    const dx = x - region.x;
    const dy = y - region.y;
    return dx * dx + dy * dy <= region.radius * region.radius;
  }
  if (region.type === "arc") {
    const dx = x - region.cx;
    const dy = y - region.cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    return distance >= region.innerRadius && distance <= region.outerRadius && angleWithin(angle, region.start, region.end);
  }
  return false;
}

function ensureChartTooltip() {
  if (chartTooltipElement) return chartTooltipElement;
  chartTooltipElement = document.createElement("div");
  chartTooltipElement.className = "chart-tooltip";
  chartTooltipElement.setAttribute("role", "status");
  document.body.appendChild(chartTooltipElement);
  return chartTooltipElement;
}

function showChartTooltip(canvas, region, event) {
  const tooltip = ensureChartTooltip();
  const lines = region.tooltip.lines || [];
  tooltip.innerHTML = `
    <strong>${escapeHtml(region.tooltip.title)}</strong>
    ${lines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
  `;
  tooltip.classList.add("visible");
  const gap = 14;
  const width = tooltip.offsetWidth || 220;
  const height = tooltip.offsetHeight || 90;
  let left = event.clientX + gap;
  let top = event.clientY + gap;
  if (left + width > window.innerWidth - 10) left = event.clientX - width - gap;
  if (top + height > window.innerHeight - 10) top = event.clientY - height - gap;
  tooltip.style.left = `${Math.max(10, left)}px`;
  tooltip.style.top = `${Math.max(10, top)}px`;
  canvas.style.cursor = "crosshair";
}

function hideChartTooltip(canvas) {
  if (chartTooltipElement) chartTooltipElement.classList.remove("visible");
  if (canvas) canvas.style.cursor = "";
}

function handleChartPointerMove(event) {
  const canvas = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const regions = chartHitRegions.get(canvas) || [];
  const match = regions.findLast ? regions.findLast((region) => hitContains(region, x, y)) : [...regions].reverse().find((region) => hitContains(region, x, y));
  if (match) showChartTooltip(canvas, match, event);
  else hideChartTooltip(canvas);
}

function setupChartTooltips() {
  document.querySelectorAll("canvas").forEach((canvas) => {
    canvas.addEventListener("mousemove", handleChartPointerMove);
    canvas.addEventListener("mouseleave", () => hideChartTooltip(canvas));
    canvas.addEventListener("blur", () => hideChartTooltip(canvas));
  });
}

function clearChart(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = semanticColor("surface");
  ctx.fillRect(0, 0, width, height);
}

function drawText(ctx, text, x, y, options = {}) {
  ctx.fillStyle = options.color || semanticColor("ink");
  ctx.font = `${options.weight || 600} ${options.size || 13}px Inter, PingFang SC, sans-serif`;
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = options.baseline || "alphabetic";
  ctx.fillText(text, x, y);
}

function drawBudgetDonut() {
  const canvas = document.querySelector("#budgetDonut");
  const { ctx, width, height } = resizeCanvas(canvas);
  resetChartHits(canvas);
  clearChart(ctx, width, height);

  const spent = totalSpent();
  const progress = activeProgressStats();
  const budgetRate = project.budget > 0 ? spent / project.budget : 0;
  const progressRate = progress.rate;
  const budgetArc = Math.min(budgetRate, 1);
  const progressArc = Math.min(progressRate, 1);
  const cx = width / 2;
  const cy = height / 2 - 2;
  const radius = Math.min(width, height) * 0.33;
  const lineWidth = 18;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.strokeStyle = semanticColor("track");
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = riskDelta() > 0.12 ? semanticColor("red") : semanticColor("teal");
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * budgetArc);
  ctx.stroke();
  addChartHit(
    canvas,
    arcHit(
      cx,
      cy,
      radius - lineWidth / 2 - 6,
      radius + lineWidth / 2 + 6,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * budgetArc,
      makeChartTooltip("预算消耗", [`已用：${money.format(spent)}`, `总预算：${money.format(project.budget)}`, `占比：${percentText(budgetRate)}`]),
    ),
  );

  ctx.lineWidth = 13;
  ctx.strokeStyle = semanticColor("track");
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 31, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = semanticColor("blue");
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 31, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progressArc);
  ctx.stroke();
  addChartHit(
    canvas,
    arcHit(
      cx,
      cy,
      radius - 31 - 13 / 2 - 6,
      radius - 31 + 13 / 2 + 6,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * progressArc,
      makeChartTooltip(progress.label, [progress.detailText, `完成率：${percentText(progressRate)}`]),
    ),
  );

  drawText(ctx, `${Math.round(budgetRate * 100)}%`, cx, cy - 10, {
    size: 34,
    weight: 800,
    align: "center",
    baseline: "middle",
  });
  drawText(ctx, `完成 ${Math.round(progressRate * 100)}%`, cx, cy + 22, {
    size: 13,
    weight: 600,
    color: semanticColor("blue"),
    align: "center",
    baseline: "middle",
  });

  drawText(ctx, "外圈预算", 18, height - 26, { size: 12, weight: 700, color: riskDelta() > 0.12 ? semanticColor("red") : semanticColor("teal") });
  drawText(ctx, "内圈进度", width - 18, height - 26, { size: 12, weight: 700, color: semanticColor("blue"), align: "right" });
}

function drawDailyCostChart() {
  const canvas = document.querySelector("#dailyCostChart");
  const { ctx, width, height } = resizeCanvas(canvas);
  resetChartHits(canvas);
  clearChart(ctx, width, height);
  if (callSheets.length === 0) {
    drawText(ctx, "暂无通告单数据", width / 2, height / 2, {
      size: 15,
      weight: 800,
      color: semanticColor("muted"),
      align: "center",
      baseline: "middle",
    });
    return;
  }

  const padding = { top: 20, right: 18, bottom: 38, left: 58 };
  const values = callSheets.map((sheet) => dayTotal(sheet));
  const max = Math.max(...values) * 1.18;
  const min = Math.min(...values) * 0.88;
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  ctx.strokeStyle = semanticColor("grid");
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  const points = values.map((value, index) => {
    const x = values.length === 1 ? padding.left + plotW / 2 : padding.left + (plotW / (values.length - 1)) * index;
    const y = max === min ? padding.top + plotH / 2 : padding.top + plotH - ((value - min) / (max - min)) * plotH;
    return { x, y, value };
  });

  ctx.strokeStyle = semanticColor("teal");
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point, index) => {
    ctx.fillStyle = callSheets[index].day <= project.currentDay ? semanticColor("teal") : semanticColor("amber");
    ctx.beginPath();
    ctx.arc(point.x, point.y, callSheets[index].day === project.currentDay ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
    drawText(ctx, `D${callSheets[index].day}`, point.x, height - 12, {
      size: 11,
      weight: 700,
      color: semanticColor("muted"),
      align: "center",
    });
    addChartHit(
      canvas,
      pointHit(
        point.x,
        point.y,
        12,
        makeChartTooltip(`第 ${callSheets[index].day} 天 · ${callSheets[index].title}`, [
          `当日成本：${money.format(point.value)}`,
          `人工：${money.format(dayLaborCost(callSheets[index]))}`,
          `器材：${money.format(dayEquipmentCost(callSheets[index]))}`,
          `生产：${money.format(dayProductionCost(callSheets[index]))}`,
        ]),
      ),
    );
  });

  drawText(ctx, money.format(max), 8, padding.top + 8, { size: 11, weight: 600, color: semanticColor("muted") });
  drawText(ctx, money.format(min), 8, padding.top + plotH, { size: 11, weight: 600, color: semanticColor("muted") });
}

function drawDepartmentChart() {
  const canvas = document.querySelector("#departmentChart");
  const { ctx, width, height } = resizeCanvas(canvas);
  resetChartHits(canvas);
  clearChart(ctx, width, height);

  const spent = departmentSpentMap();
  const rows = activeBudgetDepartments()
    .map((department) => ({ ...department, spent: spent[department.id] }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6);
  if (isCustomInputMode() && rows.length === 0) {
    drawText(ctx, "暂无自定义分类", width / 2, height / 2 - 8, { align: "center", baseline: "middle", color: semanticColor("muted"), size: 15, weight: 900 });
    drawText(ctx, "先在录入偏好保存自定义部门/分类", width / 2, height / 2 + 18, { align: "center", baseline: "middle", color: semanticColor("muted"), size: 12, weight: 700 });
    return;
  }
  const max = Math.max(...rows.map((row) => row.spent), 1);
  const left = 82;
  const top = 22;
  const barH = 18;
  const gap = 18;
  const usableW = width - left - 28;

  rows.forEach((row, index) => {
    const y = top + index * (barH + gap);
    const barW = (row.spent / max) * usableW;
    drawText(ctx, row.name, 8, y + 14, { size: 12, weight: 700, color: semanticColor("muted") });
    ctx.fillStyle = semanticColor("track");
    roundRect(ctx, left, y, usableW, barH, 8);
    ctx.fill();
    ctx.fillStyle = activeDepartmentColor(row, index);
    roundRect(ctx, left, y, barW, barH, 8);
    ctx.fill();
    drawText(ctx, compactMoney(row.spent), left + barW + 8, y + 14, { size: 12, weight: 700, color: semanticColor("ink") });
    addChartHit(canvas, rectHit(left, y, Math.max(barW, 8), barH, makeChartTooltip(row.name, [`已用：${money.format(row.spent)}`, `${budgetBudgetLabel()}：${money.format(row.budget)}`, `占预算：${percentText(row.budget > 0 ? row.spent / row.budget : 0)}`])));
  });
}

function drawCategoryChart() {
  const canvas = document.querySelector("#categoryChart");
  const { ctx, width, height } = resizeCanvas(canvas);
  resetChartHits(canvas);
  clearChart(ctx, width, height);

  const rows = departmentBudgetRows();
  if (isCustomInputMode() && rows.length === 0) {
    drawText(ctx, "暂无自定义预算分类", width / 2, height / 2 - 8, { align: "center", baseline: "middle", color: semanticColor("muted"), size: 15, weight: 900 });
    drawText(ctx, "保存自定义部门/分类后，这里会显示预算占比。", width / 2, height / 2 + 18, { align: "center", baseline: "middle", color: semanticColor("muted"), size: 12, weight: 700 });
    return;
  }
  if (budgetShareState.chart === "donut") drawVisualDonut(ctx, width, height, rows, { valueLabel: "预算", canvas });
  if (budgetShareState.chart === "pie") drawVisualPie(ctx, width, height, rows, { valueLabel: "预算", canvas });
  if (budgetShareState.chart === "rose") drawVisualRose(ctx, width, height, rows, { valueLabel: "预算", canvas });
}

function departmentCostBreakdown(departmentId) {
  const completed = completedSheets();
  const labor = people
    .filter((person) => person.dept === departmentId)
    .reduce((sum, person) => {
      const activeDays = Math.min(person.days, project.currentDay);
      return sum + person.dayRate * activeDays + (person.allowance * activeDays) / Math.max(person.days, 1);
    }, 0);
  const equipmentCost = equipment
    .filter((item) => item.dept === departmentId)
    .reduce((sum, item) => {
      const activeDays = Math.min(item.days, project.currentDay);
      return sum + item.daily * activeDays + item.deposit;
    }, 0);
  const production = completed.reduce((sum, sheet) => {
    if (!sheet.departments.includes(departmentId) || sheet.departments.length === 0) return sum;
    return sum + dayProductionCost(sheet) / sheet.departments.length;
  }, 0);
  return { labor, equipment: equipmentCost, production };
}

function addFlowDetail(map, key, label, value, color, type, meta = "") {
  const amount = Number(value) || 0;
  if (amount <= 0) return;
  if (!map.has(key)) {
    map.set(key, { key, label, value: 0, color, type, meta });
  }
  const entry = map.get(key);
  entry.value += amount;
  if (meta && entry.meta && !entry.meta.split(" / ").includes(meta)) {
    const parts = [...entry.meta.split(" / "), meta].filter(Boolean);
    entry.meta = parts.slice(0, 3).join(" / ") + (parts.length > 3 ? ` / 等 ${parts.length} 项` : "");
  } else if (meta && !entry.meta) {
    entry.meta = meta;
  }
}

function departmentFlowDetailRows(departmentId) {
  const detailMap = new Map();
  people
    .filter((person) => person.dept === departmentId)
    .forEach((person) => {
      const activeDays = Math.min(person.days, project.currentDay);
      const value = person.dayRate * activeDays + (person.allowance * activeDays) / Math.max(person.days, 1);
      const label = person.vendor || "个人 / 自由职业";
      addFlowDetail(detailMap, `labor:${label}`, label, value, activeCategoryColor("labor"), "人员", person.name || personRoleDisplay(person));
    });
  equipment
    .filter((item) => item.dept === departmentId)
    .forEach((item) => {
      const activeDays = Math.min(item.days, project.currentDay);
      const value = item.daily * activeDays + item.deposit;
      const vendor = item.vendor || "未登记公司";
      addFlowDetail(detailMap, `equipment:${vendor}:${item.name}`, `${vendor} · ${item.name}`, value, activeCategoryColor("equipment"), "器材", item.daily > 0 ? `${item.days} 天` : "固定/押金");
    });
  completedSheets().forEach((sheet) => {
    if (!sheet.departments.includes(departmentId) || sheet.departments.length === 0) return;
    const factor = 1 / sheet.departments.length;
    normalizeProductionDetailRows(sheet).forEach((detail) => {
      const key = `production:${detail.category}:${detail.vendor || detail.label}`;
      addFlowDetail(detailMap, key, detail.vendor || detail.label, detail.value * factor, activeCategoryColor("production"), detail.type || "生产", sheet.title);
    });
  });
  return Array.from(detailMap.values()).sort((a, b) => b.value - a.value);
}

function fundFlowRows() {
  const spent = departmentSpentMap();
  return activeBudgetDepartments()
    .map((department, index) => {
      const budget = Number(department.budget) || 0;
      const used = spent[department.id] || 0;
      const breakdown = departmentCostBreakdown(department.id);
      return {
        department,
        color: activeDepartmentColor(department, index),
        value: Math.max(budget, used),
        budget,
        used,
        breakdown,
      };
    })
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function fundFlowData() {
  const activeDepartments = activeBudgetDepartments();
  const visibleDepartmentIds = new Set(activeDepartments.map((department) => department.id));
  const budgetRows = activeDepartments
    .map((department, index) => {
      const budget = Number(department.budget) || 0;
      const breakdown = departmentCostBreakdown(department.id);
      const used = breakdown.labor + breakdown.equipment + breakdown.production;
      return {
        department,
        color: activeDepartmentColor(department, index),
        budget,
        used,
        breakdown,
        details: departmentFlowDetailRows(department.id),
        value: budget,
      };
    })
    .filter((row) => row.budget > 0 || row.used > 0)
    .sort((a, b) => Math.max(b.budget, b.used) - Math.max(a.budget, a.used));

  const unclassifiedBreakdown = { labor: 0, equipment: 0, production: 0 };
  const unclassifiedDetails = new Map();
  people.forEach((person) => {
    if (visibleDepartmentIds.has(person.dept)) return;
    const activeDays = Math.min(person.days, project.currentDay);
    const value = person.dayRate * activeDays + (person.allowance * activeDays) / Math.max(person.days, 1);
    unclassifiedBreakdown.labor += value;
    const label = person.vendor || "个人 / 自由职业";
    addFlowDetail(unclassifiedDetails, `labor:${label}`, label, value, activeCategoryColor("labor"), "人员", person.name || personRoleDisplay(person));
  });
  equipment.forEach((item) => {
    if (visibleDepartmentIds.has(item.dept)) return;
    const activeDays = Math.min(item.days, project.currentDay);
    const value = item.daily * activeDays + item.deposit;
    unclassifiedBreakdown.equipment += value;
    const vendor = item.vendor || "未登记公司";
    addFlowDetail(unclassifiedDetails, `equipment:${vendor}:${item.name}`, `${vendor} · ${item.name}`, value, activeCategoryColor("equipment"), "器材", item.daily > 0 ? `${item.days} 天` : "固定/押金");
  });
  completedSheets().forEach((sheet) => {
    const addUnclassifiedProduction = () => {
      normalizeProductionDetailRows(sheet).forEach((detail) => {
        const key = `production:${detail.category}:${detail.vendor || detail.label}`;
        addFlowDetail(unclassifiedDetails, key, detail.vendor || detail.label, detail.value, activeCategoryColor("production"), detail.type || "生产", sheet.title);
      });
    };
    if (sheet.departments.length === 0) {
      unclassifiedBreakdown.production += dayProductionCost(sheet);
      addUnclassifiedProduction();
      return;
    }
    const visibleCount = sheet.departments.filter((departmentId) => visibleDepartmentIds.has(departmentId)).length;
    if (visibleCount > 0) return;
    unclassifiedBreakdown.production += dayProductionCost(sheet);
    addUnclassifiedProduction();
  });
  const unclassifiedUsed = unclassifiedBreakdown.labor + unclassifiedBreakdown.equipment + unclassifiedBreakdown.production;
  const usageRows = [
    ...budgetRows.filter((row) => row.used > 0),
    ...(unclassifiedUsed > 0
      ? [
          {
            department: { id: "unclassified", name: "未归类开销", budget: 0 },
            color: semanticColor("muted"),
            budget: 0,
            used: unclassifiedUsed,
            breakdown: unclassifiedBreakdown,
            details: Array.from(unclassifiedDetails.values()).sort((a, b) => b.value - a.value),
            value: unclassifiedUsed,
            unclassified: true,
          },
        ]
      : []),
  ].sort((a, b) => b.used - a.used);

  const allocatedTotal = budgetRows.reduce((sum, row) => sum + row.budget, 0);
  const usageTotal = usageRows.reduce((sum, row) => sum + row.used, 0);
  const sourceTotal = Math.max(project.budget || 0, allocatedTotal, usageTotal);
  const unallocated = Math.max(0, sourceTotal - allocatedTotal);
  const overAllocated = Math.max(0, allocatedTotal - sourceTotal);
  const topBudget = budgetRows[0] || null;
  const topUsage = usageRows[0] || null;

  return {
    budgetRows,
    usageRows,
    allocatedTotal,
    usageTotal,
    sourceTotal,
    unallocated,
    overAllocated,
    topBudget,
    topUsage,
  };
}

function drawFlowLink(ctx, x1, y1, x2, y2, width, color, alpha = 0.36) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, width);
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const cp = Math.max(36, Math.abs(x2 - x1) * 0.42);
  ctx.bezierCurveTo(x1 + cp, y1, x2 - cp, y2, x2, y2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawFundNode(ctx, node, color, options = {}) {
  ctx.fillStyle = color;
  roundRect(ctx, node.x, node.y, node.w, node.h, options.radius || 9);
  ctx.fill();
  drawText(ctx, node.label, node.x + 10, node.y + Math.min(22, node.h / 2), {
    color: "#fff",
    size: options.labelSize || 12,
    weight: 900,
  });
  if (node.valueText) {
    drawText(ctx, node.valueText, node.x + 10, node.y + Math.min(node.h - 8, 42), {
      color: "#fff",
      size: options.valueSize || 11,
      weight: 800,
    });
  }
}

function flowNodeHeights(rows, key, usableH, gap, minH = 18) {
  const values = rows.map((row) => Math.max(0, Number(row[key]) || 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  if (rows.length === 0) return [];
  const availableH = Math.max(minH * rows.length, usableH - gap * (rows.length - 1));
  if (total <= 0) return rows.map(() => Math.max(minH, availableH / rows.length));
  return values.map((value) => Math.max(minH, (value / total) * availableH));
}

function positionedFlowNodes(rows, key, x, w, top, usableH, gap, colorGetter) {
  const heights = flowNodeHeights(rows, key, usableH, gap);
  const totalH = heights.reduce((sum, value) => sum + value, 0) + Math.max(0, rows.length - 1) * gap;
  let y = top + Math.max(0, (usableH - totalH) / 2);
  return rows.map((row, index) => {
    const h = heights[index];
    const node = {
      row,
      x,
      y,
      w,
      h,
      cy: y + h / 2,
      color: colorGetter(row, index),
    };
    y += h + gap;
    return node;
  });
}

function aggregateFundRows(rows, key, limit, otherLabel) {
  const positiveRows = rows.filter((row) => (Number(row[key]) || 0) > 0);
  if (positiveRows.length <= limit) return positiveRows;
  const visible = positiveRows.slice(0, Math.max(1, limit - 1));
  const hidden = positiveRows.slice(Math.max(1, limit - 1));
  const aggregate = hidden.reduce(
    (result, row) => {
      result[key] += Number(row[key]) || 0;
      result.budget += Number(row.budget) || 0;
      result.used += Number(row.used) || 0;
      result.sourceValue += Number(row.sourceValue) || 0;
      result.breakdown.labor += Number(row.breakdown?.labor) || 0;
      result.breakdown.equipment += Number(row.breakdown?.equipment) || 0;
      result.breakdown.production += Number(row.breakdown?.production) || 0;
      result.details.push(...(Array.isArray(row.details) ? row.details : []));
      return result;
    },
    {
      department: { id: "other_flow", name: otherLabel },
      color: semanticColor("muted"),
      budget: 0,
      used: 0,
      sourceValue: 0,
      [key]: 0,
      breakdown: { labor: 0, equipment: 0, production: 0 },
      details: [],
    },
  );
  aggregate.details = aggregateDetails(aggregate.details, Math.max(4, limit), "其他明细");
  return [...visible, aggregate];
}

function aggregateDetails(details, limit = 10, otherLabel = "其他明细") {
  const positive = details.filter((detail) => (Number(detail.value) || 0) > 0).sort((a, b) => b.value - a.value);
  if (positive.length <= limit) return positive;
  const visible = positive.slice(0, Math.max(1, limit - 1));
  const hidden = positive.slice(Math.max(1, limit - 1));
  const hiddenTotal = hidden.reduce((sum, detail) => sum + detail.value, 0);
  return [
    ...visible,
    {
      key: "other-detail",
      label: otherLabel,
      value: hiddenTotal,
      color: semanticColor("muted"),
      type: "汇总",
      meta: `${hidden.length} 项`,
    },
  ];
}

function classifyFundDetail(detail) {
  if (detail.type === "人员") return { key: "labor", label: "人员", color: activeCategoryColor("labor") };
  if (detail.type === "器材") return { key: "equipment", label: "器材", color: activeCategoryColor("equipment") };
  return { key: "production", label: isCustomInputMode() ? "外部费用" : "生产", color: activeCategoryColor("production") };
}

function rowUsageDetails(row) {
  const details = Array.isArray(row.details) ? row.details : [];
  if (details.length > 0) return details;
  return [
    { key: `${row.department?.id || "row"}:labor`, label: "人员", value: row.breakdown?.labor || 0, color: activeCategoryColor("labor"), type: "人员" },
    { key: `${row.department?.id || "row"}:equipment`, label: "器材", value: row.breakdown?.equipment || 0, color: activeCategoryColor("equipment"), type: "器材" },
    { key: `${row.department?.id || "row"}:production`, label: isCustomInputMode() ? "外部费用" : "生产", value: row.breakdown?.production || 0, color: activeCategoryColor("production"), type: "生产" },
  ].filter((detail) => detail.value > 0);
}

function fundFlowDetailRows(limit = 80) {
  const data = fundFlowData();
  const usageRows = data.usageRows.length > 0 ? data.usageRows : data.budgetRows;
  const total = Math.max(data.usageTotal || usageRows.reduce((sum, row) => sum + row.used, 0), 1);
  return usageRows
    .flatMap((row) =>
      rowUsageDetails(row).map((detail) => ({
        department: row.department?.name || "未归类",
        departmentId: row.department?.id || "unclassified",
        type: detail.type || classifyFundDetail(detail).label,
        label: detail.label,
        meta: detail.meta || "",
        value: Number(detail.value) || 0,
        share: (Number(detail.value) || 0) / total,
      })),
    )
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function renderFundFlowDetailTable() {
  const body = document.querySelector("#fundFlowDetailTable");
  const insight = document.querySelector("#fundFlowDetailInsight");
  const badge = document.querySelector("#fundFlowPageBadge");
  if (!body) return;
  const rows = fundFlowDetailRows(240);
  const data = fundFlowData();
  const supplierCount = new Set(rows.map((row) => row.label)).size;
  if (insight) {
    insight.textContent = rows.length > 0 ? `${rows.length} 条明细 · ${supplierCount} 个公司/个人/明细` : "等待开销明细";
  }
  if (badge) {
    badge.textContent = `${money.format(data.usageTotal)} 已用 · ${supplierCount} 个去向`;
  }
  body.innerHTML =
    rows.length > 0
      ? rows
          .map(
            (row) => `
              <tr>
                <td><strong>${escapeHtml(row.department)}</strong></td>
                <td>${escapeHtml(row.type)}</td>
                <td>${escapeHtml(row.label)}</td>
                <td>${escapeHtml(row.meta || "--")}</td>
                <td>${money.format(row.value)}</td>
                <td>${percentText(row.share)}</td>
              </tr>
            `,
          )
          .join("")
      : `<tr><td colspan="6">暂无资金流向明细。载入完整版测试数据或录入人员、器材、通告单后会显示。</td></tr>`;
}

function auditRules() {
  const unitLabel = budgetUnitLabel();
  const rules = [
    { id: "budget_over", label: `${unitLabel}超支`, detail: `${unitLabel}已用金额超过预算，或接近 82% 以上需要复核。`, severity: "high" },
    { id: "rate_mismatch", label: "等级不匹配", detail: "人员/供应商报价偏离 A-G 级参考区间，需确认市场价。", severity: "medium" },
    { id: "trust_low", label: "信任偏低", detail: "信任评分低于 65 的人员或供应商，建议补充合同与历史合作记录。", severity: "medium" },
    { id: "missing_evidence", label: "凭证不足", detail: "金额较高但缺少合同、发票、报价单或审批说明的项目需要补证。", severity: "high" },
    { id: "callsheet_jump", label: "通告突增", detail: "单日通告总成本明显高于平均值，重点检查夜戏、转场和住宿。", severity: "medium" },
  ];
  return isRatingEnabled() ? rules : rules.filter((rule) => !["rate_mismatch", "trust_low"].includes(rule.id));
}

function auditReferenceItems() {
  const items = [];
  const spent = departmentSpentMap();
  const budgetDepartments = activeBudgetDepartments();
  const deptTotal = budgetDepartments.reduce((sum, department) => sum + (Number(department.budget) || 0), 0);
  const completed = completedSheets();
  const averageDayCost = completed.length > 0 ? completed.reduce((sum, sheet) => sum + dayTotal(sheet), 0) / completed.length : 0;
  const unitLabel = budgetUnitLabel();

  budgetDepartments.forEach((department) => {
    const budget = Number(department.budget) || 0;
    const used = spent[department.id] || 0;
    const rate = budget > 0 ? used / budget : 0;
    if (budget > 0 && (rate > 0.82 || used > budget)) {
      items.push({
        kind: `${unitLabel}预算`,
        name: department.name,
        source: `${unitLabel}汇总`,
        amount: used,
        status: rate > 1 ? "超支" : "临界",
        risk: rate > 1 ? "high" : "medium",
        evidence: used > 0 ? "已录预算 / 已用记录" : "缺少使用记录",
        reason: rate > 1 ? `已超出预算 ${money.format(used - budget)}` : `已用 ${percentText(rate)}，需关注剩余空间`,
      });
    }
  });

  people.forEach((person) => {
    const fit = budgetFit("person", person.grade, person.dayRate);
    const companyFit = budgetFit("company", person.companyGrade, person.dayRate);
    const trust = normalizeTrust(person.trust);
    const total = personTotal(person);
    const flags = [];
    if (isRatingEnabled() && (fit.className === "over" || companyFit.className === "over")) flags.push("等级偏离");
    if (isRatingEnabled() && trust < 65) flags.push("低信任");
    if (total >= 30000) flags.push("高额");
    if (!person.vendor || person.vendor === "个人 / 自由职业") flags.push("无公司");
    const needsEvidence = total >= 20000 || (isRatingEnabled() && (fit.className === "over" || companyFit.className === "over" || trust < 65));
    if (flags.length > 0 || needsEvidence) {
      items.push({
        kind: isActorPerson(person) ? "演员" : "人员",
        name: person.name || "未命名",
        source: `${getDept(person.dept).name} · ${person.vendor || "个人 / 自由职业"}`,
        amount: total,
        status: flags.join(" / ") || "待复核",
        risk: flags.includes("等级偏离") || flags.includes("低信任") ? "high" : "medium",
        evidence: needsEvidence ? (person.allowance > 0 ? "需补合同 / 报价 / 付款依据" : "基础报价可核") : "基础记录",
        reason: isRatingEnabled() ? `${fit.label}${companyFit.label !== fit.label ? `，公司${companyFit.label}` : ""}，信任 ${trust}` : `总成本 ${money.format(total)}，评分关闭`,
      });
    }
  });

  equipment.forEach((item) => {
    const fit = budgetFit("company", item.companyGrade, item.daily);
    const trust = normalizeTrust(item.trust);
    const total = equipmentTotal(item);
    const flags = [];
    if (isRatingEnabled() && fit.className === "over") flags.push("等级偏离");
    if (isRatingEnabled() && trust < 65) flags.push("低信任");
    if (total >= 25000) flags.push("高额");
    const needsEvidence = total >= 15000 || (isRatingEnabled() && (fit.className === "over" || trust < 65));
    if (flags.length > 0 || needsEvidence) {
      items.push({
        kind: "器材",
        name: item.name || "未命名器材",
        source: `${getDept(item.dept).name} · ${item.vendor || "未登记公司"}`,
        amount: total,
        status: flags.join(" / ") || "待复核",
        risk: flags.includes("等级偏离") || flags.includes("低信任") ? "high" : "medium",
        evidence: needsEvidence ? "需补合同 / 发票 / 租赁单" : "基础记录",
        reason: isRatingEnabled() ? `${fit.label}，信任 ${trust}` : `总成本 ${money.format(total)}，评分关闭`,
      });
    }
  });

  completed.forEach((sheet) => {
    const total = dayTotal(sheet);
    const avg = averageDayCost > 0 ? averageDayCost : total;
    if (total > avg * 1.25 || total > project.budget * 0.08) {
      items.push({
        kind: "通告单",
        name: `D${sheet.day} · ${sheet.title}`,
        source: sheet.location,
        amount: total,
        status: total > avg * 1.4 ? "高额" : "需关注",
        risk: total > avg * 1.4 ? "high" : "medium",
        evidence: sheet.extra.locationFee > 0 || sheet.extra.rooms > 0 ? "通告附件 / 场地单" : "基础通告",
        reason: `单日成本 ${money.format(total)}，高于平均值 ${money.format(Math.round(avg))}`,
      });
    }
  });

  if (deptTotal > 0 && project.budget > 0) {
    const allocationGap = project.budget - deptTotal;
    if (Math.abs(allocationGap) > project.budget * 0.02) {
      items.push({
        kind: "总预算",
        name: project.title || "当前项目",
        source: "总预算接口",
        amount: project.budget,
        status: allocationGap > 0 ? "未分配" : "超分配",
        risk: allocationGap < 0 ? "high" : "medium",
        evidence: "预算分配表",
        reason: allocationGap > 0 ? `仍有 ${money.format(allocationGap)} 未分配` : `${budgetBudgetLabel()}超出 ${money.format(Math.abs(allocationGap))}`,
      });
    }
  }

  return items.sort((a, b) => b.amount - a.amount);
}

function auditSummaryData() {
  const items = auditReferenceItems();
  const spentMap = departmentSpentMap();
  const budgetDepartments = activeBudgetDepartments();
  const highRiskCount = items.filter((item) => item.risk === "high").length;
  const mediumRiskCount = items.filter((item) => item.risk === "medium").length;
  const noEvidenceCount = items.filter((item) => /缺|需补/.test(item.evidence)).length;
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const reviewedAmount = items.filter((item) => item.risk === "high" || item.risk === "medium").reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const coverage = project.budget > 0 ? reviewedAmount / project.budget : 0;
  const topItem = items[0] || null;
  const rules = auditRules().map((rule) => ({
    ...rule,
    count:
      rule.id === "budget_over"
        ? budgetDepartments.filter((department) => {
            const used = spentMap[department.id] || 0;
            const budget = Number(department.budget) || 0;
            return budget > 0 && used / budget > 0.82;
          }).length
        : rule.id === "rate_mismatch"
          ? isRatingEnabled()
            ? people.filter((person) => budgetFit("person", person.grade, person.dayRate).className === "over" || budgetFit("company", person.companyGrade, person.dayRate).className === "over" || budgetFit("person", person.grade, person.dayRate).className === "tight" || budgetFit("company", person.companyGrade, person.dayRate).className === "tight").length + equipment.filter((item) => budgetFit("company", item.companyGrade, item.daily).className !== "ok").length
            : 0
          : rule.id === "trust_low"
            ? isRatingEnabled()
              ? [...people, ...equipment].filter((item) => normalizeTrust(item.trust) < 65).length
              : 0
            : rule.id === "missing_evidence"
              ? items.filter((item) => /需补|缺/.test(item.evidence)).length
              : rule.id === "callsheet_jump"
                ? items.filter((item) => item.kind === "通告单").length
                : 0,
  }));

  return {
    items,
    rules,
    highRiskCount,
    mediumRiskCount,
    noEvidenceCount,
    totalAmount,
    reviewedAmount,
    coverage,
    topItem,
  };
}

function auditRiskLabel(risk) {
  if (risk === "high") return "高风险";
  if (risk === "medium") return "待复核";
  return "提示";
}

function renderAuditModule() {
  const badge = document.querySelector("#auditHealthBadge");
  const summary = document.querySelector("#auditSummaryCards");
  const rules = document.querySelector("#auditRuleList");
  const table = document.querySelector("#auditTableBody");
  const brief = document.querySelector("#auditBrief");
  const coverage = document.querySelector("#auditCoverage");
  const listStatus = document.querySelector("#auditListStatus");
  if (!badge || !summary || !rules || !table || !brief || !coverage || !listStatus) return;

  const data = auditSummaryData();
  const topItem = data.topItem;
  const coverageText = project.budget > 0 ? `${Math.round(data.coverage * 100)}% 预算覆盖` : "无总预算";
  coverage.textContent = `${data.items.length} 项审查 · ${coverageText}`;
  listStatus.textContent = data.items.length > 0 ? `${data.highRiskCount} 项高风险 · ${data.noEvidenceCount} 项缺凭证` : "暂无风险项";
  badge.textContent = data.highRiskCount > 0 ? `${data.highRiskCount} 项高风险` : data.mediumRiskCount > 0 ? `${data.mediumRiskCount} 项待复核` : "审查稳定";
  badge.className = `status-pill ${data.highRiskCount > 0 ? "warning" : data.mediumRiskCount > 0 ? "note" : "good"}`;

  summary.innerHTML = `
    <div class="module-summary-card"><span>审查总项</span><strong>${data.items.length}</strong><small>${project.title || "当前项目"}</small></div>
    <div class="module-summary-card"><span>高风险项</span><strong>${data.highRiskCount}</strong><small>需立刻复核</small></div>
    <div class="module-summary-card"><span>缺凭证项</span><strong>${data.noEvidenceCount}</strong><small>合同 / 发票 / 报价单</small></div>
    <div class="module-summary-card"><span>覆盖金额</span><strong>${money.format(data.reviewedAmount)}</strong><small>${coverageText}</small></div>
  `;

  rules.innerHTML = data.rules
    .map(
      (rule) => `
        <div class="audit-rule-item ${rule.severity}">
          <strong>${escapeHtml(rule.label)}</strong>
          <span>${escapeHtml(rule.detail)}</span>
          <small>${rule.count} 项命中</small>
        </div>
      `,
    )
    .join("");

  const visibleItems = auditState.filter === "all" ? data.items : data.items.filter((item) => item.risk === auditState.filter);
  table.innerHTML = visibleItems
    .slice(0, 24)
    .map(
      (item) => `
        <tr>
          <td><span class="status-text ${item.risk === "high" ? "over" : "tight"}">${auditRiskLabel(item.risk)}</span></td>
          <td><strong>${escapeHtml(item.name)}</strong><div class="audit-item-meta">${escapeHtml(item.kind)} · ${escapeHtml(item.status)}</div></td>
          <td>${escapeHtml(item.source)}</td>
          <td>${money.format(item.amount)}</td>
          <td>${escapeHtml(item.reason)}</td>
          <td><span class="status-text ${/需补|缺/.test(item.evidence) ? "over" : "ok"}">${escapeHtml(item.evidence)}</span></td>
        </tr>
      `,
    )
    .join("");

  if (visibleItems.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="audit-empty">当前筛选下没有命中项，项目审查通过。</div>
        </td>
      </tr>
    `;
  }

  const topText = topItem
    ? `${auditRiskLabel(topItem.risk)} · ${topItem.name} · ${money.format(topItem.amount)}`
    : "暂无需审查项目";
  brief.innerHTML = `
    <div class="audit-brief-block">
      <strong>审查结论</strong>
      <p>${data.highRiskCount > 0 ? `当前有 ${data.highRiskCount} 个高风险项，优先处理超支、低信任和缺凭证内容。` : "当前没有明显高风险项，但仍建议保留凭证和报价复核。"}</p>
    </div>
    <div class="audit-brief-block">
      <strong>重点项</strong>
      <p>${escapeHtml(topText)}</p>
    </div>
    <div class="audit-brief-block">
      <strong>建议动作</strong>
      <p>${data.noEvidenceCount > 0 ? "先补合同、发票、报价单，再确认付款节点。" : "维持当前预算节奏，重点盯住通告单和高额部门。"}</p>
    </div>
  `;
}

function drawFundFlowChart() {
  const canvas = document.querySelector("#fundFlowChart");
  if (!canvas) return;
  drawFundFlowChartOnCanvas(canvas, { compactThreshold: 560, detailLimit: 12 });
}

function drawFundFlowLargeChart() {
  const canvas = document.querySelector("#fundFlowLargeChart");
  if (!canvas) return;
  drawFundFlowChartOnCanvas(canvas, { compactThreshold: 760, detailLimit: 22, large: true });
}

function drawFundFlowChartOnCanvas(canvas, options = {}) {
  const { ctx, width, height } = resizeCanvas(canvas);
  resetChartHits(canvas);
  clearChart(ctx, width, height);

  const data = fundFlowData();
  const large = Boolean(options.large);
  const detailLimit = options.detailLimit || (large ? 22 : 12);
  const insight = document.querySelector(large ? "#fundFlowLargeInsight" : "#fundFlowInsight");
  const summary = document.querySelector(large ? "#fundFlowLargeSummary" : "#fundFlowSummary");
  const hasFlowData = data.budgetRows.length > 0 || data.usageRows.length > 0;
  const unitLabel = budgetUnitLabel();
  const budgetLabel = budgetBudgetLabel();
  const unclassifiedUsed = data.usageRows.filter((row) => row.unclassified).reduce((sum, row) => sum + row.used, 0);
  const visibleUnallocatedSummary = Math.max(0, data.sourceTotal - data.allocatedTotal - unclassifiedUsed);
  const overAllocated = Math.max(0, data.allocatedTotal - Math.max(project.budget || 0, data.usageTotal));
  const usageRowsForSinks = data.usageRows.length > 0 ? data.usageRows : data.budgetRows;
  const sinkRows = [
    { key: "labor", label: "人员", value: usageRowsForSinks.reduce((sum, row) => sum + row.breakdown.labor, 0), color: activeCategoryColor("labor") },
    { key: "equipment", label: "器材", value: usageRowsForSinks.reduce((sum, row) => sum + row.breakdown.equipment, 0), color: activeCategoryColor("equipment") },
    { key: "production", label: isCustomInputMode() ? "外部费用" : "通告额外", value: usageRowsForSinks.reduce((sum, row) => sum + row.breakdown.production, 0), color: activeCategoryColor("production") },
  ].filter((row) => row.value > 0);
  const detailRows = aggregateDetails(usageRowsForSinks.flatMap((row) => rowUsageDetails(row)), width < 760 ? 7 : detailLimit, "其他公司/明细");
  const detailTotal = detailRows.reduce((sum, row) => sum + row.value, 0);

  if (insight) {
    insight.textContent = hasFlowData ? `预算分配 ${money.format(data.allocatedTotal)} · 实际已用 ${money.format(data.usageTotal)}` : "等待预算或开销数据";
  }

  if (summary) {
    const topBudget = data.topBudget;
    const topUsage = data.topUsage;
    summary.innerHTML = hasFlowData
      ? `
        <div><strong>${money.format(project.budget || data.sourceTotal)}</strong><span>总预算口径</span></div>
        <div><strong>${money.format(data.allocatedTotal)}</strong><span>${budgetLabel}合计</span></div>
        <div><strong>${money.format(data.usageTotal)}</strong><span>实际已用合计</span></div>
        <div><strong>${unclassifiedUsed > 0 ? `${compactMoney(unclassifiedUsed)} / ${compactMoney(visibleUnallocatedSummary)}` : overAllocated > 0 ? money.format(overAllocated) : visibleUnallocatedSummary > 0 ? money.format(visibleUnallocatedSummary) : "平衡"}</strong><span>${unclassifiedUsed > 0 ? "未归类已用 / 未分配" : overAllocated > 0 ? "超分配预算" : visibleUnallocatedSummary > 0 ? "未分配预算" : "预算状态"}</span></div>
        <div><strong>${topUsage ? escapeHtml(topUsage.department.name) : "--"}</strong><span>最高已用${unitLabel}</span></div>
        <div><strong>${detailRows[0] ? escapeHtml(detailRows[0].label) : "--"}</strong><span>最高公司/明细</span></div>
      `
      : `<div class="fund-flow-empty">录入总预算、${budgetLabel}或开销后，这里会显示资金流向。</div>`;
  }

  if (!hasFlowData || data.sourceTotal <= 0) {
    drawText(ctx, "暂无资金流向数据", width / 2, height / 2, {
      size: 15,
      weight: 800,
      color: semanticColor("muted"),
      align: "center",
      baseline: "middle",
    });
    return;
  }

  if (width < (options.compactThreshold ?? 560)) {
    drawCompactFundFlowChart(ctx, width, height, canvas, data, sinkRows);
    return;
  }

  const compact = width < 760;
  const left = large ? 42 : compact ? 22 : 36;
  const sourceW = large ? 138 : compact ? 104 : 124;
  const midX = large ? Math.max(230, width * 0.22) : compact ? Math.max(156, width * 0.25) : Math.max(190, width * 0.25);
  const midW = large ? 158 : compact ? 116 : 140;
  const usageX = large ? Math.max(midX + midW + 82, width * 0.49) : compact ? Math.max(midX + midW + 36, width * 0.5) : Math.max(midX + midW + 60, width * 0.52);
  const usageW = large ? 136 : compact ? 104 : 122;
  const detailX = large ? width - 290 : compact ? Math.max(usageX + usageW + 34, width - 148) : width - 220;
  const detailW = large ? 230 : compact ? 132 : 168;
  const top = large ? 56 : 44;
  const bottom = height - (large ? 64 : 56);
  const usableH = Math.max(120, bottom - top);
  const gap = large ? 8 : compact ? 7 : 8;
  const sourceTotal = data.sourceTotal || data.allocatedTotal || data.usageTotal;
  const unclassifiedAllocationRows = data.usageRows
    .filter((row) => row.unclassified)
    .map((row) => ({
      ...row,
      nodeValue: row.used,
      sourceValue: row.used,
    }));
  const unclassifiedAllocationTotal = unclassifiedAllocationRows.reduce((sum, row) => sum + row.used, 0);
  const visibleUnallocated = Math.max(0, data.sourceTotal - data.allocatedTotal - unclassifiedAllocationTotal);
  const allocationRows = [
    ...data.budgetRows.map((row) => ({
      ...row,
      nodeValue: row.budget > 0 ? row.budget : row.used,
      sourceValue: row.budget > 0 ? row.budget : row.used,
    })),
    ...unclassifiedAllocationRows,
    ...(visibleUnallocated > 0
      ? [
          {
            department: { id: "unallocated", name: "未分配预算" },
            color: semanticColor("muted"),
            budget: visibleUnallocated,
            used: 0,
            breakdown: { labor: 0, equipment: 0, production: 0 },
            nodeValue: visibleUnallocated,
            sourceValue: visibleUnallocated,
            unallocated: true,
          },
        ]
      : []),
  ];
  const visibleAllocationRows = aggregateFundRows(allocationRows, "nodeValue", large ? 16 : compact ? 8 : 11, `其他${unitLabel}`);
  const allocationNodes = positionedFlowNodes(
    visibleAllocationRows,
    "nodeValue",
    midX,
    midW,
    top,
    usableH,
    gap,
    (row) => row.color || semanticColor("muted"),
  );
  const sinkNodes = positionedFlowNodes(
    sinkRows.length > 0 ? sinkRows : [{ key: "none", label: "暂无已用", value: 1, color: semanticColor("muted") }],
    "value",
    usageX,
    usageW,
    top + 20,
    Math.max(80, usableH - 40),
    compact ? 14 : 18,
    (row) => row.color || semanticColor("muted"),
  );
  const detailNodes = positionedFlowNodes(
    detailRows.length > 0 ? detailRows : [{ key: "none-detail", label: "暂无明细", value: 1, color: semanticColor("muted"), type: "明细" }],
    "value",
    detailX,
    detailW,
    top,
    usableH,
    compact ? 7 : 8,
    (row) => row.color || classifyFundDetail(row).color || semanticColor("muted"),
  );

  const allocationTotal = Math.max(visibleAllocationRows.reduce((sum, row) => sum + (row.nodeValue || 0), 0), 1);
  const sourceH = Math.min(usableH * 0.72, Math.max(92, usableH * Math.min(0.82, allocationTotal / Math.max(sourceTotal, 1))));
  const sourceY = top + (usableH - sourceH) / 2;
  ctx.fillStyle = semanticColor("deep");
  roundRect(ctx, left, sourceY, sourceW, sourceH, 10);
  ctx.fill();
  drawText(ctx, "总预算", left + sourceW / 2, sourceY + sourceH / 2 - 16, { color: "#fff", weight: 900, align: "center", baseline: "middle" });
  drawText(ctx, compactMoney(sourceTotal), left + sourceW / 2, sourceY + sourceH / 2 + 12, { color: "#fff", size: 14, weight: 900, align: "center", baseline: "middle" });
  addChartHit(canvas, rectHit(left, sourceY, sourceW, sourceH, makeChartTooltip("总预算", [`项目总预算：${money.format(project.budget || 0)}`, `${budgetLabel}合计：${money.format(data.allocatedTotal)}`, `实际已用：${money.format(data.usageTotal)}`])));

  allocationNodes.forEach((node) => {
    const row = node.row;
    const lineValue = Math.max(0, row.sourceValue || row.nodeValue || 0);
    const lineW = Math.max(3, (lineValue / Math.max(sourceTotal, 1)) * sourceH * 0.75);
    drawFlowLink(ctx, left + sourceW, sourceY + sourceH / 2, node.x, node.cy, lineW, row.color || semanticColor("muted"), row.unallocated ? 0.18 : 0.34);
  });

  allocationNodes.forEach((node) => {
    const row = node.row;
    const label = compact && row.department.name.length > 7 ? `${row.department.name.slice(0, 7)}...` : row.department.name;
    drawFundNode(ctx, { ...node, label, valueText: row.unallocated ? compactMoney(row.budget) : `${compactMoney(row.budget)} / ${compactMoney(row.used)}` }, node.color);
    addChartHit(canvas, rectHit(node.x, node.y, node.w, node.h, makeChartTooltip(row.department.name, [row.unallocated ? `未分配：${money.format(row.budget)}` : `${budgetLabel}：${money.format(row.budget)}`, row.unallocated ? "" : `实际已用：${money.format(row.used)}`, row.unallocated ? "" : `预算使用率：${percentText(row.budget > 0 ? row.used / row.budget : 0)}`])));
  });

  const sinkTotal = Math.max(sinkRows.reduce((sum, row) => sum + row.value, 0), 1);
  sinkNodes.forEach((node) => {
    drawFundNode(ctx, { ...node, label: node.row.label, valueText: compactMoney(node.row.value) }, node.color);
    addChartHit(canvas, rectHit(node.x, node.y, node.w, node.h, makeChartTooltip(`用途 · ${node.row.label}`, [`实际已用：${money.format(node.row.value)}`, `占已用：${percentText(node.row.value / sinkTotal)}`])));
  });

  allocationNodes.forEach((node) => {
    const row = node.row;
    if (row.unallocated) return;
    const usages = [
      { key: "labor", label: "人员", value: row.breakdown.labor },
      { key: "equipment", label: "器材", value: row.breakdown.equipment },
      { key: "production", label: isCustomInputMode() ? "外部费用" : "通告额外", value: row.breakdown.production },
    ].filter((item) => item.value > 0);
    const maxUsage = Math.max(...usages.map((item) => item.value), 1);
    usages.forEach((usage, usageIndex) => {
      const sinkNode = sinkNodes.find((item) => item.row.key === usage.key || item.row.label === usage.label);
      if (!sinkNode) return;
      const lineW = Math.max(2.5, (usage.value / maxUsage) * Math.min(node.h * 0.46, 18));
      const offset = (usageIndex - (usages.length - 1) / 2) * Math.max(5, lineW + 3);
      const fromY = node.cy + offset;
      drawFlowLink(ctx, node.x + node.w, fromY, sinkNode.x, sinkNode.cy, lineW, sinkNode.color, 0.42);
      addChartHit(canvas, rectHit(node.x + node.w, Math.min(fromY, sinkNode.cy) - 10, Math.max(10, sinkNode.x - node.x - node.w), Math.abs(sinkNode.cy - fromY) + 20, makeChartTooltip(`${row.department.name} → ${usage.label}`, [`实际已用：${money.format(usage.value)}`])));
    });
  });

  detailNodes.forEach((node) => {
    const label = compact && node.row.label.length > 9 ? `${node.row.label.slice(0, 9)}...` : node.row.label;
    drawFundNode(ctx, { ...node, label, valueText: `${compactMoney(node.row.value)} · ${node.row.type || "明细"}` }, node.color, { labelSize: compact ? 10.5 : 11, valueSize: 10 });
    addChartHit(canvas, rectHit(node.x, node.y, node.w, node.h, makeChartTooltip(node.row.label, [`类型：${node.row.type || "明细"}`, `金额：${money.format(node.row.value)}`, node.row.meta ? `来源：${node.row.meta}` : "", detailTotal > 0 ? `占明细：${percentText(node.row.value / detailTotal)}` : ""])));
  });

  sinkNodes.forEach((sinkNode) => {
    const matchingDetails = detailNodes.filter((detailNode) => classifyFundDetail(detailNode.row).key === sinkNode.row.key);
    const maxDetail = Math.max(...matchingDetails.map((detailNode) => detailNode.row.value), 1);
    matchingDetails.forEach((detailNode, detailIndex) => {
      const lineW = Math.max(2, (detailNode.row.value / maxDetail) * Math.min(sinkNode.h * 0.42, 16));
      const offset = (detailIndex - (matchingDetails.length - 1) / 2) * Math.max(4, Math.min(12, lineW + 2));
      drawFlowLink(ctx, sinkNode.x + sinkNode.w, sinkNode.cy + offset, detailNode.x, detailNode.cy, lineW, detailNode.color, 0.36);
      addChartHit(canvas, rectHit(sinkNode.x + sinkNode.w, Math.min(sinkNode.cy + offset, detailNode.cy) - 9, Math.max(10, detailNode.x - sinkNode.x - sinkNode.w), Math.abs(detailNode.cy - (sinkNode.cy + offset)) + 18, makeChartTooltip(`${sinkNode.row.label} → ${detailNode.row.label}`, [`金额：${money.format(detailNode.row.value)}`])));
    });
  });

  drawText(ctx, "资金来源", left + sourceW / 2, 22, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
  drawText(ctx, `${unitLabel}预算 / 已用`, midX + midW / 2, 22, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
  drawText(ctx, "用途", usageX + usageW / 2, 22, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
  drawText(ctx, "公司 / 明细", detailX + detailW / 2, 22, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
  if (large) {
    renderFundFlowDetailTable();
  }
}

function drawCompactFundFlowChart(ctx, width, height, canvas, data, sinkRows = []) {
  const unitLabel = budgetUnitLabel();
  const budgetLabel = budgetBudgetLabel();
  const left = 18;
  const usableW = width - left * 2;
  const sourceY = 34;
  const sourceH = 54;
  const sourceTotal = data.sourceTotal || data.allocatedTotal || data.usageTotal || 1;
  ctx.fillStyle = semanticColor("deep");
  roundRect(ctx, left, sourceY, usableW, sourceH, 10);
  ctx.fill();
  drawText(ctx, "总预算", left + 14, sourceY + 22, { color: "#fff", size: 13, weight: 900 });
  drawText(ctx, compactMoney(sourceTotal), width - left - 14, sourceY + 34, { color: "#fff", size: 14, weight: 900, align: "right" });
  addChartHit(canvas, rectHit(left, sourceY, usableW, sourceH, makeChartTooltip("总预算", [`项目总预算：${money.format(project.budget || 0)}`, `${budgetLabel}合计：${money.format(data.allocatedTotal)}`, `实际已用：${money.format(data.usageTotal)}`])));

  drawText(ctx, `${unitLabel}预算 / 已用`, left, 112, { size: 12, weight: 900, color: semanticColor("muted") });
  const deptRows = aggregateFundRows(data.budgetRows, "budget", 6, `其他${unitLabel}`);
  const max = Math.max(...deptRows.map((row) => Math.max(row.budget, row.used)), 1);
  const rowH = 20;
  const rowGap = 10;
  let y = 126;
  deptRows.forEach((row, index) => {
    const budgetW = Math.max(12, (row.budget / max) * usableW);
    const usedW = Math.max(0, (row.used / max) * usableW);
    drawText(ctx, row.department.name, left, y - 4, { size: 11, weight: 800, color: semanticColor("ink") });
    drawText(ctx, `${compactMoney(row.budget)} / ${compactMoney(row.used)}`, width - left, y - 4, { size: 11, weight: 800, color: semanticColor("muted"), align: "right" });
    ctx.fillStyle = semanticColor("track");
    roundRect(ctx, left, y + 2, usableW, rowH, 9);
    ctx.fill();
    ctx.fillStyle = row.color || palette(index);
    roundRect(ctx, left, y + 2, budgetW, rowH, 9);
    ctx.fill();
    ctx.fillStyle = alphaColor("deep", 0.42);
    roundRect(ctx, left, y + 8, usedW, 8, 4);
    ctx.fill();
    addChartHit(canvas, rectHit(left, y + 2, Math.max(budgetW, 12), rowH, makeChartTooltip(row.department.name, [`${budgetLabel}：${money.format(row.budget)}`, `实际已用：${money.format(row.used)}`, `预算使用率：${percentText(row.budget > 0 ? row.used / row.budget : 0)}`])));
    y += rowH + rowGap + 12;
  });

  const usageTotal = Math.max(sinkRows.reduce((sum, row) => sum + row.value, 0), 1);
  const usageY = Math.max(y + 8, height - 72);
  drawText(ctx, "实际用途", left, usageY - 12, { size: 12, weight: 900, color: semanticColor("muted") });
  let x = left;
  const compactSinkRows = sinkRows.length > 0 ? sinkRows : [{ label: "暂无已用", value: 1, color: semanticColor("muted") }];
  compactSinkRows.forEach((sink, index) => {
    const segmentW = index === compactSinkRows.length - 1 ? Math.max(34, width - left - x) : Math.max(34, (sink.value / usageTotal) * usableW);
    ctx.fillStyle = sink.color;
    roundRect(ctx, x, usageY, Math.max(28, segmentW - 4), 44, 8);
    ctx.fill();
    drawText(ctx, sink.label, x + 8, usageY + 18, { color: "#fff", size: 11, weight: 900 });
    drawText(ctx, compactMoney(sink.value), x + 8, usageY + 34, { color: "#fff", size: 10, weight: 800 });
    addChartHit(canvas, rectHit(x, usageY, Math.max(28, segmentW - 4), 44, makeChartTooltip(`用途 · ${sink.label}`, [`已用：${money.format(sink.value)}`, `占已用：${percentText(sink.value / usageTotal)}`])));
    x += segmentW;
  });
}

function departmentBudgetRows() {
  return activeBudgetDepartments()
    .map((department, index) => ({
      label: department.name,
      value: Number(department.budget) || 0,
      budget: Number(department.budget) || 0,
      color: activeDepartmentColor(department, index),
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);
}

function drawProgressChart() {
  const canvas = document.querySelector("#progressChart");
  const { ctx, width, height } = resizeCanvas(canvas);
  resetChartHits(canvas);
  clearChart(ctx, width, height);

  const progress = activeProgressStats();
  const sceneStats = completedSceneStats();
  const bars = [
    { label: progress.mode === "custom" ? "自定义完成率" : "拍摄完成率", value: progress.rate, color: semanticColor("blue"), detail: progress.detailText },
    { label: progress.mode === "custom" ? "指标平均进度" : "页数完成率", value: progress.mode === "custom" ? (progress.rows.length > 0 ? progress.rows.reduce((sum, row) => sum + row.rate, 0) / progress.rows.length : 0) : project.totalPages > 0 ? sceneStats.pages / project.totalPages : 0, color: semanticColor("teal"), detail: progress.mode === "custom" ? `${progress.rows.length} 项自定义指标` : `页数：${sceneStats.pages}/${project.totalPages}` },
    { label: "预算消耗率", value: project.budget > 0 ? totalSpent() / project.budget : 0, color: riskDelta() > 0.12 ? semanticColor("red") : semanticColor("amber") },
    { label: "天数使用率", value: project.plannedDays > 0 ? project.currentDay / project.plannedDays : 0, color: semanticColor("violet") },
  ];

  const left = 120;
  const top = 34;
  const usableW = width - left - 44;
  bars.forEach((bar, index) => {
    const y = top + index * 48;
    drawText(ctx, bar.label, 20, y + 18, { size: 13, weight: 800 });
    ctx.fillStyle = semanticColor("track");
    roundRect(ctx, left, y, usableW, 18, 8);
    ctx.fill();
    ctx.fillStyle = bar.color;
    roundRect(ctx, left, y, Math.min(bar.value, 1) * usableW, 18, 8);
    ctx.fill();
    addChartHit(canvas, rectHit(left, y, Math.max(8, Math.min(bar.value, 1) * usableW), 18, makeChartTooltip(bar.label, [`比例：${percentText(bar.value)}`, bar.detail || "", bar.label.includes("预算") ? `已用：${money.format(totalSpent())}` : ""])));
    drawText(ctx, `${Math.round(bar.value * 100)}%`, width - 20, y + 16, {
      size: 13,
      weight: 800,
      align: "right",
    });
  });
}

function drawEditProgressChart() {
  const canvas = document.querySelector("#editProgressChart");
  if (!canvas) return;
  const { ctx, width, height } = resizeCanvas(canvas);
  resetChartHits(canvas);
  clearChart(ctx, width, height);

  if (isCustomInputMode()) {
    drawCustomProgressDetailChart(ctx, width, height, canvas);
    return;
  }

  const stats = completedSceneStats();
  const totalSceneCount = Math.max(project.totalScenes, stats.count + Math.max(0, project.totalScenes - stats.count), 1);
  const completedScenes = Math.min(stats.count, totalSceneCount);
  const remainingScenes = Math.max(totalSceneCount - completedScenes, 0);
  const editDone = Math.max(0, Math.round(completedScenes * 0.72));
  const editTodo = Math.max(completedScenes - editDone, 0);
  const editRate = completedScenes > 0 ? editDone / completedScenes : 0;

  const compact = width < 620;
  const cx = compact ? width / 2 : Math.min(width * 0.25, 220);
  const cy = compact ? 98 : height / 2 - 8;
  const radius = Math.max(46, Math.min(width, height) * (compact ? 0.16 : 0.2));
  const rows = [
    { label: "已剪", value: editDone, color: semanticColor("teal") },
    { label: "待剪", value: editTodo, color: semanticColor("amber") },
  ];
  let start = -Math.PI / 2;
  const editTotal = Math.max(editDone + editTodo, 1);
  rows.forEach((row) => {
    const angle = (row.value / editTotal) * Math.PI * 2;
    ctx.strokeStyle = row.color;
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.stroke();
    addChartHit(canvas, arcHit(cx, cy, radius - 20, radius + 20, start, start + angle, makeChartTooltip(row.label, [`场次：${row.value}`, `占比：${percentText(row.value / editTotal)}`])));
    start += angle;
  });
  drawText(ctx, "剪辑", cx, cy - 10, { size: 13, weight: 800, color: semanticColor("muted"), align: "center", baseline: "middle" });
  drawText(ctx, `${Math.round(editRate * 100)}%`, cx, cy + 18, { size: 34, weight: 900, align: "center", baseline: "middle" });

  const barLeft = compact ? 24 : Math.max(320, width * 0.38);
  const barTop = compact ? 210 : 74;
  const usableW = Math.max(120, width - barLeft - 42);
  const barGap = compact ? 44 : 72;
  const barRows = [
    { label: "剪辑进度", value: editRate, count: `${editDone}/${completedScenes} 场`, color: semanticColor("teal") },
    { label: "已完成场次", value: completedScenes / totalSceneCount, count: `${completedScenes} 场`, color: semanticColor("blue") },
    { label: "未完成场次", value: remainingScenes / totalSceneCount, count: `${remainingScenes} 场`, color: semanticColor("red") },
  ];

  barRows.forEach((row, index) => {
    const y = barTop + index * barGap;
    const value = Math.max(0, Math.min(row.value, 1));
    drawText(ctx, row.label, barLeft, y - 12, { size: 14, weight: 900 });
    drawText(ctx, row.count, width - 42, y - 12, { size: 13, weight: 900, color: semanticColor("muted"), align: "right" });
    ctx.fillStyle = semanticColor("track");
    roundRect(ctx, barLeft, y, usableW, 22, 10);
    ctx.fill();
    ctx.fillStyle = row.color;
    roundRect(ctx, barLeft, y, Math.max(8, value * usableW), 22, 10);
    ctx.fill();
    addChartHit(canvas, rectHit(barLeft, y, Math.max(8, value * usableW), 22, makeChartTooltip(row.label, [`数量：${row.count}`, `比例：${percentText(value)}`])));
    drawText(ctx, `${Math.round(value * 100)}%`, barLeft + value * usableW - 10, y + 16, {
      size: 12,
      weight: 900,
      color: "#fff",
      align: "right",
    });
  });
}

function drawCustomProgressDetailChart(ctx, width, height, canvas) {
  const rows = customProgressRows();
  if (rows.length === 0) {
    drawText(ctx, "暂无自定义进度项", width / 2, height / 2 - 10, { align: "center", baseline: "middle", color: semanticColor("muted"), size: 16, weight: 900 });
    drawText(ctx, "在录入端保存进度指标后，这里会显示完成率。", width / 2, height / 2 + 18, { align: "center", baseline: "middle", color: semanticColor("muted"), size: 12, weight: 700 });
    return;
  }
  const stats = customProgressStats();
  const compact = width < 620;
  const cx = compact ? width / 2 : Math.min(width * 0.24, 220);
  const cy = compact ? 98 : height / 2 - 8;
  const radius = Math.max(46, Math.min(width, height) * (compact ? 0.16 : 0.2));
  const done = Math.min(stats.count, stats.total);
  const remaining = Math.max(stats.total - done, 0);
  const donutRows = [
    { label: "已完成", value: done, color: semanticColor("teal") },
    { label: "未完成", value: remaining, color: semanticColor("amber") },
  ];
  let start = -Math.PI / 2;
  const total = Math.max(stats.total, 1);
  donutRows.forEach((row) => {
    const angle = (row.value / total) * Math.PI * 2;
    ctx.strokeStyle = row.color;
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.stroke();
    addChartHit(canvas, arcHit(cx, cy, radius - 20, radius + 20, start, start + angle, makeChartTooltip(row.label, [`进度量：${formatProgressNumber(row.value)}`, `占比：${percentText(row.value / total)}`])));
    start += angle;
  });
  drawText(ctx, "自定义", cx, cy - 10, { size: 13, weight: 800, color: semanticColor("muted"), align: "center", baseline: "middle" });
  drawText(ctx, `${Math.round(stats.rate * 100)}%`, cx, cy + 18, { size: 34, weight: 900, align: "center", baseline: "middle" });

  const barLeft = compact ? 24 : Math.max(320, width * 0.38);
  const barTop = compact ? 210 : 42;
  const usableW = Math.max(120, width - barLeft - 42);
  const barGap = compact ? 38 : 46;
  rows.slice(0, compact ? 3 : 6).forEach((row, index) => {
    const y = barTop + index * barGap;
    const value = Math.max(0, Math.min(row.rate, 1));
    drawText(ctx, row.label, barLeft, y - 10, { size: 13, weight: 900 });
    drawText(ctx, `${formatProgressNumber(row.done)}/${formatProgressNumber(row.target)} ${row.unit}`, width - 42, y - 10, { size: 12, weight: 900, color: semanticColor("muted"), align: "right" });
    ctx.fillStyle = semanticColor("track");
    roundRect(ctx, barLeft, y, usableW, 20, 9);
    ctx.fill();
    ctx.fillStyle = row.color;
    roundRect(ctx, barLeft, y, Math.max(8, value * usableW), 20, 9);
    ctx.fill();
    addChartHit(canvas, rectHit(barLeft, y, Math.max(8, value * usableW), 20, makeChartTooltip(row.label, [`完成：${formatProgressNumber(row.done)}/${formatProgressNumber(row.target)} ${row.unit}`, `完成率：${percentText(row.rate)}`])));
    drawText(ctx, `${Math.round(value * 100)}%`, barLeft + value * usableW - 10, y + 15, {
      size: 12,
      weight: 900,
      color: "#fff",
      align: "right",
    });
  });
}

function visualDatasetRows(dataset = visualState.dataset) {
  const actualDataset = dataset === "ratings" && !isRatingEnabled() ? "departments" : dataset;
  if (actualDataset === "daily") {
    return callSheets.map((sheet) => ({
      label: `D${sheet.day}`,
      value: dayTotal(sheet),
      color: sheet.day <= project.currentDay ? semanticColor("teal") : semanticColor("amber"),
      secondary: sheet.day,
    }));
  }
  if (actualDataset === "departments") {
    return departmentAnalysisRows().map((row, index) => ({
      label: row.department.name,
      value: row.used,
      budget: row.department.budget,
      rate: row.rate,
      status: row.statusText,
      color: row.statusClass === "over" ? semanticColor("red") : row.statusClass === "tight" ? semanticColor("amber") : activeDepartmentColor(row.department, index),
    }));
  }
  if (actualDataset === "departmentBudget") {
    return departmentBudgetRows();
  }
  if (actualDataset === "personnelShare") {
    return personnelShareRows();
  }
  if (actualDataset === "categories") {
    const data = fundFlowData();
    const usageRows = data.usageRows.length > 0 ? data.usageRows : data.budgetRows;
    const categories = {
      labor: usageRows.reduce((sum, row) => sum + (row.breakdown?.labor || 0), 0),
      equipment: usageRows.reduce((sum, row) => sum + (row.breakdown?.equipment || 0), 0),
      production: usageRows.reduce((sum, row) => sum + (row.breakdown?.production || 0), 0),
    };
    return Object.entries(categories).filter(([, value]) => value > 0).map(([key, value]) => ({
      label: categoryNames[key],
      value,
      color: activeCategoryColor(key),
      categoryKey: key,
    }));
  }
  if (actualDataset === "customProgress") {
    return customProgressRows().map((row) => ({
      label: row.label,
      value: Math.min(row.done, row.target),
      budget: row.target,
      rate: row.rate,
      status: row.status,
      unit: row.unit,
      done: row.done,
      target: row.target,
      color: row.color,
    }));
  }
  return [
    ...people.map((person) => ({
      label: person.name,
      value: person.dayRate,
      trust: normalizeTrust(person.trust),
      grade: normalizeGrade(person.grade),
      companyGrade: normalizeGrade(person.companyGrade),
      total: personTotal(person),
      color: semanticColor("blue"),
    })),
    ...equipment.map((item) => ({
      label: item.name,
      value: item.daily,
      trust: normalizeTrust(item.trust),
      grade: normalizeGrade(item.companyGrade),
      total: equipmentTotal(item),
      color: semanticColor("red"),
    })),
  ];
}

function visualEmptyState(dataset) {
  if (dataset === "personnelShare") {
    return {
      title: "暂无人员占比数据",
      detail: isCustomInputMode() ? "先保存自定义部门/分类，并在人员开销里录入人员。" : "先在人员开销里录入人员，保存后这里会显示占比。",
    };
  }
  if (dataset === "customProgress") {
    return {
      title: "暂无自定义进度",
      detail: "在录入端保存完成进度后，这里会显示进度图。",
    };
  }
  return {
    title: "暂无可视化数据",
    detail: "录入或导入数据后，这里会自动生成图表。",
  };
}

function drawVisualExplorer(canvasId = "visualExplorerChart", state = visualState) {
  const canvas = document.querySelector(`#${canvasId}`);
  if (!canvas) return;
  const { ctx, width, height } = resizeCanvas(canvas);
  resetChartHits(canvas);
  clearChart(ctx, width, height);
  const rows = visualDatasetRows(state.dataset);
  if (rows.length === 0) {
    const empty = visualEmptyState(state.dataset);
    drawText(ctx, empty.title, width / 2, height / 2 - 10, { align: "center", baseline: "middle", color: semanticColor("muted"), size: 15, weight: 900 });
    drawText(ctx, empty.detail, width / 2, height / 2 + 18, { align: "center", baseline: "middle", color: semanticColor("muted"), size: 12, weight: 700 });
    return;
  }

  if (state.chart === "line") drawVisualLine(ctx, width, height, rows, false, canvas);
  if (state.chart === "area") drawVisualLine(ctx, width, height, rows, true, canvas);
  if (state.chart === "bar") drawVisualBar(ctx, width, height, rows, canvas);
  if (state.chart === "horizontalBar") drawVisualHorizontalBar(ctx, width, height, rows, canvas);
  if (state.chart === "donut") drawVisualDonut(ctx, width, height, rows, { canvas });
  if (state.chart === "pie") drawVisualPie(ctx, width, height, rows, { canvas });
  if (state.chart === "rose") drawVisualRose(ctx, width, height, rows, { canvas });
  if (state.chart === "treemap") drawVisualTreemap(ctx, width, height, rows, canvas);
  if (state.chart === "waterfall") drawVisualWaterfall(ctx, width, height, rows, canvas);
  if (state.chart === "scatter") drawVisualScatter(ctx, width, height, rows, false, canvas);
  if (state.chart === "bubble") drawVisualScatter(ctx, width, height, rows, true, canvas);
  if (state.chart === "radar") drawVisualRadar(ctx, width, height, rows, state, canvas);
  if (state.chart === "sankey") drawVisualSankey(ctx, width, height, rows, canvas);
}

function drawVisualLine(ctx, width, height, rows, fillArea, canvas) {
  const pad = { top: 28, right: 28, bottom: 44, left: 68 };
  const values = rows.map((row) => row.value);
  const max = Math.max(...values, 1) * 1.14;
  const min = fillArea ? 0 : Math.min(...values) * 0.9;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  drawGrid(ctx, pad, width, height, plotH);
  const points = rows.map((row, index) => ({
    x: rows.length === 1 ? pad.left + plotW / 2 : pad.left + (plotW / (rows.length - 1)) * index,
    y: pad.top + plotH - ((row.value - min) / (max - min || 1)) * plotH,
    row,
  }));
  if (fillArea) {
    ctx.fillStyle = alphaColor("teal", displaySettings.darkMode ? 0.24 : 0.18);
    ctx.beginPath();
    points.forEach((point, index) => (index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)));
    ctx.lineTo(points.at(-1).x, pad.top + plotH);
    ctx.lineTo(points[0].x, pad.top + plotH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = semanticColor("teal");
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => (index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)));
  ctx.stroke();
  points.forEach((point) => {
    ctx.fillStyle = point.row.color || semanticColor("teal");
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
    drawText(ctx, point.row.label, point.x, height - 14, { size: 11, weight: 700, color: semanticColor("muted"), align: "center" });
    addChartHit(canvas, pointHit(point.x, point.y, 12, makeChartTooltip(chartTooltipTitle(point.row), chartTooltipLines(point.row))));
  });
  drawText(ctx, money.format(max), 10, pad.top + 8, { size: 11, weight: 600, color: semanticColor("muted") });
  drawText(ctx, money.format(min), 10, pad.top + plotH, { size: 11, weight: 600, color: semanticColor("muted") });
}

function drawVisualBar(ctx, width, height, rows, canvas) {
  const pad = { top: 30, right: 24, bottom: 54, left: 58 };
  const visibleRows = rows.slice(0, 10);
  const max = Math.max(...visibleRows.map((row) => row.value), 1);
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const gap = 8;
  const barW = Math.max(12, (plotW - gap * (visibleRows.length - 1)) / visibleRows.length);
  drawGrid(ctx, pad, width, height, plotH);
  visibleRows.forEach((row, index) => {
    const h = (row.value / max) * plotH;
    const x = pad.left + index * (barW + gap);
    const y = pad.top + plotH - h;
    ctx.fillStyle = row.color || semanticColor("blue");
    roundRect(ctx, x, y, barW, h, 6);
    ctx.fill();
    addChartHit(canvas, rectHit(x, y, barW, Math.max(h, 4), makeChartTooltip(chartTooltipTitle(row), chartTooltipLines(row, visibleRows.reduce((sum, item) => sum + item.value, 0)))));
    drawText(ctx, compactChartValue(row.value, row), x + barW / 2, y - 6, { size: 11, weight: 700, align: "center" });
    drawText(ctx, row.label, x + barW / 2, height - 18, { size: 11, weight: 700, color: semanticColor("muted"), align: "center" });
  });
}

function drawVisualHorizontalBar(ctx, width, height, rows, canvas) {
  const visibleRows = rows.slice(0, 8);
  const max = Math.max(...visibleRows.map((row) => row.value), 1);
  const left = 110;
  const top = 28;
  const barH = 22;
  const gap = 15;
  const usableW = width - left - 94;
  visibleRows.forEach((row, index) => {
    const y = top + index * (barH + gap);
    const barW = (row.value / max) * usableW;
    drawText(ctx, row.label, 14, y + 16, { size: 12, weight: 800, color: semanticColor("muted") });
    ctx.fillStyle = semanticColor("track");
    roundRect(ctx, left, y, usableW, barH, 8);
    ctx.fill();
    ctx.fillStyle = row.color || semanticColor("teal");
    roundRect(ctx, left, y, barW, barH, 8);
    ctx.fill();
    addChartHit(canvas, rectHit(left, y, Math.max(barW, 8), barH, makeChartTooltip(chartTooltipTitle(row), chartTooltipLines(row, visibleRows.reduce((sum, item) => sum + item.value, 0)))));
    drawText(ctx, compactChartValue(row.value, row), left + barW + 8, y + 16, { size: 12, weight: 800 });
  });
}

function getShareRows(rows, limit = 9) {
  const positiveRows = rows.filter((row) => row.value > 0).sort((a, b) => b.value - a.value);
  const visibleRows = positiveRows.slice(0, limit);
  const otherTotal = positiveRows.slice(limit).reduce((sum, row) => sum + row.value, 0);
  if (otherTotal <= 0) return visibleRows;
  return [
    ...visibleRows,
    {
      label: "其他",
      value: otherTotal,
      color: semanticColor("muted"),
    },
  ];
}

function drawShareLegend(ctx, width, rows, total, options = {}) {
  const legendX = options.legendX || width * 0.62;
  const startY = options.startY || 42;
  const rowGap = options.rowGap || 30;
  const compact = width < 520;
  rows.forEach((row, index) => {
    const y = startY + index * rowGap;
    const color = row.color || palette(index);
    const percent = total > 0 ? Math.round((row.value / total) * 100) : 0;
    const label = compact && row.label.length > 5 ? `${row.label.slice(0, 5)}...` : row.label;
    ctx.fillStyle = color;
    roundRect(ctx, legendX, y - 13, 14, 14, 3);
    ctx.fill();
    drawText(ctx, label, legendX + 22, y, { size: compact ? 11 : 12, weight: 800 });
    drawText(ctx, `${percent}%`, width - 18, y, { size: compact ? 11 : 12, weight: 900, color: semanticColor("muted"), align: "right" });
  });
}

function drawArcLabel(ctx, cx, cy, radius, start, angle, label) {
  if (angle < 0.22) return;
  const mid = start + angle / 2;
  const x = cx + Math.cos(mid) * radius;
  const y = cy + Math.sin(mid) * radius;
  drawText(ctx, label, x, y, { size: 11, weight: 900, color: "#fff", align: "center", baseline: "middle" });
}

function drawVisualDonut(ctx, width, height, rows, options = {}) {
  const total = Math.max(rows.reduce((sum, row) => sum + row.value, 0), 1);
  const chartRows = getShareRows(rows);
  const canvas = options.canvas;
  const cx = width * 0.36;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.28;
  const lineWidth = Math.max(22, Math.min(34, radius * 0.22));
  let start = -Math.PI / 2;
  chartRows.forEach((row, index) => {
    const angle = (row.value / total) * Math.PI * 2;
    ctx.strokeStyle = row.color || palette(index);
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.stroke();
    addChartHit(canvas, arcHit(cx, cy, radius - lineWidth / 2 - 6, radius + lineWidth / 2 + 6, start, start + angle, makeChartTooltip(chartTooltipTitle(row), chartTooltipLines(row, total))));
    drawArcLabel(ctx, cx, cy, radius, start, angle, `${Math.round((row.value / total) * 100)}%`);
    start += angle;
  });
  drawText(ctx, options.valueLabel || "总计", cx, cy - 10, { size: 13, weight: 700, color: semanticColor("muted"), align: "center", baseline: "middle" });
  drawText(ctx, compactChartValue(total, rows), cx, cy + 16, { size: 24, weight: 900, align: "center", baseline: "middle" });
  drawShareLegend(ctx, width, chartRows.slice(0, 9), total);
}

function drawVisualPie(ctx, width, height, rows, options = {}) {
  const total = Math.max(rows.reduce((sum, row) => sum + row.value, 0), 1);
  const chartRows = getShareRows(rows);
  const canvas = options.canvas;
  const cx = width * 0.36;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.31;
  let start = -Math.PI / 2;
  chartRows.forEach((row, index) => {
    const angle = (row.value / total) * Math.PI * 2;
    ctx.fillStyle = row.color || palette(index);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.closePath();
    ctx.fill();
    addChartHit(canvas, arcHit(cx, cy, 30, radius, start, start + angle, makeChartTooltip(chartTooltipTitle(row), chartTooltipLines(row, total))));
    drawArcLabel(ctx, cx, cy, radius * 0.62, start, angle, `${Math.round((row.value / total) * 100)}%`);
    start += angle;
  });
  ctx.fillStyle = semanticColor("surface");
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, Math.PI * 2);
  ctx.fill();
  drawText(ctx, options.valueLabel || "总计", cx, cy - 4, { size: 11, weight: 900, color: semanticColor("muted"), align: "center", baseline: "middle" });
  drawText(ctx, "100%", cx, cy + 15, { size: 14, weight: 900, align: "center", baseline: "middle" });
  drawShareLegend(ctx, width, chartRows.slice(0, 9), total);
}

function drawVisualRose(ctx, width, height, rows, options = {}) {
  const total = Math.max(rows.reduce((sum, row) => sum + row.value, 0), 1);
  const chartRows = getShareRows(rows, 10);
  const canvas = options.canvas;
  const max = Math.max(...chartRows.map((row) => row.value), 1);
  const cx = width * 0.36;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) * 0.32;
  const gap = 0.035;
  const slice = (Math.PI * 2) / chartRows.length;

  chartRows.forEach((row, index) => {
    const start = -Math.PI / 2 + index * slice + gap;
    const end = start + slice - gap * 2;
    const radius = maxRadius * (0.34 + 0.66 * Math.sqrt(row.value / max));
    ctx.fillStyle = row.color || palette(index);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fill();
    addChartHit(canvas, arcHit(cx, cy, 28, radius, start, end, makeChartTooltip(chartTooltipTitle(row), chartTooltipLines(row, total))));
    const percent = Math.round((row.value / total) * 100);
    drawArcLabel(ctx, cx, cy, radius * 0.72, start, end - start, percent >= 4 ? `${percent}%` : "");
  });
  ctx.fillStyle = semanticColor("surface");
  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, Math.PI * 2);
  ctx.fill();
  drawText(ctx, options.valueLabel || "预算", cx, cy - 4, { size: 11, weight: 900, color: semanticColor("muted"), align: "center", baseline: "middle" });
  drawText(ctx, "占比", cx, cy + 15, { size: 14, weight: 900, align: "center", baseline: "middle" });
  drawShareLegend(ctx, width, chartRows.slice(0, 9), total);
}

function drawVisualTreemap(ctx, width, height, rows, canvas) {
  const total = Math.max(rows.reduce((sum, row) => sum + row.value, 0), 1);
  let x = 24;
  let y = 28;
  let remainingW = width - 48;
  let remainingH = height - 56;
  rows.slice(0, 8).forEach((row, index) => {
    const ratio = row.value / total;
    const horizontal = remainingW >= remainingH;
    const blockW = horizontal ? Math.max(80, remainingW * ratio * 1.25) : remainingW;
    const blockH = horizontal ? remainingH : Math.max(62, remainingH * ratio * 1.25);
    ctx.fillStyle = row.color || palette(index);
    const finalW = Math.min(blockW, remainingW);
    const finalH = Math.min(blockH, remainingH);
    roundRect(ctx, x, y, finalW, finalH, 8);
    ctx.fill();
    addChartHit(canvas, rectHit(x, y, finalW, finalH, makeChartTooltip(chartTooltipTitle(row), chartTooltipLines(row, total))));
    drawText(ctx, row.label, x + 12, y + 24, { color: "#fff", weight: 900 });
    drawText(ctx, compactChartValue(row.value, row), x + 12, y + 47, { color: "#fff", weight: 800, size: 12 });
    if (horizontal) {
      x += blockW + 6;
      remainingW = Math.max(0, width - 24 - x);
    } else {
      y += blockH + 6;
      remainingH = Math.max(0, height - 28 - y);
    }
  });
}

function drawVisualWaterfall(ctx, width, height, rows, canvas) {
  const pad = { top: 34, right: 24, bottom: 52, left: 66 };
  const visibleRows = rows.slice(0, 10);
  const values = visibleRows.map((row) => row.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = Math.max(total, ...values, 1);
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const stepW = plotW / (visibleRows.length + 1);
  let cumulative = 0;
  visibleRows.forEach((row, index) => {
    const x = pad.left + index * stepW + 8;
    const y0 = pad.top + plotH - (cumulative / max) * plotH;
    cumulative += row.value;
    const y1 = pad.top + plotH - (cumulative / max) * plotH;
    ctx.fillStyle = row.color || semanticColor("teal");
    roundRect(ctx, x, Math.min(y0, y1), stepW - 14, Math.abs(y1 - y0), 5);
    ctx.fill();
    addChartHit(canvas, rectHit(x, Math.min(y0, y1), stepW - 14, Math.max(4, Math.abs(y1 - y0)), makeChartTooltip(chartTooltipTitle(row), chartTooltipLines(row, total, [`累计：${money.format(cumulative)}`]))));
    drawText(ctx, row.label, x + stepW / 2 - 7, height - 16, { size: 11, weight: 700, color: semanticColor("muted"), align: "center" });
  });
  ctx.fillStyle = semanticColor("deep");
  const totalH = (total / max) * plotH;
  roundRect(ctx, pad.left + visibleRows.length * stepW + 8, pad.top + plotH - totalH, stepW - 14, totalH, 5);
  ctx.fill();
  addChartHit(canvas, rectHit(pad.left + visibleRows.length * stepW + 8, pad.top + plotH - totalH, stepW - 14, Math.max(4, totalH), makeChartTooltip("合计", [`总额：${money.format(total)}`])));
  drawText(ctx, "合计", pad.left + visibleRows.length * stepW + stepW / 2, height - 16, { size: 11, weight: 800, color: semanticColor("muted"), align: "center" });
}

function drawVisualScatter(ctx, width, height, rows, bubble, canvas) {
  const pad = { top: 28, right: 34, bottom: 42, left: 54 };
  const maxRate = Math.max(...rows.map((row) => row.value), 1);
  const maxTotal = Math.max(...rows.map((row) => row.total || row.value), 1);
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  drawGrid(ctx, pad, width, height, plotH);
  rows.forEach((row) => {
    const x = pad.left + (row.value / maxRate) * plotW;
    const y = pad.top + plotH - (row.trust / 100) * plotH;
    const r = bubble ? 5 + ((row.total || row.value) / maxTotal) * 18 : 5;
    ctx.fillStyle = row.color || semanticColor("blue");
    ctx.globalAlpha = 0.78;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    addChartHit(canvas, pointHit(x, y, Math.max(12, r + 4), makeChartTooltip(chartTooltipTitle(row), chartTooltipLines(row, 0, [`报价：${money.format(row.value)}`, row.total ? `总成本：${money.format(row.total)}` : ""]))));
  });
  drawText(ctx, "报价", width - 28, height - 14, { size: 12, weight: 800, color: semanticColor("muted"), align: "right" });
  drawText(ctx, "信任", 16, pad.top + 4, { size: 12, weight: 800, color: semanticColor("muted") });
}

function radarPoint(cx, cy, radius, total, index, score = 1) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  return {
    x: cx + Math.cos(angle) * radius * score,
    y: cy + Math.sin(angle) * radius * score,
    angle,
  };
}

function drawRadarFrame(ctx, cx, cy, radius, axes) {
  axes.forEach((axis, index) => {
    const point = radarPoint(cx, cy, radius, axes.length, index);
    ctx.strokeStyle = semanticColor("grid");
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    const align = Math.abs(Math.cos(point.angle)) < 0.2 ? "center" : Math.cos(point.angle) > 0 ? "left" : "right";
    drawText(ctx, axis, cx + Math.cos(point.angle) * (radius + 22), cy + Math.sin(point.angle) * (radius + 22), {
      size: 12,
      weight: 800,
      color: semanticColor("muted"),
      align,
      baseline: "middle",
    });
  });
  [0.33, 0.66, 1].forEach((scale) => {
    ctx.strokeStyle = semanticColor("grid");
    ctx.beginPath();
    axes.forEach((_, index) => {
      const point = radarPoint(cx, cy, radius, axes.length, index, scale);
      index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.stroke();
  });
}

function drawRadarShape(ctx, cx, cy, radius, scores, color, fillAlpha = 0.18) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = fillAlpha;
  ctx.beginPath();
  scores.forEach((score, index) => {
    const point = radarPoint(cx, cy, radius, scores.length, index, Math.max(0, Math.min(score, 1)));
    index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawRatingRadar(ctx, width, height, rows, canvas) {
  const sample = rows.slice(0, 5);
  const cx = width / 2;
  const cy = height / 2 + 10;
  const radius = Math.min(width, height) * 0.28;
  const axes = ["报价", "信任", "总额", "等级", "稳定"];
  drawRadarFrame(ctx, cx, cy, radius, axes);
  const maxRate = Math.max(...sample.map((row) => row.value), 1);
  const maxTotal = Math.max(...sample.map((row) => row.total || row.value), 1);
  sample.forEach((row, rowIndex) => {
    const gradeIndex = ratedGradeOptions.indexOf(normalizeGrade(row.grade));
    const gradeScore = gradeIndex >= 0 ? (ratedGradeOptions.length - gradeIndex) / ratedGradeOptions.length : 0.5;
    const scores = [row.value / maxRate, row.trust / 100, (row.total || row.value) / maxTotal, gradeScore, row.trust >= 75 ? 0.85 : 0.45];
    drawRadarShape(ctx, cx, cy, radius, scores, row.color || palette(rowIndex), 0.16);
    scores.forEach((score, axisIndex) => {
      const point = radarPoint(cx, cy, radius, scores.length, axisIndex, Math.max(0, Math.min(score, 1)));
      addChartHit(canvas, pointHit(point.x, point.y, 11, makeChartTooltip(`${row.label} · ${axes[axisIndex]}`, chartTooltipLines(row, 0, [`${axes[axisIndex]}：${Math.round(score * 100)}%`]))));
    });
  });
}

function drawBudgetRadar(ctx, width, height, rows, canvas) {
  const usableRows = rows.filter((row) => row.value > 0).slice(0, 8);
  const radarRows = usableRows.length >= 3 ? usableRows : rows.slice(0, 3);
  const axes = radarRows.map((row) => row.label);
  const cx = width / 2;
  const cy = height / 2 + 4;
  const radius = Math.min(width, height) * 0.26;
  const max = Math.max(...radarRows.map((row) => row.value), 1);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const scores = radarRows.map((row) => row.value / max);

  drawRadarFrame(ctx, cx, cy, radius, axes);
  drawRadarShape(ctx, cx, cy, radius, scores, semanticColor("teal"), 0.2);

  radarRows.forEach((row, index) => {
    const point = radarPoint(cx, cy, radius, axes.length, index, Math.max(0, Math.min(row.value / max, 1)));
    ctx.fillStyle = row.color || palette(index);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    addChartHit(canvas, pointHit(point.x, point.y, 12, makeChartTooltip(chartTooltipTitle(row), chartTooltipLines(row, total, [`峰值比例：${percentText(row.value / max)}`]))));
  });

  drawText(ctx, "峰值", cx, cy - radius - 46, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
  drawText(ctx, compactChartValue(max, rows), cx, cy - radius - 28, { size: 14, weight: 900, color: semanticColor("teal"), align: "center" });
  drawText(ctx, `合计 ${compactChartValue(total, rows)}`, cx, cy + radius + 42, { size: 13, weight: 900, color: semanticColor("deep"), align: "center" });
}

function drawVisualRadar(ctx, width, height, rows, state = visualState, canvas) {
  if (state.dataset === "ratings") {
    drawRatingRadar(ctx, width, height, rows, canvas);
    return;
  }
  if (state.dataset === "customProgress") {
    drawProgressRadar(ctx, width, height, rows, canvas);
    return;
  }
  drawBudgetRadar(ctx, width, height, rows, canvas);
}

function drawProgressRadar(ctx, width, height, rows, canvas) {
  const radarRows = rows.slice(0, 8);
  if (radarRows.length === 0) return;
  const axes = radarRows.map((row) => row.label);
  const cx = width / 2;
  const cy = height / 2 + 4;
  const radius = Math.min(width, height) * 0.26;
  const scores = radarRows.map((row) => Math.max(0, Math.min(row.rate || 0, 1)));
  const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

  drawRadarFrame(ctx, cx, cy, radius, axes);
  drawRadarShape(ctx, cx, cy, radius, scores, semanticColor("blue"), 0.2);
  radarRows.forEach((row, index) => {
    const point = radarPoint(cx, cy, radius, axes.length, index, scores[index]);
    ctx.fillStyle = row.color || palette(index);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    addChartHit(canvas, pointHit(point.x, point.y, 12, makeChartTooltip(chartTooltipTitle(row), chartTooltipLines(row, 0))));
  });

  drawText(ctx, "平均完成", cx, cy - radius - 46, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
  drawText(ctx, percentText(average), cx, cy - radius - 28, { size: 14, weight: 900, color: semanticColor("blue"), align: "center" });
  drawText(ctx, `${rows.length} 项自定义进度`, cx, cy + radius + 42, { size: 13, weight: 900, color: semanticColor("deep"), align: "center" });
}

function drawVisualSankey(ctx, width, height, rows, canvas) {
  if (visualState.dataset === "categories" || analysisVisualState.dataset === "categories") {
    drawDetailedVisualSankey(ctx, width, height, canvas);
    return;
  }
  const total = Math.max(rows.reduce((sum, row) => sum + row.value, 0), 1);
  const visibleRows = getShareRows(rows, width < 620 ? 5 : 8).map((row, index) => ({
    ...row,
    flowValue: row.value,
    color: row.color || palette(index),
  }));
  const leftX = 34;
  const sourceW = 108;
  const rightX = width - 210;
  const nodeW = 138;
  const top = 44;
  const usableH = height - 92;
  const nodes = positionedFlowNodes(visibleRows, "flowValue", rightX, nodeW, top, usableH, 10, (row, index) => row.color || palette(index));
  const sourceH = Math.min(usableH * 0.78, Math.max(84, usableH * 0.66));
  const sourceY = top + (usableH - sourceH) / 2;

  nodes.forEach((node) => {
    const lineW = Math.max(4, (node.row.flowValue / total) * sourceH * 0.72);
    drawFlowLink(ctx, leftX + sourceW, sourceY + sourceH / 2, node.x, node.cy, lineW, node.color, 0.44);
    addChartHit(canvas, rectHit(leftX + sourceW, Math.min(sourceY + sourceH / 2, node.cy) - 12, Math.max(10, node.x - leftX - sourceW), Math.abs(node.cy - (sourceY + sourceH / 2)) + 24, makeChartTooltip(chartTooltipTitle(node.row), chartTooltipLines(node.row, total))));
  });

  ctx.fillStyle = semanticColor("deep");
  roundRect(ctx, leftX, sourceY, sourceW, sourceH, 9);
  ctx.fill();
  drawText(ctx, "合计", leftX + sourceW / 2, sourceY + sourceH / 2 - 14, { color: "#fff", weight: 900, align: "center", baseline: "middle" });
  drawText(ctx, compactMoney(total), leftX + sourceW / 2, sourceY + sourceH / 2 + 14, { color: "#fff", size: 14, weight: 900, align: "center", baseline: "middle" });
  addChartHit(canvas, rectHit(leftX, sourceY, sourceW, sourceH, makeChartTooltip("合计", [`总额：${money.format(total)}`])));

  nodes.forEach((node) => {
    const label = node.row.label.length > 8 ? `${node.row.label.slice(0, 8)}...` : node.row.label;
    drawFundNode(ctx, { ...node, label, valueText: `${compactMoney(node.row.flowValue)} · ${percentText(node.row.flowValue / total)}` }, node.color, { labelSize: 12, valueSize: 11 });
    addChartHit(canvas, rectHit(node.x, node.y, node.w, node.h, makeChartTooltip(chartTooltipTitle(node.row), chartTooltipLines(node.row, total))));
  });
  drawText(ctx, "来源", leftX + sourceW / 2, 22, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
  drawText(ctx, "流向", rightX + nodeW / 2, 22, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
}

function drawDetailedVisualSankey(ctx, width, height, canvas) {
  const data = fundFlowData();
  const usageRows = data.usageRows.length > 0 ? data.usageRows : data.budgetRows;
  const total = Math.max(data.usageTotal || usageRows.reduce((sum, row) => sum + row.used, 0), 1);
  const categoryRows = [
    { key: "labor", label: "人员", value: usageRows.reduce((sum, row) => sum + (row.breakdown?.labor || 0), 0), color: activeCategoryColor("labor") },
    { key: "equipment", label: "器材", value: usageRows.reduce((sum, row) => sum + (row.breakdown?.equipment || 0), 0), color: activeCategoryColor("equipment") },
    { key: "production", label: "生产", value: usageRows.reduce((sum, row) => sum + (row.breakdown?.production || 0), 0), color: activeCategoryColor("production") },
  ].filter((row) => row.value > 0);
  const detailRows = aggregateDetails(usageRows.flatMap((row) => rowUsageDetails(row)), width < 720 ? 7 : 11, "其他公司/明细");
  const leftX = 34;
  const sourceW = 112;
  const midX = Math.max(210, width * 0.43);
  const midW = 136;
  const rightX = width - 220;
  const rightW = 168;
  const top = 44;
  const usableH = height - 92;
  const sourceH = Math.min(usableH * 0.78, Math.max(92, usableH * 0.68));
  const sourceY = top + (usableH - sourceH) / 2;
  const categoryNodes = positionedFlowNodes(categoryRows, "value", midX, midW, top + 20, Math.max(90, usableH - 40), 18, (row) => row.color);
  const detailNodes = positionedFlowNodes(detailRows, "value", rightX, rightW, top, usableH, 8, (row) => row.color || classifyFundDetail(row).color);

  categoryNodes.forEach((node) => {
    const lineW = Math.max(4, (node.row.value / total) * sourceH * 0.72);
    drawFlowLink(ctx, leftX + sourceW, sourceY + sourceH / 2, node.x, node.cy, lineW, node.color, 0.44);
  });

  ctx.fillStyle = semanticColor("deep");
  roundRect(ctx, leftX, sourceY, sourceW, sourceH, 9);
  ctx.fill();
  drawText(ctx, "合计", leftX + sourceW / 2, sourceY + sourceH / 2 - 16, { color: "#fff", weight: 900, align: "center", baseline: "middle" });
  drawText(ctx, compactMoney(total), leftX + sourceW / 2, sourceY + sourceH / 2 + 12, { color: "#fff", size: 14, weight: 900, align: "center", baseline: "middle" });
  addChartHit(canvas, rectHit(leftX, sourceY, sourceW, sourceH, makeChartTooltip("合计", [`实际已用：${money.format(total)}`])));

  categoryNodes.forEach((node) => {
    drawFundNode(ctx, { ...node, label: node.row.label, valueText: `${compactMoney(node.row.value)} · ${percentText(node.row.value / total)}` }, node.color);
    addChartHit(canvas, rectHit(node.x, node.y, node.w, node.h, makeChartTooltip(node.row.label, [`实际已用：${money.format(node.row.value)}`, `占比：${percentText(node.row.value / total)}`])));
  });

  detailNodes.forEach((node) => {
    const label = node.row.label.length > 10 ? `${node.row.label.slice(0, 10)}...` : node.row.label;
    drawFundNode(ctx, { ...node, label, valueText: `${compactMoney(node.row.value)} · ${node.row.type || "明细"}` }, node.color, { labelSize: 11, valueSize: 10 });
    addChartHit(canvas, rectHit(node.x, node.y, node.w, node.h, makeChartTooltip(node.row.label, [`类型：${node.row.type || "明细"}`, `金额：${money.format(node.row.value)}`, node.row.meta ? `来源：${node.row.meta}` : ""])));
  });

  categoryNodes.forEach((categoryNode) => {
    const matchingDetails = detailNodes.filter((detailNode) => classifyFundDetail(detailNode.row).key === categoryNode.row.key);
    const maxDetail = Math.max(...matchingDetails.map((detailNode) => detailNode.row.value), 1);
    matchingDetails.forEach((detailNode, detailIndex) => {
      const lineW = Math.max(2, (detailNode.row.value / maxDetail) * Math.min(categoryNode.h * 0.46, 18));
      const offset = (detailIndex - (matchingDetails.length - 1) / 2) * Math.max(4, Math.min(12, lineW + 2));
      drawFlowLink(ctx, categoryNode.x + categoryNode.w, categoryNode.cy + offset, detailNode.x, detailNode.cy, lineW, detailNode.color, 0.38);
    });
  });

  drawText(ctx, "来源", leftX + sourceW / 2, 22, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
  drawText(ctx, "用途", midX + midW / 2, 22, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
  drawText(ctx, "公司 / 明细", rightX + rightW / 2, 22, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
}

function drawGrid(ctx, pad, width, height, plotH) {
  ctx.strokeStyle = semanticColor("grid");
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }
}

function palette(index) {
  const colors = displaySettings.colorBlindMode
    ? displaySettings.darkMode
      ? ["#66bfff", "#ffd166", "#00d19a", "#ff9b45", "#f0a6d9", "#7ad7ff", "#f2f0e9", "#a7a398"]
      : ["#0072b2", "#e69f00", "#009e73", "#d55e00", "#cc79a7", "#56b4e9", "#000000", "#999999"]
    : displaySettings.darkMode
      ? ["#35c2ad", "#7aa7ff", "#ff7968", "#f6bd4f", "#b59cff", "#8fce73", "#7ad7ff", "#d69b68"]
      : ["#157a6e", "#2867b2", "#c84c39", "#c98a1c", "#6b5aa6", "#477a38", "#173f52", "#945f35"];
  return colors[index % colors.length];
}

function roundRect(ctx, x, y, width, height, radius) {
  if (width <= 0 || height <= 0) return;
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function compactMoney(value) {
  if (value >= 10000) {
    return `${Math.round(value / 1000) / 10}万`;
  }
  return number.format(Math.round(value));
}

function compactChartValue(value, rowsOrRow = null) {
  const hasUnit = Array.isArray(rowsOrRow) ? rowsOrRow.some((row) => row.unit) : Boolean(rowsOrRow?.unit);
  return hasUnit ? formatProgressNumber(value) : compactMoney(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderHeader() {
  const progress = activeProgressStats();
  document.querySelector("#projectTitle").textContent = project.title;
  document.querySelector("#projectMeta").textContent =
    isCustomInputMode()
      ? `${blankMode ? "空白测试版 · " : ""}${project.plannedDays} 天计划 · 当前第 ${project.currentDay} 天 · ${progress.rows.length} 项自定义进度`
      : `${blankMode ? "空白测试版 · " : ""}${project.plannedDays} 天计划 · 当前第 ${project.currentDay} 天 · ${project.totalScenes} 场戏`;
}

function renderKpis() {
  const spent = totalSpent();
  const remaining = project.budget - spent;
  const progress = activeProgressStats();
  const spentRate = project.budget > 0 ? spent / project.budget : 0;
  const progressRate = progress.rate;
  setText("#progressMetricLabel", modeText("拍摄进度", "完成进度"));
  document.querySelector("#totalBudget").textContent = money.format(project.budget);
  document.querySelector("#spentBudget").textContent = money.format(spent);
  document.querySelector("#spentPercent").textContent = `已用 ${Math.round(spentRate * 100)}%`;
  document.querySelector("#remainingBudget").textContent = money.format(remaining);
  document.querySelector("#remainingHint").textContent = `平均还可支撑 ${money.format(remaining / (project.plannedDays - project.currentDay || 1))}/天`;
  document.querySelector("#shootProgress").textContent = `${Math.round(progressRate * 100)}%`;
  document.querySelector("#sceneProgress").textContent = progress.detailText;
  document.querySelector("#budgetRatioLabel").textContent = `预算 ${Math.round(spentRate * 100)}% · 完成 ${Math.round(progressRate * 100)}%`;
  document.querySelector("#budgetProgressMetrics").innerHTML = `
    <div class="comparison-metric"><strong>${Math.round(spentRate * 100)}%</strong><span>预算消耗</span></div>
    <div class="comparison-metric"><strong>${Math.round(progressRate * 100)}%</strong><span>完成进度</span></div>
    <div class="comparison-metric"><strong>${Math.abs(Math.round((spentRate - progressRate) * 100))}点</strong><span>${spentRate >= progressRate ? "预算快于进度" : "进度快于预算"}</span></div>
  `;

  const delta = riskDelta();
  const badge = document.querySelector("#riskBadge");
  if (delta > 0.12) {
    badge.textContent = `预算快于进度 ${Math.round(delta * 100)} 个点`;
    badge.className = "status-pill warning";
  } else if (delta < -0.04) {
    badge.textContent = "进度领先预算";
    badge.className = "status-pill good";
  } else {
    badge.textContent = "预算与进度基本同步";
    badge.className = "status-pill";
  }
}

function renderToday() {
  setText("#overviewTitle", modeText("今日预算与拍摄状态", "项目预算与执行状态"));
  setText("#dailyCostTitle", modeText("每日成本趋势", "执行成本趋势"));
  setText("#dailyCostHint", modeText("按通告单估算", "按执行记录估算"));
  setText("#todayPanelTitle", modeText("今日通告", "当前执行记录"));
  setText("#focusTodayLabel", modeText("今日通告", "执行记录"));
  const today = callSheets.find((sheet) => sheet.day === project.currentDay) || callSheets[callSheets.length - 1];
  if (!today) {
    document.querySelector("#todayCode").textContent = "--";
    document.querySelector("#todayCallsheet").innerHTML = `<p>${modeText("暂无通告单，请在录入端添加每日拍摄安排。", "暂无执行记录，请在录入端添加项目节点或执行安排。")}</p>`;
    return;
  }
  document.querySelector("#todayCode").textContent = today.code;
  document.querySelector("#todayCallsheet").innerHTML = `
    <div class="today-title">${today.title}</div>
    <div class="today-meta">
      <span class="tag">${today.date}</span>
      <span class="tag">${today.callTime} ${modeText("开工", "开始")}</span>
      <span class="tag">${today.weather}</span>
      <span class="tag">${today.location}</span>
    </div>
    <div class="today-stat-grid">
      <div class="stat-box"><strong>${money.format(dayTotal(today))}</strong><span>${modeText("当日预计成本", "本次预计成本")}</span></div>
      <div class="stat-box"><strong>${modeText(today.scenes.join(" / ") || "--", `${today.departments.length} 个部门`)}</strong><span>${modeText("今日场次", "参与部门")}</span></div>
      <div class="stat-box"><strong>${modeText(today.extra.meals, today.extra.vehicles + today.extra.rooms)}</strong><span>${modeText("餐食份数", "资源数量")}</span></div>
    </div>
    <p>${modeText("涉及", "参与")} ${today.departments.map((id) => getDept(id).name).join("、")}；${modeText("演员与现场人员", "备注 / 交付对象")}：${today.cast}。</p>
  `;
}

function renderCallsheetSelect() {
  const select = document.querySelector("#callsheetSelect");
  setText("#callsheetTitle", modeText("每日通告单", "执行记录"));
  setText("#callsheetSelectLabel", modeText("拍摄日", "记录"));
  setText("#dailyBarsTitle", modeText("按天成本", "记录成本"));
  setText("#dailyBarsHint", modeText("预计支出", "执行支出"));
  select.innerHTML = callSheets
    .map((sheet) => `<option value="${sheet.day}">${modeText(`第 ${sheet.day} 天`, `#${sheet.day}`)} · ${sheet.title}</option>`)
    .join("");
  const selected = callSheets.find((sheet) => sheet.day === project.currentDay) || callSheets[callSheets.length - 1];
  if (selected) {
    select.value = String(selected.day);
  }
}

function renderCallsheet(day) {
  const sheet = callSheets.find((item) => item.day === day) || callSheets[callSheets.length - 1];
  if (!sheet) {
    document.querySelector("#callsheetDetail").innerHTML = `<p>${modeText("暂无通告单，请在录入端添加。", "暂无执行记录，请在录入端添加。")}</p>`;
    return;
  }
  const sceneItems = scenes.filter((scene) => sheet.scenes.includes(scene.code));
  const hasSceneItems = !isCustomInputMode() && sceneItems.length > 0;
  document.querySelector("#callsheetDetail").innerHTML = `
    <div class="call-header">
      <div>
        <p class="eyebrow">${sheet.code}</p>
        <h3>${modeText(`第 ${sheet.day} 天`, `执行记录 ${sheet.day}`)} · ${sheet.title}</h3>
        <div class="today-meta">
          <span class="tag">${sheet.date}</span>
          <span class="tag">${sheet.location}</span>
          <span class="tag">${sheet.weather}</span>
        </div>
      </div>
      <div class="status-pill ${sheet.day === project.currentDay ? "warning" : ""}">
        ${sheet.day < project.currentDay ? "已完成" : sheet.day === project.currentDay ? modeText("今日执行", "当前执行") : "计划中"}
      </div>
    </div>
    <div class="call-grid">
      <div class="call-block"><span>${modeText("集合时间", "开始时间")}</span><strong>${sheet.callTime}</strong></div>
      <div class="call-block"><span>${modeText("预计收工", "结束时间")}</span><strong>${sheet.wrapTime}</strong></div>
      <div class="call-block"><span>${modeText("当日成本", "记录成本")}</span><strong>${money.format(dayTotal(sheet))}</strong></div>
      <div class="call-block"><span>${modeText("车辆 / 房间", "资源 / 预留")}</span><strong>${sheet.extra.vehicles} / ${sheet.extra.rooms}</strong></div>
    </div>
    <div class="call-grid">
      <div class="call-block"><span>人工</span><strong>${money.format(dayLaborCost(sheet))}</strong></div>
      <div class="call-block"><span>器材</span><strong>${money.format(dayEquipmentCost(sheet))}</strong></div>
      <div class="call-block"><span>${modeText("生产", "其他")}</span><strong>${money.format(dayProductionCost(sheet))}</strong></div>
      <div class="call-block"><span>${modeText("餐食", "数量")}</span><strong>${sheet.extra.meals} ${modeText("份", "项")}</strong></div>
    </div>
    ${
      hasSceneItems
        ? `<h3>拍摄场次</h3>
          <div class="shot-list">
            ${sceneItems
              .map(
                (scene) => `
                  <div class="shot-row">
                    <strong>${scene.code}</strong>
                    <div>${scene.title}<p>${scene.location} · ${scene.pages} 页</p></div>
                    <span class="tag">${scene.status === "done" ? "已拍" : "待拍"}</span>
                    <span class="tag">${scene.risk === "warning" ? "高风险" : scene.risk === "note" ? "关注" : "正常"}</span>
                  </div>
                `,
              )
              .join("")}
          </div>`
        : ""
    }
    <h3 style="margin-top: 18px;">${modeText("部门与演员", "部门与备注")}</h3>
    <p>${sheet.departments.map((id) => getDept(id).name).join("、")}；${sheet.cast}。</p>
  `;
}

function renderDailyBars() {
  if (callSheets.length === 0) {
    document.querySelector("#dailyBars").innerHTML = `<p>暂无通告单数据。</p>`;
    return;
  }
  const max = Math.max(...callSheets.map((sheet) => dayTotal(sheet)), 1);
  document.querySelector("#dailyBars").innerHTML = callSheets
    .map((sheet) => {
      const total = dayTotal(sheet);
      const width = Math.max(8, (total / max) * 100);
      const warning = total > max * 0.88 ? "warning" : "";
      return `
        <div class="daily-bar-row">
          <strong>D${sheet.day}</strong>
          <div class="bar-track"><span class="bar-fill ${warning}" style="width: ${width}%"></span></div>
          <span>${compactMoney(total)}</span>
        </div>
      `;
    })
    .join("");
}

function renderBudgetTables() {
  const spent = departmentSpentMap();
  const budgetRows = departmentBudgetRows();
  const totalDepartmentBudget = budgetRows.reduce((sum, row) => sum + row.value, 0);
  const topBudgetRow = budgetRows[0];
  const budgetShareInsight = document.querySelector("#budgetShareInsight");
  if (budgetShareInsight) {
    budgetShareInsight.textContent = topBudgetRow
      ? `${topBudgetRow.label}最高 · ${percentText(topBudgetRow.value / totalDepartmentBudget)}`
      : modeText("部门预算百分比", "自定义分类预算百分比");
  }
  const budgetDepartments = activeBudgetDepartments();
  document.querySelector("#departmentTable").innerHTML = budgetDepartments.length > 0
    ? budgetDepartments
    .map((department) => {
      const used = spent[department.id];
      const rate = used / department.budget;
      const budgetShare = totalDepartmentBudget > 0 ? department.budget / totalDepartmentBudget : 0;
      const statusClass = rate > 1 ? "over" : rate > 0.82 ? "tight" : "ok";
      const statusText = rate > 1 ? "已超支" : rate > 0.82 ? "需关注" : "健康";
      return `
        <tr>
          <td><strong>${department.name}</strong></td>
          <td>${money.format(department.budget)} · ${percentText(budgetShare)}</td>
          <td>${money.format(used)}</td>
          <td><span class="status-text ${statusClass}">${statusText} · ${Math.round(rate * 100)}%</span></td>
        </tr>
      `;
    })
    .join("")
    : `<tr><td colspan="4">${isCustomInputMode() ? "暂无自定义分类。请先在录入偏好保存自定义部门/分类。" : "暂无部门预算。"}</td></tr>`;

  const categories = spentByCategory();
  document.querySelector("#categoryLegend").innerHTML = Object.entries(categoryNames)
    .map(([key, name]) => `<span class="legend-item"><i class="legend-swatch" style="background:${activeCategoryColor(key)}"></i>${name} ${compactMoney(categories[key])}</span>`)
    .join("");

  renderBudgetShareControls();

  const ratingOn = isRatingEnabled();
  const topPeople = people
    .map((person) => ({
      type: "person",
      label: person.name,
      meta: `${personRoleDisplay(person)} · ${person.vendor || "个人 / 自由职业"} · ${getDept(person.dept).name}`,
      rate: person.dayRate,
      total: personTotal(person),
      grade: normalizeGrade(person.grade),
      companyGrade: normalizeGrade(person.companyGrade),
      trust: normalizeTrust(person.trust),
      fit: budgetFit("person", person.grade, person.dayRate),
      companyFit: budgetFit("company", person.companyGrade, person.dayRate),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
  const topEquipment = equipment
    .map((item) => ({
      type: "company",
      label: item.name,
      meta: `${item.vendor || "未登记公司"} · ${getDept(item.dept).name}`,
      rate: item.daily,
      total: equipmentTotal(item),
      grade: normalizeGrade(item.companyGrade),
      trust: normalizeTrust(item.trust),
      fit: budgetFit("company", item.companyGrade, item.daily),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  document.querySelector("#resourceList").innerHTML = [...topPeople, ...topEquipment]
    .map(
      (item) => `
        <div class="resource-row">
          <div>
            <div class="resource-title-line">
              <strong>${item.label}</strong>
              ${ratingOn ? `<span class="grade-badge">${gradeLabel(item.grade)}</span>` : ""}
              ${ratingOn && item.type === "person" ? `<span class="grade-badge company">${gradeLabel(item.companyGrade)}</span>` : ""}
              ${ratingOn ? `<span class="status-text ${item.fit.className}">${item.fit.label}</span>` : ""}
            </div>
            <span>${item.meta}</span>
            <div class="resource-meta-line">
              <span>${item.type === "person" ? "日薪" : "日租"} ${money.format(item.rate)}</span>
              ${ratingOn && item.type === "person" ? `<span>公司${gradeLabel(item.companyGrade)}${normalizeGrade(item.companyGrade) === "none" ? "" : "级"} · ${item.companyFit.label}</span>` : ""}
              ${ratingOn ? `<span>信任 ${item.trust}</span><span>${item.fit.hint}</span>` : `<span>评分关闭</span>`}
            </div>
          </div>
          <div class="resource-score">
            <strong>${money.format(item.total)}</strong>
            ${ratingOn ? `<span class="status-text ${trustClass(item.trust)}">信任 ${item.trust}</span>` : `<span>评分关闭</span>`}
          </div>
        </div>
      `,
    )
    .join("");
}

function renderBudgetShareControls() {
  const tabs = document.querySelector("#budgetShareChartTypes");
  if (!tabs) return;
  tabs.querySelectorAll("[data-chart]").forEach((button) => {
    const active = button.dataset.chart === budgetShareState.chart;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderAnalysisReport() {
  const metrics = analysisMetrics();
  const badge = document.querySelector("#analysisHealthBadge");
  if (!badge) return;

  badge.textContent = `项目状态：${metrics.health.label}`;
  badge.className = `status-pill ${metrics.health.className}`;

  const varianceText = metrics.variance > 0 ? `预计超支 ${money.format(metrics.variance)}` : `预计节余 ${money.format(Math.abs(metrics.variance))}`;
  const unitLabel = budgetUnitLabel();
  const budgetLabel = budgetBudgetLabel();
  document.querySelector("#analysisNarrative").textContent = `${metrics.health.summary} 当前${metrics.progress.label}为 ${Math.round(metrics.progressRate * 100)}%，预算已消耗 ${Math.round(metrics.spentRate * 100)}%，按现有日均成本推算，完片成本约 ${money.format(metrics.projectedFinal)}，${varianceText}。`;

  document.querySelector("#analysisReportMetrics").innerHTML = `
    <div class="analysis-metric"><span>已用预算</span><strong>${money.format(metrics.spent)}</strong><span>${Math.round(metrics.spentRate * 100)}% of budget</span></div>
    <div class="analysis-metric"><span>${metrics.progress.label}</span><strong>${Math.round(metrics.progressRate * 100)}%</strong><span>${escapeHtml(metrics.progress.detailText)}</span></div>
    <div class="analysis-metric"><span>预计完片成本</span><strong>${money.format(metrics.projectedFinal)}</strong><span>${varianceText}</span></div>
    <div class="analysis-metric"><span>当前日均成本</span><strong>${money.format(metrics.averageDayCost)}</strong><span>剩余 ${metrics.remainingDays} 天</span></div>
  `;

  const category = spentByCategory();
  const topCategory = Object.entries(category).sort((a, b) => b[1] - a[1])[0];
  const categoryLabel = categoryNames[topCategory?.[0]] || "--";
  const completed = completedSheets();
  const peakDay = completed.reduce((best, sheet) => (dayTotal(sheet) > (best ? dayTotal(best) : 0) ? sheet : best), null);
  const rows = departmentAnalysisRows();
  const topRiskDepartments = rows.filter((row) => row.statusClass !== "ok").slice(0, 3);
  const ratingOn = isRatingEnabled();
  const ratingRisk = ratingAlerts().slice(0, 3);

  renderDepartmentShareCharts(rows);

  document.querySelector("#analysisForecastList").innerHTML = `
    <div class="analysis-forecast-item"><span>预算进度差</span><strong>${Math.abs(Math.round(metrics.delta * 100))} 个点</strong><span>${metrics.delta > 0 ? "预算快于进度" : "进度不慢于预算"}</span></div>
    <div class="analysis-forecast-item"><span>最大成本日</span><strong>${peakDay ? `D${peakDay.day} · ${money.format(dayTotal(peakDay))}` : "--"}</strong><span>${peakDay ? peakDay.title : "暂无已完成通告单"}</span></div>
    <div class="analysis-forecast-item"><span>最大费用类型</span><strong>${categoryLabel}</strong><span>${topCategory ? money.format(topCategory[1]) : "--"}</span></div>
    <div class="analysis-forecast-item"><span>${unitLabel}风险数</span><strong>${topRiskDepartments.length}</strong><span>超支或接近预算上限</span></div>
  `;

  document.querySelector("#analysisDepartmentTable").innerHTML = rows
    .slice(0, 10)
    .map(
      (row) => `
        <tr>
          <td><strong>${escapeHtml(row.department.name)}</strong></td>
          <td>${money.format(row.department.budget)}</td>
          <td>${money.format(row.used)}</td>
          <td>${row.remaining >= 0 ? `剩余 ${money.format(row.remaining)}` : `超出 ${money.format(Math.abs(row.remaining))}`}</td>
          <td><span class="status-text ${row.statusClass}">${row.statusText} · ${Math.round(row.rate * 100)}%</span></td>
        </tr>
      `,
    )
    .join("");

  const riskItems = [
    ...topRiskDepartments.map((row) => ({
      className: row.statusClass === "over" ? "over" : "",
      title: `${row.department.name} ${row.statusText}`,
      detail: `已用 ${money.format(row.used)}，占${budgetLabel} ${Math.round(row.rate * 100)}%。`,
    })),
    ...(ratingOn
      ? ratingRisk.map((item) => ({
          className: item.fit.className === "over" || item.trust < 65 ? "over" : "",
          title: item.label,
          detail: `${item.fit.label}，信任 ${item.trust}。`,
        }))
      : []),
  ];
  document.querySelector("#analysisRiskBrief").innerHTML = (riskItems.length > 0 ? riskItems.slice(0, 5) : [{ className: "ok", title: "暂无高风险项", detail: ratingOn ? `${budgetLabel}、等级与信任评分未触发明显风险。` : `${budgetLabel}未触发明显风险，等级评分当前关闭。` }])
    .map((item) => `<div class="analysis-risk-item ${item.className}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div>`)
    .join("");

  const recommendations = [];
  if (metrics.variance > 0) {
    recommendations.push(["锁定完片成本", `预计完片成本高于总预算，建议先冻结非必要新增项，并把未来 ${metrics.remainingDays} 天通告单逐日复核。`]);
  } else {
    recommendations.push(["保持当前节奏", `当前预测仍有 ${money.format(Math.abs(metrics.variance))} 缓冲，建议保留 3%-5% 作为补拍和后期机动。`]);
  }
  if (topRiskDepartments[0]) {
    recommendations.push([`复核高压${unitLabel}`, `${topRiskDepartments.map((row) => row.department.name).join("、")} 已接近或超过预算，建议对排期、供应商报价和追加需求做一次确认。`]);
  }
  if (ratingOn && ratingRisk.length > 0) {
    recommendations.push(["审查人员与供应商", `有 ${ratingRisk.length} 个等级/信任项需要复核，建议补齐合同范围、交付标准和替代报价。`]);
  }
  if (peakDay) {
    recommendations.push(["关注高成本拍摄日", `D${peakDay.day} 是已完成通告单中的高成本日，类似夜戏、雨戏、转场日应提前做单日预算上限。`]);
  }

  document.querySelector("#analysisRecommendations").innerHTML = recommendations
    .map(([title, detail]) => `<div class="analysis-recommendation"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></div>`)
    .join("");

  if (professionalReportState.source === "local" || !professionalReportState.report) {
    renderProfessionalReport(createLocalProfessionalReport(), "local");
  } else {
    renderProfessionalReport(professionalReportState.report, professionalReportState.source);
  }
}

function renderDepartmentShareCharts(rows = departmentAnalysisRows()) {
  renderDepartmentShareChart("overviewDepartmentShare", rows);
  renderDepartmentShareChart("analysisDepartmentShare", rows);
}

function renderDepartmentShareChart(prefix, rows = departmentAnalysisRows()) {
  const stack = document.querySelector(`#${prefix}Stack`);
  const list = document.querySelector(`#${prefix}List`);
  const insight = document.querySelector(`#${prefix}Insight`);
  if (!stack || !list || !insight) return;
  const unitLabel = budgetUnitLabel();

  const shareRows = rows
    .filter((row) => row.used > 0)
    .sort((a, b) => b.used - a.used);
  const total = shareRows.reduce((sum, row) => sum + row.used, 0);

  if (total <= 0) {
    stack.innerHTML = `<div class="department-share-empty">暂无${unitLabel}成本数据</div>`;
    list.innerHTML = "";
    insight.textContent = "等待人员、器材或通告单数据";
    return;
  }

  const visibleRows = shareRows.slice(0, 8);
  const otherTotal = shareRows.slice(8).reduce((sum, row) => sum + row.used, 0);
  const chartRows = otherTotal > 0
    ? [
        ...visibleRows,
        {
          department: { name: `其他${unitLabel}`, color: "#8a8173" },
          used: otherTotal,
          rate: 0,
          remaining: 0,
          statusClass: "ok",
          statusText: "汇总",
        },
      ]
    : visibleRows;

  insight.textContent = `${chartRows[0]?.department.name || unitLabel}最高 · ${money.format(total)} 总额`;
  stack.innerHTML = chartRows
    .map((row, index) => {
      const share = total > 0 ? row.used / total : 0;
      return `<div class="department-share-segment" title="${escapeHtml(row.department.name)} ${money.format(row.used)} · ${percentText(share)}" style="flex-basis:${Math.max(share * 100, 1.5)}%; background:${activeDepartmentColor(row.department, index)}"></div>`;
    })
    .join("");

  list.innerHTML = chartRows
    .map((row, index) => {
      const share = total > 0 ? row.used / total : 0;
      const color = activeDepartmentColor(row.department, index);
      return `
        <div class="department-share-row">
          <i class="department-share-color" style="background:${color}"></i>
          <div>
            <strong>${escapeHtml(row.department.name)}</strong>
            <span>${row.statusText} · 占比 ${percentText(share)}</span>
          </div>
          <div class="department-share-value">${money.format(row.used)}</div>
        </div>
      `;
    })
    .join("");
}

function percentText(value) {
  return `${Math.round(value * 100)}%`;
}

function reportDateLabel(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildProfessionalReportData() {
  const metrics = analysisMetrics();
  const rows = departmentAnalysisRows();
  const category = spentByCategory();
  const completed = completedSheets();
  const peakDay = completed.reduce((best, sheet) => (dayTotal(sheet) > (best ? dayTotal(best) : 0) ? sheet : best), null);
  const ratingRisk = ratingAlerts().slice(0, 8);
  const topPeople = people
    .map((person) => ({ name: person.name, role: personRoleDisplay(person), vendor: person.vendor, dept: getDept(person.dept).name, grade: person.grade, trust: normalizeTrust(person.trust), total: personTotal(person) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
  const topEquipment = equipment
    .map((item) => ({ name: item.name, vendor: item.vendor, dept: getDept(item.dept).name, companyGrade: item.companyGrade, trust: normalizeTrust(item.trust), total: equipmentTotal(item) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
  const upcomingSheets = callSheets
    .filter((sheet) => sheet.day > project.currentDay)
    .slice(0, 5)
    .map((sheet) => ({ day: sheet.day, title: sheet.title, location: sheet.location, departments: sheet.departments.map((id) => getDept(id).name), estimatedCost: dayTotal(sheet) }));

  return {
    project: { ...project },
    status: metrics.health,
    metrics: {
      spent: metrics.spent,
      spentRate: metrics.spentRate,
      progressRate: metrics.progressRate,
      averageDayCost: metrics.averageDayCost,
      remainingDays: metrics.remainingDays,
      projectedFinal: metrics.projectedFinal,
      variance: metrics.variance,
      delta: metrics.delta,
      completedScenes: metrics.stats.count,
      completedPages: metrics.stats.pages,
      progressLabel: metrics.progress.label,
      progressDetail: metrics.progress.detailText,
    },
    categories: Object.entries(category).map(([key, value]) => ({ name: categoryNames[key], value })),
    departments: rows.slice(0, 12).map((row) => ({
      name: row.department.name,
      budget: row.department.budget,
      used: row.used,
      rate: row.rate,
      remaining: row.remaining,
      status: row.statusText,
    })),
    risks: ratingRisk.map((item) => ({
      label: item.label,
      fit: item.fit.label,
      trust: item.trust,
      hint: item.fit.hint,
    })),
    ratingEnabled: isRatingEnabled(),
    topPeople,
    topEquipment,
    peakDay: peakDay ? { day: peakDay.day, title: peakDay.title, location: peakDay.location, total: dayTotal(peakDay) } : null,
    upcomingSheets,
  };
}

function createLocalProfessionalReport() {
  const data = buildProfessionalReportData();
  const { metrics } = data;
  const varianceText = metrics.variance > 0 ? `预计超支 ${money.format(metrics.variance)}` : `预计节余 ${money.format(Math.abs(metrics.variance))}`;
  const highRiskDepartments = data.departments.filter((row) => row.rate > 0.82).slice(0, 5);
  const topCategory = data.categories.slice().sort((a, b) => b.value - a.value)[0];
  const actionItems = [];
  const unitLabel = budgetUnitLabel();
  const budgetLabel = budgetBudgetLabel();

  if (metrics.variance > 0) {
    actionItems.push(`立即设定未来 ${metrics.remainingDays} 天单日成本上限，冻结非必要新增人员、器材和场地追加。`);
  } else {
    actionItems.push(`保留至少 3%-5% 机动预算，用于补拍、天气变化、后期交付和突发场地成本。`);
  }
  if (highRiskDepartments.length > 0) {
    actionItems.push(`要求 ${highRiskDepartments.map((row) => row.name).join("、")} 在下一轮通告前提交剩余需求和报价复核。`);
  }
  if (data.risks.length > 0) {
    actionItems.push(`对低信任或报价偏离等级的人员/供应商补齐合同范围、交付标准和替代报价。`);
  }
  if (data.upcomingSheets.length > 0) {
    actionItems.push(`逐日复核未来 ${data.upcomingSheets.length} 张通告单，重点检查转场、夜戏、住宿、车辆和场地费。`);
  }

  return {
    title: `${project.title} 制片经营报告`,
    subtitle: `${reportDateLabel()} · 面向监制 / 制片厂`,
    summary: `${data.status.summary} 截至当前，项目完成 ${percentText(metrics.progressRate)}，预算消耗 ${percentText(metrics.spentRate)}，预计完片成本 ${money.format(metrics.projectedFinal)}，${varianceText}。`,
    kpis: [
      { label: "项目状态", value: data.status.label, note: data.status.summary },
      { label: "已用预算", value: money.format(metrics.spent), note: `${percentText(metrics.spentRate)} of budget` },
      { label: metrics.progressLabel || "完成进度", value: percentText(metrics.progressRate), note: metrics.progressDetail || `${metrics.completedScenes}/${project.totalScenes} 场` },
      { label: "预计完片", value: money.format(metrics.projectedFinal), note: varianceText },
      { label: "日均成本", value: money.format(metrics.averageDayCost), note: `剩余 ${metrics.remainingDays} 天` },
    ],
    sections: [
      {
        title: "一、经营结论",
        paragraphs: [
          `项目当前处于“${data.status.label}”状态，预算与进度偏差为 ${Math.round(metrics.delta * 100)} 个点。`,
          topCategory ? `当前最大费用构成为${topCategory.name}，累计 ${money.format(topCategory.value)}，后续应优先从该项寻找节流空间。` : "当前费用构成数据不足，建议先补齐通告单与人员/器材明细。",
        ],
      },
      {
        title: "二、预算与现金流",
        bullets: [
          `总预算 ${money.format(project.budget)}，已用 ${money.format(metrics.spent)}，预计完片 ${money.format(metrics.projectedFinal)}。`,
          `当前日均成本 ${money.format(metrics.averageDayCost)}，若排期不变，后续 ${metrics.remainingDays} 天会继续影响完片预测。`,
          data.peakDay ? `已完成通告中最高成本日为 D${data.peakDay.day}，单日 ${money.format(data.peakDay.total)}，需复盘同类场景成本。` : "暂无可复盘的已完成通告单成本峰值。",
        ],
      },
      {
        title: `三、${unitLabel}与供应商风险`,
        bullets: highRiskDepartments.length > 0 ? highRiskDepartments.map((row) => `${row.name}：已用 ${money.format(row.used)}，占${budgetLabel} ${percentText(row.rate)}，状态为${row.status}。`) : [`${budgetLabel}未触发明显高风险。`],
      },
      {
        title: "四、执行动作",
        bullets: actionItems,
      },
    ],
  };
}

function normalizeProfessionalReport(report, fallbackText = "") {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return {
      title: `${project.title} AI 专业报告`,
      subtitle: `${reportDateLabel()} · AI 生成`,
      summary: fallbackText || "AI 已返回报告内容。",
      kpis: createLocalProfessionalReport().kpis,
      sections: [{ title: "AI 报告", paragraphs: String(fallbackText || "").split(/\n+/).filter(Boolean) }],
    };
  }
  const local = createLocalProfessionalReport();
  return {
    title: String(report.title || local.title),
    subtitle: String(report.subtitle || `${reportDateLabel()} · AI 生成`),
    summary: String(report.summary || report.executiveSummary || local.summary),
    kpis: Array.isArray(report.kpis) && report.kpis.length > 0 ? report.kpis : local.kpis,
    sections: Array.isArray(report.sections) && report.sections.length > 0 ? report.sections : local.sections,
  };
}

function renderProfessionalReport(report, source = "local") {
  const container = document.querySelector("#professionalReport");
  const status = document.querySelector("#professionalReportStatus");
  if (!container || !status) return;
  const normalized = normalizeProfessionalReport(report);
  const generatedAt = reportDateLabel();
  professionalReportState.source = source;
  professionalReportState.report = normalized;
  professionalReportState.updatedAt = generatedAt;
  professionalReportState.text = professionalReportToText(normalized);

  status.textContent = `${source === "ai" ? "AI 生成" : "本地生成"} · ${generatedAt}`;
  container.innerHTML = `
    <div class="report-cover">
      <h4>${escapeHtml(normalized.title)}</h4>
      <p>${escapeHtml(normalized.subtitle)}</p>
      <p>${escapeHtml(normalized.summary)}</p>
    </div>
    <div class="report-kpi-row">
      ${normalized.kpis
        .slice(0, 5)
        .map((item) => `<div class="report-kpi"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.note || "")}</span></div>`)
        .join("")}
    </div>
    <div class="report-section-grid">
      ${normalized.sections.map(renderReportSection).join("")}
    </div>
  `;
}

function renderReportSection(section) {
  const paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : section.text ? [section.text] : [];
  const bullets = Array.isArray(section.bullets) ? section.bullets : [];
  const actions = Array.isArray(section.actions) ? section.actions : [];
  const listItems = [...bullets, ...actions];
  const wideClass = listItems.length >= 4 || paragraphs.join("").length > 120 ? " wide" : "";
  return `
    <section class="report-section${wideClass}">
      <h5>${escapeHtml(section.title || "报告段落")}</h5>
      ${paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}
      ${listItems.length > 0 ? `<ul>${listItems.map((item) => `<li>${escapeHtml(typeof item === "string" ? item : item.text || item.title || JSON.stringify(item))}</li>`).join("")}</ul>` : ""}
    </section>
  `;
}

function professionalReportToText(report) {
  const lines = [report.title, report.subtitle, "", report.summary, ""];
  report.kpis.forEach((item) => {
    lines.push(`${item.label}：${item.value}${item.note ? `（${item.note}）` : ""}`);
  });
  lines.push("");
  report.sections.forEach((section) => {
    lines.push(section.title || "报告段落");
    (section.paragraphs || (section.text ? [section.text] : [])).forEach((text) => lines.push(text));
    [...(section.bullets || []), ...(section.actions || [])].forEach((item) => lines.push(`- ${typeof item === "string" ? item : item.text || item.title || JSON.stringify(item)}`));
    lines.push("");
  });
  return lines.join("\n").trim();
}

function professionalReportPrompt() {
  const data = buildProfessionalReportData();
  const unitLabel = budgetUnitLabel();
  return `请基于以下制片项目数据，生成一份给监制、制片厂和出品方看的专业制片经营报告。语气要像正式周报/经营简报，直接指出预算风险、进度偏差、${unitLabel}风险、人员/供应商信任问题和下一步审批动作。
只返回 JSON，不要解释，格式为：
{"title":"","subtitle":"","summary":"","kpis":[{"label":"","value":"","note":""}],"sections":[{"title":"一、经营结论","paragraphs":[""]},{"title":"二、预算与现金流","bullets":[""]},{"title":"三、进度与通告风险","bullets":[""]},{"title":"四、${unitLabel}/供应商风险","bullets":[""]},{"title":"五、下一步动作","actions":[""]}]}
要求：内容使用中文；不要编造不存在的数据；金额用人民币口吻；建议要可执行；控制在 900 字以内。
项目数据：${JSON.stringify(data)}`;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function renderPersonnelModule() {
  const badge = document.querySelector("#personnelModuleBadge");
  if (!badge) return;

  const total = people.reduce((sum, person) => sum + personTotal(person), 0);
  const actors = people.filter(isActorPerson);
  const averageDayRate = people.length > 0 ? Math.round(people.reduce((sum, person) => sum + person.dayRate, 0) / people.length) : 0;
  const averageTrust = people.length > 0 ? Math.round(people.reduce((sum, person) => sum + normalizeTrust(person.trust), 0) / people.length) : 0;
  const vendorCount = new Set(people.map((person) => person.vendor || "个人 / 自由职业")).size;
  const ratingOn = isRatingEnabled();
  const riskyPeople = ratingOn
    ? people.filter((person) => {
        const fit = budgetFit("person", person.grade, person.dayRate);
        const companyFit = budgetFit("company", person.companyGrade, person.dayRate);
        return fit.className === "over" || companyFit.className === "over" || normalizeTrust(person.trust) < 65;
      })
    : [];
  badge.textContent = ratingOn ? (riskyPeople.length > 0 ? `${riskyPeople.length} 个需复核` : "人员状态稳定") : "评分关闭";
  badge.className = `status-pill ${ratingOn && riskyPeople.length > 0 ? "note" : "good"}`;

  document.querySelector("#personnelSummaryMetrics").innerHTML = `
    <div class="module-summary-card"><span>人员数量</span><strong>${people.length}</strong><small>已录入人员</small></div>
    <div class="module-summary-card"><span>人工总成本</span><strong>${money.format(total)}</strong><small>日薪 + 天数 + 补贴</small></div>
    <div class="module-summary-card"><span>平均日薪</span><strong>${money.format(averageDayRate)}</strong><small>按人员条目均值</small></div>
    <div class="module-summary-card"><span>${ratingOn ? "平均信任" : "供应商"}</span><strong>${ratingOn ? averageTrust : vendorCount}</strong><small>${ratingOn ? `${vendorCount} 个公司 / 供应商 · ${actors.length} 位演员` : `评分关闭 · ${actors.length} 位演员`}</small></div>
  `;

  const departmentRows = peopleByDepartmentRows();
  const maxDepartmentTotal = Math.max(...departmentRows.map((row) => row.total), 1);
  document.querySelector("#personnelDepartmentList").innerHTML = departmentRows
    .map((row) => {
      const width = Math.max(8, (row.total / maxDepartmentTotal) * 100);
      return `
        <div class="module-bar-row">
          <div class="module-row-head">
            <strong>${escapeHtml(row.department.name)}</strong>
            <span>${row.members.length} 人 · ${compactMoney(row.total)}</span>
          </div>
          <div class="bar-track"><span class="bar-fill" style="width:${width}%"></span></div>
          <span>${ratingOn ? `平均信任 ${row.averageTrust}` : "按成本排序"}</span>
        </div>
      `;
    })
    .join("");

  document.querySelector("#personnelRiskList").innerHTML = (riskyPeople.length > 0 ? riskyPeople : people.slice().sort((a, b) => personTotal(b) - personTotal(a)).slice(0, 4))
    .slice(0, 6)
    .map((person) => {
      const fit = budgetFit("person", person.grade, person.dayRate);
      const trust = normalizeTrust(person.trust);
      const className = ratingOn ? (fit.className === "over" || trust < 65 ? "over" : fit.className === "tight" ? "" : "ok") : "ok";
      return `
        <div class="module-risk-item ${className}">
          <strong>${escapeHtml(person.name)} · ${escapeHtml(personRoleDisplay(person))}</strong>
          <span>${escapeHtml(person.vendor || "个人 / 自由职业")} · ${ratingOn ? `${fit.label} · 信任 ${trust}` : "评分关闭"} · ${money.format(personTotal(person))}</span>
        </div>
      `;
    })
    .join("");

  document.querySelector("#personnelTable").innerHTML = people
    .slice()
    .sort((a, b) => personTotal(b) - personTotal(a))
    .map((person) => {
      const fit = budgetFit("person", person.grade, person.dayRate);
      const trust = normalizeTrust(person.trust);
      return `
        <tr>
          <td><strong>${escapeHtml(person.name)}</strong></td>
          <td>${escapeHtml(getDept(person.dept).name)}</td>
          <td>${escapeHtml(personRoleDisplay(person))}</td>
          <td>${escapeHtml(person.vendor || "个人 / 自由职业")}</td>
          <td>${ratingOn ? `<span class="grade-badge">${escapeHtml(gradeLabel(person.grade, "人"))}</span> <span class="grade-badge company">${escapeHtml(gradeLabel(person.companyGrade, "司"))}</span>` : "关闭"}</td>
          <td>${ratingOn ? `<span class="status-text ${trustClass(trust)}">${trust}</span>` : "关闭"}</td>
          <td>${money.format(personTotal(person))}</td>
          <td><span class="status-text ${fit.className}">${ratingOn ? fit.label : "评分关闭"}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderEquipmentModule() {
  const badge = document.querySelector("#equipmentModuleBadge");
  if (!badge) return;

  const total = equipment.reduce((sum, item) => sum + equipmentTotal(item), 0);
  const rentalTotal = equipment.reduce((sum, item) => sum + item.daily * item.days, 0);
  const depositTotal = equipment.reduce((sum, item) => sum + item.deposit, 0);
  const averageTrust = equipment.length > 0 ? Math.round(equipment.reduce((sum, item) => sum + normalizeTrust(item.trust), 0) / equipment.length) : 0;
  const vendorCount = new Set(equipment.map((item) => item.vendor || "未登记公司")).size;
  const ratingOn = isRatingEnabled();
  const riskyItems = ratingOn
    ? equipment.filter((item) => {
        const fit = budgetFit("company", item.companyGrade, item.daily);
        return fit.className === "over" || normalizeTrust(item.trust) < 65;
      })
    : [];
  badge.textContent = ratingOn ? (riskyItems.length > 0 ? `${riskyItems.length} 个需复核` : "器材状态稳定") : "评分关闭";
  badge.className = `status-pill ${ratingOn && riskyItems.length > 0 ? "note" : "good"}`;

  document.querySelector("#equipmentSummaryMetrics").innerHTML = `
    <div class="module-summary-card"><span>器材条目</span><strong>${equipment.length}</strong><small>已录入器材</small></div>
    <div class="module-summary-card"><span>器材总成本</span><strong>${money.format(total)}</strong><small>租赁 + 押金 / 固定项</small></div>
    <div class="module-summary-card"><span>租赁费用</span><strong>${money.format(rentalTotal)}</strong><small>按日租和天数</small></div>
    <div class="module-summary-card"><span>押金 / 固定</span><strong>${money.format(depositTotal)}</strong><small>${vendorCount} 个供应商 · ${ratingOn ? `信任 ${averageTrust}` : "评分关闭"}</small></div>
  `;

  const departmentRows = equipmentByDepartmentRows();
  const maxDepartmentTotal = Math.max(...departmentRows.map((row) => row.total), 1);
  document.querySelector("#equipmentDepartmentList").innerHTML = departmentRows
    .map((row) => {
      const width = Math.max(8, (row.total / maxDepartmentTotal) * 100);
      return `
        <div class="module-bar-row">
          <div class="module-row-head">
            <strong>${escapeHtml(row.department.name)}</strong>
            <span>${row.items.length} 项 · ${compactMoney(row.total)}</span>
          </div>
          <div class="bar-track"><span class="bar-fill" style="width:${width}%"></span></div>
          <span>${ratingOn ? `平均信任 ${row.averageTrust}` : "按成本排序"}</span>
        </div>
      `;
    })
    .join("");

  document.querySelector("#equipmentRiskList").innerHTML = (riskyItems.length > 0 ? riskyItems : equipment.slice().sort((a, b) => equipmentTotal(b) - equipmentTotal(a)).slice(0, 4))
    .slice(0, 6)
    .map((item) => {
      const fit = budgetFit("company", item.companyGrade, item.daily);
      const trust = normalizeTrust(item.trust);
      const className = ratingOn ? (fit.className === "over" || trust < 65 ? "over" : fit.className === "tight" ? "" : "ok") : "ok";
      return `
        <div class="module-risk-item ${className}">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(item.vendor || "未登记公司")} · ${ratingOn ? `${fit.label} · 信任 ${trust}` : "评分关闭"} · ${money.format(equipmentTotal(item))}</span>
        </div>
      `;
    })
    .join("");

  document.querySelector("#equipmentTable").innerHTML = equipment
    .slice()
    .sort((a, b) => equipmentTotal(b) - equipmentTotal(a))
    .map((item) => {
      const fit = budgetFit("company", item.companyGrade, item.daily);
      return `
        <tr>
          <td><strong>${escapeHtml(item.name)}</strong></td>
          <td>${escapeHtml(getDept(item.dept).name)}</td>
          <td>${escapeHtml(item.vendor || "未登记公司")}</td>
          <td>${ratingOn ? `<span class="grade-badge company">${escapeHtml(gradeLabel(item.companyGrade))}</span>` : "关闭"}</td>
          <td>${money.format(item.daily)}</td>
          <td>${item.days}</td>
          <td>${money.format(item.deposit)}</td>
          <td>${money.format(equipmentTotal(item))}</td>
          <td><span class="status-text ${fit.className}">${ratingOn ? fit.label : "评分关闭"}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderProgress() {
  const stats = completedSceneStats();
  const progress = activeProgressStats();
  const customModeWithProgress = isCustomInputMode();
  const completedForAverage = callSheets.filter((sheet) => sheet.day <= project.currentDay);
  const averageBase = completedForAverage.length > 0 ? completedForAverage : callSheets;
  const delayCost = averageBase.length > 0 ? Math.round(averageBase.reduce((sum, sheet) => sum + dayTotal(sheet), 0) / averageBase.length) : 0;
  const completedScenes = Math.min(stats.count, project.totalScenes);
  const remainingScenes = Math.max(project.totalScenes - completedScenes, 0);
  const editDone = Math.max(0, Math.round(completedScenes * 0.72));
  const editTodo = Math.max(completedScenes - editDone, 0);
  const editRate = completedScenes > 0 ? editDone / completedScenes : 0;
  document.querySelector("#progressChips").innerHTML = customModeWithProgress
    ? `
      <span class="progress-chip">${Math.round(progress.rate * 100)}% 自定义</span>
      <span class="progress-chip">${progress.rows.length} 项指标</span>
      <span class="progress-chip">第 ${project.currentDay}/${project.plannedDays} 天</span>
    `
    : `
      <span class="progress-chip">${stats.count}/${project.totalScenes} 场</span>
      <span class="progress-chip">${stats.pages}/${project.totalPages} 页</span>
      <span class="progress-chip">第 ${project.currentDay}/${project.plannedDays} 天</span>
    `;
  const editInsight = document.querySelector("#editProgressInsight");
  if (editInsight) {
    editInsight.textContent = customModeWithProgress ? `${progress.detailText}` : `剪辑 ${Math.round(editRate * 100)}% · 未拍 ${remainingScenes} 场`;
  }
  const editSummary = document.querySelector("#editProgressSummary");
  if (editSummary) {
    editSummary.innerHTML = customModeWithProgress
      ? `
        <div class="edit-progress-card"><strong>${Math.round(progress.rate * 100)}%</strong><span>综合完成</span></div>
        <div class="edit-progress-card"><strong>${progress.rows.length}</strong><span>进度项</span></div>
        <div class="edit-progress-card"><strong>${progress.top ? progress.top.label : "--"}</strong><span>最高进度</span></div>
        <div class="edit-progress-card"><strong>${progress.low ? progress.low.label : "--"}</strong><span>最低进度</span></div>
      `
      : `
        <div class="edit-progress-card"><strong>${Math.round(editRate * 100)}%</strong><span>剪辑进度</span></div>
        <div class="edit-progress-card"><strong>${completedScenes}</strong><span>已完成场次</span></div>
        <div class="edit-progress-card"><strong>${remainingScenes}</strong><span>未完成场次</span></div>
        <div class="edit-progress-card"><strong>${editTodo}</strong><span>已拍待剪</span></div>
      `;
  }
  const listTitle = document.querySelector("#progressListTitle");
  const listHint = document.querySelector("#progressListHint");
  if (listTitle) listTitle.textContent = customModeWithProgress ? "自定义追踪" : "场次追踪";
  if (listHint) listHint.textContent = customModeWithProgress ? "已完成 / 目标 / 完成率" : "已拍 / 待拍 / 风险";
  document.querySelector("#sceneList").innerHTML = customModeWithProgress
    ? progress.rows.length > 0
      ? progress.rows
          .map(
            (row) => `
              <div class="scene-row custom-progress-row">
                <span class="scene-code">${Math.round(row.rate * 100)}%</span>
                <div><strong>${escapeHtml(row.label)}</strong><p>${formatProgressNumber(row.done)} / ${formatProgressNumber(row.target)} ${escapeHtml(row.unit)}</p></div>
                <span>${row.rate >= 1 ? "完成" : "进行中"}</span>
                <span class="status-text ${row.rate >= 1 ? "ok" : row.rate >= 0.65 ? "tight" : "over"}">${row.rate >= 1 ? "达成" : row.rate >= 0.65 ? "推进" : "偏慢"}</span>
              </div>
            `,
          )
          .join("")
      : `<div class="custom-role-empty">暂无自定义进度。去录入端添加合同、交付、审批、搭建等指标后，这里会显示追踪结果。</div>`
    : scenes
        .map(
          (scene) => `
            <div class="scene-row">
              <span class="scene-code">${scene.code}</span>
              <div><strong>${scene.title}</strong><p>${scene.location} · ${sceneCount(scene.code)} 场 · ${scene.pages} 页</p></div>
              <span>${scene.status === "done" ? "已拍" : "待拍"}</span>
              <span class="status-text ${scene.risk === "warning" ? "over" : scene.risk === "note" ? "tight" : "ok"}">
                ${scene.risk === "warning" ? "风险" : scene.risk === "note" ? "关注" : "正常"}
              </span>
            </div>
          `,
        )
        .join("");

  const projected = totalSpent() + delayCost * (project.plannedDays - project.currentDay);
  const overage = projected - project.budget;
  const alerts = ratingAlerts();
  const ratingRisk = alerts[0];
  const ratingOn = isRatingEnabled();
  document.querySelector("#riskList").innerHTML = `
    <div class="risk-item">
      <span class="risk-icon ${overage > 0 ? "" : "ok"}">${overage > 0 ? "!" : "✓"}</span>
      <div><strong>按当前日均成本预计${overage > 0 ? "超支" : "节余"} ${money.format(Math.abs(overage))}</strong><p>当前日均成本 ${money.format(delayCost)}，剩余 ${project.plannedDays - project.currentDay} 天。</p></div>
    </div>
    <div class="risk-item">
      <span class="risk-icon note">i</span>
      <div><strong>延期 1 天约增加 ${money.format(delayCost)}</strong><p>包含人工、器材日租、车辆住宿与基础生产支出。</p></div>
    </div>
    <div class="risk-item">
      <span class="risk-icon">!</span>
      <div><strong>第 8-9 天夜戏与雨戏成本偏高</strong><p>灯光、场地、住宿和特技相关费用集中释放。</p></div>
    </div>
    <div class="risk-item">
      <span class="risk-icon ${alerts.length > 0 ? "" : "ok"}">${alerts.length > 0 ? "!" : "✓"}</span>
      <div><strong>${ratingOn ? (alerts.length > 0 ? `${alerts.length} 个等级/信任项需复核` : "等级与信任评分稳定") : "等级评分已关闭"}</strong><p>${ratingOn ? (ratingRisk ? `${ratingRisk.label}：${ratingRisk.fit.label}，信任 ${ratingRisk.trust}。` : "当前人员与公司报价均未触发高风险规则。") : "当前只保留预算、进度和通告成本审查。"}</p></div>
    </div>
  `;
}

function renderInputStats() {
  const departmentBudgetTotal = activeBudgetDepartments().reduce((sum, department) => sum + (Number(department.budget) || 0), 0);
  const allocationDelta = project.budget - departmentBudgetTotal;
  const actorCount = people.filter(isActorPerson).length;
  const customProgressCount = customProgressRows().length;
  document.querySelector("#inputStats").innerHTML = `
    <div class="input-stat"><strong>${money.format(departmentBudgetTotal)}</strong><span>${isCustomInputMode() ? "已分配分类预算" : "已分配组别预算"}</span></div>
    <div class="input-stat"><strong>${allocationDelta >= 0 ? money.format(allocationDelta) : `超 ${money.format(Math.abs(allocationDelta))}`}</strong><span>${allocationDelta >= 0 ? "未分配预算" : "超出总预算"}</span></div>
    <div class="input-stat"><strong>${isCustomInputMode() ? `${people.length} / ${customProgressCount}` : `${people.length} / ${actorCount}`}</strong><span>${isCustomInputMode() ? "人员 / 进度项" : "人员 / 演员"}</span></div>
    <div class="input-stat"><strong>${equipment.length}</strong><span>器材条目</span></div>
  `;
}

function renderDepartmentBudgetInputs() {
  const container = document.querySelector("#departmentBudgetInputs");
  const status = document.querySelector("#budgetAllocationStatus");
  if (!container || !status) return;
  const budgetDepartments = activeBudgetDepartments();
  const total = budgetDepartments.reduce((sum, department) => sum + (Number(department.budget) || 0), 0);
  const delta = project.budget - total;
  status.textContent = delta >= 0 ? `剩余 ${money.format(delta)}` : `超出 ${money.format(Math.abs(delta))}`;
  status.className = delta >= 0 ? "ok" : "over";
  if (isCustomInputMode() && budgetDepartments.length === 0) {
    container.innerHTML = `<div class="custom-role-empty">暂无自定义分类。请先在录入偏好保存部门/分类，再填写预算。</div>`;
    return;
  }
  container.innerHTML = budgetDepartments
    .map((department, index) => {
      const share = project.budget > 0 ? (Number(department.budget) || 0) / project.budget : 0;
      return `
        <label class="department-budget-field">
          <span>
            <i style="background:${activeDepartmentColor(department, index)}"></i>
            ${escapeHtml(department.name)}
          </span>
          <input name="deptBudget_${escapeHtml(department.id)}" type="number" min="0" step="1000" value="${Number(department.budget) || 0}" />
          <small>${percentText(share)} of total</small>
        </label>
      `;
    })
    .join("");
}

function renderPersonnelLayers() {
  const list = document.querySelector("#personnelLayerList");
  const count = document.querySelector("#personnelLayerCount");
  if (!list || !count) return;
  const ratingOn = isRatingEnabled();

  count.textContent = `${people.length} 人`;
  if (people.length === 0) {
    list.innerHTML = `<div class="personnel-layer-empty">还没有保存人员，录入后会按部门和岗位显示在这里。</div>`;
    return;
  }

  list.innerHTML = departments
    .map((department) => {
      const members = people.filter((person) => person.dept === department.id);
      if (members.length === 0) return "";

      const grouped = members.reduce((result, person) => {
        const role = person.role || "未填职位";
        if (!result[role]) result[role] = [];
        result[role].push(person);
        return result;
      }, {});
      const departmentTotal = members.reduce((sum, person) => sum + personTotal(person), 0);
      const roleRows = Object.entries(grouped)
        .map(([role, roleMembers]) => {
          const roleTotal = roleMembers.reduce((sum, person) => sum + personTotal(person), 0);
          const peopleRows = roleMembers
            .map((person) => {
              const personFit = budgetFit("person", person.grade, person.dayRate);
              const trust = normalizeTrust(person.trust);
              const personIndex = people.indexOf(person);
              const roleDisplay = personRoleDisplay(person);
              const detailText = isActorPerson(person) && person.characterName ? `${person.vendor || "个人 / 自由职业"} · 角色：${person.characterName}` : person.vendor || "个人 / 自由职业";
              return `
                <div class="personnel-person-row ${person.id && person.id === lastSavedPersonId ? "recent" : ""}">
                  <div>
                    <strong>${escapeHtml(person.name || "未命名")}</strong>
                    <span>${escapeHtml(detailText)}</span>
                  </div>
                  <div class="personnel-person-meta">
                    ${roleDisplay !== role ? `<span class="person-role-chip">${escapeHtml(roleDisplay)}</span>` : ""}
                    ${ratingOn ? `<span class="grade-badge">${escapeHtml(gradeLabel(person.grade, "人"))}</span>` : ""}
                    ${ratingOn ? `<span class="grade-badge company">${escapeHtml(gradeLabel(person.companyGrade, "司"))}</span>` : ""}
                    ${ratingOn ? `<span class="status-text ${personFit.className}">${personFit.label}</span>` : ""}
                    ${ratingOn ? `<span class="status-text ${trustClass(trust)}">信任 ${trust}</span>` : ""}
                    <strong>${compactMoney(personTotal(person))}</strong>
                    <button class="person-delete-button" type="button" data-person-id="${escapeHtml(person.id || "")}" data-person-index="${personIndex}">删除</button>
                  </div>
                </div>
              `;
            })
            .join("");

          return `
            <div class="personnel-role-row">
              <div class="personnel-role-head">
                <strong>${escapeHtml(role)}</strong>
                <span>${roleMembers.length} 人 · ${compactMoney(roleTotal)}</span>
              </div>
              <div class="personnel-role-people">${peopleRows}</div>
            </div>
          `;
        })
        .join("");

      return `
        <section class="personnel-layer-block">
          <div class="personnel-dept-head">
            <div>
              <i style="background:${activeDepartmentColor(department, inputDepartments({ includeTemplate: !isCustomInputMode() }).findIndex((item) => item.id === department.id))}"></i>
              <strong>${escapeHtml(department.name)}</strong>
            </div>
            <span>${members.length} 人 · ${compactMoney(departmentTotal)}</span>
          </div>
          ${roleRows}
        </section>
      `;
    })
    .join("");
}

function renderActorBudget() {
  const status = document.querySelector("#actorBudgetStatus");
  const summary = document.querySelector("#actorBudgetSummary");
  const list = document.querySelector("#actorBudgetList");
  if (!status || !summary || !list) return;

  const actors = people.filter(isActorPerson);
  const total = actors.reduce((sum, actor) => sum + personTotal(actor), 0);
  const draft = actorDraftFromForm();
  const draftTotal = draft ? personTotal(draft) : 0;
  const hasDraft = Boolean(draft && (draft.name !== "未命名演员" || draft.characterName || draftTotal > 0));
  const average = actors.length > 0 ? Math.round(total / actors.length) : 0;
  const topActor = actors.slice().sort((a, b) => personTotal(b) - personTotal(a))[0];
  const castDepartment = getDept("cast");
  const castBudget = Number(castDepartment.budget) || 0;
  const castShare = castBudget > 0 ? total / castBudget : 0;
  const ratingOn = isRatingEnabled();
  const lowTrust = ratingOn ? actors.filter((actor) => normalizeTrust(actor.trust) < 65).length : 0;

  status.textContent = hasDraft && draftTotal > 0 ? `预估 ${money.format(draftTotal)} · ${actors.length} 位演员` : `${actors.length} 位演员`;
  summary.innerHTML = `
    <div class="actor-budget-card"><span>演员预算</span><strong>${money.format(total)}</strong><small>${castBudget > 0 ? `占演员选角组 ${percentText(castShare)}` : "等待组别预算"}</small></div>
    <div class="actor-budget-card"><span>平均单人</span><strong>${money.format(average)}</strong><small>片酬 + 天数 + 补贴</small></div>
    <div class="actor-budget-card"><span>最高演员</span><strong>${topActor ? escapeHtml(topActor.name) : "--"}</strong><small>${topActor ? money.format(personTotal(topActor)) : "暂无数据"}</small></div>
    <div class="actor-budget-card"><span>本次预估</span><strong>${hasDraft && draftTotal > 0 ? money.format(draftTotal) : "--"}</strong><small>${hasDraft ? `${draft.days || 0} 天${ratingOn ? ` · 信任 ${draft.trust}` : ""}` : ratingOn ? `${lowTrust} 位需复核` : "评分关闭"}</small></div>
  `;

  const draftRow = hasDraft
    ? `
        <div class="actor-budget-row draft">
          <div>
            <strong>待加入：${escapeHtml(draft.name)} · ${escapeHtml(draft.characterName || draft.actorKind || "演员")}</strong>
            <span>${escapeHtml(draft.vendor || "个人 / 自由职业")} · ${draft.days || 0} 天 · ${money.format(draft.dayRate || 0)}/日</span>
          </div>
          <div class="actor-budget-meta">
            ${ratingOn ? `<span class="status-text ${budgetFit("person", draft.grade, draft.dayRate).className}">${draftTotal > 0 ? budgetFit("person", draft.grade, draft.dayRate).label : "待填写"}</span>` : ""}
            ${ratingOn ? `<span class="status-text ${trustClass(draft.trust)}">信任 ${draft.trust}</span>` : ""}
            <strong>${money.format(draftTotal)}</strong>
          </div>
        </div>
      `
    : "";

  if (actors.length === 0 && !hasDraft) {
    list.innerHTML = `<div class="actor-budget-empty">录入演员后，会在这里显示角色、片酬和预算占比。</div>`;
    return;
  }

  const savedRows = actors
    .slice()
    .sort((a, b) => personTotal(b) - personTotal(a))
    .slice(0, 6)
    .map((actor) => {
      const totalCost = personTotal(actor);
      const share = total > 0 ? totalCost / total : 0;
      const fit = budgetFit("person", actor.grade, actor.dayRate);
      return `
        <div class="actor-budget-row ${actor.id && actor.id === lastSavedPersonId ? "recent" : ""}">
          <div>
            <strong>${escapeHtml(actor.name || "未命名")} · ${escapeHtml(actor.characterName || actor.actorKind || "演员")}</strong>
            <span>${escapeHtml(actor.vendor || "个人 / 自由职业")} · ${actor.days} 天 · ${money.format(actor.dayRate)}/日</span>
          </div>
          <div class="actor-budget-meta">
            ${ratingOn ? `<span class="status-text ${fit.className}">${fit.label}</span>` : ""}
            ${ratingOn ? `<span class="status-text ${trustClass(normalizeTrust(actor.trust))}">信任 ${normalizeTrust(actor.trust)}</span>` : ""}
            <strong>${money.format(totalCost)}</strong>
            <span>${percentText(share)}</span>
          </div>
        </div>
      `;
    })
    .join("");
  list.innerHTML = `${draftRow}${savedRows}`;
}

function personDraftFromForm() {
  const form = document.querySelector("#personForm");
  if (!form) return null;
  const dayRate = Math.max(0, Number(form.elements.dayRate.value || 0));
  const days = Math.max(0, Number(form.elements.days.value || 0));
  const allowance = Math.max(0, Number(form.elements.allowance.value || 0));
  const role = form.elements.role.value.trim() || form.elements.rolePreset.value.trim() || "未填职位";
  return {
    name: form.elements.name.value.trim() || "未命名",
    role,
    dept: form.elements.dept.value,
    vendor: form.elements.vendor.value.trim() || "个人 / 自由职业",
    grade: normalizeGrade(form.elements.grade.value),
    companyGrade: normalizeGrade(form.elements.companyGrade.value),
    dayRate,
    days,
    allowance,
    trust: normalizeTrust(form.elements.trust.value),
  };
}

function renderPersonInputFeedback() {
  const draft = personDraftFromForm();
  const panel = document.querySelector("#personFeedback");
  if (!draft || !panel) return;

  const total = draft.dayRate * draft.days + draft.allowance;
  const hasCost = draft.dayRate > 0 && draft.days > 0;
  const fit = budgetFit("person", draft.grade, draft.dayRate);
  const companyFit = budgetFit("company", draft.companyGrade, draft.dayRate);
  const fitClass = fit.className === "over" || companyFit.className === "over" ? "over" : fit.className === "tight" || companyFit.className === "tight" ? "tight" : "ok";
  const department = getDept(draft.dept);
  const ratingOn = isRatingEnabled();

  document.querySelector("#personFeedbackStatus").textContent = hasCost ? `${draft.role} · ${draft.days} 天` : "待录入";
  document.querySelector("#personFeedbackDept").textContent = department.name;
  document.querySelector("#personPreviewTotal").textContent = money.format(total);
  const fitNode = document.querySelector("#personPreviewFit");
  fitNode.textContent = ratingOn ? (hasCost ? `${fit.label} / ${companyFit.label}` : "待填写") : "评分关闭";
  fitNode.className = ratingOn && hasCost ? `status-text ${fitClass}` : "";
  const trustNode = document.querySelector("#personPreviewTrust");
  trustNode.textContent = String(draft.trust);
  trustNode.className = `status-text ${trustClass(draft.trust)}`;
  document.querySelector("#personPreviewGrades").textContent = `${gradeLabel(draft.grade, "人")} / ${gradeLabel(draft.companyGrade, "司")}`;

  const lastSave = document.querySelector("#personLastSave");
  if (!lastSave) return;
  if (!lastPersonFeedback) {
    lastSave.className = "person-last-save";
    lastSave.textContent = "等待保存人员";
    return;
  }
  const savedFit = budgetFit("person", lastPersonFeedback.grade, lastPersonFeedback.dayRate);
  lastSave.className = `person-last-save active ${ratingOn ? savedFit.className : "ok"}`;
  lastSave.innerHTML = `
    <strong>刚加入：${escapeHtml(lastPersonFeedback.name)} · ${escapeHtml(personRoleDisplay(lastPersonFeedback))}</strong>
    <span>${escapeHtml(getDept(lastPersonFeedback.dept).name)} · ${escapeHtml(lastPersonFeedback.vendor || "个人 / 自由职业")} · ${money.format(personTotal(lastPersonFeedback))}</span>
  `;
}

function actorDraftFromForm() {
  const form = document.querySelector("#actorForm");
  if (!form) return null;
  const actorKind = form.elements.actorKind.value || "演员";
  const characterName = form.elements.characterName.value.trim();
  return {
    type: "actor",
    name: form.elements.name.value.trim() || "未命名演员",
    role: actorRoleLabel(actorKind),
    dept: "cast",
    characterName,
    actorKind,
    vendor: form.elements.vendor.value.trim() || "个人 / 自由职业",
    grade: normalizeGrade(form.elements.grade.value),
    companyGrade: normalizeGrade(form.elements.companyGrade.value),
    dayRate: Math.max(0, Number(form.elements.dayRate.value || 0)),
    days: Math.max(0, Number(form.elements.days.value || 0)),
    allowance: Math.max(0, Number(form.elements.allowance.value || 0)),
    trust: normalizeTrust(form.elements.trust.value),
  };
}

function createActorFromForm(form) {
  const draft = actorDraftFromForm();
  return {
    ...draft,
    id: `person-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    days: Math.max(1, getFormNumber(form, "days")),
    dayRate: getFormNumber(form, "dayRate"),
    allowance: getFormNumber(form, "allowance"),
  };
}

function personnelExportRows() {
  return people
    .slice()
    .sort((a, b) => getDept(a.dept).name.localeCompare(getDept(b.dept).name, "zh-CN") || personTotal(b) - personTotal(a))
    .map((person) => {
      const fit = budgetFit("person", person.grade, person.dayRate);
      const companyFit = budgetFit("company", person.companyGrade, person.dayRate);
      return {
        姓名: person.name || "",
        类型: isActorPerson(person) ? "演员" : "剧组人员",
        部门: getDept(person.dept).name,
        职位: person.role || "",
        角色: person.characterName || "",
        演员类型: person.actorKind || "",
        "公司/供应商": person.vendor || "个人 / 自由职业",
        人员等级: gradeLabel(person.grade),
        公司等级: gradeLabel(person.companyGrade),
        "日薪/日片酬": Number(person.dayRate) || 0,
        工作天数: Number(person.days) || 0,
        "补贴/经纪费": Number(person.allowance) || 0,
        信任评分: normalizeTrust(person.trust),
        总成本: personTotal(person),
        报价状态: fit.label,
        公司报价状态: companyFit.label,
      };
    });
}

function downloadCsvFile(rows, filename) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header] ?? "");
          return `"${value.replaceAll('"', '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename.replace(/\.xlsx$/i, ".csv");
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

async function exportPersonnelExcel() {
  const rows = personnelExportRows();
  if (rows.length === 0) {
    setFormStatus("暂无人员可导出", "warning");
    return;
  }
  const filename = `${project.title || "项目"}-人员开销表.xlsx`;
  try {
    const xlsx = await ensureXlsxLoaded();
    const worksheet = xlsx.utils.json_to_sheet(rows);
    worksheet["!cols"] = Object.keys(rows[0]).map((header) => ({ wch: Math.max(12, header.length + 8) }));
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "人员开销");
    xlsx.writeFile(workbook, filename);
    setFormStatus(`已导出人员表：${rows.length} 行`, "good");
  } catch (error) {
    downloadCsvFile(rows, filename);
    setFormStatus(`Excel 导出失败，已改为 CSV：${error.message}`, "warning");
  }
}

function renderVisualExplorerControls() {
  const datasetSelect = document.querySelector("#visualDataset");
  const typeTabs = document.querySelector("#visualChartTypes");
  if (!datasetSelect || !typeTabs) return;
  setSelectOptionText("#visualDataset", "departments", modeText("部门花费", "分类花费"));
  setSelectOptionText("#visualDataset", "departmentBudget", modeText("部门预算", "分类预算"));
  setSelectOptionText("#visualDataset", "personnelShare", modeText("人员占比", "人员分类占比"));
  if (!isRatingEnabled() && visualState.dataset === "ratings") {
    visualState.dataset = "departments";
  }
  if (isCustomInputMode() && visualState.dataset === "daily" && customProgressRows().length > 0) {
    visualState.dataset = "customProgress";
  }
  datasetSelect.querySelector('option[value="ratings"]')?.toggleAttribute("disabled", !isRatingEnabled());
  const available = visualChartOptions[visualState.dataset];
  if (!available.includes(visualState.chart)) {
    visualState.chart = available[0];
  }
  datasetSelect.value = visualState.dataset;
  typeTabs.innerHTML = available
    .map(
      (type) => `
        <button class="chart-type-tab ${visualState.chart === type ? "active" : ""}" type="button" data-chart="${type}">
          ${visualChartLabels[type]}
        </button>
      `,
    )
    .join("");
  renderChartTypeLibrary({
    containerSelector: "#visualChartLibrary",
    datasetSelect,
    state: visualState,
    available,
  });
  document.querySelector("#visualModeBadge").textContent = `${datasetSelect.selectedOptions[0].textContent} · ${visualChartLabels[visualState.chart]}`;
}

function renderChartTypeLibrary({ containerSelector, datasetSelect, state, available }) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const recommended = new Set((available || []).slice(0, 3));
  const activeDataset = datasetSelect?.selectedOptions?.[0]?.textContent?.trim() || "";
  container.innerHTML = chartGuideOrder
    .map((group) => {
      const groupTypes = Object.entries(chartTypeGuide)
        .filter(([type, guide]) => guide.group === group && available.includes(type));
      if (groupTypes.length === 0) return "";
      return `
        <section class="chart-library-group">
          <strong>${group}</strong>
          <div class="chart-library-options">
            ${groupTypes
              .map(([type, guide]) => {
                const active = state.chart === type;
                return `
                  <button class="chart-library-card ${active ? "active" : ""}" type="button" data-chart="${type}" aria-pressed="${String(active)}">
                    <span>${visualChartLabels[type]}</span>
                    <small>${guide.use}</small>
                    <em>${guide.detail}</em>
                    ${recommended.has(type) ? `<i>${activeDataset ? `${activeDataset} 推荐` : "推荐"}</i>` : ""}
                  </button>
                `;
              })
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderVisualExplorerSummary() {
  const summary = document.querySelector("#visualSummary");
  const insight = document.querySelector("#visualInsight");
  if (!summary || !insight) return;
  const rows = visualDatasetRows();
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const top = rows.reduce((best, row) => (row.value > (best?.value || 0) ? row : best), null);
  if (visualState.dataset === "ratings") {
    const averageTrust = rows.length > 0 ? Math.round(rows.reduce((sum, row) => sum + row.trust, 0) / rows.length) : 0;
    const lowTrust = rows.filter((row) => row.trust < 65).length;
    insight.textContent = `用 ${visualChartLabels[visualState.chart]} 看报价与信任关系`;
    summary.innerHTML = `
      <div class="visual-summary-card"><strong>${rows.length}</strong><span>评级对象</span></div>
      <div class="visual-summary-card"><strong>${averageTrust}</strong><span>平均信任分</span></div>
      <div class="visual-summary-card"><strong>${lowTrust}</strong><span>低信任项</span></div>
      <div class="visual-summary-card"><strong>${top ? money.format(top.value) : "--"}</strong><span>最高报价</span></div>
    `;
    return;
  }
  if (visualState.dataset === "customProgress") {
    const averageRate = rows.length > 0 ? Math.round((rows.reduce((sum, row) => sum + row.rate, 0) / rows.length) * 100) : 0;
    const completedRows = rows.filter((row) => row.rate >= 1).length;
    insight.textContent = `用 ${visualChartLabels[visualState.chart]} 看自定义完成进度`;
    summary.innerHTML = `
      <div class="visual-summary-card"><strong>${rows.length}</strong><span>进度项</span></div>
      <div class="visual-summary-card"><strong>${averageRate}%</strong><span>平均进度</span></div>
      <div class="visual-summary-card"><strong>${completedRows}</strong><span>已完成项</span></div>
      <div class="visual-summary-card"><strong>${top ? top.label : "--"}</strong><span>完成量最高</span></div>
    `;
    return;
  }
  if (visualState.dataset === "personnelShare") {
    const personnelCount = personnelSharePeopleCount();
    const totalCost = personnelShareTotalCost();
    const topShare = totalCost > 0 && top ? Math.round((top.value / totalCost) * 100) : 0;
    insight.textContent = `用 ${visualChartLabels[visualState.chart]} 看人员成本占比`;
    summary.innerHTML = `
      <div class="visual-summary-card"><strong>${personnelCount}</strong><span>人员数量</span></div>
      <div class="visual-summary-card"><strong>${money.format(totalCost)}</strong><span>人员总成本</span></div>
      <div class="visual-summary-card"><strong>${top ? top.label : "--"}</strong><span>最高占比${budgetUnitLabel()}</span></div>
      <div class="visual-summary-card"><strong>${topShare}%</strong><span>最高人员占比</span></div>
    `;
    return;
  }
  insight.textContent = `用 ${visualChartLabels[visualState.chart]} 看 ${document.querySelector("#visualDataset").selectedOptions[0].textContent}`;
  summary.innerHTML = `
    <div class="visual-summary-card"><strong>${rows.length}</strong><span>数据项</span></div>
    <div class="visual-summary-card"><strong>${money.format(total)}</strong><span>总额</span></div>
    <div class="visual-summary-card"><strong>${top ? top.label : "--"}</strong><span>最高项</span></div>
    <div class="visual-summary-card"><strong>${top ? compactMoney(top.value) : "--"}</strong><span>最高金额</span></div>
  `;
}

function setupVisualExplorer() {
  const datasetSelect = document.querySelector("#visualDataset");
  const typeTabs = document.querySelector("#visualChartTypes");
  if (!datasetSelect || !typeTabs) return;
  datasetSelect.addEventListener("change", (event) => {
    visualState.dataset = event.target.value;
    visualState.chart = visualChartOptions[visualState.dataset][0];
    renderVisualExplorerControls();
    renderVisualExplorerSummary();
    drawVisualExplorer();
  });
  typeTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chart]");
    if (!button) return;
    visualState.chart = button.dataset.chart;
    renderVisualExplorerControls();
    renderVisualExplorerSummary();
    drawVisualExplorer();
  });
  document.querySelector("#visualChartLibrary")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chart]");
    if (!button) return;
    visualState.chart = button.dataset.chart;
    renderVisualExplorerControls();
    renderVisualExplorerSummary();
    drawVisualExplorer();
  });
}

function renderAnalysisVisualControls() {
  const datasetSelect = document.querySelector("#analysisVisualDataset");
  const typeTabs = document.querySelector("#analysisVisualChartTypes");
  const badge = document.querySelector("#analysisVisualInsight");
  if (!datasetSelect || !typeTabs || !badge) return;
  setSelectOptionText("#analysisVisualDataset", "departments", modeText("部门偏差", "分类偏差"));
  setSelectOptionText("#analysisVisualDataset", "departmentBudget", modeText("部门预算", "分类预算"));
  setSelectOptionText("#analysisVisualDataset", "personnelShare", modeText("人员占比", "人员分类占比"));
  if (!isRatingEnabled() && analysisVisualState.dataset === "ratings") {
    analysisVisualState.dataset = "departments";
  }
  if (isCustomInputMode() && analysisVisualState.dataset === "departments" && customProgressRows().length > 0) {
    analysisVisualState.dataset = "customProgress";
  }
  datasetSelect.querySelector('option[value="ratings"]')?.toggleAttribute("disabled", !isRatingEnabled());
  const available = visualChartOptions[analysisVisualState.dataset];
  if (!available.includes(analysisVisualState.chart)) {
    analysisVisualState.chart = available[0];
  }
  datasetSelect.value = analysisVisualState.dataset;
  typeTabs.innerHTML = available
    .map(
      (type) => `
        <button class="chart-type-tab ${analysisVisualState.chart === type ? "active" : ""}" type="button" data-chart="${type}">
          ${visualChartLabels[type]}
        </button>
      `,
    )
    .join("");
  renderChartTypeLibrary({
    containerSelector: "#analysisVisualChartLibrary",
    datasetSelect,
    state: analysisVisualState,
    available,
  });
  badge.textContent = `${datasetSelect.selectedOptions[0].textContent} · ${visualChartLabels[analysisVisualState.chart]}`;
}

function renderAnalysisVisualSummary() {
  const summary = document.querySelector("#analysisVisualSummary");
  if (!summary) return;
  const rows = visualDatasetRows(analysisVisualState.dataset);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const top = rows.reduce((best, row) => (row.value > (best?.value || 0) ? row : best), null);
  if (analysisVisualState.dataset === "departments") {
    const unitLabel = budgetUnitLabel();
    const highRisk = rows.filter((row) => row.rate > 0.82).length;
    const averageRate = rows.length > 0 ? Math.round((rows.reduce((sum, row) => sum + row.rate, 0) / rows.length) * 100) : 0;
    summary.innerHTML = `
      <div class="visual-summary-card"><strong>${rows.length}</strong><span>${unitLabel}数量</span></div>
      <div class="visual-summary-card"><strong>${highRisk}</strong><span>风险${unitLabel}</span></div>
      <div class="visual-summary-card"><strong>${averageRate}%</strong><span>平均消耗率</span></div>
      <div class="visual-summary-card"><strong>${top ? top.label : "--"}</strong><span>最高消耗${unitLabel}</span></div>
    `;
    return;
  }
  if (analysisVisualState.dataset === "departmentBudget") {
    const unitLabel = budgetUnitLabel();
    const budgetLabel = budgetBudgetLabel();
    const topShare = total > 0 && top ? Math.round((top.value / total) * 100) : 0;
    summary.innerHTML = `
      <div class="visual-summary-card"><strong>${rows.length}</strong><span>预算${unitLabel}</span></div>
      <div class="visual-summary-card"><strong>${money.format(total)}</strong><span>${budgetLabel}合计</span></div>
      <div class="visual-summary-card"><strong>${top ? top.label : "--"}</strong><span>最高预算${unitLabel}</span></div>
      <div class="visual-summary-card"><strong>${topShare}%</strong><span>最高预算占比</span></div>
    `;
    return;
  }
  if (analysisVisualState.dataset === "personnelShare") {
    const unitLabel = budgetUnitLabel();
    const personnelCount = personnelSharePeopleCount();
    const totalCost = personnelShareTotalCost();
    const topShare = totalCost > 0 && top ? Math.round((top.value / totalCost) * 100) : 0;
    const averageCost = personnelCount > 0 ? Math.round(totalCost / personnelCount) : 0;
    summary.innerHTML = `
      <div class="visual-summary-card"><strong>${personnelCount}</strong><span>人员数量</span></div>
      <div class="visual-summary-card"><strong>${money.format(totalCost)}</strong><span>人员总成本</span></div>
      <div class="visual-summary-card"><strong>${top ? top.label : "--"}</strong><span>最高人员${unitLabel}</span></div>
      <div class="visual-summary-card"><strong>${topShare}%</strong><span>最高占比 · 均 ${compactMoney(averageCost)}</span></div>
    `;
    return;
  }
  if (analysisVisualState.dataset === "ratings") {
    const averageTrust = rows.length > 0 ? Math.round(rows.reduce((sum, row) => sum + row.trust, 0) / rows.length) : 0;
    const lowTrust = rows.filter((row) => row.trust < 65).length;
    summary.innerHTML = `
      <div class="visual-summary-card"><strong>${rows.length}</strong><span>评级对象</span></div>
      <div class="visual-summary-card"><strong>${averageTrust}</strong><span>平均信任</span></div>
      <div class="visual-summary-card"><strong>${lowTrust}</strong><span>低信任</span></div>
      <div class="visual-summary-card"><strong>${top ? money.format(top.value) : "--"}</strong><span>最高报价</span></div>
    `;
    return;
  }
  if (analysisVisualState.dataset === "customProgress") {
    const averageRate = rows.length > 0 ? Math.round((rows.reduce((sum, row) => sum + row.rate, 0) / rows.length) * 100) : 0;
    const completedRows = rows.filter((row) => row.rate >= 1).length;
    summary.innerHTML = `
      <div class="visual-summary-card"><strong>${rows.length}</strong><span>进度项</span></div>
      <div class="visual-summary-card"><strong>${averageRate}%</strong><span>平均进度</span></div>
      <div class="visual-summary-card"><strong>${completedRows}</strong><span>已完成项</span></div>
      <div class="visual-summary-card"><strong>${top ? top.label : "--"}</strong><span>完成量最高</span></div>
    `;
    return;
  }
  summary.innerHTML = `
    <div class="visual-summary-card"><strong>${rows.length}</strong><span>数据项</span></div>
    <div class="visual-summary-card"><strong>${money.format(total)}</strong><span>总额</span></div>
    <div class="visual-summary-card"><strong>${top ? top.label : "--"}</strong><span>最高项</span></div>
    <div class="visual-summary-card"><strong>${top ? compactMoney(top.value) : "--"}</strong><span>最高金额</span></div>
  `;
}

function setupAnalysisVisual() {
  const datasetSelect = document.querySelector("#analysisVisualDataset");
  const typeTabs = document.querySelector("#analysisVisualChartTypes");
  if (!datasetSelect || !typeTabs) return;
  datasetSelect.addEventListener("change", (event) => {
    analysisVisualState.dataset = event.target.value;
    analysisVisualState.chart = visualChartOptions[analysisVisualState.dataset][0];
    renderAnalysisVisualControls();
    renderAnalysisVisualSummary();
    drawVisualExplorer("analysisVisualChart", analysisVisualState);
  });
  typeTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chart]");
    if (!button) return;
    analysisVisualState.chart = button.dataset.chart;
    renderAnalysisVisualControls();
    renderAnalysisVisualSummary();
    drawVisualExplorer("analysisVisualChart", analysisVisualState);
  });
  document.querySelector("#analysisVisualChartLibrary")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chart]");
    if (!button) return;
    analysisVisualState.chart = button.dataset.chart;
    renderAnalysisVisualControls();
    renderAnalysisVisualSummary();
    drawVisualExplorer("analysisVisualChart", analysisVisualState);
  });
}

function setupBudgetShareControls() {
  const tabs = document.querySelector("#budgetShareChartTypes");
  if (!tabs) return;
  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chart]");
    if (!button) return;
    budgetShareState.chart = button.dataset.chart;
    renderBudgetShareControls();
    drawCategoryChart();
  });
}

function setupAuditFilters() {
  const tabs = document.querySelector("#auditFilterTabs");
  if (!tabs) return;
  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    auditState.filter = button.dataset.filter || "all";
    renderAuditFilterControls();
    renderAuditModule();
  });
}

function renderAuditFilterControls() {
  const tabs = document.querySelector("#auditFilterTabs");
  if (!tabs) return;
  tabs.querySelectorAll("[data-filter]").forEach((button) => {
    const active = button.dataset.filter === auditState.filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderDepartmentInputs() {
  ensureReferenceData();
  const selectableDepartments = inputDepartments();
  const options =
    selectableDepartments.length > 0
      ? selectableDepartments.map((department) => `<option value="${department.id}">${department.name}</option>`).join("")
      : `<option value="">请先保存自定义部门</option>`;
  document.querySelectorAll(".department-select").forEach((select) => {
    const current = select.value;
    select.innerHTML = options;
    if (selectableDepartments.some((department) => department.id === current)) {
      select.value = current;
    } else if (selectableDepartments.length > 0) {
      select.value = selectableDepartments[0].id;
    }
  });

  document.querySelector("#callsheetDepartmentsInput").innerHTML = selectableDepartments
    .map((department) => {
      const checked = isCustomInputMode() ? true : defaultOnSetDepartmentIds.has(department.id);
      return `
        <label>
          <input type="checkbox" name="departments" value="${department.id}" ${checked ? "checked" : ""} />
          ${department.name}
        </label>
      `;
    })
    .join("");
  renderPersonRolePreset();
}

function customRolesForDepartment(departmentId) {
  return Array.isArray(displaySettings.customRoles?.[departmentId]) ? displaySettings.customRoles[departmentId] : [];
}

function customDepartmentIdFromName(name) {
  const base = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/组$/u, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gu, "_")
    .replace(/^_+|_+$/g, "");
  let id = `custom_${base || Date.now()}`;
  let suffix = 2;
  while (departments.some((department) => department.id === id) || displaySettings.customDepartments.some((department) => department.id === id)) {
    id = `custom_${base || "department"}_${suffix}`;
    suffix += 1;
  }
  return id;
}

function isCustomDepartment(departmentId) {
  return displaySettings.customDepartments.some((department) => department.id === departmentId);
}

function renderPersonRolePreset() {
  const form = document.querySelector("#personForm");
  const rolePreset = document.querySelector("#personRolePreset");
  if (!form || !rolePreset) return;
  const departmentId = form.elements.dept.value;
  const profile = isCustomInputMode() ? { roles: [] } : departmentProfiles[departmentId] || { roles: [] };
  const customRoles = customRolesForDepartment(departmentId);
  const roles = Array.from(new Set([...customRoles, ...profile.roles]));
  const current = rolePreset.value;
  rolePreset.innerHTML = `
    <option value="">${isCustomInputMode() ? "手动输入岗位" : "按分组选择岗位"}</option>
    ${roles.map((role) => `<option value="${escapeHtml(role)}">${escapeHtml(role)}${customRoles.includes(role) ? " · 自定义" : ""}</option>`).join("")}
  `;
  if (roles.includes(current)) {
    rolePreset.value = current;
  }
}

function renderInputPreferences() {
  const departmentSelect = document.querySelector("#customRoleDepartment");
  const departmentNameInput = document.querySelector("#customDepartmentName");
  const list = document.querySelector("#customRoleList");
  if (!departmentSelect || !departmentNameInput || !list) return;
  normalizeDisplaySettings();

  const selectableDepartments = inputDepartments();
  const currentDepartment = departmentSelect.value || document.querySelector("#personForm")?.elements.dept?.value || selectableDepartments[0]?.id || "";
  departmentSelect.innerHTML =
    selectableDepartments.length > 0
      ? selectableDepartments.map((department) => `<option value="${department.id}">${department.name}</option>`).join("")
      : `<option value="">请先保存自定义部门</option>`;
  if (selectableDepartments.some((department) => department.id === currentDepartment)) {
    departmentSelect.value = currentDepartment;
  } else if (selectableDepartments.length > 0) {
    departmentSelect.value = selectableDepartments[0].id;
  }
  const ratingLabel = document.querySelector("#ratingEnabledLabel");
  if (ratingLabel) {
    ratingLabel.textContent = isRatingEnabled() ? (displaySettings.language === "en" ? "On" : "已开启") : (displaySettings.language === "en" ? "Off" : "已关闭");
  }

  const customEntries = inputDepartments({ includeTemplate: !isCustomInputMode() })
    .map((department) => ({
      department,
      roles: customRolesForDepartment(department.id),
      isCustom: isCustomDepartment(department.id),
    }))
    .filter((entry) => entry.roles.length > 0 || entry.isCustom);

  list.innerHTML =
    customEntries.length > 0
      ? customEntries
          .map(
            (entry) => `
              <div class="custom-role-group">
                <strong>${escapeHtml(entry.department.name)}</strong>
                <div>
                  ${entry.isCustom ? `<span class="custom-role-chip custom-department-chip">${escapeHtml(translate("preferences.departmentName"))}<button type="button" data-delete-dept="${escapeHtml(entry.department.id)}" aria-label="${escapeHtml(translate("preferences.deleteDepartment"))}">×</button></span>` : ""}
                  ${entry.roles
                    .map(
                      (role) => `
                        <span class="custom-role-chip">
                          ${escapeHtml(role)}
                          <button type="button" data-dept="${escapeHtml(entry.department.id)}" data-role="${escapeHtml(role)}" aria-label="${escapeHtml(translate("preferences.deleteRole"))}">×</button>
                        </span>
                      `,
                    )
                    .join("")}
                </div>
              </div>
            `,
          )
          .join("")
      : `<div class="custom-role-empty">${escapeHtml(translate("preferences.emptyRoles"))}</div>`;
}

function renderModeSpecificUi() {
  const custom = isCustomInputMode();
  const unitLabel = budgetUnitLabel();
  const budgetLabel = budgetBudgetLabel();
  setText(".brand-lockup h1", custom ? "项目管理看板" : translate("app.title"));
  setText("#progressMetricLabel", custom ? "完成进度" : "拍摄进度");
  setText('[data-view="callsheet"] span', custom ? "执行" : translate("nav.callsheet"));
  setText("#overviewTitle", custom ? "项目预算与执行状态" : "今日预算与拍摄状态");
  setText("#dailyCostTitle", custom ? "执行成本趋势" : "每日成本趋势");
  setText("#dailyCostHint", custom ? "按执行记录估算" : "按通告单估算");
  setText("#departmentChartTitle", custom ? "分类花费" : "部门花费");
  setText("#departmentChartHint", custom ? "自定义 Top 6" : "Top 6");
  setText("#overviewDepartmentShareTitle", custom ? "分类费用占比" : "部门费用占比");
  setText("#budgetTitle", custom ? "预算分类" : "预算拆分");
  setText("#budgetTableTitle", custom ? "分类预算表" : "部门预算表");
  setText("#budgetTableHint", "预算 / 已用 / 剩余");
  setText("#budgetTableNameHeader", unitLabel);
  setText("#budgetShareTitle", custom ? "分类预算占比图" : "预算占比图");
  setText("#budgetAllocationTitle", custom ? "分类预算" : "组别预算");
  setText("#budgetAllocationHint", custom ? "按自定义分类拆分总预算" : "按部门拆分总预算");
  setText("#fundFlowInsight", custom ? `总预算 → ${unitLabel} → 用途` : "总预算 → 部门 → 用途");
  setText("#fundFlowLargeInsight", custom ? `总预算 → ${unitLabel} → 用途 → 公司 / 明细` : "总预算 → 部门 → 用途 → 公司 / 个人 / 明细");
  setText("#todayPanelTitle", custom ? "当前执行记录" : "今日通告");
  setText("#focusTodayLabel", custom ? "执行记录" : "今日通告");
  setText("#callsheetTitle", custom ? "执行记录" : "每日通告单");
  setText("#callsheetSelectLabel", custom ? "记录" : "拍摄日");
  setText("#dailyBarsTitle", custom ? "记录成本" : "按天成本");
  setText("#dailyBarsHint", custom ? "执行支出" : "预计支出");
  setText("#callsheetFormTitle", custom ? "执行记录" : "通告单");
  setText("#callsheetFormHint", custom ? "项目节点、交付或审批记录" : "每日生产成本");
  setText("#callsheetDayLabel", custom ? "记录编号" : "拍摄日");
  setText("#callsheetCallTimeLabel", custom ? "开始" : "集合");
  setText("#callsheetWrapTimeLabel", custom ? "结束" : "收工");
  setText("#callsheetWeatherLabel", custom ? "状态 / 条件" : "天气");
  setText("#callsheetCastLabel", custom ? "备注 / 交付对象" : "演员");
  setText("#callsheetMealsLabel", custom ? "数量" : "餐食");
  setText("#callsheetVehiclesLabel", custom ? "资源" : "车辆");
  setText("#callsheetRoomsLabel", custom ? "预留" : "房间");
  setText("#callsheetLocationFeeLabel", custom ? "外部费用" : "场地费");
  setText("#callsheetDepartmentLabel", custom ? "参与部门" : "到场部门");
  setText("#callsheetSubmitLabel", custom ? "保存记录" : "保存通告");
  setText("#progressTitle", custom ? "项目完成进度" : "项目进度");
  setText("#editProgressInsight", custom ? activeProgressStats().detailText : "已完成场次 / 未完成场次");
  document.querySelector("#spreadsheetTarget option[value='scene']")?.toggleAttribute("disabled", custom);
  document.querySelector("#spreadsheetTarget option[value='callsheet']").textContent = custom ? "执行记录" : "通告单";
  if (custom && document.querySelector("#spreadsheetTarget")?.value === "scene") {
    document.querySelector("#spreadsheetTarget").value = "auto";
  }
  document.querySelector("#handwrittenTarget option[value='scene']")?.toggleAttribute("disabled", custom);
  document.querySelector("#handwrittenTarget option[value='callsheet']").textContent = custom ? "执行记录" : "通告单";
  if (custom && document.querySelector("#handwrittenTarget")?.value === "scene") {
    document.querySelector("#handwrittenTarget").value = "auto";
  }
  setSelectOptionText("#visualDataset", "departments", custom ? "分类花费" : "部门花费");
  setSelectOptionText("#visualDataset", "departmentBudget", custom ? "分类预算" : "部门预算");
  setSelectOptionText("#visualDataset", "personnelShare", custom ? "人员分类占比" : "人员占比");
  setSelectOptionText("#analysisVisualDataset", "departments", custom ? "分类偏差" : "部门偏差");
  setSelectOptionText("#analysisVisualDataset", "departmentBudget", budgetLabel);
  setSelectOptionText("#analysisVisualDataset", "personnelShare", custom ? "人员分类占比" : "人员占比");
}

function migrateInputSelectionsToCustomMode() {
  const fallbackDept = firstInputDepartmentId();
  document.querySelectorAll(".department-select").forEach((select) => {
    if (!isCustomDepartment(select.value)) {
      select.value = fallbackDept;
    }
  });
  const callSheetInputs = document.querySelectorAll('#callsheetDepartmentsInput input[name="departments"]');
  callSheetInputs.forEach((input) => {
    input.checked = isCustomDepartment(input.value);
  });
}

function setupInputPreferences() {
  const ratingButton = document.querySelector("#ratingEnabledButton");
  const departmentSelect = document.querySelector("#customRoleDepartment");
  const departmentNameInput = document.querySelector("#customDepartmentName");
  const departmentBudgetInput = document.querySelector("#customDepartmentBudget");
  const roleInput = document.querySelector("#customRoleName");
  const addDepartmentButton = document.querySelector("#addCustomDepartment");
  const addButton = document.querySelector("#addCustomRole");
  const list = document.querySelector("#customRoleList");
  if (!ratingButton || !departmentSelect || !departmentNameInput || !departmentBudgetInput || !roleInput || !addDepartmentButton || !addButton || !list) return;

  document.querySelectorAll("[data-language-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguageMode(displaySettings.language === "en" ? "zh" : "en");
    });
  });

  ratingButton.addEventListener("click", () => {
    displaySettings.ratingEnabled = !isRatingEnabled();
    applyDisplaySettings();
    saveDisplaySettings();
    refreshAll();
    setFormStatus(isRatingEnabled() ? "等级评分已开启" : "等级评分已关闭", "good");
  });

  document.querySelectorAll("[data-input-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextMode = button.dataset.inputMode === "custom" ? "custom" : "template";
      if (displaySettings.inputMode === nextMode) return;
      displaySettings.inputMode = nextMode;
      saveDisplaySettings();
      renderDepartmentInputs();
      renderInputPreferences();
      if (isCustomInputMode()) migrateInputSelectionsToCustomMode();
      renderPersonRolePreset();
      renderPersonInputFeedback();
      renderCustomProgressInput();
      applyDisplaySettings();
      if (isCustomInputMode()) {
        visualState.dataset = customProgressRows().length > 0 ? "customProgress" : "departments";
        analysisVisualState.dataset = customProgressRows().length > 0 ? "customProgress" : "departmentBudget";
      }
      refreshAll();
      setFormStatus(isCustomInputMode() ? "已开启完全自定义录入" : "已切回电影模板录入", "good");
    });
  });

  departmentSelect.addEventListener("change", renderInputPreferences);

  const addCustomDepartment = () => {
    const name = departmentNameInput.value.trim();
    if (!name) {
      setFormStatus("请先填写自定义部门名称", "warning");
      return;
    }
    const existing = inputDepartments({ includeTemplate: true }).find((department) => department.name === name);
    const customBudget = Math.max(0, Number(departmentBudgetInput.value || 0));
    if (existing) {
      departmentSelect.value = existing.id;
      setFormStatus(`部门已存在：${existing.name}`, "warning");
      return;
    }
    const customDepartment = {
      id: customDepartmentIdFromName(name),
      name,
      budget: customBudget,
      color: palette(departments.length),
    };
    displaySettings.customDepartments = [...displaySettings.customDepartments, customDepartment];
    departments.push(clone(customDepartment));
    departmentNameInput.value = "";
    departmentBudgetInput.value = "";
    saveDisplaySettings();
    saveData();
    renderDepartmentInputs();
    renderInputPreferences();
    departmentSelect.value = customDepartment.id;
    renderPersonRolePreset();
    refreshAll();
    departmentSelect.value = customDepartment.id;
    document.querySelectorAll(".department-select").forEach((select) => {
      select.value = customDepartment.id;
    });
    renderPersonRolePreset();
    renderPersonInputFeedback();
    setFormStatus(`已保存自定义部门：${name}`, "good");
  };

  addDepartmentButton.addEventListener("click", addCustomDepartment);
  departmentNameInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addCustomDepartment();
  });

  const addCustomRole = () => {
    const departmentId = departmentSelect.value || firstInputDepartmentId();
    const role = roleInput.value.trim();
    if (!departmentId || !role) {
      setFormStatus("请先选择部门并填写自定义岗位", "warning");
      return;
    }
    const existingRoles = customRolesForDepartment(departmentId);
    if (existingRoles.includes(role)) {
      setFormStatus("这个岗位已经在自定义选项里", "warning");
      return;
    }
    displaySettings.customRoles = displaySettings.customRoles || {};
    displaySettings.customRoles[departmentId] = [...existingRoles, role];
    roleInput.value = "";
    applyDisplaySettings();
    saveDisplaySettings();
    renderInputPreferences();
    renderPersonRolePreset();
    setFormStatus(`已加入自定义岗位：${role}`, "good");
  };

  addButton.addEventListener("click", addCustomRole);
  roleInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addCustomRole();
  });

  list.addEventListener("click", (event) => {
    const departmentButton = event.target.closest("button[data-delete-dept]");
    if (departmentButton) {
      const departmentId = departmentButton.dataset.deleteDept;
      const department = departments.find((item) => item.id === departmentId);
      displaySettings.customDepartments = displaySettings.customDepartments.filter((item) => item.id !== departmentId);
      delete displaySettings.customRoles[departmentId];
      departments = departments.filter((item) => item.id !== departmentId);
      people = people.map((person) => (person.dept === departmentId ? { ...person, dept: "production" } : person));
      equipment = equipment.map((item) => (item.dept === departmentId ? { ...item, dept: "production" } : item));
      callSheets = callSheets.map((sheet) => ({ ...sheet, departments: sheet.departments.filter((id) => id !== departmentId) }));
      saveDisplaySettings();
      saveData();
      refreshAll();
      setFormStatus(`已删除自定义部门：${department?.name || departmentId}`, "warning");
      return;
    }
    const button = event.target.closest("button[data-dept][data-role]");
    if (!button) return;
    const departmentId = button.dataset.dept;
    const role = button.dataset.role;
    const roles = customRolesForDepartment(departmentId).filter((item) => item !== role);
    displaySettings.customRoles[departmentId] = roles;
    if (roles.length === 0) delete displaySettings.customRoles[departmentId];
    applyDisplaySettings();
    saveDisplaySettings();
    renderInputPreferences();
    renderPersonRolePreset();
    setFormStatus(`已删除自定义岗位：${role}`, "warning");
  });
}

function renderSceneInput() {
  const container = document.querySelector("#callsheetScenesInput");
  if (!container) return;
  const selected = Array.from(container.querySelectorAll('input[name="scenes"]:checked')).map((input) => input.value);
  container.innerHTML = scenes
    .map((scene) => {
      const checked = selected.includes(scene.code);
      const count = sceneCount(scene.code);
      return `
        <label class="callsheet-scene-option ${checked ? "selected" : ""}">
          <input type="checkbox" name="scenes" value="${escapeHtml(scene.code)}" ${checked ? "checked" : ""} />
          <span class="scene-option-code">${escapeHtml(scene.code)}</span>
          <span class="scene-option-main">
            <strong>${escapeHtml(scene.title)}</strong>
            <small>${escapeHtml(scene.location)} · ${count} 场 · ${scene.pages} 页</small>
          </span>
          <span class="scene-option-status ${scene.status === "done" ? "done" : ""}">${scene.status === "done" ? "已拍" : "待拍"}</span>
        </label>
      `;
    })
    .join("");
  updateCallsheetSceneSummary();
}

function renderCustomProgressInput() {
  const list = document.querySelector("#customProgressList");
  if (!list) return;
  const rows = customProgressRows();
  setPlaceholder('#customProgressForm [name="name"]', isCustomInputMode() ? "合同 / 交付 / 审批" : "剪辑 / 合同 / 搭景");
  list.innerHTML =
    rows.length > 0
      ? rows
          .map(
            (row) => `
              <div class="custom-progress-item">
                <div>
                  <strong>${escapeHtml(row.label)}</strong>
                  <span>${formatProgressNumber(row.done)} / ${formatProgressNumber(row.target)} ${escapeHtml(row.unit)} · ${percentText(row.rate)}</span>
                </div>
                <div class="custom-progress-meter" aria-hidden="true">
                  <span style="width:${Math.max(2, Math.min(row.rate, 1) * 100)}%; background:${row.color}"></span>
                </div>
                <button class="person-delete-button" type="button" data-progress-id="${escapeHtml(row.id)}">删除</button>
              </div>
            `,
          )
          .join("")
      : `<div class="custom-role-empty">开启完全自定义后，可以在这里录入剪辑、合同、搭景、审批、交付等任意完成进度。</div>`;
}

function updateCallsheetSceneSummary() {
  const container = document.querySelector("#callsheetScenesInput");
  const summary = document.querySelector("#callsheetSceneSummary");
  if (!container || !summary) return;
  if (isCustomInputMode()) {
    summary.textContent = "自定义模式无需选择场次";
    return;
  }
  const selectedCodes = Array.from(container.querySelectorAll('input[name="scenes"]:checked')).map((input) => input.value);
  const selectedScenes = scenes.filter((scene) => selectedCodes.includes(scene.code));
  const totalScenes = selectedScenes.reduce((sum, scene) => sum + sceneCount(scene.code), 0);
  const totalPages = selectedScenes.reduce((sum, scene) => sum + scene.pages, 0);
  summary.textContent = selectedCodes.length > 0 ? `已选 ${selectedCodes.length} 段 · ${totalScenes} 场 · ${totalPages} 页` : "未选择场次";
}

function renderProjectForm() {
  const form = document.querySelector("#projectForm");
  form.elements.title.value = project.title;
  form.elements.budget.value = project.budget;
  form.elements.currentDay.value = project.currentDay;
  form.elements.plannedDays.value = project.plannedDays;
  form.elements.totalScenes.value = project.totalScenes;
  form.elements.totalPages.value = project.totalPages;
  renderDepartmentBudgetInputs();
}

function parseDelimitedText(text, delimiter = ",") {
  const rows = [];
  let cell = "";
  let row = [];
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => String(value).trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => String(value).trim())) rows.push(row);
  if (rows.length === 0) return [];
  const headers = rows[0].map((header, index) => String(header || `列${index + 1}`).trim());
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function rowsFromMatrix(matrix) {
  const clean = matrix.filter((row) => row.some((cell) => String(cell ?? "").trim()));
  if (clean.length === 0) return [];
  const headers = clean[0].map((header, index) => String(header || `列${index + 1}`).trim());
  return clean.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function previewImportRows() {
  const head = document.querySelector("#spreadsheetPreviewHead");
  const body = document.querySelector("#spreadsheetPreviewBody");
  const stats = document.querySelector("#spreadsheetPreviewStats");
  if (!head || !body || !stats) return;
  const rows = spreadsheetImportState.rows;
  const parsed = spreadsheetImportState.parsed;
  const target = spreadsheetImportState.target;
  if (rows.length === 0) {
    head.innerHTML = "";
    body.innerHTML = "";
    stats.textContent = "暂无数据";
    return;
  }
  const keys = Object.keys(rows[0]).slice(0, 8);
  const parsedKeys = Object.keys(parsed[0] || {}).filter((key) => typeof parsed[0][key] !== "object").slice(0, 8);
  head.innerHTML = `
    <tr>
      <th>类型</th>
      ${keys.map((key) => `<th>${escapeHtml(key)}</th>`).join("")}
    </tr>
  `;
  body.innerHTML = rows
    .slice(0, 8)
    .map(
      (row, index) => `
        <tr>
          <td><strong>${target}</strong></td>
          ${keys.map((key) => `<td>${escapeHtml(row[key])}</td>`).join("")}
        </tr>
        <tr class="mapped-row">
          <td>识别</td>
          ${keys.map((_, keyIndex) => `<td>${escapeHtml(parsed[index]?.[parsedKeys[keyIndex]] ?? "")}</td>`).join("")}
        </tr>
      `,
    )
    .join("");
  stats.textContent = `${rows.length} 行 · 识别为 ${target}`;
}

function parseSpreadsheetRows(rows) {
  const requestedTarget = document.querySelector("#spreadsheetTarget")?.value || "auto";
  const firstRow = rows[0] || {};
  const target = detectImportTarget(firstRow, requestedTarget);
  const parsed = rows.map((row) => parseImportRow(row, target)).filter((item) => isValidImportItem(item, target));
  spreadsheetImportState.rows = rows;
  spreadsheetImportState.parsed = parsed;
  spreadsheetImportState.target = target;
  previewImportRows();
  return { target, parsed };
}

function normalizeImportTarget(value) {
  const key = normalizeImportKey(value);
  if (["person", "people", "personnel", "crew", "cast", "actor", "talent", "renyuan", "yanyuan", "人员", "人员开销", "演员", "演员预算", "艺人"].includes(key)) return "person";
  if (["equipment", "gear", "device", "qicai", "shebei", "器材", "设备", "器材开销"].includes(key)) return "equipment";
  if (["scene", "scenes", "progress", "changci", "场次", "场景", "进度", "场次进度"].includes(key)) return "scene";
  if (["callsheet", "call", "notice", "tonggao", "通告", "通告单"].includes(key)) return "callsheet";
  return "auto";
}

function ensureXlsxLoaded() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (xlsxLoadPromise) return xlsxLoadPromise;
  xlsxLoadPromise = new Promise((resolve, reject) => {
    document.querySelectorAll('script[data-xlsx-loader="dynamic"]').forEach((script) => script.remove());
    const script = document.createElement("script");
    script.src = "./xlsx.full.min.js?v=0.18.5";
    script.dataset.xlsxLoader = "dynamic";
    script.addEventListener("load", () => {
      if (window.XLSX) resolve(window.XLSX);
      else reject(new Error("Excel 解析库加载完成但未初始化。"));
    });
    script.addEventListener("error", () => reject(new Error("Excel 解析库加载失败。")));
    document.head.appendChild(script);
  }).catch((error) => {
    xlsxLoadPromise = null;
    throw error;
  });
  return xlsxLoadPromise;
}

async function readSpreadsheetFile(file, sheetName = "") {
  const extension = file.name.split(".").pop().toLowerCase();
  if (extension === "csv" || extension === "tsv") {
    const text = await file.text();
    return parseDelimitedText(text, extension === "tsv" ? "\t" : ",");
  }
  const xlsx = await ensureXlsxLoaded();
  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: "array", cellDates: false });
  spreadsheetImportState.workbook = workbook;
  spreadsheetImportState.sheetNames = workbook.SheetNames;
  const select = document.querySelector("#spreadsheetSheetSelect");
  if (select) {
    select.disabled = workbook.SheetNames.length <= 1;
    select.innerHTML = workbook.SheetNames.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
    if (sheetName && workbook.SheetNames.includes(sheetName)) select.value = sheetName;
  }
  const activeSheetName = sheetName || workbook.SheetNames[0];
  const sheet = workbook.Sheets[activeSheetName];
  const matrix = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  return rowsFromMatrix(matrix);
}

function importParsedRows() {
  const { target, parsed } = spreadsheetImportState;
  if (parsed.length === 0) {
    setFormStatus("没有可导入的数据", "warning");
    document.querySelector("#spreadsheetImportStatus").textContent = "没有识别到有效行。";
    return;
  }
  if (target === "person") people.push(...parsed);
  if (target === "equipment") equipment.push(...parsed);
  if (target === "scene") {
    parsed.forEach((item) => {
      const index = scenes.findIndex((scene) => scene.code === item.code && item.code);
      if (index >= 0) scenes[index] = item;
      else scenes.push(item);
    });
  }
  if (target === "callsheet") {
    parsed.forEach((item) => {
      const index = callSheets.findIndex((sheet) => sheet.day === item.day);
      if (index >= 0) callSheets[index] = item;
      else callSheets.push(item);
    });
  }
  saveData();
  refreshAll();
  const message = `已导入 ${parsed.length} 行到${target === "person" ? "人员" : target === "equipment" ? "器材" : target === "scene" ? "场次" : "通告单"}`;
  setFormStatus(message, "good");
  document.querySelector("#spreadsheetImportStatus").textContent = message;
}

function applyAiPreset(provider) {
  const preset = aiProviderPresets[provider] || aiProviderPresets.custom;
  aiConfigState.provider = provider;
  aiConfigState.baseUrl = preset.baseUrl;
  aiConfigState.model = preset.model;
  document.querySelector("#aiBaseUrl").value = preset.baseUrl;
  document.querySelector("#aiModel").value = preset.model;
}

function syncAiConfigFromForm() {
  aiConfigState.provider = document.querySelector("#aiProvider").value;
  aiConfigState.baseUrl = document.querySelector("#aiBaseUrl").value.trim();
  aiConfigState.model = document.querySelector("#aiModel").value.trim();
  aiConfigState.apiKey = document.querySelector("#aiApiKey").value.trim();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("文件读取失败。")));
    reader.readAsDataURL(file);
  });
}

function parseDataUrl(dataUrl, fallbackMimeType = "image/jpeg") {
  const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { mimeType: fallbackMimeType, base64: "" };
  return { mimeType: match[1] || fallbackMimeType, base64: match[2] || "" };
}

function isImageFile(file) {
  return Boolean(file?.type?.startsWith("image/") || /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(file?.name || ""));
}

function parseAiJsonResult(text) {
  const cleaned = String(text || "").trim();
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] || cleaned).trim();
  try {
    return JSON.parse(candidate);
  } catch (error) {
    const objectText = candidate.match(/\{[\s\S]*\}/)?.[0];
    const arrayText = candidate.match(/\[[\s\S]*\]/)?.[0];
    const jsonText = objectText || arrayText;
    if (!jsonText) throw error;
    return JSON.parse(jsonText);
  }
}

async function callAiForSpreadsheet(prompt, options = {}) {
  syncAiConfigFromForm();
  if (!aiConfigState.baseUrl || !aiConfigState.model || !aiConfigState.apiKey) {
    throw new Error("请先填写接口地址、模型和 API Key。");
  }
  const isClaude = aiConfigState.provider === "claude" && !aiConfigState.baseUrl.includes("/chat/completions");
  const image = options.image;
  const userContent = image
    ? [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: image.dataUrl } },
      ]
    : prompt;
  const claudeContent = image
    ? [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: image.mimeType || "image/jpeg",
            data: parseDataUrl(image.dataUrl, image.mimeType).base64,
          },
        },
        { type: "text", text: prompt },
      ]
    : prompt;
  const body = isClaude
    ? {
        model: aiConfigState.model,
        max_tokens: options.maxTokens || 1400,
        system: options.system || "你是制片预算表格字段识别助手。只返回 JSON，不要解释。",
        messages: [{ role: "user", content: claudeContent }],
      }
    : {
        model: aiConfigState.model,
        temperature: 0,
        messages: [
          { role: "system", content: options.system || "你是制片预算表格字段识别助手。只返回 JSON，不要解释。" },
          { role: "user", content: userContent },
        ],
      };
  const response = await fetch(aiConfigState.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(isClaude
        ? { "x-api-key": aiConfigState.apiKey, "anthropic-version": "2023-06-01" }
        : { Authorization: `Bearer ${aiConfigState.apiKey}` }),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`接口返回 ${response.status}`);
  }
  const data = await response.json();
  return isClaude ? data.content?.[0]?.text || "" : data.choices?.[0]?.message?.content || "";
}

function aiMappingPrompt() {
  const sample = spreadsheetImportState.rows.slice(0, 6);
  return `请识别下面制片管理表格适合导入到哪类数据：person/equipment/scene/callsheet，并给出字段映射建议。只返回 JSON，格式为 {"target":"person","mapping":{"name":"原表头"}}。\n样例数据：${JSON.stringify(sample)}`;
}

function handwrittenPrompt() {
  const requestedTarget = document.querySelector("#handwrittenTarget")?.value || "auto";
  return `请从这张手写或拍照的制片单据中提取可导入数据。当前期望类型：${requestedTarget}。如果是 auto，请在 person/equipment/scene/callsheet 中判断。
只返回 JSON，不要解释，格式为 {"target":"equipment","rows":[{}],"notes":[]}。
可用字段：
	person：姓名、部门、岗位、角色、演员类型、经纪公司/供应商、人员等级、公司等级、日薪/日片酬、工作/拍摄天数、补贴/经纪费、信任评分。
equipment：器材名、部门、公司/供应商、公司等级、日租、使用天数、押金、信任评分。
scene：场次编号、标题、地点、页数、状态、风险。
callsheet：拍摄日、通告单号、日期、标题、地点、天气、集合、收工、场次、演员、到场部门、餐食、车辆、房间、场地费、杂费。
金额只返回数字，时间用 HH:mm，日期用 YYYY-MM-DD，看不清的字段留空。`;
}

function applyRecognizedRows(result, fallbackTarget = "auto") {
  const target = normalizeImportTarget(result?.target || fallbackTarget);
  const rows = Array.isArray(result) ? result : result?.rows || result?.data || result?.items || [];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("没有识别到可导入的行。");
  }
  const cleanRows = rows.map((row) => (row && typeof row === "object" && !Array.isArray(row) ? row : { 识别内容: row }));
  const targetSelect = document.querySelector("#spreadsheetTarget");
  if (targetSelect) targetSelect.value = target;
  const parsedResult = parseSpreadsheetRows(cleanRows);
  return { ...parsedResult, rowCount: cleanRows.length };
}

function setFormStatus(message, tone = "") {
  const status = document.querySelector("#formStatus");
  status.textContent = message;
  status.className = `status-pill ${tone}`.trim();
}

function setProjectLibraryStatus(message) {
  const status = document.querySelector("#projectLibraryStatus");
  if (status) status.textContent = message;
}

function getFormNumber(form, name) {
  return Number(form.elements[name]?.value || 0);
}

function normalizeImportKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_./\\()（）【】\-[\]:：]/g, "");
}

function getRowValue(row, aliases) {
  const normalizedAliases = aliases.map(normalizeImportKey);
  const key = Object.keys(row).find((candidate) => normalizedAliases.includes(normalizeImportKey(candidate)));
  return key ? row[key] : "";
}

function toNumber(value, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const cleaned = String(value || "").replace(/[￥¥,，\s]/g, "");
  const numberValue = Number(cleaned);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function detectImportTarget(row, requestedTarget = "auto") {
  const normalizedTarget = normalizeImportTarget(requestedTarget);
  if (normalizedTarget !== "auto") return normalizedTarget;
  const keys = Object.keys(row).map(normalizeImportKey).join("|");
  if (/器材|设备|日租|押金|租赁/.test(keys)) return "equipment";
  if (/场次|场景|页数|地点|状态/.test(keys)) return "scene";
  if (/通告|拍摄日|集合|收工|餐食|车辆|房间|场地费/.test(keys)) return "callsheet";
  if (/演员|艺人|角色|片酬|经纪/.test(keys)) return "person";
  return "person";
}

function parseImportRow(row, target) {
  if (target === "person") {
    const dayRate = toNumber(getRowValue(row, ["日薪", "日片酬", "片酬", "单价", "dayRate", "rate", "人工单价", "报价"]));
    const role = getRowValue(row, ["职位", "岗位", "分组岗位", "演员类型", "演员身份", "role", "position", "actorKind"]);
    const characterName = String(getRowValue(row, ["角色", "角色名", "饰演", "剧中角色", "character", "characterName"]) || "").trim();
    const actorKind = String(getRowValue(row, ["演员类型", "演员身份", "人员类型", "类型", "actorKind", "castType"]) || inferActorKind(role || characterName)).trim();
    const isActor = Boolean(characterName || inferActorKind(role) || inferActorKind(actorKind) || /片酬|演员|艺人/.test(Object.keys(row).join("|")));
    const departmentValue = getRowValue(row, ["部门", "分组", "组别", "dept", "department"]);
    const finalRole = String(role || (isActor ? actorRoleLabel(actorKind || "演员") : "未填职位")).trim();
    return {
      type: isActor ? "actor" : "crew",
      name: String(getRowValue(row, ["姓名", "演员", "艺人", "人员", "名称", "name", "成员"]) || "").trim(),
      role: isActor && !/演员|替|Extra|Talent|Stand-In|Double/i.test(finalRole) ? actorRoleLabel(actorKind || finalRole) : finalRole,
      dept: departmentValue ? normalizeDepartmentName(departmentValue) : isActor ? "cast" : normalizeDepartmentName(role),
      characterName,
      actorKind: isActor ? actorKind || inferActorKind(finalRole) || "演员" : "",
      vendor: String(getRowValue(row, ["经纪公司", "经纪", "公司", "供应商", "公司/供应商", "vendor", "company", "agency"]) || "个人 / 自由职业").trim(),
      grade: normalizeGrade(String(getRowValue(row, ["人员等级", "等级", "personGrade", "grade"]) || inferPersonGrade(dayRate)).trim()),
      companyGrade: normalizeGrade(String(getRowValue(row, ["公司等级", "供应商等级", "companyGrade"]) || inferCompanyGrade(dayRate)).trim()),
      dayRate,
      days: Math.max(1, toNumber(getRowValue(row, ["工作天数", "拍摄天数", "天数", "days", "duration"]), 1)),
      allowance: toNumber(getRowValue(row, ["补贴", "津贴", "经纪费", "服务费", "allowance"]), 0),
      trust: normalizeTrust(getRowValue(row, ["信任评分", "信任", "trust", "score"]) || 75),
    };
  }
  if (target === "equipment") {
    const daily = toNumber(getRowValue(row, ["日租", "租金", "单价", "daily", "rate"]));
    return {
      name: String(getRowValue(row, ["器材名", "器材", "设备", "名称", "name"]) || "").trim(),
      dept: normalizeDepartmentName(getRowValue(row, ["部门", "分组", "组别", "dept", "department"])),
      vendor: String(getRowValue(row, ["公司", "供应商", "公司/供应商", "vendor", "company"]) || "未登记公司").trim(),
      companyGrade: normalizeGrade(String(getRowValue(row, ["公司等级", "供应商等级", "等级", "companyGrade"]) || inferCompanyGrade(daily)).trim()),
      daily,
      days: Math.max(1, toNumber(getRowValue(row, ["使用天数", "天数", "days", "duration"]), 1)),
      deposit: toNumber(getRowValue(row, ["押金", "固定费用", "固定", "deposit"]), 0),
      trust: normalizeTrust(getRowValue(row, ["信任评分", "信任", "trust", "score"]) || 75),
    };
  }
  if (target === "scene") {
    return {
      code: String(getRowValue(row, ["场次编号", "场次", "编号", "code", "scene"]) || "").trim(),
      title: String(getRowValue(row, ["标题", "场景", "场景名", "title"]) || "").trim(),
      location: String(getRowValue(row, ["地点", "场景地", "location"]) || "").trim(),
      pages: Math.max(1, toNumber(getRowValue(row, ["页数", "pages"]), 1)),
      status: /已|done|完成/i.test(String(getRowValue(row, ["状态", "status"]))) ? "done" : "scheduled",
      risk: /风险|高|warning/i.test(String(getRowValue(row, ["风险", "risk"]))) ? "warning" : /关注|note/i.test(String(getRowValue(row, ["风险", "risk"]))) ? "note" : "ok",
    };
  }
  const day = Math.max(1, toNumber(getRowValue(row, ["拍摄日", "天数", "day", "第几天"]), project.currentDay));
  const rawDepartments = String(getRowValue(row, ["到场部门", "部门", "departments"]) || "");
  const departmentsFromRow = rawDepartments
    .split(/[、,，/|]/)
    .map((value) => normalizeDepartmentName(value))
    .filter(Boolean);
  return {
    day,
    code: String(getRowValue(row, ["通告单号", "编号", "code"]) || nextCallsheetCode(day)).trim(),
    date: String(getRowValue(row, ["日期", "date"]) || new Date().toISOString().slice(0, 10)).slice(0, 10),
    title: String(getRowValue(row, ["标题", "通告", "title"]) || `第 ${day} 天通告`).trim(),
    location: String(getRowValue(row, ["地点", "location"]) || "").trim(),
    weather: String(getRowValue(row, ["天气", "weather"]) || "待确认").trim(),
    callTime: String(getRowValue(row, ["集合", "开工", "callTime"]) || "08:00").slice(0, 5),
    wrapTime: String(getRowValue(row, ["收工", "wrapTime"]) || "20:00").slice(0, 5),
    scenes: String(getRowValue(row, ["场次", "scenes"]) || "")
      .split(/[、,，/|]/)
      .map((value) => value.trim())
      .filter(Boolean),
    cast: String(getRowValue(row, ["演员", "cast"]) || "待确认").trim(),
    departments: departmentsFromRow.length > 0 ? [...new Set(departmentsFromRow)] : ["production"],
    extra: {
      meals: toNumber(getRowValue(row, ["餐食", "餐数", "meals"]), 0),
      vehicles: toNumber(getRowValue(row, ["车辆", "vehicles"]), 0),
      rooms: toNumber(getRowValue(row, ["房间", "住宿", "rooms"]), 0),
      locationFee: toNumber(getRowValue(row, ["场地费", "场租", "locationFee"]), 0),
      misc: toNumber(getRowValue(row, ["杂费", "misc"]), 0),
    },
  };
}

function isValidImportItem(item, target) {
  if (target === "person") return Boolean(item.name) && item.dayRate >= 0;
  if (target === "equipment") return Boolean(item.name) && item.daily >= 0;
  if (target === "scene") return Boolean(item.code || item.title);
  return Boolean(item.day && item.title);
}

function nextCallsheetCode(day) {
  return `CS-${String(day).padStart(3, "0")}`;
}

function sortData() {
  callSheets.sort((a, b) => a.day - b.day);
  scenes.sort((a, b) => {
    const aStart = Number.parseInt(a.code, 10);
    const bStart = Number.parseInt(b.code, 10);
    return (Number.isNaN(aStart) ? 9999 : aStart) - (Number.isNaN(bStart) ? 9999 : bStart);
  });
}

function refreshAll(options = {}) {
  sortData();
  renderHeader();
  renderProjectLibraryControls();
  renderKpis();
  renderToday();
  renderCallsheetSelect();
  const selectedDay = options.selectedDay || Number(document.querySelector("#callsheetSelect").value) || project.currentDay;
  renderCallsheet(selectedDay);
  renderDailyBars();
  renderBudgetTables();
  renderAnalysisReport();
  renderAuditFilterControls();
  renderAuditModule();
  renderPersonnelModule();
  renderEquipmentModule();
  renderProgress();
  renderDepartmentInputs();
  renderInputPreferences();
  renderSceneInput();
  renderCustomProgressInput();
  renderProjectForm();
  renderInputStats();
  renderPersonnelLayers();
  renderActorBudget();
  renderPersonInputFeedback();
  renderVisualExplorerControls();
  renderVisualExplorerSummary();
  renderAnalysisVisualControls();
  renderAnalysisVisualSummary();
  renderFundFlowDetailTable();
  renderModeSpecificUi();
  applyDisplaySettings();
  canvasRegistry.forEach((draw) => draw());
}

function refreshDisplayMode() {
  applyDisplaySettings();
  renderInputPreferences();
  renderBudgetTables();
  renderAnalysisReport();
  renderAuditFilterControls();
  renderAuditModule();
  renderPersonnelLayers();
  renderActorBudget();
  renderModeSpecificUi();
  renderFundFlowDetailTable();
  canvasRegistry.forEach((draw) => draw());
}

function setupInputForms() {
  renderDepartmentInputs();
  renderInputPreferences();
  renderSceneInput();
  renderCustomProgressInput();
  renderProjectForm();
  renderInputStats();
  renderPersonnelLayers();
  renderActorBudget();
  renderPersonInputFeedback();
  applyAiPreset("openai");
  const resetLabel = document.querySelector("#resetData span");
  if (resetLabel) resetLabel.textContent = blankMode ? "清空数据" : "重置样例";

  document.querySelector("#aiProvider").addEventListener("change", (event) => {
    applyAiPreset(event.target.value);
    document.querySelector("#aiConfigStatus").textContent = "已切换服务商预设。";
  });

  document.querySelector("#saveAiConfig").addEventListener("click", () => {
    syncAiConfigFromForm();
    document.querySelector("#aiConfigStatus").textContent = `已保存当前会话配置：${aiConfigState.provider} / ${aiConfigState.model || "未填模型"}`;
  });

  document.querySelector("#testAiConfig").addEventListener("click", async () => {
    const status = document.querySelector("#aiConfigStatus");
    status.textContent = "正在测试接口...";
    try {
      const result = await callAiForSpreadsheet("返回 JSON：{\"ok\":true,\"message\":\"connected\"}");
      status.textContent = `接口可用：${result.slice(0, 80)}`;
    } catch (error) {
      status.textContent = `接口测试失败：${error.message}`;
    }
  });

  document.querySelector("#readSpreadsheet").addEventListener("click", async () => {
    const file = document.querySelector("#spreadsheetFile").files[0];
    const sheetName = document.querySelector("#spreadsheetSheetSelect").value;
    const status = document.querySelector("#spreadsheetImportStatus");
    if (!file) {
      status.textContent = "请先选择 Excel / CSV 文件。";
      return;
    }
    status.textContent = "正在读取表格...";
    try {
      const rows = await readSpreadsheetFile(file, sheetName);
      const result = parseSpreadsheetRows(rows);
      status.textContent = `已读取 ${rows.length} 行，识别为 ${result.target}，可导入 ${result.parsed.length} 行。`;
    } catch (error) {
      status.textContent = `读取失败：${error.message}`;
    }
  });

  document.querySelector("#spreadsheetSheetSelect").addEventListener("change", async (event) => {
    const file = document.querySelector("#spreadsheetFile").files[0];
    if (!file) return;
    try {
      const rows = await readSpreadsheetFile(file, event.target.value);
      parseSpreadsheetRows(rows);
      document.querySelector("#spreadsheetImportStatus").textContent = `已切换工作表：${event.target.value}`;
    } catch (error) {
      document.querySelector("#spreadsheetImportStatus").textContent = `切换工作表失败：${error.message}`;
    }
  });

  document.querySelector("#spreadsheetTarget").addEventListener("change", () => {
    if (spreadsheetImportState.rows.length === 0) return;
    const result = parseSpreadsheetRows(spreadsheetImportState.rows);
    document.querySelector("#spreadsheetImportStatus").textContent = `已切换为 ${result.target}，可导入 ${result.parsed.length} 行。`;
  });

  document.querySelector("#handwrittenFile").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    const preview = document.querySelector("#handwritingPreview");
    const status = document.querySelector("#handwritingStatus");
    if (!file) {
      preview.textContent = "等待照片";
      status.textContent = "请选择单据照片。";
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      preview.innerHTML = "";
      const image = document.createElement("img");
      image.src = dataUrl;
      image.alt = "单据照片预览";
      preview.appendChild(image);
      status.textContent = `已选择：${file.name}`;
    } catch (error) {
      preview.textContent = "无法预览";
      status.textContent = `照片读取失败：${error.message}`;
    }
  });

  document.querySelector("#aiMapSpreadsheet").addEventListener("click", async () => {
    const status = document.querySelector("#spreadsheetImportStatus");
    if (spreadsheetImportState.rows.length === 0) {
      status.textContent = "请先读取表格，再使用 AI 识别。";
      return;
    }
    status.textContent = "正在请求 AI 识别字段...";
    try {
      const resultText = await callAiForSpreadsheet(aiMappingPrompt());
      const result = parseAiJsonResult(resultText);
      if (result.target) {
        document.querySelector("#spreadsheetTarget").value = normalizeImportTarget(result.target);
        parseSpreadsheetRows(spreadsheetImportState.rows);
      }
      spreadsheetImportState.mapping = result.mapping || {};
      status.textContent = `AI 已建议导入类型：${result.target || spreadsheetImportState.target}`;
    } catch (error) {
      status.textContent = `AI 识别失败：${error.message}`;
    }
  });

  document.querySelector("#recognizeHandwritten").addEventListener("click", async () => {
    const file = document.querySelector("#handwrittenFile").files[0];
    const status = document.querySelector("#handwritingStatus");
    if (!file) {
      status.textContent = "请先选择单据照片。";
      return;
    }
    if (!isImageFile(file)) {
      status.textContent = "当前仅支持图片文件。";
      return;
    }
    status.textContent = "正在识别手写单据...";
    try {
      const dataUrl = await fileToDataUrl(file);
      const resultText = await callAiForSpreadsheet(handwrittenPrompt(), {
        image: { dataUrl, mimeType: file.type || "image/jpeg" },
        maxTokens: 1800,
        system: "你是制片现场单据识别助手，负责把手写费用单、器材单、通告草单转成可导入 JSON。只返回 JSON。",
      });
      const result = parseAiJsonResult(resultText);
      const fallbackTarget = document.querySelector("#handwrittenTarget").value;
      const parsedResult = applyRecognizedRows(result, fallbackTarget);
      document.querySelector("#spreadsheetImportStatus").textContent = `手写单据已进入预览：${parsedResult.rowCount} 行，识别为 ${parsedResult.target}，可导入 ${parsedResult.parsed.length} 行。`;
      status.textContent = `已识别 ${parsedResult.rowCount} 行，可在左侧确认导入。`;
      setFormStatus("手写单据已识别", "good");
    } catch (error) {
      status.textContent = `识别失败：${error.message}`;
    }
  });

  document.querySelector("#confirmSpreadsheetImport").addEventListener("click", importParsedRows);

  document.querySelector("#projectForm").elements.budget.addEventListener("input", (event) => {
    const nextBudget = Number(event.target.value || 0);
    const total = activeBudgetDepartments().reduce((sum, department) => sum + (Number(department.budget) || 0), 0);
    const delta = nextBudget - total;
    const status = document.querySelector("#budgetAllocationStatus");
    if (!status) return;
    status.textContent = delta >= 0 ? `剩余 ${money.format(delta)}` : `超出 ${money.format(Math.abs(delta))}`;
    status.className = delta >= 0 ? "ok" : "over";
  });

  document.querySelector("#projectForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const editableDepartmentIds = activeBudgetDepartmentIds();
    departments = departments.map((department) => {
      if (!editableDepartmentIds.has(department.id)) {
        return department;
      }
      return {
        ...department,
        budget: Math.max(0, getFormNumber(form, `deptBudget_${department.id}`)),
      };
    });
    displaySettings.customDepartments = displaySettings.customDepartments.map((customDepartment) => {
      if (!editableDepartmentIds.has(customDepartment.id)) {
        return customDepartment;
      }
      return {
        ...customDepartment,
        budget: Math.max(0, getFormNumber(form, `deptBudget_${customDepartment.id}`)),
      };
    });
    project = {
      title: form.elements.title.value.trim() || project.title,
      budget: getFormNumber(form, "budget"),
      currentDay: getFormNumber(form, "currentDay"),
      plannedDays: getFormNumber(form, "plannedDays"),
      totalScenes: isCustomInputMode() ? project.totalScenes : getFormNumber(form, "totalScenes"),
      totalPages: isCustomInputMode() ? project.totalPages : getFormNumber(form, "totalPages"),
    };
    saveData();
    refreshAll();
    setFormStatus("项目参数已保存", "good");
  });

  document.querySelector("#personForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.elements.dept.value) {
      setFormStatus("请先在录入偏好里保存自定义部门", "warning");
      return;
    }
    const selectedRole = form.elements.role.value.trim() || form.elements.rolePreset.value.trim();
    const nextPerson = {
      id: `person-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: form.elements.name.value.trim(),
      role: selectedRole,
      dept: form.elements.dept.value,
      vendor: form.elements.vendor.value.trim() || "个人 / 自由职业",
      grade: normalizeGrade(form.elements.grade.value),
      companyGrade: normalizeGrade(form.elements.companyGrade.value),
      dayRate: getFormNumber(form, "dayRate"),
      days: Math.max(1, getFormNumber(form, "days")),
      allowance: getFormNumber(form, "allowance"),
      trust: normalizeTrust(form.elements.trust.value),
    };
    people.push(nextPerson);
    lastSavedPersonId = nextPerson.id;
    lastPersonFeedback = nextPerson;
    form.reset();
    saveData();
    refreshAll();
    setFormStatus(`人员已加入：${nextPerson.name || "未命名"} · ${money.format(personTotal(nextPerson))}`, "good");
  });

  document.querySelector("#actorForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const nextActor = createActorFromForm(form);
    people.push(nextActor);
    lastSavedPersonId = nextActor.id;
    lastPersonFeedback = nextActor;
    form.reset();
    saveData();
    refreshAll();
    setFormStatus(`演员已加入：${nextActor.name || "未命名"} · ${nextActor.characterName || nextActor.actorKind} · ${money.format(personTotal(nextActor))}`, "good");
  });

  document.querySelector("#actorForm").addEventListener("input", renderActorBudget);
  document.querySelector("#actorForm").addEventListener("change", renderActorBudget);

  document.querySelector("#exportPersonnelExcel").addEventListener("click", exportPersonnelExcel);

  document.querySelector("#personForm").elements.dept.addEventListener("change", () => {
    renderPersonRolePreset();
    renderPersonInputFeedback();
  });

  document.querySelector("#personRolePreset").addEventListener("change", (event) => {
    const role = event.target.value;
    if (role) {
      document.querySelector("#personForm").elements.role.value = role;
    }
    renderPersonInputFeedback();
  });

  document.querySelector("#personForm").addEventListener("input", renderPersonInputFeedback);
  document.querySelector("#personForm").addEventListener("change", renderPersonInputFeedback);

  document.querySelector("#personnelLayerList").addEventListener("click", (event) => {
    const button = event.target.closest(".person-delete-button");
    if (!button) return;
    const personId = button.dataset.personId;
    const personIndex = Number(button.dataset.personIndex);
    const removedPerson = personId ? people.find((person) => person.id === personId) : people[personIndex];
    if (!removedPerson) return;
    people = personId ? people.filter((person) => person.id !== personId) : people.filter((_, index) => index !== personIndex);
    if (lastSavedPersonId && removedPerson.id === lastSavedPersonId) {
      lastSavedPersonId = "";
      lastPersonFeedback = null;
    }
    saveData();
    refreshAll();
    setFormStatus(`已删除人员：${removedPerson.name || "未命名"}`, "warning");
  });

  document.querySelector("#callsheetScenesInput").addEventListener("change", (event) => {
    const option = event.target.closest(".callsheet-scene-option");
    if (option) {
      option.classList.toggle("selected", event.target.checked);
    }
    updateCallsheetSceneSummary();
  });

  document.querySelector("#equipmentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.elements.dept.value) {
      setFormStatus("请先在录入偏好里保存自定义部门", "warning");
      return;
    }
    equipment.push({
      name: form.elements.name.value.trim(),
      dept: form.elements.dept.value,
      vendor: form.elements.vendor.value.trim() || "未登记公司",
      companyGrade: normalizeGrade(form.elements.companyGrade.value),
      daily: getFormNumber(form, "daily"),
      days: Math.max(1, getFormNumber(form, "days")),
      deposit: getFormNumber(form, "deposit"),
      trust: normalizeTrust(form.elements.trust.value),
    });
    form.reset();
    saveData();
    refreshAll();
    setFormStatus("器材已加入预算", "good");
  });

  document.querySelector("#sceneForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const code = form.elements.code.value.trim();
    const nextScene = {
      code,
      title: form.elements.title.value.trim(),
      location: form.elements.location.value.trim(),
      pages: Math.max(1, getFormNumber(form, "pages")),
      status: form.elements.status.value,
      risk: form.elements.risk.value,
    };
    const existingIndex = scenes.findIndex((scene) => scene.code === code);
    if (existingIndex >= 0) {
      scenes[existingIndex] = nextScene;
    } else {
      scenes.push(nextScene);
    }
    form.reset();
    saveData();
    refreshAll();
    setFormStatus(existingIndex >= 0 ? "场次已更新" : "场次已加入", "good");
  });

  const customProgressForm = document.querySelector("#customProgressForm");
  if (customProgressForm) {
    customProgressForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const name = form.elements.name.value.trim();
      const target = Math.max(0, getFormNumber(form, "target"));
      if (!name || target <= 0) {
        setFormStatus("请填写进度名称和大于 0 的目标", "warning");
        return;
      }
      const nextItem = {
        id: `custom-progress-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name,
        done: Math.max(0, getFormNumber(form, "done")),
        target,
        unit: form.elements.unit.value.trim() || "项",
      };
      const existingIndex = customProgressItems.findIndex((item) => item.name === name);
      if (existingIndex >= 0) {
        customProgressItems[existingIndex] = { ...customProgressItems[existingIndex], ...nextItem, id: customProgressItems[existingIndex].id };
      } else {
        customProgressItems.push(nextItem);
      }
      form.reset();
      form.elements.unit.value = "项";
      saveData();
      refreshAll();
      setFormStatus(existingIndex >= 0 ? `进度已更新：${name}` : `进度已加入：${name}`, "good");
    });
  }

  document.querySelector("#customProgressList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-progress-id]");
    if (!button) return;
    const item = customProgressItems.find((row) => row.id === button.dataset.progressId);
    customProgressItems = customProgressItems.filter((row) => row.id !== button.dataset.progressId);
    saveData();
    refreshAll();
    setFormStatus(`已删除进度项：${item?.name || "未命名"}`, "warning");
  });

  document.querySelector("#callsheetForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const selectedScenes = isCustomInputMode() ? [] : Array.from(form.querySelectorAll('input[name="scenes"]:checked')).map((input) => input.value);
    const selectedDepartments = Array.from(form.querySelectorAll('input[name="departments"]:checked')).map((input) => input.value);
    const fallbackDepartment = firstInputDepartmentId();
    if (selectedDepartments.length === 0 && !fallbackDepartment) {
      setFormStatus("请先在录入偏好里保存自定义部门", "warning");
      return;
    }
    const day = Math.max(1, getFormNumber(form, "day"));
    const nextSheet = {
      day,
      code: nextCallsheetCode(day),
      date: form.elements.date.value,
      title: form.elements.title.value.trim(),
      location: form.elements.location.value.trim(),
      weather: form.elements.weather.value.trim() || (isCustomInputMode() ? "待推进" : ""),
      callTime: form.elements.callTime.value,
      wrapTime: form.elements.wrapTime.value,
      scenes: selectedScenes,
      cast: form.elements.cast.value.trim() || (isCustomInputMode() ? "待确认" : ""),
      departments: selectedDepartments.length > 0 ? selectedDepartments : [fallbackDepartment || "production"],
      extra: {
        meals: getFormNumber(form, "meals"),
        vehicles: getFormNumber(form, "vehicles"),
        rooms: getFormNumber(form, "rooms"),
        locationFee: getFormNumber(form, "locationFee"),
        misc: getFormNumber(form, "misc"),
      },
    };
    const existingIndex = callSheets.findIndex((sheet) => sheet.day === day);
    if (existingIndex >= 0) {
      callSheets[existingIndex] = nextSheet;
    } else {
      callSheets.push(nextSheet);
    }
    form.reset();
    saveData();
    refreshAll({ selectedDay: day });
    setFormStatus(existingIndex >= 0 ? modeText("通告单已更新", "执行记录已更新") : modeText("通告单已加入", "执行记录已加入"), "good");
  });

  document.querySelector("#resetData").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    applyStarterData({ keepProjectId: true });
    ensureReferenceData();
    normalizeRatings();
    upsertCurrentProject();
    saveData();
    refreshAll();
    setFormStatus(blankMode ? "已恢复空白测试版" : "已恢复样例数据", "good");
  });

  document.querySelectorAll("[data-load-full-demo]").forEach((button) => {
    button.addEventListener("click", () => {
      applyFullDemoData({ keepProjectId: true });
      saveDisplaySettings();
      upsertCurrentProject();
      saveData();
      refreshAll();
      document.querySelector('[data-view="fundflow"]')?.click();
      setFormStatus("已载入完整版测试剧组", "good");
      setProjectLibraryStatus("已载入完整版测试");
    });
  });
}

function setupTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.view;
      document.querySelectorAll(".tab-button").forEach((tab) => {
        tab.classList.toggle("active", tab === button);
        tab.setAttribute("aria-selected", String(tab === button));
      });
      document.querySelectorAll(".view").forEach((view) => {
        view.classList.toggle("active", view.id === target);
      });
      if (target === "visuals") {
        renderVisualExplorerControls();
        renderVisualExplorerSummary();
        drawVisualExplorer();
      }
      if (target === "analysis") {
        renderAnalysisVisualControls();
        renderAnalysisVisualSummary();
        drawVisualExplorer("analysisVisualChart", analysisVisualState);
      }
      if (target === "fundflow") {
        renderFundFlowDetailTable();
        drawFundFlowLargeChart();
      }
      canvasRegistry.forEach((draw) => draw());
    });
  });
}

function setupActions() {
  document.querySelector("#projectLibrarySelect").addEventListener("change", (event) => {
    const snapshot = projectLibrary.find((item) => item.id === event.target.value);
    if (!snapshot) return;
    applyProjectSnapshot(snapshot);
    saveData();
    refreshAll();
    setFormStatus(`已切换项目：${project.title || snapshot.name}`, "good");
    setProjectLibraryStatus(`当前：${project.title || snapshot.name}`);
  });

  document.querySelector("#newProject").addEventListener("click", () => {
    const title = window.prompt("请输入新项目名称", "");
    if (title === null) return;
    const projectName = title.trim() || `新项目 ${projectLibrary.length + 1}`;
    applyNewProjectData(projectName);
    ensureReferenceData();
    normalizeRatings();
    upsertCurrentProject();
    saveData();
    refreshAll();
    setFormStatus(`已新建项目：${project.title}`, "good");
    setProjectLibraryStatus(`已新建：${project.title}`);
    document.querySelector('[data-view="input"]').click();
  });

  document.querySelector("#saveProjectSnapshot").addEventListener("click", () => {
    upsertCurrentProject();
    saveData();
    refreshAll();
    setFormStatus(`项目已保存：${project.title || "未命名项目"}`, "good");
    setProjectLibraryStatus(`已保存：${project.title || "未命名项目"}`);
  });

  document.querySelector("#renameProject").addEventListener("click", () => {
    const title = window.prompt("请输入项目名称", project.title || "");
    if (title === null) return;
    const projectName = title.trim();
    if (!projectName) {
      setProjectLibraryStatus("项目名不能为空");
      return;
    }
    project.title = projectName;
    upsertCurrentProject();
    saveData();
    refreshAll();
    setFormStatus(`项目已命名：${project.title}`, "good");
    setProjectLibraryStatus(`已命名：${project.title}`);
  });

  document.querySelector("#deleteProject").addEventListener("click", () => {
    if (projectLibrary.length <= 1) {
      const keep = window.confirm("当前只剩一个项目。删除后会自动创建一个新的空白项目，继续吗？");
      if (!keep) return;
    } else {
      const keep = window.confirm(`确定删除当前项目「${project.title || "未命名项目"}」吗？此操作会移除本机保存的数据。`);
      if (!keep) return;
    }
    const message = removeCurrentProject();
    refreshAll();
    setFormStatus(message, "warning");
    setProjectLibraryStatus("已删除项目");
  });

  document.querySelector("#refreshProject").addEventListener("click", () => {
    const message = reloadCurrentProject();
    refreshAll();
    setFormStatus(message, "good");
    setProjectLibraryStatus(`当前：${project.title || "未命名项目"}`);
  });

  document.querySelector("#toggleDarkMode").addEventListener("click", () => {
    displaySettings.darkMode = !displaySettings.darkMode;
    applyDisplaySettings();
    saveDisplaySettings();
    refreshDisplayMode();
  });

  document.querySelector("#toggleColorBlindMode").addEventListener("click", () => {
    displaySettings.colorBlindMode = !displaySettings.colorBlindMode;
    applyDisplaySettings();
    saveDisplaySettings();
    refreshDisplayMode();
  });

  document.querySelector("#printSnapshot").addEventListener("click", () => window.print());
  document.querySelector("#focusToday").addEventListener("click", () => {
    document.querySelector('[data-view="callsheet"]').click();
    const targetSheet = callSheets.find((sheet) => sheet.day === project.currentDay) || callSheets[callSheets.length - 1];
    if (targetSheet) {
      document.querySelector("#callsheetSelect").value = String(targetSheet.day);
      renderCallsheet(targetSheet.day);
    }
  });
  document.querySelector("#callsheetSelect").addEventListener("change", (event) => renderCallsheet(Number(event.target.value)));

  document.querySelector("#refreshProfessionalReport").addEventListener("click", () => {
    renderProfessionalReport(createLocalProfessionalReport(), "local");
  });

  document.querySelector("#generateAiProfessionalReport").addEventListener("click", async () => {
    const status = document.querySelector("#professionalReportStatus");
    status.textContent = "AI 正在生成专业报告...";
    try {
      const resultText = await callAiForSpreadsheet(professionalReportPrompt(), {
        maxTokens: 2200,
        system: "你是资深影视制片财务顾问，擅长把剧组预算、通告单、人员、器材和进度数据整理成给监制/制片厂看的经营报告。只返回 JSON。",
      });
      const parsed = parseAiJsonResult(resultText);
      renderProfessionalReport(normalizeProfessionalReport(parsed, resultText), "ai");
      setFormStatus("AI 专业报告已生成", "good");
    } catch (error) {
      status.textContent = `AI 报告失败：${error.message}`;
    }
  });

  document.querySelector("#copyProfessionalReport").addEventListener("click", async () => {
    const status = document.querySelector("#professionalReportStatus");
    try {
      if (!professionalReportState.text) {
        renderProfessionalReport(createLocalProfessionalReport(), "local");
      }
      await copyTextToClipboard(professionalReportState.text);
      status.textContent = "报告已复制";
    } catch (error) {
      status.textContent = `复制失败：${error.message}`;
    }
  });
}

function renderCharts() {
  registerChart("budgetDonut", drawBudgetDonut);
  registerChart("dailyCostChart", drawDailyCostChart);
  registerChart("departmentChart", drawDepartmentChart);
  registerChart("categoryChart", drawCategoryChart);
  registerChart("fundFlowChart", drawFundFlowChart);
  registerChart("fundFlowLargeChart", drawFundFlowLargeChart);
  registerChart("progressChart", drawProgressChart);
  registerChart("editProgressChart", drawEditProgressChart);
  registerChart("visualExplorerChart", drawVisualExplorer);
  registerChart("analysisVisualChart", () => drawVisualExplorer("analysisVisualChart", analysisVisualState));
}

function init() {
  loadDisplaySettings();
  loadProjectLibrary();
  loadSavedData();
  setupTabs();
  setupActions();
  setupVisualExplorer();
  setupAnalysisVisual();
  setupBudgetShareControls();
  setupAuditFilters();
  setupInputPreferences();
  setupInputForms();
  renderCharts();
  setupChartTooltips();
  refreshAll();
}

window.addEventListener("resize", () => {
  canvasRegistry.forEach((draw) => draw());
});

init();
