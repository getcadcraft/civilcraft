---
title: LandXML: के पढिन्छ र के लेखिन्छ
summary: CivilCraft ले पढ्ने र लेख्ने LandXML 1.2 तत्त्व र विशेषताहरू, तत्व-तत्वअनुसार, र त्यसले छोड्ने सबै कुरा।
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, फिचर रेखा, स्कीमा
from: ca3cf359
---

CivilCraft ले आधिकारिक नेमस्पेस र स्कीमा स्थानसहित LandXML 1.2 लेख्छ। यसले root element `LandXML` भएको कुनै पनि फाइल पढ्छ र तलका तत्वहरू तिनको नामबाट लिन्छ (नेमस्पेस उपसर्ग बेवास्ता गरिन्छ; संस्करण जाँचिँदैन)। यसको XML रिडरले पाँच मानक एन्टिटी र संख्यात्मक क्यारेक्टर सन्दर्भ मात्र स्वीकार्छ; यसले कहिल्यै DTD वा बाह्य फाइल लोड गर्दैन। चरणहरूका लागि हेर्नुहोस् [LandXML आदान-प्रदान](topic:landxml)।

LandXML ले निर्देशांक उत्तरी मान (northing) पहिले लेख्छ: बिन्दु "N E" वा "N E Z" हुन्छ।

## लेखिएको

| तत्व | CivilCraft ले के लेख्छ |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, क्षेत्रफल square feet मा, आयतन cubic yards मा, व्यास inches मा) वा `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = परियोजनाको नाम |
| `Application` | नाम CivilCraft, निर्माता CadCraft |
| `CgPoints` / `CgPoint` | `name` = बिन्दु नम्बर, `desc` = विवरण, `code` = समूह; पाठ "N E Z" (वा उचाइबिना "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw वा ccw, `radius`, `length`, `staStart`, `chord`, `delta` (डिग्री), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | एलाइनमेन्टसँगको अवस्थित जमिन, स्टेशन र एलिभेसन जोडीका रूपमा (`PntList2D`), सतहबाट निस्कने ठाउँमा विभाजित |
| `Profile` / `ProfAlign` | डिजाइन प्रोफाइल ("<alignment> design" नामको): अन्त्य र कोण बिन्दुहरूका लागि `PVI`, ठाडो वक्रहरूका लागि `length` सहित `ParaCurve` |
| `Surfaces` / `Surface` | `name` र `desc`; पहिले अवस्थित जमिन, त्यसपछि "Proposed" जब प्याड वा कोरिडोरले ग्रेड गर्छन् |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (अवस्थित जमिन मात्र) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (अवस्थित जमिन मात्र, जब त्यो हुन्छ) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id` सहित `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm वा sanitary |
| `Struct` | `name`, `elevRim` (प्रयोग गरिएको रिम, सेट वा सतहबाट), `elevSump`; `Center`; `diameter` सहित `CircStruct`; `elev`, `flowDir` in वा out, `refPipe` सहित `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter` सहित `CircPipe` |
| `PlanFeatures` / `PlanFeature` | हरेक फिचर रेखाका लागि एउटा: `name`; `CoordGeom` मा `Line` (`length`, `Start`, `End`) र `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`), जहाँ `Start` र `End` "N E Z", `Center` "N E" हुन्; `Property` प्रयोग र closed सहित `Feature` `code="CivilCraft"` |

लेखिएको छैन: वस्तुका रूपमा प्याड र कोरिडोर (तिनको नतिजा "Proposed" सतह हो), त्रुटि भएका एलाइनमेन्टहरू, दुवै invert नभएका पाइपहरू, नेटवर्क नियमहरू।

## पढिएको

| तत्व | CivilCraft ले के लिन्छ |
|---|---|
| `Units` | `Imperial` वा `Metric` र तिनको `linearUnit` ले फिट वा मिटर निर्णय गर्छ। अज्ञात एकाइ नोट गरिन्छ। |
| `Project` | `name` परियोजनाको नाम बन्छ। |
| `CgPoints` / `CgPoint` (भित्र पनि) | नाम (वा `oID`), "N E" वा "N E Z", र `desc` (वा `code`) विवरणका रूपमा |
| `surfType="TIN"` सहितको `Surface` `Definition` | `Pnts` र `Faces` अवस्थित जमिनका रूपमा (पहिलो सतह मात्र); अदृश्य फेसहरू (`i="1"`) छोडिन्छन् |
| `SourceData` / `Breaklines` | 3D ब्रेकलाइनहरू, सतहसँगै राखिन्छन् |
| `SourceData` / `Boundaries` | बाहिरी सीमा |
| `Alignment` / `CoordGeom` | `Line` र `Curve` तत्वहरू; PI हरू प्रत्येक वक्रको `PI` बाट, वा तिनको `Center` र ट्याङ्जेन्टबाट पुनर्निर्माण; `staStart` |
| `Profile` / `ProfAlign` | `PVI` र `ParaCurve` (`length` सहित); कम्तीमा दुईवटा PVI भएको पहिलो डिजाइन प्रोफाइल |
| `PlanFeatures` / `PlanFeature` | प्रत्येक फिचर रेखाका रूपमा: `Line`, `Curve` (तिनको `Start`, `Center`, `End` र `rot`) र `IrregularLine` (`PntList3D` वा `PntList2D`), अन्त्य-देखि-अन्त्य जोडिएका (खाली ठाउँ सिधा खण्डले जोडिन्छ र नोट गरिन्छ); सुरु भएकै ठाउँमा अन्त्य हुँदा closed; CivilCraft को आफ्नै `Feature` बाट use र closed, नत्र **केवल चित्रित**। एलिभेसन नभएका बिन्दुहरूले 0 पाउँछन् (नोट गरिन्छ)। |
| `Spiral` | `Curve` को छेउमा क्लोथोइड स्पाइरलहरू (भित्र र बाहिर; स्पाइरल लम्बाइसहित त्रिज्या भएको PI का रूपमा पढिन्छ, र `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` सहित फेरि लेखिन्छ) |
| `PipeNetwork` | पाइप भएको पहिलो नेटवर्क: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, प्रति पाइप `Invert`) र `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## छोडिएको, र नोटहरूमा नाम दिइएको

- पहिलोपछिका सतहहरू, ग्रिड सतहहरू र अन्य गैर-TIN सतहहरू
- `IrregularLine` वा `Chain` तत्व भएका एलाइनमेन्टहरू, क्लोथोइडबाहेकका स्पाइरलहरू, दुई वक्रबीचको स्पाइरल, वा ज्यामिति नभएका एलाइनमेन्टहरू
- पहिलोपछिका डिजाइन प्रोफाइलहरू; `CircCurve` र `UnsymParaCurve` ठाउँगत वक्रहरू (तिनका PVI हरू वक्रविना राखिन्छन्)
- अर्को बिन्दुलाई मात्र उल्लेख गर्ने (`pntRef`) बिन्दुहरू, र पढ्न मिल्ने निर्देशांक नभएका बिन्दुहरू
- दोहोरिएका बिन्दु नामहरू (पहिलो राखिन्छ)
- लुकाउने, देखाउने र डेटा-क्लिप सीमाहरू; 3D बिन्दु नभएका ब्रेकलाइनहरू
- पहिलोपछिका पाइप नेटवर्कहरू; storm र sanitary बाहेकका नेटवर्क प्रकारहरू (storm का रूपमा पढिन्छ)
- आयताकार, इनलेट र आउटलेट संरचनाहरू (गोलाकारका रूपमा पढिन्छ); अण्डाकार, दिर्घवृत्तीय र बक्स पाइप र च्यानलहरू (आकारविहीन गोलाकार पाइपका रूपमा पढिन्छ)
- योजना सुविधाहरूमा `Spiral` तत्वहरू
- `Parcels`, `Roadways`, `GradeModel` र `Survey`

फाइलमा भएका जमिन प्रोफाइलहरू (`ProfSurf`) प्रयोग गरिँदैनन्: CivilCraft ले जमिनको नमुना सतहबाटै लिन्छ।

## फाइल खोल्न नसकिँदाका सन्देशहरू

| सन्देश | अर्थ |
|---|---|
| "This is XML but not LandXML (its root element is <…>)." | फाइल अर्को प्रकारको XML हो। |
| "… has no points, TIN surfaces or alignments CivilCraft can read." | फाइलका सबै कुरा छोडिएको सूचीमा छन्। यसपछिका नोटहरूले त्यहाँ के थियो भनी बताउँछन्। |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" | फाइल बिग्रिएको वा बीचमै काटिएको छ। |
