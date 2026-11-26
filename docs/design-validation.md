GATE: OPEN 25 (rounds used up)

# Taste Skill 验证记录

本记录对应浅色精简与一句话入口追加前的第三轮门禁快照，不声称最终应用完整通过营销页门禁。用户随后明确要求浅色、减少文字与参考同类产品，这些修改另以六尺寸实际功能回归和截图验证。

无豁免，未修改 skill 原始脚本与 motion 资产。没有继承 skill 的整屏营销结构和装饰性 moment，因为本任务是可实际操作的午餐工具。

## 门禁快照中的全部开放项

| 检查 | 位置 | 检查器说明 |
| --- | --- | --- |
| hero-fill | main#main > div.workspace > aside.preferences "午饭偏好" | the next section shows on the first screen: it starts at 345px on a 900px screen (the hero ends at 315px) |
| nav | header.header > a.brand "饭 午饭有着落 一个人的午餐助手" | nav link wraps to a second line |
| cta | main#main > section.intro.hero | the hero has no button (the nav's does not count) |
| cta | section#history-section "我的午餐记录" | the last section before the footer ends with no button |
| heading-scale | div.meal-body > div.meal-title-row > div:nth-of-type(1) > h3 "香菇青菜汤面" | h3 headings in 2 sizes, 16px ("再给你两个选择") to 22px (x1.38) |
| moment-none | (the page) | a software page (--type) deals no moment: every kind carries one, two on a long page (moments.md) |
| hero-screen | main#main > section.intro.hero "☀ 11月26日星期四/ 一人食，也认真选今天午饭，吃点合口味的。按你的口味选，" | the hero ends at 315px on a 900px screen, 585px above the fold: it ends at the fold, 1px either way (SR-1) |
| hero-screen | main#main > div.workspace "午饭偏好重置×先选口味，剩下的交给推荐。 今天想吃什么口味可多选清淡家常香辣酸甜" | 585px of the next section shows on the first screen (from 315px on a 900px screen): nothing below the hero shows at load (SR-1) |
| section-height | main#main > footer "午饭有着落 · 一个人的午餐助手模拟菜单，不提供下单。餐图为示意，来自 Unsp" | the section is 101px tall (0.1 screens), 799px short of one screen (900px): every section after the hero is one screen or two, 2px either way (SR-2) |
| section-height | section#history-section "我的午餐记录0 天好好吃饭清空记录♧ 你的午餐小日记，等着从今天这一餐开始。" | the section is 199px tall (0.2 screens), 701px short of one screen (900px): every section after the hero is one screen or two, 2px either way (SR-2) |
| one-section | h1#hero-h "今天午饭，吃点合口味的。" | the screen at scroll 0px (stride 0) shows 219px of section 1 and the heading of section 1 whole and the content of 2 sections, over 24px each beside section 2: a screen shows one section (another may peek 8px, 24px WARN) (SR-4) |
| one-section | section#history-section > div.history-title > div > h2 "我的午餐记录" | the screen at scroll 715px (the top of section 3) shows 199px of section 3 and the heading of section 3 whole and the content of 3 sections, over 24px each beside section 2: a screen shows one section (another may peek 8px, 24px WARN) (SR-4) |
| one-section | main#main > div.workspace "午饭偏好重置×先选口味，剩下的交给推荐。 今天想吃什么口味可多选清淡家常香辣酸甜" | a <div> sits directly in <main>: every part of <main> is a <section> (SR-4) |
| one-section | div#history-list > div.history-empty "♧ 你的午餐小日记，等着从今天这一餐开始。" | a band: a box 100% of the section wide on a ground of its own that holds only text: the section's own ground is the band (SR-4) |
| one-heading | section.recommendations > div.section-heading > div > h2 "为你选的这一餐" | the section holds 2 h2 headings: one per section, first in its .wrap (SR-5) |
| one-heading | h2#prefs-title "午饭偏好" | headings of two sections show whole on one screen at 4 of 15 scroll positions (26.7%; at scroll 0, 50, 100, 150px), here with "✳": at most 3% on a desktop (SR-5) |
| container-edges | header.header "跳到午饭推荐饭午饭有着落一个人的午餐助手今日推荐午餐记录 0 关于 Demo ↗" | the nav's content runs 24px from the left and 80px from the right (read from its outermost blocks: no .wrap): the page's container starts at 80px; 24 and 80px are not one margin; the margin is 64-120px at 1440px (one container, equal margins, 2px either way) (SR-6) |
| container-edges | main#main > section.intro.hero "☀ 11月26日星期四/ 一人食，也认真选今天午饭，吃点合口味的。按你的口味选，" | the section needs exactly one in-flow child .wrap (it has 2 in-flow children, 0 .wrap) (and 3 more like it: "午饭偏好重置×先选口味，剩下的交给推荐。 今天想", "我的午餐记录0 天好好吃饭清空记录♧ 你的午餐小", "午饭有着落 · 一个人的午餐助手模拟菜单，不提供") (SR-6) |
| container-edges | header.header > a.skip-link "跳到午饭推荐" | a box runs 24-154px, outside the container lines of the nav at 80-1360px: full width is for background layers and grounds only (SR-6) |
| container-edges | article.meal-card > div.meal-body > div.meal-tags > span:nth-of-type(1) "水煮" | 1 text block starts on a left line at x 802, 722px from the container's left: text starts on the container's left, or on one split line (x 623, 732, 841) (SR-6) |
| container-edges | div.meal-body > div.meal-title-row > div:nth-of-type(1) > h3 "香菇青菜汤面" | 2 text blocks start on a left line at x 794, 714px from the container's left: text starts on the container's left, or on one split line (x 623, 732, 841) (also "面面俱到 · 手作面") (and 3 more like it: x 568, "为你选的这一餐", "午饭偏好") (SR-6) |
| container-edges | div#recommendation-content > article.meal-card "✧ 按你的口味，选好了香菇青菜汤面面面俱到 · 手作面¥18模拟到手价水煮面条清" | a box over half the container wide runs 416-1360px, not on the container's lines at 80-1360px (and 1 more like it: "↶记得昨天，今天换个花样记录昨天的午饭，今天就会") (SR-6) |
| split-pair | div#recommendation-content > article.meal-card "✧ 按你的口味，选好了香菇青菜汤面面面俱到 · 手作面¥18模拟到手价水煮面条清" | the two columns of the split start 28px apart at the top (centred on each other): a split's columns are top-aligned, 8px either way (SR-8) |
| hero-fill | button#open-prefs "☷ 我的午饭偏好 家常 / 清淡 · ¥35以内 · 1项忌口 调整 ↗" | the next section shows on the first screen: it starts at 300px on a 844px screen (the hero ends at 300px) |
| container | page | no .wrap |

这些结果包含营销页整屏高度、特定 .wrap 模板、两条起始线要求，以及卡片内标题和配图位置的模板规则。品牌副标题已在后续简化中移除；入口、字号、色彩与触控区域用产品级回归检查。

## 最终产品级验证

- 18 项推荐和一句话解析测试通过。
- 1440×900、1024×768、820×1180、768×1024、390×844、320×740：无横向溢出，图片正常，所有可见按钮高度至少 44px。
- 一句话识别、未知忌口原子性拒绝、偏好设置焦点保留、预算空结果、昨日记录、当天确认、刷新保留、Escape 恢复焦点、实时窗口尺寸切换均通过。
- 文案 lint：0 FAIL、0 WARN。
- 首次性能检查：0 FAIL，6 WARN；约 590 KiB 初始传输，布局偏移 0。主机 CPU 繁忙影响计时；后续增加了图片尺寸与约 176px 本地缩略图。
- 无真实接口、支付或在线模型；不把模拟数据、示意图或本地解析描述为真实商品或在线 AI。
