---
title: LandXML: ކިޔާއި ލިޔެވޭ އެއްޗެހި
summary: CivilCraft ކިޔާ އަދި ލިޔާ LandXML 1.2 އެލިމަންޓް އަދި އެޓްރިބިއުޓު، އެލިމަންޓް އިން އެލިމަންޓަށް، އަދި އެ ނުކިޔާ ހުރިހާ އެއްޗެއް.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, feature line, schema
from: ca3cf359
---

CivilCraft ލިޔެވޭ LandXML 1.2 އެ ނަމް ސްޕޭސް އަދި ސްކީމާ ލޮކޭޝަނާއެކު. ރޫޓް އެލިމަންޓް `LandXML` ވާ ކޮންމެ ފައިލެއް ކިޔަވައެވެ، އަދި ތިރީގައިވާ އެލިމަންޓްތައް ނަމުން ނަގައެވެ (ނަމް ސްޕޭސް ޕްރެފިކްސް ނޭނގޭ؛ ވާރޝަން ބަލާ ނުލާ). އޭގެ XML ރީޑަރ ހަމައެކަނި ހަތަރު ސްޓޭންޑަރޑް އެންޓިޓީ އަދި އަދަދު ކެރެކްޓަރ ރެފަރެންސް ޤަބޫލް ކުރާ؛ އެ DTD ނުވަތަ ބޭރު ފައިލް ލޯޑް ނުކުރޭ. ކަންތައްތައް ފެންނާ ގޮތަށް [LandXML އެކްސްޗޭންޖް](topic:landxml) ބަލާ.

LandXML ކޯޑިނޭޓް އުތުރު ފަރާތުން ފުރަތަމަ ލިޔެވެއެވެ: ނުކުތާ "N E" ނުވަތަ "N E Z".

## ލިޔެވިފައި

| އެލިމަންޓް | CivilCraft ލިޔާ އެއްޗެހި |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot، ސްކެވެއާ ފީޓުން ޑުނާ، ވޮލިއުމްސް cubic yards، diameters inches) ނުވަތަ `Metric` (meter، square meter، cubic meter، millimeter) |
| `Project` | `name` = ޕްރޮޖެކްޓްގެ ނަން |
| `Application` | ނަން CivilCraft، މެނިފެކްޗަރ CadCraft |
| `CgPoints` / `CgPoint` | `name` = ނުކުތާ ނަންބަރު، `desc` = ޚާއްސަ ކަން، `code` = ގްރޫޕް؛ ޓެކްސްޓް "N E Z" (ނުވަތަ އުސްމިން ނެތްކަމުން "N E") |
| `Alignments` / `Alignment` | `name`، `length`، `staStart` |
| `CoordGeom` / `Line` | `staStart`، `length`، `Start`، `End` |
| `CoordGeom` / `Curve` | `crvType` arc، `rot` cw ނުވަތަ ccw، `radius`، `length`، `staStart`، `chord`، `delta` (ޑިގްރީ)، `tangent`، `external`، `midOrd`؛ `Start`، `Center`، `End`، `PI` |
| `Profile` / `ProfSurf` | އެލައިންމަންޓާ ހަމައަށް ހުރި ބިން، ސްޓޭޝަން އަދި އުސް ޕެއާ (`PntList2D`)، ސަފޯސް ނުކުތާއިން ދުރުވާ ތަނުގައި ބައިވެ |
| `Profile` / `ProfAlign` | ޑިޒައިން ޕްރޮފައިލް ("<alignment> design" ގޮތުގައި): ކޮޅާއި ކޮރުގެ ނުކުތާތަކަށް `PVI`، ވަރުގަދަ ކާވުތަކަށް `length` ހުރި `ParaCurve` |
| `Surfaces` / `Surface` | `name` އަދި `desc`؛ ފުރަތަމަ ހުރި ބިން، ދެން "Proposed" ޕެޑުތަކާއި ކޮރިޑޯ ގްރޭޑު ކުރާއިރު |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard، `name`، `PntList3D` (ހުރި ބިން އެކަނި) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer، `edgeTrim` true، `PntList2D` (ހުރި ބިން އެކަނި، އެއް ހުރިނަމަ) |
| `Definition` | `surfType` TIN، `area2DSurf`، `area3DSurf`، `elevMax`، `elevMin`؛ `Pnts` / `P` ސަރެ `id`؛ `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`، `pipeNetType` storm ނުވަތަ sanitary |
| `Struct` | `name`، `elevRim` (ބޭނުންކުރާ ރިމް، ސެޓް ކުރެވުނު ނުވަތަ ސަފޯސްއިން)، `elevSump`؛ `Center`؛ `CircStruct` އަކީ `diameter` ހުރި؛ `Invert` އަކީ `elev`، `flowDir` in ނުވަތަ out، `refPipe` ހުރި |
| `Pipe` | `name`، `refStart`، `refEnd`، `length`، `slope`؛ `CircPipe` އަކީ `diameter` ހުރި |
| `PlanFeatures` / `PlanFeature` | ފީޗަރ ލައިނަކަށް ކޮންމެ އެއް: `name`؛ `CoordGeom` އަކީ `Line` (`length`، `Start`، `End`) އަދި `Curve` (`rot`، `crvType` arc، `radius`، `length`، `chord`، `delta`؛ `Start` އަދި `End` "N E Z" ގޮތުން، `Center` "N E" ގޮތުން)؛ `Feature` `code="CivilCraft"` އަކީ `Property` use އަދި closed |

ލިޔެފައި ނުވާ: ޕެޑްތަކާއި ކޮރިޑޯތައް އޮބްޖެކްޓު ގޮތުން (އެމީހުންގެ ނަތީޖާ "Proposed" ސަފޯސް)، އެރަރު ހުރި އެލައިންމަންޓްތައް، ދެ އިންވާރޓް ނެތް ޕައިޕްތައް، ނެޓްވާރކް ރޫލްތައް.

## ކިޔާފައި

| އެލިމަންޓް | CivilCraft ނަގާ އެއްޗެހި |
|---|---|
| `Units` | `Imperial` ނުވަތަ `Metric` އަދި އޭގެ `linearUnit` ފޫޓް ނުވަތަ މީޓަރު ނިންމާ. ނޭނގޭ ޔުނިޓެއް ނޯޓް ކުރެވޭ. |
| `Project` | `name` ޕްރޮޖެކްޓް ނަން ވެއެވެ. |
| `CgPoints` / `CgPoint` (އެތެރެތަކުގައިވެސް) | ނަން (ނުވަތަ `oID`)، "N E" ނުވަތަ "N E Z"، `desc` (ނުވަތަ `code`) ޚާއްސަ ކަން ގޮތުން |
| `Surface` `Definition surfType="TIN"` އާއެކު | `Pnts` އަދި `Faces` ހުރި ބިން ގޮތުން (ފުރަތަމަ ސަފޯސް އެކަނި)؛ ނުފެންނަ ފޭސް (`i="1"`) ލިބެނުން |
| `SourceData` / `Breaklines` | 3D ބްރޭކްލައިންތައް، ސަފޯސާއެކު ސޭވް ކުރާ |
| `SourceData` / `Boundaries` | ބޭރު ބައުންޑަރީ |
| `Alignment` / `CoordGeom` | `Line` އަދި `Curve` އެލިމަންޓްތައް؛ PI ތައް ކޮންމެ ކާވެއްގެ `PI` އިން، ނުވަތަ އޭގެ `Center` އަދި ޓެންޖެންޓްތަކުން ހަދާ؛ `staStart` |
| `Profile` / `ProfAlign` | `PVI` އަދި `ParaCurve` (`length` ހުރި)؛ ކުރިން ދެ ނުކުތާ ހުރި ފުރަތަމަ ޑިޒައިން ޕްރޮފައިލް |
| `PlanFeatures` / `PlanFeature` | ކޮންމެ އެއް ފީޗަރ ލައިނެއް ގޮތުން: `Line`، `Curve` (އޭގެ `Start`، `Center`، `End` އަދި `rot`) އަދި `IrregularLine` (`PntList3D` ނުވަތަ `PntList2D`) ކޮނެކްޓް ކުރެވިފައި (ފަހު ނުވާ ތަނެއް ސްޓްރެއިޓް ސެގްމަންޓުން ހިއްލާ ކުރެވޭ ނޯޓުކުރެވިފައި)؛ ފަށާ ތަނަށް ހުށަހަޅާއިރު closed؛ CivilCraft ގެ އަމިއްލަ `Feature` ން use އަދި closed، އެހެންނަމަ **Only drawn**. އުސް ނެތް ނުކުތާތަކަށް 0 ލިބެ (ނޯޓު ކުރެވޭ). |
| `Spiral` | `Curve` ގެ ކައިރީގައި clothoid spirals (ތެރޭގައި އަދި ބޭރަށް؛ PI ރެޑިއަސް އަދި spiral ދިގުތައް ހުރި ގޮތުން ކިޔާ، `theta`، `totalX`، `totalY`، `tanLong`، `tanShort`، `constant` ހުރި ގޮތުން ފަހަތަށް ލިޔެ) |
| `PipeNetwork` | ޕައިޕްތައް ހުރި ފުރަތަމަ ނެޓްވާރކް: `Struct` (`Center`، `elevRim`، `elevSump`، `CircStruct` diameter، ކޮންމެ ޕައިޕަކަށް `Invert`) އަދި `Pipe` (`refStart`، `refEnd`، `CircPipe` diameter) |

## ނެގިފައި، އަދި ނޯޓުތަކުގައި ނަންކުރެވިފައި

- ފުރަތަމަ ފަހުން ހުރި ސަފޯސްތައް، ގްރިޑް ސަފޯސްތައް އަދި އެހެން ޓީއައިއެން ނޯން ސަފޯސްތައް
- `IrregularLine` ނުވަތަ `Chain` އެލިމަންޓްތައް ހުރި އެލައިންމަންޓްތައް، clothoid ނޯން ސްޕައިރަލްތައް، ދެ ކާވުގެ ދެމެދު ސްޕައިރަލް، ނުވަތަ ޖިއޮމެޓްރީ ނެތް އެލައިންމަންޓްތައް
- ފުރަތަމަ ފަހުން ޑިޒައިން ޕްރޮފައިލްތައް؛ `CircCurve` އަދި `UnsymParaCurve` އުފުރުވެރި ކާވުތައް (އެމީހުންގެ PVI ތައް ކާވެއް ނެތި ހިފާ)
- އެހެން ނުކުތާތަކަށް ރެފަރ ކުރާ ނުކުތާތައް (`pntRef`)، އަދި ކިޔެވޭ ކޯޑިނޭޓް ނެތް ނުކުތާތައް
- ކުރިން ނަން ތަކުރާރުވި ނުކުތާތައް (ފުރަތަމަ ހިފާ)
- Hide، show އަދި data-clip ބައުންޑަރީތައް؛ 3D ނުކުތާ ނެތް ބްރޭކްލައިންތައް
- ފުރަތަމަ ފަހުން ނެޓްވާރކްތައް؛ storm އަދި sanitary ނޯން ނެޓްވާރކް ޓައިޕްތައް (storm ގޮތުން ކިޔާ)
- ރެކްޓަންގިއުލާ، އިންލެޓް އަދި އައުޓްލެޓް ސްޓްރަކްޗަރތައް (ރައުންޑް ގޮތުން ކިޔާ)؛ egg، elliptical އަދި box ޕައިޕްތައް އަދި ޗެނަލްތައް (ސައިޒެއް ނެތް ރައުންޑް ޕައިޕްތައް ގޮތުން ކިޔާ)
- ޕްލޭން ފީޗަރތަކުގައި `Spiral` އެލިމަންޓްތައް
- `Parcels`، `Roadways`، `GradeModel` އަދި `Survey`

ފައިލުގައިވާ ބިމުގެ ޕްރޮފައިލް (`ProfSurf`) ބޭނުންކުރެވޭ ނޫން: CivilCraft ބިން ސަފޯސްއިން އަމިއްލައަށް ނަމޫނާ ނަގާ.

## ފައިލް ހުޅުވަން ނުލެވޭ ވަގުތު މެސެޖްތައް

| މެސެޖް | މާނަ |
|---|---|
| "މިއީ XML އެއް، އެކަމަކު LandXML ނޫން (ރޫޓް އެލިމަންޓް <…>)." | ފައިލް އެހެން ޤިސްމެއްގެ XML އެކެވެ. |
| "… ގައި CivilCraft ކިޔެވޭ ނުކުތާ، TIN ސަފޯސް ނުވަތަ އެލައިންމަންޓް ނެތް." | ފައިލުގެ ހުރިހާ އެއްޗެއް ނެގި ލިސްޓުގައި. އޭގެ ފަހުގައި ނޯޓުތައް އެތަނުގައި ހުރި އެއްޗެހި ދައްކައެވެ. |
| "Mismatched end tag …"، "Unclosed tag …"، "The file ends inside …" | ފައިލް ހަލާކުވެފައި ނުވަތަ ކެޓިފައި. |
