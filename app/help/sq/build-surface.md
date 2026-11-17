---
title: Ndërto dhe rafino sipërfaqen
summary: Si e triangulon CivilCraft terrenin ekzistues dhe si e formon me grupe vijash thyerjeje, vija thyerjeje të vizatuara, një kufi të jashtëm dhe skajin më të gjatë të jashtëm.
keywords: tin, sipërfaqe, triangulim, vijë thyerjeje, kufi, terren ekzistues, eg, krijo sipërfaqe, delaunay, trekëndësha, skaj maksimal, kufi i jashtëm
from: b9eea3f3
---

CivilCraft ka një sipërfaqe terreni ekzistues për projekt. Është një TIN (rrjet i parregullt i triangulluar) i ndërtuar nga pikat e tua, dhe rindërtohet automatikisht sa herë ndryshon një hyrje. Nuk ka komandë "rindërto" dhe nuk ka sipërfaqe të vjetëruar.

## Çfarë hyn në sipërfaqe

- Çdo pikë me kotë në një grup të vendosur te {{ui:Pikat}}.
- Çdo grup i vendosur te {{ui:Vijë thyerjeje}}, i lidhur sipas numrit të pikës.
- Çdo vijë thyerjeje që vizaton me veglën {{ui:Vijë thyerjeje}}.
- Kufiri i jashtëm, nëse vizaton një.
- Cilësimi **Skaji më i gjatë i jashtëm**.

Trekëndëshat nuk kalojnë kurrë një vijë thyerjeje: sipërfaqja detyrohet ta ndjekë, pastaj bëhet sa më e rregullt rreth saj (Delaunay kudo tjetër).

## Bëj vija të kodifikuara në vija thyerjeje

1. Në panelin e majtë, nën **Pikat**, gjej grupin (për shembull FL).
2. Vendos zgjedhjen e tij **Sipërfaqja** në {{ui:Vijë thyerjeje}}.
   Sipërfaqja rindërtohet, vija vizatohet me portokalli (me {{ui:Vijat e thyerjes}} të ndezur nën **Shfaqja**), dhe **Vijat e thyerjes** te faktet e sipërfaqes rritet me një.
3. Kontrollo vijën në plan. Duhet të kalojë nga pika në pikë, sipas radhës në të cilën u mat vija. Nëse bën zig-zag, grupi mban më shumë se një vijë, ose pikat nuk janë numëruar me radhë: kthe grupin te {{ui:Pikat}} dhe vizato vijat me dorë (seksioni tjetër).

## Vizato një vijë thyerjeje nëpër pika

1. Shtyp {{key:B}}, ose kliko {{ui:Vijë thyerjeje}} në grupin **Sipërfaqja**.
   Shenja thotë "Vijë thyerjeje: kliko pikat e matjes me radhë (merr kotat e tyre). Enter përfundon."
2. Lëvize treguesin afër një pike. Një katror i vogël portokalli shënon pikën që do të marrë.
3. Kliko pikat e vijës njëra pas tjetrës. Çdo klikim e emëron pikën dhe kotën e saj në shiritin e gjendjes.
4. Shtyp {{key:Enter}} për të përfunduar.
   Shiriti i gjendjes thotë "Vijë thyerjeje 1 u shtua; sipërfaqja u rindërtua."

Klikimet duhet të bien mbi një pikë matjeje që ka kotë; një klikim gjetkë refuzohet me "Kliko një pikë matjeje me kotë: një vijë thyerjeje merr kotat e pikave." {{key:Backspace}} heq pikën e fundit; {{key:Esc}} anulon gjithë vijën.

:::warning
Përfundo me {{key:Enter}}. Klikimi i dyfishtë gjithashtu përfundon, por në këtë version heq pikën ku klikove dy herë. Kliko pikën e fundit një herë, pastaj shtyp {{key:Enter}}.
:::

Për të hequr menjëherë çdo vijë thyerjeje të vizatuar, kliko {{ui:Hiq vijat e thyerjes të vizatuara}} në seksionin **Sipërfaqja**. Për të hequr vetëm të fundit, përdor {{key:Mod+Z}}. Vijat e vizatuara nuk mund të zgjidhen ose redaktohen një nga një ende.

## Vizato kufirin e jashtëm

Një kufi e pret sipërfaqen në zonën që beson, për shembull kufijtë e matjes, në mënyrë që trekëndëshat e gjatë nëpër qoshe të pamatura të zhduken.

1. Shtyp {{key:O}}, ose kliko {{ui:Kufi}}.
2. Kliko qoshet me radhë rreth zonës. Një vijë me pika tregon formën.
3. Shtyp {{key:Enter}}.
   Shiriti i gjendjes thotë "Kufiri u vendos; trekëndëshat jashtë tij u zhdukën." **Kufi** te faktet e sipërfaqes thotë "Po" dhe numrin e qoshave.

Gjërat që duhet t'i dish:

- Ka një kufi të vetëm. Vizatimi i një tjetri e zëvendëson. {{ui:Hiq kufirin}} e heq.
- Mund vetëm të heqë: një kufi që shkon përtej pikave prritet mbrapsht në konturin e tyre, me shënimin "Kufiri shkon përtej pikave; u pre mbrapsht në konturin e tyre."
- Qoshet e tij marrin kotat nga sipërfaqja, kështu që skaji ndjek terrenin saktë.
- Kufijtë e fshehur (të brendshëm) nuk janë ende të disponueshëm.

## Pri trekëndëshat e gjatë të jashtëm

Pa kufi, sipërfaqja mbush gjithë konturin e pikave, përfshirë trekëndëshat e gjatë e të hollë nëpër skaje konkave.

1. Te **Sipërfaqja**, shkruaj një gjatësi te **Skaji më i gjatë i jashtëm** dhe shtyp {{key:Enter}}. Fillo me rreth dy ose tre herë distancën tipike midis matjeve.
2. Trekëndëshat e jashtëm, skaji i jashtëm i të cilëve është më i gjatë se kjo, hiqen, duke punuar drejt brendshit derisa çdo skaj i jashtëm të jetë mjaft i shkurtër. Një skaj që është vijë thyerjeje nuk hiqet kurrë.
3. Shkruaj 0 për t'i mbajtur përsëri të gjithë trekëndëshat.

## Lexo raportin e sipërfaqes

Nën faktet e sipërfaqes, një kuti liston atë që bëri ndërtuesi. Me një shirit okër në të majtë është informacion; me një shirit të kuq përmban një gabim dhe nuk ka sipërfaqe.

| Mesazhi | Kuptimi |
|---|---|
| "3 pika ishin në të njëjtin vend me një tjetër dhe u bashkuan me të." | Pikat më afër se 0.0001 në plan u bënë një kulm (e para u mbajt). |
| "2 vende kanë dy kota të ndryshme …" | Pikat mbi njëra-tjetrën, ose vijat e thyerjes që kryqëzohen, nuk pajtohen në lartësi. Kota e vijës së thyerjes fiton, pastaj e para. |
| "1 copë vije thyerjeje nuk mund të detyrohej në sipërfaqe." | Një copë shumë e shkurtër ose pothuajse e mbivendosur nuk u përshtat; kontrollo atë vend. |
| "Një sipërfaqe ka nevojë për të paktën tri pika me kota." | Pak pika: kontrollo radhën e kolonave dhe grupet. |
| "Pikat janë të gjitha në një vijë: asnjë trekëndësh." | Pikat nuk kanë gjerësi, për shembull një vijë e vetme poligonale. |
| "Kufiri nuk mbivendoset me pikat." | Kufiri është diku tjetër, shpesh një përzierje njësish ose koordinatash. |
| "Asnjë trekëndësh nuk ka mbetur brenda kufirit." | Kufiri është shumë i vogël ose i vendosur gabim. |

## Një sipërfaqe e lexuar nga LandXML

Kur hap LandXML, sipërfaqja e parë TIN e tij përdoret siç është: titulli **Sipërfaqja** thotë "Surface (from LandXML)", dhe **Skaji më i gjatë i jashtëm** është i çaktivizuar. Ndërsa kjo sipërfaqe është në përdorim, grupet e vijave të thyerjes, vijat e vizatuara dhe një kufi i ri nuk e ndryshojnë. Për ta ndërtuar sipërfaqen nga pikat e skedarit, kliko {{ui:Ndërto përsëri sipërfaqen nga pikat}}. {{key:Mod+Z}} e kthen sipërfaqen LandXML.

## Lidhur

- [Lexo konturet, kotat dhe pjerrësitë](topic:contours).
- [Importo pikat e matjes](topic:import-points).
