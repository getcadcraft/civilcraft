---
title: Aia kavandamine algusest lõpuni
summary: Maastikuarhitekti kümme sammu mõõdistusest väljastatud komplektini, koos sellega, mida haljastuse tööruum iga sammu jaoks praegu teeb ja mida ta veel ei tee.
keywords: õpetus, läbikäik, kuidas, haljastuse kavandamine, aia kavandamine, alustamine, näide, näidis, samm-sammult, mõõdistus, jooned, maapind, alad, istutus, loend, lehed, väljastamine, üks projekt
from: 87900bf5
---

Haljastuse kavandamine käib ringi: mõõdistus, visand, jooned, maapind, alad, kõrgused, istutus, loendid, lehed ja jälle tagasi. Need on kümme sammu koos sellega, mis iga sammu jaoks olemas on. Kus sammul on lünk, on see nimetatud lõpus jaotises **Pole veel valmis** ega ole peidetud sammu sisse.

Võid järgida näidisobjekti või oma mõõdistusjoonist. Oma joonisega alusta sammust 1.

## 1. Too mõõdistus sisse

{{ui:Pind}} › {{ui:Jooned joonisest…}}, vali mõõdistusjoonis (DWG 2000–2018 või DXF). Kontrolli ühikuid, võta pinna jaoks samakõrgusjooned, 3D-polüjooned ja piir ning punktiplokid mõõdistuspunktidena. Jaotis **Mõõdistuse kõrgused ja kontroll** loeb tekstina või atribuudina kirjutatud kõrgused ja loetleb, mis tundub valesti (ühikud, koordinaatsüsteem, kaugus nullist, lamedad samakõrgusjooned, kummalised kõrgused, topeltpunktid), enne kui midagi lisad. Vaata [Kontrolli mõõdistusjoonist importimisel](topic:survey-check) ja [Ava DWG või DXF joonestikuna](topic:open-dwg-dxf). Määra koordinaatsüsteem käsuga {{ui:Koordinaatsüsteem…}}.

## 2. Käsitsi visandid

Paberil olev leht, näiteks vana mõõdistus või märgitud väljatrükk, tuleb sisse käsuga {{ui:Skaneeri…}} (Alusta skaneeringust): see paigutatakse mõõtkavas või tuntud koordinaatidele plaani alla ning seda saab jälgida joonestikuks. ModelCraft loeb käsitsi visandi foto (Fail › Impordi visandi foto…). CivilCraftil endal ei ole käsitsi visandi vahendit: paiguta leht plaani alla ja joonista selle peale.

## 3. Visandist joonesteks

Joonista CivilCraftis mõõdistuse kohale tunnusjooned ja kontuurid või joonista need 2D-joonisel. Haljastus › Veel › {{ui:Joonest}} muudab joone sillutiseks, istutusalaks, seinaks, astmeteks, tunnusjooneks ja muuks, seotuna: liiguta joont ja objekt liigub kaasa. Vaata [Joonestikust pärit objektid](topic:objects-from-lines). Programmis SuperCad Studio ava objekt, joonis ja hoone mudel ühes projektis: **Haljastuse tööruumis** on kõigi nende tööriistad ning 2D-joonisel valitud joon võib saada haljastuse objektiks, mis seda järgib (Ctrl+K, {{ui:Haljastuse objekt valitud joonisjoonest}}).

## 4. Projekteeritud maapind

Ava {{ui:Pind}} › {{ui:Veel}} › {{ui:Haljastuse tööruum}}. Koosta projekteeritud maapind käskudega {{ui:Platvorm}}, {{ui:Vall}}, {{ui:Kraav}} ja vertikaalplaneerimisalad punktkõrguste ja samakõrgusjoontega. Sillutis, rajad, seinad, kaldteed ja astmed, mida lisad, liituvad samasse projekteeritud pinda. Olemasolev maapind ei muutu kunagi. {{ui:Kõrgused}} › {{ui:Maapinna muutjad…}} loetleb kõik, mis maapinda kujundab, ühes järjekorras, koos iga objekti kaevamise ja täitmisega. Vaata [Vertikaalplaneerimine](topic:landscape-grading) ja [Maapinna muutjad ja elavad kõrgused](topic:ground-modifiers).

## 5. Sillutis ja istutusalad

{{ui:Kõvad pinnad}} › {{ui:Sillutis}}, {{ui:Rada}}, {{ui:Sein}}, {{ui:Äärekivi}}, {{ui:Kaldtee}} ja {{ui:Trepp}}. {{ui:Alad}} joonistab muru, istutusala, niidu või katteaia koos konstruktsiooniga; ala lõikab end ise ümber sillutise, seinte ja astmete. {{ui:Istutusala}} täidab ala taimede vahega taimesegust. Vaata [Kõvad pinnad](topic:hardscape), [Istutatud alad](topic:planted-areas) ja [Istutus](topic:planting).

## 6. Kõrgused, kalded ja ühenduskohad

Jaotises **Vertikaalplaneerimise kontrollid** märgi **Kalde analüüs** ja **Voolunoolted ja veelompimine**. Kui vesi jääb terrassi vastu seisma, lisa selle ümber {{ui:Kraav}}. Omadused näitavad, mitu tõusu astmed vajavad ja kas need mahuvad, ning kus rada on oma piirist järsem. Probleemide paneel loetleb kohad, kus objektid halvasti kokku puutuvad: sein on liiga kõrge, istutusala on sillutisest kõrgemal, astmed ei jõua oma podestini. {{ui:Punktkõrgus}} ja {{ui:Kaldenool}} märgivad maapinna ja uuenevad ise.

## 7. Istutus

Jaotises **Taimed** otsi taimenimekirjast (mõni sada liiki või sinu oma loend), vali üks ja {{ui:Taim}}, {{ui:Istutusala}} või {{ui:Hekk}}. Määra taime suurus ja sildid menüüst Veel. Veel › {{ui:Taimetabel}} muudab sinu enda kirjeid: sordid, tarnitavad suurused, tihedus, spetsifikatsiooni märkused. Igal kirjel võib olla sinu oma sümbol ja 3D-mudel (OBJ, STL või GLB) ning Veel › {{ui:Taimede graafika}} joonistab taimed suuremates mõõtkavades lihtsamalt. Vaata [Taimenimekiri](topic:plant-list), [Taimekirjed](topic:plant-records) ja [Taimede graafika](topic:plant-graphics).

## 8. Kogused ja loendid

Veel › {{ui:Töölehed}}: taimede ja kõvade pindade loendid ning sinu enda omad jäävad objektidega seotuks; salvesta need CSV- või XLSX-vormingus või pane lehtedele (vt [Töölehed](topic:worksheets)). Veel › {{ui:Taimeloend…}} saadab kogused TakeoffCraftile. Kõvade pindade kogused on sillutise, seinte ja astmete omadustes. Niisutusel on oma materjalinimekiri: {{ui:Niisutus}} › **Kontrolli süsteemi…**. Vaata [Niisutus](topic:irrigation).

## 9. Joonised ja lehed

Veel › {{ui:Haljastuslehed…}}: istutus-, vertikaalplaneerimis- ja niisutusplaanid koos detailidega. {{ui:Kõrgused}} › {{ui:Lõikejoon}} joonistab lõiked läbi maapinna, seinte, konstruktsioonide, astmete ja taimede. Vaata [Haljastuslehed](topic:landscape-sheets) ja [Lõiked ja väljastuskomplekt](topic:landscape-sections).

## 10. Väljasta

{{ui:Väljastuskomplekt (.zip)}} dialoogis Lehed teeb ühe PDF-i lehtede loendiga ja DWG iga lehe kohta. Veel › {{ui:Ekspordi haljastuse IFC}} annab BimCraftile taimed ja kõvad pinnad. Salvesta projekt: kõik on ühes failis.

## Muuda üks asi: trepp

Mõte kõige hoidmisel ühes projektis on see, et muudatus kandub edasi. Proovi seda astmetega kahe terrassi vahel:

1. Joonista astmete joon tunnusjoonena (või joonisel joonena), seejärel Haljastus › Veel › {{ui:Joonest}} › {{ui:Trepp}}. Astmete omadustes märgi **Kujundab maapinda** ja määra alumine ning ülemine kõrgus kahe terrassi järgi.
2. Joonista astmete kõrvale ja alla istutusala käsuga {{ui:Alad}} ning sillutis terrassidele. Istutusala lõikab end ise astmete ja sillutise ümber ning taimeloend loeb ainult istutatud taimi.
3. Tõsta astmete ülemist kõrgust omadustes. Projekteeritud maapind, punktkõrgused, kaldenoolted ning kaevamine ja täitmine muutuvad kohe. Kui trepp enam ei jõua ülemise terrassini, ütleb Probleemide paneel, kui palju.
4. Liiguta astmete joont. Astmed järgivad oma joont samas tagasivõtmise sammus; istutusala lõigatakse uuesti ja loetakse uuesti ning töölehed ja loendid näitavad uusi numbreid.
5. Vajuta üks kord Ctrl+Z: joon, astmed, maapind ja istutusala lähevad koos tagasi.

Vaata [Maapinna muutjad ja elavad kõrgused](topic:ground-modifiers), [Istutatud alad](topic:planted-areas) ja [Töölehed](topic:worksheets).

## Pole veel valmis

Neid on küsitud, kuid need ei ole selles versioonis:

- seinad, mis kujundavad maapinda (nad näitavad, kus nad maapinnaga kohtuvad, ja nende ülaosa saab sellele järgneda);
- oma teegi taimenimekirja muutmine rakenduses (muuda projekti loendit ja salvesta see taimefailina);
- oma GLB-taimemudelite tekstuurid ja värvid (kuju loetakse, taime värvi kasutatakse).

Vaata [Haljastuse tööruum](topic:landscape) kõigi tööriistade kohta.
