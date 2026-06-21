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

const defaultVfxReviewVersions = [
  {
    id: "vfx-review-factory-v002",
    vendor: "蓝线调色棚",
    shotGroup: "13-18 工厂追逐",
    version: "v002",
    status: "notes",
    shotCount: 18,
    approvedCount: 9,
    date: "2026-05-18",
    reviewer: "邵青 / 林夏",
    paymentGate: "hold",
    notes: "爆点合成边缘和雨夜调色需要返修，下一笔付款先等 v003。",
    media: {
      fileName: "factory_chase_comp_v002.mp4",
      fileType: "video/mp4",
      fileSize: 186000000,
      uploadedBy: "蓝线调色棚",
      uploadedAt: "2026-05-18T10:24:00.000Z",
    },
  },
  {
    id: "vfx-review-rain-v001",
    vendor: "蓝线调色棚",
    shotGroup: "19-24 河堤雨夜",
    version: "v001",
    status: "submitted",
    shotCount: 12,
    approvedCount: 2,
    date: "2026-05-19",
    reviewer: "监制 / 摄影指导",
    paymentGate: "hold",
    notes: "等导演批注，重点看雨效方向和肤色一致性。",
    media: {
      fileName: "river_rain_v001.mov",
      fileType: "video/quicktime",
      fileSize: 242000000,
      uploadedBy: "蓝线调色棚",
      uploadedAt: "2026-05-19T14:08:00.000Z",
    },
  },
  {
    id: "vfx-review-title-v001",
    vendor: "云桥后期统筹",
    shotGroup: "片头包装 / 字幕模板",
    version: "v001",
    status: "approved",
    shotCount: 6,
    approvedCount: 6,
    date: "2026-05-17",
    reviewer: "制片主任",
    paymentGate: "milestone",
    notes: "包装方向确认，可进入批量套版。",
    media: {
      fileName: "title_package_v001.png",
      fileType: "image/png",
      fileSize: 4800000,
      uploadedBy: "云桥后期统筹",
      uploadedAt: "2026-05-17T18:30:00.000Z",
    },
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

function normalizeCallsheetProductionDetails(sheet) {
  const rawDetails = Array.isArray(sheet?.productionDetails) ? sheet.productionDetails : [];
  const expectedParts = productionCostPartsFromExtra(sheet);
  const expectedTotal = productionDetailKeys.reduce((sum, key) => sum + Math.round(Number(expectedParts[key]) || 0), 0);
  const normalizedDetails = rawDetails
    .map((detail, index) => {
      const value = Math.round(Number(detail?.value) || 0);
      const category = productionDetailCategoryKey(detail);
      const label = String(detail?.label || detail?.vendor || productionDetailTypeLabel(category)).trim();
      if (value <= 0 || !label) return null;
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
    .filter(Boolean);
  const rawTotal = normalizedDetails.reduce((sum, detail) => sum + detail.value, 0);
  const onlyGenericProduction =
    normalizedDetails.length > 0 &&
    expectedTotal > 0 &&
    Math.abs(rawTotal - expectedTotal) <= 2 &&
    normalizedDetails.every((detail) => detail.category === "misc" && /生产|通告|外部费用|production/i.test(`${detail.type} ${detail.label}`));
  if (onlyGenericProduction) {
    return buildProductionDetailsFromExtra(sheet);
  }
  const detailTotals = normalizedDetails.reduce((result, detail) => {
    result[detail.category] = (result[detail.category] || 0) + detail.value;
    return result;
  }, {});
  const mergedDetails = [...normalizedDetails];
  productionDetailKeys.forEach((key) => {
    const expected = Math.round(Number(expectedParts[key]) || 0);
    const existing = Math.round(Number(detailTotals[key]) || 0);
    const missing = expected - existing;
    if (missing > 0) {
      mergedDetails.push(...splitProductionAmount(missing, key, sheet));
    }
  });
  return mergedDetails;
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
  vfxReviewVersions = clone(defaultVfxReviewVersions);
  customProgressItems = [
    { id: "full-demo-progress-contracts", name: "合同归档", done: 18, target: 24, unit: "份" },
    { id: "full-demo-progress-invoices", name: "发票回收", done: 9, target: 18, unit: "张" },
    { id: "full-demo-progress-location", name: "场地审批", done: 7, target: 9, unit: "处" },
    { id: "full-demo-progress-vfx-shots", name: "VFX 镜头交付", done: 18, target: 42, unit: "镜头" },
    { id: "full-demo-progress-vfx-color", name: "调色版本验收", done: 1, target: 4, unit: "版" },
  ];
  workLogs = [];
  scheduleTasks = [];
  pipelineEvents = [];
  trackingV2TaskEdits = {};
  trackingV2WorkOrderEdits = {};
  trackingV2InboxEdits = {};
  trackingV2AdminRoleEdits = {};
  trackingV2ApiRouteEdits = {};
  trackingV2ShotEdits = {};
  trackingV2AssetEdits = {};
  trackingV2CalendarExceptionEdits = {};
  trackingV2CalendarExceptions = [];
  trackingV2MediaPlaylistIds = [];
  selectedScheduleTaskId = "";
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
let vfxReviewVersions = blankMode ? [] : clone(defaultVfxReviewVersions);
let customProgressItems = [];
let workLogs = [];
let scheduleTasks = [];
let pipelineEvents = [];
let currentProjectId = defaultProjectId;
let projectLibrary = [];
let selectedScheduleTaskId = "";
let scheduleDragState = null;
let selectedInspectorTarget = null;
let selectedV2ReviewId = "";
let selectedV2WorkOrderId = "";
let selectedV2InboxId = "";
let selectedV2AdminUserId = "";
let selectedV2ApiRouteId = "";
let selectedV2ShotId = "";
let selectedV2AssetId = "";
let selectedV2MediaCompareId = "";
let trackingV2TaskEdits = {};
let trackingV2WorkOrderEdits = {};
let trackingV2InboxEdits = {};
let trackingV2AdminRoleEdits = {};
let trackingV2ApiRouteEdits = {};
let trackingV2ShotEdits = {};
let trackingV2AssetEdits = {};
let trackingV2CalendarExceptionEdits = {};
let trackingV2CalendarExceptions = [];
let trackingV2MediaPlaylistIds = [];
let trackerUiState = {
  status: "all",
  assignee: "all",
  expandedShotCode: "",
  role: "all",
  v2ResourceChart: "area",
  v2InspectGroup: "department",
  v2InspectWeek: 0,
  v2ResourceSelectedKey: "",
  v2ResourceSelectedWeek: 0,
  v2TaskDateEditor: "",
  v2ProjectView: "grid",
  v2ProjectSort: "recent",
  v2ProjectQuery: "",
  v2CollapsedInsights: {},
};

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
  meals: "#477a38",
  vehicles: "#6b5aa6",
  rooms: "#c98a1c",
  locationFee: "#173f52",
  misc: "#945f35",
};

const colorBlindCategoryColors = {
  labor: "#0072b2",
  equipment: "#d55e00",
  production: "#009e73",
  meals: "#009e73",
  vehicles: "#cc79a7",
  rooms: "#e69f00",
  locationFee: "#56b4e9",
  misc: "#999999",
};

const categoryNames = {
  labor: "人员",
  equipment: "器材",
  production: "生产",
  meals: "餐食",
  vehicles: "车辆",
  rooms: "住宿/酒店",
  locationFee: "场地",
  misc: "杂费",
};

const productionDetailKeys = ["meals", "vehicles", "rooms", "locationFee", "misc"];

const gradeOptions = ["none", "A", "B", "C", "D", "E", "F", "G"];
const ratedGradeOptions = gradeOptions.filter((grade) => grade !== "none");

const i18nText = {
  zh: {
    "app.title": "Frederick",
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
    "personnelInput.contact": "联系方式",
    "personnelInput.note": "备注",
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
    "app.title": "Frederick",
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
    "personnelInput.contact": "Contact",
    "personnelInput.note": "Notes",
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

const chartViewState = new Map();
const chartZoomStep = 0.15;
const chartMinZoom = 0.4;
const chartMaxZoom = 1.85;
const zoomableChartIds = new Set(["analysisVisualChart", "fundFlowChart", "fundFlowLargeChart", "visualExplorerChart"]);
const canvasPanState = new Map();

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
      vfxReviewVersions: clone(vfxReviewVersions),
      customProgressItems: clone(customProgressItems),
      workLogs: clone(workLogs),
      scheduleTasks: clone(scheduleTasks),
      pipelineEvents: clone(pipelineEvents),
      trackingV2TaskEdits: clone(trackingV2TaskEdits),
      trackingV2WorkOrderEdits: clone(trackingV2WorkOrderEdits),
      trackingV2InboxEdits: clone(trackingV2InboxEdits),
      trackingV2AdminRoleEdits: clone(trackingV2AdminRoleEdits),
      trackingV2ApiRouteEdits: clone(trackingV2ApiRouteEdits),
      trackingV2ShotEdits: clone(trackingV2ShotEdits),
      trackingV2AssetEdits: clone(trackingV2AssetEdits),
      trackingV2CalendarExceptionEdits: clone(trackingV2CalendarExceptionEdits),
      trackingV2CalendarExceptions: clone(trackingV2CalendarExceptions),
      trackingV2MediaPlaylistIds: clone(trackingV2MediaPlaylistIds),
    },
  };
}

function normalizeProjectSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return null;
  const data = snapshot.data || snapshot;
  const projectData = data.project || {};
  const hasVfxReviewData = Object.prototype.hasOwnProperty.call(data, "vfxReviewVersions");
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
      vfxReviewVersions: hasVfxReviewData ? normalizeVfxReviewVersions(data.vfxReviewVersions) : blankMode ? [] : clone(defaultVfxReviewVersions),
      customProgressItems: normalizeCustomProgressItems(data.customProgressItems),
      workLogs: normalizeWorkLogs(data.workLogs),
      scheduleTasks: normalizeScheduleTasks(data.scheduleTasks),
      pipelineEvents: normalizePipelineEvents(data.pipelineEvents),
      trackingV2TaskEdits: normalizeTrackingV2EditMap(data.trackingV2TaskEdits),
      trackingV2WorkOrderEdits: normalizeTrackingV2EditMap(data.trackingV2WorkOrderEdits),
      trackingV2InboxEdits: normalizeTrackingV2EditMap(data.trackingV2InboxEdits),
      trackingV2AdminRoleEdits: normalizeTrackingV2RoleEdits(data.trackingV2AdminRoleEdits),
      trackingV2ApiRouteEdits: normalizeTrackingV2EditMap(data.trackingV2ApiRouteEdits),
      trackingV2ShotEdits: normalizeTrackingV2EditMap(data.trackingV2ShotEdits),
      trackingV2AssetEdits: normalizeTrackingV2EditMap(data.trackingV2AssetEdits),
      trackingV2CalendarExceptionEdits: normalizeTrackingV2EditMap(data.trackingV2CalendarExceptionEdits),
      trackingV2CalendarExceptions: normalizeTrackingV2CalendarExceptions(data.trackingV2CalendarExceptions),
      trackingV2MediaPlaylistIds: normalizeTrackingV2PlaylistIds(data.trackingV2MediaPlaylistIds),
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
  vfxReviewVersions = clone(normalized.data.vfxReviewVersions);
  customProgressItems = clone(normalized.data.customProgressItems);
  workLogs = clone(normalized.data.workLogs);
  scheduleTasks = clone(normalized.data.scheduleTasks);
  pipelineEvents = clone(normalized.data.pipelineEvents);
  trackingV2TaskEdits = clone(normalized.data.trackingV2TaskEdits);
  trackingV2WorkOrderEdits = clone(normalized.data.trackingV2WorkOrderEdits);
  trackingV2InboxEdits = clone(normalized.data.trackingV2InboxEdits);
  trackingV2AdminRoleEdits = clone(normalized.data.trackingV2AdminRoleEdits);
  trackingV2ApiRouteEdits = clone(normalized.data.trackingV2ApiRouteEdits);
  trackingV2ShotEdits = clone(normalized.data.trackingV2ShotEdits);
  trackingV2AssetEdits = clone(normalized.data.trackingV2AssetEdits);
  trackingV2CalendarExceptionEdits = clone(normalized.data.trackingV2CalendarExceptionEdits);
  trackingV2CalendarExceptions = clone(normalized.data.trackingV2CalendarExceptions);
  trackingV2MediaPlaylistIds = clone(normalized.data.trackingV2MediaPlaylistIds);
  selectedScheduleTaskId = scheduleTasks[0]?.id || "";
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

function localizedText(zh, en) {
  return displaySettings.language === "en" ? en : zh;
}

function contextualLabel(zh, en) {
  return localizedText(zh, en);
}

function renderLanguageText() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = translate(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", translate(node.dataset.i18nPlaceholder));
  });
  document.documentElement.lang = displaySettings.language === "en" ? "en" : "zh-CN";
  document.documentElement.style.colorScheme = displaySettings.darkMode ? "dark" : "light";
  const title = localizedText("Frederick — 制片管理系统", "Frederick — Production Management System");
  document.title = title;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", displaySettings.darkMode ? "#111413" : "#f3f4f1");
  updatePanelControlLabels();
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

function normalizeVfxReviewStatus(status) {
  return ["submitted", "notes", "approved", "blocked"].includes(status) ? status : "submitted";
}

function normalizeVfxPaymentGate(gate) {
  return ["hold", "deposit", "milestone", "final"].includes(gate) ? gate : "hold";
}

function normalizeVfxReviewVersions(items) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const shotCount = Math.max(1, Number(item?.shotCount) || 1);
      const approvedCount = Math.max(0, Math.min(shotCount, Number(item?.approvedCount) || 0));
      const fallbackMedia = defaultVfxReviewVersions.find((row) => row.id === String(item?.id || ""))?.media || null;
      const media = normalizeVfxReviewMedia(item?.media || fallbackMedia);
      return {
        id: String(item?.id || `vfx-review-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`),
        vendor: String(item?.vendor || "").trim() || "未登记供应商",
        shotGroup: String(item?.shotGroup || "").trim() || "未命名镜头组",
        version: String(item?.version || "").trim() || "v001",
        status: normalizeVfxReviewStatus(item?.status),
        shotCount,
        approvedCount,
        date: String(item?.date || "").trim(),
        reviewer: String(item?.reviewer || "").trim() || "未指派",
        paymentGate: normalizeVfxPaymentGate(item?.paymentGate),
        notes: String(item?.notes || "").trim(),
        media,
      };
    })
    .filter((item) => item.vendor && item.shotGroup && item.version);
}

function normalizeVfxReviewMedia(media) {
  if (!media || typeof media !== "object") return null;
  const fileName = String(media.fileName || "").trim();
  if (!fileName) return null;
  const previewUrl = String(media.previewUrl || "").trim();
  return {
    fileName,
    fileType: String(media.fileType || "application/octet-stream").trim(),
    fileSize: Math.max(0, Number(media.fileSize) || 0),
    uploadedBy: String(media.uploadedBy || "").trim() || "本地上传",
    uploadedAt: String(media.uploadedAt || "").trim() || new Date().toISOString(),
    previewUrl: previewUrl.startsWith("data:image/") ? previewUrl : "",
  };
}

function normalizePipelineEvents(items) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      id: String(item?.id || `pipeline-event-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`),
      eventType: String(item?.eventType || "pipeline.event").trim(),
      label: String(item?.label || "未命名事件").trim(),
      entityType: String(item?.entityType || "Queue").trim(),
      entityName: String(item?.entityName || "").trim(),
      action: String(item?.action || "").trim(),
      status: String(item?.status || "queued").trim(),
      tone: ["warning", "note", "good"].includes(item?.tone) ? item.tone : "good",
      path: String(item?.path || "").trim(),
      payload: item?.payload && typeof item.payload === "object" ? item.payload : {},
      createdAt: String(item?.createdAt || new Date().toISOString()),
    }))
    .filter((item) => item.eventType && item.label)
    .slice(0, 24);
}

function normalizeTrackingV2EditMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => String(key || "").trim())
      .map(([key, entry]) => [String(key), entry && typeof entry === "object" && !Array.isArray(entry) ? { ...entry } : entry]),
  );
}

function normalizeTrackingV2RoleEdits(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const allowed = new Set(["admin", "producer", "supervisor", "artist", "reviewer"]);
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, role]) => [String(key || "").trim(), String(role || "").trim()])
      .filter(([key, role]) => key && allowed.has(role)),
  );
}

function normalizeTrackingV2CalendarExceptions(items) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const day = Math.max(1, Math.round(Number(item?.day) || Number(item?.date) || project.currentDay || 1));
      const hours = Math.max(0, Math.min(24, Number(item?.hours) || 0));
      const label = String(item?.label || "").trim() || (hours > 0 ? "Reduced hours" : "Production hold");
      return {
        id: String(item?.id || `custom-cal-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`),
        day,
        type: String(item?.type || (hours > 0 ? "REDUCED_HOURS" : "HOLD")).trim(),
        label,
        hours,
        inheritedFrom: String(item?.inheritedFrom || "local").trim(),
        note: String(item?.note || "").trim(),
      };
    })
    .filter((item) => item.label)
    .slice(0, 12);
}

function normalizeTrackingV2PlaylistIds(items) {
  const ids = (Array.isArray(items) ? items : []).map((item) => String(item || "").trim()).filter(Boolean);
  return Array.from(new Set(ids)).slice(0, 12);
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
      vfxReviewVersions = Object.prototype.hasOwnProperty.call(saved, "vfxReviewVersions") ? normalizeVfxReviewVersions(saved.vfxReviewVersions) : blankMode ? [] : clone(defaultVfxReviewVersions);
      customProgressItems = normalizeCustomProgressItems(saved.customProgressItems);
      workLogs = normalizeWorkLogs(saved.workLogs);
      scheduleTasks = normalizeScheduleTasks(saved.scheduleTasks);
      pipelineEvents = normalizePipelineEvents(saved.pipelineEvents);
      trackingV2TaskEdits = normalizeTrackingV2EditMap(saved.trackingV2TaskEdits);
      trackingV2WorkOrderEdits = normalizeTrackingV2EditMap(saved.trackingV2WorkOrderEdits);
      trackingV2InboxEdits = normalizeTrackingV2EditMap(saved.trackingV2InboxEdits);
      trackingV2AdminRoleEdits = normalizeTrackingV2RoleEdits(saved.trackingV2AdminRoleEdits);
      trackingV2ApiRouteEdits = normalizeTrackingV2EditMap(saved.trackingV2ApiRouteEdits);
      trackingV2ShotEdits = normalizeTrackingV2EditMap(saved.trackingV2ShotEdits);
      trackingV2AssetEdits = normalizeTrackingV2EditMap(saved.trackingV2AssetEdits);
      trackingV2CalendarExceptionEdits = normalizeTrackingV2EditMap(saved.trackingV2CalendarExceptionEdits);
      trackingV2CalendarExceptions = normalizeTrackingV2CalendarExceptions(saved.trackingV2CalendarExceptions);
      trackingV2MediaPlaylistIds = normalizeTrackingV2PlaylistIds(saved.trackingV2MediaPlaylistIds);
      selectedScheduleTaskId = scheduleTasks[0]?.id || "";
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
  vfxReviewVersions = blankMode ? [] : clone(defaultVfxReviewVersions);
  customProgressItems = [];
  workLogs = [];
  scheduleTasks = [];
  pipelineEvents = [];
  trackingV2TaskEdits = {};
  trackingV2WorkOrderEdits = {};
  trackingV2InboxEdits = {};
  trackingV2AdminRoleEdits = {};
  trackingV2ApiRouteEdits = {};
  trackingV2ShotEdits = {};
  trackingV2AssetEdits = {};
  trackingV2CalendarExceptionEdits = {};
  trackingV2CalendarExceptions = [];
  trackingV2MediaPlaylistIds = [];
  selectedScheduleTaskId = "";
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
  vfxReviewVersions = [];
  customProgressItems = [];
  workLogs = [];
  scheduleTasks = [];
  pipelineEvents = [];
  trackingV2TaskEdits = {};
  trackingV2WorkOrderEdits = {};
  trackingV2InboxEdits = {};
  trackingV2AdminRoleEdits = {};
  trackingV2ApiRouteEdits = {};
  trackingV2ShotEdits = {};
  trackingV2AssetEdits = {};
  trackingV2CalendarExceptionEdits = {};
  trackingV2CalendarExceptions = [];
  trackingV2MediaPlaylistIds = [];
  selectedScheduleTaskId = "";
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
    const productionDetails = normalizeCallsheetProductionDetails(sheet);
    const existingDetails = Array.isArray(sheet.productionDetails) ? sheet.productionDetails : [];
    const departmentsChanged = expandedDepartments.join("|") !== sheetDepartments.join("|");
    const detailsChanged = JSON.stringify(productionDetails) !== JSON.stringify(existingDetails);
    if (!departmentsChanged && !detailsChanged) {
      return { ...sheet, departments: sheetDepartments };
    }
    changed = true;
    return {
      ...sheet,
      departments: expandedDepartments,
      productionDetails,
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
        vfxReviewVersions,
        customProgressItems,
        workLogs,
        scheduleTasks,
        pipelineEvents,
        trackingV2TaskEdits,
        trackingV2WorkOrderEdits,
        trackingV2InboxEdits,
        trackingV2AdminRoleEdits,
        trackingV2ApiRouteEdits,
        trackingV2ShotEdits,
        trackingV2AssetEdits,
        trackingV2CalendarExceptionEdits,
        trackingV2CalendarExceptions,
        trackingV2MediaPlaylistIds,
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
      contact: person.contact || "",
      note: person.note || "",
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

function getFormText(form, name) {
  return String(form.elements.namedItem(name)?.value || "").trim();
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

function equipmentWorkKey(item, index = equipment.indexOf(item)) {
  return `${item?.name || "未命名器材"}|${item?.vendor || ""}|${item?.dept || ""}|${index}`;
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
  const explicitCategory = String(detail?.category || "").trim();
  if (productionDetailKeys.includes(explicitCategory)) return explicitCategory;
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

function productionDetailDisplayLabel(detail) {
  const categoryLabel = productionDetailTypeLabel(productionDetailCategoryKey(detail));
  const vendor = String(detail?.vendor || detail?.label || categoryLabel).trim();
  if (productionDetailCategoryKey(detail) === "vehicles") return `${vendor} · 车辆`;
  if (productionDetailCategoryKey(detail) === "rooms") return `${vendor} · 酒店/房间`;
  if (productionDetailCategoryKey(detail) === "locationFee") return `${vendor} · 场地`;
  if (productionDetailCategoryKey(detail) === "meals") return `${vendor} · 餐食`;
  return String(detail?.label || vendor || categoryLabel).trim();
}

function normalizeProductionDetailRows(sheet, options = {}) {
  const useFallback = options.fallback !== false;
  const detailedRows = normalizeCallsheetProductionDetails(sheet);

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

function personWorkKey(person, index = people.indexOf(person)) {
  return person?.id || `${person?.name || "未命名"}|${person?.role || ""}|${person?.dept || ""}|${index}`;
}

function findPersonByWorkKey(key) {
  return people.find((person, index) => personWorkKey(person, index) === key) || null;
}

function normalizeWorkLogs(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row, index) => {
      const person = row.personKey ? findPersonByWorkKey(row.personKey) : null;
      const day = Math.max(1, Number(row.day) || project.currentDay || 1);
      const sheet = callSheets.find((item) => item.day === day);
      const hours = Math.max(0, Math.min(24, Number(row.hours) || 0));
      const personName = String(row.personName || person?.name || "未命名人员").trim();
      return {
        id: String(row.id || `work-log-${Date.now()}-${index}`),
        personKey: String(row.personKey || (person ? personWorkKey(person) : personName)),
        personName,
        role: String(row.role || person?.role || "").trim(),
        dept: String(row.dept || person?.dept || "production").trim(),
        day,
        date: String(row.date || sheet?.date || "").trim(),
        task: String(row.task || sheet?.title || "项目任务").trim(),
        status: String(row.status || "recorded").trim(),
        hours,
        source: row.source === "estimated" ? "estimated" : "manual",
      };
    })
    .filter((row) => row.hours > 0);
}

function timeToMinutes(value) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})$/u);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function sheetDurationHours(sheet) {
  const start = timeToMinutes(sheet?.callTime);
  const end = timeToMinutes(sheet?.wrapTime);
  if (start === null || end === null) return 10;
  let duration = (end - start) / 60;
  if (duration <= 0) duration += 24;
  return Math.max(4, Math.min(16, Math.round(duration * 2) / 2));
}

function estimatedWorkLogRows(manualRows = normalizeWorkLogs(workLogs)) {
  const manualKeys = new Set(manualRows.map((row) => `${row.personKey}:${row.day}`));
  const sourceSheets = callSheets.filter((sheet) => sheet.day <= project.currentDay);
  const sheets = sourceSheets.length > 0 ? sourceSheets : callSheets.slice(0, Math.min(callSheets.length, project.currentDay || 3));
  return sheets.flatMap((sheet) => {
    const baseHours = sheetDurationHours(sheet);
    const task = sheet.title || `${modeText("通告", "记录")} ${sheet.day}`;
    return people
      .map((person, index) => ({ person, key: personWorkKey(person, index) }))
      .filter(({ person }) => sheet.departments.includes(person.dept))
      .filter(({ key }) => !manualKeys.has(`${key}:${sheet.day}`))
      .map(({ person, key }) => {
        const actorFactor = isActorPerson(person) ? 0.76 : 1;
        const postFactor = /post|vfx|music|publicity/u.test(person.dept) ? 0.62 : 1;
        const hours = Math.max(2, Math.round(baseHours * actorFactor * postFactor * 2) / 2);
        return {
          id: `estimated-${sheet.day}-${key}`,
          personKey: key,
          personName: person.name || "未命名人员",
          role: personRoleDisplay(person),
          dept: person.dept,
          day: sheet.day,
          date: sheet.date || "",
          task,
          status: sheet.day === project.currentDay ? "current" : "estimated",
          hours,
          source: "estimated",
        };
      });
  });
}

function workHourRows() {
  const manualRows = normalizeWorkLogs(workLogs);
  return [...manualRows, ...estimatedWorkLogRows(manualRows)].sort((a, b) => b.day - a.day || b.hours - a.hours);
}

function workHourSummary() {
  const rows = workHourRows();
  const manualRows = rows.filter((row) => row.source === "manual");
  const totalHours = rows.reduce((sum, row) => sum + row.hours, 0);
  const recordedHours = manualRows.reduce((sum, row) => sum + row.hours, 0);
  const peopleMap = new Map();
  const dayMap = new Map();
  rows.forEach((row) => {
    if (!peopleMap.has(row.personKey)) {
      peopleMap.set(row.personKey, {
        personKey: row.personKey,
        name: row.personName,
        role: row.role,
        dept: row.dept,
        hours: 0,
        days: new Set(),
        overtime: 0,
        recorded: 0,
      });
    }
    const personRow = peopleMap.get(row.personKey);
    personRow.hours += row.hours;
    personRow.days.add(row.day);
    if (row.hours > 10.5) personRow.overtime += 1;
    if (row.source === "manual") personRow.recorded += row.hours;
    dayMap.set(row.day, (dayMap.get(row.day) || 0) + row.hours);
  });
  const topPeople = Array.from(peopleMap.values())
    .map((row) => ({ ...row, dayCount: row.days.size }))
    .sort((a, b) => b.hours - a.hours);
  const dayRows = Array.from(dayMap.entries())
    .map(([day, hours]) => ({ day, hours }))
    .sort((a, b) => a.day - b.day);
  const peakDay = dayRows.reduce((best, row) => (row.hours > (best?.hours || 0) ? row : best), null);
  return {
    rows,
    manualRows,
    totalHours,
    recordedHours,
    estimatedHours: Math.max(0, totalHours - recordedHours),
    topPeople,
    dayRows,
    peakDay,
    overtimeCount: rows.filter((row) => row.hours > 10.5).length,
    personCount: topPeople.length,
  };
}

function clampDay(value) {
  return Math.max(1, Math.min(Math.max(project.plannedDays || 1, 1), Math.round(Number(value) || 1)));
}

function scheduleTaskRisk(task) {
  if (task.status === "延期") return "over";
  if (task.status === "暂停") return "tight";
  if (task.end < (project.currentDay || 1) && task.progressRate < 1) return "over";
  if (task.progressRate < 0.55 && (project.currentDay || 1) > task.start) return "tight";
  return "ok";
}

function normalizeScheduleTask(row, index = 0) {
  if (!row || typeof row !== "object") return null;
  const start = clampDay(row.start);
  const end = clampDay(Math.max(start, Number(row.end) || start));
  const progressRate = Math.max(0, Math.min(1, Number(row.progressRate ?? row.progress ?? 0) || 0));
  const title = String(row.title || "").trim();
  if (!title) return null;
  const task = {
    id: String(row.id || `schedule-${Date.now()}-${index}`),
    title,
    owner: String(row.owner || "未指派").trim(),
    start,
    end,
    progressRate,
    taskCount: Math.max(1, Math.round(Number(row.taskCount) || 1)),
    color: String(row.color || activeCategoryColor("production")).trim(),
    status: String(row.status || (progressRate >= 1 ? "完成" : "进行中")).trim(),
    source: row.source === "manual" ? "manual" : "auto",
    order: Number.isFinite(Number(row.order)) ? Number(row.order) : index,
  };
  return {
    ...task,
    risk: scheduleTaskRisk(task),
    span: Math.max(1, end - start + 1),
    progressLabel: percentText(progressRate),
  };
}

function normalizeScheduleTasks(rows, options = {}) {
  if (!Array.isArray(rows)) return [];
  const normalized = rows.map(normalizeScheduleTask).filter(Boolean);
  if (options.sortByStart) {
    return normalized.sort((a, b) => a.start - b.start || a.end - b.end || a.order - b.order);
  }
  return normalized.sort((a, b) => a.order - b.order);
}

function automaticProductionScheduleRows() {
  const rows = [];
  activeBudgetDepartments().forEach((department, index) => {
    const sheets = callSheets.filter((sheet) => sheet.departments.includes(department.id));
    if (sheets.length === 0) return;
    const start = Math.min(...sheets.map((sheet) => sheet.day));
    const end = Math.max(...sheets.map((sheet) => sheet.day));
    const completed = sheets.filter((sheet) => sheet.day <= project.currentDay).length;
    const owner = people.find((person) => person.dept === department.id);
    const progressRate = sheets.length > 0 ? completed / sheets.length : 0;
    rows.push({
      id: `dept-${department.id}`,
      title: department.name,
      owner: owner ? `${owner.name} · ${personRoleDisplay(owner)}` : "未指派",
      start: clampDay(start),
      end: clampDay(end),
      progressRate,
      taskCount: sheets.length,
      color: activeDepartmentColor(department, index),
      status: end < project.currentDay && progressRate < 1 ? "延期" : progressRate >= 1 ? "完成" : "进行中",
      source: "auto",
    });
  });
  customProgressRows().forEach((row, index) => {
    const start = clampDay(Math.max(1, project.currentDay - 2 + index));
    const span = Math.max(2, Math.ceil((1 - row.rate) * 5));
    rows.push({
      id: `custom-${row.id}`,
      title: row.label,
      owner: "自定义进度",
      start,
      end: clampDay(start + span),
      progressRate: row.rate,
      taskCount: Math.round(row.target),
      color: row.color,
      status: row.rate >= 1 ? "完成" : row.rate >= 0.65 ? "推进" : "偏慢",
      source: "auto",
    });
  });
  return normalizeScheduleTasks(rows, { sortByStart: true }).slice(0, 14);
}

function productionScheduleRows() {
  const manualRows = normalizeScheduleTasks(scheduleTasks);
  return (manualRows.length > 0 ? manualRows : automaticProductionScheduleRows()).slice(0, 24);
}

function ensureEditableScheduleTasks() {
  scheduleTasks = normalizeScheduleTasks(scheduleTasks);
  if (scheduleTasks.length === 0) {
    scheduleTasks = automaticProductionScheduleRows().map((row) => ({ ...row, source: "manual" }));
  }
  if (!selectedScheduleTaskId || !scheduleTasks.some((row) => row.id === selectedScheduleTaskId)) {
    selectedScheduleTaskId = scheduleTasks[0]?.id || "";
  }
  return scheduleTasks;
}

function selectedScheduleTask() {
  return productionScheduleRows().find((row) => row.id === selectedScheduleTaskId) || productionScheduleRows()[0] || null;
}

function updateScheduleTask(taskId, patch) {
  ensureEditableScheduleTasks();
  if (!scheduleTasks.some((task) => task.id === taskId)) {
    const autoTask = productionScheduleRows().find((row) => row.id === taskId);
    if (autoTask) {
      scheduleTasks.push({ ...autoTask, source: "manual", order: scheduleTasks.length });
    }
  }
  let updatedTask = null;
  scheduleTasks = scheduleTasks.map((task) => {
    if (task.id !== taskId) return task;
    updatedTask = normalizeScheduleTask({ ...task, ...patch, source: "manual" });
    return updatedTask;
  }).filter(Boolean);
  selectedScheduleTaskId = taskId;
  return updatedTask;
}

function duplicateScheduleTask(taskId) {
  ensureEditableScheduleTasks();
  const source = scheduleTasks.find((task) => task.id === taskId);
  if (!source) return null;
  const span = Math.max(1, (Number(source.end) || Number(source.start) || 1) - (Number(source.start) || 1) + 1);
  const start = clampDay((Number(source.start) || 1) + 1);
  const end = clampDay(Math.max(start, start + span - 1));
  const copy = normalizeScheduleTask({
    ...source,
    id: `schedule-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: `${source.title} 副本`,
    start,
    end,
    source: "manual",
    order: scheduleTasks.length,
  });
  if (!copy) return null;
  scheduleTasks.push(copy);
  selectedScheduleTaskId = copy.id;
  return copy;
}

function addScheduleTaskFromRange(start = project.currentDay || 1, span = 3) {
  ensureEditableScheduleTasks();
  const safeStart = clampDay(start);
  const safeEnd = clampDay(Math.max(safeStart, safeStart + span - 1));
  const task = normalizeScheduleTask({
    id: `schedule-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: "新增阶段",
    owner: "未指派",
    start: safeStart,
    end: safeEnd,
    progressRate: 0,
    taskCount: 1,
    color: activeCategoryColor("production"),
    status: "未开始",
    source: "manual",
    order: scheduleTasks.length,
  });
  if (task) {
    scheduleTasks.push(task);
    selectedScheduleTaskId = task.id;
  }
  return task;
}

function scheduleLaneMetrics(lane) {
  const rect = lane.getBoundingClientRect();
  const styles = getComputedStyle(lane);
  const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
  const width = Math.max(1, rect.width - paddingLeft - paddingRight);
  return {
    left: rect.left + paddingLeft,
    width,
    dayWidth: width / Math.max(1, Number(project.plannedDays) || 1),
  };
}

function scheduleDayFromPointer(event, lane) {
  const metrics = scheduleLaneMetrics(lane);
  const cols = Math.max(1, Number(project.plannedDays) || 1);
  const x = Math.max(0, Math.min(metrics.width, event.clientX - metrics.left));
  return clampDay(Math.floor((x / Math.max(metrics.width, 1)) * cols) + 1);
}

function schedulePointerDeltaDays(event) {
  if (!scheduleDragState) return 0;
  return Math.round((event.clientX - scheduleDragState.clientX) / Math.max(scheduleDragState.dayWidth, 1));
}

function scheduleTaskById(taskId) {
  return scheduleTasks.find((task) => task.id === taskId) || null;
}

function scheduleDragUpdateBar(task, bar) {
  if (!task || !bar?.isConnected) return;
  bar.style.gridColumn = `${task.start} / span ${task.span}`;
  bar.classList.toggle("tight", task.risk === "tight");
  bar.classList.toggle("over", task.risk === "over");
  bar.classList.toggle("ok", task.risk === "ok");
  bar.classList.toggle("compact", task.span <= 2);
  const range = bar.querySelector(".schedule-clip-range");
  const progress = bar.querySelector(".schedule-clip-progress");
  const fill = bar.querySelector("i");
  if (range) range.textContent = `D${task.start}-D${task.end}`;
  if (progress) progress.textContent = task.progressLabel;
  if (fill) fill.style.width = `${Math.round(Math.max(0.06, Math.min(task.progressRate, 1)) * 100)}%`;
}

function scheduleDragUpdateForm(task) {
  const form = document.querySelector("#productionScheduleForm");
  if (!form || !task) return;
  form.elements.id.value = task.id;
  form.elements.start.value = task.start;
  form.elements.end.value = task.end;
  form.elements.progress.value = Math.round(task.progressRate * 100);
  form.elements.status.value = ["未开始", "进行中", "完成", "延期", "暂停"].includes(task.status) ? task.status : "进行中";
}

function scheduleDragPreviewText(task) {
  const status = document.querySelector("#productionScheduleEditorStatus");
  if (status && task) {
    status.textContent = `${task.title} · D${task.start}-${task.end}，松开鼠标保存。`;
  }
}

function resetScheduleForm(task = selectedScheduleTask()) {
  const form = document.querySelector("#productionScheduleForm");
  const status = document.querySelector("#productionScheduleEditorStatus");
  const deleteButton = document.querySelector("#deleteScheduleTask");
  if (!form) return;
  if (!task) {
    form.reset();
    form.elements.id.value = "";
    form.elements.start.value = "1";
    form.elements.end.value = String(Math.max(1, project.plannedDays || 1));
    form.elements.progress.value = "0";
    form.elements.status.value = "进行中";
    if (status) status.textContent = "暂无阶段。新增后可以拖动排期条。";
    if (deleteButton) deleteButton.disabled = true;
    return;
  }
  form.elements.id.value = task.id;
  form.elements.title.value = task.title;
  form.elements.owner.value = task.owner;
  form.elements.start.value = task.start;
  form.elements.end.value = task.end;
  form.elements.progress.value = Math.round(task.progressRate * 100);
  form.elements.status.value = ["未开始", "进行中", "完成", "延期", "暂停"].includes(task.status) ? task.status : "进行中";
  if (status) status.textContent = `${task.title} · D${task.start}-${task.end}，可拖动条块移动，拖左右边缘调整时间。`;
  if (deleteButton) deleteButton.disabled = scheduleTasks.length === 0 && task.source === "auto";
}

function productionDashboardData() {
  const schedule = productionScheduleRows();
  const work = workHourSummary();
  const progressRate = activeProgressStats().rate || 0;
  const taskTotal = schedule.reduce((sum, row) => sum + row.taskCount, 0);
  const delayed = schedule.filter((row) => row.risk === "over").length;
  const tight = schedule.filter((row) => row.risk === "tight").length;
  const lowest = schedule.reduce((worst, row) => (row.progressRate < (worst?.progressRate ?? 2) ? row : worst), null);
  const remainingDays = Math.max(0, (project.plannedDays || 0) - (project.currentDay || 0));
  return {
    schedule,
    work,
    progressRate,
    taskTotal,
    delayed,
    tight,
    lowest,
    remainingDays,
  };
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

function getChartViewState(id) {
  if (!chartViewState.has(id)) {
    chartViewState.set(id, { zoom: 1, fullscreen: false });
  }
  return chartViewState.get(id);
}

function clampChartZoom(value) {
  return Math.max(chartMinZoom, Math.min(chartMaxZoom, Math.round(value * 100) / 100));
}

function redrawChartById(id) {
  const draw = canvasRegistry.get(id);
  if (draw) draw();
}

function updateChartToolbar(id) {
  const state = getChartViewState(id);
  document.querySelectorAll(`[data-chart-zoom-label="${id}"]`).forEach((label) => {
    label.textContent = `${Math.round(state.zoom * 100)}%`;
  });
  document.querySelectorAll(`[data-chart-fullscreen="${id}"]`).forEach((button) => {
    button.setAttribute("aria-pressed", String(state.fullscreen));
    button.title = state.fullscreen ? "退出全屏" : "全屏查看";
    const label = button.querySelector("span");
    if (label) label.textContent = state.fullscreen ? "退出" : "全屏";
  });
}

function applyChartFrameState(id) {
  const state = getChartViewState(id);
  document.querySelectorAll(`[data-chart-frame="${id}"]`).forEach((frame) => {
    frame.classList.toggle("chart-fullscreen-frame", state.fullscreen);
    frame.dataset.chartZoom = String(Math.round(state.zoom * 100));
    if (state.fullscreen) frame.dataset.centered = "false";
  });
  document.body.classList.toggle("chart-fullscreen-active", Array.from(chartViewState.values()).some((item) => item.fullscreen));
  updateChartToolbar(id);
}

function setChartFullscreen(id, fullscreen) {
  const state = getChartViewState(id);
  if (fullscreen) {
    chartViewState.forEach((item, chartId) => {
      if (chartId !== id && item.fullscreen) {
        item.fullscreen = false;
        applyChartFrameState(chartId);
        redrawChartById(chartId);
      }
    });
  }
  state.fullscreen = fullscreen;
  if (fullscreen && id === "fundFlowLargeChart" && state.zoom < 1.15) {
    state.zoom = 1.15;
  }
  if (fullscreen) {
    resetCanvasPan(id);
  }
  applyChartFrameState(id);
  hideChartTooltip(document.querySelector(`#${id}`));
  requestAnimationFrame(() => {
    redrawChartById(id);
    if (fullscreen) centerChartFrame(id);
  });
}

function setChartZoom(id, nextZoom, options = {}) {
  const state = getChartViewState(id);
  const previousZoom = state.zoom || 1;
  const frame = document.querySelector(`[data-chart-frame="${id}"]`);
  state.zoom = clampChartZoom(nextZoom);
  if (options.anchorEvent && frame) {
    const pan = getCanvasPan(id);
    const rect = frame.getBoundingClientRect();
    const anchorX = options.anchorEvent.clientX - rect.left - pan.x;
    const anchorY = options.anchorEvent.clientY - rect.top - pan.y;
    const scale = previousZoom > 0 ? state.zoom / previousZoom : 1;
    pan.x += anchorX - anchorX * scale;
    pan.y += anchorY - anchorY * scale;
  }
  applyChartFrameState(id);
  applyCanvasPan(id);
  hideChartTooltip(document.querySelector(`#${id}`));
  requestAnimationFrame(() => {
    redrawChartById(id);
  });
}

function centerChartFrame(id, options = {}) {
  const frame = document.querySelector(`[data-chart-frame="${id}"]`);
  const canvas = document.querySelector(`#${id}`);
  if (!frame || !canvas || (!options.force && frame.dataset.centered === "true")) return;
  requestAnimationFrame(() => {
    frame.scrollLeft = Math.max(0, (canvas.offsetWidth - frame.clientWidth) / 2);
    frame.scrollTop = Math.max(0, (canvas.offsetHeight - frame.clientHeight) / 2);
    frame.dataset.centered = "true";
  });
}

function fitChartToFrame(id) {
  const frame = document.querySelector(`[data-chart-frame="${id}"]`);
  const canvas = document.querySelector(`#${id}`);
  if (!frame || !canvas) return;
  const state = getChartViewState(id);
  resetCanvasPan(id);
  requestAnimationFrame(() => {
    const currentZoom = state.zoom || 1;
    const widthWithoutZoom = canvas.offsetWidth / currentZoom;
    const heightWithoutZoom = canvas.offsetHeight / currentZoom;
    const availableW = Math.max(260, frame.clientWidth - 44);
    const availableH = Math.max(220, frame.clientHeight - (state.fullscreen ? 86 : 74));
    const fitZoom = Math.min(chartMaxZoom, Math.max(chartMinZoom, Math.min(availableW / widthWithoutZoom, availableH / heightWithoutZoom)));
    state.zoom = clampChartZoom(fitZoom);
    applyChartFrameState(id);
    redrawChartById(id);
    requestAnimationFrame(() => centerChartFrame(id, { force: true }));
  });
}

function getCanvasPan(id) {
  if (!canvasPanState.has(id)) {
    canvasPanState.set(id, { x: 0, y: 0 });
  }
  return canvasPanState.get(id);
}

function applyCanvasPan(id) {
  const canvas = document.querySelector(`#${id}`);
  if (!canvas) return;
  const pan = getCanvasPan(id);
  canvas.style.transform = `translate(${Math.round(pan.x)}px, ${Math.round(pan.y)}px)`;
}

function resetCanvasPan(id) {
  const pan = getCanvasPan(id);
  pan.x = 0;
  pan.y = 0;
  applyCanvasPan(id);
}

function chartControlButton({ action, id, label = "", title, svg }) {
  const attr =
    action === "zoom-out"
      ? "data-chart-zoom-out"
      : action === "zoom-in"
        ? "data-chart-zoom-in"
        : action === "reset"
          ? "data-chart-zoom-reset"
          : action === "fit"
            ? "data-chart-fit"
            : "data-chart-fullscreen";
  const pressed = action === "fullscreen" ? ' aria-pressed="false"' : "";
  const text = label ? `<span>${label}</span>` : "";
  return `
    <button class="chart-tool-button" type="button" ${attr}="${id}" aria-label="${title}" title="${title}"${pressed}>
      ${svg}
      ${text}
    </button>
  `;
}

function chartToolbarMarkup(id) {
  return `
    <div class="chart-view-toolbar" role="toolbar" aria-label="图表视图控制">
      ${chartControlButton({
        action: "zoom-out",
        id,
        title: "缩小图表",
        svg: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14" /></svg>',
      })}
      <span class="chart-zoom-readout" data-chart-zoom-label="${id}">100%</span>
      ${chartControlButton({
        action: "zoom-in",
        id,
        title: "放大图表",
        svg: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14" /><path d="M5 12h14" /></svg>',
      })}
      ${chartControlButton({
        action: "fit",
        id,
        title: "适配视图",
        svg: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M21 16v3a2 2 0 0 1-2 2h-3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M8 12h8" /></svg>',
      })}
      ${chartControlButton({
        action: "reset",
        id,
        title: "重置为 100%",
        svg: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 4v6h6" /><path d="M20 20v-6h-6" /><path d="M20 9A8 8 0 0 0 6.3 5.7L4 8" /><path d="M4 15a8 8 0 0 0 13.7 3.3L20 16" /></svg>',
      })}
      ${chartControlButton({
        action: "fullscreen",
        id,
        label: "全屏",
        title: "全屏查看",
        svg: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 3H3v5" /><path d="M16 3h5v5" /><path d="M21 16v5h-5" /><path d="M3 16v5h5" /></svg>',
      })}
    </div>
  `;
}

function panelControlIcon(kind) {
  if (kind === "fullscreen") {
    return '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 3H3v5" /><path d="M16 3h5v5" /><path d="M21 16v5h-5" /><path d="M3 16v5h5" /></svg>';
  }
  if (kind === "collapse") {
    return '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>';
  }
  return "";
}

function updatePanelControlLabels() {
  document.querySelectorAll("[data-panel-action='fullscreen']").forEach((button) => {
    const panel = button.closest(".panel");
    const active = panel?.classList.contains("panel-fullscreen");
    const label = active ? localizedText("退出全屏", "Exit Fullscreen") : localizedText("全屏", "Fullscreen");
    button.title = label;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(Boolean(active)));
  });
  document.querySelectorAll("[data-panel-action='collapse']").forEach((button) => {
    const panel = button.closest(".panel");
    const active = panel?.classList.contains("panel-collapsed");
    const label = active ? localizedText("展开面板", "Expand Panel") : localizedText("折叠面板", "Collapse Panel");
    button.title = label;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(Boolean(active)));
  });
}

function redrawChartsInsidePanel(panel) {
  if (!panel) return;
  panel.querySelectorAll("canvas[id]").forEach((canvas) => redrawChartById(canvas.id));
}

function setupPanelControls() {
  document.querySelectorAll(".panel").forEach((panel, index) => {
    const heading = Array.from(panel.children).find((child) => child.classList?.contains("panel-heading"));
    if (!heading || heading.querySelector(".panel-controls")) return;
    if (!panel.id) panel.dataset.panelId = panel.dataset.panelId || `panel-${index + 1}`;
    heading.insertAdjacentHTML(
      "beforeend",
      `
        <div class="panel-controls" aria-label="${escapeHtml(localizedText("面板控制", "Panel Controls"))}">
          <button class="panel-control-button" type="button" data-panel-action="fullscreen">
            ${panelControlIcon("fullscreen")}
          </button>
          <button class="panel-control-button" type="button" data-panel-action="collapse">
            ${panelControlIcon("collapse")}
          </button>
        </div>
      `,
    );
  });
  updatePanelControlLabels();
  if (setupPanelControls.bound) return;
  setupPanelControls.bound = true;
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-panel-action]");
    if (!button) return;
    const panel = button.closest(".panel");
    if (!panel) return;
    const action = button.dataset.panelAction;
    if (action === "fullscreen") {
      document.querySelectorAll(".panel.panel-fullscreen").forEach((item) => {
        if (item !== panel) item.classList.remove("panel-fullscreen");
      });
      panel.classList.toggle("panel-fullscreen");
      document.body.classList.toggle("panel-fullscreen-active", Boolean(document.querySelector(".panel.panel-fullscreen")));
      updatePanelControlLabels();
      window.setTimeout(() => redrawChartsInsidePanel(panel), 80);
    }
    if (action === "collapse") {
      panel.classList.toggle("panel-collapsed");
      updatePanelControlLabels();
      if (!panel.classList.contains("panel-collapsed")) window.setTimeout(() => redrawChartsInsidePanel(panel), 80);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const fullscreenPanel = document.querySelector(".panel.panel-fullscreen");
    if (!fullscreenPanel) return;
    fullscreenPanel.classList.remove("panel-fullscreen");
    document.body.classList.remove("panel-fullscreen-active");
    updatePanelControlLabels();
    redrawChartsInsidePanel(fullscreenPanel);
  });
}

function resizeCanvas(canvas) {
  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();
  const isCompactViewport = window.innerWidth <= 720;
  const viewState = getChartViewState(canvas.id);
  const minWidthSetting = chartMinWidths[canvas.id] || 260;
  const minWidth = typeof minWidthSetting === "object" ? (isCompactViewport ? minWidthSetting.compact : minWidthSetting.desktop) : minWidthSetting;
  const framePadding = parent.classList.contains("chart-fullscreen-frame") ? 34 : 36;
  const zoom = viewState.zoom || 1;
  const baseWidth = Math.max(minWidth, Math.floor(rect.width - framePadding));
  const fullscreenMultiplier = viewState.fullscreen && canvas.id === "fundFlowLargeChart" ? 1.68 : viewState.fullscreen ? 1.22 : 1;
  const targetWidth = Math.max(minWidth, Math.floor(baseWidth * zoom * fullscreenMultiplier));
  const ratio = window.devicePixelRatio || 1;
  const baseHeight = isCompactViewport && chartMobileHeights[canvas.id] ? chartMobileHeights[canvas.id] : chartHeights[canvas.id] || 260;
  const fullscreenHeight = viewState.fullscreen
    ? canvas.id === "fundFlowLargeChart"
      ? Math.max(baseHeight, window.innerHeight * 1.35)
      : Math.max(baseHeight, window.innerHeight - 188)
    : baseHeight;
  const cssHeight = Math.round(fullscreenHeight * zoom);
  canvas.style.width = `${targetWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(targetWidth * ratio);
  canvas.height = Math.round(cssHeight * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  applyCanvasPan(canvas.id);
  return { ctx, width: targetWidth, height: cssHeight };
}

function registerChart(id, draw) {
  getChartViewState(id);
  canvasRegistry.set(id, draw);
  draw();
  updateChartToolbar(id);
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

function setupChartViewControls() {
  document.querySelectorAll("[data-chart-frame]").forEach((frame) => {
    const id = frame.dataset.chartFrame;
    if (!id || !zoomableChartIds.has(id)) return;
    getChartViewState(id);
    if (!frame.querySelector(".chart-view-toolbar")) {
      frame.insertAdjacentHTML("afterbegin", chartToolbarMarkup(id));
    }
    if (!frame.querySelector(".chart-pan-hint")) {
      frame.insertAdjacentHTML("beforeend", '<div class="chart-pan-hint" aria-hidden="true">拖动画布移动图表，滚轮缩放</div>');
    }
    applyChartFrameState(id);
  });

  document.addEventListener("click", (event) => {
    const zoomOut = event.target.closest("[data-chart-zoom-out]");
    const zoomIn = event.target.closest("[data-chart-zoom-in]");
    const zoomReset = event.target.closest("[data-chart-zoom-reset]");
    const zoomFit = event.target.closest("[data-chart-fit]");
    const fullscreen = event.target.closest("[data-chart-fullscreen]");
    const button = zoomOut || zoomIn || zoomReset || zoomFit || fullscreen;
    if (!button) return;
    const id = button.dataset.chartZoomOut || button.dataset.chartZoomIn || button.dataset.chartZoomReset || button.dataset.chartFit || button.dataset.chartFullscreen;
    if (!id || !zoomableChartIds.has(id)) return;
    const state = getChartViewState(id);
    if (zoomOut) setChartZoom(id, state.zoom - chartZoomStep);
    if (zoomIn) setChartZoom(id, state.zoom + chartZoomStep);
    if (zoomFit) fitChartToFrame(id);
    if (zoomReset) {
      resetCanvasPan(id);
      setChartZoom(id, 1);
    }
    if (fullscreen) setChartFullscreen(id, !state.fullscreen);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    chartViewState.forEach((state, id) => {
      if (!state.fullscreen) return;
      setChartFullscreen(id, false);
    });
  });

  document.querySelectorAll("[data-chart-frame]").forEach((frame) => {
    const id = frame.dataset.chartFrame;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;
    frame.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".chart-view-toolbar")) return;
      if (event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      const pan = getCanvasPan(id);
      startPanX = pan.x;
      startPanY = pan.y;
      frame.classList.add("is-panning");
      event.preventDefault();
      frame.setPointerCapture(pointerId);
    });
    frame.addEventListener("pointermove", (event) => {
      if (pointerId !== event.pointerId) return;
      const pan = getCanvasPan(id);
      pan.x = startPanX + event.clientX - startX;
      pan.y = startPanY + event.clientY - startY;
      applyCanvasPan(id);
    });
    const endPan = (event) => {
      if (pointerId !== event.pointerId) return;
      frame.classList.remove("is-panning");
      frame.releasePointerCapture(pointerId);
      pointerId = null;
    };
    frame.addEventListener("pointerup", endPan);
    frame.addEventListener("pointercancel", endPan);
    frame.addEventListener(
      "wheel",
      (event) => {
        if (!zoomableChartIds.has(id)) return;
        event.preventDefault();
        const state = getChartViewState(id);
        const zoomDelta = event.deltaY < 0 ? chartZoomStep : -chartZoomStep;
        setChartZoom(id, state.zoom + zoomDelta, { anchorEvent: event });
      },
      { passive: false },
    );
  });
}

function clearChart(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  if (ctx.canvas?.parentElement?.classList.contains("chart-fullscreen-frame")) {
    ctx.canvas.style.background = "transparent";
    return;
  }
  ctx.canvas.style.background = "";
  ctx.fillStyle = semanticColor("surface");
  ctx.fillRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, displaySettings.darkMode ? "rgba(122, 167, 255, 0.08)" : "rgba(21, 122, 110, 0.06)");
  gradient.addColorStop(0.55, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(1, displaySettings.darkMode ? "rgba(53, 194, 173, 0.08)" : "rgba(40, 103, 178, 0.05)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = alphaColor("grid", 0.58);
  ctx.lineWidth = 1;
  const gridSize = 32;
  for (let x = 0.5; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0.5; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawText(ctx, text, x, y, options = {}) {
  ctx.fillStyle = options.color || semanticColor("ink");
  ctx.font = `${options.weight || 600} ${options.size || 13}px Inter, PingFang SC, sans-serif`;
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = options.baseline || "alphabetic";
  ctx.fillText(text, x, y);
}

function fitCanvasText(ctx, text, maxWidth) {
  const value = String(text || "");
  if (ctx.measureText(value).width <= maxWidth) return value;
  let low = 0;
  let high = value.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (ctx.measureText(`${value.slice(0, mid)}...`).width <= maxWidth) low = mid;
    else high = mid - 1;
  }
  return `${value.slice(0, Math.max(1, low))}...`;
}

function drawChartPanelTitle(ctx, title, subtitle, x = 18, y = 20) {
  drawText(ctx, title, x, y, { size: 12, weight: 900, color: semanticColor("ink") });
  if (subtitle) drawText(ctx, subtitle, x, y + 18, { size: 11, weight: 700, color: semanticColor("muted") });
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

  ctx.fillStyle = alphaColor("teal", 0.08);
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 25, 0, Math.PI * 2);
  ctx.fill();

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

  const padding = { top: 48, right: 18, bottom: 38, left: 58 };
  drawChartPanelTitle(ctx, "每日成本", "按通告单成本走势");
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

  const areaGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + plotH);
  areaGradient.addColorStop(0, alphaColor("teal", 0.2));
  areaGradient.addColorStop(1, alphaColor("teal", 0));
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.lineTo(points[points.length - 1].x, padding.top + plotH);
  ctx.lineTo(points[0].x, padding.top + plotH);
  ctx.closePath();
  ctx.fillStyle = areaGradient;
  ctx.fill();

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
  const top = 50;
  const barH = 18;
  const gap = 18;
  const usableW = width - left - 28;
  drawChartPanelTitle(ctx, `${budgetUnitLabel()}花费`, "按已用金额排序", 8, 16);

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
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    roundRect(ctx, left, y, barW, Math.max(5, barH * 0.38), 8);
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
      const role = personRoleDisplay(person);
      const vendor = person.vendor || "个人 / 自由职业";
      const label = `${person.name || "未命名"} · ${role}`;
      addFlowDetail(detailMap, `labor:${person.id || `${departmentId}:${person.name}:${role}`}`, label, value, activeCategoryColor("labor"), "人员", `${vendor} · ${activeDays}/${person.days} 天`);
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
      const category = detail.category || productionDetailCategoryKey(detail);
      const label = productionDetailDisplayLabel(detail);
      const key = `production:${category}:${label}`;
      const color = activeCategoryColor(category);
      addFlowDetail(detailMap, key, label, detail.value * factor, color, detail.type || "生产", `${sheet.title}${detail.meta && detail.meta !== sheet.title ? ` · ${detail.meta}` : ""}`);
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
    const role = personRoleDisplay(person);
    const vendor = person.vendor || "个人 / 自由职业";
    const label = `${person.name || "未命名"} · ${role}`;
    addFlowDetail(unclassifiedDetails, `labor:${person.id || `unclassified:${person.name}:${role}`}`, label, value, activeCategoryColor("labor"), "人员", `${vendor} · ${activeDays}/${person.days} 天`);
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
        const category = detail.category || productionDetailCategoryKey(detail);
        const label = productionDetailDisplayLabel(detail);
        const key = `production:${category}:${label}`;
        const color = activeCategoryColor(category);
        addFlowDetail(unclassifiedDetails, key, label, detail.value, color, detail.type || "生产", `${sheet.title}${detail.meta && detail.meta !== sheet.title ? ` · ${detail.meta}` : ""}`);
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
  const canShowValue = Boolean(node.valueText) && node.h >= 36;
  const labelSize = options.labelSize || 12;
  const valueSize = options.valueSize || 11;
  ctx.font = `${options.weight || 900} ${labelSize}px Inter, PingFang SC, sans-serif`;
  const label = fitCanvasText(ctx, node.label, node.w - 20);
  drawText(ctx, label, node.x + 10, canShowValue ? node.y + 20 : node.y + node.h / 2 + 4, {
    color: "#fff",
    size: labelSize,
    weight: 900,
  });
  if (canShowValue) {
    ctx.font = `800 ${valueSize}px Inter, PingFang SC, sans-serif`;
    const valueText = fitCanvasText(ctx, node.valueText, node.w - 20);
    drawText(ctx, valueText, node.x + 10, node.y + Math.min(node.h - 8, 40), {
      color: "#fff",
      size: valueSize,
      weight: 800,
    });
  }
}

function flowNodeHeights(rows, key, usableH, gap, minH = 18) {
  const values = rows.map((row) => Math.max(0, Number(row[key]) || 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  if (rows.length === 0) return [];
  const availableH = usableH - gap * (rows.length - 1);
  if (availableH < minH * rows.length) {
    return rows.map(() => Math.max(8, availableH / rows.length));
  }
  if (total <= 0) return rows.map(() => Math.max(minH, availableH / rows.length));
  return values.map((value) => Math.max(minH, (value / total) * availableH));
}

function positionedFlowNodes(rows, key, x, w, top, usableH, gap, colorGetter, minH = 18) {
  const heights = flowNodeHeights(rows, key, usableH, gap, minH);
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

function aggregateDetails(details, limit = 10, otherLabel = "其他明细", options = {}) {
  const positive = details.filter((detail) => (Number(detail.value) || 0) > 0).sort((a, b) => b.value - a.value);
  if (positive.length <= limit) return positive;
  const pinnedKeys = Array.isArray(options.pinKeys) ? options.pinKeys : [];
  const pinned = [];
  const pinnedDetailKeys = new Set();
  pinnedKeys.forEach((key) => {
    const match = positive.find((detail) => classifyFundDetail(detail).key === key && !pinnedDetailKeys.has(detail.key));
    if (!match) return;
    pinned.push(match);
    pinnedDetailKeys.add(match.key);
  });
  const remaining = positive.filter((detail) => !pinnedDetailKeys.has(detail.key));
  const visibleLimit = Math.max(1, limit - 1);
  const visible = [...pinned, ...remaining.slice(0, Math.max(0, visibleLimit - pinned.length))]
    .filter((detail, index, rows) => rows.findIndex((item) => item.key === detail.key) === index)
    .sort((a, b) => b.value - a.value);
  const hidden = remaining.slice(Math.max(0, visibleLimit - pinned.length));
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
  const category = detail.category || productionDetailCategoryKey(detail);
  if (["meals", "vehicles", "rooms", "locationFee", "misc"].includes(category)) {
    return { key: category, label: productionDetailTypeLabel(category), color: activeCategoryColor(category) };
  }
  return { key: "production", label: isCustomInputMode() ? "外部费用" : "生产", color: activeCategoryColor("production") };
}

function rowUsageDetails(row) {
  const details = Array.isArray(row.details) ? row.details : [];
  if (details.length > 0) return details;
  return [
    { key: `${row.department?.id || "row"}:labor`, label: "人员", value: row.breakdown?.labor || 0, color: activeCategoryColor("labor"), type: "人员" },
    { key: `${row.department?.id || "row"}:equipment`, label: "器材", value: row.breakdown?.equipment || 0, color: activeCategoryColor("equipment"), type: "器材" },
    { key: `${row.department?.id || "row"}:production`, label: isCustomInputMode() ? "外部费用" : "生产", value: row.breakdown?.production || 0, color: activeCategoryColor("production"), type: "生产", category: "production" },
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

function fundFlowReadableData(limit = 8) {
  const data = fundFlowData();
  const usageRows = data.usageRows.length > 0 ? data.usageRows : data.budgetRows;
  const allUsageDetails = usageRows.flatMap((row) => rowUsageDetails(row));
  const usedTotal = Math.max(data.usageTotal, usageRows.reduce((sum, row) => sum + (Number(row.used) || 0), 0));
  const sourceTotal = Math.max(data.sourceTotal || 0, project.budget || 0, data.allocatedTotal, usedTotal);
  const budgetLabel = budgetBudgetLabel();
  const unitLabel = budgetUnitLabel();
  const unclassifiedUsed = data.usageRows.filter((row) => row.unclassified).reduce((sum, row) => sum + row.used, 0);
  const unallocated = Math.max(0, sourceTotal - data.allocatedTotal - unclassifiedUsed);
  const overAllocated = Math.max(0, data.allocatedTotal - Math.max(project.budget || 0, usedTotal));
  const statusLabel = unclassifiedUsed > 0 ? "有未归类开销" : overAllocated > 0 ? "预算超分配" : unallocated > 0 ? "仍有未分配" : "预算平衡";
  const statusValue = unclassifiedUsed > 0 ? unclassifiedUsed : overAllocated > 0 ? overAllocated : unallocated;
  const departmentRows = usageRows
    .map((row, index) => {
      const budget = Number(row.budget) || 0;
      const used = Number(row.used) || 0;
      return {
        ...row,
        color: row.color || activeDepartmentColor(row.department, index),
        rate: budget > 0 ? used / budget : usedTotal > 0 ? used / usedTotal : 0,
        share: usedTotal > 0 ? used / usedTotal : 0,
      };
    })
    .sort((a, b) => Math.max(b.used, b.budget) - Math.max(a.used, a.budget))
    .slice(0, limit);
  const usageBreakdown = [
    { key: "labor", label: "人员", value: usageRows.reduce((sum, row) => sum + (row.breakdown?.labor || 0), 0), color: activeCategoryColor("labor") },
    { key: "equipment", label: "器材", value: usageRows.reduce((sum, row) => sum + (row.breakdown?.equipment || 0), 0), color: activeCategoryColor("equipment") },
    ...productionDetailKeys.map((key) => ({
      key,
      label: productionDetailTypeLabel(key),
      value: allUsageDetails.filter((detail) => classifyFundDetail(detail).key === key).reduce((sum, detail) => sum + (Number(detail.value) || 0), 0),
      color: activeCategoryColor(key),
    })),
  ]
    .filter((row) => row.value > 0)
    .map((row) => ({ ...row, share: usedTotal > 0 ? row.value / usedTotal : 0 }))
    .sort((a, b) => b.value - a.value);
  const detailRows = fundFlowDetailRows(limit + 4);
  const supplierCount = new Set(fundFlowDetailRows(240).map((row) => row.label)).size;
  const cards = [
    { label: "总预算口径", value: money.format(project.budget || sourceTotal || 0), meta: project.title || "当前项目" },
    { label: `${budgetLabel}合计`, value: money.format(data.allocatedTotal), meta: `${data.budgetRows.length} 个${unitLabel}` },
    { label: "实际已用", value: money.format(usedTotal), meta: sourceTotal > 0 ? `消耗 ${percentText(usedTotal / sourceTotal)}` : "等待开销" },
    { label: statusLabel, value: statusValue > 0 ? money.format(statusValue) : "平衡", meta: supplierCount > 0 ? `${supplierCount} 个公司 / 个人 / 明细` : "暂无去向明细" },
  ];
  return { ...data, sourceTotal, usedTotal, unallocated, overAllocated, unclassifiedUsed, statusLabel, cards, departmentRows, usageBreakdown, detailRows, supplierCount, budgetLabel, unitLabel };
}

function fundFlowBarRow({ label, value, subLabel = "", share = 0, color = semanticColor("teal"), meta = "" }) {
  const width = Math.max(2, Math.min(100, share * 100));
  return `
    <div class="fund-flow-bar-row">
      <div class="fund-flow-row-head">
        <strong>${escapeHtml(label)}</strong>
        <span>${money.format(value)}</span>
      </div>
      <div class="fund-flow-row-meta">
        <span>${escapeHtml(subLabel)}</span>
        <b>${escapeHtml(meta || percentText(share))}</b>
      </div>
      <div class="fund-flow-track" aria-hidden="true">
        <i style="width:${width}%; background:${color}"></i>
      </div>
    </div>
  `;
}

function renderFundFlowReadablePanel(selector, options = {}) {
  const container = document.querySelector(selector);
  if (!container) return;
  const large = Boolean(options.large);
  const limit = options.limit || (large ? 12 : 7);
  const data = fundFlowReadableData(limit);
  const hasData = data.budgetRows.length > 0 || data.usageRows.length > 0;
  if (!hasData || data.sourceTotal <= 0) {
    container.innerHTML = `
      <div class="fund-flow-readable-empty">
        <strong>暂无资金流向数据</strong>
        <span>录入总预算、${escapeHtml(data.budgetLabel)}、人员、器材或通告单后，这里会显示可读版资金流向。</span>
      </div>
    `;
    return;
  }

  const departmentList =
    data.departmentRows.length > 0
      ? data.departmentRows
          .map((row) =>
            fundFlowBarRow({
              label: row.department?.name || "未归类",
              value: row.used || row.budget,
              subLabel: `${data.budgetLabel} ${money.format(row.budget)} · 已用 ${percentText(row.rate)}`,
              share: Math.max(row.share, row.budget > 0 && data.allocatedTotal > 0 ? row.budget / data.allocatedTotal : 0),
              color: row.color,
              meta: `占已用 ${percentText(row.share)}`,
            }),
          )
          .join("")
      : `<div class="fund-flow-readable-empty small">暂无${escapeHtml(data.unitLabel)}开销</div>`;
  const usageList =
    data.usageBreakdown.length > 0
      ? data.usageBreakdown
          .map((row) =>
            fundFlowBarRow({
              label: row.label,
              value: row.value,
              subLabel: "按实际已用统计",
              share: row.share,
              color: row.color,
              meta: percentText(row.share),
            }),
          )
          .join("")
      : `<div class="fund-flow-readable-empty small">暂无用途分类</div>`;
  const detailList =
    data.detailRows.length > 0
      ? data.detailRows
          .map(
            (row, index) => `
              <div class="fund-flow-detail-card">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>${escapeHtml(row.label)}</strong>
                  <small>${escapeHtml(row.department)} · ${escapeHtml(row.type)}${row.meta ? ` · ${escapeHtml(row.meta)}` : ""}</small>
                </div>
                <b>${money.format(row.value)}</b>
              </div>
            `,
          )
          .join("")
      : `<div class="fund-flow-readable-empty small">暂无公司 / 个人 / 明细</div>`;

  container.innerHTML = `
    <div class="fund-flow-kpis">
      ${data.cards
        .map(
          (card) => `
            <div class="fund-flow-kpi">
              <span>${escapeHtml(card.label)}</span>
              <strong>${escapeHtml(card.value)}</strong>
              <small>${escapeHtml(card.meta)}</small>
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="fund-flow-readable-grid">
      <section class="fund-flow-readable-card">
        <div class="fund-flow-card-head">
          <strong>${escapeHtml(data.unitLabel)}预算与已用</strong>
          <span>${data.departmentRows.length} 项</span>
        </div>
        <div class="fund-flow-bar-list">${departmentList}</div>
      </section>
      <section class="fund-flow-readable-card">
        <div class="fund-flow-card-head">
          <strong>用途构成</strong>
          <span>人员 / 器材 / 餐食 / 车辆 / 住宿</span>
        </div>
        <div class="fund-flow-bar-list">${usageList}</div>
      </section>
      <section class="fund-flow-readable-card fund-flow-readable-card-wide">
        <div class="fund-flow-card-head">
          <strong>公司 / 个人 / 明细去向</strong>
          <span>Top ${Math.min(data.detailRows.length, limit + 4)}</span>
        </div>
        <div class="fund-flow-detail-cards">${detailList}</div>
      </section>
    </div>
  `;
}

function renderFundFlowReadablePanels() {
  renderFundFlowReadablePanel("#fundFlowReadable", { limit: 6 });
  renderFundFlowReadablePanel("#fundFlowLargeReadable", { large: true, limit: 12 });
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
    { id: "vfx_progress", label: "VFX 交付偏差", detail: "VFX 供应商付款或已用比例明显快于交付进度时，需要复核镜头清单、版本验收和付款节点。", severity: "high" },
    { id: "callsheet_jump", label: "通告突增", detail: "单日通告总成本明显高于平均值，重点检查夜戏、转场和住宿。", severity: "medium" },
  ];
  return isRatingEnabled() ? rules : rules.filter((rule) => !["rate_mismatch", "trust_low"].includes(rule.id));
}

function isVfxRelatedItem(item = {}) {
  const text = [item.dept, item.name, item.role, item.vendor, item.label, item.status].filter(Boolean).join(" ");
  return item.dept === "vfx_color" || /vfx|visual effects|特效|视觉|合成|调色|预视觉/i.test(text);
}

function isVfxProgressRow(row = {}) {
  const text = [row.name, row.label, row.status].filter(Boolean).join(" ");
  return /vfx|visual effects|特效|视觉|合成|调色|预视觉|镜头|版本/i.test(text);
}

function currentPersonCost(person) {
  const activeDays = Math.min(Number(person.days) || 0, Number(project.currentDay) || 0);
  return (Number(person.dayRate) || 0) * activeDays + ((Number(person.allowance) || 0) * activeDays) / Math.max(Number(person.days) || 1, 1);
}

function currentEquipmentCost(item) {
  const activeDays = Math.min(Number(item.days) || 0, Number(project.currentDay) || 0);
  return (Number(item.daily) || 0) * activeDays + (Number(item.deposit) || 0);
}

function averageNumbers(values, fallback = 0) {
  const usable = values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  if (usable.length === 0) return fallback;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function riskFromVfxAuditRow(row) {
  if (!row) return "medium";
  if (row.progressMissing || row.gap > 0.22 || row.trust < 65) return "high";
  if (row.gap > 0.12 || row.progressRate < 0.5 || row.trust < 75) return "medium";
  return "ok";
}

function vfxRiskText(row) {
  if (row.progressMissing) return "缺进度";
  if (row.gap > 0.22) return "付款快于交付";
  if (row.trust < 65) return "低信任";
  if (row.gap > 0.12) return "进度偏慢";
  if (row.progressRate < 0.5) return "待追踪";
  return "稳定";
}

function vfxActionText(row) {
  if (row.progressMissing) return "补 VFX 镜头表、版本验收单和付款节点";
  if (row.gap > 0.22) return "暂停下一笔付款，先验收交付版本";
  if (row.trust < 65) return "补历史合作记录与替代报价";
  if (row.gap > 0.12) return "要求供应商更新每周交付里程碑";
  return "按节点留存镜头清单和验收记录";
}

function vfxSupplierAuditRows() {
  const vendorMap = new Map();
  const progressRows = customProgressRows().filter(isVfxProgressRow);
  const fallbackProgress = Math.min(Math.max((Number(project.currentDay) || 0) / Math.max(Number(project.plannedDays) || 1, 1), 0), 1);
  const overallProgress = progressRows.length > 0 ? averageNumbers(progressRows.map((row) => row.rate), fallbackProgress) : fallbackProgress;
  const progressMissing = progressRows.length === 0;

  const ensureVendor = (vendorName) => {
    const vendor = String(vendorName || "未登记 VFX 供应商").trim() || "未登记 VFX 供应商";
    if (!vendorMap.has(vendor)) {
      vendorMap.set(vendor, {
        vendor,
        departments: new Set(),
        people: [],
        equipment: [],
        contractAmount: 0,
        usedAmount: 0,
        trustValues: [],
        grades: new Set(),
        companyGrades: new Set(),
      });
    }
    return vendorMap.get(vendor);
  };

  people.filter(isVfxRelatedItem).forEach((person) => {
    const row = ensureVendor(person.vendor || "个人 / 自由职业");
    row.people.push(person);
    row.departments.add(getDept(person.dept).name);
    row.contractAmount += personTotal(person);
    row.usedAmount += currentPersonCost(person);
    row.trustValues.push(normalizeTrust(person.trust));
    row.grades.add(gradeLabel(person.grade));
    row.companyGrades.add(gradeLabel(person.companyGrade, "公司"));
  });

  equipment.filter(isVfxRelatedItem).forEach((item) => {
    const row = ensureVendor(item.vendor || "未登记公司");
    row.equipment.push(item);
    row.departments.add(getDept(item.dept).name);
    row.contractAmount += equipmentTotal(item);
    row.usedAmount += currentEquipmentCost(item);
    row.trustValues.push(normalizeTrust(item.trust));
    row.companyGrades.add(gradeLabel(item.companyGrade, "公司"));
  });

  return Array.from(vendorMap.values())
    .map((row) => {
      const paymentRate = row.contractAmount > 0 ? Math.min(row.usedAmount / row.contractAmount, 1) : 0;
      const vendorProgressRows = progressRows.filter((progressRow) => {
        const text = `${progressRow.name} ${progressRow.label}`.toLowerCase();
        return text.includes(row.vendor.toLowerCase()) || isVfxProgressRow(progressRow);
      });
      const progressRate = vendorProgressRows.length > 0 ? averageNumbers(vendorProgressRows.map((progressRow) => progressRow.rate), overallProgress) : overallProgress;
      const trust = Math.round(averageNumbers(row.trustValues, 75));
      const gap = paymentRate - progressRate;
      const normalized = {
        ...row,
        departments: Array.from(row.departments),
        grades: Array.from(row.grades).filter(Boolean),
        companyGrades: Array.from(row.companyGrades).filter(Boolean),
        paymentRate,
        progressRate,
        progressMissing,
        progressRows: vendorProgressRows,
        trust,
        gap,
      };
      normalized.risk = riskFromVfxAuditRow(normalized);
      normalized.status = vfxRiskText(normalized);
      normalized.action = vfxActionText(normalized);
      return normalized;
    })
    .sort((a, b) => {
      const riskWeight = { high: 3, medium: 2, ok: 1 };
      return (riskWeight[b.risk] || 0) - (riskWeight[a.risk] || 0) || b.contractAmount - a.contractAmount;
    });
}

const vfxReviewStatusLabels = {
  submitted: { label: "已提交", className: "tight" },
  notes: { label: "有批注", className: "tight" },
  approved: { label: "已通过", className: "ok" },
  blocked: { label: "阻塞", className: "over" },
};

const vfxPaymentGateLabels = {
  hold: "暂缓付款",
  deposit: "可付定金",
  milestone: "可付阶段款",
  final: "可结尾款",
};

function vfxReviewRisk(row) {
  if (!row) return "medium";
  if (row.status === "blocked") return "high";
  if (row.paymentGate === "final" && row.approvalRate < 1) return "high";
  if (row.paymentGate === "milestone" && row.approvalRate < 0.5) return "high";
  if (row.status === "notes" && row.approvalRate < 0.5) return "high";
  if (row.status === "notes" || row.status === "submitted") return "medium";
  if (row.approvalRate < 0.85) return "medium";
  return "ok";
}

function vfxReviewActionText(row) {
  if (row.status === "blocked") return "暂停付款，拉齐制片、导演、VFX 监制做一次阻塞复盘。";
  if (row.paymentGate === "final" && row.approvalRate < 1) return "尾款前必须补齐版本验收单和全量通过记录。";
  if (row.paymentGate === "milestone" && row.approvalRate < 0.5) return "阶段款前先拿到下一版交付和明确批注关闭项。";
  if (row.status === "notes") return "把批注拆成可关闭清单，要求供应商给下一版日期。";
  if (row.status === "submitted") return "安排审片窗口，审阅人完成批注后再进入付款判断。";
  return "归档验收记录，可按节点推进付款。";
}

function vfxReviewRows() {
  vfxReviewVersions = normalizeVfxReviewVersions(vfxReviewVersions);
  const supplierRows = vfxSupplierAuditRows();
  const supplierMap = new Map(supplierRows.map((row) => [row.vendor, row]));
  const totalSupplierAmount = supplierRows.reduce((sum, row) => sum + row.contractAmount, 0);
  const vendorShotTotals = vfxReviewVersions.reduce((map, item) => {
    map.set(item.vendor, (map.get(item.vendor) || 0) + (Number(item.shotCount) || 1));
    return map;
  }, new Map());
  const totalVersionShots = vfxReviewVersions.reduce((sum, item) => sum + (Number(item.shotCount) || 1), 0);

  return vfxReviewVersions
    .map((item) => {
      const supplier = supplierMap.get(item.vendor);
      const approvalRate = (Number(item.approvedCount) || 0) / Math.max(Number(item.shotCount) || 1, 1);
      const amount = supplier
        ? Math.round((supplier.contractAmount * (Number(item.shotCount) || 1)) / Math.max(vendorShotTotals.get(item.vendor) || 1, 1))
        : totalSupplierAmount > 0
          ? Math.round((totalSupplierAmount * (Number(item.shotCount) || 1)) / Math.max(totalVersionShots, 1))
          : 0;
      const row = {
        ...item,
        approvalRate,
        amount,
        supplier,
      };
      row.risk = vfxReviewRisk(row);
      row.action = vfxReviewActionText(row);
      return row;
    })
    .sort((a, b) => {
      const riskWeight = { high: 3, medium: 2, ok: 1 };
      const dateSort = String(b.date || "").localeCompare(String(a.date || ""));
      return (riskWeight[b.risk] || 0) - (riskWeight[a.risk] || 0) || dateSort || b.amount - a.amount;
    });
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

  vfxSupplierAuditRows().forEach((row) => {
    if (row.risk === "ok" && row.gap <= 0.12) return;
    items.push({
      kind: "VFX 供应商",
      name: row.vendor,
      source: `${row.departments.join(" / ") || "调色/VFX组"} · 交付进度`,
      amount: row.contractAmount,
      status: row.status,
      risk: row.risk === "ok" ? "medium" : row.risk,
      evidence: row.progressMissing ? "需补镜头表 / 验收单 / 付款节点" : "需核镜头表 / 版本验收 / 付款节点",
      reason: `已用 ${percentText(row.paymentRate)}，交付 ${percentText(row.progressRate)}，信任 ${row.trust}`,
    });
  });

  vfxReviewRows().forEach((row) => {
    if (row.risk === "ok") return;
    items.push({
      kind: "版本审阅",
      name: `${row.shotGroup} · ${row.version}`,
      source: `${row.vendor} · ${vfxPaymentGateLabels[row.paymentGate] || "付款关口"}`,
      amount: row.amount,
      status: vfxReviewStatusLabels[row.status]?.label || "待审",
      risk: row.risk,
      evidence: row.risk === "high" ? "需补版本批注 / 验收单 / 付款审批" : "需核版本批注",
      reason: `${row.approvedCount}/${row.shotCount} 镜头通过，${row.action}`,
    });
  });

  const riskWeight = { high: 3, medium: 2, low: 1 };
  return items.sort((a, b) => (riskWeight[b.risk] || 0) - (riskWeight[a.risk] || 0) || b.amount - a.amount);
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
              : rule.id === "vfx_progress"
                ? vfxSupplierAuditRows().filter((row) => row.risk !== "ok" || row.gap > 0.12).length + vfxReviewRows().filter((row) => row.risk !== "ok").length
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

function renderVfxSupplierAudit() {
  const status = document.querySelector("#vfxAuditStatus");
  const summary = document.querySelector("#vfxAuditSummary");
  const list = document.querySelector("#vfxSupplierAudit");
  if (!status || !summary || !list) return;

  const rows = vfxSupplierAuditRows();
  const totalContract = rows.reduce((sum, row) => sum + row.contractAmount, 0);
  const totalUsed = rows.reduce((sum, row) => sum + row.usedAmount, 0);
  const averageProgress = rows.length > 0 ? averageNumbers(rows.map((row) => row.progressRate), 0) : 0;
  const riskCount = rows.filter((row) => row.risk !== "ok").length;

  status.textContent = rows.length > 0 ? `${rows.length} 个供应商 · ${riskCount} 项需复核` : "暂无 VFX 供应商";
  summary.innerHTML = `
    <div class="vfx-audit-metric"><span>合同金额</span><strong>${money.format(totalContract)}</strong></div>
    <div class="vfx-audit-metric"><span>已用金额</span><strong>${money.format(totalUsed)}</strong></div>
    <div class="vfx-audit-metric"><span>交付进度</span><strong>${percentText(averageProgress)}</strong></div>
    <div class="vfx-audit-metric"><span>复核项</span><strong>${riskCount}</strong></div>
  `;

  if (rows.length === 0) {
    list.innerHTML = `<div class="audit-empty">暂无 VFX / 调色 / 合成供应商。录入 VFX 人员、器材或自定义进度后会显示审查结果。</div>`;
    return;
  }

  list.innerHTML = rows
    .map((row) => {
      const gradeText = [...row.grades, ...row.companyGrades].join(" / ") || "未评级";
      const progressLabel = row.progressMissing ? "缺少明确 VFX 进度，暂按项目进度估算" : `${row.progressRows.length} 项进度指标`;
      const peopleNames = row.people.map((person) => person.name).filter(Boolean).join("、") || "无人员";
      const equipmentNames = row.equipment.map((item) => item.name).filter(Boolean).join("、") || "无器材";
      return `
        <div class="vfx-audit-row ${row.risk}">
          <div class="vfx-audit-row-head">
            <div>
              <strong>${escapeHtml(row.vendor)}</strong>
              <span>${escapeHtml(row.departments.join(" / ") || "调色/VFX组")} · ${escapeHtml(gradeText)}</span>
            </div>
            <span class="status-text ${row.risk === "high" ? "over" : row.risk === "medium" ? "tight" : "ok"}">${escapeHtml(row.status)}</span>
          </div>
          <div class="vfx-audit-bars">
            <div>
              <div class="vfx-audit-bar-label"><span>交付进度</span><strong>${percentText(row.progressRate)}</strong></div>
              <div class="vfx-progress-track"><span style="width: ${Math.round(row.progressRate * 100)}%"></span></div>
            </div>
            <div>
              <div class="vfx-audit-bar-label"><span>已用比例</span><strong>${percentText(row.paymentRate)}</strong></div>
              <div class="vfx-progress-track used"><span style="width: ${Math.round(row.paymentRate * 100)}%"></span></div>
            </div>
          </div>
          <div class="vfx-audit-meta">
            <span>合同 ${money.format(row.contractAmount)}</span>
            <span>已用 ${money.format(row.usedAmount)}</span>
            <span>信任 ${row.trust}</span>
            <span>${escapeHtml(progressLabel)}</span>
          </div>
          <div class="vfx-audit-detail">
            <span>人员：${escapeHtml(peopleNames)}</span>
            <span>器材：${escapeHtml(equipmentNames)}</span>
          </div>
          <p>${escapeHtml(row.action)}</p>
        </div>
      `;
    })
    .join("");
}

function renderVfxVersionReview() {
  const status = document.querySelector("#vfxVersionStatus");
  const summary = document.querySelector("#vfxVersionSummary");
  const list = document.querySelector("#vfxVersionList");
  const vendorOptions = document.querySelector("#vfxVendorOptions");
  if (!status || !summary || !list) return;

  const rows = vfxReviewRows();
  const supplierVendors = vfxSupplierAuditRows().map((row) => row.vendor);
  const versionVendors = rows.map((row) => row.vendor);
  const vendors = Array.from(new Set([...supplierVendors, ...versionVendors].filter(Boolean))).sort((a, b) => a.localeCompare(b, "zh-CN"));
  if (vendorOptions) {
    vendorOptions.innerHTML = vendors.map((vendor) => `<option value="${escapeHtml(vendor)}"></option>`).join("");
  }

  const totalShots = rows.reduce((sum, row) => sum + row.shotCount, 0);
  const approvedShots = rows.reduce((sum, row) => sum + row.approvedCount, 0);
  const highRisk = rows.filter((row) => row.risk === "high").length;
  const blocked = rows.filter((row) => row.status === "blocked").length;
  const approvalRate = totalShots > 0 ? approvedShots / totalShots : 0;

  status.textContent = rows.length > 0 ? `${rows.length} 个版本 · ${highRisk} 项高风险` : "暂无版本";
  summary.innerHTML = `
    <div class="vfx-version-stat"><span>版本数</span><strong>${rows.length}</strong></div>
    <div class="vfx-version-stat"><span>镜头通过</span><strong>${approvedShots}/${totalShots}</strong></div>
    <div class="vfx-version-stat"><span>通过率</span><strong>${percentText(approvalRate)}</strong></div>
    <div class="vfx-version-stat"><span>阻塞</span><strong>${blocked}</strong></div>
  `;

  if (rows.length === 0) {
    list.innerHTML = `<div class="audit-empty">暂无版本审阅记录。保存供应商版本后，这里会显示批注、通过率和付款关口。</div>`;
    return;
  }

  list.innerHTML = rows
    .map((row) => {
      const statusMeta = vfxReviewStatusLabels[row.status] || vfxReviewStatusLabels.submitted;
      const paymentLabel = vfxPaymentGateLabels[row.paymentGate] || "付款关口";
      const riskClass = row.risk === "high" ? "over" : row.risk === "medium" ? "tight" : "ok";
      const media = row.media;
      const mediaLabel = media ? `${media.fileName} · ${formatFileSize(media.fileSize)}` : "未上传媒体";
      return `
        <div class="vfx-version-row ${row.risk}" data-context-kind="vfx-review" data-context-review-id="${escapeHtml(row.id)}" data-context-title="${escapeHtml(`${row.shotGroup} · ${row.version}`)}" data-context-meta="${escapeHtml(`${row.vendor} · ${vfxReviewStatusLabels[row.status]?.label || "待审"}`)}" data-review-id="${escapeHtml(row.id)}">
          <div class="vfx-version-main">
            <div>
              <strong>${escapeHtml(row.shotGroup)} · ${escapeHtml(row.version)}</strong>
              <span>${escapeHtml(row.vendor)} · ${escapeHtml(row.reviewer)} · ${escapeHtml(row.date || "未填日期")}</span>
            </div>
            <span class="status-text ${statusMeta.className}">${escapeHtml(statusMeta.label)}</span>
          </div>
          <div class="vfx-version-meter">
            <div><span>通过 ${row.approvedCount}/${row.shotCount}</span><strong>${percentText(row.approvalRate)}</strong></div>
            <div class="vfx-progress-track"><span style="width: ${Math.round(row.approvalRate * 100)}%"></span></div>
          </div>
          <div class="vfx-version-meta">
            <span>${escapeHtml(paymentLabel)}</span>
            <span class="status-text ${riskClass}">${row.risk === "high" ? "高风险" : row.risk === "medium" ? "待复核" : "稳定"}</span>
            <span>${row.amount > 0 ? money.format(row.amount) : "未匹配合同金额"}</span>
          </div>
          <div class="vfx-version-media">
            <span>${escapeHtml(media?.fileType || "No media")}</span>
            <strong>${escapeHtml(mediaLabel)}</strong>
          </div>
          <p>${escapeHtml(row.notes || row.action)}</p>
          <div class="vfx-version-row-actions">
            <button type="button" data-vfx-review-edit="${escapeHtml(row.id)}">编辑</button>
            <button type="button" data-vfx-review-delete="${escapeHtml(row.id)}">删除</button>
          </div>
        </div>
      `;
    })
    .join("");
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
          <span>${escapeHtml(compactSentence(rule.detail))}</span>
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
        <tr class="inspectable-row" data-context-kind="audit-item" data-context-title="${escapeHtml(item.name)}" data-context-meta="${escapeHtml(`${item.kind} · ${auditRiskLabel(item.risk)} · ${money.format(item.amount)}`)}" data-audit-kind="${escapeHtml(item.kind)}" data-audit-amount="${escapeHtml(money.format(item.amount))}" data-audit-reason="${escapeHtml(item.reason)}" data-audit-evidence="${escapeHtml(item.evidence)}" data-workspace-view="audit" data-workspace-focus="auditTableBody">
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
  renderVfxSupplierAudit();
  renderVfxVersionReview();
}

function drawFundFlowChart() {
  const canvas = document.querySelector("#fundFlowChart");
  if (!canvas) return;
  const state = getChartViewState(canvas.id);
  drawFundFlowChartOnCanvas(canvas, { compactThreshold: 560, detailLimit: state.fullscreen ? 28 : 8, readablePreview: true });
}

function drawFundFlowLargeChart() {
  const canvas = document.querySelector("#fundFlowLargeChart");
  if (!canvas) return;
  const state = getChartViewState(canvas.id);
  drawFundFlowChartOnCanvas(canvas, { compactThreshold: 760, detailLimit: state.fullscreen ? 78 : 36, large: true });
}

function drawFundFlowChartOnCanvas(canvas, options = {}) {
  const { ctx, width, height } = resizeCanvas(canvas);
  resetChartHits(canvas);
  clearChart(ctx, width, height);

  const data = fundFlowData();
  const large = Boolean(options.large);
  const viewState = getChartViewState(canvas.id);
  const fullscreen = Boolean(viewState.fullscreen);
  const readablePreview = Boolean(options.readablePreview);
  const detailLimit = options.detailLimit || (large ? 18 : readablePreview ? 6 : 12);
  const insight = document.querySelector(large ? "#fundFlowLargeInsight" : "#fundFlowInsight");
  const summary = document.querySelector(large ? "#fundFlowLargeSummary" : "#fundFlowSummary");
  const hasFlowData = data.budgetRows.length > 0 || data.usageRows.length > 0;
  const unitLabel = budgetUnitLabel();
  const budgetLabel = budgetBudgetLabel();
  const unclassifiedUsed = data.usageRows.filter((row) => row.unclassified).reduce((sum, row) => sum + row.used, 0);
  const visibleUnallocatedSummary = Math.max(0, data.sourceTotal - data.allocatedTotal - unclassifiedUsed);
  const overAllocated = Math.max(0, data.allocatedTotal - Math.max(project.budget || 0, data.usageTotal));
  const usageRowsForSinks = data.usageRows.length > 0 ? data.usageRows : data.budgetRows;
  const allUsageDetails = usageRowsForSinks.flatMap((row) => rowUsageDetails(row));
  const productionSinkRows = productionDetailKeys
    .map((key) => ({
      key,
      label: productionDetailTypeLabel(key),
      value: allUsageDetails.filter((detail) => classifyFundDetail(detail).key === key).reduce((sum, detail) => sum + (Number(detail.value) || 0), 0),
      color: activeCategoryColor(key),
    }))
    .filter((row) => row.value > 0);
  if (fullscreen) {
    ["vehicles", "rooms", "locationFee"].forEach((key) => {
      if (!productionSinkRows.some((row) => row.key === key)) {
        productionSinkRows.push({
          key,
          label: productionDetailTypeLabel(key),
          value: 1,
          color: activeCategoryColor(key),
          placeholder: true,
        });
      }
    });
  }
  const sinkRows = [
    { key: "labor", label: "人员", value: usageRowsForSinks.reduce((sum, row) => sum + row.breakdown.labor, 0), color: activeCategoryColor("labor") },
    { key: "equipment", label: "器材", value: usageRowsForSinks.reduce((sum, row) => sum + row.breakdown.equipment, 0), color: activeCategoryColor("equipment") },
    ...productionSinkRows,
  ].filter((row) => row.value > 0);
  const fallbackProductionTotal = usageRowsForSinks.reduce((sum, row) => sum + row.breakdown.production, 0) - productionSinkRows.reduce((sum, row) => sum + row.value, 0);
  if (fallbackProductionTotal > 0) {
    sinkRows.push({ key: "production", label: isCustomInputMode() ? "外部费用" : "生产其他", value: fallbackProductionTotal, color: activeCategoryColor("production") });
  }
  const detailRows = aggregateDetails(allUsageDetails, width < 760 ? 7 : detailLimit, "其他公司/明细", {
    pinKeys: fullscreen || large ? ["vehicles", "rooms", "locationFee", "meals"] : [],
  });
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
  const roomy = large || fullscreen || width > 1180;
  const left = roomy ? 42 : compact ? 22 : 34;
  const sourceW = fullscreen ? 164 : roomy ? 150 : compact ? 104 : 128;
  const midX = fullscreen ? Math.max(left + sourceW + 150, width * 0.18) : roomy ? Math.max(left + sourceW + 92, width * 0.2) : compact ? Math.max(156, width * 0.25) : Math.max(196, width * 0.24);
  const midW = fullscreen ? Math.min(230, Math.max(190, width * 0.12)) : roomy ? Math.min(200, Math.max(172, width * 0.13)) : compact ? 116 : 164;
  const usageX = fullscreen ? Math.max(midX + midW + 190, width * 0.46) : roomy ? Math.max(midX + midW + 118, width * 0.46) : compact ? Math.max(midX + midW + 36, width * 0.5) : Math.max(midX + midW + 74, width * 0.5);
  const usageW = fullscreen ? 180 : roomy ? 154 : compact ? 104 : 136;
  const detailX = fullscreen ? Math.max(usageX + usageW + 180, width - 430) : roomy ? Math.max(usageX + usageW + 112, width - 340) : compact ? Math.max(usageX + usageW + 34, width - 148) : width - 248;
  const detailW = fullscreen ? Math.min(360, width - detailX - 58) : roomy ? Math.min(280, width - detailX - 48) : compact ? 132 : 196;
  const top = roomy ? 62 : 44;
  const bottom = height - (roomy ? 70 : 56);
  const usableH = Math.max(120, bottom - top);
  const gap = fullscreen ? 6 : roomy ? 7 : compact ? 7 : 8;
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
  const visibleAllocationRows = aggregateFundRows(allocationRows, "nodeValue", roomy ? (fullscreen ? 24 : 16) : compact ? 8 : readablePreview ? 7 : 10, `其他${unitLabel}`);
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
    fullscreen ? 28 : compact ? 14 : 18,
    (row) => row.color || semanticColor("muted"),
    fullscreen ? 52 : 18,
  );
  const detailNodes = positionedFlowNodes(
    detailRows.length > 0 ? detailRows : [{ key: "none-detail", label: "暂无明细", value: 1, color: semanticColor("muted"), type: "明细" }],
    "value",
    detailX,
    detailW,
    top,
    usableH,
    fullscreen ? 5 : compact ? 7 : 8,
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
    drawFundNode(ctx, { ...node, label, valueText: readablePreview ? compactMoney(row.used || row.budget) : row.unallocated ? compactMoney(row.budget) : `${compactMoney(row.budget)} / ${compactMoney(row.used)}` }, node.color, { labelSize: readablePreview ? 11 : 12, valueSize: readablePreview ? 10 : 11 });
    addChartHit(canvas, rectHit(node.x, node.y, node.w, node.h, makeChartTooltip(row.department.name, [row.unallocated ? `未分配：${money.format(row.budget)}` : `${budgetLabel}：${money.format(row.budget)}`, row.unallocated ? "" : `实际已用：${money.format(row.used)}`, row.unallocated ? "" : `预算使用率：${percentText(row.budget > 0 ? row.used / row.budget : 0)}`])));
  });

  const sinkTotal = Math.max(sinkRows.reduce((sum, row) => sum + row.value, 0), 1);
  sinkNodes.forEach((node) => {
    const valueText = node.row.placeholder ? "暂无记录" : `${compactMoney(node.row.value)} · ${percentText(node.row.value / sinkTotal)}`;
    drawFundNode(ctx, { ...node, label: node.row.label, valueText }, node.color, { labelSize: node.row.placeholder ? 10.5 : 12, valueSize: 10 });
    addChartHit(canvas, rectHit(node.x, node.y, node.w, node.h, makeChartTooltip(`用途 · ${node.row.label}`, [node.row.placeholder ? "当前没有录入该类费用" : `实际已用：${money.format(node.row.value)}`, node.row.placeholder ? "" : `占已用：${percentText(node.row.value / sinkTotal)}`])));
  });

  const visibleDetailKeys = new Set(detailNodes.map((node) => node.row.key));
  const canDrawDirectDepartmentDetails = roomy && detailRows.length > 0;
  allocationNodes.forEach((node) => {
    const row = node.row;
    if (row.unallocated) return;
    const rowDetails = rowUsageDetails(row);
    const usages = [
      { key: "labor", label: "人员", value: row.breakdown.labor },
      { key: "equipment", label: "器材", value: row.breakdown.equipment },
      ...productionDetailKeys.map((key) => ({
        key,
        label: productionDetailTypeLabel(key),
        value: rowDetails.filter((detail) => classifyFundDetail(detail).key === key).reduce((sum, detail) => sum + (Number(detail.value) || 0), 0),
      })),
    ].filter((item) => item.value > 0);
    const maxUsage = Math.max(...usages.map((item) => item.value), 1);
    usages.forEach((usage, usageIndex) => {
      const sinkNode = sinkNodes.find((item) => item.row.key === usage.key || item.row.label === usage.label);
      if (!sinkNode) return;
      if (sinkNode.row.placeholder) return;
      const lineW = Math.max(2.5, (usage.value / maxUsage) * Math.min(node.h * 0.46, 18));
      const offset = (usageIndex - (usages.length - 1) / 2) * Math.max(5, lineW + 3);
      const fromY = node.cy + offset;
      drawFlowLink(ctx, node.x + node.w, fromY, sinkNode.x, sinkNode.cy, lineW, sinkNode.color, 0.42);
      addChartHit(canvas, rectHit(node.x + node.w, Math.min(fromY, sinkNode.cy) - 10, Math.max(10, sinkNode.x - node.x - node.w), Math.abs(sinkNode.cy - fromY) + 20, makeChartTooltip(`${row.department.name} → ${usage.label}`, [`实际已用：${money.format(usage.value)}`])));
    });
    if (!canDrawDirectDepartmentDetails) return;
    const visibleRowDetails = rowDetails.filter((detail) => visibleDetailKeys.has(detail.key));
    const maxDetail = Math.max(...visibleRowDetails.map((detail) => detail.value), 1);
    visibleRowDetails.slice(0, fullscreen ? 18 : 6).forEach((detail, detailIndex) => {
      const detailNode = detailNodes.find((item) => item.row.key === detail.key);
      if (!detailNode) return;
      const lineW = Math.max(1.6, (detail.value / maxDetail) * Math.min(node.h * 0.22, 8));
      const offset = (detailIndex - (visibleRowDetails.length - 1) / 2) * Math.max(3, Math.min(7, lineW + 1));
      const fromY = node.cy + offset;
      drawFlowLink(ctx, node.x + node.w, fromY, detailNode.x, detailNode.cy, lineW, detailNode.color, 0.16);
      addChartHit(canvas, rectHit(node.x + node.w, Math.min(fromY, detailNode.cy) - 8, Math.max(10, detailNode.x - node.x - node.w), Math.abs(detailNode.cy - fromY) + 16, makeChartTooltip(`${row.department.name} → ${detail.label}`, [`${detail.type || "明细"}：${money.format(detail.value)}`, detail.meta ? `备注：${detail.meta}` : ""])));
    });
  });

  detailNodes.forEach((node) => {
    const maxLabelLength = fullscreen ? 28 : roomy ? 20 : readablePreview ? 12 : compact ? 9 : 18;
    const label = node.row.label.length > maxLabelLength ? `${node.row.label.slice(0, maxLabelLength)}...` : node.row.label;
    drawFundNode(ctx, { ...node, label, valueText: readablePreview ? compactMoney(node.row.value) : `${compactMoney(node.row.value)} · ${percentText(node.row.value / Math.max(detailTotal, 1))}` }, node.color, { labelSize: fullscreen ? 10.5 : readablePreview ? 10.5 : compact ? 10.5 : 11, valueSize: 10 });
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
  drawText(ctx, "用途 / 部门细项", usageX + usageW / 2, 22, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
  drawText(ctx, "公司 / 明细", detailX + detailW / 2, 22, { size: 12, weight: 900, color: semanticColor("muted"), align: "center" });
  if (roomy) {
    drawText(ctx, `显示 ${visibleAllocationRows.length} 个${unitLabel} · ${detailRows.length} 个去向 · 可缩放，拖动画布查看个人 / 职位 / 车辆 / 酒店 / 场地`, width / 2, height - 26, { size: 11, weight: 800, color: semanticColor("muted"), align: "center" });
  }
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

function formatFileSize(bytes) {
  const value = Math.max(0, Number(bytes) || 0);
  if (value >= 1024 * 1024 * 1024) return `${(value / (1024 * 1024 * 1024)).toFixed(1).replace(/\.0$/u, "")} GB`;
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1).replace(/\.0$/u, "")} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${Math.round(value)} B`;
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
  setText("#workspaceRibbonTitle", `${activeViewLabel()} · ${project.title || "未命名项目"}`);
}

function activeViewLabel() {
  const activeTab = document.querySelector(".tab-button.active span");
  return activeTab?.textContent?.trim() || "总览";
}

function redrawVisibleCharts(target = "") {
  const activeView = document.querySelector(".view.active");
  const chartIds = target === "fundflow"
    ? ["fundFlowLargeChart", "fundFlowChart"]
    : target === "budget"
      ? ["fundFlowChart", "fundFlowLargeChart", "categoryChart"]
      : target === "analysis"
        ? ["analysisVisualChart"]
        : target === "visuals"
          ? ["visualExplorerChart"]
          : [];
  if (chartIds.length === 0 && activeView) {
    activeView.querySelectorAll("canvas[id]").forEach((canvas) => chartIds.push(canvas.id));
  }
  window.requestAnimationFrame(() => {
    chartIds.forEach((id) => redrawChartById(id));
  });
  window.setTimeout(() => {
    chartIds.forEach((id) => redrawChartById(id));
  }, 90);
}

function defaultInspectorTarget() {
  return {
    kind: "project",
    title: project.title || "当前项目",
    meta: `${money.format(project.budget || 0)} · D${project.currentDay}/${project.plannedDays}`,
    tone: analysisMetrics().health.className,
    view: "overview",
    focus: "producerWorkspace",
    facts: [
      { label: "项目", value: project.title || "未命名项目" },
      { label: "总预算", value: money.format(project.budget || 0) },
      { label: "周期", value: `D${project.currentDay}/${project.plannedDays}` },
    ],
  };
}

function inspectorTargetFromElement(target) {
  if (!target) return null;
  const kind = target.dataset.contextKind || "object";
  const title = target.dataset.contextTitle || target.querySelector("strong")?.textContent?.trim() || "当前对象";
  const meta = target.dataset.contextMeta || target.querySelector("small, span")?.textContent?.trim() || "";
  const facts = [];
  if (target.dataset.contextPersonKey) {
    const person = findPersonByWorkKey(target.dataset.contextPersonKey);
    if (person) {
      const fit = budgetFit("person", person.grade, person.dayRate);
      facts.push(
        { label: "部门", value: getDept(person.dept).name },
        { label: "岗位", value: personRoleDisplay(person) },
        { label: "公司/供应商", value: person.vendor || "个人 / 自由职业" },
        { label: "成本", value: money.format(personTotal(person)) },
        { label: "等级", value: isRatingEnabled() ? `${gradeLabel(person.grade, "人")} / ${gradeLabel(person.companyGrade, "司")}` : "评分关闭" },
        { label: "信任", value: isRatingEnabled() ? `${normalizeTrust(person.trust)} · ${fit.label}` : "评分关闭" },
      );
    }
  }
  if (target.dataset.contextEquipmentKey) {
    const item = equipment.find((row, index) => equipmentWorkKey(row, index) === target.dataset.contextEquipmentKey);
    if (item) {
      const fit = budgetFit("company", item.companyGrade, item.daily);
      facts.push(
        { label: "部门", value: getDept(item.dept).name },
        { label: "公司/供应商", value: item.vendor || "未登记公司" },
        { label: "日租", value: money.format(item.daily) },
        { label: "天数", value: `${item.days} 天` },
        { label: "总成本", value: money.format(equipmentTotal(item)) },
        { label: "信任", value: isRatingEnabled() ? `${normalizeTrust(item.trust)} · ${fit.label}` : "评分关闭" },
      );
    }
  }
  if (target.dataset.contextReviewId) {
    const review = vfxReviewRows().find((row) => row.id === target.dataset.contextReviewId);
    if (review) {
      facts.push(
        { label: "供应商", value: review.vendor },
        { label: "版本", value: review.version },
        { label: "通过", value: `${review.approvedCount}/${review.shotCount} · ${percentText(review.approvalRate)}` },
        { label: "付款", value: vfxPaymentGateLabels[review.paymentGate] || review.paymentGate },
        { label: "金额", value: review.amount > 0 ? money.format(review.amount) : "未匹配合同" },
        { label: "审阅人", value: review.reviewer },
      );
    }
  }
  if (target.dataset.contextTaskId || target.dataset.scheduleId) {
    const taskId = target.dataset.contextTaskId || target.dataset.scheduleId;
    const task = productionScheduleRows().find((row) => row.id === taskId) || scheduleTaskById(taskId);
    if (task) {
      facts.push(
        { label: "负责人", value: task.owner || "未指派" },
        { label: "周期", value: `D${task.start}-D${task.end}` },
        { label: "进度", value: percentText(task.progressRate || task.progress || 0) },
        { label: "预算", value: money.format(task.budget || 0) },
        { label: "状态", value: task.status || "进行中" },
      );
    }
  }
  if (target.dataset.trackerShotCode) {
    const shot = productionTrackerWorkflowData().shotRows.find((row) => row.code === target.dataset.trackerShotCode);
    if (shot) {
      facts.push(
        { label: "镜头", value: `${shot.code} · ${shot.title}` },
        { label: "帧段", value: `${shot.frameStart}-${shot.frameEnd}` },
        { label: "任务", value: `${shot.complete}/${shot.tasks.length} 通过` },
        { label: "待审/风险", value: `${shot.pending}/${shot.warning}` },
        { label: "负责人", value: shot.assignees.join("、") || "未指派" },
        { label: "进度", value: percentText(shot.progress) },
      );
    }
  }
  if (target.dataset.trackerTaskId) {
    const tracker = productionTrackerWorkflowData();
    const task = [...tracker.allTasks, ...trackerProducerActionRows(tracker)].find((row) => row.id === target.dataset.trackerTaskId);
    if (task) {
      facts.push(
        { label: task.sourceType === "producer-action" ? "任务域" : "镜头", value: `${task.shotCode} · ${task.shotTitle}` },
        { label: "任务", value: task.name },
        { label: "状态", value: trackerStatusLabel(task.status) },
        { label: "负责人", value: task.assignee },
        { label: task.sourceType === "producer-action" ? "金额" : "版本", value: task.sourceType === "producer-action" ? money.format(task.amount || 0) : task.latestVersion ? `${task.latestVersion.version} · ${task.latestVersion.vendor}` : `${task.versionCount} 个版本` },
        { label: "批注", value: `${task.noteCount} 条` },
      );
    }
  }
  if (target.dataset.trackerAssetId) {
    const asset = productionTrackerWorkflowData().assetRows.find((row) => row.id === target.dataset.trackerAssetId);
    if (asset) {
      facts.push(
        { label: "资产", value: `${asset.code} · ${asset.name}` },
        { label: "类型", value: trackerAssetTypeLabel(asset.type) },
        { label: "负责人", value: asset.owner },
        { label: "部门", value: getDept(asset.department).name },
        { label: "状态", value: trackerStatusLabel(asset.status) },
        { label: "预算关联", value: money.format(asset.amount || 0) },
        { label: "版本", value: `${asset.versionCount || 0} 个` },
        { label: "进度", value: percentText(asset.progress || 0) },
      );
    }
  }
  if (target.dataset.trackerProjectId) {
    const tracker = productionTrackerWorkflowData();
    const projectRow = trackerProjectRows(tracker).find((row) => row.id === target.dataset.trackerProjectId);
    if (projectRow) {
      facts.push(
        { label: "项目", value: projectRow.name },
        { label: "代码", value: projectRow.code },
        { label: "预算", value: money.format(projectRow.budget || 0) },
        { label: "已用", value: money.format(projectRow.spent || 0) },
        { label: "进度", value: percentText(projectRow.progress || 0) },
        { label: "Shot / Asset", value: `${projectRow.shotCount} / ${projectRow.assetCount}` },
        { label: "风险", value: `${projectRow.riskCount} 项` },
      );
    }
  }
  if (target.dataset.trackerUserId) {
    const tracker = productionTrackerWorkflowData();
    const user = trackerUserRows(tracker).find((row) => row.id === target.dataset.trackerUserId);
    if (user) {
      facts.push(
        { label: "成员", value: user.name },
        { label: "角色", value: trackerRoleLabel(user.role) },
        { label: "部门", value: getDept(user.department).name },
        { label: "公司/个体", value: user.vendor },
        { label: "任务", value: `${user.tasks} 项` },
        { label: "复核", value: `${user.reviewTasks} 项` },
        { label: "信任", value: String(user.trust) },
      );
    }
  }
  if (target.dataset.trackerReportId) {
    const tracker = productionTrackerWorkflowData();
    const report = trackerReportRows(tracker).find((row) => row.id === target.dataset.trackerReportId);
    if (report) {
      facts.push(
        { label: "报表", value: report.label },
        { label: "接口", value: report.endpoint },
        { label: "指标", value: report.value },
        { label: "说明", value: report.detail },
      );
    }
  }
  if (kind === "tracker-workload") {
    const work = productionTrackerWorkflowData().workloadRows.find((row) => row.name === title);
    if (work) {
      facts.push(
        { label: "人员", value: work.name },
        { label: "部门", value: getDept(work.dept).name },
        { label: "总工时", value: `${formatProgressNumber(work.hours)}h` },
        { label: "任务", value: `${work.activeTasks} 项` },
        { label: "天数", value: `${work.dayCount} 天` },
        { label: "加班", value: `${work.overtime} 次` },
      );
    }
  }
  if (target.dataset.pipelinePath) facts.push({ label: "路径", value: target.dataset.pipelinePath });
  if (target.dataset.pipelineQueueKind) facts.push({ label: "队列类型", value: target.dataset.pipelineQueueKind });
  if (target.dataset.pipelineTrigger) facts.push({ label: "触发器", value: target.dataset.pipelineTrigger });
  if (target.dataset.pipelinePayload) facts.push({ label: "Payload", value: "可复制 JSON" });
  if (target.dataset.auditAmount || target.dataset.auditReason || target.dataset.auditEvidence) {
    facts.push(
      { label: "类型", value: target.dataset.auditKind || kind },
      { label: "金额", value: target.dataset.auditAmount || "--" },
      { label: "原因", value: target.dataset.auditReason || "--" },
      { label: "凭证", value: target.dataset.auditEvidence || "--" },
    );
  }
  return {
    kind,
    title,
    meta,
    tone: target.classList.contains("warning") || target.classList.contains("high") ? "warning" : target.classList.contains("note") || target.classList.contains("medium") ? "note" : "good",
    view: target.dataset.workspaceView || "",
    focus: target.dataset.workspaceFocus || "",
    path: target.dataset.pipelinePath || "",
    payload: target.dataset.pipelinePayload || "",
    trigger: target.dataset.pipelineTrigger || "",
    queueId: target.dataset.pipelineQueueId || "",
    trackerTaskId: target.dataset.trackerTaskId || "",
    trackerShotCode: target.dataset.trackerShotCode || "",
    trackerAssetId: target.dataset.trackerAssetId || "",
    trackerProjectId: target.dataset.trackerProjectId || "",
    trackerUserId: target.dataset.trackerUserId || "",
    trackerReportId: target.dataset.trackerReportId || "",
    summary: contextSummaryFromElement(target),
    facts,
  };
}

function selectInspectorTarget(target) {
  selectedInspectorTarget = inspectorTargetFromElement(target) || defaultInspectorTarget();
  document.querySelectorAll(".inspector-selected").forEach((item) => item.classList.remove("inspector-selected"));
  target?.classList?.add("inspector-selected");
  renderProductionInspector();
  renderTrackerTaskDetailPanel();
}

function inspectorObjectActions(target) {
  const current = target || defaultInspectorTarget();
  const actions = [{ label: "复制摘要", action: "copy-summary" }];
  if (current.view) actions.push({ label: "打开关联视图", action: "open-view" });
  if (current.path) actions.push({ label: "复制路径", action: "copy-path" });
  if (current.payload) actions.push({ label: "复制 Payload", action: "copy-payload" });
  if (current.kind === "vfx-review") actions.push({ label: "进入版本审阅", action: "open-vfx" });
  if (current.kind === "pipeline-action") actions.push({ label: "触发动作", action: "trigger-pipeline" });
  return actions;
}

function renderInspectorObject(target) {
  const current = target || defaultInspectorTarget();
  const facts = current.facts?.length ? current.facts : [{ label: "说明", value: current.meta || "点击左侧工作区对象后，这里会显示明细。" }];
  return `
    <section class="inspector-section inspector-object-section" aria-labelledby="inspectorObjectTitle">
      <div class="inspector-section-head">
        <span>${escapeHtml(current.kind || "Object")}</span>
        <h3 id="inspectorObjectTitle">当前对象</h3>
      </div>
      <div class="inspector-object-card ${escapeHtml(current.tone || "good")}">
        <strong>${escapeHtml(current.title || "当前对象")}</strong>
        <span>${escapeHtml(current.meta || "点击对象查看详情")}</span>
      </div>
      <div class="inspector-object-facts">
        ${facts
          .slice(0, 8)
          .map(
            (item) => `
              <div>
                <span>${escapeHtml(item.label)}</span>
                <strong>${escapeHtml(item.value)}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
      <div class="inspector-object-actions">
        ${inspectorObjectActions(current)
          .map((item) => `<button type="button" data-inspector-action="${escapeHtml(item.action)}">${escapeHtml(item.label)}</button>`)
          .join("")}
      </div>
    </section>
  `;
}

async function executeInspectorAction(action) {
  const current = selectedInspectorTarget || defaultInspectorTarget();
  if (action === "copy-summary") {
    await copyTextToClipboard(current.summary || `${current.title}\n${current.meta || ""}`);
    setFormStatus("对象摘要已复制", "good");
    return;
  }
  if (action === "open-view") {
    if (current.view) {
      document.querySelector(`.tab-button[data-view="${CSS.escape(current.view)}"]`)?.click();
      window.setTimeout(() => focusWorkspaceTarget(current.focus), 120);
      setFormStatus(`已打开关联视图：${current.title}`, "good");
    }
    return;
  }
  if (action === "copy-path") {
    await copyTextToClipboard(current.path || current.summary || current.title);
    setFormStatus("对象路径已复制", "good");
    return;
  }
  if (action === "copy-payload") {
    await copyTextToClipboard(current.payload || "");
    setFormStatus("对象 Payload 已复制", "good");
    return;
  }
  if (action === "open-vfx") {
    document.querySelector('.tab-button[data-view="audit"]')?.click();
    window.setTimeout(() => focusWorkspaceTarget("vfxVersionList"), 120);
    setFormStatus("已进入版本审阅", "good");
    return;
  }
  if (action === "trigger-pipeline") {
    const data = pipelineCoreData();
    const row = data.queueRows.find((item) => item.id === current.queueId) || data.queueRows[0] || null;
    recordPipelineEvent(current.trigger || "publish", row);
  }
}

function inspectorRiskRows(metrics, audit) {
  const rows = [];
  if (metrics.variance > 0) {
    rows.push({
      tone: "warning",
      title: "完片预测超预算",
      meta: `预测 ${money.format(metrics.projectedFinal)} · 偏差 ${money.format(metrics.variance)}`,
      view: "analysis",
      focus: "analysisReport",
    });
  } else if (metrics.delta > 0.06) {
    rows.push({
      tone: "note",
      title: "预算消耗快于进度",
      meta: `预算快 ${Math.round(metrics.delta * 100)} 点 · 需复核后续通告`,
      view: "budget",
      focus: "budgetTableBody",
    });
  }
  if (audit.highRiskCount > 0) {
    rows.push({
      tone: "warning",
      title: `${audit.highRiskCount} 项高风险审计`,
      meta: audit.topItem ? `${audit.topItem.kind} · ${audit.topItem.name}` : "凭证、等级或付款关口需复核",
      view: "audit",
      focus: "auditTableBody",
    });
  }
  const blockedReviews = vfxReviewRows().filter((row) => row.status === "blocked" || row.paymentGate === "hold");
  if (blockedReviews.length > 0) {
    rows.push({
      tone: "note",
      title: `${blockedReviews.length} 个版本/付款关口暂停`,
      meta: `${blockedReviews[0].vendor} · ${blockedReviews[0].shotGroup}`,
      view: "audit",
      focus: "vfxVersionList",
    });
  }
  const lowTrust = isRatingEnabled() ? [...people, ...equipment].filter((item) => normalizeTrust(item.trust) < 65).length : 0;
  if (lowTrust > 0) {
    rows.push({
      tone: "note",
      title: `${lowTrust} 项信任评分偏低`,
      meta: "人员 / 公司等级需要制片确认",
      view: "personnel",
      focus: "personnelModule",
    });
  }
  if (rows.length === 0) {
    rows.push({
      tone: "good",
      title: "当前无关键阻塞",
      meta: "预算、审计和管线状态处于可控范围",
      view: "overview",
      focus: "producerWorkspace",
    });
  }
  return rows.slice(0, 4);
}

function renderProductionInspector() {
  const inspector = document.querySelector("#productionInspector");
  if (!inspector) return;
  const metrics = analysisMetrics();
  const audit = auditSummaryData();
  const progress = metrics.progress;
  const spentRate = Math.max(0, metrics.spentRate || 0);
  const progressRate = Math.max(0, metrics.progressRate || 0);
  const remaining = project.budget - metrics.spent;
  setText("#workspaceRibbonTitle", `${activeViewLabel()} · ${project.title || "未命名项目"}`);
  const health = document.querySelector("#inspectorHealth");
  health.textContent = metrics.health.label;
  health.className = `status-pill ${metrics.health.className}`;
  setText("#inspectorActiveView", `当前视图：${activeViewLabel()}`);
  setText("#inspectorTitle", project.title || "项目详情");
  document.querySelector("#inspectorProgressStrip").innerHTML = `
    <div class="inspector-progress-row">
      <span>预算消耗</span>
      <strong>${Math.round(spentRate * 100)}%</strong>
      <i><b style="width:${Math.round(Math.min(spentRate, 1.4) * 100)}%"></b></i>
    </div>
    <div class="inspector-progress-row">
      <span>${escapeHtml(progress.label || "完成进度")}</span>
      <strong>${Math.round(progressRate * 100)}%</strong>
      <i><b style="width:${Math.round(Math.min(progressRate, 1) * 100)}%"></b></i>
    </div>
  `;
  document.querySelector("#inspectorProjectFacts").innerHTML = [
    { label: "总预算", value: money.format(project.budget || 0), meta: `剩余 ${money.format(remaining)}` },
    { label: "已用", value: money.format(metrics.spent), meta: `日均 ${money.format(metrics.averageDayCost || 0)}` },
    { label: "完片预测", value: money.format(metrics.projectedFinal || metrics.spent), meta: metrics.variance > 0 ? `超 ${money.format(metrics.variance)}` : `余量 ${money.format(Math.abs(metrics.variance || 0))}` },
    { label: "计划", value: `D${project.currentDay}/${project.plannedDays}`, meta: progress.detailText },
  ]
    .map(
      (item) => `
        <div class="inspector-fact">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
          <small>${escapeHtml(item.meta)}</small>
        </div>
      `,
    )
    .join("");
  const objectSlot = document.querySelector("#inspectorObjectSlot");
  if (objectSlot) {
    objectSlot.innerHTML = renderInspectorObject(selectedInspectorTarget);
  }
  const actionRows = [
    { label: "打开通告", meta: "今日安排 / 车辆 / 酒店", view: "callsheet", focus: "callsheetDetail" },
    { label: "资金流向", meta: "公司 / 个人 / 供应商", view: "fundflow", focus: "fundFlowLargeChart" },
    { label: "审查队列", meta: `${audit.highRiskCount + audit.mediumRiskCount} 项需看`, view: "audit", focus: "auditTableBody" },
    { label: "管线中心", meta: `${pipelineEvents.length} 个事件`, view: "overview", focus: "pipelineCore" },
  ];
  document.querySelector("#inspectorActionList").innerHTML = actionRows
    .map(
      (item) => `
        <button class="inspector-action" type="button" data-workspace-view="${escapeHtml(item.view)}" data-workspace-focus="${escapeHtml(item.focus)}">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.meta)}</span>
        </button>
      `,
    )
    .join("");
  document.querySelector("#inspectorRiskList").innerHTML = inspectorRiskRows(metrics, audit)
    .map(
      (item) => `
        <button class="inspector-risk ${escapeHtml(item.tone)}" type="button" data-workspace-view="${escapeHtml(item.view)}" data-workspace-focus="${escapeHtml(item.focus)}">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.meta)}</span>
        </button>
      `,
    )
    .join("");
  document.querySelector("#inspectorEventList").innerHTML =
    pipelineEvents.length > 0
      ? pipelineEvents
          .slice(0, 4)
          .map(
            (event) => `
              <button class="inspector-event ${escapeHtml(event.tone)}" type="button" data-context-kind="pipeline-event" data-context-title="${escapeHtml(event.label)}" data-context-meta="${escapeHtml(`${event.eventType} · ${event.entityName}`)}" data-pipeline-payload="${escapeHtml(JSON.stringify(event.payload, null, 2))}" data-pipeline-path="${escapeHtml(event.path)}">
                <span>${escapeHtml(event.eventType)}</span>
                <strong>${escapeHtml(event.entityName || event.label)}</strong>
                <small>${escapeHtml(new Date(event.createdAt).toLocaleString("zh-CN", { hour12: false }))}</small>
              </button>
            `,
          )
          .join("")
      : `<div class="inspector-empty">暂无管线事件。可在总览的 Pipeline Core 里触发。</div>`;
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

function producerWorkspaceData() {
  const metrics = analysisMetrics();
  const audit = auditSummaryData();
  const flow = fundFlowReadableData(8);
  const progress = activeProgressStats();
  const production = productionDashboardData();
  const today = callSheets.find((sheet) => sheet.day === project.currentDay) || callSheets[callSheets.length - 1] || null;
  const completed = completedSheets();
  const spentRate = project.budget > 0 ? metrics.spent / project.budget : 0;
  const progressRate = progress.rate || 0;
  const budgetGap = spentRate - progressRate;
  const topDept = departmentAnalysisRows()[0];
  const vfxRows = vfxSupplierAuditRows();
  const vfxRiskCount = vfxRows.filter((row) => row.risk !== "ok" || row.gap > 0.12).length;
  const missingVendorCount =
    people.filter((person) => !person.vendor || person.vendor === "个人 / 自由职业").length +
    equipment.filter((item) => !item.vendor || item.vendor === "未登记公司").length;
  const decisions = [];

  if (audit.topItem) {
    decisions.push({
      tone: audit.topItem.risk === "high" ? "warning" : "note",
      title: `${auditRiskLabel(audit.topItem.risk)} · ${audit.topItem.name}`,
      detail: `${audit.topItem.kind} / ${audit.topItem.reason}`,
      amount: money.format(audit.topItem.amount),
      source: audit.topItem.source,
      target: "audit",
    });
  }
  if (project.budget > 0 && metrics.variance > 0) {
    decisions.push({
      tone: "warning",
      title: "完片成本预测超预算",
      detail: `按当前日均成本推算，预计超出 ${money.format(metrics.variance)}。`,
      amount: money.format(metrics.projectedFinal),
      source: "监制分析报告",
      target: "analysis",
    });
  } else if (project.budget > 0 && budgetGap > 0.06) {
    decisions.push({
      tone: budgetGap > 0.12 ? "warning" : "note",
      title: "预算消耗快于完成进度",
      detail: `预算 ${percentText(spentRate)}，完成 ${percentText(progressRate)}，相差 ${Math.round(Math.abs(budgetGap) * 100)} 个点。`,
      amount: money.format(metrics.spent),
      source: "预算 / 进度",
      target: "analysis",
    });
  }
  if (topDept && topDept.rate > 0.82) {
    decisions.push({
      tone: topDept.rate > 1 ? "warning" : "note",
      title: `${topDept.department.name}预算${topDept.rate > 1 ? "已超支" : "接近上限"}`,
      detail: `已用 ${money.format(topDept.used)} / 预算 ${money.format(topDept.department.budget)}。`,
      amount: percentText(topDept.rate),
      source: budgetBudgetLabel(),
      target: "budget",
    });
  }
  if (today) {
    const averageDayCost = completed.length > 0 ? completed.reduce((sum, sheet) => sum + dayTotal(sheet), 0) / completed.length : dayTotal(today);
    const todayTotal = dayTotal(today);
    if (todayTotal > Math.max(averageDayCost * 1.18, project.budget * 0.04)) {
      decisions.push({
        tone: "note",
        title: `${modeText("今日通告", "当前记录")}成本偏高`,
        detail: `${today.title} · ${today.location}，人工 ${money.format(dayLaborCost(today))}，器材 ${money.format(dayEquipmentCost(today))}。`,
        amount: money.format(todayTotal),
        source: today.code,
        target: "callsheet",
      });
    }
  }
  if (vfxRiskCount > 0) {
    decisions.push({
      tone: "warning",
      title: "VFX / 调色供应商需复核",
      detail: `${vfxRiskCount} 个供应商付款、进度或信任评分需要检查。`,
      amount: money.format(vfxRows.reduce((sum, row) => sum + row.contractAmount, 0)),
      source: "VFX 进度审查",
      target: "audit",
    });
  }
  if (production.delayed > 0 || production.tight > 0) {
    decisions.push({
      tone: production.delayed > 0 ? "warning" : "note",
      title: "生产排期需要追踪",
      detail: `${production.delayed} 个阶段延期，${production.tight} 个阶段待关注；工时峰值 ${production.work.peakDay ? `D${production.work.peakDay.day}` : "暂无"}。`,
      amount: `${Math.round(production.progressRate * 100)}%`,
      source: "排期 / 工时",
      target: "progress",
    });
  }
  if (flow.unclassifiedUsed > 0 || flow.overAllocated > 0 || flow.unallocated > 0) {
    decisions.push({
      tone: flow.unclassifiedUsed > 0 || flow.overAllocated > 0 ? "warning" : "note",
      title: flow.statusLabel,
      detail: `资金口径：${flow.budgetLabel} ${money.format(flow.allocatedTotal)}，已用 ${money.format(flow.usedTotal)}。`,
      amount: money.format(flow.unclassifiedUsed || flow.overAllocated || flow.unallocated),
      source: "资金流向",
      target: "fundflow",
    });
  }
  if (decisions.length === 0) {
    decisions.push({
      tone: "good",
      title: "今日无明显阻塞",
      detail: "预算、进度、审计和资金流向暂未出现高优先级风险。",
      amount: `${Math.round(progressRate * 100)}%`,
      source: "主工作区",
      target: "analysis",
    });
  }

  const dataTables = [
    {
      title: "人员 / 演员表",
      count: `${people.length} 条`,
      metric: money.format(people.reduce((sum, person) => sum + personTotal(person), 0)),
      detail: `${people.filter(isActorPerson).length} 位演员 · ${new Set(people.map((person) => person.vendor || "个人 / 自由职业")).size} 个公司/个体`,
      progress: Math.min(1, people.length / 24),
      views: ["表格", "分层", "占比", "Excel"],
      target: "personnel",
    },
    {
      title: "器材 / 供应商",
      count: `${equipment.length} 条`,
      metric: money.format(equipment.reduce((sum, item) => sum + equipmentTotal(item), 0)),
      detail: `${new Set(equipment.map((item) => item.vendor || "未登记公司")).size} 个供应商 · ${equipment.filter((item) => item.daily > 0).length} 项日租`,
      progress: Math.min(1, equipment.length / 18),
      views: ["表格", "供应商", "预算", "审查"],
      target: "equipment",
    },
    {
      title: modeText("通告单 / 日成本", "执行记录 / 成本"),
      count: `${callSheets.length} 张`,
      metric: today ? money.format(dayTotal(today)) : "暂无",
      detail: today ? `${today.code} · ${today.title}` : modeText("等待新增通告", "等待新增记录"),
      progress: Math.min(1, callSheets.length / Math.max(project.plannedDays || 1, 1)),
      views: ["节点", "日历", "成本", "资源"],
      target: "callsheet",
    },
    {
      title: "排期 / 工时",
      count: `${production.schedule.length} 阶段`,
      metric: `${formatProgressNumber(production.work.totalHours)}h`,
      detail: `${production.delayed} 延期 · ${production.tight} 关注 · ${production.work.personCount} 人参与`,
      progress: production.progressRate,
      views: ["甘特", "工时", "人员", "看板"],
      target: "progress",
    },
    {
      title: "资金流向",
      count: `${flow.supplierCount} 个去向`,
      metric: money.format(flow.usedTotal),
      detail: `${flow.budgetLabel} ${money.format(flow.allocatedTotal)} · ${flow.statusLabel}`,
      progress: flow.sourceTotal > 0 ? Math.min(1, flow.usedTotal / flow.sourceTotal) : 0,
      views: ["桑基", "明细", "供应商", "审计"],
      target: "fundflow",
    },
    {
      title: "审计 / 风险",
      count: `${audit.items.length} 项`,
      metric: `${audit.highRiskCount} 高风险`,
      detail: `${audit.noEvidenceCount} 项缺凭证 · 覆盖 ${percentText(audit.coverage)}`,
      progress: audit.items.length > 0 ? Math.min(1, audit.reviewedAmount / Math.max(project.budget || audit.reviewedAmount, 1)) : 0,
      views: ["规则", "凭证", "VFX", "清单"],
      target: "audit",
    },
    {
      title: "AI / Excel 录入",
      count: missingVendorCount > 0 ? `${missingVendorCount} 项待补` : "可导入",
      metric: "API / OCR",
      detail: "Excel 识别、手写单识别、主流 AI API 接口配置",
      progress: missingVendorCount > 0 ? 0.55 : 0.82,
      views: ["Excel", "手写", "API", "映射"],
      target: "input",
    },
  ];

  const quickActions = [
    { icon: "▣", label: "排期 / 工时", detail: "阶段、人员、工时看板", target: "progress" },
    { icon: "＋", label: modeText("新建通告", "新建记录"), detail: "节点式录入", target: "input", focus: "callsheetForm" },
    { icon: "⇥", label: "导入 Excel / 手写单", detail: "AI 识别录入", target: "input", focus: "spreadsheetFile" },
    { icon: "￥", label: "查看资金流向", detail: "公司、个人、车辆、酒店、场地", target: "fundflow" },
    { icon: "✓", label: "费用审查", detail: "等级、信任、凭证、VFX", target: "audit" },
    { icon: "TK", label: "管线配置", detail: "上下文、模板、Hook", target: "overview", focus: "pipelineCore" },
    { icon: "↗", label: "生成监制报告", detail: "预算、风险、建议", target: "analysis" },
  ];

  return { decisions: decisions.slice(0, 5), dataTables, quickActions, metrics, audit, flow, progress, production };
}

function renderProducerWorkspace() {
  const container = document.querySelector("#producerWorkspace");
  const decisionList = document.querySelector("#producerDecisionList");
  const dataCenter = document.querySelector("#producerDataCenter");
  const actionRail = document.querySelector("#producerActionRail");
  const badge = document.querySelector("#producerWorkspaceBadge");
  if (!container || !decisionList || !dataCenter || !actionRail || !badge) return;

  const data = producerWorkspaceData();
  const riskCount = data.decisions.filter((item) => item.tone === "warning").length;
  const noteCount = data.decisions.filter((item) => item.tone === "note").length;
  badge.textContent = riskCount > 0 ? `${riskCount} 项优先处理` : noteCount > 0 ? `${noteCount} 项待关注` : "状态稳定";
  badge.className = `status-pill ${riskCount > 0 ? "warning" : noteCount > 0 ? "note" : "good"}`;

  decisionList.innerHTML =
    data.decisions.length > 0
      ? data.decisions
          .map(
            (item) => `
              <button class="producer-decision-row ${item.tone}" type="button" data-workspace-view="${escapeHtml(item.target)}">
                <span class="producer-decision-body">
                  <span class="producer-row-top">
                    <strong>${escapeHtml(item.title)}</strong>
                    <span>${escapeHtml(item.amount)}</span>
                  </span>
                  <p>${escapeHtml(item.detail)}</p>
                  <span class="producer-row-meta">
                    <span>${escapeHtml(item.source)}</span>
                    <span>${item.tone === "warning" ? "立刻处理" : item.tone === "note" ? "本日复核" : "持续观察"}</span>
                  </span>
                </span>
              </button>
            `,
          )
          .join("")
      : `<div class="producer-empty">暂无需要处理的事项。</div>`;

  dataCenter.innerHTML = data.dataTables
    .map(
      (item) => `
        <button class="producer-data-row" type="button" data-workspace-view="${escapeHtml(item.target)}">
          <span class="producer-data-top">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.count)}</span>
          </span>
          <p>${escapeHtml(item.detail)}</p>
          <span class="producer-data-progress" aria-hidden="true" style="--value:${Math.round(Math.max(0, Math.min(item.progress, 1)) * 100)}%">
            <span></span>
          </span>
          <span class="producer-data-meta">
            <span>${escapeHtml(item.metric)}</span>
            ${item.views.map((view) => `<span>${escapeHtml(view)}</span>`).join("")}
          </span>
        </button>
      `,
    )
    .join("");

  actionRail.innerHTML = data.quickActions
    .map(
      (item) => `
        <button class="producer-action-button" type="button" data-workspace-view="${escapeHtml(item.target)}" ${item.focus ? `data-workspace-focus="${escapeHtml(item.focus)}"` : ""}>
          <i aria-hidden="true">${escapeHtml(item.icon)}</i>
          <span>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.detail)}</span>
          </span>
        </button>
      `,
    )
    .join("");
}

function trackingToneFromRisk(risk) {
  if (risk === "over" || risk === "high") return "warning";
  if (risk === "tight" || risk === "medium") return "note";
  return "good";
}

function trackingStatusText(tone) {
  if (tone === "warning") return "优先处理";
  if (tone === "note") return "待复核";
  return "正常推进";
}

function trackerStatusLabel(status) {
  return (
    {
      NOT_STARTED: "未开始",
      IN_PROGRESS: "进行中",
      PENDING_REVIEW: "待审阅",
      APPROVED: "已通过",
      CHANGES_REQUESTED: "需修改",
      ON_HOLD: "暂停",
    }[status] || status || "未开始"
  );
}

function trackerStatusTone(status) {
  if (status === "APPROVED") return "good";
  if (status === "PENDING_REVIEW" || status === "IN_PROGRESS") return "note";
  if (status === "CHANGES_REQUESTED" || status === "ON_HOLD") return "warning";
  return "";
}

function trackerStatusClass(status) {
  return String(status || "NOT_STARTED").toLowerCase().replaceAll("_", "-");
}

function trackerStatusOptions() {
  return [
    { value: "all", label: "全部状态" },
    { value: "NOT_STARTED", label: trackerStatusLabel("NOT_STARTED") },
    { value: "IN_PROGRESS", label: trackerStatusLabel("IN_PROGRESS") },
    { value: "PENDING_REVIEW", label: trackerStatusLabel("PENDING_REVIEW") },
    { value: "CHANGES_REQUESTED", label: trackerStatusLabel("CHANGES_REQUESTED") },
    { value: "ON_HOLD", label: trackerStatusLabel("ON_HOLD") },
    { value: "APPROVED", label: trackerStatusLabel("APPROVED") },
  ];
}

function taskStatusFromRate(rate, risk = "ok", needsReview = false) {
  if (risk === "warning") return needsReview ? "CHANGES_REQUESTED" : "ON_HOLD";
  if (needsReview) return "PENDING_REVIEW";
  if (rate >= 0.96) return "APPROVED";
  if (rate > 0.05) return "IN_PROGRESS";
  return "NOT_STARTED";
}

function taskStatusFromVersion(version) {
  if (!version) return "";
  if (version.status === "approved" && version.approvalRate >= 0.96) return "APPROVED";
  if (version.status === "blocked") return "ON_HOLD";
  if (version.status === "notes") return "CHANGES_REQUESTED";
  if (version.status === "submitted") return "PENDING_REVIEW";
  return "";
}

function trackerTaskNextAction(task) {
  if (!task) return "选择一个任务查看下一步。";
  if (task.sourceType === "producer-action") {
    if (task.id.includes("budget")) return "打开监制分析报告，确认预算偏差、预测完片成本和需要暂停的高额支出。";
    if (task.id.includes("payment")) return "进入审查清单，先关闭高风险凭证和暂缓付款版本，再放行下一笔款。";
    if (task.id.includes("callsheet")) return "核对今日通告的车辆、住宿、场地和部门到场信息，锁定执行成本。";
    if (task.id.includes("vendor")) return "补齐公司/个人、联系方式和供应商等级，避免资金流与审计证据断开。";
    if (task.id.includes("archive")) return "保存当前项目并触发管线交付包，把项目状态固定成可复盘版本。";
    return "打开关联处理入口，把项目级事项关闭到可交付状态。";
  }
  if (task.status === "CHANGES_REQUESTED") return "把批注拆成可关闭项，要求负责人回传下一版日期。";
  if (task.status === "ON_HOLD") return "先确认阻塞原因，再决定是否调整供应商、排期或付款关口。";
  if (task.status === "PENDING_REVIEW") return "安排导演、监制或后期负责人完成审阅，并记录是否可进入付款。";
  if (task.status === "IN_PROGRESS") return "盯住 D 日节点，提前确认素材、人员和机器是否到位。";
  if (task.status === "APPROVED") return "归档验收记录，把任务从待处理队列里关闭。";
  return "补齐负责人、截止日和首版交付标准。";
}

function trackerTaskNotes(task) {
  if (!task) return [];
  if (task.sourceType === "producer-action") {
    return [task.detail, trackerTaskNextAction(task)].filter(Boolean);
  }
  const notes = [];
  if (task.latestVersion?.notes) {
    String(task.latestVersion.notes)
      .split(/\n+/u)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => notes.push(line));
  }
  if (task.latestVersion?.action) notes.push(task.latestVersion.action);
  if (task.latestVersion?.risk && task.latestVersion.risk !== "ok") {
    notes.push(`风险：${vfxReviewStatusLabels[task.latestVersion.status]?.label || "待审"} · ${vfxPaymentGateLabels[task.latestVersion.paymentGate] || "付款关口未定"}`);
  }
  if (task.status === "ON_HOLD" && notes.length === 0) notes.push("当前步骤暂停，需要补齐依赖条件。");
  if (task.status === "NOT_STARTED" && notes.length === 0) notes.push("还没有版本或批注记录，建议先明确交付口径。");
  return [...new Set(notes)].slice(0, 3);
}

function trackerTaskHistory(task) {
  if (!task) return [];
  const history = [
    { label: "任务建立", meta: `${task.shotCode} · ${task.label || task.name}` },
    { label: "负责人分配", meta: `${task.assignee} · ${task.assigneeRole || getDept(task.department).name}` },
  ];
  if (task.latestVersion) {
    history.push(
      { label: "版本提交", meta: `${task.latestVersion.version} · ${task.latestVersion.vendor}` },
      { label: vfxReviewStatusLabels[task.latestVersion.status]?.label || "审阅中", meta: `${task.latestVersion.reviewer} · ${task.latestVersion.date || "未填日期"}` },
    );
  } else if (task.progress > 0) {
    history.push({ label: "制作推进", meta: `${Math.round(task.progress * 100)}% · D${task.dueDay}` });
  }
  history.push({ label: trackerStatusLabel(task.status), meta: trackerTaskNextAction(task) });
  return history.slice(-4);
}

function trackerFilteredShots(tracker) {
  const status = trackerUiState.status || "all";
  const assignee = trackerUiState.assignee || "all";
  return tracker.shotRows.filter((shot) => {
    const statusMatch = status === "all" || shot.tasks.some((task) => task.status === status);
    const assigneeMatch = assignee === "all" || shot.tasks.some((task) => task.assignee === assignee);
    return statusMatch && assigneeMatch;
  });
}

function trackerVisibleTasks(tracker) {
  const status = trackerUiState.status || "all";
  const assignee = trackerUiState.assignee || "all";
  const source = trackerUiState.expandedShotCode
    ? tracker.allTasks.filter((task) => task.shotCode === trackerUiState.expandedShotCode)
    : tracker.priorityTasks;
  return source
    .filter((task) => status === "all" || task.status === status)
    .filter((task) => assignee === "all" || task.assignee === assignee)
    .sort((a, b) => {
      const priorityWeight = { CHANGES_REQUESTED: 0, ON_HOLD: 1, PENDING_REVIEW: 2, IN_PROGRESS: 3, NOT_STARTED: 4, APPROVED: 5 };
      return (priorityWeight[a.status] ?? 6) - (priorityWeight[b.status] ?? 6) || b.priority - a.priority || a.sort - b.sort;
    });
}

function trackerAssetTypeLabel(type) {
  return (
    {
      character: "角色",
      prop: "道具 / 器材",
      environment: "场景",
      fx: "FX / 包装",
    }[type] || type || "资产"
  );
}

function trackerAssetRows(tracker) {
  const reviewRows = vfxReviewRows();
  const actorRows = people
    .filter(isActorPerson)
    .slice()
    .sort((a, b) => personTotal(b) - personTotal(a))
    .slice(0, 4)
    .map((person, index) => {
      const relatedTasks = tracker.allTasks.filter((task) => task.department === "cast" || task.shotTitle.includes(person.characterName || person.name));
      const progress = relatedTasks.length > 0 ? averageNumbers(relatedTasks.map((task) => task.progress), activeProgressStats().rate || 0) : Math.min(1, (project.currentDay || 1) / Math.max(project.plannedDays || 1, 1));
      const status = personTotal(person) > 0 && person.days > 0 ? taskStatusFromRate(progress, normalizeTrust(person.trust) < 70 ? "warning" : "ok", false) : "NOT_STARTED";
      return {
        id: `asset-character-${index}-${person.name}`,
        type: "character",
        name: person.characterName || person.name || "未命名角色",
        code: `CHR-${String(index + 1).padStart(2, "0")}`,
        owner: person.name || "未指派",
        ownerMeta: `${personRoleDisplay(person)} · ${person.vendor || "个人 / 自由职业"}`,
        department: "cast",
        status,
        progress,
        amount: personTotal(person),
        versionCount: 0,
        note: `信任 ${normalizeTrust(person.trust)} · ${person.days || 0} 天 · ${money.format(person.dayRate || 0)}/日`,
        target: "personnel",
        focus: "actorBudgetPanel",
      };
    });

  const propRows = equipment
    .slice()
    .sort((a, b) => equipmentTotal(b) - equipmentTotal(a))
    .slice(0, 4)
    .map((item, index) => {
      const progress = Math.min(1, (item.days || 0) / Math.max(project.plannedDays || item.days || 1, 1));
      const trust = normalizeTrust(item.trust);
      const status = taskStatusFromRate(progress, trust < 68 ? "warning" : "ok", false);
      return {
        id: `asset-prop-${index}-${item.name}`,
        type: "prop",
        name: item.name || "未命名器材",
        code: `PRP-${String(index + 1).padStart(2, "0")}`,
        owner: item.vendor || "未登记供应商",
        ownerMeta: `${getDept(item.dept).name} · 信任 ${trust}`,
        department: item.dept,
        status,
        progress,
        amount: equipmentTotal(item),
        versionCount: 0,
        note: `${item.days || 0} 天 · 押金 ${money.format(item.deposit || 0)}`,
        target: "equipment",
        focus: "equipmentTable",
      };
    });

  const environmentRows = scenes
    .slice()
    .sort((a, b) => {
      const riskWeight = { warning: 2, note: 1, ok: 0 };
      return (riskWeight[b.risk] || 0) - (riskWeight[a.risk] || 0) || b.pages - a.pages;
    })
    .slice(0, 4)
    .map((scene, index) => {
      const pipeline = tracker.shotRows.find((shot) => shot.code === scene.code);
      const status = pipeline?.warning > 0 ? "CHANGES_REQUESTED" : pipeline?.pending > 0 ? "PENDING_REVIEW" : pipeline?.progress >= 0.95 ? "APPROVED" : pipeline?.progress > 0 ? "IN_PROGRESS" : "NOT_STARTED";
      return {
        id: `asset-env-${scene.code}`,
        type: "environment",
        name: scene.location || scene.title,
        code: `ENV-${scene.code}`,
        owner: scene.title,
        ownerMeta: `${scene.code} · ${scene.pages} 页 · ${sceneCount(scene.code)} 场`,
        department: "art",
        status,
        progress: pipeline?.progress || 0,
        amount: Math.round((getDept("art").budget || 0) * (scene.pages || 1) / Math.max(project.totalPages || scene.pages || 1, 1)),
        versionCount: pipeline?.tasks.reduce((sum, task) => sum + task.versionCount, 0) || 0,
        note: pipeline?.note || "等待场景管线",
        target: "progress",
        focus: "shotPipelineBoard",
      };
    });

  const fxRows = reviewRows.slice(0, 4).map((row, index) => ({
    id: `asset-fx-${row.id}`,
    type: "fx",
    name: row.shotGroup || `FX ${index + 1}`,
    code: `FX-${String(index + 1).padStart(2, "0")}`,
    owner: row.vendor,
    ownerMeta: `${row.version} · ${row.reviewer}`,
    department: "vfx_color",
    status: taskStatusFromVersion(row) || taskStatusFromRate(row.approvalRate, row.risk === "high" ? "warning" : "ok", row.status !== "approved"),
    progress: row.approvalRate,
    amount: row.amount,
    versionCount: 1,
    note: row.action,
    target: "audit",
    focus: "vfxVersionList",
  }));

  const rows = [...actorRows, ...propRows, ...environmentRows, ...fxRows];
  const typeOrder = { fx: 0, character: 1, environment: 2, prop: 3 };
  return rows.sort((a, b) => {
    const statusWeight = { CHANGES_REQUESTED: 0, ON_HOLD: 1, PENDING_REVIEW: 2, IN_PROGRESS: 3, NOT_STARTED: 4, APPROVED: 5 };
    return (statusWeight[a.status] ?? 6) - (statusWeight[b.status] ?? 6) || (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9) || b.amount - a.amount;
  });
}

function trackerUserRoleFromPerson(person, tracker = null) {
  const roleText = `${person?.role || ""} ${person?.dept || ""}`.toLowerCase();
  if (/制片人|制片主任|producer|production manager|会计|accountant/u.test(roleText)) return "producer";
  if (/导演|监制|review|审阅|vfx|调色|post|后期/u.test(roleText)) return "reviewer";
  if (tracker?.allTasks?.some((task) => task.assignee === person?.name)) return "artist";
  return "artist";
}

function trackerRoleLabel(role) {
  return (
    {
      admin: "Admin",
      producer: "Producer",
      supervisor: "Supervisor",
      artist: "Artist",
      reviewer: "Reviewer",
    }[role] || role || "Artist"
  );
}

function trackerUserRows(tracker) {
  const teamRows = people.map((person, index) => {
    const role = trackerUserRoleFromPerson(person, tracker);
    const tasks = tracker.allTasks.filter((task) => task.assignee === person.name || task.department === person.dept);
    const activeTasks = tasks.filter((task) => task.status !== "APPROVED").length;
    const reviewTasks = tasks.filter((task) => task.status === "PENDING_REVIEW" || task.status === "CHANGES_REQUESTED" || task.status === "ON_HOLD").length;
    const amount = personTotal(person);
    const trust = normalizeTrust(person.trust);
    const tone = reviewTasks > 0 || trust < 68 ? "warning" : activeTasks > 2 ? "note" : "good";
    return {
      id: `user-${index}-${person.name}`,
      name: person.name || "未命名人员",
      role,
      title: personRoleDisplay(person),
      department: person.dept,
      vendor: person.vendor || "个人 / 自由职业",
      email: `${pipelinePathSegment(person.name || `user-${index}`, "user").toLowerCase()}@production.local`,
      tasks: activeTasks,
      reviewTasks,
      amount,
      trust,
      tone,
      target: "personnel",
      focus: "personnelTable",
    };
  });
  return [
    {
      id: "admin-current",
      name: "项目管理员",
      role: "admin",
      title: "系统 / 项目权限",
      department: "production",
      vendor: project.title || "当前项目",
      email: "admin@production.local",
      tasks: tracker.summary.reviewTasks,
      reviewTasks: tracker.summary.heldTasks,
      amount: project.budget || 0,
      trust: 100,
      tone: tracker.summary.heldTasks > 0 ? "warning" : "good",
      target: "overview",
      focus: "pipelineCore",
    },
    ...teamRows,
  ].sort((a, b) => {
    const roleWeight = { admin: 0, producer: 1, reviewer: 2, artist: 3 };
    return (roleWeight[a.role] ?? 9) - (roleWeight[b.role] ?? 9) || b.reviewTasks - a.reviewTasks || b.tasks - a.tasks;
  });
}

function trackerProjectRows(tracker) {
  const metrics = analysisMetrics();
  const progress = activeProgressStats();
  const snapshots = projectLibrary.length > 0 ? projectLibrary : [createProjectSnapshot(currentProjectId, project.title)];
  return snapshots.slice(0, 5).map((snapshot) => {
    const isCurrent = snapshot.id === currentProjectId;
    const data = snapshot.data || {};
    const projectData = data.project || {};
    const snapshotPeople = Array.isArray(data.people) ? data.people : [];
    const snapshotScenes = Array.isArray(data.scenes) ? data.scenes : [];
    const snapshotVersions = normalizeVfxReviewVersions(data.vfxReviewVersions || []);
    const snapshotBudget = Number(projectData.budget) || 0;
    const snapshotProgress = isCurrent ? progress.rate : snapshotScenes.length > 0 ? snapshotScenes.filter((scene) => scene.status === "done").length / Math.max(snapshotScenes.length, 1) : 0;
    const snapshotSpent = isCurrent ? metrics.spent : snapshotPeople.reduce((sum, person) => sum + (Number(person.dayRate) || 0) * Math.min(Number(person.days) || 0, Number(projectData.currentDay) || 1) + Number(person.allowance || 0), 0);
    const riskCount = isCurrent ? tracker.summary.heldTasks + tracker.summary.reviewTasks : snapshotVersions.filter((row) => row.status === "blocked" || row.status === "notes").length;
    const updatedAt = snapshot.updatedAt ? new Date(snapshot.updatedAt) : null;
    const tone = riskCount > 2 || (snapshotBudget > 0 && snapshotSpent / snapshotBudget > snapshotProgress + 0.12) ? "warning" : riskCount > 0 ? "note" : "good";
    return {
      id: snapshot.id,
      name: snapshot.name || projectData.title || "未命名项目",
      code: pipelinePathSegment(projectData.title || snapshot.name || "project", "project").toUpperCase().slice(0, 12),
      budget: snapshotBudget,
      spent: snapshotSpent,
      progress: snapshotProgress,
      shotCount: isCurrent ? tracker.summary.totalShots : snapshotScenes.length,
      assetCount: isCurrent ? tracker.summary.totalAssets : snapshotPeople.length + snapshotVersions.length,
      riskCount,
      updated: updatedAt ? updatedAt.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" }) : "未保存",
      current: isCurrent,
      tone,
    };
  });
}

function trackerProducerActionRows(tracker) {
  const metrics = analysisMetrics();
  const audit = auditSummaryData();
  const flow = fundFlowReadableData(8);
  const today = callSheets.find((sheet) => sheet.day === project.currentDay) || callSheets[callSheets.length - 1] || null;
  const heldVersions = vfxReviewRows().filter((row) => row.paymentGate === "hold" || row.status === "blocked" || row.status === "notes");
  const missingVendorCount = people.filter((person) => !person.vendor || person.vendor === "个人 / 自由职业").length + equipment.filter((item) => !item.vendor || item.vendor === "未登记公司").length;
  const rows = [
    {
      id: "producer-budget-guard",
      name: "Budget Guard",
      label: "预算偏差复核",
      status: metrics.health.className === "warning" ? "CHANGES_REQUESTED" : metrics.health.className === "note" ? "PENDING_REVIEW" : "IN_PROGRESS",
      userRole: "producer",
      assignee: "制片人 / 监制",
      assigneeRole: "Producer",
      dueDay: project.currentDay || 1,
      detail: `${money.format(metrics.spent)} 已用 · 预测 ${money.format(metrics.projectedFinal)}`,
      amount: Math.abs(metrics.variance || 0),
      progress: Math.max(0, Math.min(metrics.progressRate || 0, 1)),
      target: "analysis",
      focus: "analysisReportMetrics",
      priority: metrics.health.className === "warning" ? 2 : 1,
    },
    {
      id: "producer-payment-gate",
      name: "Payment Gate",
      label: "付款关口复核",
      status: audit.highRiskCount > 0 || heldVersions.length > 0 ? "ON_HOLD" : audit.mediumRiskCount > 0 ? "PENDING_REVIEW" : "IN_PROGRESS",
      userRole: "producer",
      assignee: "执行制片 / 制片主任",
      assigneeRole: "Line Producer",
      dueDay: project.currentDay || 1,
      detail: `${audit.highRiskCount} 高风险 · ${heldVersions.length} 个版本暂缓 · ${money.format(audit.reviewedAmount || 0)} 覆盖`,
      amount: audit.reviewedAmount || 0,
      progress: audit.coverage || 0,
      target: "audit",
      focus: "auditTableBody",
      priority: audit.highRiskCount > 0 ? 2 : 1,
    },
    {
      id: "producer-callsheet-lock",
      name: "Call Sheet Lock",
      label: "今日通告锁定",
      status: today ? (today.day <= (project.currentDay || 1) ? "IN_PROGRESS" : "NOT_STARTED") : "NOT_STARTED",
      userRole: "producer",
      assignee: "第一副导演 / 制片",
      assigneeRole: "1st AD + Production",
      dueDay: today?.day || project.currentDay || 1,
      detail: today ? `${today.code} · ${today.title} · ${today.extra.vehicles} 车 / ${today.extra.rooms} 房` : "等待通告单",
      amount: today ? dayTotal(today) : 0,
      progress: today ? Math.min(1, (project.currentDay || 1) / Math.max(today.day || 1, 1)) : 0,
      target: "callsheet",
      focus: "callsheetDetail",
      priority: 1,
    },
    {
      id: "producer-vendor-cleanup",
      name: "Vendor Cleanup",
      label: "公司 / 个人信息补齐",
      status: missingVendorCount > 0 ? "CHANGES_REQUESTED" : "APPROVED",
      userRole: "producer",
      assignee: "制作协管 / 会计",
      assigneeRole: "Production Coordinator",
      dueDay: project.currentDay || 1,
      detail: `${missingVendorCount} 项供应商待补 · 资金流 ${flow.statusLabel}`,
      amount: flow.unclassifiedUsed || 0,
      progress: missingVendorCount > 0 ? 0.35 : 1,
      target: "input",
      focus: "personForm",
      priority: missingVendorCount > 0 ? 1 : 0,
    },
    {
      id: "producer-project-archive",
      name: "Project Archive",
      label: "项目保存与交付包",
      status: projectLibrary.some((item) => item.id === currentProjectId) ? "APPROVED" : "PENDING_REVIEW",
      userRole: "producer",
      assignee: "项目管理员",
      assigneeRole: "Admin",
      dueDay: project.plannedDays || project.currentDay || 1,
      detail: `${projectLibrary.length || 1} 个本地项目 · ${pipelineEvents.length} 个管线事件`,
      amount: project.budget || 0,
      progress: projectLibrary.some((item) => item.id === currentProjectId) ? 1 : 0.5,
      target: "overview",
      focus: "pipelineCore",
      priority: 0,
    },
  ];
  return rows.map((row, index) => ({
    ...row,
    id: `producer-action-${index}-${row.id}`,
    sourceType: "producer-action",
    shotCode: "PROD",
    shotTitle: "项目级制片任务",
      department: "production",
      entityType: "PROJECT",
      versionCount: 0,
      noteCount: row.status === "APPROVED" ? 0 : 1,
      latestVersion: null,
  }));
}

function trackerMyTaskRows(tracker) {
  const role = trackerUiState.role || "all";
  const projectTasks = trackerProducerActionRows(tracker);
  const shotTasks = tracker.allTasks
    .map((task) => {
      const matchedPerson = people.find((person) => person.name === task.assignee || person.dept === task.department);
      const userRole = matchedPerson ? trackerUserRoleFromPerson(matchedPerson, tracker) : task.department === "post" || task.department === "vfx_color" ? "reviewer" : "artist";
      return {
        ...task,
        userRole,
        person: matchedPerson || null,
      };
    });
  return [...projectTasks, ...shotTasks]
    .filter((task) => role === "all" || task.userRole === role)
    .sort((a, b) => {
      const statusWeight = { CHANGES_REQUESTED: 0, ON_HOLD: 1, PENDING_REVIEW: 2, IN_PROGRESS: 3, NOT_STARTED: 4, APPROVED: 5 };
      return (statusWeight[a.status] ?? 6) - (statusWeight[b.status] ?? 6) || a.dueDay - b.dueDay || b.priority - a.priority;
    })
    .slice(0, 9);
}

function trackerReportRows(tracker) {
  const metrics = analysisMetrics();
  const production = productionDashboardData();
  const workload = workHourSummary();
  const audit = auditSummaryData();
  const flow = fundFlowReadableData(8);
  const burndownGap = tracker.summary.actualRemaining - tracker.summary.plannedRemaining;
  return [
    {
      id: "report-overview",
      endpoint: "/api/reports/overview",
      label: "总览报表",
      value: `${tracker.summary.approvedTasks}/${tracker.summary.totalTasks}`,
      detail: `${tracker.summary.totalShots} shots · ${tracker.summary.totalAssets} assets · ${audit.highRiskCount} 高风险`,
      tone: audit.highRiskCount > 0 || tracker.summary.heldTasks > 0 ? "warning" : tracker.summary.reviewTasks > 0 ? "note" : "good",
      target: "analysis",
      focus: "analysisReportMetrics",
    },
    {
      id: "report-burndown",
      endpoint: "/api/reports/burndown",
      label: "燃尽报表",
      value: `${tracker.summary.actualRemaining} 剩余`,
      detail: `计划剩余 ${tracker.summary.plannedRemaining} · 每日需关闭 ${formatProgressNumber(tracker.summary.dailyCloseNeeded)}`,
      tone: burndownGap > 4 ? "warning" : burndownGap > 0 ? "note" : "good",
      target: "overview",
      focus: "trackingWorkloadPanel",
    },
    {
      id: "report-workload",
      endpoint: "/api/reports/workload",
      label: "工作量报表",
      value: `${formatProgressNumber(workload.totalHours)}h`,
      detail: `${workload.personCount} 人 · ${workload.overtimeCount} 次加班 · 峰值 D${workload.peakDay?.day || "--"}`,
      tone: workload.overtimeCount > 0 ? "note" : "good",
      target: "progress",
      focus: "workHourDashboard",
    },
    {
      id: "report-finance",
      endpoint: "/api/reports/finance",
      label: "财务报表",
      value: money.format(metrics.spent),
      detail: `预测 ${money.format(metrics.projectedFinal)} · ${flow.statusLabel}`,
      tone: metrics.health.className,
      target: "fundflow",
      focus: "fundFlowLargeChart",
    },
    {
      id: "report-schedule",
      endpoint: "/api/reports/schedule",
      label: "排期报表",
      value: `${production.schedule.length} 阶段`,
      detail: `${production.delayed} 延期 · ${production.tight} 偏紧 · 剩余 ${production.remainingDays} 天`,
      tone: production.delayed > 0 ? "warning" : production.tight > 0 ? "note" : "good",
      target: "progress",
      focus: "productionScheduleBoard",
    },
  ];
}

function trackerPrdSuiteData(tracker) {
  const userRows = trackerUserRows(tracker);
  return {
    projectRows: trackerProjectRows(tracker),
    myTaskRows: trackerMyTaskRows(tracker),
    userRows,
    roleCounts: userRows.reduce((result, row) => {
      result[row.role] = (result[row.role] || 0) + 1;
      return result;
    }, {}),
    reportRows: trackerReportRows(tracker),
  };
}

function trackerPrdStatusRows(tracker) {
  const reportRows = trackerReportRows(tracker);
  const versionsWithMedia = vfxReviewRows().filter((row) => row.media?.fileName).length;
  const notesCount = vfxReviewRows().filter((row) => row.notes).length;
  const apiConceptCount = reportRows.length;
  const rows = [
    { key: "shot-grid", label: "ShotGrid", value: tracker.summary.totalShots, target: Math.max(5, tracker.summary.totalShots), detail: "镜头 / 任务矩阵、筛选、展开任务", stage: "demo", tone: tracker.summary.totalShots > 0 ? "good" : "note" },
    { key: "tasks", label: "任务详情", value: tracker.summary.totalTasks, target: Math.max(12, tracker.summary.totalTasks), detail: "状态、负责人、批注、下一步动作", stage: "demo", tone: tracker.summary.totalTasks > 0 ? "good" : "note" },
    { key: "versions", label: "版本审阅", value: tracker.summary.versionCount, target: Math.max(4, tracker.summary.versionCount), detail: "版本提交、通过率、付款关口", stage: "demo", tone: tracker.summary.versionCount > 0 ? "good" : "note" },
    { key: "media", label: "上传/播放器", value: versionsWithMedia, target: Math.max(3, tracker.summary.versionCount), detail: "当前保存文件信息，小图可预览；正式上传待后端", stage: "partial", tone: versionsWithMedia > 0 ? "note" : "warning" },
    { key: "notes", label: "NoteThread", value: notesCount, target: Math.max(3, tracker.summary.versionCount), detail: "批注可写入版本记录，暂未做账号归属", stage: "demo", tone: notesCount > 0 ? "good" : "note" },
    { key: "reports", label: "Reports API", value: apiConceptCount, target: 5, detail: "报表端点概念已映射，真实 API 待 Next.js", stage: "concept", tone: "note" },
    { key: "auth-db", label: "登录 / 数据库", value: 0, target: 4, detail: "NextAuth、Prisma、PostgreSQL、权限保护尚未工程化", stage: "todo", tone: "warning" },
  ];
  const weighted = rows.map((row) => ({ ...row, rate: Math.max(0, Math.min((Number(row.value) || 0) / Math.max(Number(row.target) || 1, 1), 1)) }));
  const score = weighted.reduce((sum, row) => sum + row.rate, 0) / Math.max(weighted.length, 1);
  return {
    rows: weighted,
    score,
    readyCount: weighted.filter((row) => row.rate >= 0.95 && row.stage === "demo").length,
    blockedCount: weighted.filter((row) => row.stage === "todo" || row.tone === "warning").length,
  };
}

function renderTrackerPrdStatus(tracker) {
  const node = document.querySelector("#trackingPrdStatus");
  if (!node) return;
  const data = trackerPrdStatusRows(tracker);
  node.innerHTML = `
    <div class="tracking-prd-status-head">
      <div>
        <span>PRD Progress</span>
        <strong>静态原型完成度 ${percentText(data.score)}</strong>
      </div>
      <p>当前页面已完成可演示闭环；正式 PRD 仍需要 Next.js、Prisma、登录、真实 API 和文件存储。</p>
      <em>${data.readyCount} 项可演示 · ${data.blockedCount} 项待工程化</em>
    </div>
    <div class="tracking-prd-status-grid">
      ${data.rows
        .map(
          (row) => `
            <button class="tracking-prd-status-card ${row.tone}" type="button" data-context-kind="prd-status" data-context-title="${escapeHtml(row.label)}" data-context-meta="${escapeHtml(row.detail)}" data-workspace-view="${row.key === "versions" || row.key === "media" ? "audit" : "overview"}" data-workspace-focus="${row.key === "versions" || row.key === "media" ? "vfxVersionList" : row.key === "reports" ? "trackingReportBoard" : "productionTrackingConsole"}">
              <span>${escapeHtml(row.stage)}</span>
              <strong>${escapeHtml(row.label)}</strong>
              <i><b style="width:${Math.round(row.rate * 100)}%"></b></i>
              <small>${escapeHtml(row.detail)}</small>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function trackerTaskStatusPatch(status) {
  if (status === "APPROVED") return { status: "approved", paymentGate: "milestone" };
  if (status === "CHANGES_REQUESTED") return { status: "notes", paymentGate: "hold" };
  if (status === "ON_HOLD") return { status: "blocked", paymentGate: "hold" };
  if (status === "PENDING_REVIEW") return { status: "submitted" };
  return null;
}

function trackerUpdateTaskStatus(taskId, status) {
  const tracker = productionTrackerWorkflowData();
  const task = tracker.allTasks.find((row) => row.id === taskId);
  if (!task) return false;
  if (task.latestVersion?.id) {
    const patch = trackerTaskStatusPatch(status);
    if (!patch) return false;
    if (status === "APPROVED") patch.approvedCount = task.latestVersion.shotCount;
    updateVfxReviewById(task.latestVersion.id, patch);
    saveData();
    refreshAll();
    setFormStatus(`任务状态已更新：${task.shotCode} · ${task.name} · ${trackerStatusLabel(status)}`, status === "APPROVED" ? "good" : status === "ON_HOLD" || status === "CHANGES_REQUESTED" ? "warning" : "note");
    return true;
  }
  setFormStatus("这个任务还没有可更新的版本记录。先在审查队列里提交版本。", "warning");
  return false;
}

function trackerAddNote(taskId, content) {
  const note = String(content || "").trim();
  if (!note) {
    setFormStatus("请先填写批注内容", "warning");
    return false;
  }
  const tracker = productionTrackerWorkflowData();
  const task = tracker.allTasks.find((row) => row.id === taskId);
  if (!task?.latestVersion?.id) {
    setFormStatus("这个任务还没有版本，暂时不能写入批注。", "warning");
    return false;
  }
  const row = normalizeVfxReviewVersions(vfxReviewVersions).find((item) => item.id === task.latestVersion.id);
  if (!row) return false;
  const stamp = `${reportDateLabel()} ${task.assignee}`;
  const nextNotes = [row.notes, `[${stamp}] ${note}`].filter(Boolean).join("\n");
  updateVfxReviewById(row.id, { notes: nextNotes, status: row.status === "approved" ? "notes" : row.status });
  saveData();
  refreshAll();
  setFormStatus(`批注已加入：${task.shotCode} · ${task.name}`, "good");
  return true;
}

function trackerDefaultVendorForTask(task) {
  const department = task?.department || "vfx_color";
  const departmentName = getDept(department).name;
  const vendor =
    people.find((person) => person.dept === department && person.vendor && person.vendor !== "个人 / 自由职业")?.vendor ||
    equipment.find((item) => item.dept === department && item.vendor && item.vendor !== "未登记公司")?.vendor ||
    vfxSupplierAuditRows()[0]?.vendor ||
    task?.assignee ||
    departmentName;
  return vendor || "未登记供应商";
}

function trackerNextVersionLabel(task) {
  const current = Math.max(0, Number(task?.versionCount) || 0) + 1;
  return `v${String(current).padStart(3, "0")}`;
}

function trackerSubmitTaskVersion(taskId, formNode) {
  const tracker = productionTrackerWorkflowData();
  const task = tracker.allTasks.find((row) => row.id === taskId);
  if (!task) return false;
  const form = formNode || document.querySelector(`[data-tracker-version-form="${CSS.escape(taskId)}"]`);
  const vendor = form?.elements?.vendor?.value?.trim() || trackerDefaultVendorForTask(task);
  const version = form?.elements?.version?.value?.trim() || trackerNextVersionLabel(task);
  const notes = form?.elements?.notes?.value?.trim() || "从任务详情提交的新版本，等待审阅。";
  const existing = vfxReviewRows().find((row) => row.shotGroup.includes(task.shotCode) && row.version === version && row.vendor === vendor);
  const nextRow = {
    id: existing?.id || `vfx-review-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    vendor,
    shotGroup: `${task.shotCode} ${task.shotTitle || task.name}`,
    version,
    status: "submitted",
    shotCount: Math.max(1, sceneCount(task.shotCode) || 1),
    approvedCount: 0,
    date: reportDateLabel(),
    reviewer: "监制 / Reviewer",
    paymentGate: "hold",
    notes,
    media: null,
  };
  if (existing?.media) nextRow.media = existing.media;
  const existingIndex = vfxReviewVersions.findIndex((item) => item.id === nextRow.id);
  if (existingIndex >= 0) vfxReviewVersions[existingIndex] = nextRow;
  else vfxReviewVersions.push(nextRow);
  vfxReviewVersions = normalizeVfxReviewVersions(vfxReviewVersions);
  selectedInspectorTarget = { kind: "tracker-task", trackerTaskId: taskId, title: `${task.shotCode} · ${task.name}`, meta: `${trackerStatusLabel("PENDING_REVIEW")} · ${task.assignee}` };
  saveData();
  refreshAll();
  setFormStatus(`版本已提交：${nextRow.shotGroup} · ${nextRow.version}`, "good");
  return true;
}

function trackerTaskDetailTarget(tracker) {
  const producerActions = trackerProducerActionRows(tracker);
  if (selectedInspectorTarget?.trackerTaskId) {
    const matchedById = [...tracker.allTasks, ...producerActions].find((task) => task.id === selectedInspectorTarget.trackerTaskId);
    if (matchedById) return matchedById;
  }
  const selectedTaskId = selectedInspectorTarget?.kind === "tracker-task" ? selectedInspectorTarget.facts?.find((item) => item.label === "任务") : null;
  if (selectedInspectorTarget?.kind === "tracker-task") {
    const titleParts = String(selectedInspectorTarget.title || "").split("·").map((item) => item.trim());
    const matchedProducerAction = producerActions.find((task) => selectedInspectorTarget.trackerTaskId === task.id || selectedInspectorTarget.title?.includes(task.name));
    if (matchedProducerAction) return matchedProducerAction;
    const matchedByTitle = tracker.allTasks.find((task) => task.shotCode === titleParts[0] && task.name === titleParts.slice(1).join(" · "));
    if (matchedByTitle) return matchedByTitle;
    const matchedByFact = tracker.allTasks.find((task) => task.name === selectedTaskId?.value && selectedInspectorTarget.title?.includes(task.shotCode));
    if (matchedByFact) return matchedByFact;
  }
  return tracker.priorityTasks[0] || tracker.allTasks.find((task) => task.status !== "APPROVED") || tracker.allTasks[0] || null;
}

function renderTrackerTaskDetailPanel() {
  const detail = document.querySelector("#trackingTaskDetail");
  if (!detail) return;
  const tracker = productionTrackerWorkflowData();
  detail.innerHTML = renderTrackerTaskDetail(trackerTaskDetailTarget(tracker), tracker);
}

function renderTrackerTaskDetail(task, tracker) {
  if (!task) return `<div class="producer-empty">暂无任务详情。录入场次、VFX 版本或排期后会显示。</div>`;
  const isProducerAction = task.sourceType === "producer-action";
  const statusClass = trackerStatusClass(task.status);
  const statusLabel = trackerStatusLabel(task.status);
  const version = task.latestVersion || null;
  const notes = trackerTaskNotes(task);
  const history = trackerTaskHistory(task);
  const shot = tracker.shotRows.find((row) => row.code === task.shotCode);
  const versionStatus = version ? vfxReviewStatusLabels[version.status]?.label || "待审" : "暂无版本";
  const payment = version ? vfxPaymentGateLabels[version.paymentGate] || "付款关口未定" : "等待提交";
  const approval = version ? `${version.approvedCount}/${version.shotCount} · ${percentText(version.approvalRate)}` : `${Math.round((task.progress || 0) * 100)}%`;
  const frameStart = shot?.frameStart || 1001;
  const frameEnd = shot?.frameEnd || frameStart + 99;
  const media = version?.media || null;
  const mediaLabel = media ? `${media.fileName} · ${formatFileSize(media.fileSize)}` : "暂无媒体文件";
  const mediaPreview = media?.previewUrl
    ? `<img src="${escapeHtml(media.previewUrl)}" alt="${escapeHtml(media.fileName)}" />`
    : `<strong>${escapeHtml(isProducerAction ? "PROJECT" : version ? version.version : "No Version")}</strong>`;
  return `
    <div class="tracking-detail-identity">
      <span class="tracker-status ${statusClass}">${escapeHtml(statusLabel)}</span>
      <strong>${escapeHtml(task.shotCode)} · ${escapeHtml(task.name)}</strong>
      <small>${escapeHtml(task.shotTitle)} · ${escapeHtml(getDept(task.department).name)} · D${task.dueDay}</small>
      <div class="tracking-status-actions" aria-label="任务状态操作">
        ${
          isProducerAction
            ? `<button type="button" data-workspace-view="${escapeHtml(task.target || "analysis")}" data-workspace-focus="${escapeHtml(task.focus || "")}">打开处理入口</button>`
            : ["PENDING_REVIEW", "APPROVED", "CHANGES_REQUESTED", "ON_HOLD"]
                .map((status) => `<button type="button" data-tracker-status-action="${escapeHtml(status)}" data-tracker-task-id="${escapeHtml(task.id)}">${escapeHtml(trackerStatusLabel(status))}</button>`)
                .join("")
        }
      </div>
    </div>
    <div class="tracking-detail-progress" aria-label="任务进度">
      <span><b style="width:${Math.round(Math.max(0.04, Math.min(task.progress || 0, 1)) * 100)}%"></b></span>
      <em>${Math.round((task.progress || 0) * 100)}%</em>
      <div class="tracking-version-player" data-context-kind="tracker-task" data-context-title="${escapeHtml(`${task.shotCode} · ${task.name}`)}" data-context-meta="${escapeHtml(version ? `${version.version} · ${version.vendor}` : "暂无版本")}" data-tracker-task-id="${escapeHtml(task.id)}">
        <div class="tracking-version-frame ${media?.previewUrl ? "has-preview" : ""}">
          <span>${escapeHtml(task.label || "Task")}</span>
          ${mediaPreview}
        </div>
        <small>${escapeHtml(isProducerAction ? task.detail || "项目级制片任务" : `Frame ${frameStart}-${frameEnd} · ${version ? versionStatus : "等待提交"}`)}</small>
        ${!isProducerAction ? `<small>${escapeHtml(mediaLabel)}</small>` : ""}
      </div>
    </div>
    <div class="tracking-detail-grid">
      <section>
        <span>负责人</span>
        <strong>${escapeHtml(task.assignee)}</strong>
        <small>${escapeHtml(task.assigneeRole || "未登记岗位")}</small>
      </section>
      <section>
        <span>${isProducerAction ? "涉及金额" : "版本"}</span>
        <strong>${escapeHtml(isProducerAction ? money.format(task.amount || 0) : version ? version.version : `${task.versionCount} version`)}</strong>
        <small>${escapeHtml(isProducerAction ? task.detail || "项目级处理项" : version ? `${version.vendor} · ${versionStatus}` : "等待上传版本")}</small>
      </section>
      <section>
        <span>${isProducerAction ? "完成度" : "验收"}</span>
        <strong>${escapeHtml(isProducerAction ? percentText(task.progress || 0) : approval)}</strong>
        <small>${escapeHtml(isProducerAction ? statusLabel : payment)}</small>
      </section>
      <section>
        <span>${isProducerAction ? "任务范围" : "镜头范围"}</span>
        <strong>${escapeHtml(shot ? `${shot.frameStart}-${shot.frameEnd}` : task.entityType || "PROJECT")}</strong>
        <small>${escapeHtml(shot ? `${shot.tasks.length} 项任务 · ${shot.note}` : isProducerAction ? "Project Task" : "Shot Task")}</small>
      </section>
    </div>
    <div class="tracking-detail-notes">
      <div>
        <span>Review Notes</span>
        <strong>${task.noteCount} 条批注</strong>
      </div>
      <div class="tracking-note-thread">
        ${notes.length > 0 ? notes.map((note) => `<p>${escapeHtml(note)}</p>`).join("") : `<p>暂无批注。可在审查队列里补充版本备注。</p>`}
      </div>
      <label class="tracking-note-input">
        <span>新增批注</span>
        <textarea rows="2" placeholder="写给供应商、艺术家或审阅人的批注" data-tracker-note-input="${escapeHtml(task.id)}"></textarea>
      </label>
      ${isProducerAction ? `<button class="tracking-note-submit" type="button" data-workspace-view="${escapeHtml(task.target || "analysis")}" data-workspace-focus="${escapeHtml(task.focus || "")}">进入处理</button>` : `<button class="tracking-note-submit" type="button" data-tracker-note-submit="${escapeHtml(task.id)}">保存批注</button>`}
      ${
        isProducerAction
          ? ""
          : `<form class="tracking-version-submit" data-tracker-version-form="${escapeHtml(task.id)}">
              <div>
                <label><span>供应商</span><input name="vendor" type="text" value="${escapeHtml(version?.vendor || trackerDefaultVendorForTask(task))}" /></label>
                <label><span>版本号</span><input name="version" type="text" value="${escapeHtml(trackerNextVersionLabel(task))}" /></label>
              </div>
              <label><span>提交说明</span><input name="notes" type="text" value="${escapeHtml(version ? `基于 ${version.version} 提交下一版。` : "首次提交版本，等待审阅。")}" /></label>
              <button type="submit" data-tracker-version-submit="${escapeHtml(task.id)}">${version ? "提交下一版" : "提交版本"}</button>
            </form>`
      }
    </div>
    <div class="tracking-detail-action">
      <span>Next Action</span>
      <strong>${escapeHtml(trackerTaskNextAction(task))}</strong>
      <div class="tracking-history-list">
        ${history.map((item) => `<p><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.meta)}</small></p>`).join("")}
      </div>
      <div>
        <button type="button" data-workspace-view="${escapeHtml(isProducerAction ? task.target || "analysis" : task.status === "PENDING_REVIEW" || task.status === "CHANGES_REQUESTED" ? "audit" : "progress")}" data-workspace-focus="${escapeHtml(isProducerAction ? task.focus || "" : task.status === "PENDING_REVIEW" || task.status === "CHANGES_REQUESTED" ? "vfxVersionList" : "productionScheduleBoard")}">打开关联视图</button>
        <button type="button" data-context-kind="tracker-task" data-context-title="${escapeHtml(`${task.shotCode} · ${task.name}`)}" data-context-meta="${escapeHtml(`${statusLabel} · ${task.assignee}`)}" data-tracker-task-id="${escapeHtml(task.id)}">选中任务</button>
      </div>
    </div>
  `;
}

function shotTaskRowsForScene(scene, pipelineRow, versionMap, scheduleMap) {
  const taskTemplates = [
    { key: "shoot", name: "Shooting", label: "拍摄", department: "directing", ownerFallback: "导演组" },
    { key: "dit", name: "Ingest / DIT", label: "素材", department: "dit", ownerFallback: "DIT组" },
    { key: "edit", name: "Editorial", label: "剪辑", department: "post_edit", ownerFallback: "剪辑组" },
    { key: "vfx", name: "VFX / Color", label: "VFX", department: "vfx_color", ownerFallback: "调色/VFX组" },
    { key: "review", name: "Review", label: "审查", department: "post", ownerFallback: "后期统筹组" },
    { key: "delivery", name: "Delivery", label: "交付", department: "post", ownerFallback: "制片 / 后期" },
  ];
  return taskTemplates.map((template, index) => {
    const stepState = pipelineRow?.steps?.[template.key] || "todo";
    const relatedSchedule = scheduleMap.get(template.department);
    const relatedVersions = template.key === "vfx" || template.key === "review" ? versionMap.get(scene.code) || [] : [];
    const latestVersion = relatedVersions[0] || null;
    const stepRate = stepState === "done" ? 1 : stepState === "current" ? 0.55 : stepState === "issue" ? 0.28 : 0;
    const versionRate = latestVersion ? latestVersion.approvalRate : 0;
    const rate = latestVersion && (template.key === "vfx" || template.key === "review") ? Math.max(stepRate, versionRate) : stepRate;
    const versionStatus = template.key === "vfx" || template.key === "review" ? taskStatusFromVersion(latestVersion) : "";
    const status = versionStatus || taskStatusFromRate(rate, stepState === "issue" ? "warning" : "ok", template.key === "review" && latestVersion && latestVersion.status !== "approved");
    const ownerPerson = people.find((person) => person.dept === template.department);
    const dueDay = relatedSchedule?.end || pipelineRow?.shootDay || project.currentDay || 1;
    return {
      id: `task-${scene.code}-${template.key}`,
      entityType: "SHOT",
      sceneCode: scene.code,
      name: template.name,
      label: template.label,
      department: template.department,
      status,
      priority: stepState === "issue" ? 2 : latestVersion?.risk === "medium" ? 1 : 0,
      dueDay,
      assignee: ownerPerson ? ownerPerson.name : relatedSchedule?.owner || template.ownerFallback,
      assigneeRole: ownerPerson ? personRoleDisplay(ownerPerson) : template.ownerFallback,
      progress: rate,
      versionCount: relatedVersions.length,
      latestVersion,
      noteCount: latestVersion ? (latestVersion.notes ? 1 : 0) + (latestVersion.risk !== "ok" ? 1 : 0) : stepState === "issue" ? 1 : 0,
      sort: index,
    };
  });
}

function productionTrackerWorkflowData() {
  const pipelineRows = scenePipelineRows();
  const scheduleRows = productionScheduleRows();
  const work = workHourSummary();
  const versions = vfxReviewRows();
  const scheduleMap = new Map(scheduleRows.map((row) => [row.id.replace(/^dept-/u, ""), row]));
  const versionMap = versions.reduce((map, row) => {
    const matched = scenes.filter((scene) => row.shotGroup.includes(scene.code) || row.shotGroup.includes(scene.title));
    const targets = matched.length > 0 ? matched : scenes.filter((scene) => `${scene.code} ${scene.title}`.includes(String(row.shotGroup || "").split(/\s+/u)[0] || ""));
    (targets.length > 0 ? targets : [null]).forEach((scene) => {
      const key = scene?.code || row.shotGroup;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    return map;
  }, new Map());
  versionMap.forEach((rows) => rows.sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))));

  const shotRows = scenes.map((scene) => {
    const pipelineRow = pipelineRows.find((row) => row.code === scene.code) || null;
    const tasks = shotTaskRowsForScene(scene, pipelineRow, versionMap, scheduleMap);
    const statusCounts = tasks.reduce((result, task) => {
      result[task.status] = (result[task.status] || 0) + 1;
      return result;
    }, {});
    const complete = tasks.filter((task) => task.status === "APPROVED").length;
    const warning = tasks.filter((task) => task.status === "CHANGES_REQUESTED" || task.status === "ON_HOLD").length;
    const pending = tasks.filter((task) => task.status === "PENDING_REVIEW").length;
    const progress = tasks.reduce((sum, task) => sum + task.progress, 0) / Math.max(tasks.length, 1);
    const assignees = Array.from(new Set(tasks.map((task) => task.assignee).filter(Boolean))).slice(0, 4);
    const dueDay = Math.max(...tasks.map((task) => task.dueDay || 1), pipelineRow?.shootDay || 1);
    const tone = warning > 0 ? "warning" : pending > 0 || progress < 0.68 ? "note" : "good";
    return {
      id: `shot-${scene.code}`,
      code: scene.code,
      title: scene.title,
      location: scene.location,
      frameStart: 1001,
      frameEnd: 1000 + sceneCount(scene.code) * 100,
      pages: scene.pages,
      statusCounts,
      tasks,
      progress,
      complete,
      warning,
      pending,
      assignees,
      dueDay,
      tone,
      needsVfx: Boolean(pipelineRow?.needsVfx),
      note: pipelineRow?.note || "等待管线状态",
    };
  });

  const allTasks = shotRows.flatMap((shot) => shot.tasks.map((task) => ({ ...task, shotCode: shot.code, shotTitle: shot.title, shotTone: shot.tone })));
  const priorityTasks = allTasks
    .filter((task) => task.status !== "APPROVED")
    .sort((a, b) => {
      const priorityWeight = { CHANGES_REQUESTED: 0, ON_HOLD: 1, PENDING_REVIEW: 2, IN_PROGRESS: 3, NOT_STARTED: 4, APPROVED: 5 };
      return (priorityWeight[a.status] ?? 6) - (priorityWeight[b.status] ?? 6) || b.priority - a.priority || a.dueDay - b.dueDay;
    })
    .slice(0, 8);
  const totalTasks = allTasks.length;
  const approvedTasks = allTasks.filter((task) => task.status === "APPROVED").length;
  const reviewTasks = allTasks.filter((task) => task.status === "PENDING_REVIEW" || task.status === "CHANGES_REQUESTED").length;
  const heldTasks = allTasks.filter((task) => task.status === "ON_HOLD").length;
  const remainingTasks = Math.max(0, totalTasks - approvedTasks);
  const daysLeft = Math.max(1, (project.plannedDays || 1) - (project.currentDay || 1) + 1);
  const dailyCloseNeeded = remainingTasks / daysLeft;
  const plannedRemaining = Math.max(0, Math.round(totalTasks * (1 - Math.min(1, (project.currentDay || 1) / Math.max(project.plannedDays || 1, 1)))));
  const actualRemaining = remainingTasks;
  const workloadRows = work.topPeople.slice(0, 6).map((row) => {
    const trackerTaskCount = allTasks.filter((task) => task.assignee === row.name || task.assigneeRole === row.role || task.department === row.dept).length;
    const scheduleTaskCount = scheduleRows.filter((task) => task.owner.includes(row.name) || getDept(row.dept).name === task.title).length;
    const workLogTaskCount = new Set(work.rows.filter((item) => item.personKey === row.personKey).map((item) => item.task)).size;
    const activeTasks = trackerTaskCount + scheduleTaskCount + workLogTaskCount;
    return {
      ...row,
      activeTasks,
      tone: row.overtime > 0 || activeTasks > 5 ? "warning" : activeTasks > 2 ? "note" : "good",
    };
  });
  const trackerBase = { shotRows, allTasks, priorityTasks, workloadRows };
  const assetRows = trackerAssetRows(trackerBase);
  const assetReviewCount = assetRows.filter((asset) => asset.status === "PENDING_REVIEW" || asset.status === "CHANGES_REQUESTED" || asset.status === "ON_HOLD").length;

  return {
    shotRows,
    allTasks,
    priorityTasks,
    workloadRows,
    assetRows,
    summary: {
      totalShots: shotRows.length,
      totalTasks,
      approvedTasks,
      reviewTasks,
      heldTasks,
      totalAssets: assetRows.length,
      assetReviewCount,
      versionCount: versions.length,
      noteCount: versions.reduce((sum, row) => sum + (row.notes ? 1 : 0), 0),
      completionRate: totalTasks > 0 ? approvedTasks / totalTasks : 0,
      dailyCloseNeeded,
      plannedRemaining,
      actualRemaining,
    },
  };
}

const trackingV2PipelineSteps = [
  { key: "LAY", label: "LAY", color: "#EF9F27" },
  { key: "ANM", label: "ANM", color: "#378ADD" },
  { key: "CFX", label: "CFX", color: "#17D4E0" },
  { key: "FX", label: "FX", color: "#639922" },
  { key: "LGT", label: "LGT", color: "#F9CB42" },
  { key: "CMP", label: "CMP", color: "#7F77DD" },
];

const trackingV2AssetSteps = [
  { key: "ART", label: "art", color: "#D85A30" },
  { key: "MDL", label: "mdl", color: "#E24B4A" },
  { key: "RIG", label: "rig", color: "#D4537E" },
  { key: "TXT", label: "txt", color: "#EF9F27" },
  { key: "CFX", label: "cfx", color: "#17D4E0" },
];

function trackingV2StatusLabel(status) {
  return (
    {
      WAITING_TO_START: "Waiting",
      READY_TO_START: "Ready",
      NOT_STARTED: "Waiting",
      IN_PROGRESS: "In Progress",
      PENDING_REVIEW: "Pending Review",
      CHANGES_REQUESTED: "Changes",
      APPROVED: "Approved",
      FINAL: "Final",
      ON_HOLD: "On Hold",
      OMIT: "Omit",
    }[status] || status || "Waiting"
  );
}

function trackingV2StatusClass(status) {
  return (
    {
      WAITING_TO_START: "waiting",
      READY_TO_START: "ready",
      NOT_STARTED: "waiting",
      IN_PROGRESS: "in-progress",
      PENDING_REVIEW: "pending",
      CHANGES_REQUESTED: "changes",
      APPROVED: "final",
      FINAL: "final",
      ON_HOLD: "hold",
      OMIT: "omit",
    }[status] || "waiting"
  );
}

function trackingV2TaskStatus(status) {
  if (status === "APPROVED") return "FINAL";
  if (status === "CHANGES_REQUESTED") return "ON_HOLD";
  if (status === "NOT_STARTED") return "WAITING_TO_START";
  return status || "WAITING_TO_START";
}

function trackingV2StatusDot(status, label = "") {
  const normalized = trackingV2TaskStatus(status);
  return `<span class="v2-status-dot ${trackingV2StatusClass(normalized)}" title="${escapeHtml(label || trackingV2StatusLabel(normalized))}"></span>`;
}

function trackingV2SequenceCode(sceneCode, index = 0) {
  if (/^RAID|^TRU|^SEQ/i.test(String(sceneCode || ""))) return String(sceneCode).split(/[_\-\s]/u)[0].toUpperCase();
  if (index < 4) return "RAID";
  if (index < 8) return "TRU";
  return "MAIN";
}

function trackingV2ShotCode(sceneCode, index = 0) {
  const sequence = trackingV2SequenceCode(sceneCode, index);
  return `${sequence}_${String((index + 1) * 10).padStart(4, "0")}`;
}

function trackingV2StepStatus(shot, stepKey) {
  const stepMap = {
    LAY: ["Shooting"],
    ANM: ["Editorial"],
    CFX: ["Ingest / DIT"],
    FX: ["VFX / Color"],
    LGT: ["Delivery"],
    CMP: ["Review"],
  };
  const task = shot.tasks.find((row) => stepMap[stepKey]?.includes(row.name));
  return task ? trackingV2TaskStatus(task.status) : "WAITING_TO_START";
}

function trackingV2ProgressStatus(progress, offset = 0) {
  const rate = Math.max(0, Math.min(1, Number(progress) || 0));
  const adjusted = Math.max(0, Math.min(1, rate - offset));
  if (adjusted >= 0.92) return "FINAL";
  if (adjusted >= 0.64) return "IN_PROGRESS";
  if (adjusted >= 0.38) return "READY_TO_START";
  if (adjusted > 0.08) return "IN_PROGRESS";
  return "WAITING_TO_START";
}

function trackingV2ProjectCards(tracker) {
  const rows = trackerProjectRows(tracker);
  const usedNames = new Set(rows.map((row) => row.name));
  const demoCards = [
    { id: "v2-mkali", name: "Mkali's Mission", code: "MKALI", progress: 0.62, shotCount: 9, assetCount: 58, tone: "note", template: true },
    { id: "v2-drednots", name: "Drednots", code: "DREDNOTS", progress: 0.41, shotCount: 32, assetCount: 74, tone: "good", template: true },
    { id: "v2-winter", name: "Winter Joy Ride", code: "WJR", progress: 0.78, shotCount: 24, assetCount: 36, tone: "good", template: true },
  ].filter((row) => !usedNames.has(row.name));
  return [...rows, ...demoCards].slice(0, 6);
}

function trackingV2VisibleProjectCards(cards) {
  const query = String(trackerUiState.v2ProjectQuery || "").trim().toLowerCase();
  const filtered = (Array.isArray(cards) ? cards : []).filter((card) => {
    if (!query) return true;
    return `${card.name || ""} ${card.code || ""} ${card.status || ""}`.toLowerCase().includes(query);
  });
  const sorted = filtered.slice().sort((a, b) => {
    if (trackerUiState.v2ProjectSort === "name") return String(a.name || "").localeCompare(String(b.name || ""));
    if (trackerUiState.v2ProjectSort === "progress") return (Number(b.progress) || 0) - (Number(a.progress) || 0);
    if (trackerUiState.v2ProjectSort === "shots") return (Number(b.shotCount) || 0) - (Number(a.shotCount) || 0);
    const toneWeight = { warning: 0, note: 1, good: 2 };
    return (toneWeight[a.tone] ?? 1) - (toneWeight[b.tone] ?? 1) || String(a.name || "").localeCompare(String(b.name || ""));
  });
  return sorted;
}

function trackingV2ProjectStatusLabel(card) {
  if (card.tone === "warning") return "Needs review";
  if (card.tone === "note") return "Watch";
  return "Active";
}

function trackingV2ProjectCode(card, index = 0) {
  const raw = String(card?.code || "").trim();
  if (raw && raw !== card?.name) return raw;
  return pipelinePathSegment(card?.name || `project-${index + 1}`, `project-${index + 1}`).slice(0, 10).toUpperCase();
}

function trackingV2ProjectViewMarkup(cards) {
  const view = trackerUiState.v2ProjectView || "grid";
  if (cards.length === 0) return `<div class="v2-empty-mini">No matching projects</div>`;
  if (view === "table") {
    return `
      <div class="v2-project-table">
        <div class="v2-project-table-head"><span>Code</span><span>Project</span><span>Status</span><span>Shots</span><span>Assets</span><span>Progress</span></div>
        ${cards
          .map(
            (card, index) => `
              <button class="v2-project-row ${card.tone || "good"}" type="button" data-context-kind="tracker-project" data-context-title="${escapeHtml(card.name)}" data-context-meta="${escapeHtml(`${card.code} · ${card.shotCount} shots · ${card.assetCount} assets`)}">
                <b>${escapeHtml(trackingV2ProjectCode(card, index))}</b>
                <strong>${escapeHtml(card.name)}<small>${escapeHtml(card.template ? "Template / demo project" : "Current local project")}</small></strong>
                <span>${escapeHtml(trackingV2ProjectStatusLabel(card))}</span>
                <span>${card.shotCount || 0}</span>
                <span>${card.assetCount || 0}</span>
                <em><i style="width:${Math.round(Math.max(0.02, Math.min(card.progress || 0, 1)) * 100)}%"></i>${percentText(card.progress || 0)}</em>
              </button>
            `,
          )
          .join("")}
      </div>
    `;
  }
  if (view === "list") {
    return `
      <div class="v2-project-list">
        ${cards
          .map(
            (card, index) => `
              <button class="v2-project-list-row ${card.tone || "good"}" type="button" data-context-kind="tracker-project" data-context-title="${escapeHtml(card.name)}" data-context-meta="${escapeHtml(`${trackingV2ProjectCode(card, index)} · ${card.shotCount} shots · ${card.assetCount} assets`)}">
                <span class="v2-project-thumb">${card.template ? "Upload Thumbnail" : escapeHtml(trackingV2ProjectCode(card, index))}</span>
                <strong>${escapeHtml(card.name)}<small>${escapeHtml(trackingV2ProjectCode(card, index))} · ${escapeHtml(trackingV2ProjectStatusLabel(card))}</small></strong>
                <b>${card.shotCount || 0}<small>shots</small></b>
                <b>${card.assetCount || 0}<small>assets</small></b>
                <em>${percentText(card.progress || 0)}</em>
              </button>
            `,
          )
          .join("")}
      </div>
    `;
  }
  return cards
    .map(
      (card, index) => `
        <button class="v2-project-card ${card.tone || "good"}" type="button" data-context-kind="tracker-project" data-context-title="${escapeHtml(card.name)}" data-context-meta="${escapeHtml(`${trackingV2ProjectCode(card, index)} · ${card.shotCount} shots · ${card.assetCount} assets`)}">
          <span class="v2-project-thumb">${card.template ? "Upload Thumbnail" : escapeHtml(trackingV2ProjectCode(card, index))}</span>
          <strong>${escapeHtml(card.name)}</strong>
          <small>${escapeHtml(trackingV2ProjectCode(card, index))} · ${card.shotCount || 0} shots · ${card.assetCount || 0} assets · ${percentText(card.progress || 0)}</small>
        </button>
      `,
    )
    .join("");
}

function trackingV2ShotRows(tracker) {
  return tracker.shotRows.map((shot, index) => {
    const code = trackingV2ShotCode(shot.code, index);
    const sequence = trackingV2SequenceCode(shot.code, index);
    const stepStatuses = trackingV2PipelineSteps.reduce((result, step) => {
      result[step.key] = trackingV2StepStatus(shot, step.key);
      return result;
    }, {});
    const id = `shot-${code}`;
    const edit = trackingV2ShotEdits[id] || {};
    const status = edit.status || (shot.warning > 0 ? "ON_HOLD" : shot.pending > 0 ? "PENDING_REVIEW" : shot.progress >= 0.95 ? "FINAL" : shot.progress > 0 ? "IN_PROGRESS" : "WAITING_TO_START");
    return {
      ...shot,
      id,
      originalCode: shot.code,
      code,
      sequence,
      cutIn: shot.frameStart,
      cutOut: shot.frameEnd,
      cutDuration: Math.max(1, shot.frameEnd - shot.frameStart + 1),
      status,
      updatedAt: edit.updatedAt || `D${Math.max(1, project.currentDay || 1)}`,
      stepStatuses,
    };
  });
}

function trackingV2AssetRows(tracker) {
  const linkedShots = trackingV2ShotRows(tracker).slice(0, 4).map((shot) => shot.code);
  return tracker.assetRows.map((asset, index) => {
    const stepStatuses = trackingV2AssetSteps.reduce((result, step, stepIndex) => {
      result[step.key] = trackingV2ProgressStatus(asset.progress || 0, stepIndex * 0.11);
      return result;
    }, {});
    const id = asset.id || asset.code || `asset-${index}`;
    const edit = trackingV2AssetEdits[id] || {};
    const status = edit.status || trackingV2TaskStatus(asset.status);
    return {
      ...asset,
      id,
      typeLabel: trackerAssetTypeLabel(asset.type),
      status,
      linkedShots: linkedShots.slice(0, Math.max(1, (index % 3) + 1)),
      sequence: index % 2 === 0 ? "RAID" : "TRU",
      updatedAt: edit.updatedAt || `D${Math.max(1, project.currentDay || 1)}`,
      openNotes: status === "CHANGES_REQUESTED" || status === "ON_HOLD" ? 2 : status === "PENDING_REVIEW" ? 1 : 0,
      stepStatuses,
    };
  });
}

function trackingV2SelectedShot(rows) {
  return rows.find((row) => row.id === selectedV2ShotId) || rows.find((row) => row.status === "ON_HOLD" || row.status === "PENDING_REVIEW") || rows[0] || null;
}

function trackingV2SelectedAsset(rows) {
  return rows.find((row) => row.id === selectedV2AssetId) || rows.find((row) => row.status === "ON_HOLD" || row.status === "PENDING_REVIEW") || rows[0] || null;
}

function trackingV2SetShotStatus(shotId, status) {
  if (!shotId || !status) return false;
  trackingV2ShotEdits[shotId] = { ...(trackingV2ShotEdits[shotId] || {}), status, updatedAt: `D${project.currentDay || 1}` };
  selectedV2ShotId = shotId;
  saveData();
  const surface = document.querySelector("#trackingV2Surface");
  if (surface) surface.dataset.activePanel = "shots";
  renderTrackingV2Surface(productionTrackerWorkflowData());
  setFormStatus(`Shot 状态已更新：${trackingV2StatusLabel(status)}`, status === "ON_HOLD" ? "warning" : "good");
  return true;
}

function trackingV2SetAssetStatus(assetId, status) {
  if (!assetId || !status) return false;
  trackingV2AssetEdits[assetId] = { ...(trackingV2AssetEdits[assetId] || {}), status, updatedAt: `D${project.currentDay || 1}` };
  selectedV2AssetId = assetId;
  saveData();
  const surface = document.querySelector("#trackingV2Surface");
  if (surface) surface.dataset.activePanel = "assets";
  renderTrackingV2Surface(productionTrackerWorkflowData());
  setFormStatus(`Asset 状态已更新：${trackingV2StatusLabel(status)}`, status === "ON_HOLD" ? "warning" : "good");
  return true;
}

function trackingV2TaskRows(tracker) {
  const dayWidth = Math.max(project.plannedDays || 1, 1);
  return tracker.allTasks
    .slice()
    .sort((a, b) => {
      const weight = { ON_HOLD: 0, CHANGES_REQUESTED: 1, PENDING_REVIEW: 2, IN_PROGRESS: 3, NOT_STARTED: 4, APPROVED: 5 };
      return (weight[a.status] ?? 6) - (weight[b.status] ?? 6) || a.dueDay - b.dueDay;
    })
    .slice(0, 12)
    .map((task, index) => {
      const bid = Math.max(2, Math.round((task.dueDay % 5) + 2));
      const logged = Math.round((bid * (task.progress || 0) + (task.status === "CHANGES_REQUESTED" ? 1.6 : task.status === "ON_HOLD" ? 2.2 : 0)) * 10) / 10;
      const overUnder = Math.round((logged - bid) * 10) / 10;
      const sourceAmount = Number(task.amount) || 0;
      const person = people.find((row) => row.name === task.assignee || row.dept === task.department);
      const dayCost = person ? Number(person.dayRate) || 0 : 1200;
      const estimatedCost = sourceAmount > 0 ? Math.round(sourceAmount / Math.max(tracker.summary.totalTasks || 1, 1)) : Math.round(bid * dayCost);
      const actualCost = Math.round(logged * dayCost);
      const costOverUnder = actualCost - estimatedCost;
      const editedDates = trackingV2TaskEdits[task.id] || {};
      const defaultStart = clampDay(Math.max(1, task.dueDay - bid + 1));
      const defaultEnd = clampDay(task.dueDay);
      const start = clampDay(editedDates.start || defaultStart);
      const end = clampDay(Math.max(start, editedDates.end || defaultEnd));
      return {
        ...task,
        status: trackingV2TaskStatus(task.status),
        reviewer: task.department === "post" || task.department === "vfx_color" ? "VFX Supervisor" : "Producer",
        start,
        end,
        bid,
        logged,
        loggedPct: bid > 0 ? logged / bid : 0,
        overUnder,
        estimatedCost,
        actualCost,
        costOverUnder,
        startDate: `D${start}`,
        dueDate: `D${end}`,
        left: `${Math.max(0, ((start - 1) / dayWidth) * 100)}%`,
        width: `${Math.max(5, ((end - start + 1) / dayWidth) * 100)}%`,
        rowIndex: index,
      };
    });
}

function trackingV2TaskDependencies(tasks) {
  return tasks.slice(1, 8).map((task, index) => {
    const predecessor = tasks[index];
    const lag = Math.max(0, task.start - predecessor.end - 1);
    const risk = task.status === "ON_HOLD" || predecessor.status === "ON_HOLD" ? "blocked" : lag === 0 ? "tight" : "ok";
    return {
      id: `dep-${predecessor.id}-${task.id}`,
      predecessor,
      successor: task,
      type: index % 3 === 0 ? "FS" : index % 3 === 1 ? "SS" : "FF",
      lag,
      risk,
    };
  });
}

function trackingV2SelectedTask(tasks) {
  if (trackerUiState.v2TaskDateEditor) {
    return tasks.find((task) => task.id === trackerUiState.v2TaskDateEditor) || tasks[0] || null;
  }
  return tasks.find((task) => task.status === "ON_HOLD" || task.overUnder > 0) || tasks[0] || null;
}

function trackingV2DateOptions(selectedTask) {
  const totalDays = Math.max(project.plannedDays || 18, 1);
  const anchorStart = selectedTask?.start || Math.max(1, project.currentDay || 1);
  return Array.from({ length: Math.min(totalDays, 12) }, (_, index) => {
    const day = clampDay(anchorStart - 2 + index);
    return day;
  }).filter((day, index, rows) => rows.indexOf(day) === index);
}

function resetTrackerUiState() {
  trackerUiState = {
    status: "all",
    assignee: "all",
    expandedShotCode: "",
    role: "all",
    v2ResourceChart: "area",
    v2InspectGroup: "department",
    v2InspectWeek: 0,
    v2ResourceSelectedKey: "",
    v2ResourceSelectedWeek: 0,
    v2TaskDateEditor: "",
    v2ProjectView: "grid",
    v2ProjectSort: "recent",
    v2ProjectQuery: "",
    v2CollapsedInsights: {},
  };
}

function trackingV2ResourceTaskRows(tracker, rowId, week) {
  const weekStart = week.index * 7 + 1;
  const weekEnd = week.index * 7 + 7;
  const rowKey = String(rowId || "");
  const isDepartmentRow = rowKey.startsWith("dept:");
  const departmentId = rowKey.replace(/^dept:/u, "");
  const related = tracker.allTasks
    .filter((task) => (!isDepartmentRow || task.department === departmentId) && task.dueDay >= weekStart && task.dueDay <= weekEnd)
    .slice()
    .sort((a, b) => a.dueDay - b.dueDay || a.sort - b.sort)
    .slice(0, 5);
  const sourceRows =
    related.length > 0
      ? related
      : [
          ...productionScheduleRows()
            .filter((task) => task.start <= weekEnd && task.end >= weekStart && (!isDepartmentRow || task.id === `dept-${departmentId}` || task.title === getDept(departmentId).name))
            .map((task) => ({
              id: `resource-schedule-${task.id}-${week.index}`,
              shotCode: task.title,
              name: "Schedule",
              label: task.status || "排期",
              assignee: task.owner,
              department: departmentId,
              status: task.risk === "over" ? "ON_HOLD" : task.progressRate >= 1 ? "APPROVED" : "IN_PROGRESS",
              dueDay: Math.min(weekEnd, task.end),
              startDay: Math.max(weekStart, task.start),
            })),
          ...callSheets
            .filter((sheet) => sheet.day >= weekStart && sheet.day <= weekEnd && (!isDepartmentRow || sheet.departments.includes(departmentId)))
            .slice(0, 3)
            .map((sheet) => ({
              id: `resource-callsheet-${sheet.code}-${departmentId}`,
              shotCode: sheet.code,
              name: "Call Sheet",
              label: "通告",
              assignee: sheet.callTime || "Call",
              department: departmentId,
              status: sheet.day < (project.currentDay || 1) ? "APPROVED" : sheet.day === (project.currentDay || 1) ? "IN_PROGRESS" : "READY_TO_START",
              dueDay: sheet.day,
              startDay: sheet.day,
            })),
        ].slice(0, 5);
  return sourceRows.map((task, index) => {
    const bid = Math.max(1, Math.round((task.dueDay % 4) + 1));
    const start = clampDay(Math.max(weekStart, task.startDay || task.dueDay - bid + 1));
    const end = clampDay(Math.min(weekEnd, task.dueDay));
    return {
      ...task,
      start,
      end,
      lane: index,
      left: `${Math.max(0, ((start - weekStart) / 7) * 100)}%`,
      width: `${Math.max(12, ((end - start + 1) / 7) * 100)}%`,
      status: trackingV2TaskStatus(task.status),
    };
  });
}

function trackingV2ResourceData(tracker = productionTrackerWorkflowData()) {
  const planningHorizon = Math.max(project.plannedDays || 42, 42);
  const weeks = Array.from({ length: 6 }, (_, index) => {
    const start = index * 7 + 1;
    const end = Math.min(planningHorizon, start + 6);
    return { index, label: `W${index + 1}`, range: `D${start}-${end}` };
  });
  const exceptions = trackingV2CalendarExceptionRows();
  const departmentsForRows = activeBudgetDepartments().slice(0, 9);
  const rows = departmentsForRows.map((department, departmentIndex) => {
    const members = people.filter((person) => person.dept === department.id);
    const capacity = Math.max(1, members.length || 1) * 5;
    const cells = weeks.map((week) => {
      const sheetCount = callSheets.filter((sheet) => sheet.departments.includes(department.id) && sheet.day >= week.index * 7 + 1 && sheet.day <= week.index * 7 + 7).length;
      const schedulePressure = productionScheduleRows().filter((task) => task.title === department.name && task.start <= week.index * 7 + 7 && task.end >= week.index * 7 + 1).length;
      const workload = Math.max(0, Math.round(sheetCount * 1.7 + schedulePressure * 2.4 + ((departmentIndex + week.index) % 4) - 1));
      const delta = workload - capacity;
      const exception = exceptions.find((item) => item.day >= week.index * 7 + 1 && item.day <= week.index * 7 + 7);
      return {
        ...week,
        capacity,
        workload,
        delta,
        exception,
        tasks: trackingV2ResourceTaskRows(tracker, `dept:${department.id}`, week),
      };
    });
    return { id: `dept:${department.id}`, label: department.name, department, members, capacity, cells };
  });
  const totals = weeks.map((week) => {
    const capacity = rows.reduce((sum, row) => sum + row.capacity, 0);
    const workload = rows.reduce((sum, row) => sum + row.cells[week.index].workload, 0);
    return { ...week, capacity, workload, delta: workload - capacity };
  });
  const unassigned = weeks.map((week) => {
    const workload = Math.max(0, callSheets.filter((sheet) => sheet.day >= week.index * 7 + 1 && sheet.day <= week.index * 7 + 7).length - 1);
    return { ...week, workload };
  });
  const projectRows = trackingV2ProjectCards(productionTrackerWorkflowData()).slice(0, 4).map((card, cardIndex) => {
    const base = Math.max(2, Math.round((card.shotCount || 1) / 8));
    return {
      id: card.id,
      name: card.name,
      cells: weeks.map((week) => {
        const workload = Math.max(0, Math.round(base + ((week.index + cardIndex) % 4) - 1));
        const capacity = Math.max(3, base + 2);
        return { ...week, workload, capacity, delta: workload - capacity, tasks: trackingV2ResourceTaskRows(tracker, card.id, week) };
      }),
    };
  });
  const selectedKey = trackerUiState.v2ResourceSelectedKey || rows[0]?.id || "";
  const selectedWeek = Math.max(0, Math.min(weeks.length - 1, Number(trackerUiState.v2ResourceSelectedWeek) || 0));
  const selectedRow = [...rows, ...projectRows].find((row) => row.id === selectedKey) || rows[0] || projectRows[0] || null;
  const selectedCell = selectedRow?.cells?.[selectedWeek] || null;
  return { weeks, rows, totals, unassigned, projectRows, selectedKey, selectedWeek, selectedRow, selectedCell };
}

function trackingV2PhaseRows(tracker) {
  const schedule = productionScheduleRows();
  const baseRows = schedule.length > 0 ? schedule : activeBudgetDepartments().slice(0, 5).map((department, index) => ({
    id: `phase-fallback-${department.id}`,
    title: department.name,
    start: index * 3 + 1,
    end: Math.min(project.plannedDays || 18, index * 3 + 5),
    progressRate: Math.min(1, (index + 1) / 6),
    status: "进行中",
    owner: department.name,
  }));
  return baseRows.slice(0, 8).map((row, index) => {
    const linkedTasks = tracker.allTasks.filter((task) => task.dueDay >= row.start && task.dueDay <= row.end);
    const status = row.progressRate >= 1 ? "FINAL" : row.progressRate > 0.65 ? "IN_PROGRESS" : index === 0 ? "PENDING_REVIEW" : "READY_TO_START";
    return {
      id: row.id || `phase-${index}`,
      name: row.title || `Phase ${index + 1}`,
      start: row.start || index * 3 + 1,
      end: row.end || Math.min(project.plannedDays || 18, index * 3 + 5),
      progress: row.progressRate || row.progress || 0,
      status,
      owner: row.owner || "Producer",
      taskCount: linkedTasks.length,
      deliverable: index % 3 === 0 ? "Director Review" : index % 3 === 1 ? "Client Internal" : "Vendor Turnover",
    };
  });
}

function trackingV2WorkOrderRows() {
  const flow = fundFlowReadableData(8);
  const reviews = vfxReviewRows();
  const audit = auditSummaryData();
  const rows = [
    ...reviews.slice(0, 5).map((review, index) => ({
      id: `wo-review-${review.id}`,
      title: `${review.shotGroup} ${review.version} review package`,
      description: review.action,
      owner: review.vendor,
      status: review.risk === "high" ? "Blocked" : review.status === "approved" ? "Closed" : "Open",
      amount: review.amount,
      due: `D${Math.min(project.plannedDays || 1, (project.currentDay || 1) + index + 1)}`,
      type: "Version",
    })),
    ...flow.detailRows.slice(0, 5).map((detail, index) => ({
      id: `wo-flow-${index}`,
      title: `${detail.label} delivery / invoice check`,
      description: `${detail.department} · ${detail.type} · ${detail.meta || "付款凭证"}`,
      owner: detail.label,
      status: detail.value > 30000 ? "Open" : "Queued",
      amount: detail.value,
      due: `D${Math.min(project.plannedDays || 1, (project.currentDay || 1) + index + 2)}`,
      type: "Finance",
    })),
    {
      id: "wo-audit-close",
      title: "Audit evidence closeout",
      description: `${audit.highRiskCount} high risk · ${audit.mediumRiskCount} medium risk`,
      owner: "Production Accountant",
      status: audit.highRiskCount > 0 ? "Blocked" : "Open",
      amount: audit.reviewedAmount || 0,
      due: `D${project.currentDay || 1}`,
      type: "Audit",
    },
  ];
  return rows.slice(0, 10).map((row, index) => {
    const edit = trackingV2WorkOrderEdits[row.id] || {};
    const status = edit.status || row.status;
    const priority = status === "Blocked" || row.amount > 50000 ? "High" : row.amount > 15000 ? "Medium" : "Normal";
    return {
      ...row,
      status,
      priority,
      updatedAt: edit.updatedAt || `D${Math.max(1, (project.currentDay || 1) - (index % 3))}`,
      nextAction:
        status === "Closed"
          ? "Archive evidence and notify production accountant."
          : status === "Blocked"
            ? "Escalate to producer, supervisor, and finance before payment."
            : row.type === "Version"
              ? "Route review package to supervisor and close notes before payment."
              : row.type === "Finance"
                ? "Match invoice, vendor, receipt, and department allocation."
                : "Collect missing audit evidence and close risk comments.",
      route: row.type === "Version" ? "Supervisor" : row.type === "Finance" ? "Producer + Accountant" : "Admin",
    };
  });
}

function trackingV2CalendarExceptionRows() {
  const totalDays = Math.max(project.plannedDays || 18, 1);
  return [
    { day: Math.min(totalDays, Math.max(1, (project.currentDay || 1) + 2)), type: "REDUCED_HOURS", label: "Reduced hours", hours: 4, inheritedFrom: "project" },
    { day: Math.min(totalDays, Math.max(1, (project.currentDay || 1) + 5)), type: "HOLIDAY", label: "Local holiday", hours: 0, inheritedFrom: "studio" },
    { day: Math.min(totalDays, Math.max(1, (project.currentDay || 1) + 8)), type: "STUDIO_CLOSURE", label: "Stage turnover", hours: 0, inheritedFrom: "project" },
  ]
    .map((row, index) => ({ id: `cal-${index}`, ...row }))
    .concat(trackingV2CalendarExceptions)
    .map((row) => {
      const edit = trackingV2CalendarExceptionEdits[row.id] || {};
      return {
        ...row,
        status: edit.status || "open",
        updatedAt: edit.updatedAt || "",
        date: `D${row.day}`,
        impact: row.hours === 0 ? "No capacity" : `${row.hours}h capacity`,
      };
    })
    .filter((row) => row.status !== "closed")
    .sort((a, b) => a.day - b.day || String(a.label).localeCompare(String(b.label)));
}

function trackingV2InboxRows(tracker) {
  const tasks = tracker.allTasks
    .filter((task) => ["PENDING_REVIEW", "CHANGES_REQUESTED", "ON_HOLD"].includes(task.status))
    .slice(0, 6)
    .map((task) => ({
      id: `inbox-task-${task.id}`,
      title: `${task.shotCode} · ${task.label}`,
      meta: `${trackerStatusLabel(task.status)} · ${task.assignee}`,
      role: task.department === "vfx_color" || task.department === "post" ? "supervisor" : "producer",
      target: "Task",
      status: trackingV2TaskStatus(task.status),
    }));
  const versions = vfxReviewRows().slice(0, 5).map((version) => ({
    id: `inbox-version-${version.id}`,
    title: `${version.shotGroup} · ${version.version}`,
    meta: `${version.vendor} · ${vfxPaymentGateLabels[version.paymentGate] || version.paymentGate}`,
    role: version.status === "approved" ? "reviewer" : "supervisor",
    target: "Version",
    status: version.risk === "high" ? "ON_HOLD" : version.status === "approved" ? "FINAL" : "PENDING_REVIEW",
  }));
  return [...tasks, ...versions].slice(0, 10).map((item, index) => {
    const edit = trackingV2InboxEdits[item.id] || {};
    const status = edit.status || item.status;
    return {
      ...item,
      status,
      sla: status === "ON_HOLD" ? "Escalate today" : status === "FINAL" ? "Closed" : index < 3 ? "Due today" : "Due next",
      action: status === "FINAL" ? "No action required." : item.target === "Version" ? "Open media review, add decision, then update payment gate." : "Open task detail, resolve notes, and update assignee.",
      updatedAt: edit.updatedAt || `D${Math.max(1, (project.currentDay || 1) - (index % 2))}`,
    };
  });
}

function trackingV2SelectedWorkOrder(rows) {
  return rows.find((row) => row.id === selectedV2WorkOrderId) || rows.find((row) => row.status !== "Closed") || rows[0] || null;
}

function trackingV2SelectedInbox(rows) {
  return rows.find((row) => row.id === selectedV2InboxId) || rows.find((row) => row.status !== "FINAL") || rows[0] || null;
}

function trackingV2SetWorkOrderStatus(orderId, status) {
  if (!orderId) return false;
  trackingV2WorkOrderEdits[orderId] = { ...(trackingV2WorkOrderEdits[orderId] || {}), status, updatedAt: `D${project.currentDay || 1}` };
  selectedV2WorkOrderId = orderId;
  saveData();
  const surface = document.querySelector("#trackingV2Surface");
  if (surface) surface.dataset.activePanel = "workorders";
  renderTrackingV2Surface(productionTrackerWorkflowData());
  setFormStatus(`Work Order 已更新：${status}`, status === "Closed" ? "good" : "warning");
  return true;
}

function trackingV2SetInboxStatus(inboxId, status) {
  if (!inboxId) return false;
  trackingV2InboxEdits[inboxId] = { ...(trackingV2InboxEdits[inboxId] || {}), status, updatedAt: `D${project.currentDay || 1}` };
  selectedV2InboxId = inboxId;
  saveData();
  const surface = document.querySelector("#trackingV2Surface");
  if (surface) surface.dataset.activePanel = "inbox";
  renderTrackingV2Surface(productionTrackerWorkflowData());
  setFormStatus(`Inbox 已更新：${trackingV2StatusLabel(status)}`, status === "FINAL" ? "good" : "warning");
  return true;
}

function trackingV2AdminRows(tracker) {
  return trackerUserRows(tracker).slice(0, 10).map((user) => ({
    ...user,
    role: trackingV2AdminRoleEdits[user.id] || user.role,
    login: user.email.split("@")[0],
    capacity: Math.max(3, Math.min(6, Math.round((100 - Math.max(0, 100 - user.trust)) / 18))),
    permission: trackingV2PermissionSummary(trackingV2AdminRoleEdits[user.id] || user.role),
  }));
}

function trackingV2PermissionMatrix(role) {
  const activeRole = role || "artist";
  const permissions = [
    { key: "projects", label: "Projects", admin: true, producer: true, supervisor: false, artist: false, reviewer: false },
    { key: "tasks", label: "Tasks", admin: true, producer: true, supervisor: true, artist: "own", reviewer: false },
    { key: "versions", label: "Versions", admin: true, producer: true, supervisor: true, artist: "upload", reviewer: "comment" },
    { key: "reports", label: "Reports", admin: true, producer: true, supervisor: "view", artist: false, reviewer: "view" },
    { key: "audit", label: "Audit", admin: true, producer: true, supervisor: "view", artist: false, reviewer: false },
    { key: "admin", label: "Admin", admin: true, producer: false, supervisor: false, artist: false, reviewer: false },
  ];
  return permissions.map((item) => {
    const value = item[activeRole];
    return {
      ...item,
      value,
      labelValue: value === true ? "Edit" : value === "own" ? "Own" : value === "upload" ? "Upload" : value === "comment" ? "Comment" : value === "view" ? "View" : "No access",
      enabled: Boolean(value),
    };
  });
}

function trackingV2PermissionSummary(role) {
  if (role === "admin") return "Full access";
  if (role === "producer") return "Edit + reports";
  if (role === "supervisor") return "Approve dept";
  if (role === "reviewer") return "Review + comments";
  return "Own tasks";
}

function trackingV2SelectedAdminUser(rows) {
  return rows.find((row) => row.id === selectedV2AdminUserId) || rows.find((row) => row.role === "producer") || rows[0] || null;
}

function trackingV2SetAdminRole(userId, role) {
  if (!userId || !role) return false;
  trackingV2AdminRoleEdits[userId] = role;
  selectedV2AdminUserId = userId;
  pipelineEvents = normalizePipelineEvents([
    {
      id: `v2-admin-role-${Date.now()}`,
      action: "Admin.roleChanged",
      label: "Role changed",
      entityType: "User",
      entityId: userId,
      status: role === "admin" ? "needs_review" : "queued",
      payload: { userId, role, source: "prd-v2-admin" },
      createdAt: new Date().toISOString(),
    },
    ...pipelineEvents,
  ]);
  saveData();
  const surface = document.querySelector("#trackingV2Surface");
  if (surface) surface.dataset.activePanel = "admin";
  renderTrackingV2Surface(productionTrackerWorkflowData());
  setFormStatus(`权限已更新：${trackerRoleLabel(role)}`, role === "admin" ? "warning" : "good");
  return true;
}

function trackingV2ApiRows() {
  return [
    ["GET", "/api/projects/:id/stats", "dashboard widgets", "Ready", "Producer"],
    ["GET", "/api/projects/:id/shots", "pipeline table", "Ready", "Producer"],
    ["GET", "/api/tasks?status=", "task filters", "Mock", "Producer"],
    ["POST", "/api/tasks/:id/assign", "assignment", "Mock", "Producer"],
    ["PATCH", "/api/versions/:id/status", "supervisor approval", "Ready", "Supervisor"],
    ["GET", "/api/resource-planning/inspect", "inspect chart data", "Mock", "Producer"],
    ["POST", "/api/calendar-exceptions", "calendar exception", "Blocked", "Admin"],
  ].map(([method, endpoint, purpose, status, owner], index) => {
    const id = `api-${pipelinePathSegment(`${method}-${endpoint}`, `route-${index}`)}`;
    const edit = trackingV2ApiRouteEdits[id] || {};
    const finalStatus = edit.status || status;
    return {
      id,
      method,
      endpoint,
      purpose,
      status: finalStatus,
      owner,
      updatedAt: edit.updatedAt || `D${Math.max(1, (project.currentDay || 1) - (index % 3))}`,
      risk: finalStatus === "Blocked" ? "high" : finalStatus === "Mock" ? "medium" : "low",
    };
  });
}

function trackingV2SelectedApiRoute(rows) {
  return rows.find((row) => row.id === selectedV2ApiRouteId) || rows.find((row) => row.status !== "Ready") || rows[0] || null;
}

function trackingV2SetApiRouteStatus(routeId, status) {
  if (!routeId || !status) return false;
  trackingV2ApiRouteEdits[routeId] = { ...(trackingV2ApiRouteEdits[routeId] || {}), status, updatedAt: `D${project.currentDay || 1}` };
  selectedV2ApiRouteId = routeId;
  pipelineEvents = normalizePipelineEvents([
    {
      id: `v2-api-${Date.now()}`,
      action: "API.statusChanged",
      label: "API readiness updated",
      entityType: "API Route",
      entityId: routeId,
      status: status === "Blocked" ? "needs_review" : "queued",
      payload: { routeId, status, source: "prd-v2-admin" },
      createdAt: new Date().toISOString(),
    },
    ...pipelineEvents,
  ]);
  saveData();
  const surface = document.querySelector("#trackingV2Surface");
  if (surface) surface.dataset.activePanel = "admin";
  renderTrackingV2Surface(productionTrackerWorkflowData());
  setFormStatus(`API 状态已更新：${status}`, status === "Blocked" ? "warning" : "good");
  return true;
}

function trackingV2VersionTaskStatus(version) {
  if (!version) return "PENDING_REVIEW";
  if (version.status === "approved") return "FINAL";
  if (version.status === "blocked") return "ON_HOLD";
  if (version.status === "notes") return "PENDING_REVIEW";
  return "PENDING_REVIEW";
}

function trackingV2VersionStatusLabel(version) {
  if (!version) return "Pending Review";
  return vfxReviewStatusLabels[version.status]?.label || "待审";
}

function trackingV2SelectedVersion(versions) {
  if (!Array.isArray(versions) || versions.length === 0) return null;
  const selected = versions.find((version) => version.id === selectedV2ReviewId);
  return selected || versions[0];
}

function trackingV2VersionNotes(version) {
  if (!version) return [];
  const rawNotes = String(version.notes || version.action || "Waiting for notes")
    .split(/\n+/u)
    .map((line) => line.trim())
    .filter(Boolean);
  const systemNotes = [
    `${trackingV2VersionStatusLabel(version)} · ${vfxPaymentGateLabels[version.paymentGate] || version.paymentGate}`,
    version.action,
  ].filter(Boolean);
  return [...new Set([...rawNotes, ...systemNotes])].slice(0, 5);
}

function trackingV2ReviewDecision(reviewId, decision) {
  const row = normalizeVfxReviewVersions(vfxReviewVersions).find((item) => item.id === reviewId);
  if (!row) return false;
  const stamp = reportDateLabel();
  if (decision === "approved") {
    updateVfxReviewById(reviewId, {
      status: "approved",
      approvedCount: Math.max(Number(row.shotCount) || 1, Number(row.approvedCount) || 0),
      paymentGate: row.paymentGate === "hold" ? "milestone" : row.paymentGate,
      notes: [row.notes, `[${stamp}] PRD v2 Media: approved for next payment gate.`].filter(Boolean).join("\n"),
    });
  } else if (decision === "notes") {
    updateVfxReviewById(reviewId, {
      status: "notes",
      paymentGate: "hold",
      notes: [row.notes, `[${stamp}] PRD v2 Media: changes requested, hold payment until next version.`].filter(Boolean).join("\n"),
    });
  } else if (decision === "blocked") {
    updateVfxReviewById(reviewId, {
      status: "blocked",
      paymentGate: "hold",
      notes: [row.notes, `[${stamp}] PRD v2 Media: blocked by supervisor review.`].filter(Boolean).join("\n"),
    });
  } else {
    updateVfxReviewById(reviewId, {
      status: "submitted",
      notes: [row.notes, `[${stamp}] PRD v2 Media: returned to pending review.`].filter(Boolean).join("\n"),
    });
  }
  selectedV2ReviewId = reviewId;
  saveData();
  renderTrackingV2Surface(productionTrackerWorkflowData());
  renderProductionTrackingConsole();
  setFormStatus(`版本状态已更新：${row.shotGroup} · ${row.version}`, decision === "approved" ? "good" : "warning");
  return true;
}

function trackingV2VersionAmount(version) {
  if (!version) return 0;
  const row = vfxReviewRows().find((item) => item.id === version.id);
  return Number(row?.amount) || 0;
}

function trackingV2MediaPlaylist(versions) {
  const source = Array.isArray(versions) ? versions : [];
  const playlistIds = trackingV2MediaPlaylistIds.filter((id) => source.some((version) => version.id === id));
  const rows = playlistIds.length > 0 ? playlistIds.map((id) => source.find((version) => version.id === id)).filter(Boolean) : source.slice(0, 4);
  const totalShots = rows.reduce((sum, version) => sum + (Number(version.shotCount) || 0), 0);
  const approvedShots = rows.reduce((sum, version) => sum + (Number(version.approvedCount) || 0), 0);
  const amount = rows.reduce((sum, version) => sum + trackingV2VersionAmount(version), 0);
  return {
    rows,
    totalShots,
    approvedShots,
    amount,
    approvalRate: totalShots > 0 ? approvedShots / totalShots : 0,
  };
}

function trackingV2TogglePlaylist(reviewId) {
  if (!reviewId) return false;
  if (trackingV2MediaPlaylistIds.includes(reviewId)) {
    trackingV2MediaPlaylistIds = trackingV2MediaPlaylistIds.filter((id) => id !== reviewId);
  } else {
    trackingV2MediaPlaylistIds = normalizeTrackingV2PlaylistIds([...trackingV2MediaPlaylistIds, reviewId]);
  }
  selectedV2ReviewId = reviewId;
  saveData();
  const surface = document.querySelector("#trackingV2Surface");
  if (surface) surface.dataset.activePanel = "media";
  renderTrackingV2Surface(productionTrackerWorkflowData());
  setFormStatus(`播放列表已更新：${trackingV2MediaPlaylistIds.length || "默认"} 个版本`, "good");
  return true;
}

function trackingV2ClearPlaylist() {
  trackingV2MediaPlaylistIds = [];
  saveData();
  const surface = document.querySelector("#trackingV2Surface");
  if (surface) surface.dataset.activePanel = "media";
  renderTrackingV2Surface(productionTrackerWorkflowData());
  setFormStatus("播放列表已恢复为默认队列", "good");
}

function trackingV2CompareVersion(versions, selectedVersion) {
  if (!Array.isArray(versions) || versions.length === 0) return null;
  const selected = selectedVersion || trackingV2SelectedVersion(versions);
  if (selectedV2MediaCompareId && selectedV2MediaCompareId !== selected?.id) {
    const matched = versions.find((version) => version.id === selectedV2MediaCompareId);
    if (matched) return matched;
  }
  return versions.find((version) => version.id !== selected?.id && version.shotGroup === selected?.shotGroup) || versions.find((version) => version.id !== selected?.id) || null;
}

function trackingV2PrdRoadmapRows(tracker, data) {
  const status = trackerPrdStatusRows(tracker);
  const taskRows = data?.tasks || trackingV2TaskRows(tracker);
  const apiRows = data?.apiRoutes || trackingV2ApiRows();
  const calendarRows = data?.calendarExceptions || trackingV2CalendarExceptionRows();
  const playlist = trackingV2MediaPlaylist(data?.versions || vfxReviewRows());
  const completed = status.rows.filter((row) => row.rate >= 0.95 && row.stage !== "todo").length;
  return [
    { label: "Prototype UI", value: `${completed}/${status.rows.length}`, detail: "Shot / Asset / Media / Resource / Admin 可演示", tone: "good" },
    { label: "Local Persistence", value: `${Object.keys(trackingV2TaskEdits).length + Object.keys(trackingV2ShotEdits).length + Object.keys(trackingV2AssetEdits).length}`, detail: "状态、日期、播放列表、日历异常已本地保存", tone: "good" },
    { label: "Exports", value: "CSV", detail: "任务、资源、版本、异常、API 就绪度可导出", tone: "good" },
    { label: "Schedule Editing", value: taskRows.length, detail: "日期选择已完成；真实拖拽依赖线待工程化", tone: "note" },
    { label: "Media Review", value: playlist.rows.length, detail: "播放列表、版本对比、审批状态可演示；真实上传存储待后端", tone: playlist.rows.length > 0 ? "good" : "note" },
    { label: "Calendar Exceptions", value: calendarRows.length, detail: "可新增/关闭本地异常；团队日历继承待数据库", tone: calendarRows.length > 0 ? "good" : "note" },
    { label: "API / Auth / DB", value: `${apiRows.filter((row) => row.status === "Ready").length}/${apiRows.length}`, detail: "端点清单可管理；Next.js、Prisma、NextAuth 尚未开始", tone: "warning" },
  ];
}

function trackingV2ExportRows(kind) {
  const tracker = productionTrackerWorkflowData();
  const data = trackingV2Data(tracker);
  if (kind === "tasks") {
    return data.tasks.map((task) => ({
      Shot: task.shotCode,
      Task: task.label,
      Status: trackingV2StatusLabel(task.status),
      Assignee: task.assignee,
      Reviewer: task.reviewer,
      Start: `D${task.start}`,
      End: `D${task.end}`,
      BidDays: task.bid,
      LoggedDays: task.logged,
      CostOverUnder: task.costOverUnder,
    }));
  }
  if (kind === "resources") {
    return data.resource.rows.flatMap((row) =>
      row.cells.map((cell) => ({
        Department: row.label || row.department?.name || "",
        Week: cell.range,
        Capacity: cell.capacity,
        Workload: cell.workload,
        Delta: cell.delta,
        Exception: cell.exception?.label || "",
      })),
    );
  }
  if (kind === "media") {
    return data.versions.map((version) => ({
      Vendor: version.vendor,
      ShotGroup: version.shotGroup,
      Version: version.version,
      Status: trackingV2VersionStatusLabel(version),
      Reviewer: version.reviewer,
      PaymentGate: vfxPaymentGateLabels[version.paymentGate] || version.paymentGate,
      Approved: `${version.approvedCount}/${version.shotCount}`,
      Amount: trackingV2VersionAmount(version),
      Media: version.media?.fileName || "",
      Notes: version.notes || version.action || "",
    }));
  }
  if (kind === "calendar") {
    return data.calendarExceptions.map((item) => ({
      Day: item.date,
      Label: item.label,
      Type: item.type,
      CapacityHours: item.hours,
      Impact: item.impact,
      Source: item.inheritedFrom,
      Note: item.note || "",
    }));
  }
  if (kind === "api") {
    return data.apiRoutes.map((route) => ({
      Method: route.method,
      Endpoint: route.endpoint,
      Purpose: route.purpose,
      Status: route.status,
      Owner: route.owner,
      UpdatedAt: route.updatedAt,
    }));
  }
  if (kind === "roadmap") {
    return trackingV2PrdRoadmapRows(tracker, data).map((row) => ({
      Item: row.label,
      Status: row.value,
      Detail: row.detail,
      Tone: row.tone,
    }));
  }
  return [];
}

function trackingV2Export(kind) {
  const rows = trackingV2ExportRows(kind);
  if (!rows.length) {
    setFormStatus("暂无可导出的 PRD v2 数据", "warning");
    return false;
  }
  const label =
    {
      tasks: "任务排期",
      resources: "资源规划",
      media: "媒体版本",
      calendar: "日历异常",
      api: "API就绪度",
      roadmap: "PRD完成度",
    }[kind] || "PRD-v2";
  downloadCsvFile(rows, `${project.title || "项目"}-${label}.csv`);
  setFormStatus(`已导出：${label} ${rows.length} 行`, "good");
  return true;
}

function trackingV2AddCalendarException() {
  const totalDays = Math.max(project.plannedDays || 18, 1);
  const defaultDay = Math.min(totalDays, Math.max(1, (project.currentDay || 1) + 3));
  const dayInput = window.prompt("异常发生在第几天？", String(defaultDay));
  if (dayInput === null) return false;
  const day = clampDay(dayInput);
  const labelInput = window.prompt("异常名称", "供应商交付暂停");
  if (labelInput === null) return false;
  const label = labelInput.trim() || "Production exception";
  const hoursInput = window.prompt("当天可用工时（0 表示停工）", "0");
  if (hoursInput === null) return false;
  const hours = Math.max(0, Math.min(24, Number(hoursInput) || 0));
  const item = {
    id: `custom-cal-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    day,
    type: hours > 0 ? "REDUCED_HOURS" : "HOLD",
    label,
    hours,
    inheritedFrom: "local",
    note: hours > 0 ? "手动加入的缩短工时" : "手动加入的停工/暂停",
  };
  trackingV2CalendarExceptions = normalizeTrackingV2CalendarExceptions([item, ...trackingV2CalendarExceptions]);
  saveData();
  const surface = document.querySelector("#trackingV2Surface");
  if (surface) surface.dataset.activePanel = "phases";
  renderTrackingV2Surface(productionTrackerWorkflowData());
  setFormStatus(`已加入日历异常：D${day} · ${label}`, hours === 0 ? "warning" : "good");
  return true;
}

function trackingV2CloseCalendarException(exceptionId) {
  if (!exceptionId) return false;
  trackingV2CalendarExceptionEdits[exceptionId] = { ...(trackingV2CalendarExceptionEdits[exceptionId] || {}), status: "closed", updatedAt: `D${project.currentDay || 1}` };
  saveData();
  const surface = document.querySelector("#trackingV2Surface");
  if (surface) surface.dataset.activePanel = "phases";
  renderTrackingV2Surface(productionTrackerWorkflowData());
  setFormStatus("日历异常已关闭", "good");
  return true;
}

const trackingV2StatusColors = {
  WAITING_TO_START: "#9ba39e",
  READY_TO_START: "#378ADD",
  IN_PROGRESS: "#639922",
  PENDING_REVIEW: "#EF9F27",
  FINAL: "#1d8d70",
  ON_HOLD: "#7F77DD",
  OMIT: "#E24B4A",
};

const trackingV2StatusOrder = ["WAITING_TO_START", "READY_TO_START", "IN_PROGRESS", "PENDING_REVIEW", "FINAL", "ON_HOLD", "OMIT"];

function trackingV2CountBy(rows, getKey) {
  return rows.reduce((result, row) => {
    const key = getKey(row) || "Other";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}

function trackingV2StatusCounts(rows, getStatus = (row) => row.status) {
  return rows.reduce((result, row) => {
    const status = trackingV2TaskStatus(getStatus(row));
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {});
}

function trackingV2StackMarkup(counts) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (total <= 0) return `<div class="v2-empty-mini">No data</div>`;
  return `
    <div class="v2-stack-bar" aria-label="Status stacked bar">
      ${trackingV2StatusOrder
        .filter((status) => counts[status] > 0)
        .map((status) => `<i class="${trackingV2StatusClass(status)}" style="width:${Math.max(4, (counts[status] / total) * 100)}%" title="${escapeHtml(`${trackingV2StatusLabel(status)} ${counts[status]}`)}"></i>`)
        .join("")}
    </div>
    <div class="v2-mini-legend">
      ${trackingV2StatusOrder
        .filter((status) => counts[status] > 0)
        .map((status) => `<span>${trackingV2StatusDot(status)}${escapeHtml(trackingV2StatusLabel(status))} ${counts[status]}</span>`)
        .join("")}
    </div>
  `;
}

function trackingV2DonutMarkup(counts, centerLabel = "") {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (total <= 0) return `<div class="v2-empty-mini">No data</div>`;
  let cursor = 0;
  const segments = trackingV2StatusOrder
    .filter((status) => counts[status] > 0)
    .map((status) => {
      const start = cursor;
      const degrees = (counts[status] / total) * 360;
      cursor += degrees;
      return `${trackingV2StatusColors[status] || "#9ba39e"} ${start.toFixed(1)}deg ${cursor.toFixed(1)}deg`;
    });
  return `
    <div class="v2-donut-wrap">
      <div class="v2-donut" style="background: conic-gradient(${segments.join(", ")})"><span>${escapeHtml(centerLabel || String(total))}</span></div>
      <div class="v2-donut-legend">
        ${trackingV2StatusOrder
          .filter((status) => counts[status] > 0)
          .map((status) => `<span>${trackingV2StatusDot(status)}${escapeHtml(trackingV2StatusLabel(status))} ${counts[status]}</span>`)
          .join("")}
      </div>
    </div>
  `;
}

function trackingV2ProgressRowsMarkup(rows, options = {}) {
  const maxValue = Math.max(1, ...rows.map((row) => Number(row.value) || 0));
  return `
    <div class="v2-progress-list">
      ${rows
        .map((row) => {
          const rate = row.rate ?? ((Number(row.value) || 0) / maxValue);
          return `
            <span>
              <em>${escapeHtml(row.label)}</em>
              <i><b style="width:${Math.max(2, Math.min(rate, 1) * 100)}%"></b></i>
              <strong>${escapeHtml(row.valueText || String(row.value ?? ""))}</strong>
            </span>
          `;
        })
        .join("") || `<div class="v2-empty-mini">${escapeHtml(options.empty || "No rows")}</div>`}
    </div>
  `;
}

function trackingV2SparklineMarkup(values) {
  const clean = values.map((value) => Number(value) || 0);
  const maxValue = Math.max(1, ...clean);
  const width = 148;
  const height = 48;
  const points = clean
    .map((value, index) => {
      const x = clean.length <= 1 ? width / 2 : (index / (clean.length - 1)) * width;
      const y = height - (value / maxValue) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return `
    <svg class="v2-sparkline" viewBox="0 0 ${width} ${height}" role="img" aria-label="Velocity trend">
      <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${clean
        .map((value, index) => {
          const x = clean.length <= 1 ? width / 2 : (index / (clean.length - 1)) * width;
          const y = height - (value / maxValue) * (height - 8) - 4;
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2"></circle>`;
        })
        .join("")}
    </svg>
    <div class="v2-spark-labels">${clean.map((value, index) => `<span>S${index + 1}<b>${value}</b></span>`).join("")}</div>
  `;
}

function trackingV2InsightBody(item, data, tracker) {
  if (item.kind === "hero") {
    const rate = Math.max(0, Math.min((project.currentDay || 1) / Math.max(project.plannedDays || 1, 1), 1));
    return `
      <div class="v2-hero-mini">
        <span>${escapeHtml((project.title || "PROJECT").slice(0, 8))}</span>
        <i><b style="width:${Math.round(rate * 100)}%"></b></i>
        <small>D${project.currentDay || 1}/${project.plannedDays || 1} · ${escapeHtml(project.title || "当前项目")}</small>
      </div>
    `;
  }
  if (item.kind === "assets") {
    const rows = Object.entries(trackingV2CountBy(data.assets, (asset) => asset.typeLabel))
      .map(([label, value]) => ({ label, value, valueText: value }))
      .slice(0, 4);
    return `${trackingV2ProgressRowsMarkup(rows)}${trackingV2StackMarkup(trackingV2StatusCounts(data.assets))}`;
  }
  if (item.kind === "shots" || item.kind === "shot-status") {
    return trackingV2DonutMarkup(trackingV2StatusCounts(data.shots), `${data.shots.length} shots`);
  }
  if (item.kind === "tasks") {
    const rows = activeBudgetDepartments()
      .map((department) => {
        const tasks = tracker.allTasks.filter((task) => task.department === department.id);
        return {
          label: department.name,
          value: tasks.length,
          rate: tasks.length / Math.max(tracker.summary.totalTasks || 1, 1),
          valueText: `${tasks.filter((task) => trackingV2TaskStatus(task.status) === "FINAL").length}/${tasks.length}`,
        };
      })
      .filter((row) => row.value > 0)
      .slice(0, 5);
    return `${trackingV2ProgressRowsMarkup(rows)}${trackingV2StackMarkup(trackingV2StatusCounts(tracker.allTasks))}`;
  }
  if (item.kind === "velocity") {
    return trackingV2SparklineMarkup(item.series || []);
  }
  if (item.kind === "versions") {
    const rows = [
      { label: "Pending", value: item.versionStatus.pending, valueText: item.versionStatus.pending },
      { label: "Viewed", value: item.versionStatus.viewed, valueText: item.versionStatus.viewed },
      { label: "Approved", value: item.versionStatus.approved, valueText: item.versionStatus.approved },
    ];
    return trackingV2ProgressRowsMarkup(rows);
  }
  if (item.kind === "final") {
    const rows = activeBudgetDepartments()
      .map((department) => {
        const tasks = tracker.allTasks.filter((task) => task.department === department.id);
        const finalCount = tasks.filter((task) => trackingV2TaskStatus(task.status) === "FINAL").length;
        const rate = tasks.length > 0 ? finalCount / tasks.length : 0;
        return { label: department.name, value: finalCount, valueText: percentText(rate), rate };
      })
      .filter((row) => row.value > 0 || row.rate > 0)
      .slice(0, 5);
    return trackingV2ProgressRowsMarkup(rows, { empty: "No final tasks" });
  }
  if (item.kind === "crew") {
    return `
      <div class="v2-mini-table">
        ${trackerUserRows(tracker)
          .slice(0, 4)
          .map((user) => `<span><b>${escapeHtml(user.name)}</b><em>${escapeHtml(trackerRoleLabel(user.role))}</em><small>${escapeHtml(user.email)}</small></span>`)
          .join("")}
      </div>
    `;
  }
  if (item.kind === "sequences") {
    const rows = Object.entries(
      data.shots.reduce((result, shot) => {
        if (!result[shot.sequence]) result[shot.sequence] = { total: 0, final: 0, hold: 0 };
        result[shot.sequence].total += 1;
        if (shot.status === "FINAL") result[shot.sequence].final += 1;
        if (shot.status === "ON_HOLD") result[shot.sequence].hold += 1;
        return result;
      }, {}),
    ).map(([label, row]) => ({ label, value: row.total, valueText: `${row.final} final · ${row.hold} hold`, rate: row.final / Math.max(row.total, 1) }));
    return trackingV2ProgressRowsMarkup(rows);
  }
  if (item.kind === "asset-status") {
    return trackingV2ProgressRowsMarkup(
      trackingV2StatusOrder
        .map((status) => ({ label: trackingV2StatusLabel(status), value: trackingV2StatusCounts(data.assets)[status] || 0, valueText: trackingV2StatusCounts(data.assets)[status] || 0 }))
        .filter((row) => row.value > 0),
    );
  }
  if (item.kind === "latest") {
    return `
      <div class="v2-mini-filmstrip">
        ${data.versions
          .slice(0, 4)
          .map((version) => `<span>${version.media?.previewUrl ? `<img src="${escapeHtml(version.media.previewUrl)}" alt="${escapeHtml(version.version)}" />` : "<i>▶</i>"}<b>${escapeHtml(version.version)}</b></span>`)
          .join("") || `<div class="v2-empty-mini">No versions</div>`}
      </div>
    `;
  }
  return trackingV2StackMarkup({});
}

function trackingV2InsightRows(tracker) {
  const metrics = analysisMetrics();
  const assets = trackingV2AssetRows(tracker);
  const shots = trackingV2ShotRows(tracker);
  const versions = vfxReviewRows();
  const sequenceCount = new Set(shots.map((shot) => shot.sequence)).size;
  const finalTasks = tracker.allTasks.filter((task) => task.status === "APPROVED").length;
  const velocity = [1, 2, 3, 4, 5].map((week) => Math.max(0, Math.round(finalTasks * (week / 5) + week - 2)));
  const versionStatus = {
    pending: versions.filter((row) => row.status === "submitted").length,
    viewed: versions.filter((row) => row.status === "notes" || row.status === "blocked").length,
    approved: versions.filter((row) => row.status === "approved").length,
  };
  return [
    { title: "Hero / Countdown", value: Math.max(0, (project.plannedDays || 1) - (project.currentDay || 1)), meta: `days until ${project.title || "Deadline"}`, kind: "hero" },
    { title: "Assets", value: assets.length, meta: "stacked by status", kind: "assets" },
    { title: "Shots", value: shots.length, meta: `${shots.filter((shot) => shot.status === "IN_PROGRESS").length} in progress`, kind: "shots" },
    { title: "Tasks", value: tracker.summary.totalTasks, meta: `${tracker.summary.reviewTasks} review / ${tracker.summary.heldTasks} hold`, kind: "tasks" },
    { title: "Velocity", value: velocity[velocity.length - 1], meta: velocity.join(" / "), kind: "velocity", series: velocity },
    { title: "Version Status", value: versions.length, meta: `${versionStatus.pending} pending · ${versionStatus.approved} approved`, kind: "versions", versionStatus },
    { title: "% Final by Department", value: percentText(tracker.summary.completionRate), meta: "pipeline close rate", kind: "final" },
    { title: "Project Crew", value: people.length, meta: "Name / Email / Login", kind: "crew" },
    { title: "Sequences", value: sequenceCount, meta: Array.from(new Set(shots.map((shot) => shot.sequence))).join(" / ") || "--", kind: "sequences" },
    { title: "Shot Status", value: shots.filter((shot) => shot.status === "FINAL").length, meta: "large donut equivalent", kind: "shot-status" },
    { title: "Asset Status", value: assets.filter((asset) => asset.status === "FINAL").length, meta: "horizontal bars", kind: "asset-status" },
    { title: "Latest Versions", value: versions.length, meta: "filmstrip review", kind: "latest" },
  ].map((row) => ({ ...row, tone: metrics.health.className }));
}

function trackingV2Data(tracker) {
  return {
    projectCards: trackingV2ProjectCards(tracker),
    shots: trackingV2ShotRows(tracker),
    assets: trackingV2AssetRows(tracker),
    tasks: trackingV2TaskRows(tracker),
    resource: trackingV2ResourceData(tracker),
    versions: vfxReviewRows(),
    insights: trackingV2InsightRows(tracker),
    phases: trackingV2PhaseRows(tracker),
    workOrders: trackingV2WorkOrderRows(tracker),
    calendarExceptions: trackingV2CalendarExceptionRows(),
    inbox: trackingV2InboxRows(tracker),
    adminUsers: trackingV2AdminRows(tracker),
    apiRoutes: trackingV2ApiRows(),
  };
}

function renderTrackingV2Surface(tracker) {
  const surface = document.querySelector("#trackingV2Surface");
  const toolbar = document.querySelector("#trackingV2Toolbar");
  const projectGrid = document.querySelector("#trackingV2ProjectGrid");
  const insights = document.querySelector("#trackingV2Insights");
  const tabs = document.querySelector("#trackingV2Tabs");
  const shotTable = document.querySelector("#trackingV2ShotTable");
  const assetTable = document.querySelector("#trackingV2AssetTable");
  const taskGantt = document.querySelector("#trackingV2TaskGantt");
  const resourcePlanning = document.querySelector("#trackingV2ResourcePlanning");
  const mediaCenter = document.querySelector("#trackingV2MediaCenter");
  const phaseBoard = document.querySelector("#trackingV2PhaseBoard");
  const workOrderBoard = document.querySelector("#trackingV2WorkOrderBoard");
  const inboxBoard = document.querySelector("#trackingV2InboxBoard");
  const adminBoard = document.querySelector("#trackingV2AdminBoard");
  if (!surface || !toolbar || !projectGrid || !insights || !tabs || !shotTable || !assetTable || !taskGantt || !resourcePlanning || !mediaCenter || !phaseBoard || !workOrderBoard || !inboxBoard || !adminBoard) return;
  const data = trackingV2Data(tracker);
  const activePanel = surface.dataset.activePanel || "projects";
  const visibleProjectCards = trackingV2VisibleProjectCards(data.projectCards);
  const projectView = trackerUiState.v2ProjectView || "grid";
  const roadmapRows = trackingV2PrdRoadmapRows(tracker, data);
  const roadmapWarnings = roadmapRows.filter((row) => row.tone === "warning").length;
  const roadmapReady = roadmapRows.filter((row) => row.tone === "good").length;

  toolbar.innerHTML = `
    <button type="button" data-workspace-view="overview" data-workspace-focus="trackingV2ProjectGrid">Add Project</button>
    <button type="button" data-v2-export="roadmap">Export Roadmap</button>
    <button type="button" data-v2-export="tasks">Export Tasks</button>
    <div class="v2-view-toggle" aria-label="Project view">
      <button type="button" class="${projectView === "grid" ? "active" : ""}" data-v2-project-view="grid" title="Grid view">▦</button>
      <button type="button" class="${projectView === "table" ? "active" : ""}" data-v2-project-view="table" title="Table view">☷</button>
      <button type="button" class="${projectView === "list" ? "active" : ""}" data-v2-project-view="list" title="List view">☰</button>
    </div>
    <label><span>Sort</span><select data-v2-project-sort>
      <option value="recent" ${trackerUiState.v2ProjectSort === "recent" ? "selected" : ""}>Risk first</option>
      <option value="name" ${trackerUiState.v2ProjectSort === "name" ? "selected" : ""}>Name</option>
      <option value="progress" ${trackerUiState.v2ProjectSort === "progress" ? "selected" : ""}>Progress</option>
      <option value="shots" ${trackerUiState.v2ProjectSort === "shots" ? "selected" : ""}>Shot count</option>
    </select></label>
    <button type="button" data-v2-project-action="group">Group</button>
    <button type="button" data-v2-project-action="fields">Fields</button>
    <button type="button" data-v2-project-action="more">More</button>
    <label><span>Search</span><input type="search" data-v2-project-search placeholder="project / code / status" value="${escapeHtml(trackerUiState.v2ProjectQuery || "")}" /></label>
    <button type="button" data-v2-project-action="filter">Filter</button>
    <span>${roadmapReady} ready · ${roadmapWarnings} blocked · 1 - ${visibleProjectCards.length} of ${Math.max(data.projectCards.length, 12)} Projects</span>
  `;

  projectGrid.dataset.view = projectView;
  projectGrid.innerHTML = `
    ${trackingV2ProjectViewMarkup(visibleProjectCards)}
    <div class="v2-roadmap-strip">
      <div><span>PRD Roadmap</span><strong>${roadmapReady}/${roadmapRows.length} frontend-ready</strong><small>静态原型完成度与后端工程化边界</small></div>
      ${roadmapRows
        .map(
          (row) => `
            <button class="${row.tone}" type="button" data-context-kind="prd-roadmap" data-context-title="${escapeHtml(row.label)}" data-context-meta="${escapeHtml(row.detail)}">
              <span>${escapeHtml(row.label)}</span>
              <strong>${escapeHtml(row.value)}</strong>
              <small>${escapeHtml(row.detail)}</small>
            </button>
          `,
        )
        .join("")}
    </div>
  `;

  insights.innerHTML = data.insights
    .map(
      (item) => {
        const collapsed = Boolean(trackerUiState.v2CollapsedInsights?.[item.kind]);
        return `
        <section class="v2-insight-widget ${item.kind}${collapsed ? " collapsed" : ""}">
          <header><button type="button" aria-label="Collapse" data-v2-insight-toggle="${escapeHtml(item.kind)}">${collapsed ? "›" : "⌄"}</button><strong>${escapeHtml(item.title)}</strong><button type="button" data-v2-insight-export="${escapeHtml(item.kind)}" aria-label="Export widget">⇩</button></header>
          <div class="v2-insight-summary"><b>${escapeHtml(String(item.value))}</b><small>${escapeHtml(item.meta)}</small></div>
          <div class="v2-insight-body" ${collapsed ? "hidden" : ""}>${trackingV2InsightBody(item, data, tracker)}</div>
        </section>
      `;
      },
    )
    .join("");

  tabs.innerHTML = [
    ["projects", "Projects"],
    ["shots", "Shots"],
    ["assets", "Assets"],
    ["tasks", "Tasks + Gantt"],
    ["resource", "Resource Planning"],
    ["media", "Media"],
    ["phases", "Phases"],
    ["workorders", "Work Orders"],
    ["inbox", "Inbox"],
    ["admin", "Admin / API"],
  ]
    .map(([key, label]) => `<button class="${activePanel === key ? "active" : ""}" type="button" data-tracking-v2-panel="${escapeHtml(key)}">${escapeHtml(label)}</button>`)
    .join("");

  const sequenceGroups = Array.from(
    data.shots.reduce((map, shot) => {
      if (!map.has(shot.sequence)) map.set(shot.sequence, []);
      map.get(shot.sequence).push(shot);
      return map;
    }, new Map()),
  );
  const selectedShot = trackingV2SelectedShot(data.shots);
  const selectedShotTasks = selectedShot?.tasks || [];
  shotTable.innerHTML = `
    <div class="v2-panel-head"><span>Shot Pipeline Table</span><strong>${data.shots.length} shots · ${selectedShot ? escapeHtml(selectedShot.code) : "No selection"}</strong></div>
    <div class="v2-shot-console">
      <div class="v2-shot-table">
        <div class="v2-shot-header">
          <span></span><span>Thumb</span><span>Shot Code</span><span>Status</span><span>Cut In</span><span>Cut Out</span><span>Dur</span>
          ${trackingV2PipelineSteps.map((step) => `<span style="--step:${step.color}">${escapeHtml(step.label)}</span>`).join("")}
          <span>Sequence</span><span>Description</span>
        </div>
        ${sequenceGroups
          .map(
            ([sequence, rows]) => `
              <div class="v2-sequence-row">${escapeHtml(sequence)} (${rows.length})</div>
              ${rows
                .map(
                  (shot) => `
                    <button class="v2-shot-row ${shot.id === selectedShot?.id ? "selected" : ""} ${trackingV2StatusClass(shot.status)}" type="button" data-v2-shot-select="${escapeHtml(shot.id)}" data-context-kind="tracker-shot" data-context-title="${escapeHtml(`${shot.code} · ${shot.title}`)}" data-context-meta="${escapeHtml(`${trackingV2StatusLabel(shot.status)} · ${percentText(shot.progress)}`)}">
                      <span class="v2-check" aria-hidden="true"></span>
                      <span class="v2-thumb">${escapeHtml(shot.sequence)}</span>
                      <strong>${escapeHtml(shot.code)}</strong>
                      <span>${trackingV2StatusDot(shot.status)}${escapeHtml(trackingV2StatusLabel(shot.status))}</span>
                      <span>${shot.cutIn}</span><span>${shot.cutOut}</span><span>${shot.cutDuration}</span>
                      ${trackingV2PipelineSteps.map((step) => `<span>${trackingV2StatusDot(shot.stepStatuses[step.key], step.label)}</span>`).join("")}
                      <span>${escapeHtml(shot.sequence)}</span>
                      <small>${escapeHtml(shot.title)} · ${escapeHtml(shot.location)}</small>
                    </button>
                  `,
                )
                .join("")}
            `,
          )
          .join("")}
      </div>
      <aside class="v2-shot-detail">
        <span>Shot Detail</span>
        <strong>${escapeHtml(selectedShot ? `${selectedShot.code} · ${selectedShot.title}` : "No shot selected")}</strong>
        <small>${escapeHtml(selectedShot ? `${selectedShot.sequence} · ${selectedShot.location} · updated ${selectedShot.updatedAt}` : "Select a shot row")}</small>
        <div class="v2-workorder-kpis">
          <p><b>${escapeHtml(trackingV2StatusLabel(selectedShot?.status || "WAITING_TO_START"))}</b><small>Status</small></p>
          <p><b>${selectedShotTasks.filter((task) => trackingV2TaskStatus(task.status) === "FINAL").length}/${selectedShotTasks.length}</b><small>Tasks final</small></p>
          <p><b>${selectedShot ? percentText(selectedShot.progress) : "0%"}</b><small>Progress</small></p>
        </div>
        <div class="v2-detail-task-list">
          <span>Pipeline Tasks</span>
          ${selectedShotTasks.map((task) => `<p><b>${escapeHtml(task.label)}</b><small>${trackingV2StatusDot(task.status)}${escapeHtml(task.assignee)} · D${task.dueDay}</small></p>`).join("") || `<p><b>No tasks</b><small>Waiting for schedule.</small></p>`}
        </div>
        <div class="v2-workorder-actions">
          <button type="button" data-v2-shot-status="IN_PROGRESS" data-v2-shot-id="${escapeHtml(selectedShot?.id || "")}">Start</button>
          <button type="button" data-v2-shot-status="PENDING_REVIEW" data-v2-shot-id="${escapeHtml(selectedShot?.id || "")}">Review</button>
          <button type="button" data-v2-shot-status="FINAL" data-v2-shot-id="${escapeHtml(selectedShot?.id || "")}">Final</button>
          <button type="button" data-v2-shot-status="ON_HOLD" data-v2-shot-id="${escapeHtml(selectedShot?.id || "")}">Hold</button>
        </div>
      </aside>
    </div>
  `;

  const assetGroups = Array.from(
    data.assets.reduce((map, asset) => {
      if (!map.has(asset.typeLabel)) map.set(asset.typeLabel, []);
      map.get(asset.typeLabel).push(asset);
      return map;
    }, new Map()),
  );
  const selectedAsset = trackingV2SelectedAsset(data.assets);
  assetTable.innerHTML = `
    <div class="v2-panel-head"><span>Asset Pipeline Table</span><strong>${data.assets.length} assets · ${selectedAsset ? escapeHtml(selectedAsset.name) : "No selection"}</strong></div>
    <div class="v2-asset-console">
      <div class="v2-asset-table">
        ${assetGroups
          .map(
            ([type, rows]) => `
              <div class="v2-sequence-row">${escapeHtml(type)} (${rows.length})</div>
              ${rows
                .map(
                  (asset) => `
                    <button class="v2-asset-row ${asset.id === selectedAsset?.id ? "selected" : ""} ${trackingV2StatusClass(asset.status)}" type="button" data-v2-asset-select="${escapeHtml(asset.id)}" data-context-kind="tracker-asset" data-context-title="${escapeHtml(`${asset.code} · ${asset.name}`)}" data-context-meta="${escapeHtml(`${asset.typeLabel} · ${trackingV2StatusLabel(asset.status)}`)}">
                      <span class="v2-check" aria-hidden="true"></span>
                      <span class="v2-large-thumb"><i>▶</i></span>
                      <strong>${escapeHtml(asset.name)}</strong>
                      <span>${escapeHtml(asset.typeLabel)}</span>
                      <span>${trackingV2StatusDot(asset.status)}${escapeHtml(trackingV2StatusLabel(asset.status))}</span>
                      ${trackingV2AssetSteps.map((step) => `<span>${trackingV2StatusDot(asset.stepStatuses[step.key], step.label)}</span>`).join("")}
                      <small>${escapeHtml(asset.note || "No notes")}</small>
                      <span>${escapeHtml(asset.linkedShots.join(", "))}</span>
                      <span>${escapeHtml(asset.sequence)}</span>
                      <span>${asset.openNotes}</span>
                    </button>
                  `,
                )
                .join("")}
            `,
          )
          .join("")}
      </div>
      <aside class="v2-asset-detail">
        <span>Asset Detail</span>
        <strong>${escapeHtml(selectedAsset ? `${selectedAsset.name}` : "No asset selected")}</strong>
        <small>${escapeHtml(selectedAsset ? `${selectedAsset.typeLabel} · ${selectedAsset.sequence} · updated ${selectedAsset.updatedAt}` : "Select an asset row")}</small>
        <div class="v2-workorder-kpis">
          <p><b>${escapeHtml(trackingV2StatusLabel(selectedAsset?.status || "WAITING_TO_START"))}</b><small>Status</small></p>
          <p><b>${selectedAsset?.linkedShots?.length || 0}</b><small>Linked shots</small></p>
          <p><b>${selectedAsset?.openNotes || 0}</b><small>Open notes</small></p>
        </div>
        <div class="v2-asset-links">
          <span>Linked Shots</span>
          ${(selectedAsset?.linkedShots || []).map((code) => `<b>${escapeHtml(code)}</b>`).join("") || `<b>No linked shots</b>`}
        </div>
        <p>${escapeHtml(selectedAsset?.note || "No notes.")}</p>
        <div class="v2-workorder-actions">
          <button type="button" data-v2-asset-status="IN_PROGRESS" data-v2-asset-id="${escapeHtml(selectedAsset?.id || "")}">Start</button>
          <button type="button" data-v2-asset-status="PENDING_REVIEW" data-v2-asset-id="${escapeHtml(selectedAsset?.id || "")}">Review</button>
          <button type="button" data-v2-asset-status="FINAL" data-v2-asset-id="${escapeHtml(selectedAsset?.id || "")}">Final</button>
          <button type="button" data-v2-asset-status="ON_HOLD" data-v2-asset-id="${escapeHtml(selectedAsset?.id || "")}">Hold</button>
        </div>
      </aside>
    </div>
  `;

  const taskDependencies = trackingV2TaskDependencies(data.tasks);
  const editableTask = trackingV2SelectedTask(data.tasks);
  const dateOptions = trackingV2DateOptions(editableTask);
  taskGantt.innerHTML = `
    <div class="v2-panel-head"><span>Task Table + Gantt</span><strong>Gantt Display</strong><button type="button" data-v2-export="tasks">Export CSV</button></div>
    <div class="v2-task-gantt">
      <div class="v2-task-list">
        <div class="v2-task-header">
          <span>Task</span><span>Status / Assignee</span><span>Reviewer</span><span>Dates</span><span>Bid</span><span>Logged</span><span>Cost +/-</span>
        </div>
        ${data.tasks
          .map(
            (task) => `
              <div class="v2-task-row ${task.overUnder > 0 ? "over" : ""}${editableTask?.id === task.id ? " selected" : ""}" data-context-kind="tracker-task" data-context-title="${escapeHtml(`${task.shotCode} · ${task.name}`)}" data-context-meta="${escapeHtml(`${trackingV2StatusLabel(task.status)} · ${task.assignee}`)}" data-tracker-task-id="${escapeHtml(task.id)}">
                <strong>${escapeHtml(task.shotCode)} · ${escapeHtml(task.label)}</strong>
                <span>${trackingV2StatusDot(task.status)}${escapeHtml(task.assignee)}</span>
                <span>${escapeHtml(task.reviewer)}</span>
                <button class="v2-date-chip" type="button" data-v2-date-editor="${escapeHtml(task.id)}">${task.startDate} → ${task.dueDate}</button>
                <em>${task.bid}d</em>
                <em>${formatProgressNumber(task.logged)}d · ${percentText(task.loggedPct)}</em>
                <b>${task.costOverUnder > 0 ? "+" : ""}${money.format(task.costOverUnder)}</b>
              </div>
            `,
          )
          .join("")}
      </div>
      <div class="v2-gantt-lanes">
        ${data.tasks
          .map(
            (task) => `
              <div class="v2-gantt-lane">
                <span class="v2-gantt-bar ${trackingV2StatusClass(task.status)}" style="left:${task.left}; width:${task.width}" title="${escapeHtml(`${task.name} · ${task.assignee} · D${task.start}-D${task.end}`)}">${escapeHtml(task.label)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
    <div class="v2-task-workbench">
      <section class="v2-date-editor">
        <div>
          <span>Inline Date Picker</span>
          <strong>${escapeHtml(editableTask ? `${editableTask.shotCode} · ${editableTask.label}` : "No task")}</strong>
        </div>
        <div class="v2-date-grid">
          ${dateOptions
            .map((day) => {
              const selected = editableTask && day >= editableTask.start && day <= editableTask.end;
              return `<button type="button" class="${selected ? "selected" : ""}" data-v2-date-set="${escapeHtml(editableTask?.id || "")}" data-v2-day="${day}">D${day}</button>`;
            })
            .join("")}
        </div>
        <small>${editableTask ? `${escapeHtml(editableTask.assignee)} · ${trackingV2StatusLabel(editableTask.status)} · ${editableTask.bid} bid days` : "Select a task row to edit dates."}</small>
      </section>
      <section class="v2-dependency-board">
        <div><span>Task Dependencies</span><strong>${taskDependencies.length} links</strong></div>
        ${taskDependencies
          .map(
            (link) => `
              <p class="${escapeHtml(link.risk)}">
                <b>${escapeHtml(link.type)}</b>
                <span>${escapeHtml(link.predecessor.label)} → ${escapeHtml(link.successor.label)}</span>
                <em>${link.lag > 0 ? `+${link.lag}d lag` : "same-day handoff"}</em>
              </p>
            `,
          )
          .join("")}
      </section>
    </div>
  `;

  const inspectRows = trackerUiState.v2InspectGroup === "project" ? data.resource.projectRows : data.resource.rows;
  const inspectWeek = data.resource.weeks[Math.max(0, Math.min(data.resource.weeks.length - 1, Number(trackerUiState.v2InspectWeek) || 0))] || data.resource.weeks[0];
  const heatmapRows = trackerUiState.v2InspectGroup === "project" ? data.resource.projectRows : data.resource.rows;
  resourcePlanning.innerHTML = `
    <div class="v2-panel-head"><span>Resource Planning</span><strong>Weekly · Person Days</strong><button type="button" data-v2-export="resources">Export CSV</button></div>
    <div class="v2-resource-toolbar">
      <span>Studio / All Departments</span>
      <button type="button">Weekly</button>
      <button type="button" class="${trackerUiState.v2ResourceChart === "area" ? "active" : ""}" data-v2-resource-chart="area">Area Chart</button>
      <button type="button" class="${trackerUiState.v2ResourceChart === "heatmap" ? "active" : ""}" data-v2-resource-chart="heatmap">Workload Heatmap</button>
      <button type="button" data-v2-inspect-group="${trackerUiState.v2InspectGroup === "project" ? "department" : "project"}">Inspect by ${trackerUiState.v2InspectGroup === "project" ? "Department" : "Project"}</button>
      <button type="button" data-v2-export="resources">Export</button>
    </div>
    ${
      trackerUiState.v2ResourceChart === "heatmap"
        ? `<div class="v2-workload-heatmap">
            <div class="v2-heatmap-head"><span>${trackerUiState.v2InspectGroup === "project" ? "Project" : "Department"}</span>${data.resource.weeks.map((week) => `<span>${escapeHtml(week.range)}</span>`).join("")}</div>
            ${heatmapRows
              .map(
                (row) => `
                  <div class="v2-heatmap-row">
                    <strong>${escapeHtml(row.label || row.name)}</strong>
                    ${row.cells.map((cell) => `<button type="button" class="${cell.delta > 0 ? "over" : cell.workload === 0 ? "none" : "under"}" data-v2-resource-cell="${escapeHtml(row.id)}" data-v2-week="${cell.index}" title="${escapeHtml(`${cell.range} · ${cell.workload}/${cell.capacity} days`)}">${cell.delta > 0 ? "+" : ""}${cell.delta}<small>${cell.workload}/${cell.capacity}</small></button>`).join("")}
                  </div>
                `,
              )
              .join("")}
            <div class="v2-heatmap-legend"><span>Under Utilized</span><i></i><b>Over Utilized</b><em>Not Utilized</em></div>
          </div>`
        : `<div class="v2-capacity-chart">
            ${data.resource.totals
              .map(
                (week) => `
                  <button type="button" class="v2-capacity-week ${week.delta > 0 ? "over" : "under"}${week.index === data.resource.selectedWeek ? " selected" : ""}" data-v2-inspect-week="${week.index}">
                    <span>${escapeHtml(week.label)}</span>
                    <i style="height:${Math.max(8, Math.min(88, (week.workload / Math.max(week.capacity, 1)) * 64))}px"></i>
                    <b>${week.delta > 0 ? `+${week.delta}` : week.delta}</b>
                  </button>
                `,
              )
              .join("")}
          </div>`
    }
    <div class="v2-inspect-grid">
      <div>
        <span>Inspect Chart Data · ${trackerUiState.v2InspectGroup === "project" ? "Project" : "Department"} · ${escapeHtml(inspectWeek?.range || "")}</span>
        ${inspectRows
          .slice(0, 5)
          .map((row) => {
            const week = row.cells[inspectWeek?.index || 0];
            return `<p><strong>${escapeHtml(row.label || row.name)}</strong><em>${week.capacity}</em><em>${week.workload}</em><b class="${week.delta > 0 ? "over" : "under"}">${week.delta > 0 ? "+" : ""}${week.delta}</b></p>`;
          })
          .join("")}
      </div>
      <div>
        <span>${data.resource.selectedRow ? `Tasks · ${escapeHtml(data.resource.selectedRow.label || data.resource.selectedRow.name)}` : "Task Popover"}</span>
        ${(data.resource.selectedCell?.tasks || [])
          .map((row) => {
            return `<p><strong>${escapeHtml(`${row.shotCode} · ${row.label}`)}</strong><em>D${row.start}</em><em>D${row.end}</em><b class="${row.status === "ON_HOLD" ? "over" : "under"}">${escapeHtml(row.assignee)}</b></p>`;
          })
          .join("") || `<p><strong>No assigned tasks</strong><em>0</em><em>0</em><b class="under">idle</b></p>`}
      </div>
    </div>
    <div class="v2-resource-grid">
      <div class="v2-resource-head"><span>Department</span>${data.resource.weeks.map((week) => `<span>${escapeHtml(week.range)}</span>`).join("")}</div>
      <div class="v2-resource-row v2-resource-special">
        <strong>Days Over/Under</strong>
        ${data.resource.totals.map((cell) => `<span class="${cell.delta > 0 ? "over" : cell.workload === 0 ? "none" : "under"}">${cell.delta > 0 ? `+${cell.delta}` : cell.delta}<small>${cell.workload}/${cell.capacity}</small></span>`).join("")}
      </div>
      <div class="v2-resource-row v2-resource-special">
        <strong>Unassigned Workload</strong>
        ${data.resource.unassigned.map((cell) => `<span class="${cell.workload > 0 ? "over" : "none"}">${cell.workload}<small>unassigned</small></span>`).join("")}
      </div>
      ${data.resource.rows
        .map(
          (row) => `
            <div class="v2-resource-row">
              <strong>${escapeHtml(row.department.name)}</strong>
              ${row.cells.map((cell) => `<button type="button" class="${cell.delta > 0 ? "over" : cell.workload === 0 ? "none" : "under"}${row.id === data.resource.selectedKey && cell.index === data.resource.selectedWeek ? " selected" : ""}${cell.exception ? " exception" : ""}" data-v2-resource-cell="${escapeHtml(row.id)}" data-v2-week="${cell.index}">${cell.delta > 0 ? `+${cell.delta}` : cell.delta}<small>${cell.exception ? `${cell.exception.label}` : `${cell.workload}/${cell.capacity}`}</small></button>`).join("")}
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="v2-task-popover">
      <div>
        <span>Task Popover · ${escapeHtml(data.resource.weeks[data.resource.selectedWeek]?.range || "")}</span>
        <strong>${escapeHtml(data.resource.selectedRow?.label || data.resource.selectedRow?.name || "No row selected")}</strong>
        <small>${data.resource.selectedCell ? `${data.resource.selectedCell.workload} of ${data.resource.selectedCell.capacity} Days Assigned` : "Click a resource cell"}</small>
      </div>
      <div class="v2-mini-gantt">
        ${(data.resource.selectedCell?.tasks || [])
          .map(
            (task) => `
              <button type="button" data-context-kind="tracker-task" data-context-title="${escapeHtml(`${task.shotCode} · ${task.name}`)}" data-context-meta="${escapeHtml(`${trackingV2StatusLabel(task.status)} · ${task.assignee}`)}" data-tracker-task-id="${escapeHtml(task.id)}">
                <span>${escapeHtml(`${task.shotCode} · ${task.label}`)}</span>
                <i class="${trackingV2StatusClass(task.status)}" style="left:${task.left}; width:${task.width}"></i>
                <em>${escapeHtml(task.assignee)}</em>
              </button>
            `,
          )
          .join("") || `<p>No tasks in this week.</p>`}
      </div>
    </div>
  `;

  const selectedVersion = trackingV2SelectedVersion(data.versions);
  const selectedVersionStatus = trackingV2VersionTaskStatus(selectedVersion);
  const selectedVersionNotes = trackingV2VersionNotes(selectedVersion);
  const compareVersion = trackingV2CompareVersion(data.versions, selectedVersion);
  const playlist = trackingV2MediaPlaylist(data.versions);
  mediaCenter.innerHTML = `
    <div class="v2-panel-head"><span>Media Review / Version Player</span><strong>${selectedVersion ? `${escapeHtml(selectedVersion.shotGroup)} · ${escapeHtml(selectedVersion.version)}` : "No Version"}</strong><button type="button" data-v2-export="media">Export CSV</button></div>
    <div class="v2-media-playlist">
      <div><span>Playlist</span><strong>${playlist.rows.length} versions · ${playlist.approvedShots}/${playlist.totalShots || 0} approved</strong><small>${money.format(playlist.amount)} · ${percentText(playlist.approvalRate)} pass rate</small></div>
      <div>${playlist.rows.map((version) => `<button type="button" data-v2-review-select="${escapeHtml(version.id)}">${escapeHtml(`${version.shotGroup} ${version.version}`)}</button>`).join("") || `<span>No playlist rows</span>`}</div>
      <button type="button" data-v2-playlist-clear>Clear</button>
    </div>
    <div class="v2-media-review">
      <div class="v2-version-player">
        <span>${selectedVersion?.media?.previewUrl ? `<img src="${escapeHtml(selectedVersion.media.previewUrl)}" alt="${escapeHtml(selectedVersion.version)}" />` : "▶"}</span>
        <strong>${escapeHtml(selectedVersion ? `${selectedVersion.shotGroup} · ${selectedVersion.version}` : "No active version")}</strong>
        <small>${escapeHtml(selectedVersion?.action || "Select a version to review notes and approval status.")}</small>
        <div class="v2-review-meter">
          <span><b style="width:${Math.round(Math.max(0.04, Math.min(selectedVersion?.approvalRate || 0, 1)) * 100)}%"></b></span>
          <em>${selectedVersion ? `${selectedVersion.approvedCount}/${selectedVersion.shotCount} approved` : "0/0 approved"}</em>
        </div>
        <div class="v2-review-actions">
          <button type="button" data-v2-review-decision="approved" data-v2-review-id="${escapeHtml(selectedVersion?.id || "")}">Approve</button>
          <button type="button" data-v2-review-decision="notes" data-v2-review-id="${escapeHtml(selectedVersion?.id || "")}">Changes</button>
          <button type="button" data-v2-review-decision="blocked" data-v2-review-id="${escapeHtml(selectedVersion?.id || "")}">Hold</button>
          <button type="button" data-v2-playlist-toggle="${escapeHtml(selectedVersion?.id || "")}">${trackingV2MediaPlaylistIds.includes(selectedVersion?.id) ? "Remove" : "Playlist"}</button>
        </div>
      </div>
      <div class="v2-note-stream">
        <span>Notes Stream</span>
        <div class="v2-version-meta">
          <strong>${trackingV2StatusDot(selectedVersionStatus)}${escapeHtml(trackingV2VersionStatusLabel(selectedVersion))}</strong>
          <small>${escapeHtml(selectedVersion ? `${selectedVersion.vendor} · ${selectedVersion.reviewer} · ${vfxPaymentGateLabels[selectedVersion.paymentGate] || selectedVersion.paymentGate}` : "Waiting for review")}</small>
        </div>
        ${selectedVersionNotes.map((note) => `<p><b>${escapeHtml(selectedVersion?.reviewer || "Reviewer")}</b><small>${escapeHtml(note)}</small></p>`).join("") || `<p><b>System</b><small>No notes yet</small></p>`}
        <div class="v2-review-checklist">
          <span>Supervisor Checklist</span>
          <label><input type="checkbox" ${selectedVersion?.status === "approved" ? "checked" : ""} disabled /> 版本可进入付款关口</label>
          <label><input type="checkbox" ${selectedVersion?.notes ? "checked" : ""} disabled /> 批注已写入审阅记录</label>
          <label><input type="checkbox" ${selectedVersion?.media?.fileName ? "checked" : ""} disabled /> 媒体文件 / 缩略图已绑定</label>
        </div>
      </div>
    </div>
    <div class="v2-version-compare">
      <section>
        <span>A / Current</span>
        <strong>${escapeHtml(selectedVersion ? `${selectedVersion.shotGroup} · ${selectedVersion.version}` : "No version")}</strong>
        <small>${escapeHtml(selectedVersion ? `${trackingV2VersionStatusLabel(selectedVersion)} · ${selectedVersion.reviewer} · ${money.format(trackingV2VersionAmount(selectedVersion))}` : "Select a version")}</small>
        <i><b style="width:${Math.round(Math.max(0.04, Math.min(selectedVersion?.approvalRate || 0, 1)) * 100)}%"></b></i>
      </section>
      <section>
        <span>B / Compare</span>
        <strong>${escapeHtml(compareVersion ? `${compareVersion.shotGroup} · ${compareVersion.version}` : "No comparison")}</strong>
        <small>${escapeHtml(compareVersion ? `${trackingV2VersionStatusLabel(compareVersion)} · ${compareVersion.reviewer} · ${money.format(trackingV2VersionAmount(compareVersion))}` : "Choose another version")}</small>
        <i><b style="width:${Math.round(Math.max(0.04, Math.min(compareVersion?.approvalRate || 0, 1)) * 100)}%"></b></i>
      </section>
    </div>
    <div class="v2-filmstrip">
      ${data.versions
        .map(
          (version) => `
            <div class="v2-version-tile">
              <button class="v2-version-card ${version.id === selectedVersion?.id ? "selected" : ""} ${trackingV2StatusClass(trackingV2VersionTaskStatus(version))}" type="button" data-v2-review-select="${escapeHtml(version.id)}" data-context-kind="vfx-review" data-context-review-id="${escapeHtml(version.id)}" data-context-title="${escapeHtml(`${version.shotGroup} · ${version.version}`)}" data-context-meta="${escapeHtml(`${version.vendor} · ${trackingV2VersionStatusLabel(version)}`)}">
                <span class="v2-version-thumb">${version.media?.previewUrl ? `<img src="${escapeHtml(version.media.previewUrl)}" alt="${escapeHtml(version.version)}" />` : "▶"}</span>
                <strong>${escapeHtml(version.shotGroup)} · ${escapeHtml(version.version)}</strong>
                <small>${trackingV2StatusDot(trackingV2VersionTaskStatus(version))}${escapeHtml(version.vendor)} · ${escapeHtml(vfxPaymentGateLabels[version.paymentGate] || version.paymentGate)}</small>
                <span class="v2-version-card-actions">
                  <em>${trackingV2MediaPlaylistIds.includes(version.id) ? "In playlist" : "Queue"}</em>
                </span>
              </button>
              <button class="v2-version-compare-button" type="button" data-v2-compare-select="${escapeHtml(version.id)}">Compare</button>
            </div>
          `,
        )
        .join("") || `<div class="producer-empty">暂无版本。</div>`}
    </div>
  `;

  phaseBoard.innerHTML = `
    <div class="v2-panel-head"><span>Phases + Calendar Exceptions</span><strong>${data.phases.length} phases · ${data.calendarExceptions.length} exceptions</strong><button type="button" data-v2-calendar-add>Add Exception</button><button type="button" data-v2-export="calendar">Export CSV</button></div>
    <div class="v2-phase-board">
      <div class="v2-phase-list">
        ${data.phases.map((phase) => `
          <button class="v2-phase-row ${trackingV2StatusClass(phase.status)}" type="button" data-context-kind="tracker-phase" data-context-title="${escapeHtml(phase.name)}" data-context-meta="${escapeHtml(`${phase.owner} · D${phase.start}-D${phase.end}`)}">
            <strong>${escapeHtml(phase.name)}</strong>
            <span>${trackingV2StatusDot(phase.status)}${escapeHtml(phase.owner)}</span>
            <em>D${phase.start} → D${phase.end}</em>
            <small>${escapeHtml(phase.deliverable)} · ${phase.taskCount} tasks</small>
          </button>
        `).join("")}
      </div>
      <div class="v2-phase-lanes">
        ${data.phases.map((phase) => `
          <div class="v2-phase-lane">
            <span style="left:${Math.max(0, ((phase.start - 1) / Math.max(project.plannedDays || 1, 1)) * 100)}%; width:${Math.max(5, ((phase.end - phase.start + 1) / Math.max(project.plannedDays || 1, 1)) * 100)}%">${escapeHtml(percentText(phase.progress))}</span>
          </div>
        `).join("")}
      </div>
      <div class="v2-calendar-exceptions">
        <span>Calendar Exceptions</span>
        ${data.calendarExceptions.map((item) => `<p><b>${escapeHtml(item.date)}</b><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.impact)} · ${escapeHtml(item.inheritedFrom)}${item.note ? ` · ${escapeHtml(item.note)}` : ""}</small><button type="button" data-v2-calendar-close="${escapeHtml(item.id)}">Close</button></p>`).join("")}
      </div>
    </div>
  `;

  const selectedWorkOrder = trackingV2SelectedWorkOrder(data.workOrders);
  workOrderBoard.innerHTML = `
    <div class="v2-panel-head"><span>Work Orders</span><strong>${data.workOrders.filter((row) => row.status !== "Closed").length} open / queued</strong></div>
    <div class="v2-workorder-console">
      <div class="v2-workorder-table">
        <div class="v2-workorder-head"><span>Type</span><span>Title</span><span>Owner</span><span>Status</span><span>Due</span><span>Amount</span></div>
        ${data.workOrders.map((row) => `
          <button class="v2-workorder-row ${row.id === selectedWorkOrder?.id ? "selected" : ""} ${row.status === "Blocked" ? "hold" : row.status === "Closed" ? "final" : "in-progress"}" type="button" data-v2-workorder-select="${escapeHtml(row.id)}" data-context-kind="tracker-workorder" data-context-title="${escapeHtml(row.title)}" data-context-meta="${escapeHtml(`${row.owner} · ${row.status}`)}">
            <span>${escapeHtml(row.type)}</span>
            <strong>${escapeHtml(row.title)}<small>${escapeHtml(row.description)}</small></strong>
            <span>${escapeHtml(row.owner)}</span>
            <span>${escapeHtml(row.status)}</span>
            <span>${escapeHtml(row.due)}</span>
            <b>${money.format(row.amount || 0)}</b>
          </button>
        `).join("")}
      </div>
      <aside class="v2-workorder-detail">
        <span>Selected Work Order</span>
        <strong>${escapeHtml(selectedWorkOrder?.title || "No work order")}</strong>
        <small>${escapeHtml(selectedWorkOrder ? `${selectedWorkOrder.type} · ${selectedWorkOrder.route} · ${selectedWorkOrder.priority}` : "Select a work order")}</small>
        <div class="v2-workorder-kpis">
          <p><b>${escapeHtml(selectedWorkOrder?.status || "-")}</b><small>Status</small></p>
          <p><b>${escapeHtml(selectedWorkOrder?.due || "-")}</b><small>Due</small></p>
          <p><b>${selectedWorkOrder ? money.format(selectedWorkOrder.amount || 0) : "¥0"}</b><small>Amount</small></p>
        </div>
        <p>${escapeHtml(selectedWorkOrder?.nextAction || "No next action.")}</p>
        <div class="v2-workorder-actions">
          <button type="button" data-v2-workorder-status="Open" data-v2-workorder-id="${escapeHtml(selectedWorkOrder?.id || "")}">Open</button>
          <button type="button" data-v2-workorder-status="Blocked" data-v2-workorder-id="${escapeHtml(selectedWorkOrder?.id || "")}">Block</button>
          <button type="button" data-v2-workorder-status="Closed" data-v2-workorder-id="${escapeHtml(selectedWorkOrder?.id || "")}">Close</button>
        </div>
      </aside>
    </div>
  `;

  const selectedInbox = trackingV2SelectedInbox(data.inbox);
  inboxBoard.innerHTML = `
    <div class="v2-panel-head"><span>Inbox / My Tasks</span><strong>${data.inbox.filter((item) => item.status !== "FINAL").length} routed items</strong></div>
    <div class="v2-inbox-console">
      <div class="v2-inbox-board">
        ${["producer", "supervisor", "reviewer"].map((role) => `
          <section>
            <h5>${escapeHtml(role)}</h5>
            ${data.inbox.filter((item) => item.role === role).map((item) => `
              <button type="button" class="v2-inbox-row ${item.id === selectedInbox?.id ? "selected" : ""} ${trackingV2StatusClass(item.status)}" data-v2-inbox-select="${escapeHtml(item.id)}" data-context-kind="tracker-inbox" data-context-title="${escapeHtml(item.title)}" data-context-meta="${escapeHtml(item.meta)}">
                <strong>${escapeHtml(item.title)}</strong>
                <span>${trackingV2StatusDot(item.status)}${escapeHtml(item.target)} · ${escapeHtml(item.sla)}</span>
                <small>${escapeHtml(item.meta)}</small>
              </button>
            `).join("") || `<div class="v2-empty-mini">No routed items</div>`}
          </section>
        `).join("")}
      </div>
      <aside class="v2-inbox-detail">
        <span>Routed Item</span>
        <strong>${escapeHtml(selectedInbox?.title || "No routed item")}</strong>
        <small>${escapeHtml(selectedInbox ? `${selectedInbox.role} · ${selectedInbox.target} · ${selectedInbox.updatedAt}` : "Select an item")}</small>
        <p>${escapeHtml(selectedInbox?.action || "No action required.")}</p>
        <div class="v2-inbox-route">
          <b>${trackingV2StatusDot(selectedInbox?.status || "WAITING_TO_START")}${escapeHtml(trackingV2StatusLabel(selectedInbox?.status || "WAITING_TO_START"))}</b>
          <em>${escapeHtml(selectedInbox?.sla || "No SLA")}</em>
        </div>
        <div class="v2-workorder-actions">
          <button type="button" data-v2-inbox-status="PENDING_REVIEW" data-v2-inbox-id="${escapeHtml(selectedInbox?.id || "")}">Review</button>
          <button type="button" data-v2-inbox-status="ON_HOLD" data-v2-inbox-id="${escapeHtml(selectedInbox?.id || "")}">Hold</button>
          <button type="button" data-v2-inbox-status="FINAL" data-v2-inbox-id="${escapeHtml(selectedInbox?.id || "")}">Done</button>
        </div>
      </aside>
    </div>
  `;

  const selectedAdminUser = trackingV2SelectedAdminUser(data.adminUsers);
  const selectedApiRoute = trackingV2SelectedApiRoute(data.apiRoutes);
  const permissionRows = trackingV2PermissionMatrix(selectedAdminUser?.role || "artist");
  const adminEvents = pipelineEvents.filter((event) => /^Admin\.|^API\./u.test(event.action || "")).slice(0, 5);
  const blockedRoutes = data.apiRoutes.filter((route) => route.status === "Blocked").length;
  adminBoard.innerHTML = `
    <div class="v2-panel-head"><span>Admin Users + API Map</span><strong>${data.adminUsers.length} users · ${data.apiRoutes.length} endpoints · ${blockedRoutes} blocked</strong><button type="button" data-v2-export="api">Export API</button></div>
    <div class="v2-admin-console">
      <section class="v2-admin-users">
        <h5>Users / Roles</h5>
        ${data.adminUsers.map((user) => `
          <button class="v2-admin-user ${user.id === selectedAdminUser?.id ? "selected" : ""}" type="button" data-v2-admin-user="${escapeHtml(user.id)}" data-context-kind="tracker-user" data-context-title="${escapeHtml(user.name)}" data-context-meta="${escapeHtml(`${trackerRoleLabel(user.role)} · ${user.email}`)}">
            <span>${escapeHtml(user.name.slice(0, 2))}</span>
            <strong>${escapeHtml(user.name)}<small>${escapeHtml(user.email)}</small></strong>
            <em>${escapeHtml(trackerRoleLabel(user.role))}</em>
            <b>${escapeHtml(user.permission)}</b>
          </button>
        `).join("")}
      </section>
      <section class="v2-admin-detail">
        <h5>Permission Console</h5>
        <div class="v2-admin-profile">
          <span>${escapeHtml(selectedAdminUser?.name.slice(0, 2) || "U")}</span>
          <strong>${escapeHtml(selectedAdminUser?.name || "No user")}<small>${escapeHtml(selectedAdminUser ? `${selectedAdminUser.title || selectedAdminUser.department || "Team"} · ${selectedAdminUser.login}` : "Select a user")}</small></strong>
          <b>${escapeHtml(selectedAdminUser ? `${selectedAdminUser.tasks} tasks · trust ${selectedAdminUser.trust}` : "No data")}</b>
        </div>
        <div class="v2-role-switcher">
          ${["admin", "producer", "supervisor", "artist", "reviewer"].map((role) => `<button type="button" class="${selectedAdminUser?.role === role ? "active" : ""}" data-v2-admin-role="${escapeHtml(role)}" data-v2-admin-id="${escapeHtml(selectedAdminUser?.id || "")}">${escapeHtml(trackerRoleLabel(role))}</button>`).join("")}
        </div>
        <div class="v2-permission-grid">
          ${permissionRows.map((row) => `
            <p class="${row.enabled ? "enabled" : "disabled"}"><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(row.labelValue)}</span></p>
          `).join("")}
        </div>
      </section>
      <section class="v2-api-console">
        <h5>REST API Readiness</h5>
        ${data.apiRoutes.map((route) => `
          <button class="v2-api-row ${route.id === selectedApiRoute?.id ? "selected" : ""} ${route.status.toLowerCase()}" type="button" data-v2-api-route="${escapeHtml(route.id)}" data-context-kind="tracker-api" data-context-title="${escapeHtml(route.endpoint)}" data-context-meta="${escapeHtml(`${route.method} · ${route.status}`)}">
            <b>${escapeHtml(route.method)}</b>
            <code>${escapeHtml(route.endpoint)}</code>
            <span>${escapeHtml(route.status)} · ${escapeHtml(route.purpose)}</span>
          </button>
        `).join("")}
      </section>
      <aside class="v2-api-detail">
        <h5>Endpoint Gate</h5>
        <strong>${escapeHtml(selectedApiRoute?.endpoint || "No endpoint")}</strong>
        <small>${escapeHtml(selectedApiRoute ? `${selectedApiRoute.method} · owner ${selectedApiRoute.owner} · ${selectedApiRoute.updatedAt}` : "Select an API route")}</small>
        <div class="v2-api-status-actions">
          ${["Ready", "Mock", "Blocked"].map((status) => `<button type="button" class="${selectedApiRoute?.status === status ? "active" : ""}" data-v2-api-status="${escapeHtml(status)}" data-v2-api-id="${escapeHtml(selectedApiRoute?.id || "")}">${escapeHtml(status)}</button>`).join("")}
        </div>
        <div class="v2-api-payload">
          <span>Response Shape</span>
          <code>{ data: ${escapeHtml(selectedApiRoute?.purpose || "resource")}, error: null }</code>
        </div>
        <div class="v2-admin-events">
          <span>Audit Events</span>
          ${adminEvents.map((event) => `<p><b>${escapeHtml(event.label)}</b><small>${escapeHtml(`${event.entityType} · ${event.status}`)}</small></p>`).join("") || `<p><b>No admin events</b><small>Role/API changes will appear here.</small></p>`}
        </div>
      </aside>
    </div>
  `;

  const panelMap = {
    projects: [projectGrid, insights],
    shots: [shotTable],
    assets: [assetTable],
    tasks: [taskGantt],
    resource: [resourcePlanning],
    media: [mediaCenter],
    phases: [phaseBoard],
    workorders: [workOrderBoard],
    inbox: [inboxBoard],
    admin: [adminBoard],
  };
  [projectGrid, insights, shotTable, assetTable, taskGantt, resourcePlanning, mediaCenter, phaseBoard, workOrderBoard, inboxBoard, adminBoard].forEach((node) => {
    node.hidden = true;
  });
  (panelMap[activePanel] || panelMap.projects).forEach((node) => {
    node.hidden = false;
  });
}

function productionTrackingData() {
  const metrics = analysisMetrics();
  const production = productionDashboardData();
  const audit = auditSummaryData();
  const flow = fundFlowReadableData(10);
  const vfxRows = vfxSupplierAuditRows();
  const reviewVersionRows = vfxReviewRows();
  const today = callSheets.find((sheet) => sheet.day === project.currentDay) || callSheets[callSheets.length - 1] || null;
  const scheduleItems = production.schedule.slice(0, 6).map((row) => {
    const tone = trackingToneFromRisk(row.risk);
    return {
      label: row.title,
      owner: row.owner,
      type: "阶段",
      status: row.status,
      range: `D${row.start}-D${row.end}`,
      amount: row.progressLabel,
      meta: `${row.taskCount} 项任务`,
      tone,
      target: "progress",
      focus: "productionScheduleBoard",
    };
  });
  const callsheetItems = callSheets
    .slice()
    .sort((a, b) => Math.abs(a.day - project.currentDay) - Math.abs(b.day - project.currentDay))
    .slice(0, 3)
    .map((sheet) => {
      const total = dayTotal(sheet);
      const dayBudget = project.budget > 0 ? project.budget / Math.max(project.plannedDays || 1, 1) : total;
      const tone = total > dayBudget * 1.25 ? "warning" : total > dayBudget ? "note" : "good";
      return {
        label: sheet.title,
        owner: sheet.location,
        type: "通告",
        status: sheet.day < project.currentDay ? "已完成" : sheet.day === project.currentDay ? "今日执行" : "计划中",
        range: `D${sheet.day}`,
        amount: money.format(total),
        meta: `${sheet.departments.length} 部门 · ${sheet.extra.vehicles} 车 / ${sheet.extra.rooms} 房`,
        tone,
        target: "callsheet",
        focus: "callsheetDetail",
      };
    });
  const vfxItems = vfxRows.slice(0, 3).map((row) => ({
    label: row.vendor,
    owner: row.departments.join(" / ") || "VFX / 调色",
    type: "VFX",
    status: row.status,
    range: `交付 ${percentText(row.progressRate)}`,
    amount: money.format(row.usedAmount),
    meta: `合同 ${money.format(row.contractAmount)} · 信任 ${row.trust}`,
    tone: trackingToneFromRisk(row.risk),
    target: "audit",
    focus: "vfxSupplierAudit",
  }));
  const versionItems = reviewVersionRows.slice(0, 4).map((row) => ({
    label: `${row.shotGroup} · ${row.version}`,
    owner: row.vendor,
    type: "版本",
    status: vfxReviewStatusLabels[row.status]?.label || "待审",
    range: `${row.approvedCount}/${row.shotCount} 通过`,
    amount: row.amount > 0 ? money.format(row.amount) : vfxPaymentGateLabels[row.paymentGate],
    meta: `${row.reviewer} · ${vfxPaymentGateLabels[row.paymentGate]}`,
    tone: trackingToneFromRisk(row.risk),
    target: "audit",
    focus: "vfxVersionList",
  }));
  const rows = [...scheduleItems, ...callsheetItems, ...vfxItems, ...versionItems]
    .sort((a, b) => {
      const weight = { warning: 0, note: 1, good: 2 };
      return weight[a.tone] - weight[b.tone];
    })
    .slice(0, 10);
  const resourceRows = [
    {
      label: "人员 / 演员",
      value: `${people.length} 人`,
      detail: `${people.filter(isActorPerson).length} 位演员 · ${new Set(people.map((person) => person.vendor || "个人 / 自由职业")).size} 个公司/个体`,
      amount: money.format(people.reduce((sum, person) => sum + personTotal(person), 0)),
      target: "personnel",
    },
    {
      label: "器材 / 设备",
      value: `${equipment.length} 项`,
      detail: `${new Set(equipment.map((item) => item.vendor || "未登记公司")).size} 个供应商 · 押金 ${money.format(equipment.reduce((sum, item) => sum + item.deposit, 0))}`,
      amount: money.format(equipment.reduce((sum, item) => sum + equipmentTotal(item), 0)),
      target: "equipment",
    },
    {
      label: "车辆 / 酒店 / 场地",
      value: `${callSheets.reduce((sum, sheet) => sum + sheet.extra.vehicles, 0)} 车`,
      detail: `${callSheets.reduce((sum, sheet) => sum + sheet.extra.rooms, 0)} 房 · 场地 ${money.format(callSheets.reduce((sum, sheet) => sum + (sheet.extra.locationFee || 0), 0))}`,
      amount: money.format(callSheets.reduce((sum, sheet) => sum + dayProductionCost(sheet), 0)),
      target: "fundflow",
    },
    {
      label: "VFX / 后期供应商",
      value: `${vfxRows.length} 个`,
      detail: `${reviewVersionRows.length} 个版本 · ${vfxRows.filter((row) => row.risk !== "ok").length + reviewVersionRows.filter((row) => row.risk !== "ok").length} 项需复核`,
      amount: money.format(vfxRows.reduce((sum, row) => sum + row.contractAmount, 0)),
      target: "audit",
      focus: "vfxVersionList",
    },
  ];
  const reviewRows = [
    ...audit.items.slice(0, 4).map((item) => ({
      label: item.name,
      status: auditRiskLabel(item.risk),
      detail: item.reason,
      amount: money.format(item.amount),
      tone: item.risk === "high" ? "warning" : item.risk === "medium" ? "note" : "good",
      target: "audit",
    })),
    ...vfxRows
      .filter((row) => row.risk !== "ok" || row.gap > 0.12)
      .slice(0, 2)
      .map((row) => ({
        label: row.vendor,
        status: row.status,
        detail: `已用 ${percentText(row.paymentRate)} / 交付 ${percentText(row.progressRate)}`,
        amount: money.format(row.usedAmount),
        tone: trackingToneFromRisk(row.risk),
        target: "audit",
        focus: "vfxSupplierAudit",
      })),
    ...reviewVersionRows
      .filter((row) => row.risk !== "ok")
      .slice(0, 3)
      .map((row) => ({
        label: `${row.shotGroup} · ${row.version}`,
        status: vfxReviewStatusLabels[row.status]?.label || "待审",
        detail: `${row.vendor} · ${row.approvedCount}/${row.shotCount} 通过 · ${vfxPaymentGateLabels[row.paymentGate]}`,
        amount: row.amount > 0 ? money.format(row.amount) : "未匹配金额",
        tone: trackingToneFromRisk(row.risk),
        target: "audit",
        focus: "vfxVersionList",
      })),
  ].slice(0, 6);
  const budgetRate = project.budget > 0 ? metrics.spent / project.budget : 0;
  const tracker = productionTrackerWorkflowData();
  const kpis = [
    { label: "追踪项", value: rows.length, detail: `${production.schedule.length} 阶段 · ${callSheets.length} 通告`, tone: rows.some((row) => row.tone === "warning") ? "warning" : "good" },
    { label: "完成进度", value: percentText(production.progressRate), detail: `当前 D${project.currentDay}/${project.plannedDays}`, tone: production.delayed > 0 ? "warning" : production.tight > 0 ? "note" : "good" },
    { label: "预算消耗", value: percentText(budgetRate), detail: money.format(metrics.spent), tone: budgetRate > production.progressRate + 0.12 ? "warning" : budgetRate > production.progressRate + 0.06 ? "note" : "good" },
    { label: "资产追踪", value: tracker.summary.totalAssets, detail: `${tracker.summary.assetReviewCount} 项需复核`, tone: tracker.summary.assetReviewCount > 0 ? "note" : "good" },
    { label: "任务审阅", value: tracker.summary.reviewTasks, detail: `${tracker.summary.versionCount} 版本 · ${tracker.summary.heldTasks} 暂停`, tone: tracker.summary.heldTasks > 0 ? "warning" : tracker.summary.reviewTasks > 0 ? "note" : "good" },
    { label: "资金流", value: flow.supplierCount, detail: flow.statusLabel, tone: flow.unclassifiedUsed > 0 || flow.overAllocated > 0 ? "warning" : flow.unallocated > 0 ? "note" : "good" },
  ];
  return { rows, resourceRows, reviewRows, kpis, today, tracker };
}

function renderProductionTrackingConsole() {
  const container = document.querySelector("#productionTrackingConsole");
  const badge = document.querySelector("#productionTrackingBadge");
  const kpiNode = document.querySelector("#trackingConsoleKpis");
  const workflowBadge = document.querySelector("#trackingWorkflowBadge");
  const shotGrid = document.querySelector("#trackingShotGrid");
  const taskStack = document.querySelector("#trackingTaskStack");
  const workloadPanel = document.querySelector("#trackingWorkloadPanel");
  const taskDetail = document.querySelector("#trackingTaskDetail");
  const prdStatus = document.querySelector("#trackingPrdStatus");
  const assetBoard = document.querySelector("#trackingAssetBoard");
  const prdSuite = document.querySelector("#trackingPrdSuite");
  const projectBoard = document.querySelector("#trackingProjectBoard");
  const myTaskBoard = document.querySelector("#trackingMyTaskBoard");
  const userBoard = document.querySelector("#trackingUserBoard");
  const reportBoard = document.querySelector("#trackingReportBoard");
  const table = document.querySelector("#trackingConsoleTable");
  const resources = document.querySelector("#trackingResourceList");
  const reviews = document.querySelector("#trackingReviewList");
  if (!container || !badge || !kpiNode || !workflowBadge || !shotGrid || !taskStack || !workloadPanel || !taskDetail || !prdStatus || !assetBoard || !prdSuite || !projectBoard || !myTaskBoard || !userBoard || !reportBoard || !table || !resources || !reviews) return;
  const data = productionTrackingData();
  const warningCount = data.rows.filter((row) => row.tone === "warning").length + data.reviewRows.filter((row) => row.tone === "warning").length;
  const noteCount = data.rows.filter((row) => row.tone === "note").length + data.reviewRows.filter((row) => row.tone === "note").length;
  const tracker = data.tracker;
  const prdData = trackerPrdSuiteData(tracker);
  renderTrackingV2Surface(tracker);
  const allAssignees = Array.from(new Set(tracker.allTasks.map((task) => task.assignee).filter(Boolean))).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  const filteredShots = trackerFilteredShots(tracker);
  if (trackerUiState.expandedShotCode && !filteredShots.some((shot) => shot.code === trackerUiState.expandedShotCode)) {
    trackerUiState.expandedShotCode = "";
  }
  const visibleTasks = trackerVisibleTasks(tracker);
  const expandedShot = tracker.shotRows.find((shot) => shot.code === trackerUiState.expandedShotCode);
  badge.textContent = warningCount > 0 ? `${warningCount} 项阻塞` : noteCount > 0 ? `${noteCount} 项待复核` : "追踪稳定";
  badge.className = `status-pill ${warningCount > 0 ? "warning" : noteCount > 0 ? "note" : "good"}`;
  workflowBadge.textContent = tracker.summary.heldTasks > 0 ? `${tracker.summary.heldTasks} 项暂停` : tracker.summary.reviewTasks > 0 ? `${tracker.summary.reviewTasks} 项待审` : "任务流稳定";
  workflowBadge.className = `status-pill ${tracker.summary.heldTasks > 0 ? "warning" : tracker.summary.reviewTasks > 0 ? "note" : "good"}`;
  kpiNode.innerHTML = data.kpis
    .map(
      (item) => {
        const kpiTarget =
          {
            资金流: { view: "fundflow", focus: "fundFlowChart" },
            资产追踪: { view: "overview", focus: "trackingAssetBoard" },
            任务审阅: { view: "audit", focus: "vfxVersionList" },
          }[item.label] || { view: "progress", focus: "productionScheduleBoard" };
        return `
        <button class="tracking-kpi ${item.tone}" type="button" data-workspace-view="${escapeHtml(kpiTarget.view)}" data-workspace-focus="${escapeHtml(kpiTarget.focus)}">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(String(item.value))}</strong>
          <small>${escapeHtml(item.detail)}</small>
        </button>
      `;
      },
    )
    .join("");
  shotGrid.innerHTML =
    tracker.shotRows.length > 0
      ? `
        <div class="tracking-filter-bar" aria-label="ShotGrid 过滤">
          <label>
            <span>Status</span>
            <select id="trackingStatusFilter">
              ${trackerStatusOptions().map((option) => `<option value="${escapeHtml(option.value)}" ${trackerUiState.status === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>Assignee</span>
            <select id="trackingAssigneeFilter">
              <option value="all" ${trackerUiState.assignee === "all" ? "selected" : ""}>全部负责人</option>
              ${allAssignees.map((name) => `<option value="${escapeHtml(name)}" ${trackerUiState.assignee === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}
            </select>
          </label>
          <button type="button" data-tracker-filter-reset>重置</button>
          <strong>${filteredShots.length}/${tracker.shotRows.length} shots</strong>
        </div>
        <div class="tracking-shot-header">
          <span>Code</span>
          <span>镜头 / 场次</span>
          <span>Tasks</span>
          <span>版本</span>
          <span>Due</span>
          <span>Assignees</span>
          <span>Progress</span>
        </div>
        ${filteredShots
          .slice(0, 9)
          .map((shot) => {
            const versionCount = shot.tasks.reduce((sum, task) => sum + task.versionCount, 0);
            const contextMeta = `${shot.tasks.length} tasks · ${Math.round(shot.progress * 100)}% · ${shot.warning} risk`;
            const expanded = trackerUiState.expandedShotCode === shot.code;
            return `
              <button class="tracking-shot-row ${shot.tone}${expanded ? " expanded" : ""}" type="button" data-context-kind="tracker-shot" data-context-title="${escapeHtml(`${shot.code} · ${shot.title}`)}" data-context-meta="${escapeHtml(contextMeta)}" data-tracker-shot-code="${escapeHtml(shot.code)}" data-workspace-view="progress" data-workspace-focus="shotPipelineBoard" aria-expanded="${expanded ? "true" : "false"}">
                <span class="tracking-shot-code">${escapeHtml(shot.code)}</span>
                <span class="tracking-shot-title">
                  <strong>${escapeHtml(shot.title)}</strong>
                  <small>${escapeHtml(shot.location)} · ${shot.pages} 页 · ${shot.needsVfx ? "含 VFX" : "常规"}</small>
                </span>
                <span class="tracking-task-counts">
                  <b>${shot.complete}</b><i>OK</i>
                  <b>${shot.pending}</b><i>Review</i>
                  <b>${shot.warning}</b><i>Risk</i>
                </span>
                <span>${versionCount}</span>
                <span>D${shot.dueDay}</span>
                <span class="tracking-assignee-stack">${shot.assignees.map((name) => `<i>${escapeHtml(String(name).slice(0, 2))}</i>`).join("") || "<i>--</i>"}</span>
                <span class="tracking-row-progress"><i><b style="width:${Math.round(Math.max(0.04, Math.min(shot.progress, 1)) * 100)}%"></b></i><b>${Math.round(shot.progress * 100)}%</b></span>
              </button>
              ${
                expanded
                  ? `<div class="tracking-shot-linked-tasks">
                      ${shot.tasks
                        .map(
                          (task) => `
                            <button type="button" class="${trackerStatusTone(task.status)}" data-context-kind="tracker-task" data-context-title="${escapeHtml(`${shot.code} · ${task.name}`)}" data-context-meta="${escapeHtml(`${trackerStatusLabel(task.status)} · ${task.assignee}`)}" data-tracker-task-id="${escapeHtml(task.id)}">
                              <span class="tracker-status ${trackerStatusClass(task.status)}">${escapeHtml(trackerStatusLabel(task.status))}</span>
                              <strong>${escapeHtml(task.label)}</strong>
                              <small>${escapeHtml(task.assignee)} · D${task.dueDay} · ${task.versionCount} version</small>
                            </button>
                          `,
                        )
                        .join("")}
                    </div>`
                  : ""
              }
            `;
          })
          .join("") || `<div class="producer-empty">没有符合筛选条件的镜头。</div>`}
      `
      : `<div class="producer-empty">暂无镜头。录入场次后会生成 Shot / Task 矩阵。</div>`;
  taskStack.innerHTML =
    visibleTasks.length > 0
      ? `
          <div class="tracking-task-stack-head">
            <span>${expandedShot ? `${expandedShot.code} linked tasks` : "Priority tasks"}</span>
            <strong>${visibleTasks.length} 项</strong>
          </div>
        ${visibleTasks
          .map((task) => {
            const statusClass = trackerStatusClass(task.status);
            const statusLabel = trackerStatusLabel(task.status);
            const versionText = task.latestVersion ? `${task.latestVersion.version} · ${task.latestVersion.vendor}` : `${task.versionCount} version`;
            const selected = selectedInspectorTarget?.trackerTaskId === task.id;
            return `
              <button class="tracking-task-card ${trackerStatusTone(task.status)}${selected ? " inspector-selected" : ""}" type="button" data-context-kind="tracker-task" data-context-title="${escapeHtml(`${task.shotCode} · ${task.name}`)}" data-context-meta="${escapeHtml(`${statusLabel} · ${task.assignee}`)}" data-tracker-task-id="${escapeHtml(task.id)}" data-workspace-view="${task.status === "PENDING_REVIEW" || task.status === "CHANGES_REQUESTED" ? "audit" : "progress"}" data-workspace-focus="${task.status === "PENDING_REVIEW" || task.status === "CHANGES_REQUESTED" ? "vfxVersionList" : "productionScheduleBoard"}">
                <span class="tracker-status ${statusClass}">${escapeHtml(statusLabel)}</span>
                <strong>${escapeHtml(task.shotCode)} · ${escapeHtml(task.name)}</strong>
                <small>${escapeHtml(task.shotTitle)} · ${escapeHtml(task.assignee)} · D${task.dueDay}</small>
                <span class="tracking-task-meta">
                  <em>${escapeHtml(versionText)}</em>
                  <em>${task.noteCount} notes</em>
                </span>
              </button>
            `;
          })
          .join("")}`
      : `<div class="producer-empty">暂无待处理任务。</div>`;
  taskDetail.innerHTML = renderTrackerTaskDetail(trackerTaskDetailTarget(tracker), tracker);
  renderTrackerPrdStatus(tracker);
  assetBoard.innerHTML = `
    <div class="tracking-asset-head">
      <div>
        <span>Assets</span>
        <strong>资产追踪</strong>
      </div>
      <em>${tracker.summary.totalAssets} 项 · ${tracker.summary.assetReviewCount} 项需复核</em>
    </div>
    <div class="tracking-asset-grid">
      ${tracker.assetRows
        .map((asset) => {
          const statusClass = trackerStatusClass(asset.status);
          const tone = trackerStatusTone(asset.status);
          return `
            <button class="tracking-asset-card ${tone}" type="button" data-context-kind="tracker-asset" data-context-title="${escapeHtml(`${asset.code} · ${asset.name}`)}" data-context-meta="${escapeHtml(`${trackerAssetTypeLabel(asset.type)} · ${asset.owner}`)}" data-tracker-asset-id="${escapeHtml(asset.id)}" data-workspace-view="${escapeHtml(asset.target)}" data-workspace-focus="${escapeHtml(asset.focus)}">
              <span class="tracker-status ${statusClass}">${escapeHtml(trackerStatusLabel(asset.status))}</span>
              <strong>${escapeHtml(asset.code)} · ${escapeHtml(asset.name)}</strong>
              <small>${escapeHtml(trackerAssetTypeLabel(asset.type))} · ${escapeHtml(asset.owner)}</small>
              <i><b style="width:${Math.round(Math.max(0.04, Math.min(asset.progress || 0, 1)) * 100)}%"></b></i>
              <span class="tracking-asset-meta">
                <em>${escapeHtml(asset.ownerMeta)}</em>
                <em>${escapeHtml(money.format(asset.amount || 0))}</em>
              </span>
              <p>${escapeHtml(asset.note || "等待资产管线状态")}</p>
            </button>
          `;
        })
        .join("") || `<div class="producer-empty">暂无资产。录入演员、器材、场次或 VFX 版本后会生成。</div>`}
    </div>
  `;
  projectBoard.innerHTML =
    prdData.projectRows.length > 0
      ? prdData.projectRows
          .map(
            (row) => `
              <button class="tracking-prd-row ${row.tone}${row.current ? " current" : ""}" type="button" data-context-kind="tracker-project" data-context-title="${escapeHtml(row.name)}" data-context-meta="${escapeHtml(`${row.code} · ${money.format(row.budget || 0)}`)}" data-tracker-project-id="${escapeHtml(row.id)}" data-workspace-view="overview" data-workspace-focus="productionTrackingConsole">
                <span class="tracking-prd-code">${escapeHtml(row.code)}</span>
                <span class="tracking-prd-main">
                  <strong>${escapeHtml(row.name)}</strong>
                  <small>${row.current ? "当前项目" : `保存 ${escapeHtml(row.updated)}`} · ${row.shotCount} shots · ${row.assetCount} assets</small>
                </span>
                <em>${escapeHtml(percentText(row.progress || 0))}</em>
              </button>
            `,
          )
          .join("")
      : `<div class="producer-empty">暂无项目。点击顶部保存后会进入项目库。</div>`;
  myTaskBoard.innerHTML = `
    <div class="tracking-role-filter" aria-label="我的任务角色筛选">
      ${[
        ["all", "全部"],
        ["producer", "Producer"],
        ["artist", "Artist"],
        ["reviewer", "Reviewer"],
      ]
        .map((item) => `<button type="button" class="${trackerUiState.role === item[0] ? "active" : ""}" data-tracker-role-filter="${escapeHtml(item[0])}">${escapeHtml(item[1])}</button>`)
        .join("")}
    </div>
    ${
      prdData.myTaskRows.length > 0
        ? prdData.myTaskRows
            .map(
              (task) => `
                <button class="tracking-prd-task ${trackerStatusTone(task.status)}" type="button" data-context-kind="tracker-task" data-context-title="${escapeHtml(`${task.shotCode} · ${task.name}`)}" data-context-meta="${escapeHtml(`${trackerRoleLabel(task.userRole)} · ${trackerStatusLabel(task.status)}`)}" data-tracker-task-id="${escapeHtml(task.id)}" data-workspace-view="${escapeHtml(task.sourceType === "producer-action" ? task.target : task.status === "PENDING_REVIEW" || task.status === "CHANGES_REQUESTED" ? "audit" : "progress")}" data-workspace-focus="${escapeHtml(task.sourceType === "producer-action" ? task.focus : task.status === "PENDING_REVIEW" || task.status === "CHANGES_REQUESTED" ? "vfxVersionList" : "productionScheduleBoard")}">
                  <span class="tracker-status ${trackerStatusClass(task.status)}">${escapeHtml(trackerStatusLabel(task.status))}</span>
                  <strong>${escapeHtml(task.shotCode)} · ${escapeHtml(task.label)}</strong>
                  <small>${escapeHtml(task.assignee)} · ${escapeHtml(trackerRoleLabel(task.userRole))} · D${task.dueDay}</small>
                  <em>${escapeHtml(task.sourceType === "producer-action" ? money.format(task.amount || 0) : task.latestVersion ? task.latestVersion.version : `${task.versionCount} version`)}</em>
                </button>
              `,
            )
            .join("")
        : `<div class="producer-empty">当前角色暂无任务。</div>`
    }
  `;
  userBoard.innerHTML =
    prdData.userRows
      .slice(0, 8)
      .map(
        (user) => `
          <button class="tracking-user-row ${user.tone}" type="button" data-context-kind="tracker-user" data-context-title="${escapeHtml(user.name)}" data-context-meta="${escapeHtml(`${trackerRoleLabel(user.role)} · ${user.email}`)}" data-tracker-user-id="${escapeHtml(user.id)}" data-workspace-view="${escapeHtml(user.target)}" data-workspace-focus="${escapeHtml(user.focus)}">
            <span class="tracking-avatar">${escapeHtml(user.name.slice(0, 2))}</span>
            <span>
              <strong>${escapeHtml(user.name)}</strong>
              <small>${escapeHtml(user.title)} · ${escapeHtml(user.vendor)}</small>
            </span>
            <b>${escapeHtml(trackerRoleLabel(user.role))}</b>
            <em>${user.tasks} tasks</em>
          </button>
        `,
      )
      .join("") || `<div class="producer-empty">暂无团队成员。录入人员后会显示权限建议。</div>`;
  reportBoard.innerHTML =
    prdData.reportRows
      .map(
        (report) => `
          <button class="tracking-report-row ${report.tone}" type="button" data-context-kind="tracker-report" data-context-title="${escapeHtml(report.label)}" data-context-meta="${escapeHtml(report.endpoint)}" data-tracker-report-id="${escapeHtml(report.id)}" data-workspace-view="${escapeHtml(report.target)}" data-workspace-focus="${escapeHtml(report.focus)}">
            <span>
              <strong>${escapeHtml(report.label)}</strong>
              <code>${escapeHtml(report.endpoint)}</code>
            </span>
            <b>${escapeHtml(report.value)}</b>
            <small>${escapeHtml(report.detail)}</small>
          </button>
        `,
      )
      .join("");
  const maxWorkloadHours = Math.max(1, ...tracker.workloadRows.map((row) => row.hours));
  workloadPanel.innerHTML = `
    <div class="tracking-workload-summary">
      <div><span>任务完成</span><strong>${tracker.summary.approvedTasks}/${tracker.summary.totalTasks}</strong><small>${percentText(tracker.summary.completionRate)}</small></div>
      <div><span>实际剩余</span><strong>${tracker.summary.actualRemaining}</strong><small>计划 ${tracker.summary.plannedRemaining}</small></div>
      <div><span>日关闭</span><strong>${formatProgressNumber(tracker.summary.dailyCloseNeeded)}</strong><small>tasks/day</small></div>
    </div>
    <div class="tracking-burndown-mini" aria-label="任务燃尽">
      <span style="height:${Math.max(8, Math.min(96, (tracker.summary.plannedRemaining / Math.max(tracker.summary.totalTasks, 1)) * 96))}%"><b>Plan</b></span>
      <span class="${tracker.summary.actualRemaining > tracker.summary.plannedRemaining ? "warning" : ""}" style="height:${Math.max(8, Math.min(96, (tracker.summary.actualRemaining / Math.max(tracker.summary.totalTasks, 1)) * 96))}%"><b>Actual</b></span>
    </div>
    <div class="tracking-workload-list">
      ${tracker.workloadRows
        .map(
          (row) => `
            <button class="tracking-workload-row ${row.tone}" type="button" data-context-kind="tracker-workload" data-context-title="${escapeHtml(row.name)}" data-context-meta="${escapeHtml(`${formatProgressNumber(row.hours)}h · ${row.activeTasks} tasks`)}" data-workspace-view="progress" data-workspace-focus="workHourDashboard">
              <span>
                <strong>${escapeHtml(row.name)}</strong>
                <small>${escapeHtml(row.role || getDept(row.dept).name)} · ${row.dayCount} 天 · ${row.overtime} 次加班</small>
              </span>
              <i><b style="width:${Math.max(6, (row.hours / maxWorkloadHours) * 100)}%"></b></i>
              <em>${formatProgressNumber(row.hours)}h / ${row.activeTasks} tasks</em>
            </button>
          `,
        )
        .join("") || `<div class="producer-empty">暂无工作量数据。</div>`}
    </div>
  `;
  table.innerHTML =
    data.rows.length > 0
      ? data.rows
          .map(
            (row) => `
              <button class="tracking-row ${row.tone}" type="button" data-context-kind="tracking" data-context-title="${escapeHtml(row.label)}" data-context-meta="${escapeHtml(`${row.type} · ${row.owner}`)}" data-workspace-view="${escapeHtml(row.target)}" ${row.focus ? `data-workspace-focus="${escapeHtml(row.focus)}"` : ""}>
                <span class="tracking-row-type">${escapeHtml(row.type)}</span>
                <span class="tracking-row-main">
                  <strong>${escapeHtml(row.label)}</strong>
                  <small>${escapeHtml(row.owner)} · ${escapeHtml(row.meta)}</small>
                </span>
                <span class="tracking-row-range">${escapeHtml(row.range)}</span>
                <span class="tracking-row-amount">${escapeHtml(row.amount)}</span>
                <span class="tracking-row-status">${escapeHtml(row.status || trackingStatusText(row.tone))}</span>
              </button>
            `,
          )
          .join("")
      : `<div class="producer-empty">暂无生产追踪项。录入通告、排期或 VFX 进度后会显示。</div>`;
  resources.innerHTML = data.resourceRows
    .map(
      (row) => `
        <button class="tracking-resource-row" type="button" data-context-kind="tracking" data-context-title="${escapeHtml(row.label)}" data-context-meta="${escapeHtml(row.detail)}" data-workspace-view="${escapeHtml(row.target)}" ${row.focus ? `data-workspace-focus="${escapeHtml(row.focus)}"` : ""}>
          <span>
            <strong>${escapeHtml(row.label)}</strong>
            <small>${escapeHtml(row.detail)}</small>
          </span>
          <b>${escapeHtml(row.value)}</b>
          <em>${escapeHtml(row.amount)}</em>
        </button>
      `,
    )
    .join("");
  reviews.innerHTML =
    data.reviewRows.length > 0
      ? data.reviewRows
          .map(
            (row) => `
              <button class="tracking-review-row ${row.tone}" type="button" data-context-kind="tracking" data-context-title="${escapeHtml(row.label)}" data-context-meta="${escapeHtml(row.detail)}" data-workspace-view="${escapeHtml(row.target)}" ${row.focus ? `data-workspace-focus="${escapeHtml(row.focus)}"` : ""}>
                <span>
                  <strong>${escapeHtml(row.label)}</strong>
                  <small>${escapeHtml(row.detail)}</small>
                </span>
                <b>${escapeHtml(row.status)}</b>
                <em>${escapeHtml(row.amount)}</em>
              </button>
            `,
          )
          .join("")
      : `<div class="producer-empty">审查队列为空。</div>`;
}

function pipelinePathSegment(value, fallback = "untitled") {
  const text = String(value || fallback).trim() || fallback;
  return text
    .replace(/[\\/:*?"<>|#%{}^~`[\]]+/gu, "-")
    .replace(/\s+/gu, "_")
    .replace(/_+/gu, "_")
    .slice(0, 44)
    .replace(/^[-_.]+|[-_.]+$/gu, "") || fallback;
}

function pipelineToneFromIssueCount(count, hasWarnings = false) {
  if (count > 0) return "warning";
  if (hasWarnings) return "note";
  return "good";
}

function pipelineQueueRows(input) {
  const {
    projectToken,
    shotToken,
    deptToken,
    dateToken,
    reviewRows,
    production,
    flow,
    audit,
    activeDepartment,
  } = input;
  const rows = [];
  const toneWeight = { warning: 0, note: 1, good: 2 };

  reviewRows.slice(0, 6).forEach((row) => {
    const versionToken = pipelinePathSegment(row.version || "v001", "v001");
    const shotGroupToken = pipelinePathSegment(row.shotGroup || shotToken, "shot");
    const vendorToken = pipelinePathSegment(row.vendor || "vendor", "vendor");
    const status = vfxReviewStatusLabels[row.status]?.label || "待审";
    const payment = vfxPaymentGateLabels[row.paymentGate] || "付款关口";
    rows.push({
      id: `review-${row.id}`,
      kind: "review",
      type: "Review",
      label: `${row.shotGroup} · ${row.version}`,
      owner: row.vendor,
      stage: `${status} / ${payment}`,
      amount: row.amount > 0 ? money.format(row.amount) : "未匹配金额",
      amountValue: row.amount || 0,
      progress: row.approvalRate,
      progressLabel: `${row.approvedCount}/${row.shotCount} 通过`,
      action: row.action,
      path: `项目/${projectToken}/reviews/${vendorToken}/${shotGroupToken}/${versionToken}`,
      tone: row.risk === "high" ? "warning" : row.risk === "medium" ? "note" : "good",
      target: "audit",
      focus: "vfxVersionList",
      reviewId: row.id,
      packageText: [
        `Review: ${row.shotGroup} ${row.version}`,
        `Vendor: ${row.vendor}`,
        `Status: ${status} / ${payment}`,
        `Approval: ${row.approvedCount}/${row.shotCount}`,
        `Path: 项目/${projectToken}/reviews/${vendorToken}/${shotGroupToken}/${versionToken}`,
        `Action: ${row.action}`,
      ].join("\n"),
    });
  });

  production.schedule.slice(0, 5).forEach((task) => {
    const taskToken = pipelinePathSegment(task.title || "task", "task");
    const taskPath = `项目/${projectToken}/shots/${shotToken}/${deptToken}/${taskToken}/work`;
    rows.push({
      id: `work-${task.id}`,
      kind: "work",
      type: "Work",
      label: task.title,
      owner: task.owner || activeDepartment.name || "未指派",
      stage: `${task.status} / 工作文件`,
      amount: task.progressLabel || percentText(task.progressRate || 0),
      amountValue: 0,
      progress: task.progressRate || 0,
      progressLabel: task.progressLabel || percentText(task.progressRate || 0),
      action: task.progressRate >= 1 ? "可发布阶段快照，归档工作文件和通告依据。" : "阶段未完成，先同步负责人、工时和当天交付状态。",
      path: taskPath,
      tone: task.risk === "over" || task.risk === "high" ? "warning" : task.risk === "tight" || (task.progressRate || 0) < 0.45 ? "note" : "good",
      target: "progress",
      focus: "productionScheduleBoard",
      taskId: task.id,
      packageText: [
        `Work: ${task.title}`,
        `Owner: ${task.owner || "未指派"}`,
        `Range: D${task.start}-D${task.end}`,
        `Status: ${task.status} / ${task.progressLabel || percentText(task.progressRate || 0)}`,
        `Path: ${taskPath}`,
      ].join("\n"),
    });
  });

  flow.detailRows.slice(0, 6).forEach((detail) => {
    const vendorToken = pipelinePathSegment(detail.label || "vendor", "vendor");
    const detailPath = `项目/${projectToken}/deliveries/${vendorToken}/${dateToken}`;
    rows.push({
      id: `load-${pipelinePathSegment(`${detail.department}-${detail.type}-${detail.label}`, "detail")}`,
      kind: "load",
      type: "Load",
      label: detail.label,
      owner: detail.department,
      stage: detail.type,
      amount: money.format(detail.value),
      amountValue: detail.value || 0,
      progress: Math.min(1, Math.max(0.08, detail.share || 0)),
      progressLabel: percentText(detail.share || 0),
      action: "加载供应商交付，核对合同、发票、资源数量和付款节点。",
      path: detailPath,
      tone: detail.share > 0.18 ? "note" : "good",
      target: "fundflow",
      focus: "fundFlowDetailTable",
      packageText: [
        `Load: ${detail.label}`,
        `Department: ${detail.department}`,
        `Type: ${detail.type}`,
        `Amount: ${money.format(detail.value)}`,
        `Path: ${detailPath}`,
      ].join("\n"),
    });
  });

  audit.items
    .filter((item) => item.risk === "high" || item.risk === "medium")
    .slice(0, 4)
    .forEach((item) => {
      const itemToken = pipelinePathSegment(item.name || "audit", "audit");
      const gatePath = `项目/${projectToken}/finance/audit/${itemToken}/evidence`;
      rows.push({
        id: `gate-${itemToken}`,
        kind: "gate",
        type: "Gate",
        label: item.name,
        owner: item.kind,
        stage: auditRiskLabel(item.risk),
        amount: money.format(item.amount),
        amountValue: item.amount || 0,
        progress: item.risk === "high" ? 0.24 : 0.56,
        progressLabel: item.evidence || "待补凭证",
        action: item.reason,
        path: gatePath,
        tone: item.risk === "high" ? "warning" : "note",
        target: "audit",
        focus: "auditTableBody",
        packageText: [
          `Gate: ${item.name}`,
          `Kind: ${item.kind}`,
          `Risk: ${auditRiskLabel(item.risk)}`,
          `Amount: ${money.format(item.amount)}`,
          `Evidence: ${item.evidence}`,
          `Path: ${gatePath}`,
          `Reason: ${item.reason}`,
        ].join("\n"),
      });
    });

  return rows
    .sort((a, b) => {
      const toneSort = (toneWeight[a.tone] ?? 2) - (toneWeight[b.tone] ?? 2);
      return toneSort || (b.amountValue || 0) - (a.amountValue || 0);
    })
    .slice(0, 14);
}

function pipelineCoreData() {
  const metrics = analysisMetrics();
  const audit = auditSummaryData();
  const flow = fundFlowReadableData(8);
  const progress = activeProgressStats();
  const production = productionDashboardData();
  const activeSheet = callSheets.find((sheet) => sheet.day === project.currentDay) || callSheets[callSheets.length - 1] || null;
  const activeSceneCode = activeSheet?.scenes?.[0] || scenes[0]?.code || "SH000";
  const activeScene = scenes.find((scene) => scene.code === activeSceneCode) || scenes[0] || null;
  const topDepartment = departmentAnalysisRows()[0]?.department || null;
  const activeDepartmentId = activeSheet?.departments?.find((id) => departments.some((department) => department.id === id)) || topDepartment?.id || departments[0]?.id || "production";
  const activeDepartment = getDept(activeDepartmentId);
  const task = selectedScheduleTask() || production.schedule[0] || null;
  const reviewRows = vfxReviewRows();
  const vfxRows = vfxSupplierAuditRows();
  const reviewRow = reviewRows[0] || null;
  const vendor =
    reviewRow?.vendor ||
    vfxRows[0]?.vendor ||
    equipment.find((item) => item.vendor && item.vendor !== "未登记公司")?.vendor ||
    people.find((person) => person.vendor && person.vendor !== "个人 / 自由职业")?.vendor ||
    "未登记供应商";
  const projectName = project.title || "当前项目";
  const projectToken = pipelinePathSegment(projectName, "project");
  const shotToken = pipelinePathSegment(activeScene ? `${activeScene.code}_${activeScene.title}` : activeSceneCode, "SH000");
  const deptToken = pipelinePathSegment(activeDepartment.name || activeDepartment.id, "department");
  const taskToken = pipelinePathSegment(task?.title || "main_task", "task");
  const vendorToken = pipelinePathSegment(vendor, "vendor");
  const versionToken = pipelinePathSegment(reviewRow?.version || "v001", "v001");
  const dateToken = pipelinePathSegment(activeSheet?.date || new Date().toISOString().slice(0, 10), "date");
  const callsheetToken = pipelinePathSegment(activeSheet?.code || `D${project.currentDay || 1}`, "callsheet");
  const budgetRate = project.budget > 0 ? metrics.spent / project.budget : 0;
  const budgetGap = budgetRate - (progress.rate || 0);
  const missingVendorCount =
    people.filter((person) => !person.vendor || person.vendor === "个人 / 自由职业").length +
    equipment.filter((item) => !item.vendor || item.vendor === "未登记公司").length;
  const lowTrustCount =
    people.filter((person) => normalizeTrust(person.trust) < 76).length +
    equipment.filter((item) => normalizeTrust(item.trust) < 76).length;
  const blockedReviewCount = reviewRows.filter((row) => row.status === "blocked" || row.risk === "high").length;
  const heldPaymentCount = reviewRows.filter((row) => row.paymentGate === "hold" && row.approvalRate < 0.9).length;
  const unclassifiedCount = flow.unclassifiedUsed > 0 ? 1 : 0;
  const templates = [
    {
      key: "work_file",
      label: "工作文件",
      template: "项目/{Project}/shots/{ShotGroup}/{Department}/{Task}/work/{name}_v001.ext",
      resolved: `项目/${projectToken}/shots/${shotToken}/${deptToken}/${taskToken}/work/${shotToken}_${taskToken}_v001.ext`,
      meta: "给摄影、剪辑、VFX 等工作文件统一命名",
      target: "progress",
      focus: "shotPipelineBoard",
    },
    {
      key: "publish",
      label: "发布版本",
      template: "项目/{Project}/shots/{ShotGroup}/{Department}/{Task}/publish/{Version}",
      resolved: `项目/${projectToken}/shots/${shotToken}/${deptToken}/${taskToken}/publish/${versionToken}`,
      meta: "通过审查后进入可交付版本区",
      target: "audit",
      focus: "vfxVersionList",
    },
    {
      key: "review",
      label: "审阅版本",
      template: "项目/{Project}/reviews/{Vendor}/{ShotGroup}/{Version}",
      resolved: `项目/${projectToken}/reviews/${vendorToken}/${shotToken}/${versionToken}`,
      meta: "供应商交付、导演批注、付款关口",
      target: "audit",
      focus: "vfxVersionList",
    },
    {
      key: "finance_audit",
      label: "财务凭证",
      template: "项目/{Project}/finance/audit/{Department}/evidence",
      resolved: `项目/${projectToken}/finance/audit/${deptToken}/evidence`,
      meta: "合同、发票、付款审批与审计证据",
      target: "audit",
      focus: "auditTableBody",
    },
    {
      key: "vendor_delivery",
      label: "供应商交付",
      template: "项目/{Project}/deliveries/{Vendor}/{YYYY-MM-DD}/{Version}",
      resolved: `项目/${projectToken}/deliveries/${vendorToken}/${dateToken}/${versionToken}`,
      meta: "车辆、酒店、器材、VFX 等外部交付入口",
      target: "fundflow",
      focus: "fundFlowDetailTable",
    },
    {
      key: "call_sheet",
      label: "通告单归档",
      template: "项目/{Project}/call_sheets/D{Day}_{Callsheet}",
      resolved: `项目/${projectToken}/call_sheets/D${project.currentDay || 1}_${callsheetToken}`,
      meta: "每日通告、车辆、住宿、场地和成本记录",
      target: "callsheet",
      focus: "callsheetDetail",
    },
  ];
  const hooks = [
    {
      id: "before_import_validate",
      label: "导入前字段校验",
      status: missingVendorCount > 0 ? `${missingVendorCount} 项供应商待补` : "字段完整",
      detail: "Excel / 手写单进入系统前，检查部门、金额、公司/个人和日期。",
      tone: missingVendorCount > 0 ? "note" : "good",
      target: "input",
      focus: "inputPreferencesPanel",
    },
    {
      id: "before_publish_review",
      label: "发布版本前检查",
      status: blockedReviewCount > 0 ? `${blockedReviewCount} 个版本阻塞` : "可发布",
      detail: "镜头版本必须有审阅人、通过数和批注状态，阻塞版本不能进入 publish。",
      tone: blockedReviewCount > 0 ? "warning" : heldPaymentCount > 0 ? "note" : "good",
      target: "audit",
      focus: "vfxVersionList",
    },
    {
      id: "payment_gate_audit",
      label: "付款关口审计",
      status: heldPaymentCount > 0 || audit.highRiskCount > 0 ? `${heldPaymentCount + audit.highRiskCount} 项暂缓` : "可流转",
      detail: "付款前联动凭证、预算消耗、版本验收和供应商信任评分。",
      tone: heldPaymentCount > 0 || audit.highRiskCount > 0 ? "warning" : audit.mediumRiskCount > 0 ? "note" : "good",
      target: "audit",
      focus: "auditTableBody",
    },
    {
      id: "budget_progress_guard",
      label: "预算进度防线",
      status: budgetGap > 0.08 ? `预算快 ${Math.round(budgetGap * 100)} 点` : "节奏正常",
      detail: "预算消耗明显快于完成进度时，要求监制复核后续支出。",
      tone: budgetGap > 0.12 ? "warning" : budgetGap > 0.06 ? "note" : "good",
      target: "analysis",
      focus: "analysisReport",
    },
    {
      id: "vendor_trust_check",
      label: "供应商信任检查",
      status: lowTrustCount > 0 ? `${lowTrustCount} 项低信任` : "信任稳定",
      detail: "公司等级、个人等级和信任评分低于阈值时进入审查队列。",
      tone: lowTrustCount > 0 ? "note" : "good",
      target: "personnel",
      focus: "personnelModule",
    },
    {
      id: "fund_flow_classifier",
      label: "资金流分类器",
      status: unclassifiedCount > 0 ? money.format(flow.unclassifiedUsed) : "已分类",
      detail: "将人员、器材、车辆、酒店、场地、VFX 供应商归入资金流向图。",
      tone: unclassifiedCount > 0 || flow.overAllocated > 0 ? "warning" : flow.unallocated > 0 ? "note" : "good",
      target: "fundflow",
      focus: "fundFlowLargeChart",
    },
  ];
  const modules = [
    { label: "Budget Core", value: money.format(project.budget || 0), detail: "总预算、部门预算、组别拆分", status: project.budget > 0 ? "active" : "setup", target: "budget" },
    { label: "Call Sheet Builder", value: `${callSheets.length} 张`, detail: "节点式通告单、日成本、资源", status: callSheets.length > 0 ? "active" : "setup", target: "callsheet" },
    { label: "Schedule Timeline", value: `${production.schedule.length} 段`, detail: "可拖动排期、工时、进度", status: production.delayed > 0 ? "risk" : "active", target: "progress", focus: "productionScheduleBoard" },
    { label: "Review Versions", value: `${reviewRows.length} 版`, detail: "VFX / 后期版本、批注、验收", status: blockedReviewCount > 0 ? "risk" : "active", target: "audit", focus: "vfxVersionList" },
    { label: "Audit Hooks", value: `${audit.items.length} 项`, detail: "凭证、等级、信任、付款关口", status: audit.highRiskCount > 0 ? "risk" : "active", target: "audit" },
    { label: "Fund Flow Graph", value: `${flow.supplierCount} 个`, detail: "公司/个人/车辆/酒店/场地流向", status: flow.unclassifiedUsed > 0 ? "risk" : "active", target: "fundflow" },
    { label: "Import / OCR", value: "API", detail: "Excel、手写单、AI 识别接口", status: "setup", target: "input", focus: "spreadsheetFile" },
    { label: "Pipeline Config", value: "Local", detail: "上下文、模板、Hook、模块注册", status: "active", target: "overview", focus: "pipelineCore" },
  ];
  const context = [
    { label: "Project", value: projectName, meta: `${money.format(project.budget || 0)} · D${project.currentDay || 1}/${project.plannedDays || 1}`, tone: "good", target: "input", focus: "projectForm" },
    { label: "Shot / Scene", value: activeScene ? `${activeScene.code} · ${activeScene.title}` : activeSceneCode, meta: activeScene ? `${activeScene.location} · ${activeScene.pages} 页` : "未登记场次", tone: activeScene?.risk === "warning" ? "warning" : activeScene?.risk === "note" ? "note" : "good", target: "progress", focus: "shotPipelineBoard" },
    { label: "Department", value: activeDepartment.name || activeDepartment.id, meta: `${budgetBudgetLabel()} ${money.format(activeDepartment.budget || 0)}`, tone: "good", target: "budget", focus: "budgetTableBody" },
    { label: "Task", value: task?.title || "未指派阶段", meta: task ? `${task.owner} · ${task.status}` : "等待排期", tone: task?.risk === "over" || task?.risk === "high" ? "warning" : task?.risk === "tight" ? "note" : "good", target: "progress", focus: "productionScheduleBoard" },
    { label: "Vendor", value: vendor, meta: reviewRow ? `${reviewRow.shotGroup} · ${reviewRow.version}` : "可绑定供应商", tone: blockedReviewCount > 0 ? "warning" : heldPaymentCount > 0 ? "note" : "good", target: "audit", focus: "vfxVersionList" },
  ];
  const folderTree = [
    `${projectToken}/`,
    `  00_admin/`,
    `    budget/`,
    `    contracts/`,
    `    audit/evidence/`,
    `  01_call_sheets/`,
    `    D${project.currentDay || 1}_${callsheetToken}/`,
    `  02_shots/`,
    `    ${shotToken}/`,
    `      ${deptToken}/`,
    `        work/`,
    `        publish/${versionToken}/`,
    `  03_assets/`,
    `    art_props_costume/`,
    `  04_reviews/`,
    `    ${vendorToken}/${shotToken}/${versionToken}/`,
    `  05_deliveries/`,
    `    vehicles_hotels_locations/`,
    `    vfx_color_sound/`,
    `  06_reports/`,
    `    producer_weekly/`,
  ];
  const queueRows = pipelineQueueRows({
    projectToken,
    shotToken,
    deptToken,
    dateToken,
    reviewRows,
    production,
    flow,
    audit,
    activeDepartment,
  });
  const queueSummary = {
    total: queueRows.length,
    warning: queueRows.filter((row) => row.tone === "warning").length,
    note: queueRows.filter((row) => row.tone === "note").length,
    ready: queueRows.filter((row) => row.tone === "good").length,
    amount: queueRows.reduce((sum, row) => sum + (Number(row.amountValue) || 0), 0),
  };
  const issueCount = hooks.filter((hook) => hook.tone === "warning").length;
  const noteCount = hooks.filter((hook) => hook.tone === "note").length;
  return {
    configId: `pipe-${pipelinePathSegment(projectName, "project").toLowerCase()}`,
    context,
    templates,
    hooks,
    modules,
    queueRows,
    queueSummary,
    folderTree,
    issueCount,
    noteCount,
    sourceLabel: "Inspired by Flow Production Tracking Toolkit Core",
  };
}

function pipelineFolderTreeText() {
  return pipelineCoreData().folderTree.join("\n");
}

function pipelineQueuePackageText(rows = null) {
  const queueRows = rows || pipelineCoreData().queueRows;
  if (!queueRows.length) return "暂无发布 / 加载队列。";
  return queueRows
    .map((row, index) => [`#${index + 1} ${row.type} · ${row.label}`, row.packageText || contextSummaryFromElement({ dataset: { contextTitle: row.label, contextMeta: row.action } })].join("\n"))
    .join("\n\n---\n\n");
}

function pipelineEventPayload(action, queueRow = null) {
  const row = queueRow || pipelineCoreData().queueRows[0] || null;
  const eventType = {
    publish: "Version.publish",
    load: "Delivery.load",
    audit: "PaymentGate.review",
    notify: "Crew.notify",
    report: "ProducerReport.request",
  }[action] || "Pipeline.event";
  return {
    eventType,
    project: project.title || "当前项目",
    projectId: currentProjectId,
    action,
    entity: row
      ? {
          id: row.id,
          type: row.type,
          name: row.label,
          owner: row.owner,
          stage: row.stage,
          path: row.path,
          amount: row.amount,
          progress: row.progressLabel,
          tone: row.tone,
        }
      : null,
    context: {
      currentDay: project.currentDay,
      plannedDays: project.plannedDays,
      budget: project.budget,
      generatedAt: new Date().toISOString(),
    },
  };
}

function recordPipelineEvent(action, queueRow = null) {
  const payload = pipelineEventPayload(action, queueRow);
  const row = queueRow || payload.entity || {};
  const label = {
    publish: "发布版本事件",
    load: "加载交付事件",
    audit: "付款关口复核",
    notify: "通知负责人",
    report: "生成制片报告",
  }[action] || "管线事件";
  const event = {
    id: `pipeline-event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    eventType: payload.eventType,
    label,
    entityType: row.type || payload.entity?.type || "Pipeline",
    entityName: row.label || payload.entity?.name || project.title || "当前项目",
    action,
    status: row.tone === "warning" || action === "audit" ? "needs_review" : "queued",
    tone: row.tone || (action === "audit" ? "note" : "good"),
    path: row.path || payload.entity?.path || "",
    payload,
    createdAt: new Date().toISOString(),
  };
  pipelineEvents = normalizePipelineEvents([event, ...pipelineEvents]);
  saveData();
  refreshAll();
  setFormStatus(`已触发：${label}`, event.tone === "warning" ? "warning" : "good");
  return event;
}

function pipelineActionRows(data) {
  const primary = data.queueRows[0] || null;
  const review = data.queueRows.find((row) => row.kind === "review") || primary;
  const load = data.queueRows.find((row) => row.kind === "load") || primary;
  const gate = data.queueRows.find((row) => row.kind === "gate") || primary;
  const work = data.queueRows.find((row) => row.kind === "work") || primary;
  return [
    { action: "publish", label: "发布版本", detail: review ? `${review.label} · ${review.stage}` : "等待版本队列", tone: review?.tone || "good", queueId: review?.id || "" },
    { action: "load", label: "加载交付", detail: load ? `${load.label} · ${load.amount}` : "等待交付队列", tone: load?.tone || "good", queueId: load?.id || "" },
    { action: "audit", label: "付款关口", detail: gate ? `${gate.label} · ${gate.stage}` : "审计队列稳定", tone: gate?.tone || "good", queueId: gate?.id || "" },
    { action: "notify", label: "通知负责人", detail: work ? `${work.owner} · ${work.label}` : "暂无负责人", tone: work?.tone || "good", queueId: work?.id || "" },
    { action: "report", label: "生成报告", detail: `${data.queueSummary.total} 个队列项 · ${money.format(data.queueSummary.amount)}`, tone: data.queueSummary.warning > 0 ? "warning" : data.queueSummary.note > 0 ? "note" : "good", queueId: primary?.id || "" },
  ];
}

function renderPipelineCore() {
  const container = document.querySelector("#pipelineCore");
  const badge = document.querySelector("#pipelineCoreBadge");
  const contextGrid = document.querySelector("#pipelineContextGrid");
  const templateList = document.querySelector("#pipelineTemplateList");
  const hookList = document.querySelector("#pipelineHookList");
  const moduleGrid = document.querySelector("#pipelineModuleGrid");
  const queueSummary = document.querySelector("#pipelineQueueSummary");
  const queueList = document.querySelector("#pipelineQueueList");
  const actionGrid = document.querySelector("#pipelineActionGrid");
  const eventLog = document.querySelector("#pipelineEventLog");
  const payloadPreview = document.querySelector("#pipelinePayloadPreview");
  const folderOutput = document.querySelector("#pipelineFolderOutput");
  const status = document.querySelector("#pipelineCoreStatus");
  if (!container || !badge || !contextGrid || !templateList || !hookList || !moduleGrid || !queueSummary || !queueList || !actionGrid || !eventLog || !payloadPreview || !folderOutput || !status) return;
  const data = pipelineCoreData();
  const actionRows = pipelineActionRows(data);
  const previewAction = actionRows[0] || { action: "publish", queueId: "" };
  const previewRow = data.queueRows.find((row) => row.id === previewAction.queueId) || data.queueRows[0] || null;
  const latestPayload = pipelineEvents[0]?.payload || pipelineEventPayload(previewAction.action, previewRow);
  const badgeTone = pipelineToneFromIssueCount(data.issueCount, data.noteCount > 0);
  badge.textContent = data.issueCount > 0 ? `${data.issueCount} 个 Hook 阻塞` : data.noteCount > 0 ? `${data.noteCount} 个 Hook 关注` : "管线可用";
  badge.className = `status-pill ${badgeTone}`;
  contextGrid.innerHTML = data.context
    .map(
      (item) => `
        <button class="pipeline-context-card ${item.tone}" type="button" data-context-kind="pipeline-core" data-context-title="${escapeHtml(item.value)}" data-context-meta="${escapeHtml(`${item.label} · ${item.meta}`)}" data-workspace-view="${escapeHtml(item.target)}" data-workspace-focus="${escapeHtml(item.focus || "")}">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
          <small>${escapeHtml(item.meta)}</small>
        </button>
      `,
    )
    .join("");
  templateList.innerHTML = data.templates
    .map(
      (item) => `
        <button class="pipeline-template-row" type="button" data-context-kind="pipeline-core" data-context-title="${escapeHtml(item.label)}" data-context-meta="${escapeHtml(item.resolved)}" data-pipeline-path="${escapeHtml(item.resolved)}" data-workspace-view="${escapeHtml(item.target)}" data-workspace-focus="${escapeHtml(item.focus || "")}">
          <span class="pipeline-template-key">${escapeHtml(item.key)}</span>
          <span class="pipeline-template-body">
            <strong>${escapeHtml(item.label)}</strong>
            <code>${escapeHtml(item.resolved)}</code>
            <small>${escapeHtml(item.template)}</small>
          </span>
          <em>${escapeHtml(item.meta)}</em>
        </button>
      `,
    )
    .join("");
  hookList.innerHTML = data.hooks
    .map(
      (hook) => `
        <button class="pipeline-hook-row ${hook.tone}" type="button" data-context-kind="pipeline-core" data-context-title="${escapeHtml(hook.label)}" data-context-meta="${escapeHtml(`${hook.status} · ${hook.detail}`)}" data-workspace-view="${escapeHtml(hook.target)}" data-workspace-focus="${escapeHtml(hook.focus || "")}">
          <span class="pipeline-hook-led"></span>
          <span>
            <strong>${escapeHtml(hook.label)}</strong>
            <small>${escapeHtml(hook.detail)}</small>
          </span>
          <b>${escapeHtml(hook.status)}</b>
        </button>
      `,
    )
    .join("");
  moduleGrid.innerHTML = data.modules
    .map(
      (module) => `
        <button class="pipeline-module-card ${module.status}" type="button" data-context-kind="pipeline-core" data-context-title="${escapeHtml(module.label)}" data-context-meta="${escapeHtml(`${module.value} · ${module.detail}`)}" data-workspace-view="${escapeHtml(module.target)}" data-workspace-focus="${escapeHtml(module.focus || "")}">
          <span>${escapeHtml(module.status === "risk" ? "Risk" : module.status === "setup" ? "Setup" : "Active")}</span>
          <strong>${escapeHtml(module.label)}</strong>
          <b>${escapeHtml(module.value)}</b>
          <small>${escapeHtml(module.detail)}</small>
        </button>
      `,
    )
    .join("");
  queueSummary.innerHTML = `
    <div><span>队列</span><strong>${data.queueSummary.total}</strong><small>发布 / 加载 / 关口</small></div>
    <div><span>阻塞</span><strong>${data.queueSummary.warning}</strong><small>需先处理</small></div>
    <div><span>待复核</span><strong>${data.queueSummary.note}</strong><small>需要确认</small></div>
    <div><span>涉及金额</span><strong>${money.format(data.queueSummary.amount)}</strong><small>队列估算</small></div>
  `;
  queueList.innerHTML =
    data.queueRows.length > 0
      ? data.queueRows
          .map(
            (row) => `
              <button class="pipeline-queue-row ${row.tone}" type="button" data-context-kind="pipeline-queue" data-context-title="${escapeHtml(row.label)}" data-context-meta="${escapeHtml(`${row.type} · ${row.stage} · ${row.action}`)}" data-pipeline-package="${escapeHtml(row.packageText)}" data-pipeline-path="${escapeHtml(row.path)}" data-pipeline-queue-kind="${escapeHtml(row.kind)}" ${row.reviewId ? `data-context-review-id="${escapeHtml(row.reviewId)}"` : ""} ${row.taskId ? `data-context-task-id="${escapeHtml(row.taskId)}"` : ""} data-workspace-view="${escapeHtml(row.target)}" data-workspace-focus="${escapeHtml(row.focus || "")}">
                <span class="pipeline-queue-type">${escapeHtml(row.type)}</span>
                <span class="pipeline-queue-main">
                  <strong>${escapeHtml(row.label)}</strong>
                  <small>${escapeHtml(row.owner)} · ${escapeHtml(row.stage)}</small>
                </span>
                <span class="pipeline-queue-meter" aria-hidden="true"><i style="width:${Math.round(Math.max(0.04, Math.min(row.progress || 0, 1)) * 100)}%"></i></span>
                <span class="pipeline-queue-meta">
                  <b>${escapeHtml(row.amount)}</b>
                  <small>${escapeHtml(row.progressLabel)}</small>
                </span>
                <em>${escapeHtml(row.action)}</em>
              </button>
            `,
          )
          .join("")
      : `<div class="producer-empty">暂无发布 / 加载队列。录入版本、排期或供应商交付后会显示。</div>`;
  actionGrid.innerHTML = actionRows
    .map(
      (action) => `
        <button class="pipeline-action-card ${action.tone}" type="button" data-pipeline-trigger="${escapeHtml(action.action)}" data-pipeline-queue-id="${escapeHtml(action.queueId)}" data-context-kind="pipeline-action" data-context-title="${escapeHtml(action.label)}" data-context-meta="${escapeHtml(action.detail)}">
          <span>${escapeHtml(action.action)}</span>
          <strong>${escapeHtml(action.label)}</strong>
          <small>${escapeHtml(action.detail)}</small>
        </button>
      `,
    )
    .join("");
  eventLog.innerHTML =
    pipelineEvents.length > 0
      ? pipelineEvents
          .slice(0, 6)
          .map(
            (event) => `
              <button class="pipeline-event-row ${event.tone}" type="button" data-context-kind="pipeline-event" data-context-title="${escapeHtml(event.label)}" data-context-meta="${escapeHtml(`${event.eventType} · ${event.entityName}`)}" data-pipeline-payload="${escapeHtml(JSON.stringify(event.payload, null, 2))}" data-pipeline-path="${escapeHtml(event.path)}">
                <span>${escapeHtml(event.eventType)}</span>
                <strong>${escapeHtml(event.entityName || event.label)}</strong>
                <small>${escapeHtml(new Date(event.createdAt).toLocaleString("zh-CN", { hour12: false }))} · ${escapeHtml(event.status)}</small>
              </button>
            `,
          )
          .join("")
      : `<div class="producer-empty">暂无事件。点击动作触发器后，这里会显示本地 webhook 记录。</div>`;
  payloadPreview.innerHTML = `<pre>${escapeHtml(JSON.stringify(latestPayload, null, 2))}</pre>`;
  folderOutput.innerHTML = `<pre>${escapeHtml(data.folderTree.join("\n"))}</pre>`;
  status.textContent = `${data.configId} · ${data.templates.length} 个模板 · ${data.hooks.length} 个 Hook · ${data.modules.length} 个模块 · ${data.queueRows.length} 个队列项 · ${pipelineEvents.length} 个事件`;
}

function renderCallsheetSelect(preferredDay = null) {
  const select = document.querySelector("#callsheetSelect");
  setText("#callsheetTitle", modeText("每日通告单", "执行记录"));
  setText("#callsheetSelectLabel", modeText("拍摄日", "记录"));
  setText("#dailyBarsTitle", modeText("按天成本", "记录成本"));
  setText("#dailyBarsHint", modeText("预计支出", "执行支出"));
  select.innerHTML = callSheets
    .map((sheet) => `<option value="${sheet.day}">${modeText(`第 ${sheet.day} 天`, `#${sheet.day}`)} · ${sheet.title}</option>`)
    .join("");
  const selected = callSheets.find((sheet) => sheet.day === preferredDay) || callSheets.find((sheet) => sheet.day === project.currentDay) || callSheets[callSheets.length - 1];
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
      ? `${topBudgetRow.label}最高 · ${percentText(totalDepartmentBudget > 0 ? topBudgetRow.value / totalDepartmentBudget : 0)}`
      : modeText("部门预算百分比", "自定义分类预算百分比");
  }
  const budgetDepartments = activeBudgetDepartments();
  document.querySelector("#departmentTable").innerHTML = budgetDepartments.length > 0
    ? budgetDepartments
    .map((department) => {
      const used = Number(spent[department.id]) || 0;
      const budget = Number(department.budget) || 0;
      const rate = budget > 0 ? used / budget : used > 0 ? 1 : 0;
      const budgetShare = totalDepartmentBudget > 0 ? budget / totalDepartmentBudget : 0;
      const statusClass = rate > 1 ? "over" : rate > 0.82 ? "tight" : "ok";
      const statusText = rate > 1 ? "已超支" : rate > 0.82 ? "需关注" : "健康";
      return `
        <tr>
          <td><strong>${department.name}</strong></td>
          <td>${money.format(budget)} · ${percentText(budgetShare)}</td>
          <td>${money.format(used)}</td>
          <td><span class="status-text ${statusClass}">${statusText} · ${Math.round(rate * 100)}%</span></td>
        </tr>
      `;
    })
    .join("")
    : `<tr><td colspan="4">${isCustomInputMode() ? "暂无自定义分类。请先在录入偏好保存自定义部门/分类。" : "暂无部门预算。"}</td></tr>`;

  const categories = spentByCategory();
  const visibleCategoryLegend = Object.entries(categoryNames)
    .map(([key, name]) => ({ key, name, value: Number(categories[key]) || 0 }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  document.querySelector("#categoryLegend").innerHTML = visibleCategoryLegend
    .map((row) => `<span class="legend-item"><i class="legend-swatch" style="background:${activeCategoryColor(row.key)}"></i>${row.name} ${compactMoney(row.value)}</span>`)
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
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${Math.round(safeValue * 100)}%`;
}

function compactSentence(text, limit = 46) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  return normalized.length > limit ? `${normalized.slice(0, limit - 1)}…` : normalized;
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
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      console.warn("剪贴板权限受限，已尝试备用复制。", error);
    }
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

  const recentPerson = lastSavedPersonId ? people.find((person) => person.id === lastSavedPersonId) : null;
  const topPeople = [
    ...(recentPerson ? [recentPerson] : []),
    ...people
      .slice()
      .filter((person) => !recentPerson || person.id !== recentPerson.id)
      .sort((a, b) => personTotal(b) - personTotal(a)),
  ].slice(0, 12);
  const cardGrid = document.querySelector("#personnelCardGrid");
  if (cardGrid) {
    cardGrid.innerHTML =
      topPeople.length > 0
        ? topPeople
            .map((person) => {
              const totalCost = personTotal(person);
              const fit = budgetFit("person", person.grade, person.dayRate);
              const trust = normalizeTrust(person.trust);
              const department = getDept(person.dept);
              const initials = (person.name || person.role || "人").trim().slice(0, 2);
              const note = person.note || (isActorPerson(person) && person.characterName ? `角色：${person.characterName}` : `${person.days} 天 · ${money.format(person.dayRate)}/日`);
              return `
                <article class="personnel-profile-card ${person.id && person.id === lastSavedPersonId ? "recent" : ""}">
                  <div class="personnel-avatar" style="background:${activeDepartmentColor(department, departments.findIndex((item) => item.id === department.id))}">${escapeHtml(initials)}</div>
                  <div class="personnel-profile-main">
                    <div class="personnel-profile-head">
                      <div>
                        <strong>${escapeHtml(person.name || "未命名")}</strong>
                        <span>${escapeHtml(personRoleDisplay(person))}</span>
                      </div>
                      <b>${money.format(totalCost)}</b>
                    </div>
                    <div class="personnel-profile-tags">
                      <span>${escapeHtml(department.name)}</span>
                      <span>${escapeHtml(person.vendor || "个人 / 自由职业")}</span>
                      ${ratingOn ? `<span class="${fit.className}">${escapeHtml(fit.label)}</span>` : ""}
                      ${ratingOn ? `<span class="${trustClass(trust)}">信任 ${trust}</span>` : ""}
                    </div>
                    <div class="personnel-profile-detail">
                      <span>${escapeHtml(person.contact || "未填写联系方式")}</span>
                      <span>${escapeHtml(note)}</span>
                    </div>
                  </div>
                </article>
              `;
            })
            .join("")
        : `<div class="personnel-layer-empty">还没有人员档案。先在录入端加入姓名、联系方式和预算信息。</div>`;
  }

  document.querySelector("#personnelTable").innerHTML = people
    .slice()
    .sort((a, b) => personTotal(b) - personTotal(a))
    .map((person) => {
      const fit = budgetFit("person", person.grade, person.dayRate);
      const trust = normalizeTrust(person.trust);
      const workKey = personWorkKey(person);
      return `
        <tr class="inspectable-row" data-context-kind="person" data-context-person-key="${escapeHtml(workKey)}" data-context-title="${escapeHtml(person.name)}" data-context-meta="${escapeHtml(`${personRoleDisplay(person)} · ${money.format(personTotal(person))}`)}" data-workspace-view="personnel" data-workspace-focus="personnelTable">
          <td><strong>${escapeHtml(person.name)}</strong></td>
          <td>${escapeHtml(getDept(person.dept).name)}</td>
          <td>${escapeHtml(personRoleDisplay(person))}</td>
          <td>${escapeHtml(person.vendor || "个人 / 自由职业")}</td>
          <td>${escapeHtml(person.contact || "--")}</td>
          <td>${escapeHtml(person.note || "--")}</td>
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
      const workKey = equipmentWorkKey(item);
      return `
        <tr class="inspectable-row" data-context-kind="equipment" data-context-equipment-key="${escapeHtml(workKey)}" data-context-title="${escapeHtml(item.name)}" data-context-meta="${escapeHtml(`${item.vendor || "未登记公司"} · ${money.format(equipmentTotal(item))}`)}" data-workspace-view="equipment" data-workspace-focus="equipmentTable">
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

const shotPipelineSteps = [
  { id: "shoot", label: "拍摄" },
  { id: "dit", label: "素材" },
  { id: "edit", label: "剪辑" },
  { id: "vfx", label: "VFX" },
  { id: "review", label: "审查" },
  { id: "delivery", label: "交付" },
];

function scenePipelineRows() {
  const vfxProgressRows = customProgressRows().filter(isVfxProgressRow);
  const vfxRate = vfxProgressRows.length > 0 ? averageNumbers(vfxProgressRows.map((row) => row.rate), activeProgressStats().rate || 0) : activeProgressStats().rate || 0;
  return scenes.map((scene) => {
    const relatedSheets = callSheets.filter((sheet) => Array.isArray(sheet.scenes) && sheet.scenes.includes(scene.code));
    const shootDay = relatedSheets.length > 0 ? Math.min(...relatedSheets.map((sheet) => sheet.day)) : null;
    const isShot = scene.status === "done" || (shootDay !== null && shootDay <= project.currentDay);
    const needsVfx = scene.risk === "warning" || /工厂|追逐|雨|夜|天台|冲突|爆|特技|VFX|调色/u.test(`${scene.title} ${scene.location}`);
    const editRate = isShot ? Math.min(1, 0.38 + Math.max(0, project.currentDay - (shootDay || project.currentDay)) * 0.1) : 0;
    const reviewIssue = scene.risk === "warning" || (needsVfx && vfxRate < 0.55 && isShot);
    const steps = {
      shoot: isShot ? "done" : shootDay === project.currentDay ? "current" : "todo",
      dit: isShot ? "done" : "todo",
      edit: editRate >= 0.92 ? "done" : isShot ? "current" : "todo",
      vfx: needsVfx ? (vfxRate >= 0.85 ? "done" : isShot ? (vfxRate < 0.45 ? "issue" : "current") : "todo") : isShot ? "done" : "todo",
      review: reviewIssue ? "issue" : isShot && editRate >= 0.68 ? "current" : "todo",
      delivery: isShot && editRate >= 0.96 && (!needsVfx || vfxRate >= 0.95) ? "done" : "todo",
    };
    const riskTone = Object.values(steps).includes("issue") ? "warning" : Object.values(steps).includes("current") ? "note" : "good";
    const progressValue = Object.values(steps).reduce((sum, status) => sum + (status === "done" ? 1 : status === "current" ? 0.55 : status === "issue" ? 0.35 : 0), 0) / shotPipelineSteps.length;
    return {
      scene,
      code: scene.code,
      title: scene.title,
      location: scene.location,
      shootDay,
      steps,
      needsVfx,
      riskTone,
      progressValue,
      note: reviewIssue ? "需复核镜头、版本或 VFX 交付" : isShot ? "素材已进入后期流转" : "等待拍摄",
    };
  });
}

function renderShotPipeline() {
  const board = document.querySelector("#shotPipelineBoard");
  const status = document.querySelector("#shotPipelineStatus");
  if (!board || !status) return;
  const rows = scenePipelineRows();
  const issueCount = rows.filter((row) => row.riskTone === "warning").length;
  const currentCount = rows.filter((row) => row.riskTone === "note").length;
  status.textContent = `${rows.length} 组镜头 · ${issueCount} 项风险 · ${currentCount} 项进行中`;
  if (rows.length === 0) {
    board.innerHTML = `<div class="production-empty">暂无场次。录入场次后会生成镜头 / 资产管线。</div>`;
    return;
  }
  board.innerHTML = `
    <div class="shot-pipeline-grid">
      <div class="pipeline-head pipeline-shot-head">镜头 / 场次</div>
      ${shotPipelineSteps.map((step) => `<div class="pipeline-head">${escapeHtml(step.label)}</div>`).join("")}
      <div class="pipeline-head">状态</div>
      ${rows
        .map(
          (row) => `
            <button class="pipeline-shot-cell ${row.riskTone}" type="button" data-context-kind="pipeline" data-context-scene="${escapeHtml(row.code)}" data-context-title="${escapeHtml(`${row.code} · ${row.title}`)}" data-context-meta="${escapeHtml(`${row.location} · ${row.needsVfx ? "含 VFX" : "常规"}`)}" data-workspace-view="callsheet" data-workspace-focus="callsheetDetail">
              <strong>${escapeHtml(row.code)} · ${escapeHtml(row.title)}</strong>
              <span>${escapeHtml(row.location)} · ${row.shootDay ? `D${row.shootDay}` : "未排日"} · ${row.needsVfx ? "含 VFX/高风险" : "常规"}</span>
            </button>
            ${shotPipelineSteps
              .map(
                (step) => `
                  <button class="pipeline-step ${row.steps[step.id]}" type="button" data-context-kind="pipeline-step" data-context-scene="${escapeHtml(row.code)}" data-context-step="${escapeHtml(step.id)}" data-context-title="${escapeHtml(`${row.code} · ${step.label}`)}" data-context-meta="${escapeHtml(`${row.title} · ${row.steps[step.id]}`)}" data-workspace-view="${step.id === "vfx" || step.id === "review" ? "audit" : step.id === "edit" ? "progress" : "callsheet"}" data-workspace-focus="${step.id === "vfx" || step.id === "review" ? "vfxSupplierAudit" : step.id === "edit" ? "editProgressChart" : "callsheetDetail"}">
                    <span>${escapeHtml(step.label)}</span>
                  </button>
                `,
              )
              .join("")}
            <button class="pipeline-status-cell ${row.riskTone}" type="button" data-context-kind="pipeline" data-context-scene="${escapeHtml(row.code)}" data-context-title="${escapeHtml(`${row.code} · ${row.title}`)}" data-context-meta="${escapeHtml(row.note)}" data-workspace-view="${row.riskTone === "warning" ? "audit" : "progress"}" data-workspace-focus="${row.riskTone === "warning" ? "vfxSupplierAudit" : "productionScheduleBoard"}">
              <strong>${Math.round(row.progressValue * 100)}%</strong>
              <span>${escapeHtml(row.note)}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderProductionSchedule() {
  const board = document.querySelector("#productionScheduleBoard");
  const status = document.querySelector("#productionScheduleStatus");
  if (!board || !status) return;
  const rows = productionScheduleRows();
  const cols = Math.max(1, Number(project.plannedDays) || 1);
  const today = clampDay(project.currentDay || 1);
  const manualMode = normalizeScheduleTasks(scheduleTasks).length > 0;
  status.textContent = rows.length > 0 ? `${rows.length} 个阶段 · D${today}/${cols} · ${manualMode ? "手动排期" : "自动生成"}` : "暂无排期";
  if (rows.length === 0) {
    board.innerHTML = `<div class="production-empty">录入通告单、部门或自定义进度后，这里会生成制片排期。</div>`;
    resetScheduleForm(null);
    return;
  }
  if (!selectedScheduleTaskId || !rows.some((row) => row.id === selectedScheduleTaskId)) {
    selectedScheduleTaskId = rows[0].id;
  }

  const ticks = Array.from({ length: cols }, (_, index) => index + 1)
    .map((day) => `<span class="${day === today ? "today" : ""}">D${day}</span>`)
    .join("");
  board.innerHTML = `
    <div class="schedule-grid" style="--schedule-cols:${cols}">
      <div class="schedule-left schedule-head">阶段 / 负责人</div>
      <div class="schedule-scale schedule-head">${ticks}</div>
      ${rows
        .map(
          (row) => `
            <button class="schedule-left schedule-row-button ${row.id === selectedScheduleTaskId ? "selected" : ""}" type="button" data-context-kind="schedule" data-context-task-id="${escapeHtml(row.id)}" data-context-title="${escapeHtml(row.title)}" data-context-meta="${escapeHtml(`${row.owner} · D${row.start}-D${row.end}`)}" data-schedule-id="${escapeHtml(row.id)}">
              <strong>${escapeHtml(row.title)}</strong>
              <span>${escapeHtml(row.owner)}</span>
              <small>D${row.start}-D${row.end} · ${escapeHtml(row.status)} · ${row.progressLabel}</small>
            </button>
            <div class="schedule-lane" data-schedule-lane="${escapeHtml(row.id)}">
              <span class="schedule-today-line" style="grid-column:${today}"></span>
              <button class="schedule-bar ${row.risk} ${row.span <= 2 ? "compact" : ""} ${row.id === selectedScheduleTaskId ? "selected" : ""}" type="button" data-context-kind="schedule" data-context-task-id="${escapeHtml(row.id)}" data-context-title="${escapeHtml(row.title)}" data-context-meta="${escapeHtml(`${row.owner} · D${row.start}-D${row.end}`)}" data-schedule-id="${escapeHtml(row.id)}" data-drag-mode="move" aria-label="${escapeHtml(`${row.title}，D${row.start} 到 D${row.end}`)}" style="grid-column:${row.start} / span ${row.span}; --bar-color:${row.color}">
                <span class="schedule-handle left" data-drag-mode="resize-start" aria-hidden="true"></span>
                <i style="width:${Math.round(Math.max(0.06, Math.min(row.progressRate, 1)) * 100)}%"></i>
                <b>
                  <span class="schedule-clip-title">${escapeHtml(row.title)}</span>
                  <span class="schedule-clip-meta">${escapeHtml(row.owner)}</span>
                  <span class="schedule-clip-range">D${row.start}-D${row.end}</span>
                  <span class="schedule-clip-progress">${row.progressLabel}</span>
                </b>
                <span class="schedule-handle right" data-drag-mode="resize-end" aria-hidden="true"></span>
              </button>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
  resetScheduleForm(selectedScheduleTask());
}

function renderWorkHourDashboard() {
  const dashboard = document.querySelector("#workHourDashboard");
  const status = document.querySelector("#workHourStatus");
  const recent = document.querySelector("#workLogRecent");
  const personSelect = document.querySelector("#workLogPerson");
  if (!dashboard || !status || !recent || !personSelect) return;

  const summary = workHourSummary();
  status.textContent = summary.manualRows.length > 0 ? `${summary.manualRows.length} 条手动记录 · 自动补估算` : "当前为通告单估算";
  const currentValue = personSelect.value;
  personSelect.innerHTML =
    people.length > 0
      ? people.map((person, index) => `<option value="${escapeHtml(personWorkKey(person, index))}">${escapeHtml(person.name || "未命名")} · ${escapeHtml(personRoleDisplay(person))}</option>`).join("")
      : `<option value="">暂无人员</option>`;
  if (Array.from(personSelect.options).some((option) => option.value === currentValue)) {
    personSelect.value = currentValue;
  }

  const maxDayHours = Math.max(1, ...summary.dayRows.map((row) => row.hours));
  const topPeople = summary.topPeople.slice(0, 5);
  dashboard.innerHTML = `
    <div class="work-hour-kpis">
      <div><strong>${formatProgressNumber(summary.totalHours)}</strong><span>总工时</span></div>
      <div><strong>${formatProgressNumber(summary.recordedHours)}</strong><span>手动记录</span></div>
      <div><strong>${summary.personCount}</strong><span>参与人员</span></div>
      <div><strong>${summary.overtimeCount}</strong><span>加班风险</span></div>
    </div>
    <div class="work-hour-chart">
      ${summary.dayRows
        .map(
          (row) => `
            <div class="work-day-bar">
              <span>D${row.day}</span>
              <i style="height:${Math.max(8, (row.hours / maxDayHours) * 92)}%"></i>
              <b>${formatProgressNumber(row.hours)}</b>
            </div>
          `,
        )
        .join("") || `<div class="production-empty">暂无工时数据</div>`}
    </div>
    <div class="work-person-list">
      ${topPeople
        .map(
          (row) => `
            <div class="work-person-row">
              <div>
                <strong>${escapeHtml(row.name)}</strong>
                <span>${escapeHtml(getDept(row.dept).name)} · ${escapeHtml(row.role || "未填岗位")}</span>
              </div>
              <b>${formatProgressNumber(row.hours)}h</b>
            </div>
          `,
        )
        .join("") || `<div class="production-empty">暂无人员工时</div>`}
    </div>
  `;

  recent.innerHTML =
    summary.manualRows.length > 0
      ? summary.manualRows
          .slice(0, 6)
          .map(
            (row) => `
              <div class="work-log-row">
                <div>
                  <strong>${escapeHtml(row.personName)} · ${formatProgressNumber(row.hours)}h</strong>
                  <span>D${row.day} ${escapeHtml(row.date)} · ${escapeHtml(row.task)} · ${escapeHtml(workLogStatusText(row.status))}</span>
                </div>
                <button class="person-delete-button" type="button" data-work-log-id="${escapeHtml(row.id)}">删除</button>
              </div>
            `,
          )
          .join("")
      : `<div class="production-empty">还没有手动工时记录。保存后会覆盖同人同天的估算工时。</div>`;
}

function workLogStatusText(status) {
  if (status === "overtime") return "加班";
  if (status === "review") return "待复核";
  if (status === "current") return "进行中";
  if (status === "estimated") return "估算";
  return "已记录";
}

function renderProductionDataBoard() {
  const board = document.querySelector("#productionDataBoard");
  const status = document.querySelector("#productionDashboardStatus");
  if (!board || !status) return;
  const data = productionDashboardData();
  const work = data.work;
  const lowest = data.lowest;
  const averageHours = work.personCount > 0 ? work.totalHours / work.personCount : 0;
  status.textContent = `${data.taskTotal} 项任务 · ${data.delayed} 项延期`;
  board.innerHTML = `
    <div class="production-data-kpis">
      <div><span>任务总量</span><strong>${data.taskTotal}</strong><small>${data.schedule.length} 个阶段</small></div>
      <div><span>进度完成</span><strong>${Math.round(data.progressRate * 100)}%</strong><small>预算同步 ${Math.round((project.budget > 0 ? totalSpent() / project.budget : 0) * 100)}%</small></div>
      <div><span>延期 / 关注</span><strong>${data.delayed}/${data.tight}</strong><small>红色延期，黄色待追</small></div>
      <div><span>人均工时</span><strong>${formatProgressNumber(averageHours)}h</strong><small>${work.personCount} 人参与</small></div>
      <div><span>峰值工时日</span><strong>${work.peakDay ? `D${work.peakDay.day}` : "--"}</strong><small>${work.peakDay ? `${formatProgressNumber(work.peakDay.hours)}h` : "暂无"}</small></div>
      <div><span>瓶颈阶段</span><strong>${escapeHtml(lowest?.title || "--")}</strong><small>${lowest ? lowest.progressLabel : "暂无"}</small></div>
    </div>
    <div class="production-status-list">
      ${data.schedule
        .slice(0, 6)
        .map(
          (row) => `
            <div class="production-status-row">
              <span class="${row.risk}"></span>
              <div>
                <strong>${escapeHtml(row.title)}</strong>
                <small>${escapeHtml(row.owner)} · D${row.start}-D${row.end}</small>
              </div>
              <b>${row.progressLabel}</b>
            </div>
          `,
        )
        .join("") || `<div class="production-empty">暂无生产阶段</div>`}
    </div>
  `;
}

function renderProductionOps() {
  renderProductionSchedule();
  renderWorkHourDashboard();
  renderProductionDataBoard();
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
    contact: getFormText(form, "contact"),
    note: getFormText(form, "note"),
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
    contact: getFormText(form, "contact"),
    note: getFormText(form, "note"),
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
    contact: getFormText(form, "contact"),
    note: getFormText(form, "note"),
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
        联系方式: person.contact || "",
        备注: person.note || "",
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

function resetVfxReviewForm() {
  const form = document.querySelector("#vfxVersionForm");
  if (!form) return;
  form.reset();
  form.elements.id.value = "";
  form.elements.status.value = "submitted";
  form.elements.shotCount.value = "1";
  form.elements.approvedCount.value = "0";
  form.elements.paymentGate.value = "hold";
  form.elements.date.value = reportDateLabel();
  const vendor = vfxSupplierAuditRows()[0]?.vendor || "";
  if (vendor) {
    form.elements.vendor.value = vendor;
  }
}

function fillVfxReviewForm(reviewId) {
  const form = document.querySelector("#vfxVersionForm");
  const row = normalizeVfxReviewVersions(vfxReviewVersions).find((item) => item.id === reviewId);
  if (!form || !row) return false;
  form.elements.id.value = row.id;
  form.elements.vendor.value = row.vendor;
  form.elements.shotGroup.value = row.shotGroup;
  form.elements.version.value = row.version;
  form.elements.status.value = row.status;
  form.elements.shotCount.value = String(row.shotCount);
  form.elements.approvedCount.value = String(row.approvedCount);
  form.elements.date.value = row.date || reportDateLabel();
  form.elements.reviewer.value = row.reviewer;
  form.elements.paymentGate.value = row.paymentGate;
  form.elements.notes.value = row.notes;
  if (form.elements.mediaFile) form.elements.mediaFile.value = "";
  form.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => form.elements.shotGroup.focus({ preventScroll: true }), 220);
  return true;
}

function setupVfxReviewControls() {
  const form = document.querySelector("#vfxVersionForm");
  const list = document.querySelector("#vfxVersionList");
  if (!form || !list) return;
  resetVfxReviewForm();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const shotCount = Math.max(1, getFormNumber(form, "shotCount"));
    const approvedCount = Math.max(0, Math.min(shotCount, getFormNumber(form, "approvedCount")));
    const vendor = getFormText(form, "vendor") || "未登记供应商";
    const shotGroup = getFormText(form, "shotGroup");
    const version = getFormText(form, "version");
    if (!shotGroup || !version) {
      setFormStatus("请填写镜头组和版本号", "warning");
      return;
    }
    const existingRow = vfxReviewVersions.find((item) => item.id === form.elements.id.value);
    const mediaFile = form.elements.mediaFile?.files?.[0] || null;
    const media = mediaFile ? await vfxMediaFromFile(mediaFile, vendor) : existingRow?.media || null;
    const nextRow = {
      id: form.elements.id.value || `vfx-review-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      vendor,
      shotGroup,
      version,
      status: normalizeVfxReviewStatus(form.elements.status.value),
      shotCount,
      approvedCount,
      date: form.elements.date.value || reportDateLabel(),
      reviewer: getFormText(form, "reviewer") || "未指派",
      paymentGate: normalizeVfxPaymentGate(form.elements.paymentGate.value),
      notes: getFormText(form, "notes"),
      media,
    };
    const existingIndex = vfxReviewVersions.findIndex((item) => item.id === nextRow.id);
    if (existingIndex >= 0) {
      vfxReviewVersions[existingIndex] = nextRow;
    } else {
      vfxReviewVersions.push(nextRow);
    }
    vfxReviewVersions = normalizeVfxReviewVersions(vfxReviewVersions);
    saveData();
    refreshAll();
    fillVfxReviewForm(nextRow.id);
    setFormStatus(`版本已保存：${nextRow.shotGroup} · ${nextRow.version}`, "good");
  });

  document.querySelector("#newVfxVersion")?.addEventListener("click", () => {
    resetVfxReviewForm();
    setFormStatus("已准备新版本记录", "good");
  });

  list.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-vfx-review-edit]");
    if (editButton) {
      fillVfxReviewForm(editButton.dataset.vfxReviewEdit);
      setFormStatus("版本已载入表单", "good");
      return;
    }
    const deleteButton = event.target.closest("[data-vfx-review-delete]");
    if (!deleteButton) return;
    const target = vfxReviewVersions.find((item) => item.id === deleteButton.dataset.vfxReviewDelete);
    vfxReviewVersions = vfxReviewVersions.filter((item) => item.id !== deleteButton.dataset.vfxReviewDelete);
    saveData();
    refreshAll();
    resetVfxReviewForm();
    setFormStatus(`已删除版本：${target?.shotGroup || "未命名"} ${target?.version || ""}`, "warning");
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
  setText(".brand-lockup h1", translate("app.title"));
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

function callsheetDraftFromForm(form) {
  const day = Math.max(1, getFormNumber(form, "day"));
  const selectedScenes = isCustomInputMode() ? [] : Array.from(form.querySelectorAll('input[name="scenes"]:checked')).map((input) => input.value);
  const selectedDepartments = Array.from(form.querySelectorAll('input[name="departments"]:checked')).map((input) => input.value);
  const extra = {
    meals: getFormNumber(form, "meals"),
    vehicles: getFormNumber(form, "vehicles"),
    rooms: getFormNumber(form, "rooms"),
    locationFee: getFormNumber(form, "locationFee"),
    misc: getFormNumber(form, "misc"),
  };
  return {
    day,
    code: nextCallsheetCode(day),
    date: form.elements.date.value,
    title: form.elements.title.value.trim(),
    location: form.elements.location.value.trim(),
    weather: form.elements.weather.value.trim(),
    callTime: form.elements.callTime.value,
    wrapTime: form.elements.wrapTime.value,
    scenes: selectedScenes,
    cast: form.elements.cast.value.trim(),
    departments: selectedDepartments,
    extra,
    productionDetails: Object.entries(productionCostPartsFromExtra({ extra }))
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        key: `draft:${key}`,
        label: productionDetailTypeLabel(key),
        vendor: productionDetailTypeLabel(key),
        type: productionDetailTypeLabel(key),
        category: key,
        value,
        meta: "通告草稿",
      })),
  };
}

function callsheetNodeState(form) {
  const draft = callsheetDraftFromForm(form);
  const selectedScenes = scenes.filter((scene) => draft.scenes.includes(scene.code));
  const sceneCountTotal = selectedScenes.reduce((sum, scene) => sum + sceneCount(scene.code), 0);
  const scenePageTotal = selectedScenes.reduce((sum, scene) => sum + scene.pages, 0);
  const departmentsInSheet = draft.departments.map((id) => getDept(id).name).filter(Boolean);
  const extra = draft.extra;
  const resourceTotal = extra.meals + extra.vehicles + extra.rooms + extra.locationFee + extra.misc;
  const laborCost = dayLaborCost(draft);
  const equipmentCost = dayEquipmentCost(draft);
  const productionCost = dayProductionCost(draft);
  const totalCost = laborCost + equipmentCost + productionCost;
  const custom = isCustomInputMode();
  const nodes = [
    {
      id: "basic",
      title: custom ? "记录基础" : "基础信息",
      meta: draft.day ? `${custom ? "记录" : "D"}${draft.day}` : "未编号",
      complete: Boolean(draft.day && draft.date && draft.title && draft.location),
      target: '[name="day"]',
      summary: [draft.date || "未填日期", draft.title || "未填标题", draft.location || "未填地点"].join(" · "),
      missing: [
        !draft.date && "日期",
        !draft.title && "标题",
        !draft.location && "地点",
      ].filter(Boolean),
    },
    {
      id: "time",
      title: custom ? "时间与状态" : "时间与条件",
      meta: draft.callTime && draft.wrapTime ? `${draft.callTime}-${draft.wrapTime}` : "未排时间",
      complete: Boolean(draft.callTime && draft.wrapTime && draft.weather),
      target: '[name="callTime"]',
      summary: `${draft.callTime || "--:--"} 到 ${draft.wrapTime || "--:--"} · ${draft.weather || (custom ? "未填状态" : "未填天气")}`,
      missing: [
        !draft.callTime && (custom ? "开始" : "集合"),
        !draft.wrapTime && (custom ? "结束" : "收工"),
        !draft.weather && (custom ? "状态" : "天气"),
      ].filter(Boolean),
    },
    {
      id: "scenes",
      title: custom ? "执行内容" : "场景",
      meta: custom ? "自定义模式" : `${draft.scenes.length} 段`,
      complete: custom || draft.scenes.length > 0,
      target: "#callsheetScenesInput",
      summary: custom ? "自定义模式下用标题和备注描述执行内容" : draft.scenes.length > 0 ? `${draft.scenes.join("、")} · ${sceneCountTotal} 场 · ${scenePageTotal} 页` : "未选择场次",
      missing: custom ? [] : ["场次"],
    },
    {
      id: "departments",
      title: custom ? "参与分类" : "到场部门",
      meta: `${draft.departments.length} 项`,
      complete: draft.departments.length > 0,
      target: "#callsheetDepartmentsInput",
      summary: departmentsInSheet.length > 0 ? departmentsInSheet.slice(0, 5).join("、") + (departmentsInSheet.length > 5 ? ` 等 ${departmentsInSheet.length} 项` : "") : "未选择部门",
      missing: [custom ? "参与分类" : "到场部门"],
    },
    {
      id: "cast",
      title: custom ? "备注 / 对象" : "演员 / 备注",
      meta: draft.cast ? "已填写" : "待补",
      complete: Boolean(draft.cast),
      target: '[name="cast"]',
      summary: draft.cast || (custom ? "未填交付对象或备注" : "未填演员或备注"),
      missing: [custom ? "备注" : "演员"],
    },
    {
      id: "resources",
      title: custom ? "外部资源" : "生产资源",
      meta: resourceTotal > 0 ? "有资源" : "无资源",
      complete: true,
      target: '[name="meals"]',
      summary: custom
        ? `数量 ${extra.meals} · 资源 ${extra.vehicles} · 外部费用 ${money.format(extra.locationFee + extra.misc)}`
        : `餐食 ${extra.meals} · 车辆 ${extra.vehicles} · 房间 ${extra.rooms} · 场地/杂费 ${money.format(extra.locationFee + extra.misc)}`,
      missing: [],
    },
    {
      id: "confirm",
      title: "成本确认",
      meta: totalCost > 0 ? money.format(totalCost) : "待估算",
      complete: totalCost > 0 && draft.departments.length > 0,
      target: "#callsheetForm button[type='submit']",
      summary: `人工 ${money.format(laborCost)} · 器材 ${money.format(equipmentCost)} · 生产 ${money.format(productionCost)}`,
      missing: totalCost > 0 ? [] : ["成本数据"],
    },
  ];
  return { draft, nodes, totals: { laborCost, equipmentCost, productionCost, totalCost, sceneCountTotal, scenePageTotal } };
}

function renderCallsheetNodeBuilder() {
  const form = document.querySelector("#callsheetForm");
  const grid = document.querySelector("#callsheetNodeGrid");
  const summary = document.querySelector("#callsheetNodeSummary");
  const status = document.querySelector("#callsheetNodeStatus");
  if (!form || !grid || !summary || !status) return;
  const state = callsheetNodeState(form);
  const completed = state.nodes.filter((node) => node.complete).length;
  const canSave = state.nodes.filter((node) => node.id !== "confirm").every((node) => node.complete);
  const statusTone = canSave ? "good" : completed >= 4 ? "warning" : "";
  status.textContent = canSave ? "可保存" : `${completed}/${state.nodes.length} 完成`;
  status.className = `status-pill ${statusTone}`.trim();
  setText("#callsheetNodeTitle", modeText("节点式通告制作", "节点式执行记录"));
  setText("#callsheetNodeHint", modeText("按基础信息、场景、部门、资源逐步确认", "按基础信息、参与分类、资源、成本逐步确认"));
  grid.innerHTML = state.nodes
    .map((node, index) => {
      const tone = node.complete ? "done" : "warning";
      const missingText = node.complete ? "完成" : `待补：${node.missing.join("、")}`;
      return `
        <button class="callsheet-node ${tone}" type="button" data-node="${escapeHtml(node.id)}" data-target="${escapeHtml(node.target)}" aria-label="${escapeHtml(`${node.title}，${missingText}`)}">
          <span class="callsheet-node-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="callsheet-node-body">
            <strong>${escapeHtml(node.title)}</strong>
            <small>${escapeHtml(node.summary)}</small>
          </span>
          <span class="callsheet-node-meta">${escapeHtml(node.meta)}</span>
        </button>
      `;
    })
    .join("");
  const draft = state.draft;
  summary.innerHTML = `
    <div>
      <span>${escapeHtml(modeText("预计当日成本", "预计记录成本"))}</span>
      <strong>${money.format(state.totals.totalCost)}</strong>
    </div>
    <div>
      <span>${escapeHtml(modeText("涉及场次", "执行内容"))}</span>
      <strong>${escapeHtml(isCustomInputMode() ? draft.title || "待填写" : `${draft.scenes.length} 段 / ${state.totals.sceneCountTotal} 场`)}</strong>
    </div>
    <div>
      <span>${escapeHtml(modeText("到场部门", "参与分类"))}</span>
      <strong>${draft.departments.length}</strong>
    </div>
    <div>
      <span>${escapeHtml(modeText("资源", "外部资源"))}</span>
      <strong>${escapeHtml(isCustomInputMode() ? `${draft.extra.meals + draft.extra.vehicles + draft.extra.rooms} 项` : `${draft.extra.meals} 餐 / ${draft.extra.vehicles} 车 / ${draft.extra.rooms} 房`)}</strong>
    </div>
  `;
}

function focusCallsheetNode(targetSelector) {
  const form = document.querySelector("#callsheetForm");
  if (!form || !targetSelector) return;
  const target = form.querySelector(targetSelector) || document.querySelector(targetSelector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusTarget = target.matches?.("input, select, button, textarea") ? target : target.querySelector?.("input, select, button, textarea");
  if (focusTarget) {
    window.setTimeout(() => focusTarget.focus({ preventScroll: true }), 260);
  }
}

function contextSummaryFromElement(target) {
  const title = target?.dataset?.contextTitle || target?.querySelector?.("strong")?.textContent || "当前对象";
  const meta = target?.dataset?.contextMeta || target?.querySelector?.("small, span")?.textContent || "";
  return `${title}${meta ? `\n${meta}` : ""}`.trim();
}

const workspaceContextTranslations = {
  "打开关联视图": "Open Linked View",
  "跳转到对应模块": "Jump to the related module",
  "复制对象摘要": "Copy Object Summary",
  "名称、状态和关键说明": "Name, status & key notes",
  "编辑阶段": "Edit Phase",
  "载入左侧排期表单": "Load the schedule form",
  "标记完成": "Mark Complete",
  "进度设为 100%": "Set progress to 100%",
  "标记暂停": "Mark Paused",
  "进入风险关注": "Move to risk watch",
  "复制阶段": "Duplicate Phase",
  "生成一个相邻副本": "Create an adjacent copy",
  "复制阶段摘要": "Copy Phase Summary",
  "阶段、负责人和天数": "Phase, owner & days",
  "编辑版本": "Edit Version",
  "载入版本审阅表单": "Load the version review form",
  "标记通过": "Mark Approved",
  "通过数量设为全量": "Set approved shots to total",
  "标记阻塞": "Mark Blocked",
  "付款关口暂缓": "Hold payment gate",
  "复制版本摘要": "Copy Version Summary",
  "供应商、版本、批注": "Vendor, version & notes",
  "删除版本": "Delete Version",
  "移出审阅记录": "Remove from review records",
  "进入版本审阅": "Open Version Review",
  "打开 VFX / 审查区域": "Open VFX / Audit area",
  "复制镜头摘要": "Copy Shot Summary",
  "场次、步骤和状态": "Scene, step & status",
  "跳到这个模板或 Hook 对应模块": "Jump to this template or Hook module",
  "复制路径 / 摘要": "Copy Path / Summary",
  "复制当前管线对象": "Copy the current pipeline object",
  "复制文件夹结构": "Copy Folder Structure",
  "项目管线目录草案": "Project pipeline folder draft",
  "发布版本": "Publish Version",
  "进入 VFX / 后期版本审阅": "Open VFX / post version review",
  "加载供应商交付": "Load Vendor Delivery",
  "进入资金流和供应商明细": "Open fund flow & vendor details",
  "进入这个队列项对应模块": "Open the module linked to this queue item",
  "复制发布包": "Copy Publish Package",
  "名称、路径、金额和下一步": "Name, path, amount & next step",
  "复制路径": "Copy Path",
  "复制队列输出路径": "Copy queue output path",
  "通过后可进入付款判断": "After approval, evaluate payment",
  "暂停付款关口": "Pause payment gate",
  "阶段完成": "Complete Phase",
  "把工作阶段设为 100%": "Set phase progress to 100%",
  "查看交付 / 资金流": "View Delivery / Fund Flow",
  "进入供应商明细": "Open vendor details",
  "触发动作": "Trigger Action",
  "写入本地 webhook 事件": "Write local webhook event",
  "复制 Payload": "Copy Payload",
  "复制将要发送的数据": "Copy outgoing data",
  "复制事件 Payload": "Copy Event Payload",
  "用于 API / webhook 调试": "For API / webhook debugging",
  "复制关联路径": "Copy Linked Path",
  "事件绑定的文件或队列路径": "Event file or queue path",
  "当前对象": "Current Object",
  "右键操作": "Context Actions",
};

function contextMenuText(value) {
  if (displaySettings.language !== "en") return value;
  return workspaceContextTranslations[value] || value;
}

function contextMenuItems(target) {
  const kind = target?.dataset?.contextKind || "";
  const base = [
    { action: "open", label: "打开关联视图", hint: "跳转到对应模块", key: "↵" },
    { action: "copy", label: "复制对象摘要", hint: "名称、状态和关键说明", key: "⌘C" },
  ];
  if (kind === "schedule") {
    return [
      { action: "schedule-edit", label: "编辑阶段", hint: "载入左侧排期表单", key: "E" },
      { action: "schedule-complete", label: "标记完成", hint: "进度设为 100%", key: "✓" },
      { action: "schedule-pause", label: "标记暂停", hint: "进入风险关注", key: "!" },
      { action: "schedule-duplicate", label: "复制阶段", hint: "生成一个相邻副本", key: "D" },
      { action: "copy", label: "复制阶段摘要", hint: "阶段、负责人和天数", key: "⌘C" },
    ];
  }
  if (kind === "vfx-review") {
    return [
      { action: "vfx-edit", label: "编辑版本", hint: "载入版本审阅表单", key: "E" },
      { action: "vfx-approve", label: "标记通过", hint: "通过数量设为全量", key: "✓" },
      { action: "vfx-block", label: "标记阻塞", hint: "付款关口暂缓", key: "!" },
      { action: "copy", label: "复制版本摘要", hint: "供应商、版本、批注", key: "⌘C" },
      { action: "vfx-delete", label: "删除版本", hint: "移出审阅记录", key: "Del", danger: true },
    ];
  }
  if (kind === "pipeline" || kind === "pipeline-step") {
    return [
      { action: "open", label: "打开关联视图", hint: kind === "pipeline-step" ? "进入该步骤对应模块" : "查看通告或审查", key: "↵" },
      { action: "pipeline-review", label: "进入版本审阅", hint: "打开 VFX / 审查区域", key: "R" },
      { action: "copy", label: "复制镜头摘要", hint: "场次、步骤和状态", key: "⌘C" },
    ];
  }
  if (kind === "pipeline-core") {
    return [
      { action: "open", label: "打开关联视图", hint: "跳到这个模板或 Hook 对应模块", key: "↵" },
      { action: "pipeline-copy-path", label: "复制路径 / 摘要", hint: "复制当前管线对象", key: "P" },
      { action: "pipeline-copy-tree", label: "复制文件夹结构", hint: "项目管线目录草案", key: "T" },
      { action: "pipeline-publish", label: "发布版本", hint: "进入 VFX / 后期版本审阅", key: "V" },
      { action: "pipeline-delivery", label: "加载供应商交付", hint: "进入资金流和供应商明细", key: "D" },
    ];
  }
  if (kind === "pipeline-queue") {
    const items = [
      { action: "open", label: "打开关联视图", hint: "进入这个队列项对应模块", key: "↵" },
      { action: "pipeline-copy-package", label: "复制发布包", hint: "名称、路径、金额和下一步", key: "B" },
      { action: "pipeline-copy-path", label: "复制路径", hint: "复制队列输出路径", key: "P" },
    ];
    if (target?.dataset?.contextReviewId) {
      items.push(
        { action: "vfx-edit", label: "编辑版本", hint: "载入版本审阅表单", key: "E" },
        { action: "vfx-approve", label: "标记通过", hint: "通过后可进入付款判断", key: "✓" },
        { action: "vfx-block", label: "标记阻塞", hint: "暂停付款关口", key: "!" },
      );
    }
    if (target?.dataset?.contextTaskId) {
      items.push({ action: "schedule-complete", label: "阶段完成", hint: "把工作阶段设为 100%", key: "✓" });
    }
    items.push({ action: "pipeline-delivery", label: "查看交付 / 资金流", hint: "进入供应商明细", key: "D" });
    return items;
  }
  if (kind === "pipeline-action") {
    return [
      { action: "pipeline-trigger-action", label: "触发动作", hint: "写入本地 webhook 事件", key: "↵" },
      { action: "pipeline-copy-payload", label: "复制 Payload", hint: "复制将要发送的数据", key: "J" },
    ];
  }
  if (kind === "pipeline-event") {
    return [
      { action: "pipeline-copy-payload", label: "复制事件 Payload", hint: "用于 API / webhook 调试", key: "J" },
      { action: "pipeline-copy-path", label: "复制关联路径", hint: "事件绑定的文件或队列路径", key: "P" },
    ];
  }
  if (["person", "equipment", "audit-item", "tracking", "tracker-asset", "tracker-project", "tracker-user", "tracker-report"].includes(kind)) {
    return [
      { action: "copy", label: "复制对象摘要", hint: "名称、状态和关键说明", key: "⌘C" },
      { action: "open", label: "打开关联视图", hint: "跳转到对应模块", key: "↵" },
    ];
  }
  return base;
}

function showWorkspaceContextMenu(event, target) {
  const menu = document.querySelector("#workspaceContextMenu");
  const title = document.querySelector("#workspaceContextMenuTitle");
  const meta = document.querySelector("#workspaceContextMenuMeta");
  const body = document.querySelector("#workspaceContextMenuBody");
  if (!menu || !title || !meta || !body || !target) return;
  const items = contextMenuItems(target);
  title.textContent = target.dataset.contextTitle || contextMenuText("当前对象");
  meta.textContent = target.dataset.contextMeta || contextMenuText("右键操作");
  body.innerHTML = items
    .map(
      (item) => `
        <button class="workspace-context-menu-item ${item.danger ? "danger" : ""}" type="button" data-context-action="${escapeHtml(item.action)}">
          <span><b>${escapeHtml(contextMenuText(item.label))}</b><small>${escapeHtml(contextMenuText(item.hint))}</small></span>
          <span class="workspace-context-menu-kbd">${escapeHtml(item.key || "")}</span>
        </button>
      `,
    )
    .join("");
  menu.__contextTarget = target;
  menu.hidden = false;
  const rect = menu.getBoundingClientRect();
  const left = Math.min(Math.max(8, event.clientX), window.innerWidth - rect.width - 8);
  const top = Math.min(Math.max(8, event.clientY), window.innerHeight - rect.height - 8);
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
}

function hideWorkspaceContextMenu() {
  const menu = document.querySelector("#workspaceContextMenu");
  if (!menu) return;
  menu.hidden = true;
  menu.__contextTarget = null;
}

function openContextTarget(target) {
  const view = target?.dataset?.workspaceView;
  if (!view) return false;
  document.querySelector(`.tab-button[data-view="${CSS.escape(view)}"]`)?.click();
  window.setTimeout(() => focusWorkspaceTarget(target.dataset.workspaceFocus), 120);
  return true;
}

async function copyContextTarget(target) {
  await copyTextToClipboard(contextSummaryFromElement(target));
  setFormStatus("对象摘要已复制", "good");
}

function updateVfxReviewById(reviewId, patch) {
  let changed = false;
  vfxReviewVersions = normalizeVfxReviewVersions(vfxReviewVersions).map((row) => {
    if (row.id !== reviewId) return row;
    changed = true;
    return { ...row, ...patch };
  });
  if (!changed) return null;
  vfxReviewVersions = normalizeVfxReviewVersions(vfxReviewVersions);
  return vfxReviewVersions.find((row) => row.id === reviewId) || null;
}

async function executeContextAction(action, target) {
  if (!target) return;
  if (action === "open") {
    openContextTarget(target);
    return;
  }
  if (action === "copy") {
    await copyContextTarget(target);
    return;
  }
  if (action === "pipeline-review") {
    document.querySelector('.tab-button[data-view="audit"]')?.click();
    window.setTimeout(() => focusWorkspaceTarget("vfxVersionList"), 120);
    return;
  }
  if (action.startsWith("pipeline-")) {
    if (action === "pipeline-trigger-action") {
      const trigger = target.dataset.pipelineTrigger || "publish";
      const queueId = target.dataset.pipelineQueueId || "";
      const row = pipelineCoreData().queueRows.find((item) => item.id === queueId) || pipelineCoreData().queueRows[0] || null;
      recordPipelineEvent(trigger, row);
      return;
    }
    if (action === "pipeline-copy-payload") {
      const payload = target.dataset.pipelinePayload || JSON.stringify(pipelineEventPayload(target.dataset.pipelineTrigger || "publish", pipelineCoreData().queueRows.find((item) => item.id === target.dataset.pipelineQueueId) || null), null, 2);
      await copyTextToClipboard(payload);
      setFormStatus("Webhook Payload 已复制", "good");
      return;
    }
    if (action === "pipeline-copy-package") {
      await copyTextToClipboard(target.dataset.pipelinePackage || pipelineQueuePackageText());
      setFormStatus("发布 / 加载包已复制", "good");
      return;
    }
    if (action === "pipeline-copy-path") {
      await copyTextToClipboard(target.dataset.pipelinePath || contextSummaryFromElement(target));
      setFormStatus("管线路径已复制", "good");
      return;
    }
    if (action === "pipeline-copy-tree") {
      await copyTextToClipboard(pipelineFolderTreeText());
      setFormStatus("项目文件夹结构已复制", "good");
      return;
    }
    if (action === "pipeline-publish") {
      document.querySelector('.tab-button[data-view="audit"]')?.click();
      window.setTimeout(() => focusWorkspaceTarget("vfxVersionList"), 120);
      setFormStatus("已进入版本发布 / 审阅", "good");
      return;
    }
    if (action === "pipeline-delivery") {
      document.querySelector('.tab-button[data-view="fundflow"]')?.click();
      window.setTimeout(() => focusWorkspaceTarget("fundFlowDetailTable"), 120);
      setFormStatus("已进入供应商交付与资金流", "good");
      return;
    }
  }
  if (action.startsWith("schedule-")) {
    const taskId = target.dataset.contextTaskId || target.dataset.scheduleId;
    const task = productionScheduleRows().find((row) => row.id === taskId) || scheduleTaskById(taskId);
    if (!task) return;
    ensureEditableScheduleTasks();
    if (action === "schedule-edit") {
      selectedScheduleTaskId = taskId;
      renderProductionSchedule();
      document.querySelector('.tab-button[data-view="progress"]')?.click();
      window.setTimeout(() => focusWorkspaceTarget("productionScheduleForm"), 120);
      return;
    }
    if (action === "schedule-complete") {
      updateScheduleTask(taskId, { progressRate: 1, status: "完成" });
      saveData();
      refreshAll();
      setFormStatus(`阶段已完成：${task.title}`, "good");
      return;
    }
    if (action === "schedule-pause") {
      updateScheduleTask(taskId, { status: "暂停" });
      saveData();
      refreshAll();
      setFormStatus(`阶段已暂停：${task.title}`, "warning");
      return;
    }
    if (action === "schedule-duplicate") {
      const copy = duplicateScheduleTask(taskId);
      if (copy) {
        saveData();
        refreshAll();
        setFormStatus(`已复制阶段：${copy.title}`, "good");
      }
      return;
    }
  }
  if (action.startsWith("vfx-")) {
    const reviewId = target.dataset.contextReviewId || target.dataset.reviewId;
    const row = normalizeVfxReviewVersions(vfxReviewVersions).find((item) => item.id === reviewId);
    if (!row) return;
    if (action === "vfx-edit") {
      document.querySelector('.tab-button[data-view="audit"]')?.click();
      window.setTimeout(() => fillVfxReviewForm(reviewId), 120);
      return;
    }
    if (action === "vfx-approve") {
      updateVfxReviewById(reviewId, { status: "approved", approvedCount: row.shotCount, paymentGate: row.paymentGate === "hold" ? "milestone" : row.paymentGate });
      saveData();
      refreshAll();
      setFormStatus(`版本已通过：${row.shotGroup} · ${row.version}`, "good");
      return;
    }
    if (action === "vfx-block") {
      updateVfxReviewById(reviewId, { status: "blocked", paymentGate: "hold" });
      saveData();
      refreshAll();
      setFormStatus(`版本已标记阻塞：${row.shotGroup} · ${row.version}`, "warning");
      return;
    }
    if (action === "vfx-delete") {
      vfxReviewVersions = normalizeVfxReviewVersions(vfxReviewVersions).filter((item) => item.id !== reviewId);
      saveData();
      refreshAll();
      resetVfxReviewForm();
      setFormStatus(`已删除版本：${row.shotGroup} · ${row.version}`, "warning");
    }
  }
}

function setupWorkspaceContextMenu() {
  document.addEventListener("click", async (event) => {
    const trackerStatusAction = event.target.closest("[data-tracker-status-action]");
    if (trackerStatusAction) {
      trackerUpdateTaskStatus(trackerStatusAction.dataset.trackerTaskId, trackerStatusAction.dataset.trackerStatusAction);
      return;
    }
    const trackerNoteSubmit = event.target.closest("[data-tracker-note-submit]");
    if (trackerNoteSubmit) {
      const taskId = trackerNoteSubmit.dataset.trackerNoteSubmit;
      const input = document.querySelector(`[data-tracker-note-input="${CSS.escape(taskId)}"]`);
      trackerAddNote(taskId, input?.value || "");
      return;
    }
    const trackerVersionSubmit = event.target.closest("[data-tracker-version-submit]");
    if (trackerVersionSubmit) {
      event.preventDefault();
      const taskId = trackerVersionSubmit.dataset.trackerVersionSubmit;
      const form = trackerVersionSubmit.closest("[data-tracker-version-form]");
      trackerSubmitTaskVersion(taskId, form);
      return;
    }
    const inspectorAction = event.target.closest("[data-inspector-action]");
    if (inspectorAction) {
      await executeInspectorAction(inspectorAction.dataset.inspectorAction);
      return;
    }
    const target = event.target.closest("[data-context-kind]");
    if (!target || event.target.closest("#workspaceContextMenu")) return;
    if (target.dataset.trackerShotCode) {
      trackerUiState.expandedShotCode = trackerUiState.expandedShotCode === target.dataset.trackerShotCode ? "" : target.dataset.trackerShotCode;
      renderProductionTrackingConsole();
    }
    selectInspectorTarget(target);
  });
  document.addEventListener("contextmenu", (event) => {
    const target = event.target.closest("[data-context-kind]");
    if (!target) {
      hideWorkspaceContextMenu();
      return;
    }
    event.preventDefault();
    selectInspectorTarget(target);
    showWorkspaceContextMenu(event, target);
  });
  document.querySelector("#workspaceContextMenuBody")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-context-action]");
    if (!button) return;
    const menu = document.querySelector("#workspaceContextMenu");
    const target = menu?.__contextTarget;
    hideWorkspaceContextMenu();
    await executeContextAction(button.dataset.contextAction, target);
  });
  document.addEventListener("click", (event) => {
    if (typeof event.button === "number" && event.button !== 0) return;
    if (event.target.closest("#workspaceContextMenu")) return;
    hideWorkspaceContextMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideWorkspaceContextMenu();
  });
  window.addEventListener("scroll", hideWorkspaceContextMenu, true);
  window.addEventListener("resize", hideWorkspaceContextMenu);
}

function setupPipelineCoreActions() {
  const container = document.querySelector("#pipelineCore");
  if (!container) return;
  container.addEventListener("click", async (event) => {
    const triggerButton = event.target.closest("[data-pipeline-trigger]");
    if (triggerButton) {
      const data = pipelineCoreData();
      const row = data.queueRows.find((item) => item.id === triggerButton.dataset.pipelineQueueId) || data.queueRows[0] || null;
      recordPipelineEvent(triggerButton.dataset.pipelineTrigger || "publish", row);
      return;
    }
    const actionButton = event.target.closest("[data-pipeline-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.pipelineAction;
    if (action === "copy-tree") {
      await copyTextToClipboard(pipelineFolderTreeText());
      setFormStatus("项目文件夹结构已复制", "good");
      return;
    }
    if (action === "copy-package") {
      await copyTextToClipboard(pipelineQueuePackageText());
      setFormStatus("发布 / 加载队列已复制", "good");
      return;
    }
    if (action === "emit-webhook") {
      const data = pipelineCoreData();
      recordPipelineEvent(data.queueRows[0]?.kind === "load" ? "load" : data.queueRows[0]?.kind === "gate" ? "audit" : "publish", data.queueRows[0] || null);
      return;
    }
    if (action === "publish-version") {
      document.querySelector('.tab-button[data-view="audit"]')?.click();
      window.setTimeout(() => focusWorkspaceTarget("vfxVersionList"), 120);
      setFormStatus("已进入版本发布 / 审阅", "good");
      return;
    }
    if (action === "load-delivery") {
      document.querySelector('.tab-button[data-view="fundflow"]')?.click();
      window.setTimeout(() => focusWorkspaceTarget("fundFlowDetailTable"), 120);
      setFormStatus("已进入供应商交付与资金流", "good");
      return;
    }
    if (action === "open-audit") {
      document.querySelector('.tab-button[data-view="audit"]')?.click();
      window.setTimeout(() => focusWorkspaceTarget("auditTableBody"), 120);
      setFormStatus("已打开审查队列", "good");
    }
  });
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

async function vfxMediaFromFile(file, uploadedBy = "") {
  if (!file) return null;
  let previewUrl = "";
  if (isImageFile(file) && file.size <= 1024 * 1024 * 2) {
    try {
      previewUrl = String(await fileToDataUrl(file));
    } catch (error) {
      console.warn("版本图片预览读取失败。", error);
    }
  }
  return normalizeVfxReviewMedia({
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    uploadedBy: uploadedBy || "本地上传",
    uploadedAt: new Date().toISOString(),
    previewUrl,
  });
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
      contact: String(getRowValue(row, ["联系方式", "电话", "手机", "微信", "邮箱", "contact", "phone", "wechat", "email"]) || "").trim(),
      note: String(getRowValue(row, ["备注", "说明", "合同状态", "到组时间", "note", "memo", "remark"]) || "").trim(),
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
  renderProducerWorkspace();
  renderProductionTrackingConsole();
  renderPipelineCore();
  renderProductionInspector();
  const selectedDay = options.selectedDay || Number(document.querySelector("#callsheetSelect").value) || project.currentDay;
  renderCallsheetSelect(selectedDay);
  renderCallsheet(selectedDay);
  renderDailyBars();
  renderBudgetTables();
  renderAnalysisReport();
  renderAuditFilterControls();
  renderAuditModule();
  renderPersonnelModule();
  renderEquipmentModule();
  renderProgress();
  renderShotPipeline();
  renderProductionOps();
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
  renderFundFlowReadablePanels();
  renderModeSpecificUi();
  renderCallsheetNodeBuilder();
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
  renderCallsheetNodeBuilder();
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
      contact: getFormText(form, "contact"),
      note: getFormText(form, "note"),
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
    renderCallsheetNodeBuilder();
  });

  document.querySelector("#callsheetForm").addEventListener("input", renderCallsheetNodeBuilder);
  document.querySelector("#callsheetForm").addEventListener("change", renderCallsheetNodeBuilder);
  document.querySelector("#callsheetNodeGrid")?.addEventListener("click", (event) => {
    const node = event.target.closest(".callsheet-node");
    if (!node) return;
    focusCallsheetNode(node.dataset.target);
  });

  document.querySelector("#productionScheduleForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = form.elements.title.value.trim();
    if (!title) {
      setFormStatus("请先填写阶段名称", "warning");
      return;
    }
    ensureEditableScheduleTasks();
    const existingId = form.elements.id.value || selectedScheduleTaskId;
    const start = clampDay(getFormNumber(form, "start"));
    const end = clampDay(Math.max(start, getFormNumber(form, "end")));
    const patch = {
      id: existingId || `schedule-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      owner: form.elements.owner.value.trim() || "未指派",
      start,
      end,
      progressRate: Math.max(0, Math.min(100, getFormNumber(form, "progress"))) / 100,
      status: form.elements.status.value,
      source: "manual",
    };
    if (scheduleTasks.some((task) => task.id === patch.id)) {
      updateScheduleTask(patch.id, patch);
    } else {
      const nextTask = normalizeScheduleTask(patch);
      if (nextTask) {
        scheduleTasks.push(nextTask);
        selectedScheduleTaskId = nextTask.id;
      }
    }
    saveData();
    refreshAll();
    setFormStatus(`排期已保存：${title} · D${start}-${end}`, "good");
  });

  document.querySelector("#newScheduleTask")?.addEventListener("click", () => {
    const task = addScheduleTaskFromRange(project.currentDay || 1, 3);
    saveData();
    refreshAll();
    setFormStatus(`已新增阶段：${task?.title || "新增阶段"}`, "good");
  });

  document.querySelector("#deleteScheduleTask")?.addEventListener("click", () => {
    ensureEditableScheduleTasks();
    const target = scheduleTasks.find((task) => task.id === selectedScheduleTaskId);
    if (!target) {
      setFormStatus("请先选择要删除的阶段", "warning");
      return;
    }
    scheduleTasks = scheduleTasks.filter((task) => task.id !== selectedScheduleTaskId);
    selectedScheduleTaskId = scheduleTasks[0]?.id || "";
    saveData();
    refreshAll();
    setFormStatus(`已删除阶段：${target.title}`, "warning");
  });

  document.querySelector("#resetScheduleTasks")?.addEventListener("click", () => {
    scheduleTasks = [];
    selectedScheduleTaskId = "";
    saveData();
    refreshAll();
    setFormStatus("制片排期已恢复为自动生成", "good");
  });

  document.querySelector("#productionScheduleBoard")?.addEventListener("click", (event) => {
    const target = event.target.closest("[data-schedule-id]");
    if (!target) return;
    selectedScheduleTaskId = target.dataset.scheduleId;
    renderProductionSchedule();
  });

  document.querySelector("#productionScheduleBoard")?.addEventListener("dblclick", (event) => {
    const lane = event.target.closest("[data-schedule-lane]");
    if (!lane || event.target.closest(".schedule-bar")) return;
    const day = scheduleDayFromPointer(event, lane);
    const task = addScheduleTaskFromRange(day, 3);
    saveData();
    refreshAll();
    setFormStatus(`已在 D${day} 新增阶段：${task?.title || "新增阶段"}`, "good");
  });

  document.querySelector("#productionScheduleBoard")?.addEventListener("pointerdown", (event) => {
    const bar = event.target.closest(".schedule-bar");
    if (!bar || (event.button !== undefined && event.button !== 0)) return;
    const lane = bar.closest("[data-schedule-lane]");
    const task = productionScheduleRows().find((row) => row.id === bar.dataset.scheduleId);
    if (!lane || !task) return;
    const mode = event.target.dataset.dragMode || bar.dataset.dragMode || "move";
    const metrics = scheduleLaneMetrics(lane);
    scheduleDragState = {
      id: task.id,
      mode,
      bar,
      clientX: event.clientX,
      clientY: event.clientY,
      start: task.start,
      end: task.end,
      span: task.span,
      dayWidth: metrics.dayWidth,
      moved: false,
      committed: false,
    };
    selectedScheduleTaskId = task.id;
    bar.setPointerCapture?.(event.pointerId);
    document.body.classList.add("schedule-dragging");
    event.preventDefault();
  });

  document.addEventListener("pointermove", (event) => {
    if (!scheduleDragState) return;
    const delta = schedulePointerDeltaDays(event);
    const original = scheduleDragState;
    const pixelDelta = Math.hypot(event.clientX - original.clientX, event.clientY - original.clientY);
    if (!original.moved && pixelDelta < 4) return;
    let start = original.start;
    let end = original.end;
    if (original.mode === "resize-start") {
      start = clampDay(Math.min(original.end, original.start + delta));
    } else if (original.mode === "resize-end") {
      end = clampDay(Math.max(original.start, original.end + delta));
    } else {
      start = clampDay(original.start + delta);
      end = clampDay(start + original.span - 1);
      if (end > (project.plannedDays || end)) {
        end = clampDay(project.plannedDays);
        start = clampDay(end - original.span + 1);
      }
    }
    if (start === original.currentStart && end === original.currentEnd && original.moved) return;
    const task = updateScheduleTask(original.id, { start, end });
    if (task) {
      scheduleDragUpdateBar(task, original.bar);
      scheduleDragUpdateForm(task);
      scheduleDragPreviewText(task);
    }
    scheduleDragState = { ...original, moved: true, committed: true, currentStart: start, currentEnd: end };
  });

  document.addEventListener("pointerup", () => {
    if (!scheduleDragState) return;
    const target = scheduleTaskById(scheduleDragState.id);
    const moved = scheduleDragState.moved;
    scheduleDragState = null;
    document.body.classList.remove("schedule-dragging");
    if (moved) {
      saveData();
      refreshAll();
    } else {
      renderProductionSchedule();
    }
    if (moved && target) {
      setFormStatus(`排期已调整：${target.title} · D${target.start}-${target.end}`, "good");
    }
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

  document.querySelector("#workLogForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const person = findPersonByWorkKey(form.elements.personKey.value);
    if (!person) {
      setFormStatus("请先选择人员", "warning");
      return;
    }
    const day = Math.max(1, getFormNumber(form, "day"));
    const hours = Math.max(0, Math.min(24, getFormNumber(form, "hours")));
    if (hours <= 0) {
      setFormStatus("请填写大于 0 的工时", "warning");
      return;
    }
    const sheet = callSheets.find((item) => item.day === day);
    const personKey = form.elements.personKey.value;
    const nextLog = {
      id: `work-log-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      personKey,
      personName: person.name || "未命名人员",
      role: personRoleDisplay(person),
      dept: person.dept,
      day,
      date: sheet?.date || "",
      task: form.elements.task.value.trim() || sheet?.title || "项目任务",
      status: form.elements.status.value,
      hours,
      source: "manual",
    };
    workLogs = normalizeWorkLogs(workLogs).filter((row) => !(row.personKey === personKey && row.day === day));
    workLogs.push(nextLog);
    form.reset();
    form.elements.day.value = String(day);
    form.elements.hours.value = "8";
    saveData();
    refreshAll();
    setFormStatus(`工时已保存：${nextLog.personName} · ${formatProgressNumber(hours)}h`, "good");
  });

  document.querySelector("#workLogRecent")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-work-log-id]");
    if (!button) return;
    const target = workLogs.find((row) => row.id === button.dataset.workLogId);
    workLogs = normalizeWorkLogs(workLogs).filter((row) => row.id !== button.dataset.workLogId);
    saveData();
    refreshAll();
    setFormStatus(`已删除工时记录：${target?.personName || "人员"}`, "warning");
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
    renderCallsheetNodeBuilder();
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
      renderProductionInspector();
      canvasRegistry.forEach((draw) => draw());
      redrawVisibleCharts(target);
    });
  });
}

function focusWorkspaceTarget(targetId) {
  if (!targetId) return;
  const target = document.querySelector(`#${CSS.escape(targetId)}`);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusTarget = target.matches?.("input, select, textarea, button") ? target : target.querySelector?.("input, select, textarea, button");
  if (focusTarget) {
    window.setTimeout(() => focusTarget.focus({ preventScroll: true }), 260);
  }
}

function setupProducerWorkspace() {
  const workspace = document.querySelector(".app-shell");
  if (!workspace) return;
  workspace.addEventListener("click", (event) => {
    const target = event.target.closest("[data-workspace-view]");
    if (!target) return;
    if (target.closest(".tracking-workflow-section") && !target.closest(".tracking-detail-action") && !target.closest(".tracking-prd-status")) return;
    const view = target.dataset.workspaceView;
    document.querySelector(`.tab-button[data-view="${CSS.escape(view)}"]`)?.click();
    window.setTimeout(() => focusWorkspaceTarget(target.dataset.workspaceFocus), 120);
  });
}

function setupProductionTrackerControls() {
  const container = document.querySelector("#productionTrackingConsole");
  if (!container) return;
  container.addEventListener("change", (event) => {
    const statusFilter = event.target.closest("#trackingStatusFilter");
    if (statusFilter) {
      trackerUiState.status = statusFilter.value || "all";
      trackerUiState.expandedShotCode = "";
      renderProductionTrackingConsole();
      return;
    }
    const assigneeFilter = event.target.closest("#trackingAssigneeFilter");
    if (assigneeFilter) {
      trackerUiState.assignee = assigneeFilter.value || "all";
      trackerUiState.expandedShotCode = "";
      renderProductionTrackingConsole();
      return;
    }
    const v2ProjectSort = event.target.closest("[data-v2-project-sort]");
    if (v2ProjectSort) {
      trackerUiState.v2ProjectSort = v2ProjectSort.value || "recent";
      const surface = document.querySelector("#trackingV2Surface");
      if (surface) surface.dataset.activePanel = "projects";
      renderTrackingV2Surface(productionTrackerWorkflowData());
    }
  });
  container.addEventListener("input", (event) => {
    const v2ProjectSearch = event.target.closest("[data-v2-project-search]");
    if (!v2ProjectSearch) return;
    trackerUiState.v2ProjectQuery = v2ProjectSearch.value || "";
    const surface = document.querySelector("#trackingV2Surface");
    if (surface) surface.dataset.activePanel = "projects";
    renderTrackingV2Surface(productionTrackerWorkflowData());
  });
  container.addEventListener("click", (event) => {
    const v2PanelButton = event.target.closest("[data-tracking-v2-panel]");
    if (v2PanelButton) {
      const surface = document.querySelector("#trackingV2Surface");
      if (surface) {
        surface.dataset.activePanel = v2PanelButton.dataset.trackingV2Panel || "projects";
        renderTrackingV2Surface(productionTrackerWorkflowData());
      }
      return;
    }
    const v2ProjectView = event.target.closest("[data-v2-project-view]");
    if (v2ProjectView) {
      trackerUiState.v2ProjectView = v2ProjectView.dataset.v2ProjectView || "grid";
      const surface = document.querySelector("#trackingV2Surface");
      if (surface) surface.dataset.activePanel = "projects";
      renderTrackingV2Surface(productionTrackerWorkflowData());
      setFormStatus(`项目视图：${trackerUiState.v2ProjectView}`, "good");
      return;
    }
    const v2ProjectAction = event.target.closest("[data-v2-project-action]");
    if (v2ProjectAction) {
      const action = v2ProjectAction.dataset.v2ProjectAction || "filter";
      setFormStatus(`Project ${action} 已准备，可继续接字段配置`, "good");
      return;
    }
    const v2Export = event.target.closest("[data-v2-export]");
    if (v2Export) {
      trackingV2Export(v2Export.dataset.v2Export || "roadmap");
      return;
    }
    const v2InsightToggle = event.target.closest("[data-v2-insight-toggle]");
    if (v2InsightToggle) {
      const key = v2InsightToggle.dataset.v2InsightToggle || "";
      trackerUiState.v2CollapsedInsights = {
        ...(trackerUiState.v2CollapsedInsights || {}),
        [key]: !trackerUiState.v2CollapsedInsights?.[key],
      };
      renderTrackingV2Surface(productionTrackerWorkflowData());
      return;
    }
    const v2InsightExport = event.target.closest("[data-v2-insight-export]");
    if (v2InsightExport) {
      const key = v2InsightExport.dataset.v2InsightExport || "";
      const row = trackingV2InsightRows(productionTrackerWorkflowData()).find((item) => item.kind === key);
      if (row) {
        downloadCsvFile([{ Widget: row.title, Value: row.value, Meta: row.meta, Kind: row.kind }], `${project.title || "项目"}-${row.title}.csv`);
        setFormStatus(`已导出图表小组件：${row.title}`, "good");
      }
      return;
    }
    const v2ShotSelect = event.target.closest("[data-v2-shot-select]");
    if (v2ShotSelect) {
      selectedV2ShotId = v2ShotSelect.dataset.v2ShotSelect || "";
      const surface = document.querySelector("#trackingV2Surface");
      if (surface) surface.dataset.activePanel = "shots";
      renderTrackingV2Surface(productionTrackerWorkflowData());
      return;
    }
    const v2ShotStatus = event.target.closest("[data-v2-shot-status]");
    if (v2ShotStatus) {
      trackingV2SetShotStatus(v2ShotStatus.dataset.v2ShotId || "", v2ShotStatus.dataset.v2ShotStatus || "IN_PROGRESS");
      return;
    }
    const v2AssetSelect = event.target.closest("[data-v2-asset-select]");
    if (v2AssetSelect) {
      selectedV2AssetId = v2AssetSelect.dataset.v2AssetSelect || "";
      const surface = document.querySelector("#trackingV2Surface");
      if (surface) surface.dataset.activePanel = "assets";
      renderTrackingV2Surface(productionTrackerWorkflowData());
      return;
    }
    const v2AssetStatus = event.target.closest("[data-v2-asset-status]");
    if (v2AssetStatus) {
      trackingV2SetAssetStatus(v2AssetStatus.dataset.v2AssetId || "", v2AssetStatus.dataset.v2AssetStatus || "IN_PROGRESS");
      return;
    }
    const v2ResourceChart = event.target.closest("[data-v2-resource-chart]");
    if (v2ResourceChart) {
      trackerUiState.v2ResourceChart = v2ResourceChart.dataset.v2ResourceChart || "area";
      renderTrackingV2Surface(productionTrackerWorkflowData());
      setFormStatus(`资源规划视图：${trackerUiState.v2ResourceChart === "heatmap" ? "Workload Heatmap" : "Area Chart"}`, "good");
      return;
    }
    const v2InspectGroup = event.target.closest("[data-v2-inspect-group]");
    if (v2InspectGroup) {
      trackerUiState.v2InspectGroup = v2InspectGroup.dataset.v2InspectGroup === "project" ? "project" : "department";
      renderTrackingV2Surface(productionTrackerWorkflowData());
      setFormStatus(`Inspect Chart Data：${trackerUiState.v2InspectGroup === "project" ? "Project" : "Department"}`, "good");
      return;
    }
    const v2InspectWeek = event.target.closest("[data-v2-inspect-week]");
    if (v2InspectWeek) {
      trackerUiState.v2InspectWeek = Number(v2InspectWeek.dataset.v2InspectWeek) || 0;
      trackerUiState.v2ResourceSelectedWeek = trackerUiState.v2InspectWeek;
      renderTrackingV2Surface(productionTrackerWorkflowData());
      return;
    }
    const v2ResourceCell = event.target.closest("[data-v2-resource-cell]");
    if (v2ResourceCell) {
      trackerUiState.v2ResourceSelectedKey = v2ResourceCell.dataset.v2ResourceCell || "";
      trackerUiState.v2ResourceSelectedWeek = Number(v2ResourceCell.dataset.v2Week) || 0;
      trackerUiState.v2InspectWeek = trackerUiState.v2ResourceSelectedWeek;
      renderTrackingV2Surface(productionTrackerWorkflowData());
      setFormStatus("资源任务浮层已更新", "good");
      return;
    }
    const v2DateEditor = event.target.closest("[data-v2-date-editor]");
    if (v2DateEditor) {
      trackerUiState.v2TaskDateEditor = v2DateEditor.dataset.v2DateEditor || "";
      selectedInspectorTarget = {
        kind: "tracker-task",
        trackerTaskId: trackerUiState.v2TaskDateEditor,
        title: v2DateEditor.closest("[data-context-title]")?.dataset.contextTitle || "任务",
        meta: v2DateEditor.closest("[data-context-meta]")?.dataset.contextMeta || "日期编辑",
      };
      renderTrackingV2Surface(productionTrackerWorkflowData());
      renderTrackerTaskDetailPanel();
      return;
    }
    const v2DateSet = event.target.closest("[data-v2-date-set]");
    if (v2DateSet) {
      const taskId = v2DateSet.dataset.v2DateSet || "";
      const day = clampDay(v2DateSet.dataset.v2Day);
      const current = trackingV2TaskEdits[taskId] || {};
      const tracker = productionTrackerWorkflowData();
      const task = trackingV2TaskRows(tracker).find((row) => row.id === taskId);
      const bid = task?.bid || 2;
      const currentStart = current.start || task?.start || day;
      const nextStart = day <= currentStart ? day : currentStart;
      const nextEnd = day > currentStart ? day : clampDay(day + bid - 1);
      trackingV2TaskEdits[taskId] = { start: nextStart, end: Math.max(nextStart, nextEnd) };
      trackerUiState.v2TaskDateEditor = taskId;
      saveData();
      renderTrackingV2Surface(productionTrackerWorkflowData());
      setFormStatus(`任务日期已调整：D${nextStart} - D${Math.max(nextStart, nextEnd)}`, "good");
      return;
    }
    const v2PlaylistToggle = event.target.closest("[data-v2-playlist-toggle]");
    if (v2PlaylistToggle) {
      trackingV2TogglePlaylist(v2PlaylistToggle.dataset.v2PlaylistToggle || "");
      return;
    }
    const v2PlaylistClear = event.target.closest("[data-v2-playlist-clear]");
    if (v2PlaylistClear) {
      trackingV2ClearPlaylist();
      return;
    }
    const v2CompareSelect = event.target.closest("[data-v2-compare-select]");
    if (v2CompareSelect) {
      selectedV2MediaCompareId = v2CompareSelect.dataset.v2CompareSelect || "";
      const surface = document.querySelector("#trackingV2Surface");
      if (surface) surface.dataset.activePanel = "media";
      renderTrackingV2Surface(productionTrackerWorkflowData());
      setFormStatus("对比版本已更新", "good");
      return;
    }
    const v2ReviewDecision = event.target.closest("[data-v2-review-decision]");
    if (v2ReviewDecision) {
      const reviewId = v2ReviewDecision.dataset.v2ReviewId || "";
      if (reviewId) trackingV2ReviewDecision(reviewId, v2ReviewDecision.dataset.v2ReviewDecision || "submitted");
      return;
    }
    const v2ReviewSelect = event.target.closest("[data-v2-review-select]");
    if (v2ReviewSelect) {
      selectedV2ReviewId = v2ReviewSelect.dataset.v2ReviewSelect || "";
      const surface = document.querySelector("#trackingV2Surface");
      if (surface) surface.dataset.activePanel = "media";
      renderTrackingV2Surface(productionTrackerWorkflowData());
      return;
    }
    const v2CalendarAdd = event.target.closest("[data-v2-calendar-add]");
    if (v2CalendarAdd) {
      trackingV2AddCalendarException();
      return;
    }
    const v2CalendarClose = event.target.closest("[data-v2-calendar-close]");
    if (v2CalendarClose) {
      trackingV2CloseCalendarException(v2CalendarClose.dataset.v2CalendarClose || "");
      return;
    }
    const v2WorkOrderSelect = event.target.closest("[data-v2-workorder-select]");
    if (v2WorkOrderSelect) {
      selectedV2WorkOrderId = v2WorkOrderSelect.dataset.v2WorkorderSelect || "";
      const surface = document.querySelector("#trackingV2Surface");
      if (surface) surface.dataset.activePanel = "workorders";
      renderTrackingV2Surface(productionTrackerWorkflowData());
      return;
    }
    const v2WorkOrderStatus = event.target.closest("[data-v2-workorder-status]");
    if (v2WorkOrderStatus) {
      trackingV2SetWorkOrderStatus(v2WorkOrderStatus.dataset.v2WorkorderId || "", v2WorkOrderStatus.dataset.v2WorkorderStatus || "Open");
      return;
    }
    const v2InboxSelect = event.target.closest("[data-v2-inbox-select]");
    if (v2InboxSelect) {
      selectedV2InboxId = v2InboxSelect.dataset.v2InboxSelect || "";
      const surface = document.querySelector("#trackingV2Surface");
      if (surface) surface.dataset.activePanel = "inbox";
      renderTrackingV2Surface(productionTrackerWorkflowData());
      return;
    }
    const v2InboxStatus = event.target.closest("[data-v2-inbox-status]");
    if (v2InboxStatus) {
      trackingV2SetInboxStatus(v2InboxStatus.dataset.v2InboxId || "", v2InboxStatus.dataset.v2InboxStatus || "PENDING_REVIEW");
      return;
    }
    const v2AdminUser = event.target.closest("[data-v2-admin-user]");
    if (v2AdminUser) {
      selectedV2AdminUserId = v2AdminUser.dataset.v2AdminUser || "";
      const surface = document.querySelector("#trackingV2Surface");
      if (surface) surface.dataset.activePanel = "admin";
      renderTrackingV2Surface(productionTrackerWorkflowData());
      return;
    }
    const v2AdminRole = event.target.closest("[data-v2-admin-role]");
    if (v2AdminRole) {
      trackingV2SetAdminRole(v2AdminRole.dataset.v2AdminId || "", v2AdminRole.dataset.v2AdminRole || "artist");
      return;
    }
    const v2ApiRoute = event.target.closest("[data-v2-api-route]");
    if (v2ApiRoute) {
      selectedV2ApiRouteId = v2ApiRoute.dataset.v2ApiRoute || "";
      const surface = document.querySelector("#trackingV2Surface");
      if (surface) surface.dataset.activePanel = "admin";
      renderTrackingV2Surface(productionTrackerWorkflowData());
      return;
    }
    const v2ApiStatus = event.target.closest("[data-v2-api-status]");
    if (v2ApiStatus) {
      trackingV2SetApiRouteStatus(v2ApiStatus.dataset.v2ApiId || "", v2ApiStatus.dataset.v2ApiStatus || "Mock");
      return;
    }
    const roleFilter = event.target.closest("[data-tracker-role-filter]");
    if (roleFilter) {
      trackerUiState.role = roleFilter.dataset.trackerRoleFilter || "all";
      renderProductionTrackingConsole();
      setFormStatus(`任务角色筛选：${trackerUiState.role === "all" ? "全部" : trackerRoleLabel(trackerUiState.role)}`, "good");
      return;
    }
    const reset = event.target.closest("[data-tracker-filter-reset]");
    if (!reset) return;
    resetTrackerUiState();
    renderProductionTrackingConsole();
    setFormStatus("ShotGrid 筛选已重置", "good");
  });
  container.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-tracker-version-form]");
    if (!form) return;
    event.preventDefault();
    trackerSubmitTaskVersion(form.dataset.trackerVersionForm, form);
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
  setupProducerWorkspace();
  setupActions();
  setupVisualExplorer();
  setupAnalysisVisual();
  setupBudgetShareControls();
  setupAuditFilters();
  setupVfxReviewControls();
  setupWorkspaceContextMenu();
  setupPipelineCoreActions();
  setupProductionTrackerControls();
  setupInputPreferences();
  setupInputForms();
  setupChartViewControls();
  setupPanelControls();
  renderCharts();
  setupChartTooltips();
  refreshAll();
}

window.addEventListener("resize", () => {
  canvasRegistry.forEach((draw) => draw());
  const active = document.querySelector(".view.active");
  if (active?.id === "fundflow" || active?.id === "budget" || active?.id === "analysis" || active?.id === "visuals") {
    redrawVisibleCharts(active.id);
  }
});

init();
