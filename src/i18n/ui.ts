import type { Locale } from "./locales";

/**
 * The words the site's own chrome uses — navigation, labels, empty states.
 * Prose that belongs to one page stays in that page, next to its markup.
 *
 * English is the reference: `zh` is typed against its keys, so a string added
 * to one side and forgotten on the other is an `astro check` error, not a blank
 * on the live site.
 */
const en = {
  skip: "Skip to content",
  navLabel: "Main",
  home: "Xinqi Mu, home",
  projects: "Projects",
  notes: "Notes",
  about: "About",
  all: "All →",
  allProjects: "All projects",
  allNotes: "All notes",
  now: "Now",
  updated: "Updated",
  switchTo: "Read this page in English",

  themeTitle: "Switch colour theme — System, Light, Dark",
  themeLabel: "Theme:",
  themeSystem: "System",
  themeLight: "Light",
  themeDark: "Dark",

  empty: "Empty",
  emptyTitle: "Nothing here yet",
  emptyProjects: "The first one will show up here, with what it does and whether it still works.",
  emptyNotes: "The first one will show up here.",

  status: "Status",
  built: "Built",
  closed: "Closed",
  stack: "Stack",
  links: "Links",
  source: "Source",
  site: "Site ↗",
  code: "Code ↗",
  backToProjects: "← Projects",
  backToNotes: "← Notes",
  revised: "rev.",

  statusActive: "Active",
  statusLive: "Live",
  statusOffline: "Offline",
  // Rendered after the label as `Live — usable, …`, so none may contain a dash.
  meaningActive: "usable, and I'm still adding to it",
  meaningLive: "usable, but I've stopped changing it",
  meaningOffline: "no longer usable; the page stays as a record",

  menu: "Menu",
  meat: "Meat",
  vegetable: "Vegetables",
  soup: "Soups",
  staple: "Staples",
  snack: "Snacks",
  dessert: "Desserts",
  spice1: "Mild",
  spice2: "Medium",
  spice3: "Hot",
  ingredients: "Ingredients:",
  largerPhoto: "larger photo",
  close: "Close",
};

type Key = keyof typeof en;

const zh: Record<Key, string> = {
  skip: "跳到正文",
  navLabel: "主导航",
  home: "Xinqi Mu，首页",
  projects: "项目",
  notes: "笔记",
  about: "关于",
  all: "全部 →",
  allProjects: "全部项目",
  allNotes: "全部笔记",
  now: "近况",
  updated: "更新于",
  switchTo: "阅读本页的中文版",

  themeTitle: "切换配色：跟随系统、浅色、深色",
  themeLabel: "配色：",
  themeSystem: "跟随系统",
  themeLight: "浅色",
  themeDark: "深色",

  empty: "空",
  emptyTitle: "这里还什么都没有",
  emptyProjects: "第一个会出现在这里，写明它做什么、现在还能不能用。",
  emptyNotes: "第一篇会出现在这里。",

  status: "状态",
  built: "时间",
  closed: "停用",
  stack: "技术栈",
  links: "链接",
  source: "源码",
  site: "网站 ↗",
  code: "代码 ↗",
  backToProjects: "← 项目",
  backToNotes: "← 笔记",
  revised: "修订于",

  statusActive: "在做",
  statusLive: "可用",
  statusOffline: "已下线",
  meaningActive: "能用，我还在继续加东西",
  meaningLive: "能用，但我已经不再改它了",
  meaningOffline: "已经不能用了，页面留作记录",

  menu: "菜单",
  meat: "荤菜",
  vegetable: "素菜",
  soup: "汤品",
  staple: "主食",
  snack: "小食",
  dessert: "甜点",
  spice1: "微辣",
  spice2: "中辣",
  spice3: "重辣",
  ingredients: "食材：",
  largerPhoto: "大图",
  close: "关闭",
};

const ui: Record<Locale, Record<Key, string>> = { en, zh };

/** `const t = useTranslations(lang)` then `t("projects")`. */
export function useTranslations(lang: Locale) {
  return (key: Key) => ui[lang][key];
}
