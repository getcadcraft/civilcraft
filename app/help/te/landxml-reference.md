---
title: LandXML: చదివేది మరియు రాసేది
summary: CivilCraft చదివే మరియు రాసే LandXML 1.2 ఎలిమెంట్‌లు మరియు అట్రిబ్యూట్‌లు, ఎలిమెంట్ వారీగా, మరియు అది దాటవేసేవన్నీ.
keywords: landxml, xml, cgpoints, ఉపరితలం, tin, బ్రేక్‌లైన్‌లు, సరిహద్దు, అలైన్‌మెంట్, coordgeom, ప్రొఫైల్, profalign, pvi, paracurve, పైప్ నెట్‌వర్క్‌లు, struct, పైపు, planfeatures, planfeature, ఫీచర్ లైన్, స్కీమా
from: ca3cf359
---

CivilCraft LandXML 1.2 ను అధికారిక నేమ్‌స్పేస్ మరియు స్కీమా స్థానంతో రాస్తుంది. దాని root ఎలిమెంట్ `LandXML` అయిన ఏ ఫైల్‌ను అయినా చదువుతుంది, మరియు దిగువ ఎలిమెంట్‌లను పేరు ద్వారా తీసుకుంటుంది (నేమ్‌స్పేస్ ప్రిఫిక్స్‌లు విస్మరించబడతాయి; వెర్షన్ తనిఖీ చేయబడదు). దాని XML రీడర్ ఐదు ప్రామాణిక ఎంటిటీలు మరియు సంఖ్యా అక్షర రిఫరెన్స్‌లను మాత్రమే అంగీకరిస్తుంది; ఇది DTD లేదా బాహ్య ఫైల్‌ను ఎప్పుడూ లోడ్ చేయదు. దశల కోసం చూడండి [LandXML మార్పిడి](topic:landxml).

LandXML కోఆర్డినేట్‌లను ముందు ఉత్తరం (northing) తో రాస్తుంది: బిందువు "N E" లేదా "N E Z".

## రాయబడినవి

| ఎలిమెంట్ | CivilCraft ఏమి రాస్తుంది |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, చదరపు అడుగులలో వైశాల్యాలు, క్యూబిక్ యార్డ్‌లలో ఘనపరిమాణాలు, అంగుళాలలో వ్యాసాలు) లేదా `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = ప్రాజెక్ట్ పేరు |
| `Application` | పేరు CivilCraft, తయారీదారు CadCraft |
| `CgPoints` / `CgPoint` | `name` = పాయింట్ సంఖ్య, `desc` = వివరణ, `code` = గుంపు; టెక్స్ట్ "N E Z" (లేదా ఎలివేషన్ లేకుండా "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw లేదా ccw, `radius`, `length`, `staStart`, `chord`, `delta` (డిగ్రీలు), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | అలైన్‌మెంట్ వెంట ఇప్పటికే ఉన్న భూమి, స్టేషన్ మరియు ఎలివేషన్ జతలుగా (`PntList2D`), అది ఉపరితలాన్ని వదిలే చోట విభజించబడింది |
| `Profile` / `ProfAlign` | డిజైన్ ప్రొఫైల్ ("<alignment> design" అని పేరు): చివరలు మరియు కోణ బిందువులకు `PVI`, నిలువు వక్రాలకు `length` తో `ParaCurve` |
| `Surfaces` / `Surface` | `name` మరియు `desc`; ముందు ఇప్పటికే ఉన్న భూమి, ప్యాడ్‌లు లేదా కారిడార్‌లు గ్రేడ్ చేసినప్పుడు "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (ఇప్పటికే ఉన్న భూమి మాత్రమే) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (ఇప్పటికే ఉన్న భూమి మాత్రమే, ఉన్నప్పుడు) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id` తో `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm లేదా sanitary |
| `Struct` | `name`, `elevRim` (ఉపయోగించిన రిమ్, సెట్ చేయబడినది లేదా ఉపరితలం నుండి), `elevSump`; `Center`; `diameter` తో `CircStruct`; `elev`, `flowDir` in లేదా out, `refPipe` తో `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter` తో `CircPipe` |
| `PlanFeatures` / `PlanFeature` | ఒక్కో ఫీచర్ లైన్‌కు ఒకటి: `name`; `CoordGeom` తో `Line` (`length`, `Start`, `End`) మరియు `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` మరియు `End` "N E Z" గా, `Center` "N E" గా); `Property` use మరియు closed తో `Feature` `code="CivilCraft"` |

రాయబడనివి: వస్తువులుగా ప్యాడ్‌లు మరియు కారిడార్‌లు (వాటి ఫలితం "Proposed" ఉపరితలం), లోపాలున్న అలైన్‌మెంట్‌లు, రెండు inverts లేని పైపులు, నెట్‌వర్క్ నియమాలు.

## చదివినవి

| ఎలిమెంట్ | CivilCraft ఏది తీసుకుంటుంది |
|---|---|
| `Units` | `Imperial` లేదా `Metric` మరియు దాని `linearUnit` అడుగులు లేదా మీటర్లు నిర్ణయిస్తాయి. తెలియని యూనిట్ గమనించబడుతుంది. |
| `Project` | `name` ప్రాజెక్ట్ పేరు అవుతుంది. |
| `CgPoints` / `CgPoint` (లోపల ఉన్నవి కూడా) | పేరు (లేదా `oID`), "N E" లేదా "N E Z", `desc` (లేదా `code`) వివరణగా |
| `Surface` with `Definition surfType="TIN"` | `Pnts` మరియు `Faces` ఇప్పటికే ఉన్న భూమిగా (మొదటి ఉపరితలం మాత్రమే); కనిపించని ముఖాలు (`i="1"`) వదిలివేయబడతాయి |
| `SourceData` / `Breaklines` | 3D బ్రేక్‌లైన్‌లు, ఉపరితలంతో ఉంచబడినవి |
| `SourceData` / `Boundaries` | బయటి సరిహద్దు |
| `Alignment` / `CoordGeom` | `Line` మరియు `Curve` ఎలిమెంట్‌లు; ప్రతి వక్రం యొక్క `PI` నుండి లేదా దాని `Center` మరియు టాంజెంట్‌ల నుండి PI లు తిరిగి నిర్మించబడ్డాయి; `staStart` |
| `Profile` / `ProfAlign` | `PVI` మరియు `ParaCurve` (`length` తో); కనీసం రెండు PVI లున్న మొదటి డిజైన్ ప్రొఫైల్ |
| `PlanFeatures` / `PlanFeature` | ప్రతిదీ ఒక ఫీచర్ లైన్‌గా: `Line`, `Curve` (దాని `Start`, `Center`, `End` మరియు `rot`) మరియు `IrregularLine` (`PntList3D` లేదా `PntList2D`) చివరి నుండి చివరి వరకు కలపబడినవి (ఖాళీని సరళ భాగంతో కలిపి గమనిస్తారు); మొదలైన చోటే ముగిస్తే closed; CivilCraft స్వంత `Feature` నుండి use మరియు closed, లేకపోతే **మాత్రమే గీసినది**. ఎలివేషన్ లేని బిందువులకు 0 వస్తుంది (గమనించబడుతుంది). |
| `Spiral` | `Curve` పక్కన క్లోతాయిడ్ స్పైరల్స్ (లోపల మరియు బయట; PI గా వ్యాసార్థం మరియు స్పైరల్ పొడవులతో చదవబడతాయి, `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` తో తిరిగి రాయబడతాయి) |
| `PipeNetwork` | పైపులు ఉన్న మొదటి నెట్‌వర్క్: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, పైపుకు `Invert`) మరియు `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## దాటవేయబడినవి, మరియు గమనికలలో పేర్కొనబడినవి

- మొదటిది తర్వాత ఉపరితలాలు, గ్రిడ్ ఉపరితలాలు మరియు ఇతర నాన్-TIN ఉపరితలాలు
- `IrregularLine` లేదా `Chain` ఎలిమెంట్‌లు ఉన్న అలైన్‌మెంట్‌లు, క్లోతాయిడ్ కాకుండా ఇతర స్పైరల్స్, రెండు వక్రాల మధ్య స్పైరల్, లేదా జ్యామితి లేనివి
- మొదటిది తర్వాత డిజైన్ ప్రొఫైల్‌లు; `CircCurve` మరియు `UnsymParaCurve` నిలువు వక్రాలు (వాటి PVI లు వక్రం లేకుండా ఉంచబడతాయి)
- ఇతర బిందువులను మాత్రమే సూచించే బిందువులు (`pntRef`), మరియు చదవగల కోఆర్డినేట్‌లు లేని బిందువులు
- పునరావృత బిందువు పేర్లు (మొదటిది ఉంచబడుతుంది)
- దాచు, చూపు మరియు డేటా-క్లిప్ సరిహద్దులు; 3D బిందువులు లేని బ్రేక్‌లైన్‌లు
- మొదటిది తర్వాత పైప్ నెట్‌వర్క్‌లు; storm మరియు sanitary కాకుండా ఇతర నెట్‌వర్క్ రకాలు (storm గా చదవబడతాయి)
- దీర్ఘచతురస్ర, ఇన్‌లెట్ మరియు అవుట్‌లెట్ నిర్మాణాలు (గుండ్రంగా చదవబడతాయి); గుడ్డు, దీర్ఘవృత్తాకార మరియు పెట్టె పైపులు మరియు చానెల్‌లు (పరిమాణం లేని గుండ్రని పైపులుగా చదవబడతాయి)
- ఫీచర్ లైన్‌లలో `Spiral` ఎలిమెంట్‌లు
- `Parcels`, `Roadways`, `GradeModel` మరియు `Survey`

ఫైల్‌లోని భూమి ప్రొఫైల్‌లు (`ProfSurf`) ఉపయోగించబడవు: CivilCraft భూమిని ఉపరితలం నుండే నమూనా తీసుకుంటుంది.

## ఫైల్ తెరవనప్పుడు సందేశాలు

| సందేశం | అర్థం |
|---|---|
| "ఇది XML, కానీ LandXML కాదు (దీని root ఎలిమెంట్ <…>)." | ఫైల్ మరో రకమైన XML. |
| "… లో CivilCraft చదవగల బిందువులు, TIN ఉపరితలాలు లేదా అలైన్‌మెంట్‌లు లేవు." | ఫైల్‌లో ఉన్నదంతా దాటవేయబడిన జాబితాలో ఉంది. దాని తర్వాత ఉన్న గమనికలు అక్కడ ఏముందో చెబుతాయి. |
| "సరిపోలని ముగింపు ట్యాగ్ …", "మూసివేయని ట్యాగ్ …", "ఫైల్ … లోపల ముగుస్తుంది" | ఫైల్ పాడైంది లేదా మధ్యలో కత్తిరించబడింది. |
