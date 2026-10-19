# 哔哩哔哩增强（国际版适配）

基于 [kokoryh/Sparkle](https://github.com/kokoryh/Sparkle) 的「哔哩哔哩增强」模块，适配哔哩哔哩国际版（iPhone）：

- 首页右上角显示「消息」入口（同大陆版），也可放回底栏
- 「我的」页保留创作中心板块
- 评论区表情面板显示已购买的表情包
- 界面文字跟随 App 语言（简体中文 / 繁體中文 / English / 日本語）
- 屏蔽 B站 接口域名的 QUIC，让视频详情、评论、弹幕请求走 TCP，脚本才能处理（否则 App 可能改走 QUIC，绕过 HTTPS 解密）

## 安装（Shadowrocket）

原生 Shadowrocket 模块，无需 Script Hub。配置 → 模块 → 右上角 ＋，填入：

```
https://raw.githubusercontent.com/Komiyu313/bilibili-intl/main/bilibili-intl.module
```

安装前请删除原来的「哔哩哔哩增强」模块，以及通过 Script Hub 导入的本模块副本，避免重复处理。

## 使用须知

- Shadowrocket 首页的「全局路由」请保持为「配置」。选「代理」或「直连」时，Shadowrocket 不执行任何规则（包括本模块的规则），这时 B站 的视频详情、评论、弹幕请求可能改走 QUIC，空降助手、评论过滤等功能都会失效。
- 想让 B站 直连，请在配置的规则里把 B站 的策略改为 `DIRECT`，不要改全局路由。

## 参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| 创作中心 | `0` / `1`（默认） | 隐藏 / 保留服务器返回的创作中心板块 |
| 消息入口 | `top`（默认） / `bottom` | 首页右上角 / 底栏 |
| 屏蔽P2P端口 | `REJECT-NO-DROP`（默认） / `DIRECT` / 策略组名 | 4480、4483、9102 端口连接使用的策略：屏蔽 / 直连 / 指定策略。按端口匹配，对所有 App 生效 |

其余参数与原模块相同。

## 文件

- `bilibili-intl.module`：模块（Shadowrocket 原生）
- `bilibili-intl.sgmodule`：旧版 Surge 格式，仅为通过 Script Hub 订阅的旧链接过渡保留，之后会删除
- `bilibili.layout.js`：处理首页布局与「我的」页；其余接口仍使用原作者的脚本
- `bilibili.protobuf.request.js`：空降助手脚本，复制自原作者，仅把两个网络请求的超时由 3 秒放宽到 8 秒，减少网络较慢时首次观看失效

## 许可

本项目派生自 kokoryh/Sparkle，以 GPL-3.0 发布，见 `LICENSE`。
