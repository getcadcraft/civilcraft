---
title: 工具栏参考
summary: CivilCraft 中的每个工具栏按钮、其功能、快捷键，以及何时呈灰色或拒绝执行。
keywords: 工具栏, 按钮, 命令, 工具, 文件, 导出, 曲面, 设计, 编辑, 视图, 菜单
from: 4c4352bc
---

工具栏位于应用顶部，分为七组。将鼠标悬停在每个按钮上，即可显示其提示和快捷键。

## 文件

| 按钮 | 快捷键 | 功能 |
|---|---|---|
| {{ui:New}} | 无 | 新建一个空项目。若有未保存的更改，会先询问。 |
| {{ui:Open}} | {{key:Mod+O}} | 打开点文件（CSV、TXT）、LandXML 或 CivilCraft 项目。 |
| {{ui:Save}} | {{key:Mod+S}} | 将项目下载为 `<name>.civilcraft.json`。 |

## 导出

| 按钮 | 快捷键 | 功能 |
|---|---|---|
| {{ui:LandXML}} | 无 | 下载 `<name>.xml`：以 LandXML 1.2 格式包含测量点、曲面、路线、纵断面和管网。项目为空时显示“尚无可导出的内容。” |
| {{ui:DXF}} | 无 | 下载 `<name>.dxf`：平面线条，格式为 R12 DXF。 |
| {{ui:PDF}} | {{key:Mod+P}} | 打开**将平面图打印为 PDF**。项目为空时显示“尚无可打印的内容。” |

## 曲面

| 按钮 | 快捷键 | 功能 |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | 按顺序单击测量点，按 {{key:Enter}} 完成。断裂线采用各点的高程。 |
| {{ui:Boundary}} | {{key:O}} | 依次单击外边界的角点，按 {{key:Enter}} 完成。会替换原有边界。 |

没有曲面时，两者均会显示“尚无曲面：请先打开测量点。”

## 设计

| 按钮 | 快捷键 | 功能 |
|---|---|---|
| {{ui:Alignment}} | {{key:A}} | 按顺序单击各交点（PI），按 {{key:Enter}} 完成。 |
| {{ui:Pad}} | {{key:G}} | 依次单击平台的角点，按 {{key:Enter}} 完成。与曲面工具一样，无曲面时会发出警告；平台仅能在曲面上进行放坡。 |
| {{ui:Pipes}} | {{key:P}} | 按从上游到下游的顺序单击构筑物（单击已有的构筑物即可接入），按 {{key:Enter}} 完成。 |
| {{ui:Profile}} | {{key:R}} | 显示或隐藏平面图下方的纵断面视图。 |

## 编辑

| 按钮 | 快捷键 | 功能 |
|---|---|---|
| {{ui:Undo}} | {{key:Mod+Z}} | 撤销上一次更改（最多 200 次）。无可撤销内容时呈灰色。 |
| {{ui:Redo}} | {{key:Mod+Y}} | 重做已撤销的操作。无可重做内容时呈灰色。 |
| {{ui:Copy}} | {{key:Mod+C}} | 复制所选测量点，并以电子表格可接收的点行格式放入剪贴板。未选择任何点时呈灰色。 |
| {{ui:Paste}} | {{key:Mod+V}} | 粘贴点：点会跟随指针移动，单击后放下，并使用其他点均未使用的编号。从电子表格中复制的点行也可粘贴。 |
| {{ui:More}} | 无 | 打开下方菜单。 |

{{ui:More}} 菜单：

| 项目 | 快捷键 | 功能 |
|---|---|---|
| {{ui:Cut}} | {{key:Mod+X}} | 复制所选点并将其删除（一步撤销）。 |
| {{ui:Copy}} | {{key:Mod+C}} | 与{{ui:Copy}}按钮相同。 |
| {{ui:Paste}} | {{key:Mod+V}} | 与{{ui:Paste}}按钮相同。 |
| {{ui:Paste in place}} | {{key:Mod+Shift+V}} | 将点粘贴到其自身坐标处，并使用其他点均未使用的编号。 |
| {{ui:Duplicate}} | {{key:Mod+D}} | 所选点的副本跟随指针移动；单击即可放下。剪贴板内容保持不变。 |
| {{ui:Delete}} | {{key:Delete}} | 删除所选测量点，或所选路线、平台、构筑物（连同其管道）、管道或变坡点。 |
| {{ui:Select all points}} | {{key:Mod+A}} | 选择所有测量点。 |
| {{ui:Select none}} | {{key:Esc}} | 清除选择。 |

当前无法执行的项目呈灰色，其提示会说明原因。详情：[选择、复制和粘贴测量点](topic:copy-paste-points)。

撤销涵盖对设计、曲面设置和测量点的编辑（粘贴、剪切、创建副本、删除）。不包括显示设置；打开或导入任何文件都会清除撤销记录。

## GIS

| 按钮 | 快捷键 | 功能 |
|---|---|---|
| {{ui:Coordinates}} | 无 | 打开**坐标系**对话框：指定项目所用的坐标系，或使用地面坐标或局部坐标。参见[设置项目坐标系](topic:coordinate-systems)和[地面坐标与局部坐标](topic:ground-and-local-coordinates)。 |
| {{ui:Import}} | 无 | 导入 GIS 数据：shapefile、GeoJSON、GeoPackage、高程栅格和 LiDAR。参见[导入 GIS 数据](topic:gis-import)。 |
| {{ui:Export}} | 无 | 为 GIS 部门导出竣工数据。参见[为 GIS 导出竣工数据](topic:gis-export)。 |
| {{ui:Analyze}} | 无 | 打开 GIS 分析面板：缓冲区、叠加、空间连接、按属性选择、测量。参见[分析 GIS 图层](topic:gis-analysis)。 |
| {{ui:Attribute table}} | 无 | 位于曲面 › 更多中。打开 GIS 图层的属性表：排序、筛选、选择、编辑、添加字段、计算，并可保存为 CSV。参见[使用图层属性表](topic:gis-table)。 |
| {{ui:Map}} | 无 | 打开**地图图层**对话框：可添加地理参照图片或地图服务，绘制于平面图下方。参见[在平面图下显示地图图层](topic:map-layers)。 |

GIS 工具会在你首次使用这些按钮、打开 GIS 文件，或打开带有坐标系或 GIS 图层的项目时加载。

## 视图

| 按钮 | 快捷键 | 功能 |
|---|---|---|
| {{ui:Select}} | {{key:V}} 或 {{key:Esc}} | 单击以选择路线、平台、构筑物、管道和点（按住 {{key:Shift}} 并单击或拖动可增加选中的点）；拖动夹点可移动 PI、平台角点和构筑物。 |
| {{ui:Fit}} | {{key:F}} | 缩放平面图以显示曲面、点、路线和平台（在 3D 视图中：显示全部内容）。 |
| {{ui:3D}} | {{key:D}} | 在平面图上方以 3D 显示场地，或返回平面图。3D 视图上方的工具栏用于设置视图、竖向夸大、着色和显示内容，并可导出 GLB 或 OBJ。参见[在 3D 中查看场地](topic:site-3d)。 |

## 面板中的按钮

| 按钮 | 位置 | 功能 |
|---|---|---|
| {{ui:Open the sample site}} | 空白平面图上的方框 | 加载示例测量（需要网络连接，除非已将 CivilCraft 保存为离线使用） |
| {{ui:Remove the boundary}} | 左侧面板，曲面 | 移除外边界 |
| {{ui:Remove drawn breaklines}} | 左侧面板，曲面 | 移除用该工具绘制的所有断裂线（不包括断裂线组） |
| {{ui:Rebuild the surface from the points}} | 左侧面板，曲面（仅限 LandXML 曲面） | 删除 LandXML TIN，并由点重建；无法撤销 |
| {{ui:Start from the ground}} | 右侧面板，路线 | 开始设计纵断面，并在两端的地面上各设置一个变坡点 |
| {{ui:Profile view}} | 右侧面板，路线 | 打开该路线的纵断面视图 |
| {{ui:Add PVIs}} | 纵断面工具栏 | 按下期间，在纵断面中单击即可添加变坡点 |
| {{ui:Set every invert from the rules}} | 右侧面板，管网 | 按规则设置每段管道的管内底标高 |
| {{ui:Set its inverts from the rules}} | 右侧面板，管道 | 按规则设置该管道的管内底标高 |
