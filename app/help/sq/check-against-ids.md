---
title: Kontrollo eksportin IFC sipas IDS të klientit
summary: Ngarko skedarin .ids që të dha një klient ose autoritet rrugor dhe shiko çdo element të eksportuar që nuk e plotëson atë te Problemet.
keywords: ids, specifikimi i dorëzimit të informacionit, buildingsmart, kërkesa, dorëzim, kontroll, validim, qa, eksporti ifc, ifc 4.3, aks, rrugë, prokurim
from: 183d9a0e
---

## Çfarë do të bësh

Një IDS (Information Delivery Specification, standard i buildingSMART) është lista e asaj që duhet të përmbajë një IFC. Prokurimi publik shpesh dërgon një me punën. CivilCraft e kontrollon IFC që eksporton ky projekt, në versionin IFC që zgjodhe për eksportin, kundrejt tij, dhe liston çdo element që nuk e arrin.

## Hapat

1. Hap projektin tënd.
2. Kliko {{ui:IFC}} në grupin Eksport të shiritit të veglave. Te dialogu, zgjidh versionin IFC që do të dorëzosh.
3. Kliko {{ui:Kontrollo sipas IDS…}}.
4. Kliko {{ui:Ngarko një skedar .ids…}} dhe zgjidh skedarin. Asgjë nuk ngarkohet.
5. Lexo rezultatin: çdo specifikim me {{ui:Kalon}} ose {{ui:Dështon}} dhe sa elemente zbatohet.
6. Hap Problemet ({{key:Ctrl+Shift+M}}) dhe kliko një dështim për të zgjedhur aksin, platformën, tubin, strukturën ose masën e ndërtesës nga erdhi.

## Çfarë duhet të shohësh

- Një paralajmërim për çdo element të eksportuar dhe kërkesë që i mungon, me emrin e specifikimit, atë që kërkon IDS dhe atë që ka eksporti.
- Raporti i kontrollit (te Problemet) fillon me IDS: titullin, versionin, autorin dhe numrat e çdo specifikimi.

## Gjëra të dobishme

- IDS ruhet në skedarin e projektit, kështu që kontrollohet përsëri kur hap projektin. Ngarkimi ose harrimi i tij është një hap që mund ta zhbësh.
- Çdo ndryshim kontrollohet përsëri pak më vonë. Sipërfaqet e mëdha marrin më shumë kohë për t'u shkruar, kështu që kontrolli pret pak më gjatë mes ekzekutimeve.
- Kontrolli përdor të njëjtin skedar që shkruan eksporti {{ui:IFC}}, në versionin e fundit të zgjedhur atje (IFC 4.3 kur nuk ke zgjedhur një).
- Numrat krahasohen në njësi SI: një projekt në këmbë shndërrohet në metra më parë.

- Modelet te IDS lexohen si vlera e plotë. Një `^` në fillim dhe një `$` në fund merren gjithashtu si "e gjithë vlera", siç e kuptojnë shumicën e skedarëve IDS.

## Tjetra

- [Eksporto IFC](topic:ifc)
