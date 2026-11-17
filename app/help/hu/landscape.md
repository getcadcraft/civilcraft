---
title: A Tájépítészeti munkaterület
summary: Ültetési tervek, tereprendezés, burkolatok, falak, lépcsők, öntözés és tájépítészeti lapok ugyanazon a telken, ugyanazokon a felületeken és ugyanabban a fájlban, mint a polgári mérnöki munka.
keywords: tájépítészet, tájépítészeti tervezés, kert, ültetés, növények, fák, tereprendezés, burkolt felület, burkolat, öntözés, locsolórendszer, munkaterület, telektervezés, tájterv
from: eea929d1
---

A Tájépítészeti munkaterület a meglévő CivilCraft telekre teszi a tájtervezési eszközöket: ugyanazok a felmérési pontok, ugyanaz a meglévő terep, ugyanaz a tervezett felület és ugyanaz a projektfájl.

## Megnyitás

Válassza ki: {{ui:Felület}} › {{ui:Továbbiak}} › {{ui:Tájépítészeti munkaterület}}. Az eszköztár ekkor egy **Munkaterület** választót és egy **Tájépítészet** csoportot mutat, a Felület, a Tervezés és a GIS csoport pedig félreáll. A **Munkaterület** alatt a **Civil** lehetőséget választva térhet vissza. A CivilCraft emlékszik arra a munkaterületre, amelyet utoljára ezen a számítógépen használt.

A bal panel tetején három új rész jelenik meg:

- **Növények**: a növénylista, a kereséshez és az elhelyezendő kiválasztásához. Lásd [A növénylista](topic:plant-list).
- **Tereprendezési ellenőrzések**: lejtésanalízis, lefolyásnyilak és vízállás. Lásd [Tereprendezés](topic:landscape-grading).
- **Öntözés**: a következőként elhelyezett fejek és csövek, a vízellátás beállításai. Lásd [Öntözés](topic:irrigation).

## Mi van a Tájépítészet csoportban

| Eszköz | Mit csinál | Témakör |
|---|---|---|
| **{{ui:Növény}}**, **{{ui:Ágy}}**, **{{ui:Sövény}}** | Egyedi növények, ágyások, amelyeket a növények távolságában töltünk ki, sövények egy vonal mentén | [Ültetés](topic:planting) |
| **Tereprendezés** | Emelvények, földtöltések, vápák, tereprendezési területek pontszintekkel és szintvonalakkal, lejtés- és lefolyásellenőrzések | [Tereprendezés](topic:landscape-grading) |
| **{{ui:Burkolt felületek}}** | Burkolat, sétányok, falak, szegélyek, rámpák és lépcsők, amelyek követik a terepet | [Burkolt felületek](topic:hardscape) |
| **{{ui:Területek}}** | Ültetett területek: gyepek, ágyások, rétek és talajtakaró a rétegrendjükkel, a burkolatok körül levágva | [Ültetett területek](topic:planted-areas) |
| **{{ui:Szintek}}** | Talajmódosítók sorrendben, bevágással és feltöltéssel, pontszintek, lejtésnyilak, metszetvonalak | [Talajmódosítók](topic:ground-modifiers), [Metszetek](topic:landscape-sections) |
| **{{ui:Öntözés}}** | Szórófejek, csövek, szelepek, csepegtető vonalak, a betáplálás, a hatókör és a hidraulikai ellenőrzés | [Öntözés](topic:irrigation) |
| **{{ui:Továbbiak}}** | {{ui:Vonalból}} (a vonalrajzhoz kötött objektumok), a {{ui:Növénykimutatás…}}, a {{ui:Növénytábla}}, a {{ui:Munkalapok}}, a {{ui:Növénygrafika}}, a szabad formájú objektumok, a {{ui:Tájépítészeti lapok…}} és a {{ui:Közzétételi készlet (.zip)}}, az IFC-export, a növények mérete és feliratai | [Vonalból készült objektumok](topic:objects-from-lines), [Növényrekordok](topic:plant-records), [Munkalapok](topic:worksheets), [Tájépítészeti lapok](topic:landscape-sheets), [Szabad formájú objektumok](topic:freeform-objects) |

Minden, amit hozzáad, egy visszavonási lépés, a projektfájlban mentődik, és a rajzon a `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` és `L-IRRG-…` nevű rétegeken jelenik meg, így a DXF-, DWG- és PDF-exportok is tartalmazzák.

## Egy felület mindenhez

Az emelvények, földtöltések, vápák, tereprendezési területek, burkolatok és sétányok a **tervezett felületbe** kerülnek, ugyanabba, amelyet a sávok (korridor) és a tereplépcsők (pad) is használnak. A **meglévő terep** soha nem változik. A növények arra a talajra kerülnek, ami alattuk van, így mozognak, ha a tereprendezés változik. A földmunkában a tájépítészeti tereprendezés mindennel együtt számolódik.

:::tip
Ha még nem dolgozott vele, a [Kert tervezése az elejétől a végéig](topic:landscape-walkthrough) végigvezeti a teljes munkaterületen a mintatelken.
:::
