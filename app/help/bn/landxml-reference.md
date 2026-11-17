---
title: LandXML: কী পড়া ও লেখা হয়
summary: CivilCraft যে LandXML 1.2 এলিমেন্ট ও অ্যাট্রিবিউট পড়ে ও লেখে, এলিমেন্ট ধরে ধরে, এবং যা এড়িয়ে যায়।
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, ফিচার লাইন, schema
from: ca3cf359
---

CivilCraft LandXML 1.2 লেখে, অফিসিয়াল নেমস্পেস ও স্কিমা লোকেশনসহ। এটি যে কোনো ফাইল পড়ে যার রুট এলিমেন্ট `LandXML`, এবং নিচের এলিমেন্টগুলো নাম ধরে নেয় (নেমস্পেস প্রিফিক্স উপেক্ষা করা হয়; ভার্সন যাচাই করা হয় না)। এর XML রিডার শুধু পাঁচটি স্ট্যান্ডার্ড এনটিটি ও সংখ্যাসূচক ক্যারেক্টার রেফারেন্স গ্রহণ করে; এটি কখনো DTD বা বাইরের কোনো ফাইল লোড করে না। ধাপের জন্য দেখুন [LandXML বিনিময়](topic:landxml)।

LandXML স্থানাঙ্ক উত্তর-প্রথমে লেখে: একটি বিন্দু হলো "N E" বা "N E Z"।

## লেখা হয়

| এলিমেন্ট | CivilCraft যা লেখে |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, ক্ষেত্রফল বর্গফুটে, আয়তন ঘনগজে, ব্যাস ইঞ্চিতে) বা `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = প্রকল্পের নাম |
| `Application` | নাম CivilCraft, প্রস্তুতকারক CadCraft |
| `CgPoints` / `CgPoint` | `name` = বিন্দু নম্বর, `desc` = বিবরণ, `code` = গ্রুপ; টেক্সট "N E Z" (বা উচ্চতা ছাড়া "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw বা ccw, `radius`, `length`, `staStart`, `chord`, `delta` (ডিগ্রি), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | অ্যালাইনমেন্ট বরাবর বিদ্যমান ভূমি, স্টেশন ও এলিভেশন জোড়া হিসেবে (`PntList2D`), যেখানে সারফেস ছেড়ে যায় সেখানে ভাগ করা |
| `Profile` / `ProfAlign` | ডিজাইন প্রোফাইল (নাম "<alignment> design"): প্রান্ত ও কোণ বিন্দুর জন্য `PVI`, উল্লম্ব বক্রের জন্য `length`সহ `ParaCurve` |
| `Surfaces` / `Surface` | `name` ও `desc`; প্রথমে বিদ্যমান ভূমি, তারপর "Proposed" যখন প্যাড বা করিডর গ্রেড করে |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (শুধু বিদ্যমান ভূমি) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (শুধু বিদ্যমান ভূমি, থাকলে) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id`সহ `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm বা sanitary |
| `Struct` | `name`, `elevRim` (ব্যবহৃত রিম, সেট করা বা সারফেস থেকে), `elevSump`; `Center`; `diameter`সহ `CircStruct`; `elev`, `flowDir` in বা out, `refPipe`সহ `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter`সহ `CircPipe` |
| `PlanFeatures` / `PlanFeature` | প্রতি ফিচার লাইনে একটি: `name`; `Line` (`length`, `Start`, `End`) ও `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` ও `End` "N E Z" হিসেবে, `Center` "N E" হিসেবে) সহ `CoordGeom`; `Feature` `code="CivilCraft"`, `Property` ব্যবহার ও `closed` সহ |

লেখা হয় না: অবজেক্ট হিসেবে প্যাড ও করিডর (তাদের ফলাফল "Proposed" সারফেস), ত্রুটিযুক্ত অ্যালাইনমেন্ট, দুটি ইনভার্ট ছাড়া পাইপ, নেটওয়ার্ক নিয়ম।

## পড়া হয়

| এলিমেন্ট | CivilCraft যা নেয় |
|---|---|
| `Units` | `Imperial` বা `Metric` ও তার `linearUnit` ফুট না মিটার ঠিক করে। অজানা একক নোট করা হয়। |
| `Project` | `name` প্রকল্পের নাম হয়ে যায়। |
| `CgPoints` / `CgPoint` (ভেতরেও) | নাম (বা `oID`), "N E" বা "N E Z", `desc` (বা `code`) বিবরণ হিসেবে |
| `Definition surfType="TIN"`সহ `Surface` | `Pnts` ও `Faces` বিদ্যমান ভূমি হিসেবে (শুধু প্রথম সারফেস); অদৃশ্য ফেস (`i="1"`) বাদ দেওয়া হয় |
| `SourceData` / `Breaklines` | 3D ব্রেকলাইন, সারফেসের সাথে রাখা |
| `SourceData` / `Boundaries` | বাইরের সীমানা |
| `Alignment` / `CoordGeom` | `Line` ও `Curve` এলিমেন্ট; PI গুলো প্রতি কার্ভের `PI` থেকে, বা তার `Center` ও ট্যানজেন্ট থেকে পুনর্গঠিত; `staStart` |
| `Profile` / `ProfAlign` | `PVI` ও `ParaCurve` (`length`সহ); কমপক্ষে দুটি PVI থাকা প্রথম ডিজাইন প্রোফাইল |
| `PlanFeatures` / `PlanFeature` | প্রতিটি একটি ফিচার লাইন হিসেবে: `Line`, `Curve` (তার `Start`, `Center`, `End` ও `rot`) ও `IrregularLine` (`PntList3D` বা `PntList2D`) প্রান্ত থেকে প্রান্তে জোড়া (একটি ফাঁক সরল রেখা দিয়ে জোড়া হয় ও নোট করা হয়); যেখানে শুরু সেখানে শেষ হলে বন্ধ; ব্যবহার ও বন্ধ CivilCraft-এর নিজের `Feature` থেকে, নইলে **শুধু আঁকা**। এলিভেশন ছাড়া বিন্দু 0 পায় (নোট করা হয়)। |
| `Spiral` | `Curve`-এর পাশের ক্লোথয়েড স্পাইরাল (ভেতরে ও বাইরে; একটি PI হিসেবে ব্যাসার্ধ ও স্পাইরাল দৈর্ঘ্যসহ পড়া হয়, `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`সহ ফিরে লেখা হয়) |
| `PipeNetwork` | প্রথম যে নেটওয়ার্কে পাইপ আছে: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` ব্যাস, প্রতি পাইপের `Invert`) ও `Pipe` (`refStart`, `refEnd`, `CircPipe` ব্যাস) |

## এড়িয়ে যায়, নোটে নাম দেওয়া হয়

- প্রথমটির পরের সারফেস, গ্রিড সারফেস ও অন্য নন-TIN সারফেস
- `IrregularLine` বা `Chain` এলিমেন্ট ধারণকারী অ্যালাইনমেন্ট, ক্লোথয়েড ছাড়া স্পাইরাল, দুটি কার্ভের মাঝের স্পাইরাল, বা জ্যামিতি ছাড়া অ্যালাইনমেন্ট
- প্রথমটির পরের ডিজাইন প্রোফাইল; `CircCurve` ও `UnsymParaCurve` উল্লম্ব বক্র (তাদের PVI রাখা হয়, বক্র ছাড়া)
- অন্য বিন্দুকে শুধু উল্লেখ করা বিন্দু (`pntRef`), এবং পাঠযোগ্য স্থানাঙ্কহীন বিন্দু
- পুনরাবৃত্ত বিন্দুর নাম (প্রথমটি রাখা হয়)
- লুকানো, দেখানো ও ডেটা-ক্লিপ সীমানা; 3D বিন্দুহীন ব্রেকলাইন
- প্রথমটির পরের পাইপ নেটওয়ার্ক; storm ও sanitary ছাড়া অন্য নেটওয়ার্ক ধরন (storm হিসেবে পড়া হয়)
- আয়তক্ষেত্রাকার, ইনলেট ও আউটলেট স্ট্রাকচার (গোল হিসেবে পড়া হয়); ডিম্বাকার, উপবৃত্তাকার ও বাক্স আকৃতির পাইপ ও চ্যানেল (আকারহীন গোল পাইপ হিসেবে পড়া হয়)
- ফিচার লাইনে `Spiral` এলিমেন্ট
- `Parcels`, `Roadways`, `GradeModel` ও `Survey`

ফাইলের ভূমি প্রোফাইল (`ProfSurf`) ব্যবহার করা হয় না: CivilCraft ভূমির নমুনা সারফেস থেকেই নেয়।

## ফাইল না খুললে বার্তা

| বার্তা | অর্থ |
|---|---|
| "এটি XML, কিন্তু LandXML নয় (এর রুট এলিমেন্ট <…>)।" | ফাইলটি অন্য ধরনের XML। |
| "… এর মধ্যে CivilCraft পড়তে পারে এমন কোনো বিন্দু, TIN সারফেস বা অ্যালাইনমেন্ট নেই।" | ফাইলের সবকিছু এড়িয়ে যাওয়া তালিকায়। এর পরের নোটগুলো বলে কী ছিল। |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" | ফাইলটি নষ্ট বা মাঝপথে কাটা। |
