# 哔哩哔哩增强（国际版适配）

基于 [kokoryh/Sparkle](https://github.com/kokoryh/Sparkle) 的「哔哩哔哩增强」模块，适配哔哩哔哩国际版（iPhone）：

- 首页右上角显示「消息」入口（同大陆版），也可放回底栏
- 「我的」页保留创作中心板块
- 评论区表情面板显示已购买的表情包
- 界面文字跟随 App 语言（简体中文 / 繁體中文 / English / 日本語）

## 安装（Shadowrocket）

配置 → 模块 → 右上角 ＋，填入：

```
https://raw.githubusercontent.com/Komiyu313/bilibili-intl/main/bilibili-intl.sgmodule
```

Shadowrocket 可以直接读取这个 Surge 格式的模块，不需要 Script Hub。建议直接导入原文件，不要先转换：按 Script Hub 转换结果改写的版本（规则、本地映射和脚本参数的写法都被改动过）在测试中空降助手和置顶评论过滤都失效了。

安装前请关闭原来的「哔哩哔哩增强」模块，避免重复处理。

## 参数

| 参数 | 取值 | 说明 |
| --- | --- | --- |
| 创作中心 | `0` / `1`（默认） | 隐藏 / 保留服务器返回的创作中心板块 |
| 消息入口 | `top`（默认） / `bottom` | 首页右上角 / 底栏 |

其余参数与原模块相同。

## 文件

- `bilibili-intl.sgmodule`：模块（Surge 格式，Shadowrocket 可直接使用）
- `bilibili.layout.js`：处理首页布局与「我的」页；其余接口仍使用原作者的脚本

## 许可

本项目派生自 kokoryh/Sparkle，以 GPL-3.0 发布，见 `LICENSE`。
