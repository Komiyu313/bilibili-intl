# 哔哩哔哩增强（国际版适配）

基于 [kokoryh/Sparkle](https://github.com/kokoryh/Sparkle) 的「哔哩哔哩增强」模块，适配哔哩哔哩国际版（iPhone）：

- 首页右上角显示「消息」入口（同大陆版），也可放回底栏
- 「我的」页保留创作中心板块
- 评论区表情面板显示已购买的表情包
- 界面文字跟随 App 语言（简体中文 / 繁體中文 / English / 日本語）

## 安装（Shadowrocket）

配置 → 模块 → 右上角 ＋，二选一：

- 原生模块，无需 Script Hub：

  ```
  https://raw.githubusercontent.com/Komiyu313/bilibili-intl/main/bilibili-intl.module
  ```

- Surge 格式，经 Script Hub 转换后使用：

  ```
  https://raw.githubusercontent.com/Komiyu313/bilibili-intl/main/bilibili-intl.sgmodule
  ```

两者只启用一个，并关闭原来的「哔哩哔哩增强」模块，避免重复处理。

## 参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| 创作中心 | `0` / `1`（默认） | 隐藏 / 保留服务器返回的创作中心板块 |
| 消息入口 | `top`（默认） / `bottom` | 首页右上角 / 底栏 |

其余参数与原模块相同。原生模块没有「屏蔽P2P」参数：Script Hub 转换时会丢弃用到它的规则，所以它在 Shadowrocket 上本来就不起作用。

## 文件

- `bilibili-intl.sgmodule`：模块（Surge 格式）
- `bilibili-intl.module`：原生 Shadowrocket 模块。内容就是 Script Hub 对 `bilibili-intl.sgmodule` 的转换结果，只改了两处：脚本都加上 `engine=webview`（不写时原生模块会用 JSC 引擎，而原作者的脚本需要 WebView），并去掉「屏蔽P2P」参数
- `bilibili.layout.js`：处理首页布局与「我的」页；其余接口仍使用原作者的脚本

## 许可

本项目派生自 kokoryh/Sparkle，以 GPL-3.0 发布，见 `LICENSE`。
