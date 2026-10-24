# 哔哩哔哩增强（国际版适配）

基于 [kokoryh/Sparkle](https://github.com/kokoryh/Sparkle) 的「哔哩哔哩增强」模块，适配哔哩哔哩国际版（iPhone）：

- 评论区/私信可使用已购买的表情包
- 首页右上角添加「消息」入口
- 「我的」页面默认保留创作中心板块

## 安装（Shadowrocket）

配置 → 模块 → 右上角 ＋，填入：

```
https://raw.githubusercontent.com/Komiyu313/bilibili-intl/main/bilibili-intl.sgmodule
```

安装前请关闭原来的「哔哩哔哩增强」模块，避免重复处理。

## 参数

| 参数 | 取值与说明 |
| --- | --- |
| 动态最常访问 | `auto`（默认）：仅当列表中存在直播状态时显示<br>`show`：始终显示<br>`hide`：始终隐藏 |
| 创作中心 | `0`：隐藏<br>`1`（默认）：显示，使用大陆版的宫格样式（「创作中心」「稿件管理」「数据中心」「有奖活动」和「发布」按钮） |
| 消息入口 | `top`（默认）：首页右上角（同大陆版）<br>`bottom`：底栏（同国际版原样） |
| 过滤置顶评论广告 | `0`：关闭<br>`1`（默认）：开启 |
| 空降助手 | 默认开启，配置为 `#` 时关闭 |
| 空降助手策略 | 默认直连（`DIRECT`），建议配置为代理策略 |
| 屏蔽P2P | 默认开启，配置为 `#` 时关闭 |
| 日志等级 | `1`：DEBUG<br>`2`：INFO<br>`3`：WARN<br>`4`（默认）：ERROR<br>`5`：OFF |

## 文件

- `bilibili-intl.sgmodule`：模块
- `bilibili.layout.js`：处理首页布局与「我的」页；其余接口仍使用原作者的脚本

## 许可

本项目派生自 kokoryh/Sparkle，以 GPL-3.0 发布，见 `LICENSE`。
