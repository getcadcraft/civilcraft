---
title: 交换 LandXML
summary: 将其他土木软件的 LandXML 作为新项目打开，将点、曲面、线形、纵断面和管网导出为 LandXML 1.2，并了解哪些内容不会随之转移。
keywords: landxml, xml, 导入, 导出, 交换, tin, 曲面, 线形, 纵断面, 管网, 互操作, 数据交换
from: 870d5ece
---

LandXML 是大多数土木软件都能读写的开放交换格式。CivilCraft 读取和写入 LandXML 1.2。如果用过 Civil 3D，它的 LandXML 导入和导出对话框与此最接近；这里没有需要选择的选项，说明会告诉您遗漏了哪些内容。

## 打开 LandXML 文件

1. 单击{{ui:打开}}（或按{{key:Mod+O}}），选择 `.xml` 或 `.landxml` 文件，或将其拖到平面图上。
2. 若当前项目有未保存的更改，CivilCraft 会先询问。选择{{ui:保存副本}}、{{ui:不保存}}或{{ui:取消}}。
3. 会新建一个**新项目**。状态栏会说明读取了什么，例如“已打开 site.xml：412 个点、2 个曲面、3 条线形。”
4. 查看**曲面**信息下的方框。它列出所有被跳过或更改的内容，例如：
   - "Only the first surface ("EG") was opened; the file has 1 more." › “仅打开了第一个曲面（"EG"）；文件中还有 1 个。”
   - "Alignment "Ramp A" has elements CivilCraft cannot draw yet (not lines, arcs or clothoid spirals); it was skipped." › “线形 "Ramp A" 含有 CivilCraft 尚无法绘制的元素（不是直线、圆弧或回旋线）；已跳过。”
   - "Pipe network rules were not in the file; the placeholders are in use — set yours under Project." › “文件中没有管网规则；正在使用占位值，请在项目下设置规则。”

转换对应关系：

| 文件中 | CivilCraft 中 |
|---|---|
| 单位（Imperial 或 Metric） | 项目的**单位**（英尺或米） |
| 项目名称 | 项目**名称** |
| CgPoints | 项目的点；描述（或代码）给出所属组 |
| 第一个 TIN 曲面 | 原地面，原样使用（"Surface (from LandXML)"） |
| 每条由直线、圆弧和回旋线组成的线形 | 线形，其转折点、半径和缓和曲线长度由曲线重建 |
| 每条线形的第一个设计纵断面 | 其设计纵断面，带抛物线竖曲线 |
| 第一个管网 | 管网，带其井口、集水坑和管底 |
| 直线和圆弧的平面特征 | 特征线，圆弧保留；来自其他程序的则以**仅绘制**开始 |

完整的元素和属性列表见[LandXML：读取和写入的内容](topic:landxml-reference)。

:::note
读取自 LandXML 的曲面不会在更改点组或绘制断裂线时重建。在**曲面**部分单击{{ui:由点重建曲面}}，可改为从点构建曲面（按{{key:Mod+Z}}可恢复 LandXML 曲面）。
:::

## 导出 LandXML

1. 在**导出**组中单击{{ui:LandXML}}。
2. 浏览器会下载 `<name>.xml`。状态栏会说明包含的内容，例如“已导出 LandXML 1.2：276 个点、2 个曲面、1 条线形、管网。此处的场地平台不属于 LandXML；竖向后的曲面属于。”

文件包含：

- **单位**：美国测量英尺或米。
- **CgPoints**：每个点，以其点号为名称，描述为说明，组为代码。
- **曲面**：原地面作为 TIN，其断裂线和外边界作为源数据；当场地平台或道路模型进行竖向时，第二个名为"Proposed"的 TIN 曲面。
- **线形**：直线、圆弧和回旋线及其桩号，每条附带一个纵断面，其中包含沿线采样的原地面，以及（当至少有两个 PVI 时）设计纵断面（PVI 和抛物线竖曲线）。
- **PipeNetworks**：结构物及其井口、集水坑，每根管道的管底，以及管道的直径、长度和坡度。
- **PlanFeatures**：每条特征线，以直线和圆弧表示，两端带标高，并注明其用途。

## 不会随之转移的内容

- 作为对象的场地平台和道路模型。其结果在"Proposed"曲面中。
- 有错误的线形（例如重叠的曲线）：会被略去，并计入状态消息。
- 缺少两端管底的管道，以及少于两个结构物的管网。
- 取自曲面的井口会被写为固定井口。重新打开后，即使曲面改变，结构物仍保留该数值。
- 管网规则（最小坡度、覆土、落差）：LandXML 没有对应位置。
- 显示设置和点组的曲面选择：请为此保存 CivilCraft 项目。

打开时，CivilCraft 不读取非回旋线的回旋线、网格曲面、仅引用其他点的点、地块、特征线中的回旋线、道路或测量数据。每一项都会在说明中列出，绝不猜测。

## 往返交换

要将工作交给使用其他土木软件的人并再取回，请导出 LandXML，让对方编辑，然后将其 LandXML 作为新项目打开。同时保留 `.civilcraft.json` 文件：它是唯一保存 CivilCraft 所有信息的文件。
