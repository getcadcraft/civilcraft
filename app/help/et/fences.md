---
title: Aiad
summary: Aed mööda joont, kinnistut või alust: postid, liistud, paneelid või latid, väravad, maapinnal kaldus või astmeline, loend, plaanisümbolid ja IFC-elemendid. Saadaval ka assistendile.
keywords: aed, postid, liistud, paneelid, latid, värav, kaldus, astmeline, maastik, loend, ifc, piirdeaed, piir
from: c0e7b84a
---

Tee aed mööda joont, trassi, kinnistut või alust, postid ja väravad paigutatakse sinu eest.

## Aia tegemine

1. Vali joon, kinnistu või alus.
2. Ava **Pind, Veel, Aiad...**
3. Vali stiil (paneelid, liistud või latid), kaldus või astmeline, kõrgus, postide vahe ja värava laius ning seejärel **Aed valiku ümber** või **Väravaga**, et panna värav kõige pikema sirge lõigu keskele.

Postid asetatakse otstesse, igasse nurka (tipp, mis pöördub vähemalt 20 kraadi), iga värava mõlemasse serva ja nende vahele võrdsete lahtriteni, ükski pikem kui vahe. **Kaldus** paneelid järgivad maapinda nende postide vahel. **Astmelised** paneelid jäävad tasaseks ja astuvad postide juures; tühimik paneeli all on kõige laiem selle allmäel oleval postil, ning aken hoiatab, kui see tühimik ületab piiri või kui maapind tõuseb läbi paneeli. Väravad 6 feet (1.8 m) ja laiemad saavad kaks tiiba; plaan näitab tiibu avatuna koos nende avanemissuunaga.

## Loend ja väljundid

Iga aed näitab oma pikkust, postid liigi järgi, paneele, väravaid ja astmeid, koos **CSV** loendiga postidest, paneelidest, liistudest, latidest ja väravatest. Plaanil on aia kihid (C-FENC, C-FENC-POST, C-FENC-GATE) PDF-i, DXF-i ja DWG jaoks. IFC-eksport sisaldab postid (IfcMember, post), paneelid (IfcRailing, kasutaja määratud aiapaneel), liistud (IfcMember) ja väravad (IfcDoor, värav), üks süsteem iga aia kohta.

## Assistendilt

`fence_build` teeb aia (punktide või nimetatud joone, kinnistu või aluse järgi; väravad jaama järgi) ja `fence_list` loetleb aiad koos nende loendiga.

## Mida pole tehtud

Algsuurused on tavalised valikud, mitte norm. Teegist pärinevad tüübid kantakse üle ainult nimena. Väravad peavad asuma ühel sirgel lõigul. BimCraft-il pole seda tööriista veel.
