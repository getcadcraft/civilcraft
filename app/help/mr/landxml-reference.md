---
title: LandXML: काय वाचले आणि लिहिले जाते
summary: CivilCraft वाचत आणि लिहिणारे LandXML 1.2 घटक आणि गुणधर्म, घटकानुसार, आणि जे सर्व ते वगळते.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, फीचर रेषा, स्कीमा
from: ca3cf359
---

CivilCraft `LandXML` हा मूळ घटक असलेली कोणतीही फाइल वाचते आणि LandXML 1.2 ला अधिकृत नेमस्पेस व स्कीमा स्थानासह लिहिते. खालील घटक नावाने घेतले जातात (नेमस्पेस प्रीफिक्स दुर्लक्षित; आवृत्ती तपासली जात नाही). त्याचा XML वाचक फक्त पाच मानक एंटिटी आणि संख्यात्मक वर्ण संदर्भ स्वीकारतो; तो DTD किंवा बाह्य फाइल कधीही लोड करत नाही. पायऱ्यांसाठी पाहा [LandXML देवाणघेवाण](topic:landxml).

LandXML निर्देशांक उत्तर प्रथम लिहिते: बिंदू "N E" किंवा "N E Z" असा असतो.

## लिहिलेले

| घटक | CivilCraft काय लिहिते |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, क्षेत्रफळ चौरस फूटात, घनफळ घन यार्डमध्ये, व्यास इंचात) किंवा `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = प्रकल्पाचे नाव |
| `Application` | नाव CivilCraft, निर्माता CadCraft |
| `CgPoints` / `CgPoint` | `name` = बिंदू क्रमांक, `desc` = वर्णन, `code` = गट; मजकूर "N E Z" (किंवा उंचीशिवाय "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw किंवा ccw, `radius`, `length`, `staStart`, `chord`, `delta` (अंश), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | अलाइनमेंटच्या बाजूची विद्यमान जमीन, स्टेशन आणि उंचीच्या जोड्या म्हणून (`PntList2D`), पृष्ठभाग सोडते तिथे विभागलेली |
| `Profile` / `ProfAlign` | प्रस्तावित प्रोफाइल ("<alignment> design" नावाचे): टोके आणि कोन बिंदूंसाठी `PVI`, उभ्या वक्रांसाठी `length` असलेला `ParaCurve` |
| `Surfaces` / `Surface` | `name` आणि `desc`; प्रथम विद्यमान जमीन, मग पॅड्स किंवा कॉरिडॉर ग्रेड झाल्यास "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (फक्त विद्यमान जमीन) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (फक्त विद्यमान जमीन, असल्यास) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id` सह `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm किंवा sanitary |
| `Struct` | `name`, `elevRim` (वापरलेली कड, सेट केलेली किंवा पृष्ठभागावरून), `elevSump`; `Center`; `diameter` सह `CircStruct`; `elev`, `flowDir` in किंवा out, `refPipe` सह `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter` सह `CircPipe` |
| `PlanFeatures` / `PlanFeature` | प्रत्येक फीचर रेषेसाठी एक: `name`; `Line` (`length`, `Start`, `End`) आणि `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` आणि `End` "N E Z" म्हणून, `Center` "N E" म्हणून) असलेला `CoordGeom`; `Property` वापर आणि closed असलेला `Feature` `code="CivilCraft"` |

लिहिले जात नाही: वस्तू म्हणून पॅड्स आणि कॉरिडॉर (त्यांचा निकाल "Proposed" पृष्ठभाग आहे), त्रुटी असलेले अलाइनमेंट, दोन्ही इन्व्हर्ट नसलेले पाइप, नेटवर्क नियम.

## वाचलेले

| घटक | CivilCraft काय घेते |
|---|---|
| `Units` | `Imperial` किंवा `Metric` आणि त्याचे `linearUnit` फूट किंवा मीटर ठरवतात. अज्ञात युनिट नोंदवले जाते. |
| `Project` | `name` प्रकल्पाचे नाव होते. |
| `CgPoints` / `CgPoint` (आतही) | नाव (किंवा `oID`), "N E" किंवा "N E Z", वर्णन म्हणून `desc` (किंवा `code`) |
| `Surface` सह `Definition surfType="TIN"` | `Pnts` आणि `Faces` विद्यमान जमीन म्हणून (फक्त पहिली पृष्ठभाग); अदृश्य फेस (`i="1"`) वगळले जातात |
| `SourceData` / `Breaklines` | 3D ब्रेकलाइन्स, पृष्ठभागासह ठेवलेल्या |
| `SourceData` / `Boundaries` | बाह्य सीमा |
| `Alignment` / `CoordGeom` | `Line` आणि `Curve` घटक; प्रत्येक वक्राच्या `PI` वरून किंवा त्याच्या `Center` आणि स्पर्शिकांवरून पुनर्बांधलेले PI; `staStart` |
| `Profile` / `ProfAlign` | `PVI` आणि `ParaCurve` (`length` सह); किमान दोन PVI असलेले पहिले प्रस्तावित प्रोफाइल |
| `PlanFeatures` / `PlanFeature` | प्रत्येक एक फीचर रेषा म्हणून: `Line`, `Curve` (त्याचे `Start`, `Center`, `End` आणि `rot`) आणि `IrregularLine` (`PntList3D` किंवा `PntList2D`) टोकाला टोक जोडलेले (अंतर सरळ खंडाने जोडले जाते आणि नोंदवले जाते); जिथे सुरू होते तिथे संपते तेव्हा closed; CivilCraft च्या स्वतःच्या `Feature` वरून वापर आणि closed, नाहीतर **केवळ काढलेले**. एलिव्हेशन नसलेल्या बिंदूंना 0 मिळतो (नोंदवले). |
| `Spiral` | `Curve` शेजारील क्लोथॉइड स्पायरल (आत आणि बाहेर; त्रिज्या आणि स्पायरल लांबी असलेले PI म्हणून वाचले, `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` सह परत लिहिलेले) |
| `PipeNetwork` | पाइप असलेले पहिले नेटवर्क: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` व्यास, प्रति पाइप `Invert`) आणि `Pipe` (`refStart`, `refEnd`, `CircPipe` व्यास) |

## वगळलेले, आणि नोंदीत नाव दिलेले

- पहिल्यानंतरच्या पृष्ठभाग, ग्रिड पृष्ठभाग आणि इतर नॉन-TIN पृष्ठभाग
- `IrregularLine` किंवा `Chain` घटक असलेले अलाइनमेंट, क्लोथॉइड नसलेले स्पायरल, दोन वक्रांमधील स्पायरल, किंवा भूमिती नसलेले
- पहिल्यानंतरचे प्रस्तावित प्रोफाइल; `CircCurve` आणि `UnsymParaCurve` उभे वक्र (त्यांचे PVI वक्राशिवाय ठेवले जातात)
- फक्त इतर बिंदूंचा संदर्भ देणारे बिंदू (`pntRef`), आणि वाचता येणारे निर्देशांक नसलेले बिंदू
- पुनरावृत्त बिंदू नावे (पहिले ठेवले जाते)
- लपवा, दाखवा आणि डेटा-क्लिप सीमा; 3D बिंदू नसलेल्या ब्रेकलाइन्स
- पहिल्यानंतरचे पाइप नेटवर्क; storm आणि sanitary व्यतिरिक्त नेटवर्क प्रकार (storm म्हणून वाचले)
- आयताकृती, इनलेट आणि आउटलेट स्ट्रक्चर (गोल म्हणून वाचले); अंडाकृती, लंबवर्तुळाकार आणि बॉक्स पाइप व चॅनेल (आकार नसलेले गोल पाइप म्हणून वाचले)
- फीचर रेषांमधील `Spiral` घटक
- `Parcels`, `Roadways`, `GradeModel` आणि `Survey`

फाइलमधील ग्राउंड प्रोफाइल (`ProfSurf`) वापरली जात नाहीत: CivilCraft जमिनीचे नमुने स्वतः पृष्ठभागावरून घेते.

## फाइल उघडत नसताना संदेश

| संदेश | अर्थ |
|---|---|
| हे XML आहे, पण LandXML नाही (त्याचा मूळ घटक <…> आहे). | फाइल दुसऱ्या प्रकारची XML आहे. |
| … मध्ये CivilCraft वाचू शकेल असे बिंदू, TIN पृष्ठभाग किंवा अलाइनमेंट नाहीत. | फाइलमधील सर्व काही वगळलेल्या यादीत आहे. त्यानंतरच्या नोंदी सांगतात तिथे काय होते. |
| जुळत नसलेला शेवटचा टॅग …, बंद न केलेला टॅग …, फाइल … च्या आत संपते | फाइल खराब आहे किंवा अर्धवट कापलेली आहे. |
