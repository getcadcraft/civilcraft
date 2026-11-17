---
title: LandXML：讀取與寫入的內容
summary: CivilCraft 讀取與寫入的 LandXML 1.2 元素與屬性（逐一列出），以及所有略過的內容。
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, feature line, schema, 結構描述, 特徵線
from: ca3cf359
---

CivilCraft 會以官方命名空間與結構描述位置寫入 LandXML 1.2。它會讀取根元素為 `LandXML` 的任何檔案，並依名稱取用下列元素（忽略命名空間前綴；不檢查版本）。其 XML 讀取器只接受五個標準實體與數字字元參照；從不載入 DTD 或外部檔案。步驟請見[交換 LandXML](topic:landxml)。

LandXML 寫入座標時先寫北座標：點的格式為「N E」或「N E Z」。

## 寫入的內容

| 元素 | CivilCraft 寫入的內容 |
|---|---|
| `Units` | `Imperial`（linearUnit USSurveyFoot，面積以平方英尺、體積以立方碼、直徑以英吋）或 `Metric`（meter、square meter、cubic meter、millimeter） |
| `Project` | `name` = 專案名稱 |
| `Application` | 名稱為 CivilCraft，製造商為 CadCraft |
| `CgPoints` / `CgPoint` | `name` = 點號，`desc` = 描述，`code` = 群組；文字為「N E Z」（無高程時為「N E」） |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw or ccw, `radius`, `length`, `staStart`, `chord`, `delta`（度）, `tangent`, `external`, `midOrd`；`Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | 沿路線的現有地面，以樁號與高程配對表示（`PntList2D`），在離開曲面處切分 |
| `Profile` / `ProfAlign` | 設計縱斷面（名稱為 "<alignment> design"）：端點與轉折點使用 `PVI`，豎曲線使用含 `length` 的 `ParaCurve` |
| `Surfaces` / `Surface` | `name` 與 `desc`；先寫現有地面，若平台或道路走廊進行整地，再寫入 "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D`（僅限現有地面） |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D`（僅限現有地面，若有的話） |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`；`Pnts` / `P` 含 `id`；`Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm or sanitary |
| `Struct` | `name`, `elevRim`（所用的井蓋高程，設定值或取自曲面）, `elevSump`；`Center`；`CircStruct` 含 `diameter`；`Invert` 含 `elev`、`flowDir`（in 或 out，即流入或流出）、`refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`；`CircPipe` 含 `diameter` |
| `PlanFeatures` / `PlanFeature` | 每條特徵線一個：`name`；`CoordGeom` 含 `Line`（`length`, `Start`, `End`）與 `Curve`（`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`；`Start` 與 `End` 為「N E Z」，`Center` 為「N E」）；`Feature` `code="CivilCraft"`，含 `Property` 用途與封閉狀態 |

不寫入的內容：作為物件的平台與道路走廊（其結果為 "Proposed" 曲面）、有錯誤的路線、缺少兩端管底的管線、網路規則。

## 讀取的內容

| 元素 | CivilCraft 取用的內容 |
|---|---|
| `Units` | `Imperial` 或 `Metric` 及其 `linearUnit` 決定以英尺或公尺計。無法辨識的單位會加以註記。 |
| `Project` | `name` 會成為專案名稱。 |
| `CgPoints` / `CgPoint`（也包含巢狀元素） | 名稱（或 `oID`）、「N E」或「N E Z」，以 `desc`（或 `code`）作為描述 |
| `Surface` 含 `Definition surfType="TIN"` | 以 `Pnts` 與 `Faces` 作為現有地面（僅第一個曲面）；不可見的面（`i="1"`）會略過 |
| `SourceData` / `Breaklines` | 3D 斷線，與曲面一併保留 |
| `SourceData` / `Boundaries` | 外側邊界 |
| `Alignment` / `CoordGeom` | `Line` 與 `Curve` 元素；PI 依各曲線的 `PI` 重建，或依其 `Center` 與切線重建；`staStart` |
| `Profile` / `ProfAlign` | `PVI` 與 `ParaCurve`（含 `length`）；第一個至少含兩個 PVI 的設計縱斷面 |
| `PlanFeatures` / `PlanFeature` | 每一個都作為特徵線：`Line`、`Curve`（其 `Start`、`Center`、`End` 與 `rot`）與 `IrregularLine`（`PntList3D` 或 `PntList2D`）首尾相接（缺口以直線段連接並加以註記）；若終點與起點相同則封閉；用途與封閉狀態取自 CivilCraft 自有的 `Feature`，否則為**僅繪製**。沒有高程的點會設為 0（並加以註記）。 |
| `Spiral` | 位於 `Curve` 旁的緩和曲線（clothoid）（進入與離開；讀取為含半徑與緩和段長度的 PI，並以 `theta`、`totalX`、`totalY`、`tanLong`、`tanShort`、`constant` 寫回） |
| `PipeNetwork` | 第一個含管線的網路：`Struct`（`Center`、`elevRim`、`elevSump`、`CircStruct` 的 `diameter`、每條管線的 `Invert`）與 `Pipe`（`refStart`、`refEnd`、`CircPipe` 的 `diameter`） |

## 略過的內容（並於註記中列出）

- 第一個之後的曲面、格網曲面與其他非 TIN 曲面
- 含 `IrregularLine` 或 `Chain` 元素的路線、非 clothoid 的緩和曲線、位於兩條曲線之間的緩和曲線，或沒有幾何的路線
- 第一個之後的設計縱斷面；`CircCurve` 與 `UnsymParaCurve` 豎曲線（其 PVI 會保留，但不含曲線）
- 只參照其他點的點（`pntRef`），以及無法讀取座標的點
- 重複的點名（保留第一個）
- 隱藏、顯示與資料裁切邊界；沒有 3D 點的斷線
- 第一個之後的管線網路；雨水與污水以外的網路類型（會以 storm 讀取）
- 矩形、進水口與出水口構造（以圓形讀取）；卵形、橢圓形與箱形管線及渠道（以無尺寸的圓管讀取）
- 特徵線中的 `Spiral` 元素
- `Parcels`、`Roadways`、`GradeModel` 與 `Survey`

檔案中的地面縱斷面（`ProfSurf`）不會使用：CivilCraft 會直接從曲面取樣地面。

## 無法開啟檔案時的訊息

| 訊息 | 意義 |
|---|---|
| 「This is XML but not LandXML (its root element is <…>).」 | 此檔案為其他類型的 XML。 |
| 「… has no points, TIN surfaces or alignments CivilCraft can read.」 | 檔案中的所有內容都在略過清單中。其後的註記會說明其中有哪些內容。 |
| 「Mismatched end tag …」、「Unclosed tag …」、「The file ends inside …」 | 檔案已損毀或被截斷。 |
