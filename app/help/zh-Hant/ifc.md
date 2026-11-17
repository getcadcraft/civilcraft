---
title: IFC 匯出與匯入
summary: 將整個專案儲存為一個 IFC 檔案，格式可為 IFC 4.3、IFC4 或 IFC2x3（路線、道路、土方、曲面、牆、管線），並可開啟 IFC 檔案以取得其路線與曲面。
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, 路線, ifcalignment, 道路, ifcroad, 土方, tin, 交付成果, 採購, 匯出 IFC, 匯入 IFC
from: 6b998bcf
---

IFC 是許多公共業主要求的開放交換格式，作為交付成果。CivilCraft 會將整個專案寫入一個 IFC 檔案，並可從 IFC 檔案讀回路線與曲面。

## 匯出

1. 在**匯出**群組中按一下{{ui:IFC}}（在功能區樣式中為：{{ui:Output}} › {{ui:Export}} › {{ui:IFC}}）。
2. 選擇結構描述。**IFC 4.3 ADD2** 排在最前且為預設：它是包含路線、道路與土方的版本。只有在接收端軟體無法讀取 4.3 時，才選擇 IFC4 或 IFC2x3。
3. 對話方塊會說明檔案將包含的內容，以及所選結構描述會省略的內容。按一下{{ui:Export IFC}}。
   檔案會下載為 "*專案名稱*-ifc4x3.ifc"、"-ifc4.ifc" 或 "-ifc2x3.ifc"。CivilCraft 會記住你上次選擇的結構描述。

## 各結構描述包含的內容

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| 路線 | 具水平（直線、圓弧、緩和曲線）與垂直（坡度、拋物線曲線）配置的 IfcAlignment、其曲線（IfcCompositeCurve、IfcGradientCurve）、起始樁號與超高事件 | 土木元素上的 3D 聚合線 | 代理物件上的 3D 聚合線 |
| 道路模型 | 含道路部件的 IfcRoad；車道、路肩、排水溝與人行道為 IfcPavement，路緣為 IfcKerb，植栽帶；各鋪面層為 IfcCourse，含其厚度、材料與體積；邊坡為 IfcEarthworksCut 與 IfcEarthworksFill，含挖方與填方體積；設計速度與等級 | 依實際性質命名的土木元素，依道路分組 | 代理物件，依道路分組 |
| 曲面 | IfcGeographicElement TERRAIN，含三角不規則網格（TIN） | 三角面集合 | 以面為基礎的曲面模型（檔案較大） |
| 平台與牆 | 平台頂面、其邊坡為土方，擋土牆為 IfcWall RETAININGWALL | 相同，牆為使用者定義的牆類型 | 相同，牆的類型位於 ObjectType |
| 管線網路 | 位於 IfcDistributionSystem 中的 IfcPipeSegment 與 IfcDistributionChamberElement | 相同 | 位於 IfcSystem 中的 IfcFlowSegment 與人孔 |
| 地理參照 | IfcProjectedCRS 與 IfcMapConversion | 相同 | 基地上的 ePSet_ProjectedCRS 與 ePSet_MapConversion |

**鐵路**（開啟鐵路選項的路線）會以 IfcRailway 匯入 IFC 4.3：其過渡段以各自的類型表示（clothoid、cubic parabola、Bloss、Helmert、半波正弦視為餘弦曲線、sine），其超高為 IfcAlignmentCant，其軌道為鋼軌、枕木與道碴層，下方另有底層道碴。IFC4 與 IFC2x3 會以土木元素或代理物件取得相同部件。開啟 IFC 4.3 鐵路時，會一併取回其過渡段與超高。

每個檔案也包含地籍（基地輪廓）、景觀工作區的植栽與硬景觀，以及建築量體（各為一個 IfcBuilding 並含其樓層），全部位於同一基地中。屬性集會記錄你的設計內容：樁號、橫斷面組合、挖填方邊坡、車道寬度與數量、管底高程、井蓋高程、牆高；數量（長度、面積、體積）為 IfcElementQuantity 集。

## 單位與座標

檔案使用專案的長度單位（公尺，或美國測量英尺）；面積與體積以平方公尺與立方公尺表示。若設定座標系統（GIS › 座標），檔案會置於地圖上：其原點的東距與北距，以及地方（本地）系統的旋轉與比例，會記錄於地圖轉換中。若未設定，檔案會在屬性集中記錄其本地原點，且不會置於地圖上。

## 匯入

以{{ui:Open}}開啟 .ifc 檔案，或將其拖曳至平面圖上。匯入對話方塊會說明檔案所含內容：

- 來自 IFC 4.3（水平與垂直配置）及 IFC 4x1 路線曲線的**路線**，會成為 CivilCraft 路線，含其 PI、半徑、緩和曲線長度與 PVI。CivilCraft 的 PI 模型無法容納的路線（複合曲線、兩曲線間的緩和曲線、起點或終點位於曲線上的路線）不會匯入，對話方塊會說明原因。
- **曲面**：選擇要成為原地面的曲面，或保留專案的曲面。
- **其他所有內容**（及其他曲面）可在 3D 檢視中以參考方式顯示。參考元素在專案開啟期間保留；不會儲存於專案檔案中。

由 CivilCraft 以 IFC4 或 IFC2x3 寫入的檔案，會依其屬性集完整取回路線。

## 尚未實作

- 道路的超高會以超高事件及道路曲面的形式寫入（cant 用於鐵路）。
- 將參考元素儲存於專案檔案中，以及從 IFC 匯入可編輯物件的管線網路或平台。
