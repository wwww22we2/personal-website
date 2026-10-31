# 猫鱼笨鱼工作室 · 个人游戏网站

参考 [caldera.xyz](https://caldera.xyz) 的视觉风格制作的个人游戏展示网站：暖灰半调网点背景、超粗大标题、大圆角面板、黑色药丸按钮与虚线胶囊按钮、连体统计卡（主色为黑色，紫色作辅助撞色）。

玩家交流：QQ群 432024840（顶部导航与页脚均有展示，页脚含群二维码 `assets/qq-qrcode.png`）。

## 本地预览

```bash
node server.mjs
# 打开 http://127.0.0.1:8765
```

也可以直接双击 `index.html` 用浏览器打开（图片全部本地化，无需服务器）。

## 目录结构

```
index.html        页面结构
css/styles.css    全部样式（设计变量集中在 :root）
js/games.js       游戏数据（从 TapTap 抓取整理）
js/main.js        交互逻辑（筛选、进场动画、跑马灯等）
assets/<appId>/   每款游戏的 banner 截图（shot0.jpg 为主页首图）与图标
data/             抓取的原始页面与解析结果（备用）
server.mjs        本地预览服务器
```

## 游戏数据维护

编辑 `js/games.js`，每款游戏一个对象：

```js
{
  id: "980975",                     // TapTap 应用 id
  name: "星了瑞：卖咖啡卖到全城",
  cats: ["模拟", "养成"],           // 可选：模拟 / 修仙 / 养成 / 塔防
  desc: "一句话简介…",
  rating: 1, ratingCount: 2,        // 评分人数 < 5 时自动显示"新上架"
  published: "2026-10-24",          // 用于排序（新→旧）
  link: "https://www.taptap.cn/app/980975",
  accent: "#A9652F",                // 卡片主题色
  icon: "assets/980975/icon.jpg",
  shots: ["assets/980975/shot0.jpg", "..."],
}
```

新增游戏时：新建 `assets/<appId>/` 放入 banner 与图标，再在 `js/games.js` 数组中追加即可；
"最新上架"板块自动展示数据中上架日期最新的一款（`js/main.js` 的 `buildFeatured` 取 `GAMES[0]`）。

## 站点内容

- **首屏**：大标题 + 黑紫半调网点拼贴 + 连体统计卡
- **最新上架**：最新一款游戏的重点推荐
- **全部游戏**：8 款游戏卡片，支持 模拟 / 修仙 / 养成 / 塔防 筛选
- **游戏分类**：四个品类入口，点击可筛选并跳转
- **关于**：工作室介绍 + TapTap 关注入口
