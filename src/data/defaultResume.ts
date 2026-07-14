import type { ResumeData } from "../types/resume";

const ningdeSections: ResumeData["sections"] = [
  { id: "summary", title: "个人简介", visible: false },
  { id: "education", title: "教育背景", visible: true },
  { id: "experience", title: "实习经历", visible: true },
  { id: "projects", title: "项目经历", visible: true },
  { id: "awards", title: "校园经历", visible: true },
  { id: "skills", title: "个人技能", visible: true },
];

export const defaultResume: ResumeData = {
  profile: {
    name: "夏方方",
    title: "能源解决方案实习生",
    phone: "19963565149",
    email: "1669338662@qq.com",
    city: "山东聊城",
    website: "24",
    photo: "",
    summary: "",
  },
  education: [
    {
      school: "华中科技大学",
      degree: "硕士",
      major: "动力工程及工程热物理",
      startDate: "2024.09",
      endDate: "2027.06",
      details: [
        "荣誉奖励：国家励志奖学金（多次）、一等奖学金（多次），校级优秀学生、先进个人等。",
        "研究成果：发表论文2篇（EI/北大核心），公开发明专利3项，授权软著2项。",
      ],
    },
    {
      school: "中国矿业大学",
      degree: "本科",
      major: "安全工程",
      startDate: "2020.09",
      endDate: "2024.06",
      details: [],
    },
  ],
  experience: [
    {
      company: "百度智能云",
      role: "能源解决方案实习生",
      startDate: "2026.05",
      endDate: "今",
      details: [
        "面向能源客户生产运行、数字化转型需求，参与业务调研、需求拆解、方案设计及 POC 验证，将工业场景问题转化为 AI/数据分析解决方案框架。",
        "跟踪工业 AI、大模型、工业大数据等应用，整理行业案例、竞品信息和技术方案材料，沉淀 4 类行业知识库，为工程数据分析和智能应用落地提供支撑。",
      ],
    },
  ],
  projects: [
    {
      name: "热电机组低碳运营优化研究（华能集团项目）",
      role: "硕士研究课题",
      startDate: "2025.06",
      endDate: "今",
      details: [
        "面向热电联产系统运行优化场景，分析设备运行状态、能耗指标。建立机组仿真模型，构建热电负荷分配优化模型，综合考虑负荷需求、运行约束和设备能力，输出优化运行方案，实现全厂降碳约 200t/天。",
        "参与低碳运营平台功能设计，梳理数据接口，设计运行参数看板、异常指标监测、优化结果输出和方案推荐等模块，推动算法模型与生产运行系统衔接。",
      ],
    },
    {
      name: "数据中心算-电-热耦合能耗优化研究",
      role: "核心成员",
      startDate: "2026.06",
      endDate: "今",
      details: [
        "围绕数据中心能耗优化场景，开展算力负载、主机温度、储能电池、可再生能源消纳协同优化研究，分析数据中心算力调度与电热耦合关系。构建包含任务迁移、负载处理、电池充放电、制冷功率和可再生能源利用的多系统协同优化模型，设计基于 CPU 温度感知与算力调节的任务迁移策略，避免主机过热、任务堆积和空调能耗上升。该策略可降低整体运营成本 20%以上，降低空调系统能耗约 40%。",
      ],
    },
    {
      name: "风光互补微电网复合储能优化调度研究",
      role: "核心成员",
      startDate: "2024.11",
      endDate: "2025.04",
      details: [
        "围绕风光出力波动与微电网经济运行问题，构建计及储能寿命损耗、功率平衡和运行约束的多目标优化调度模型。采用改进粒子群算法求解运行成本最低和新能源消纳最大化问题。该策略可提升新能源消纳率至 98% 以上，降低运行成本约 10%。",
      ],
    },
    {
      name: "煤与瓦斯突出前兆特征识别与智能预警（大创）",
      role: "负责人",
      startDate: "2022.04",
      endDate: "2024.04",
      details: [
        "围绕煤矿安全监测场景开展数据分析与风险识别研究，完成井下信号数据清洗、特征提取和风险识别模型搭建与验证。对比时序模型预测效果，基于聚类算法识别事故风险模式，某矿数据验证准确率高于 95%。",
      ],
    },
  ],
  skills: [
    {
      name: "数据建模",
      items: ["熟悉数据清洗、优化问题建模与求解，具备工业数据分析、能耗优化与工程问题建模经验。"],
    },
    {
      name: "编程工具",
      items: ["掌握 Python、MATLAB、R 语言；掌握 PyTorch/TensorFlow 等深度学习框架。"],
    },
    {
      name: "工程软件",
      items: ["EBSILON、AutoCAD、Creo、Fluent、Comsol、SolidWorks。"],
    },
    {
      name: "英语",
      items: ["雅思 6.5，CET-6 546，CET-4 581"],
    },
    {
      name: "综合",
      items: ["具备负责人、竞赛队长和学生组织经历，逻辑思维、学习能力、沟通表达和团队协作能力较强。"],
    },
  ],
  awards: [
    {
      title: "校团委办公室助理",
      description: "2023.09-2024.06｜协助日常行政事务、校园活动执行、跨部门沟通，提升组织协调与执行能力。",
    },
    {
      title: "校读书协会宣传部部长",
      description: "2022.09-2023.09｜负责公众号内容策划、活动组织，参与组织阅读推广、读书分享等活动 20 余次。",
    },
  ],
  sections: ningdeSections,
  theme: {
    accentColor: "#0f243e",
    textColor: "#111827",
  },
  keywordStyles: [],
};
