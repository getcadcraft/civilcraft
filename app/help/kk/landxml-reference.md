---
title: LandXML: оқылатыны мен жазылатыны
summary: CivilCraft оқитын және жазатын LandXML 1.2 элементтері мен атрибуттары, элемент-элемент бойынша, және ол өткізіп жіберетіннің бәрі.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, сипаттамалық сызық, схема
from: ca3cf359
---

CivilCraft LandXML 1.2-ні ресми атаулар кеңістігімен және схема орнымен жазады. Ол түбірлік элементі `LandXML` болатын кез келген файлды оқиды және төмендегі элементтерді атымен алады (атау кеңістігінің префикстері елемейді; нұсқасы тексерілмейді). Оның XML оқушысы тек бес стандартты анықтамалық таңбаны және сандық таңба сілтемелерін қабылдайды; ол DTD немесе сыртқы файлды ешқашан жүктемейді. Қадамдар үшін қараңыз: [LandXML алмасу](topic:landxml).

LandXML координаттарды алдымен солтүстік (N) бойынша жазады: нүкте "N E" немесе "N E Z" түрінде болады.

## Жазылады

| Элемент | CivilCraft не жазады |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, аудандар шаршы футта, көлемдер текше ярдта, диаметрлер дюймде) немесе `Metric` (метр, шаршы метр, текше метр, миллиметр) |
| `Project` | `name` = жоба атауы |
| `Application` | атауы CivilCraft, өндіруші CadCraft |
| `CgPoints` / `CgPoint` | `name` = нүкте нөмірі, `desc` = сипаттама, `code` = топ; мәтіні "N E Z" (немесе биіктіксіз "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw немесе ccw, `radius`, `length`, `staStart`, `chord`, `delta` (градуспен), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | трасса бойындағы бар жер бедері, станция мен биіктік жұптары ретінде (`PntList2D`), беттен шыққан жерінде бөлінеді |
| `Profile` / `ProfAlign` | жобалық профиль (атауы "<трасса> design"): шеттер мен бұрыш нүктелері үшін `PVI`, тік қисықтар үшін `length` бар `ParaCurve` |
| `Surfaces` / `Surface` | `name` және `desc`; алдымен бар жер бедері, ал алаңдар немесе дәліздер тік жоспарланғанда "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (тек бар жер бедері) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (тек бар жер бедері, болса) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id`-мен `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm немесе sanitary |
| `Struct` | `name`, `elevRim` (қолданылған жиек: орнатылған немесе беттен алынған), `elevSump`; `Center`; `diameter`-мен `CircStruct`; `elev`, `flowDir` in немесе out, `refPipe`-мен `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter`-мен `CircPipe` |
| `PlanFeatures` / `PlanFeature` | сипаттамалық сызық сайын бір: `name`; `Line` (`length`, `Start`, `End`) және `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` мен `End` "N E Z", `Center` "N E" ретінде) бар `CoordGeom`; `Property` қолданысы мен closed бар `Feature` `code="CivilCraft"` |

Жазылмайды: объект ретіндегі алаңдар мен дәліздер (нәтижесі "Proposed" бетінде), қателері бар трассалар, екі инверті жоқ құбырлар, желі ережелері.

## Оқылады

| Элемент | CivilCraft не алады |
|---|---|
| `Units` | `Imperial` немесе `Metric` және оның `linearUnit` фут немесе метр екенін анықтайды. Белгісіз өлшем бірлігі ескертіледі. |
| `Project` | `name` жоба атауына айналады. |
| `CgPoints` / `CgPoint` (ішкі де) | атауы (немесе `oID`), "N E" немесе "N E Z", сипаттама ретінде `desc` (немесе `code`) |
| `Surface` `Definition surfType="TIN"`-пен | `Pnts` және `Faces` бар бар жер бедері (тек бірінші бет); көрінбейтін жақтар (`i="1"`) алынып тасталады |
| `SourceData` / `Breaklines` | 3D сынық сызықтар, бетпен бірге сақталады |
| `SourceData` / `Boundaries` | сыртқы шекара |
| `Alignment` / `CoordGeom` | `Line` және `Curve` элементтері; PI-лар әр қисықтың `PI`-нан немесе оның `Center` және жанамаларынан қайта құрылады; `staStart` |
| `Profile` / `ProfAlign` | `PVI` және `ParaCurve` (`length`-пен); кемінде екі PVI бар бірінші жобалық профиль |
| `PlanFeatures` / `PlanFeature` | әрқайсысы сипаттамалық сызық ретінде: `Line`, `Curve` (оның `Start`, `Center`, `End` және `rot`) және `IrregularLine` (`PntList3D` немесе `PntList2D`), ұшы-ұшына қосылған (олқылық түзу кесіндімен қосылады және ескертіледі); басталған жерінде аяқталса жабық; `use` және `closed` CivilCraft-тың өз `Feature`-інен, әйтпесе **Тек сызылған** |
| `Spiral` | `Curve`-дің жанындағы клотоидалық спиральдар (кіріс және шығыс; радиусы мен спираль ұзындықтары бар PI ретінде оқылады, `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` арқылы кері жазылады) |
| `PipeNetwork` | құбырлары бар бірінші желі: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, құбыр сайын `Invert`) және `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

Биіктігі жоқ нүктелерге 0 беріледі (ескертіледі).

## Өткізіп жіберілген, ескертпелерде аталады

- Бірінші беттен кейінгі беттер, тор беттері және TIN емес басқа беттер
- `IrregularLine` немесе `Chain` элементтері бар трассалар, клотоидадан басқа спиральдар, екі қисық арасындағы спираль, немесе геометриясы жоқ трассалар
- Бірінші жобалық профильден кейінгілер; `CircCurve` және `UnsymParaCurve` тік қисықтар (олардың PVI-лері қисықсыз сақталады)
- Басқа нүктелерге ғана сілтейтін нүктелер (`pntRef`), және оқуға болатын координаттары жоқ нүктелер
- Қайталанған нүкте атаулары (бірінші сақталады)
- Жасыру, көрсету және деректерді қию шекаралары; 3D нүктелері жоқ сынық сызықтар
- Бірінші желіден кейінгі құбыр желілері; storm және sanitary-ден басқа желі түрлері (storm ретінде оқылады)
- Тік бұрышты, кіріс және шығыс құрылымдар (дөңгелек ретінде оқылады); жұмыртқа, эллипс және қорап тәрізді құбырлар мен арналар (өлшемсіз дөңгелек құбырлар ретінде оқылады)
- Жоспар сипаттамаларындағы `Spiral` элементтері
- `Parcels`, `Roadways`, `GradeModel` және `Survey`

Файлдағы жер профильдері (`ProfSurf`) пайдаланылмайды: CivilCraft жер бедерін беттің өзінен алады.

## Файл ашылмаған кездегі хабарламалар

| Хабарлама | Мағынасы |
|---|---|
| "Бұл XML, бірақ LandXML емес (түбірлік элементі <…>)." | Файл басқа XML түрі. |
| "… CivilCraft оқи алатын нүктелері, TIN беттері немесе трассалары жоқ." | Файлдағы барлығы өткізіп жіберілгендер тізімінде. Соның ішінде не бар екенін одан кейінгі ескертпелер айтады. |
| "Жабылу тегі сәйкес келмейді …", "Жабылмаған тег …", "Файл … ішінде аяқталады" | Файл бүлінген немесе қысқартылған. |
