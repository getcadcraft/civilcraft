---
title: 功能表、快速鍵與滑鼠
summary: 選擇符合既有工作習慣的功能表樣式，為任何指令指定自己的快速鍵，在功能區索引標籤之間移動指令，並設定滾輪與滑鼠按鍵在平面圖與3D中的作用。
keywords: 功能表樣式, 功能表, 功能區, 土木功能區, 工具列, 指令列, 經典繪圖, 快速鍵, 熱鍵, 按鍵, 自訂, 重新指定, 滑鼠, 滾輪, 反向, 縮放方向, 中間鍵, 右鍵, 平移, 3D環轉, 匯出, 匯入, 切換, 熟悉
from: 07ac73a0
---

CivilCraft的指令不論從哪裡叫用，功能都相同。**功能表樣式**只決定指令在螢幕上的位置、顯示名稱，以及執行它們的按鍵，因此可保留既有的操作習慣。在{{ui:Settings}}（{{key:Mod+,}}）› {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}中選擇；變更會立即生效，且此瀏覽器會記住此設定。

## 三種樣式

| 樣式 | 內容 |
|---|---|
| {{ui:CivilCraft}} | CivilCraft自有的工具列（檔案、匯出、曲面、設計、編輯、GIS、檢視）與單一按鍵：{{key:A}}路線、{{key:G}}平台、{{key:P}}管線、{{key:B}}斷線、{{key:O}}邊界、{{key:L}}特徵線、{{key:R}}縱斷面、{{key:X}}橫斷面、{{key:E}}坡度、{{key:D}}3D、{{key:F}}符合視窗、{{key:V}}選取。這是預設值。 |
| {{ui:Drafting classic}} | 小型功能區（{{ui:Home}}、{{ui:Insert}}、{{ui:Output}}）與指令列，適合習慣輸入指令的使用者：ALIGNMENT、PAD、PIPE、FEATURELINE、BREAKLINE、PROFILE、SECTIONS、U（復原）、ZOOM、3D、PLOT、LANDXML、XATTACH、MAPIMPORT、HELP。在任何位置開始輸入，字母都會進入指令列；按{{key:Enter}}鍵執行，未輸入任何內容時按{{key:Enter}}鍵會重複上一個指令，按{{key:Esc}}鍵清除。中間鍵平移。 |
| {{ui:Civil ribbon}} | 以大型按鈕分頁呈現，依土木設計軟體的方式分組工具：{{ui:Home}}（地面資料、建立設計、縱斷面與橫斷面檢視）、{{ui:Surfaces}}、{{ui:Modify}}、{{ui:Geolocation}}、{{ui:View}}與{{ui:Output}}，並附有{{ui:File}}功能表與右側的快速按鈕。單一按鍵仍然保留。平面圖中以中間鍵平移；3D中以中間鍵平移，{{key:Shift}}加中間鍵環轉。 |

每種樣式都保留{{key:Mod}}系列快速鍵：{{key:Mod+Z}}、{{key:Mod+Y}}、{{key:Mod+S}}、{{key:Mod+O}}、{{key:Mod+P}}、{{key:Mod+C}}、{{key:Mod+X}}、{{key:Mod+V}}、{{key:Mod+D}}、{{key:Mod+A}}。

:::tip
若某樣式把CivilCraft自有配置中的按鍵指定給其他指令，該按鍵就不會執行，狀態列會說明該指令的新位置（例如「在我的快速鍵中，Pad 為 Ctrl+Alt+G」）。{{key:Delete}}、{{key:Esc}}、{{key:Enter}}、{{key:Tab}}、{{key:Space}}與方向鍵一律保留其作用；繪製線條時，其端點仍使用自己的按鍵（{{key:Backspace}}、{{key:Enter}}）。
:::

## 建立自己的設定

1. 選擇最接近需求的樣式，然後點選{{ui:Customize…}}。
2. 在{{ui:Keys and menus}}中找到指令（搜尋方塊可協助尋找）。點選{{ui:Add a key}}後按下按鍵，或依序按下兩個鍵以建立雙字母快速鍵。點選某個按鍵即可將其移除。
3. 使用功能區時，可透過{{ui:Where it sits}}將指令移至其他索引標籤與面板、移到{{ui:File}}功能表，或設為{{ui:Keys only}}。
4. 在{{ui:Mouse}}中，設定滾輪、用於平移平面圖的按鍵，以及各按鍵在3D檢視中的作用。
5. 為設定命名，然後點選{{ui:Save}}。

儲存內建樣式會建立自己的副本（「我的土木功能區」）；內建樣式本身永遠不會變更。同一按鍵指定給兩個指令，或某按鍵會在雙字母快速鍵可輸入之前就執行時，該按鍵會以紅色標示，必須先修正才能儲存。

## 滑鼠

- **滑鼠滾輪**：在平面圖與3D中，可設為{{ui:Scroll up zooms in}}（預設）或{{ui:Scroll up zooms out}}，並可設定縮放速度。觸控板捏合一律依手指移動的方向縮放。
- **平移平面圖的按鍵**：中間鍵、右鍵，或兩者皆可。按住{{key:Space}}並拖曳也能平移。左鍵一律用於選取與繪圖。
- **在3D檢視中拖曳**：{{ui:各檢視自身的設定}}會保留CivilCraft的按鍵配置（左鍵環轉、右鍵平移）。也可將每個按鍵設為環轉、平移、縮放或無作用；按住{{key:Shift}}加上按鍵會互換環轉與平移。不拖曳而只點擊時仍會選取。

## 帶著走

{{ui:Export}}會將目前使用的樣式儲存為小型`.ccinput.json`檔案；{{ui:Import…}}可從其他電腦或同事處加入一個此類檔案。匯入的檔案只能指向CivilCraft自身的指令，其他內容會被省略，並在狀態列中計數。{{ui:Delete this style}}可移除自行建立的樣式。

:::note
這些設定只保留在此瀏覽器中。樣式卡片下方的{{ui:Use this style in every app}}會讓每個應用程式都以對應的樣式開啟（自有工具列、功能區或經典繪圖），並保留各應用程式中所做的變更。CivilCraft沒有功能表列樣式：當其他應用程式的功能表列被設為所有應用程式的樣式時，CivilCraft會保留自己的工具列。
:::

相關：[鍵盤與滑鼠](topic:keyboard) · [CivilCraft設定](topic:settings) · [從其他土木軟體遷移](topic:coming-from)
