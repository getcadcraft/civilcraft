---
title: LandXML: क्या पढ़ा और लिखा जाता है
summary: LandXML 1.2 के वे एलिमेंट और एट्रिब्यूट जो CivilCraft पढ़ता और लिखता है, एलिमेंट-दर-एलिमेंट, और वह सब जो वह छोड़ता है।
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, फ़ीचर लाइन, स्कीमा
from: ca3cf359
---

CivilCraft आधिकारिक नेमस्पेस और स्कीमा स्थान के साथ LandXML 1.2 लिखता है। यह हर उस फ़ाइल को पढ़ता है जिसका रूट एलिमेंट `LandXML` है, और नीचे के एलिमेंट उनके नाम से लेता है (नेमस्पेस प्रीफ़िक्स अनदेखे रहते हैं; संस्करण की जाँच नहीं होती)। इसका XML रीडर केवल पाँच मानक एंटिटी और संख्यात्मक कैरेक्टर संदर्भ स्वीकार करता है; यह कभी DTD या बाहरी फ़ाइल लोड नहीं करता। चरणों के लिए देखें [LandXML का आदान-प्रदान](topic:landxml)।

LandXML निर्देशांक नॉर्थिंग पहले लिखता है: बिंदु "N E" या "N E Z" होता है।

## लिखा गया

| एलिमेंट | CivilCraft क्या लिखता है |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, क्षेत्र वर्ग फ़ुट में, आयतन घन यार्ड में, व्यास इंच में) या `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = प्रोजेक्ट का नाम |
| `Application` | नाम CivilCraft, निर्माता CadCraft |
| `CgPoints` / `CgPoint` | `name` = बिंदु संख्या, `desc` = विवरण, `code` = समूह; टेक्स्ट "N E Z" (या ऊँचाई के बिना "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw या ccw, `radius`, `length`, `staStart`, `chord`, `delta` (डिग्री में), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | संरेखण के साथ मौजूदा भूमि, स्टेशन और एलिवेशन के जोड़ों के रूप में (`PntList2D`), जहाँ वह सतह से निकलती है वहाँ बँटी हुई |
| `Profile` / `ProfAlign` | डिज़ाइन प्रोफ़ाइल ("<alignment> design" नाम से): सिरों और कोण बिंदुओं के लिए `PVI`, ऊर्ध्वाधर वक्रों के लिए `length` वाला `ParaCurve` |
| `Surfaces` / `Surface` | `name` और `desc`; पहले मौजूदा भूमि, फिर "Proposed" जब पैड या कॉरिडोर ग्रेड होते हैं |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (केवल मौजूदा भूमि) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (केवल मौजूदा भूमि, जब वह हो) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id` के साथ `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm या sanitary |
| `Struct` | `name`, `elevRim` (इस्तेमाल किया गया रिम, सेट या सतह से), `elevSump`; `Center`; `diameter` वाला `CircStruct`; `elev`, `flowDir` (in या out), `refPipe` वाला `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter` वाला `CircPipe` |
| `PlanFeatures` / `PlanFeature` | हर फ़ीचर लाइन के लिए एक: `name`; `Line` (`length`, `Start`, `End`) और `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` और `End` "N E Z" के रूप में, `Center` "N E" के रूप में) वाला `CoordGeom`; `Feature` `code="CivilCraft"` के साथ `Property` उपयोग और closed |

नहीं लिखा गया: पैड और कॉरिडोर ऑब्जेक्ट के रूप में (उनका परिणाम "Proposed" सतह है), त्रुटियों वाले संरेखण, वे पाइप जिनमें दोनों इनवर्ट नहीं हैं, नेटवर्क नियम।

## पढ़ा गया

| एलिमेंट | CivilCraft क्या लेता है |
|---|---|
| `Units` | `Imperial` या `Metric` और उसका `linearUnit` तय करते हैं कि फ़ुट या मीटर। अज्ञात इकाई नोट की जाती है। |
| `Project` | `name` प्रोजेक्ट का नाम बन जाता है। |
| `CgPoints` / `CgPoint` (नेस्टेड भी) | नाम (या `oID`), "N E" या "N E Z", विवरण के रूप में `desc` (या `code`) |
| `Surface` जिसमें `Definition surfType="TIN"` है | `Pnts` और `Faces` मौजूदा भूमि के रूप में (केवल पहली सतह); अदृश्य फ़ेस (`i="1"`) छोड़ दिए जाते हैं |
| `SourceData` / `Breaklines` | 3D ब्रेकलाइनें, सतह के साथ रखी जाती हैं |
| `SourceData` / `Boundaries` | बाहरी सीमा |
| `Alignment` / `CoordGeom` | `Line` और `Curve` एलिमेंट; PI हर वक्र के `PI` से, या उसके `Center` और स्पर्शरेखाओं से फिर बनाए जाते हैं; `staStart` |
| `Profile` / `ProfAlign` | `PVI` और `ParaCurve` (`length` के साथ); कम से कम दो PVI वाली पहली डिज़ाइन प्रोफ़ाइल |
| `PlanFeatures` / `PlanFeature` | हर एक फ़ीचर लाइन के रूप में: `Line`, `Curve` (उसके `Start`, `Center`, `End` और `rot`) और `IrregularLine` (`PntList3D` या `PntList2D`), सिरे से सिरा जुड़े हुए (अंतर को सीधे खंड से जोड़ा जाता है और नोट किया जाता है); जहाँ से शुरू हुई वहीं खत्म हो तो closed; उपयोग और closed CivilCraft के अपने `Feature` से, नहीं तो **केवल ड्रॉ**। बिना एलिवेशन वाले बिंदु 0 पाते हैं (नोट किया गया)। |
| `Spiral` | `Curve` के बगल में क्लोथॉइड स्पाइरल (अंदर और बाहर; त्रिज्या और स्पाइरल लंबाई वाले PI के रूप में पढ़े जाते हैं, और `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` के साथ वापस लिखे जाते हैं) |
| `PipeNetwork` | पाइप वाला पहला नेटवर्क: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` का व्यास, हर पाइप का `Invert`) और `Pipe` (`refStart`, `refEnd`, `CircPipe` का व्यास) |

## छोड़ा गया, और नोट में बताया गया

- पहली के बाद की सतहें, ग्रिड सतहें और अन्य गैर-TIN सतहें
- वे संरेखण जिनमें `IrregularLine` या `Chain` एलिमेंट हों, क्लोथॉइड के अलावा स्पाइरल, दो वक्रों के बीच स्पाइरल, या जिनमें कोई ज्यामिति न हो
- पहली के बाद की डिज़ाइन प्रोफ़ाइलें; `CircCurve` और `UnsymParaCurve` ऊर्ध्वाधर वक्र (उनके PVI बिना वक्र के रखे जाते हैं)
- वे बिंदु जो केवल दूसरे बिंदुओं का संदर्भ देते हैं (`pntRef`), और वे बिंदु जिनके पढ़ने योग्य निर्देशांक नहीं
- दोहराए गए बिंदु नाम (पहला रखा जाता है)
- छिपाने, दिखाने और डेटा-क्लिप सीमाएँ; 3D बिंदुओं के बिना ब्रेकलाइनें
- पहले के बाद के पाइप नेटवर्क; storm और sanitary के अलावा नेटवर्क प्रकार (storm के रूप में पढ़े जाते हैं)
- आयताकार, इनलेट और आउटलेट संरचनाएँ (गोल के रूप में पढ़ी जाती हैं); एग, दीर्घवृत्ताकार और बॉक्स पाइप और चैनल (आकार रहित गोल पाइप के रूप में पढ़े जाते हैं)
- प्लान फ़ीचर में `Spiral` एलिमेंट
- `Parcels`, `Roadways`, `GradeModel` और `Survey`

फ़ाइल में भूमि प्रोफ़ाइलें (`ProfSurf`) इस्तेमाल नहीं होतीं: CivilCraft भूमि के नमूने सीधे सतह से लेता है।

## जब फ़ाइल न खुले, तब के संदेश

| संदेश | अर्थ |
|---|---|
| "यह XML है, लेकिन LandXML नहीं (इसका रूट एलिमेंट <…> है)।" | फ़ाइल किसी दूसरे प्रकार का XML है। |
| "… में CivilCraft के पढ़ने योग्य कोई बिंदु, TIN सतह या संरेखण नहीं है।" | फ़ाइल में सब कुछ छोड़ी गई सूची में है। उसके बाद के नोट बताते हैं कि वहाँ क्या था। |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" | फ़ाइल खराब है या बीच में कट गई है। |
