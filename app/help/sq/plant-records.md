---
title: Regjistrimet e bimëve, kultivarët dhe madhësitë e furnizimit
summary: Lista e bimëve e projektit tuaj si tabelë: kultivarët, madhësitë e furnizimit (enë, rrënjë me dhe, gjerësi trungu, trung i pastër), dendësia, shënimet e specifikimit, CSV hyrëse dhe dalëse; çdo bimë e vendosur emëron një madhësi; simbolet e bimëve sipas shkallës dhe simbolet dhe modelet 3D tuaja.
keywords: tabela e bimëve, baza e bimëve, kultivar, varietet, madhësi furnizimi, enë, rrënjë me dhe, rootball, rrënjë e zhveshur, gjerësi trungu, trung i pastër, dendësi, bimë për metër katror, specifikim, shënime specifikimi, simbol bime, bllok, simboli im, bimë 3d, nivel detaji, shkallë
from: 12251beb
---

Hapni {{ui:Tabela e bimëve}} nga menuja {{ui:Më shumë}} e grupit Peizazh, ose nga seksioni Bimët. Çdo rresht është një regjistrim bime në listën e vetë këtij projekti (një regjistrim nga lista e bimëve kopjohet kur e shtoni). Çdo redaktim kontrollohet ashtu si një skedar i importuar, dhe është një hap zhbërjeje.

## Kolonat

- **Emri botanik**, **Emri i zakonshëm**, **Lloji**, **Lartësia** dhe **Përhapja** në pjekuri (metra).
- **Distanca** (nga qendra në qendër) ose **Dendësia** (bimë për m²). Një shtrat i një regjistrimi me dendësi dhe pa distancë mbushet me atë dendësi, sipas modelit të vet (trekëndor ose katror).
- **Madhësitë e furnizimit**: një hyrje për çdo madhësi, të ndara me `;`. Çdo hyrje është një id, një lloj (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) dhe pastaj çdo nga: një vëllim `10L`, një lartësi `h0.6`, një përhapje `s0.4`, një gjerësi trungu `g14-16` (cm), një trung i pastër `st1.8`. Shembull: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Kultivarët**: emra të ndarë me `;`. Një kultivar mban madhësitë dhe shënimet e veta kur skedari që keni importuar i kishte.
- **Shënimet e specifikimit**.

{{ui:Dublo}} kopjon një rresht me një çelës të ri; {{ui:Ruaj si CSV}} dhe {{ui:Ruaje si skedar bimësh}} e shkruajnë listën (rreshtat CSV për kultivarët ndodhen nën specien e tyre, me `cultivar_of`). Importimi i një CSV-je ose skedari bimësh e bashkon atë me listën.

## Lista juaj e bibliotekës së bimëve

Hyni në llogarinë tuaj CadCraft (Cilësimet, Shtojcat e tua, Hyr) dhe tabela e bimëve mund të përdorë listën që mbani në Bibliotekë:

- {{ui:Nga lista ime e Bibliotekës}} sjell artikujt tuaj të bimëve (përfshirë ata që ende presin shqyrtim). Një bimë që keni tashmë këtu përditësohet nga Biblioteka; kultivarët, madhësitë e furnizimit, dendësia dhe specifikimi që keni shtuar këtu ruhen.
- {{ui:Ruaj si listë bimësh}} ruan çdo rresht si artikull bime të Bibliotekës suaj, një artikull për specie: një bimë e re është një artikull i ri, një bimë e ndryshuar është një version i ri, një e pandryshuar lihet ashtu. Shënoni kutinë më parë: ruajtja i jep bimët publikut sipas CC0. Një ngarkim i parë publik nga një person që nuk është ende i besuar kontrollohet nga një person para se të shfaqet, si çdo ngarkim.

Biblioteka mban regjistrimin bazë të bimës. Kultivarët, madhësitë e furnizimit, dendësia dhe shënimet e specifikimit qëndrojnë në projekt dhe në skedarin e bimëve ({{ui:Ruaje si skedar bimësh}}); dialogu tregon sa rreshta prek çdo herë që ruani.

## Një bimë e vendosur emëron një madhësi

Zgjidhni një bimë, një gardh ose një rresht përzierjeje të një shtrati ose sipërfaqeje të mbjellë: kur regjistrimi ka kultivarë ose madhësi furnizimi, {{ui:Kultivari dhe madhësia}} zgjedh një. Tabela e bimëve numëron pastaj sipas specieve, kultivarit dhe madhësisë, dhe një etiketë mund t'i shfaqë ato: `{botanical} '{cultivar}' {size}` ose `{full}`.

## Simbolet e bimëve sipas shkallës

{{ui:Grafika e bimëve}} (Peizazh › Më shumë) cakton si vizatohen bimët në plan: **automatike** (më e trashë se 1:500 një rreth me përhapjen, midis 1:200 dhe 1:500 një kontur me qendrën, më e hollë simboli i detajuar; të dy shkallët mund të ndryshohen) ose një nivel për çdo shkallë. Dialogu i Fletëve ka **Detajin e bimës në plan** të vet për atë grup.

Te një regjistrim në seksionin Bimët, {{ui:Simboli i vet…}} lexon një SVG, ose një bllok të një vizatimi DXF/DWG, dhe e vizaton me përhapjen e bimës në nivelin e detajuar. {{ui:Modeli i vet 3D…}} lexon një OBJ, STL ose GLB; te Grafika e bimëve zgjidhni **Modeli i secilit regjistrim** për ta parë në 3D. Skedarët kanë kufij (512 KB SVG, 2000 forma, 50 000 trekëndësha) dhe mbahen në projekt. Transformimet e SVG-së nuk aplikohen (lajmëroheni kur një skedar i ka). Shih [Grafika e bimëve, simbolet tuaja dhe bimët 3D](topic:plant-graphics) për nivelet, kufijtë dhe çfarë mund të mbajë një GLB.
