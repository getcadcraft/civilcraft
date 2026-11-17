---
title: LandXML: 読み書きする内容
summary: CivilCraft が読み書きする LandXML 1.2 の要素と属性を要素ごとに示し、読み飛ばすものもすべて示します。
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, フィーチャーライン, スキーマ
from: ca3cf359
---

CivilCraft は、公式の名前空間とスキーマの場所を付けて LandXML 1.2 を書き出します。ルート要素が `LandXML` であるファイルは、どれでも読み込めます。下記の要素を名前で読み取ります（名前空間の接頭辞は無視され、バージョンは確認されません）。XML リーダーは、5つの標準エンティティと数値文字参照のみを受け付け、DTD や外部ファイルは決して読み込みません。手順は [LandXML のやり取り](topic:landxml) を参照してください。

LandXML では、座標は北距を先頭にして書かれます。点は "N E" または "N E Z" です。

## 書き出し

| 要素 | CivilCraft が書き出す内容 |
|---|---|
| `Units` | `Imperial`（linearUnit USSurveyFoot、面積は平方フィート、体積は立方ヤード、直径はインチ）または `Metric`（meter、square meter、cubic meter、millimeter） |
| `Project` | `name` = プロジェクト名 |
| `Application` | 名前 CivilCraft、製造元 CadCraft |
| `CgPoints` / `CgPoint` | `name` = 点番号、`desc` = 説明、`code` = グループ。テキストは "N E Z"（標高がない場合は "N E"） |
| `Alignments` / `Alignment` | `name`、`length`、`staStart` |
| `CoordGeom` / `Line` | `staStart`、`length`、`Start`、`End` |
| `CoordGeom` / `Curve` | `crvType` arc、`rot` cw または ccw、`radius`、`length`、`staStart`、`chord`、`delta`（度）、`tangent`、`external`、`midOrd`。`Start`、`Center`、`End`、`PI` |
| `Profile` / `ProfSurf` | 線形に沿った現況地盤を、測点と標高の組（`PntList2D`）として。地表面から外れる箇所で分割 |
| `Profile` / `ProfAlign` | 計画縦断（名前は "<線形> design"）。端部と角の点は `PVI`、縦曲線は `length` 付きの `ParaCurve` |
| `Surfaces` / `Surface` | `name` と `desc`。最初に現況地盤、造成面やコリドーが造成されている場合は "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard、`name`、`PntList3D`（現況地盤のみ） |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer、`edgeTrim` true、`PntList2D`（現況地盤のみ、ある場合） |
| `Definition` | `surfType` TIN、`area2DSurf`、`area3DSurf`、`elevMax`、`elevMin`。`id` 付きの `Pnts` / `P`、`Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`、`pipeNetType` storm または sanitary |
| `Struct` | `name`、`elevRim`（使った天端。設定値または地表面から）、`elevSump`。`Center`。`diameter` 付きの `CircStruct`。`elev`、`flowDir`（in または out）、`refPipe` 付きの `Invert` |
| `Pipe` | `name`、`refStart`、`refEnd`、`length`、`slope`。`diameter` 付きの `CircPipe` |
| `PlanFeatures` / `PlanFeature` | 特徴線ごとに1つ: `name`。`Line`（`length`、`Start`、`End`）と `Curve`（`rot`、`crvType` arc、`radius`、`length`、`chord`、`delta`。`Start` と `End` は "N E Z"、`Center` は "N E"）を持つ `CoordGeom`。`Property` の用途と closed を持つ `Feature code="CivilCraft"` |

書き出されないもの: 造成面やコリドーのオブジェクト（その結果は "Proposed" 地表面）、エラーのある線形、両方の管底高がない管、ネットワークのルール。

## 読み込み

| 要素 | CivilCraft が読み取る内容 |
|---|---|
| `Units` | `Imperial` または `Metric`、およびその `linearUnit` で、フィートかメートルかを決めます。未知の単位は注記されます。 |
| `Project` | `name` がプロジェクト名になります。 |
| `CgPoints` / `CgPoint`（入れ子も可） | 名前（または `oID`）、"N E" または "N E Z"、説明として `desc`（または `code`） |
| `Surface` と `Definition surfType="TIN"` | `Pnts` と `Faces` を現況地盤として（最初の地表面のみ）。不可視の面（`i="1"`）は除外されます |
| `SourceData` / `Breaklines` | 3Dの地性線。地表面とともに保持されます |
| `SourceData` / `Boundaries` | 外周の境界 |
| `Alignment` / `CoordGeom` | `Line` と `Curve` の要素。PI は各曲線の `PI` から、または `Center` と接線から再構築されます。`staStart` |
| `Profile` / `ProfAlign` | `PVI` と `ParaCurve`（`length` 付き）。PVI が2つ以上ある最初の計画縦断 |
| `PlanFeatures` / `PlanFeature` | それぞれを特徴線として: `Line`、`Curve`（`Start`、`Center`、`End`、`rot`）、`IrregularLine`（`PntList3D` または `PntList2D`）。端から端までつなぎ、隙間は直線で結んで注記します。始点に戻る場合は閉じます。CivilCraft 自身の `Feature` から用途と閉合を読み取り、それ以外は **描画のみ** です。標高のない点は 0 になり、注記されます。 |
| `Spiral` | `Curve` の横にあるクロソイド緩和曲線（入りと出）。半径と緩和曲線長を持つ PI として読み取り、`theta`、`totalX`、`totalY`、`tanLong`、`tanShort`、`constant` で書き戻します |
| `PipeNetwork` | 管を持つ最初のネットワーク: `Struct`（`Center`、`elevRim`、`elevSump`、`CircStruct` の直径、管ごとの `Invert`）と `Pipe`（`refStart`、`refEnd`、`CircPipe` の直径） |

## 読み飛ばして注記するもの

- 2番目以降の地表面、グリッド地表面、TIN 以外の地表面
- `IrregularLine` や `Chain` の要素を含む線形、クロソイド以外の緩和曲線、2つの曲線の間の緩和曲線、または形状のない線形
- 2番目以降の計画縦断、`CircCurve` と `UnsymParaCurve` の縦曲線（PVI は曲線なしで残します）
- 他の点のみを参照する点（`pntRef`）、読み取れる座標のない点
- 重複する点名（最初のものを保持）
- 非表示、表示、データクリップの境界。3D点のない地性線
- 2番目以降の管ネットワーク、storm と sanitary 以外のネットワーク種別（storm として読み取り）
- 矩形、インレット、アウトレットの構造物（円形として読み取り）。たまご形、楕円、箱形の管と水路（サイズのない円形管として読み取り）
- 特徴線内の `Spiral` 要素
- `Parcels`、`Roadways`、`GradeModel`、`Survey`

ファイル内の地盤縦断（`ProfSurf`）は使用しません。CivilCraft は地表面そのものから地盤をサンプリングします。

## ファイルを開けないときのメッセージ

| メッセージ | 意味 |
|---|---|
| 「これは XML ですが LandXML ではありません（ルート要素は <…>）。」 | 別種類の XML ファイルです。 |
| 「…には、CivilCraft が読み取れる点、TIN 地表面、線形がありません。」 | ファイル内のすべてが読み飛ばし一覧にあります。その後の注記に内容が示されます。 |
| 「終了タグが一致しません …」、「閉じられていないタグ …」、「ファイルが … の途中で終わっています」 | ファイルが破損しているか、途中で切れています。 |
