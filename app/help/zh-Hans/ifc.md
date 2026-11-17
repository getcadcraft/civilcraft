---
title: IFC 导出与导入
summary: 将整个项目保存为一个 IFC 文件，格式为 IFC 4.3、IFC4 或 IFC2x3（路线、道路、土方、曲面、墙、管道），并可打开 IFC 文件读取其中的路线和曲面。
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, 路线, ifcalignment, 道路, ifcroad, 土方, tin, 交付物, 采购, 导出 ifc, 导入 ifc
from: 6b998bcf
---

IFC 是许多公共业主要求作为交付物的开放交换格式。CivilCraft 会将整个项目写入一个 IFC 文件，也能从 IFC 文件中读回路线和曲面。

## 导出

1. 单击 **导出** 组中的 {{ui:IFC}}（在功能区样式中为：{{ui:输出}} › {{ui:导出}} › {{ui:IFC}}）。
2. 选择格式。**IFC 4.3 ADD2** 位于首位，且为默认值：它是包含路线、道路和土方的版本。仅当接收方的软件无法读取 4.3 时，才选择 IFC4 或 IFC2x3。
3. 对话框会说明文件将包含什么，以及所选格式省略了什么。单击 {{ui:导出 IFC}}。
   文件会以 "*项目名称*-ifc4x3.ifc"、"-ifc4.ifc" 或 "-ifc2x3.ifc" 的名称下载。CivilCraft 会记住你上次选择的格式。

## 各格式包含的内容

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| 路线 | IfcAlignment，包含其水平（直线、圆弧、回旋线）与竖向（纵坡、抛物线竖曲线）线形、其曲线（IfcCompositeCurve、IfcGradientCurve）、起点桩号以及超高事件 | 土建元素上的三维折线 | 代理对象上的三维折线 |
| 走廊 | 带道路部件的 IfcRoad；车道、路肩、排水沟和人行道为 IfcPavement，路缘石为 IfcKerb，绿化带；每层路面结构为 IfcCourse，包含其厚度、材料和体积；边坡为 IfcEarthworksCut 和 IfcEarthworksFill，附挖方和填方体积；设计车速和等级 | 按其本质命名的土建元素，按道路分组 | 代理对象，按道路分组 |
| 曲面 | IfcGeographicElement TERRAIN，采用不规则三角网 | 三角面集 | 基于面的曲面模型（文件较大） |
| 平台与墙 | 平台顶面，其边坡为土方，挡土墙为 IfcWall RETAININGWALL | 相同，墙采用用户自定义的墙类型 | 相同，墙的类型记录在 ObjectType 中 |
| 管网 | IfcPipeSegment 和 IfcDistributionChamberElement，位于 IfcDistributionSystem 中 | 相同 | IfcFlowSegment 和检查井，位于 IfcSystem 中 |
| 地理配准 | IfcProjectedCRS 和 IfcMapConversion | 相同 | 场地上的 ePSet_ProjectedCRS 和 ePSet_MapConversion |

开启了 **铁路** 选项的路线会以 IfcRailway 的形式写入 IFC 4.3：其缓和段各自作为独立类型（回旋线、三次抛物线、Bloss、Helmert、正弦半波（作为余弦曲线）、正弦），其超高为 IfcAlignmentCant，其轨道包括钢轨、轨枕、道床，以及道床之下的底砟。IFC4 和 IFC2x3 则以土建元素或代理对象的形式包含相同的部件。打开 IFC 4.3 铁路文件时，会恢复其缓和段和超高。

每个文件还包含地块（占地轮廓）、景观工作空间中的植物和硬质景观，以及建筑体量（每个为带楼层的 IfcBuilding），全部位于同一场地中。属性集记录你的设计内容：桩号、断面组合、挖填方边坡、车道宽度和数量、管底标高、井口标高和墙高；工程量（长度、面积、体积）为 IfcElementQuantity 集。

## 单位与坐标

文件采用项目的长度单位（米或美国测量英尺）；面积和体积以平方米和立方米计。若设置了坐标系（GIS › 坐标系），文件会被放置到地图上：其原点的东坐标和北坐标，以及地方（局部）坐标系的旋转和比例，都记录在地图转换中。若未设置坐标系，文件会在一个属性集中记录其局部原点，且不会放置到地图上。

## 导入

用 {{ui:打开}} 打开 .ifc 文件，或将其拖到平面图上。导入对话框会说明文件包含的内容：

- 来自 IFC 4.3 的 **路线**（水平与竖向线形）以及 IFC 4x1 的路线曲线，会成为 CivilCraft 路线，并保留其 PI、半径、缓和曲线长度和 PVI。CivilCraft 的 PI 模型无法容纳的路线（复合曲线、位于两条曲线之间的缓和曲线、起止于曲线上的路线）不会被导入，对话框会说明原因。
- **曲面**：选择成为现状地面的那一个，或保留项目原有的。
- **其他所有内容**（以及其他曲面）可在三维视图中作为参考显示。参考元素在项目打开期间保留，不会保存到项目文件中。

由 CivilCraft 以 IFC4 或 IFC2x3 写入的文件，会从其属性集中完整恢复路线。

## 尚未实现

- 道路的超高以超高事件和道路曲面的形式写入（横向倾斜仅用于铁路）。
- 将参考元素保存到项目文件中，以及从 IFC 导入管网或平台并作为可编辑对象。
