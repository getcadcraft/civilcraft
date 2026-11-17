---
title: LandXML: რა იკითხება და იწერება
summary: LandXML 1.2 ელემენტები და ატრიბუტები, რომლებსაც CivilCraft კითხულობს და წერს, ელემენტ-ელემენტად, და ყველაფერი, რასაც ის გამოტოვებს.
keywords: landxml, xml, cgpoints, ზედაპირი, tin, ზედაპირის ხაზები, საზღვარი, ტრასა, coordgeom, პროფილი, profalign, pvi, paracurve, pipenetworks, struct, მილი, planfeatures, planfeature, მახასიათებელი ხაზი, სქემა
from: ca3cf359
---

CivilCraft წერს LandXML 1.2-ს ოფიციალური namespace-ითა და schema location-ით. ის კითხულობს ნებისმიერ ფაილს, რომლის ძირითადი ელემენტია `LandXML`, და იღებს ქვემოთ მოცემულ ელემენტებს სახელით (namespace-ის პრეფიქსები უგულებელყოფილია; ვერსია არ მოწმდება). მისი XML წამკითხველი იღებს მხოლოდ ხუთ სტანდარტულ entity-სა და რიცხვით სიმბოლოთა მითითებებს; ის არასდროს ტვირთავს DTD-ს ან გარე ფაილს. ნაბიჯებისთვის იხილეთ [LandXML-ის გაცვლა](topic:landxml).

LandXML კოორდინატებს წერს ჩრდილოეთით (N) დაწყებით: წერტილი არის "N E" ან "N E Z".

## ჩაწერილი

| ელემენტი | რას წერს CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, ფართობები კვადრატულ ფუტებში, მოცულობები კუბურ იარდებში, დიამეტრები დიუმებში) ან `Metric` (meter, კვადრატული მეტრი, კუბური მეტრი, მილიმეტრი) |
| `Project` | `name` = პროექტის სახელი |
| `Application` | სახელი CivilCraft, მწარმოებელი CadCraft |
| `CgPoints` / `CgPoint` | `name` = წერტილის ნომერი, `desc` = აღწერა, `code` = ჯგუფი; ტექსტი "N E Z" (ან "N E" სიმაღლის გარეშე) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ან ccw, `radius`, `length`, `staStart`, `chord`, `delta` (გრადუსებში), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | არსებული რელიეფი ტრასის გასწვრივ, როგორც სადგურისა და ნიშნულის წყვილები (`PntList2D`), გაყოფილი იქ, სადაც ის ტოვებს ზედაპირს |
| `Profile` / `ProfAlign` | დაგეგმარების პროფილი (სახელით "<ტრასა> design"): `PVI` ბოლოებისა და კუთხის წერტილებისთვის, `ParaCurve` `length`-ით ვერტიკალური მრუდებისთვის |
| `Surfaces` / `Surface` | `name` და `desc`; ჯერ არსებული რელიეფი, შემდეგ "Proposed", როცა ბაქნები ან კორიდორები ქმნიან დაგეგმილ რელიეფს |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (მხოლოდ არსებული რელიეფი) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (მხოლოდ არსებული რელიეფი, თუ არის) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` `id`-ით; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ან sanitary |
| `Struct` | `name`, `elevRim` (გამოყენებული ზღვარი, დაყენებული ან ზედაპირიდან), `elevSump`; `Center`; `CircStruct` `diameter`-ით; `Invert` `elev`-ით, `flowDir` in ან out, `refPipe`-ით |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` `diameter`-ით |
| `PlanFeatures` / `PlanFeature` | თითო მახასიათებელ ხაზზე: `name`; `CoordGeom` `Line`-ით (`length`, `Start`, `End`) და `Curve`-ით (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` და `End` როგორც "N E Z", `Center` როგორც "N E"); `Feature` `code="CivilCraft"`-ით, `Property` use-ით და closed |

არ ჩაიწერება: ბაქნები და კორიდორები როგორც ობიექტები (მათი შედეგი არის "Proposed" ზედაპირი), შეცდომიანი ტრასები, მილები ორივე ინვერტის გარეშე, ქსელის წესები.

## წაკითხული

| ელემენტი | რას იღებს CivilCraft |
|---|---|
| `Units` | `Imperial` ან `Metric` და მისი `linearUnit` განსაზღვრავს ფუტს ან მეტრს. უცნობი ერთეული აღინიშნება. |
| `Project` | `name` ხდება პროექტის სახელი. |
| `CgPoints` / `CgPoint` (ჩადგმულიც) | სახელი (ან `oID`), "N E" ან "N E Z", `desc` (ან `code`) როგორც აღწერა |
| `Surface` `Definition surfType="TIN"`-ით | `Pnts` და `Faces` როგორც არსებული რელიეფი (მხოლოდ პირველი ზედაპირი); უხილავი სახეები (`i="1"`) გამოტოვებულია |
| `SourceData` / `Breaklines` | 3D ზედაპირის ხაზები, ინახება ზედაპირთან ერთად |
| `SourceData` / `Boundaries` | გარე საზღვარი |
| `Alignment` / `CoordGeom` | `Line` და `Curve` ელემენტები; PI-ები აღდგენილი თითო მრუდის `PI`-დან ან მისი `Center`-იდან და ტანგენტებიდან; `staStart` |
| `Profile` / `ProfAlign` | `PVI` და `ParaCurve` (`length`-ით); პირველი დაგეგმარების პროფილი, მინიმუმ ორი PVI-ით |
| `PlanFeatures` / `PlanFeature` | თითო როგორც მახასიათებელი ხაზი: `Line`, `Curve` (მისი `Start`, `Center`, `End` და `rot`) და `IrregularLine` (`PntList3D` ან `PntList2D`), ბოლოდან ბოლომდე შეერთებული (ხარვეზი შეერთდება სწორი მონაკვეთით და აღინიშნება); დახურული, თუ ბოლოვდება იქ, სადაც დაიწყო; use და closed მხოლოდ CivilCraft-ის საკუთარი `Feature`-დან, სხვა შემთხვევაში **მხოლოდ დახაზული**. ელევაციის გარეშე წერტილები იღებენ 0-ს (აღინიშნება). |
| `Spiral` | კლოთოიდური სპირალები `Curve`-ის გვერდით (შესვლა და გასვლა; იკითხება როგორც PI რადიუსითა და სპირალის სიგრძეებით, უკან იწერება `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`-ით) |
| `PipeNetwork` | პირველი ქსელი, რომელსაც აქვს მილები: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` თითო მილზე) და `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## გამოტოვებული, და დასახელებული შენიშვნებში

- ზედაპირები პირველის შემდეგ, ბადის ზედაპირები და სხვა არა-TIN ზედაპირები
- ტრასები, რომლებიც შეიცავს `IrregularLine` ან `Chain` ელემენტებს, კლოთოიდის გარდა სხვა სპირალები, სპირალი ორ მრუდს შორის, ან ტრასები გეომეტრიის გარეშე
- დაგეგმარების პროფილები პირველის შემდეგ; `CircCurve` და `UnsymParaCurve` ვერტიკალური მრუდები (მათი PVI-ები შენარჩუნდება მრუდის გარეშე)
- წერტილები, რომლებიც მხოლოდ სხვა წერტილებს მიუთითებენ (`pntRef`), და წერტილები კითხვადი კოორდინატების გარეშე
- განმეორებადი წერტილის სახელები (შენარჩუნდება პირველი)
- დამალვის, ჩვენებისა და მონაცემთა ამოჭრის საზღვრები; ზედაპირის ხაზები 3D წერტილების გარეშე
- მილების ქსელები პირველის შემდეგ; ქსელის ტიპები, რომლებიც არ არის storm და sanitary (იკითხება როგორც storm)
- მართკუთხა, შემავალი და გამომავალი სტრუქტურები (იკითხება როგორც მრგვალი); კვერცხისებური, ელიფსური და ყუთის მილები და არხები (იკითხება როგორც მრგვალი მილები ზომის გარეშე)
- `Spiral` ელემენტები მახასიათებელ ხაზებში
- `Parcels`, `Roadways`, `GradeModel` და `Survey`

ფაილში არსებული რელიეფის პროფილები (`ProfSurf`) არ გამოიყენება: CivilCraft რელიეფის ნიმუშებს თავად ზედაპირიდან იღებს.

## შეტყობინებები, როცა ფაილი არ იხსნება

| შეტყობინება | მნიშვნელობა |
|---|---|
| "This is XML but not LandXML (its root element is <…>)." | ეს არის XML, მაგრამ არა LandXML (მისი ძირითადი ელემენტია <…>). |
| "… has no points, TIN surfaces or alignments CivilCraft can read." | ფაილის ყველაფერი გამოტოვებულ სიაშია. მის შემდეგ მოცემული შენიშვნები ამბობს, რა იყო იქ. |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" | ფაილი დაზიანებულია ან შეკვეცილია. |
