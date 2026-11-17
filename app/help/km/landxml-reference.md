---
title: LandXML៖ អ្វីដែលត្រូវបានអាន និងសរសេរ
summary: ធាតុ និងគុណលក្ខណៈ LandXML 1.2 ដែល CivilCraft អាន និងសរសេរ ម្ដងមួយធាតុ និងអ្វីៗទាំងអស់ដែលវារំលង។
keywords: landxml, xml, cgpoints, ផ្ទៃ, tin, បន្ទាត់បំបែក, ព្រំដែន, ខ្សែផ្លូវ, coordgeom, ប្រូហ្វាយ, profalign, pvi, paracurve, បណ្ដាញបំពង់, struct, បំពង់, planfeatures, planfeature, បន្ទាត់លក្ខណៈពិសេស, ស្គីម៉ា
from: ca3cf359
---

CivilCraft សរសេរ LandXML 1.2 ជាមួយ namespace និងទីតាំងស្គីម៉ាផ្លូវការ។ វាអានឯកសារណាមួយដែលធាតុឫសជា `LandXML` ហើយយកធាតុខាងក្រោមតាមឈ្មោះ (បុព្វបទ namespace ត្រូវបានរំលង; កំណែមិនត្រូវបានត្រួតពិនិត្យ)។ កម្មវិធីអាន XML របស់វាទទួលយកតែ entity ស្តង់ដារទាំងប្រាំ និងការយោងតួអក្សរជាលេខ ហើយមិនដែលផ្ទុក DTD ឬឯកសារខាងក្រៅឡើយ។ សម្រាប់ជំហាន សូមមើល [ការផ្លាស់ប្ដូរ LandXML](topic:landxml)។

LandXML សរសេរកូអរដោនេ ទិសខាងជើង (northing) មុនគេ៖ ចំណុចគឺ "N E" ឬ "N E Z"។

## ដែលបានសរសេរ

| ធាតុ | អ្វីដែល CivilCraft សរសេរ |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, ផ្ទៃជាហ្វីតការ៉េ, បរិមាណជាយ៉ាតគូប, អង្កត់ផ្ចិតជាអ៊ីញ) ឬ `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = ឈ្មោះគម្រោង |
| `Application` | ឈ្មោះ CivilCraft, ក្រុមហ៊ុនផលិត CadCraft |
| `CgPoints` / `CgPoint` | `name` = លេខចំណុច, `desc` = ការពិពណ៌នា, `code` = ក្រុម; អត្ថបទ "N E Z" (ឬ "N E" ដោយគ្មានកម្ពស់) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ឬ ccw, `radius`, `length`, `staStart`, `chord`, `delta` (ដឺក្រេ), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | ដីដើមតាមខ្សែផ្លូវ ជាគូស្ថានី និងកម្ពស់ (`PntList2D`) បំបែកនៅកន្លែងដែលវាចេញពីផ្ទៃ |
| `Profile` / `ProfAlign` | ប្រូហ្វាយការរចនា (ឈ្មោះ "<alignment> design"): `PVI` សម្រាប់ចុង និងចំណុចមុំ, `ParaCurve` ជាមួយ `length` សម្រាប់ខ្សែកោងបញ្ឈរ |
| `Surfaces` / `Surface` | `name` និង `desc`; ដីដើមជាមុនគេ បន្ទាប់មក "Proposed" នៅពេលផ្ទាំង ឬច្រករបៀងត្រូវបានរៀបកម្រិត |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (ដីដើមតែប៉ុណ្ណោះ) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (ដីដើមតែប៉ុណ្ណោះ នៅពេលមានមួយ) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` ជាមួយ `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ឬ sanitary |
| `Struct` | `name`, `elevRim` (គែមដែលបានប្រើ កំណត់ ឬពីផ្ទៃ), `elevSump`; `Center`; `CircStruct` ជាមួយ `diameter`; `Invert` ជាមួយ `elev`, `flowDir` in ឬ out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` ជាមួយ `diameter` |
| `PlanFeatures` / `PlanFeature` | មួយសម្រាប់បន្ទាត់លក្ខណៈពិសេសនីមួយៗ៖ `name`; `CoordGeom` ជាមួយ `Line` (`length`, `Start`, `End`) និង `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` និង `End` ជា "N E Z", `Center` ជា "N E"); `Feature` `code="CivilCraft"` ជាមួយ `Property` use និង closed |

មិនបានសរសេរ៖ ផ្ទាំង និងច្រករបៀងជាវត្ថុ (លទ្ធផលរបស់វាគឺផ្ទៃ "Proposed"), ខ្សែផ្លូវដែលមានកំហុស, បំពង់ដែលគ្មានអ៊ីនវឺតទាំងពីរ, ច្បាប់បណ្ដាញ។

## ដែលបានអាន

| ធាតុ | អ្វីដែល CivilCraft យក |
|---|---|
| `Units` | `Imperial` ឬ `Metric` និង `linearUnit` របស់វាកំណត់ថាជាហ្វីត ឬម៉ែត្រ។ ឯកតាដែលមិនស្គាល់ត្រូវបានកត់ត្រា។ |
| `Project` | `name` ក្លាយជាឈ្មោះគម្រោង។ |
| `CgPoints` / `CgPoint` (ផ្ទុកក្នុងផងដែរ) | ឈ្មោះ (ឬ `oID`), "N E" ឬ "N E Z", `desc` (ឬ `code`) ជាការពិពណ៌នា |
| `Surface` ជាមួយ `Definition surfType="TIN"` | `Pnts` និង `Faces` ជាដីដើម (ផ្ទៃទីមួយតែប៉ុណ្ណោះ); ផ្ទៃមើលមិនឃើញ (`i="1"`) ត្រូវបានលុបចេញ |
| `SourceData` / `Breaklines` | បន្ទាត់បំបែក 3D ដែលរក្សាជាមួយផ្ទៃ |
| `SourceData` / `Boundaries` | ព្រំដែនខាងក្រៅ |
| `Alignment` / `CoordGeom` | ធាតុ `Line` និង `Curve`; PI ត្រូវបានសាងសង់ឡើងវិញពី `PI` របស់ខ្សែកោងនីមួយៗ ឬពី `Center` និងតង់សង់របស់វា; `staStart` |
| `Profile` / `ProfAlign` | `PVI` និង `ParaCurve` (ជាមួយ `length`); ប្រូហ្វាយការរចនាទីមួយដែលមាន PVI យ៉ាងតិចពីរ |
| `PlanFeatures` / `PlanFeature` | នីមួយៗជាបន្ទាត់លក្ខណៈពិសេស៖ `Line`, `Curve` (`Start`, `Center`, `End` និង `rot` របស់វា) និង `IrregularLine` (`PntList3D` ឬ `PntList2D`) ភ្ជាប់ចុងដល់ចុង (ចន្លោះត្រូវបានភ្ជាប់ដោយផ្នែកត្រង់ ហើយត្រូវបានកត់ត្រា); បិទនៅពេលវាបញ្ចប់ត្រង់កន្លែងដែលវាបានចាប់ផ្ដើម; use និង closed ពី `Feature` របស់ CivilCraft ផ្ទាល់ បើមិនដូច្នេះទេ **គូសតែប៉ុណ្ណោះ**។ ចំណុចដែលគ្មានកម្ពស់ទទួលបាន 0 (បានកត់ត្រា)។ |
| `Spiral` | ខ្សែវង់ clothoid នៅក្បែរ `Curve` (ចូល និងចេញ; អានជា PI ជាមួយកាំ និងប្រវែងខ្សែវង់ សរសេរត្រឡប់ជាមួយ `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | បណ្ដាញទីមួយដែលមានបំពង់៖ `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` សម្រាប់បំពង់នីមួយៗ) និង `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## ដែលរំលង និងដាក់ឈ្មោះក្នុងកំណត់ចំណាំ

- ផ្ទៃបន្ទាប់ពីទីមួយ ផ្ទៃក្រឡាចត្រង្គ និងផ្ទៃមិនមែន TIN ផ្សេងទៀត
- ខ្សែផ្លូវដែលមានធាតុ `IrregularLine` ឬ `Chain`, ខ្សែវង់ផ្សេងក្រៅពី clothoid, ខ្សែវង់មួយរវាងខ្សែកោងពីរ ឬដែលគ្មានធរណីមាត្រ
- ប្រូហ្វាយការរចនាបន្ទាប់ពីទីមួយ; ខ្សែកោងបញ្ឈរ `CircCurve` និង `UnsymParaCurve` (PVI របស់វាត្រូវបានរក្សាដោយគ្មានខ្សែកោង)
- ចំណុចដែលគ្រាន់តែយោងទៅចំណុចផ្សេង (`pntRef`) និងចំណុចដែលគ្មានកូអរដោនេអាចអានបាន
- ឈ្មោះចំណុចដដែលៗ (ទីមួយត្រូវបានរក្សា)
- ព្រំដែនលាក់ បង្ហាញ និងកាត់ទិន្នន័យ; បន្ទាត់បំបែកដែលគ្មានចំណុច 3D
- បណ្ដាញបំពង់បន្ទាប់ពីទីមួយ; ប្រភេទបណ្ដាញក្រៅពី storm និង sanitary (អានជា storm)
- រចនាសម្ព័ន្ធចតុកោណ ចូល និងចេញ (អានជារង្វង់); បំពង់ និងប្រឡាយរាងពង ពងក្រពើ និងប្រអប់ (អានជាបំពង់រង្វង់គ្មានទំហំ)
- ធាតុ `Spiral` ក្នុងលក្ខណៈពិសេសប្លង់
- `Parcels`, `Roadways`, `GradeModel` និង `Survey`

ប្រូហ្វាយដី (`ProfSurf`) ក្នុងឯកសារមិនត្រូវបានប្រើទេ៖ CivilCraft យកគំរូដីពីផ្ទៃខ្លួនវាផ្ទាល់។

## សារនៅពេលឯកសារមិនបើក

| សារ | មានន័យថា |
|---|---|
| "នេះជា XML ប៉ុន្តែមិនមែន LandXML (ធាតុឫសរបស់វាគឺ <…>)។" | ឯកសារជាប្រភេទ XML ផ្សេង។ |
| "… មិនមានចំណុច ផ្ទៃ TIN ឬខ្សែផ្លូវដែល CivilCraft អាចអានបានទេ។" | អ្វីៗទាំងអស់ក្នុងឯកសារស្ថិតនៅក្នុងបញ្ជីដែលរំលង។ កំណត់ចំណាំខាងក្រោមប្រាប់ថាមានអ្វីខ្លះ។ |
| "ស្លាកបិទមិនត្រូវគ្នា …", "ស្លាកមិនបានបិទ …", "ឯកសារបញ្ចប់នៅខាងក្នុង …" | ឯកសារខូច ឬកាត់ខ្លី។ |
