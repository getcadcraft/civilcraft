---
title: Kontrollet e linjave elektrike
summary: Çfarë kontrollon CivilCraft në çdo linjë dhe kabllo, gjithmonë i përditësuar: distancat e lira, hapësirat, lëkundjen, ngritjen, ngarkesat e mbajtëseve dhe përmasimin, pajisjet lidhëse, tirantët, themelet, të dhënat që mungojnë, lidhjet, mbingarkesat dhe rënien e tensionit.
keywords: kontrolle, distancë e lirë, distancë, pengesë, kalim, hapësirë fazash, lëkundje izolatori, ngritje, ngarkesë mbajtëse, ngarkesë nominale, përmasim, themel, tirant, guy, pajisje lidhëse, traversë, rënie tensioni, mbingarkesë, të dhëna që mungojnë, e shkëputur
from: e6a0da47
---

**Kontrollet** te seksioni Linjat elektrike liston çdo problem: të kuq për ato që dështojnë dhe portokalli për paralajmërimet. Kliko një të tillë për të përzgjedhur linjën, mbajtësen, kabllon ose pajisjen që ka të bëjë me të; mbajtëset dhe shtrirjet që dështojnë rrethohen me të kuq në planimetri ndërsa hapësira punuese është e hapur.

:::warning
Mjet projektimi: këto janë kontrolle të projektit tuaj sipas rregullave tuaja, jo certifikim.
:::

## Distancat e lira

Faza më e ulët e përçuesit ndiqet përgjatë çdo shtrirjeje në çdo rast ngarkese. Distanca e saj më e ulët mbi terren duhet të arrijë **Rregullën e distancës** të linjës. Ku një shtrirje kalon një **pengesë** (vizatuar me {{ui:Pengesë}}: një pikë ose një vijë, me lartësinë e saj mbi terren dhe rregullën e vet të distancës), distanca mbi majën e pengesës kontrollohet në të njëjtën mënyrë.

**Ajo që vendos hapësira e Peizazhit mbi terren gjithashtu llogaritet.** Bimët e vetme (kurora e tyre në përhapjen dhe lartësinë e pjekur), gjelbërimi dhe shtretërit e mbjelljes (speciet më të larta në to) dhe muret (maja e tyre) janë pengesa nën një linjë, pa u vizatuar sërish. Ato mbajnë rregullat e vendosura te {{ui:Rastet e ngarkesës dhe kufijtë…}}: **Bimët e peizazhit nën një linjë** (setet shembull përdorin *Pemët dhe bimët*, 3 m) dhe **Muret e peizazhit nën një linjë** (*Ndërtesë*); zgjidh **Pa kontrolluar** për t'i lënë jashtë. Distanca matet drejt e lart nga maja e bimës ose murit deri te përçuesi aty ku shtrirja kalon mbi të; distanca anash deri te një kurorë pranë linjës nuk kontrollohet. Lëvizja e një peme ose ngritja e një muri ndryshon kontrollet menjëherë.

Rregullat tuaja të distancës janë të tuajat. Hapi ato me **Rregullat…** pranë çdo **Rregulle distance** (ose {{ui:Rastet e ngarkesës dhe kufijtë…}}) për të shtuar, riemërtuar, ndryshuar ose hequr.

## Hapësirat dhe lëkundja

- **Hapësira e fazave** e nevojshme: k·√(shigjeta + gjatësia e izolatorit) + U/150, me shigjetën e rastit të nxehtë dhe tensionin U në kV (një formë e zakonshme; k është i grupit tuaj të rregullave). Krahasohet me hapësirën e fazave të traversës.
- **Lëkundja e izolatorit** te mbajtëset pezulluese, nën rastin e erës: atan(ngarkesa tërthore ÷ ngarkesa vertikale), krahasuar me lëkundjen më të madhe të grupit të rregullave.
- **Ngritja**: një mbajtëse pezulluese më e ulët se fqinjët e saj mund të tërhiqet lart në të ftohtë; shënohet.

## Ngarkesat e mbajtëseve dhe përmasimi

Për çdo mbajtëse dhe rast ngarkese, me çdo përçues të linjës:

- **Tërthore**: era për metër × gjatësia e erës (gjysma e dy shtrirjeve), plus 2·H·sin(kthesa ÷ 2) në një kthesë.
- **Përgjatë linjës**: diferenca e tensioneve të dy anëve në një mbajtëse fundore ose këndore; te një mbajtëse pezulluese vetëm nën akull në njërën anë (çdo shtrirje punohet veç e veç, që gabon nga ana e sigurisë).
- **Vertikale**: ngarkesa vertikale për metër × gjatësia e peshës (ndërmjet pikave më të ulëta nga të dyja anët) plus pajisjet.

Ngarkesa horizontale çohet te pika nominale e mbajtëses (ngarkesa ekuivalente = ngarkesa × lartësia e bashkimit ÷ lartësia e pikës nominale) dhe krahasohet me **ngarkesën nominale** të saj × faktorin e grupit të rregullave. Kur është shumë e dobët, sugjerohet mbajtësja më e vogël e të njëjtit material në bibliotekën tuaj që e mban. Një mbajtëse me **tirant** ia kalon ngarkesën horizontale tirantit, i cili mban ngarkesë ÷ sin(këndi i tirantit) dhe kontrollohet me vlerësimin e vet.

Pajisjet lidhëse (kllapa, izolatorë, traversa) kontrollohen me ngarkesën e tyre të vlerësuar: një pajisje ankorimi mban tensionin e përçuesit, një pajisje pezulluese pjesën e vet të ngarkesës vertikale dhe tërthore. **Themeli** që shfaqet është thellësia e mbajtëses në tokë dhe një gropë pak më e gjerë se këmba e saj.

## Të dhënat, lidhjet dhe rryma

- Një artikull me një fushë të nevojshme bosh, ose një çelës që nuk është në bibliotekë.
- Një skaj i një rruge kablli, ose një pajisje, i lidhur me asgjë.
- **Rënia e tensionit** dhe **rryma** nga çdo burim (pajisja e shënuar si burim) te ngarkesat (kW dhe faktori i fuqisë te pajisja), përgjatë shtrirjeve ajrore dhe kabllove: √3·I·L·(R cos φ + X sin φ), me R në 20 °C. Më shumë se vlerësimi i rrymës së kabllos, ose më shumë rënie se sa lejon grupi i rregullave, shënohet.
