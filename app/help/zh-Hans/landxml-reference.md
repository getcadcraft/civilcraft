---
title: LandXML：读取和写入的内容
summary: CivilCraft 读取和写入的 LandXML 1.2 元素和属性（逐个元素说明），以及它跳过的所有内容。
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, 特征线, 架构
from: ca3cf359
---

CivilCraft 写入带官方命名空间和架构位置的 LandXML 1.2。它读取根元素为 `LandXML` 的任何文件，并按名称读取下列元素（忽略命名空间前缀；不检查版本）。其 XML 读取器只接受五个标准实体和数字字符引用；它从不加载 DTD 或外部文件。步骤说明见[交换 LandXML](topic:landxml)。

LandXML 写入坐标时北坐标在前：一个点写作“N E”或“N E Z”。

## 写入

| 元素 | CivilCraft 写入的内容 |
|---|---|
| `Units` | `Imperial`（linearUnit 为 USSurveyFoot，面积以平方英尺计，体积以立方码计，直径以英寸计）或 `Metric`（meter、square meter、cubic meter、millimeter） |
| `Project` | `name` = 项目名称 |
| `Application` | name 为 CivilCraft，manufacturer 为 CadCraft |
| `CgPoints` / `CgPoint` | `name` = 点号，`desc` = 描述，`code` = 组；文本为 "N E Z"（无标高时为 "N E"） |
| `Alignments` / `Alignment` | `name`、`length`、`staStart` |
| `CoordGeom` / `Line` | `staStart`、`length`、`Start`、`End` |
| `CoordGeom` / `Curve` | `crvType` 为 arc，`rot` 为 cw 或 ccw，`radius`、`length`、`staStart`、`chord`、`delta`（度）、`tangent`、`external`、`midOrd`；`Start`、`Center`、`End`、`PI` |
| `Profile` / `ProfSurf` | 沿线形的原地面，以桩号和标高对（`PntList2D`）表示，在离开曲面处分段 |
| `Profile` / `ProfAlign` | 设计纵断面（名为 "<alignment> design"）：端点和转折点使用 `PVI`，竖曲线使用带 `length` 的 `ParaCurve` |
| `Surfaces` / `Surface` | `name` 和 `desc`；先为原地面，当场地平台或道路模型进行竖向时再加 "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` 为 standard，`name`，`PntList3D`（仅原地面） |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` 为 outer，`edgeTrim` 为 true，`PntList2D`（仅原地面，如果存在） |
| `Definition` | `surfType` 为 TIN，`area2DSurf`、`area3DSurf`、`elevMax`、`elevMin`；带 `id` 的 `Pnts` / `P`；`Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`，`pipeNetType` 为 storm 或 sanitary |
| `Struct` | `name`、`elevRim`（所用井口标高，取自设定值或曲面）、`elevSump`（集水坑标高）；`Center`；带 `diameter` 的 `CircStruct`；带 `elev`、`flowDir`（in 或 out）、`refPipe` 的 `Invert`（管底） |
| `Pipe` | `name`、`refStart`、`refEnd`、`length`、`slope`；带 `diameter` 的 `CircPipe` |
| `PlanFeatures` / `PlanFeature` | 每条特征线一个：`name`；`CoordGeom`，包含 `Line`（`length`、`Start`、`End`）和 `Curve`（`rot`、`crvType` 为 arc、`radius`、`length`、`chord`、`delta`；`Start` 和 `End` 为 "N E Z"，`Center` 为 "N E"）；带 `Property` 用途和闭合状态的 `Feature code="CivilCraft"` |

不写入：以对象形式存在的场地平台和道路模型（其结果为 "Proposed" 曲面）、有错误的线形、缺少两端管底的管道，以及管网规则。

## 读取

| 元素 | CivilCraft 读取的内容 |
|---|---|
| `Units` | `Imperial` 或 `Metric` 及其 `linearUnit` 决定使用英尺还是米。无法识别的单位会被记录。 |
| `Project` | `name` 成为项目名称。 |
| `CgPoints` / `CgPoint`（同样支持嵌套） | 名称（或 `oID`）、"N E" 或 "N E Z"、`desc`（或 `code`）作为描述 |
| 带 `Definition surfType="TIN"` 的 `Surface` | `Pnts` 和 `Faces` 作为原地面（仅第一个曲面）；不可见面（`i="1"`）会被忽略 |
| `SourceData` / `Breaklines` | 三维断裂线，与曲面一同保留 |
| `SourceData` / `Boundaries` | 外边界 |
| `Alignment` / `CoordGeom` | `Line` 和 `Curve` 元素；转折点由每条曲线的 `PI` 重建，或由其 `Center` 和切线重建；`staStart` |
| `Profile` / `ProfAlign` | `PVI` 和 `ParaCurve`（带 `length`）；至少有两个 PVI 的第一个设计纵断面 |
| `PlanFeatures` / `PlanFeature` | 每个作为一条特征线：`Line`、`Curve`（其 `Start`、`Center`、`End` 和 `rot`）以及 `IrregularLine`（`PntList3D` 或 `PntList2D`），首尾相连（缺口以直线段连接并记录）；终点与起点重合时闭合；用途和闭合状态来自 CivilCraft 自身的 `Feature`，否则为**仅绘制**。无标高的点取 0（会记录）。 |
| `Spiral` | 位于 `Curve` 旁的回旋线（进入和退出；读取为带半径和缓和曲线长度的 PI，写回时带 `theta`、`totalX`、`totalY`、`tanLong`、`tanShort`、`constant`） |
| `PipeNetwork` | 第一个包含管道的管网：`Struct`（`Center`、`elevRim`、`elevSump`、`CircStruct` 的 diameter、每根管道的 `Invert`）和 `Pipe`（`refStart`、`refEnd`、`CircPipe` 的 diameter） |

## 跳过的内容，并在说明中列出

- 第一个之后的曲面、网格曲面以及其他非 TIN 曲面
- 包含 `IrregularLine` 或 `Chain` 元素的线形，非回旋线的回旋线，两条曲线之间的回旋线，或没有几何图形的线形
- 第一个之后的设计纵断面；`CircCurve` 和 `UnsymParaCurve` 竖曲线（其 PVI 保留，但没有曲线）
- 仅引用其他点的点（`pntRef`），以及无法读取坐标的点
- 重复的点名（保留第一个）
- 隐藏、显示和数据裁剪边界；没有三维点的断裂线
- 第一个之后的管网；除 storm 和 sanitary 之外的管网类型（按 storm 读取）
- 矩形、进水口和出水口结构（按圆形读取）；蛋形、椭圆和箱形管道及渠道（按无尺寸的圆形管道读取）
- 特征线中的 `Spiral` 元素
- `Parcels`、`Roadways`、`GradeModel` 和 `Survey`

文件中的地面纵断面（`ProfSurf`）不被使用：CivilCraft 直接从曲面采样地面。

## 文件无法打开时的消息

| 消息 | 含义 |
|---|---|
| "这是 XML 但不是 LandXML（其根元素为 <…>）。" | 文件是另一种 XML。 |
| "… 中没有 CivilCraft 可以读取的点、TIN 曲面或线形。" | 文件中的内容全部属于跳过列表。其后的说明会列出其中有什么。 |
| "结束标签不匹配 …"、"标签未闭合 …"、"文件在 … 内结束" | 文件已损坏或被截断。 |
