export type ContextMenuLocale = "zh" | "en";

export const contextMenuLabels = {
  zh: {
    groups: {
      actions: "操作",
      status: "设置状态",
    },
    shot: {
      selected: "选中",
      edit: "编辑镜头",
      duplicate: "复制镜头",
      preview: "查看镜头详情",
      openReview: "打开审片队列",
      copyUrl: "复制镜头链接",
      delete: "删除镜头",
    },
    task: {
      edit: "编辑任务",
      openVersions: "打开版本",
      addNote: "添加备注",
      copyUrl: "复制任务链接",
      assign: "分配人员 / 审阅人",
      editDates: "编辑日期",
      addDependency: "添加前置任务",
      delete: "删除任务",
    },
    asset: {
      edit: "编辑资产",
      duplicate: "复制资产",
      preview: "查看资产详情",
      copyUrl: "复制资产链接",
      linkShot: "关联镜头",
      delete: "删除资产",
    },
    chart: {
      label: "图表操作",
      exportPng: "导出图片",
      fullscreen: "全屏查看",
      refresh: "刷新图表",
    },
  },
  en: {
    groups: {
      actions: "Actions",
      status: "Set Status",
    },
    shot: {
      selected: "Selected",
      edit: "Edit Shot",
      duplicate: "Duplicate Shot",
      preview: "Preview Shot",
      openReview: "Open Review Queue",
      copyUrl: "Copy Shot URL",
      delete: "Delete Shot",
    },
    task: {
      edit: "Edit Task",
      openVersions: "Open Versions",
      addNote: "Add Note",
      copyUrl: "Copy Task URL",
      assign: "Assign / Reviewer",
      editDates: "Edit Dates",
      addDependency: "Add Predecessor",
      delete: "Delete Task",
    },
    asset: {
      edit: "Edit Asset",
      duplicate: "Duplicate Asset",
      preview: "Preview Asset",
      copyUrl: "Copy Asset URL",
      linkShot: "Link to Shot",
      delete: "Delete Asset",
    },
    chart: {
      label: "Chart Actions",
      exportPng: "Export PNG",
      fullscreen: "View Fullscreen",
      refresh: "Refresh Chart",
    },
  },
} as const;

export function getContextMenuLocale(): ContextMenuLocale {
  if (typeof document === "undefined") return "zh";
  return document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "zh";
}

