---
title: LandXML: 읽고 쓰는 내용
summary: CivilCraft가 읽고 쓰는 LandXML 1.2 요소와 속성을 요소별로 나열하고, 건너뛰는 모든 것을 설명합니다.
keywords: landxml, xml, cgpoints, 지표면, tin, 단절선, 경계, 선형, coordgeom, 종단면도, profalign, pvi, paracurve, pipenetworks, struct, 관, planfeatures, planfeature, 피처 선, 스키마
from: ca3cf359
---

CivilCraft는 공식 네임스페이스와 스키마 위치를 사용해 LandXML 1.2를 씁니다. 루트 요소가 `LandXML`인 모든 파일을 읽으며, 아래 요소를 이름으로 가져옵니다(네임스페이스 접두사는 무시하며, 버전은 확인하지 않습니다). XML 읽기 도구는 표준 엔터티 다섯 개와 숫자 문자 참조만 받아들이며, DTD나 외부 파일을 결코 불러오지 않습니다. 단계는 [LandXML 교환](topic:landxml)을 참고하십시오.

LandXML은 좌표를 Northing 값부터 씁니다: 점은 "N E" 또는 "N E Z"입니다.

## 쓰는 내용

| 요소 | CivilCraft가 쓰는 내용 |
|---|---|
| `Units` | `Imperial`(linearUnit USSurveyFoot, 면적은 제곱피트, 부피는 입방야드, 지름은 인치) 또는 `Metric`(meter, 제곱미터, 세제곱미터, 밀리미터) |
| `Project` | `name` = 프로젝트 이름 |
| `Application` | 이름 CivilCraft, 제조사 CadCraft |
| `CgPoints` / `CgPoint` | `name` = 점 번호, `desc` = 설명, `code` = 그룹; 텍스트 "N E Z"(높이가 없으면 "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw 또는 ccw, `radius`, `length`, `staStart`, `chord`, `delta`(도), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | 선형을 따른 기존 지반을 측점과 높이 쌍(`PntList2D`)으로 쓰며, 지표면을 벗어나는 곳에서 나눕니다 |
| `Profile` / `ProfAlign` | 설계 종단면도(이름: "<선형> design"): 끝점과 꺾임점에는 `PVI`, 수직 곡선에는 `length`가 있는 `ParaCurve` |
| `Surfaces` / `Surface` | `name` 및 `desc`; 먼저 기존 지반, 패드나 도로 구간을 정지할 때는 그다음 "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D`(기존 지반에만) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D`(있을 때만, 기존 지반에만) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id`를 가진 `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm(우수) 또는 sanitary(오수) |
| `Struct` | `name`, `elevRim`(사용한 림, 설정값 또는 지표면에서), `elevSump`; `Center`; `CircStruct`(`diameter` 포함); `Invert`(`elev`, `flowDir` in 또는 out, `refPipe`) |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe`(`diameter` 포함) |
| `PlanFeatures` / `PlanFeature` | 피처 선마다 하나: `name`; `CoordGeom`: `Line`(`length`, `Start`, `End`) 및 `Curve`(`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` 및 `End`는 "N E Z", `Center`는 "N E"); `Feature` `code="CivilCraft"`: `Property` 용도와 닫힘 여부 |

쓰지 않는 것: 객체로서의 패드와 도로 구간(결과는 "Proposed" 지표면), 오류가 있는 선형, 양쪽 인버트가 없는 관, 네트워크 규칙.

## 읽는 내용

| 요소 | CivilCraft가 가져가는 내용 |
|---|---|
| `Units` | 단위 요소(`Imperial` 또는 `Metric`)와 그 `linearUnit` 속성이 피트 또는 미터를 정합니다. 알 수 없는 단위는 메모에 기록됩니다. |
| `Project` | `name`은 프로젝트 이름이 됩니다. |
| `CgPoints` / `CgPoint`(중첩도 포함) | 이름(또는 `oID`), "N E" 또는 "N E Z", 설명으로 쓰는 `desc`(또는 `code`) |
| `Surface`(`Definition surfType="TIN"` 포함) | `Pnts` 및 `Faces`를 기존 지반으로 가져옵니다(첫 번째 지표면만). 보이지 않는 면(`i="1"`)은 제외합니다. |
| `SourceData` / `Breaklines` | 3D 단절선, 지표면과 함께 유지 |
| `SourceData` / `Boundaries` | 외곽 경계 |
| `Alignment` / `CoordGeom` | `Line` 및 `Curve` 요소. PI는 각 곡선의 `PI`에서, 또는 `Center` 및 접선에서 다시 만듭니다. `staStart`. |
| `Profile` / `ProfAlign` | `PVI` 및 `ParaCurve`(`length` 포함). PVI가 두 개 이상인 첫 번째 설계 종단면도. |
| `PlanFeatures` / `PlanFeature` | 각각 피처 선으로: `Line`, `Curve`(`Start`, `Center`, `End`, `rot`) 및 `IrregularLine`(`PntList3D` 또는 `PntList2D`)을 끝과 끝으로 이어 붙입니다(간격은 직선 구간으로 잇고 메모에 기록). 시작점으로 돌아오면 닫힙니다. 용도와 닫힘 여부는 CivilCraft 자체 `Feature`에서 가져오며, 없으면 **그리기만**. 높이가 없는 점은 0이 됩니다(메모에 기록). |
| `Spiral` | `Curve` 옆의 클로소이드 나선(들어가고 나오는 것). 반지름과 나선 길이가 있는 PI로 읽으며, `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`로 다시 씁니다. |
| `PipeNetwork` | 관이 있는 첫 네트워크: `Struct`(`Center`, `elevRim`, `elevSump`, `CircStruct` 지름, 관마다 `Invert`) 및 `Pipe`(`refStart`, `refEnd`, `CircPipe` 지름) |

## 건너뛰며, 메모에 이름이 나오는 것

- 첫 번째 이후의 지표면, 격자 지표면 및 그 밖의 비 TIN 지표면
- `IrregularLine` 또는 `Chain` 요소가 있는 선형, 클로소이드가 아닌 나선, 두 곡선 사이의 나선, 또는 기하 형상이 없는 선형
- 첫 번째 이후의 설계 종단면도, `CircCurve` 및 `UnsymParaCurve` 수직 곡선(해당 PVI는 곡선 없이 유지)
- 다른 점만 참조하는 점(`pntRef`) 및 읽을 수 있는 좌표가 없는 점
- 중복된 점 이름(첫 번째가 유지됨)
- 숨기기, 표시 및 데이터 클립 경계; 3D 점이 없는 단절선
- 첫 번째 이후의 관 네트워크; storm과 sanitary 이외의 네트워크 유형(storm으로 읽음)
- 사각, 유입구 및 유출구 구조물(원형으로 읽음); 계란형, 타원형, 상자형 관과 수로(크기가 없는 원형 관으로 읽음)
- 피처 선의 `Spiral` 요소
- `Parcels`, `Roadways`, `GradeModel` 및 `Survey`

파일의 지반 종단면도(`ProfSurf`)는 사용하지 않습니다. CivilCraft는 지반을 지표면 자체에서 샘플링합니다.

## 파일을 열 수 없을 때의 메시지

| 메시지 | 뜻 |
|---|---|
| "이것은 XML이지만 LandXML이 아닙니다(루트 요소는 <…>)." | 파일은 다른 종류의 XML입니다. |
| "…에는 CivilCraft가 읽을 수 있는 점, TIN 지표면 또는 선형이 없습니다." | 파일의 모든 내용이 건너뛰기 목록에 있습니다. 그 뒤의 메모가 무엇이 있었는지 알려 줍니다. |
| "일치하지 않는 끝 태그 …", "닫히지 않은 태그 …", "파일이 … 중간에서 끝납니다" | 파일이 손상되었거나 중간에 잘렸습니다. |
